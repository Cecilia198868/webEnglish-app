import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const DAILY_SENTENCES = 20;
const COURSE_ROOT = path.join(process.cwd(), "public", "images 2", "地道语感训练");
const OUTPUT_ROOT = path.join(process.cwd(), "public", "native-flow-audio");
const META_FILE = path.join(process.cwd(), ".data", "native-flow-audio-splits.json");
const COURSE_DATA_FILE = path.join(process.cwd(), "data", "nativeFlow", "courseData.ts");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8",
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${path.basename(command)} failed:\n${result.stderr || result.stdout}`);
  }
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

async function readSentencesByLevel() {
  const courseSource = await fs.readFile(COURSE_DATA_FILE, "utf8");
  const match = courseSource.match(
    /const nativeFlowSentencesByLevel:[\s\S]*?= (\{[\s\S]*?\});\n\nexport const nativeFlowProgressRows/,
  );
  if (!match) {
    throw new Error("Could not read nativeFlowSentencesByLevel from courseData.ts");
  }
  return JSON.parse(match[1]);
}

function getDuration(filePath) {
  const output = run(ffprobeStatic.path, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  const duration = Number.parseFloat(output.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Could not read duration for ${filePath}`);
  }
  return duration;
}

function detectSilences(filePath) {
  const output = run(ffmpegPath, [
    "-hide_banner",
    "-i",
    filePath,
    "-af",
    "silencedetect=noise=-22dB:d=0.12",
    "-f",
    "null",
    "-",
  ]);
  return [...output.matchAll(/silence_start: ([0-9.]+)[\s\S]*?silence_end: ([0-9.]+) \| silence_duration: ([0-9.]+)/g)]
    .map((match) => ({
      duration: Number(match[3]),
      end: Number(match[2]),
      start: Number(match[1]),
    }))
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end));
}

function mergeSilences(silences) {
  const merged = [];
  for (const silence of silences.sort((a, b) => a.start - b.start)) {
    const previous = merged.at(-1);
    if (previous && silence.start - previous.end <= 0.08) {
      previous.end = Math.max(previous.end, silence.end);
      previous.duration = previous.end - previous.start;
      continue;
    }
    merged.push({ ...silence });
  }
  return merged;
}

function createCandidates(silences, totalDuration, sentences) {
  const realCandidates = mergeSilences(silences)
    .filter((silence) => silence.duration >= 0.18)
    .map((silence) => ({
      duration: silence.duration,
      time: (silence.start + silence.end) / 2,
      virtual: false,
    }))
    .filter((candidate) => candidate.time > 0.35 && candidate.time < totalDuration - 0.35);

  const unique = [];
  for (const candidate of realCandidates) {
    const previous = unique.at(-1);
    if (previous && candidate.time - previous.time <= 0.18) {
      if (candidate.duration > previous.duration) {
        previous.duration = candidate.duration;
        previous.time = candidate.time;
      }
      continue;
    }
    unique.push(candidate);
  }

  const expectedDurations = estimateDurations(sentences, totalDuration);
  let cumulative = 0;
  const virtualCandidates = expectedDurations.slice(0, -1).map((duration) => {
    cumulative += duration;
    return { duration: 0, time: cumulative, virtual: true };
  });

  return [...unique, ...virtualCandidates]
    .sort((a, b) => a.time - b.time)
    .filter((candidate, index, candidates) => {
      const previous = candidates[index - 1];
      return !previous || candidate.time - previous.time > 0.08 || (!candidate.virtual && previous.virtual);
    });
}

function estimateDurations(sentences, totalDuration) {
  const weights = sentences.map((sentence) => {
    const words = sentence.english.split(/\s+/).filter(Boolean).length;
    const punctuation = (sentence.english.match(/[,.!?;:]/g) || []).length;
    return Math.max(1, words + punctuation * 0.35);
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => (weight / totalWeight) * totalDuration);
}

function chooseCuts(candidates, totalDuration, sentences) {
  const expected = estimateDurations(sentences, totalDuration);
  const expectedBoundaries = [];
  expected.reduce((sum, duration, index) => {
    const next = sum + duration;
    if (index < expected.length - 1) expectedBoundaries.push(next);
    return next;
  }, 0);

  const points = [
    { duration: 0, time: 0, virtual: false },
    ...candidates,
    { duration: 0, time: totalDuration, virtual: false },
  ];
  const lastIndex = points.length - 1;
  const segmentCount = sentences.length;
  const dp = Array.from({ length: segmentCount + 1 }, () =>
    Array.from({ length: points.length }, () => ({ cost: Number.POSITIVE_INFINITY, prev: -1 })),
  );
  dp[0][0] = { cost: 0, prev: -1 };

  for (let segmentIndex = 1; segmentIndex <= segmentCount; segmentIndex += 1) {
    const mustEndAtLast = segmentIndex === segmentCount;
    const startPoint = segmentIndex;
    const endPoint = mustEndAtLast ? lastIndex : lastIndex - 1;

    for (let pointIndex = startPoint; pointIndex <= endPoint; pointIndex += 1) {
      if (mustEndAtLast && pointIndex !== lastIndex) continue;
      if (!mustEndAtLast && pointIndex === lastIndex) continue;

      for (let previousIndex = segmentIndex - 1; previousIndex < pointIndex; previousIndex += 1) {
        const previous = dp[segmentIndex - 1][previousIndex];
        if (!Number.isFinite(previous.cost)) continue;

        const duration = points[pointIndex].time - points[previousIndex].time;
        if (duration <= 0.35) continue;

        const expectedDuration = expected[segmentIndex - 1];
        const durationRatio = Math.log(duration / expectedDuration);
        let cost = previous.cost + durationRatio * durationRatio * 10;

        if (!mustEndAtLast) {
          const target = expectedBoundaries[segmentIndex - 1];
          const targetDistance = Math.abs(points[pointIndex].time - target) / totalDuration;
          const silenceBonus = points[pointIndex].virtual
            ? 30
            : Math.max(0, 0.62 - points[pointIndex].duration) * 1.6;
          cost += targetDistance * 3 + silenceBonus;
        }

        if (cost < dp[segmentIndex][pointIndex].cost) {
          dp[segmentIndex][pointIndex] = { cost, prev: previousIndex };
        }
      }
    }
  }

  if (!Number.isFinite(dp[segmentCount][lastIndex].cost)) {
    throw new Error("Could not choose audio cuts");
  }

  const indexes = [];
  let cursor = lastIndex;
  for (let segmentIndex = segmentCount; segmentIndex > 0; segmentIndex -= 1) {
    indexes.push(cursor);
    cursor = dp[segmentIndex][cursor].prev;
  }
  indexes.reverse();
  const boundaries = [0, ...indexes.slice(0, -1).map((index) => points[index].time), totalDuration];

  return {
    boundaries,
    cost: dp[segmentCount][lastIndex].cost,
    virtualCuts: indexes.slice(0, -1).filter((index) => points[index].virtual).length,
  };
}

function sourcePathFor(sentence) {
  return path.join(COURSE_ROOT, ...sentence.sourceAudio.split("/"));
}

function clipPathFor(levelId, sentenceId) {
  return path.join(OUTPUT_ROOT, levelId, `${String(sentenceId).padStart(3, "0")}.mp3`);
}

function clipUrlFor(levelId, sentenceId) {
  return `/native-flow-audio/${levelId}/${String(sentenceId).padStart(3, "0")}.mp3`;
}

async function splitClip({ end, source, start, target }) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  if (!force) {
    try {
      const stat = await fs.stat(target);
      if (stat.size > 1000) return;
    } catch {
      // Generate missing clips.
    }
  }

  const duration = Math.max(0.2, end - start);
  run(ffmpegPath, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    start.toFixed(3),
    "-i",
    source,
    "-t",
    duration.toFixed(3),
    "-vn",
    "-codec:a",
    "libmp3lame",
    "-q:a",
    "4",
    target,
  ]);
}

const sentencesByLevel = await readSentencesByLevel();
const metadata = {
  generatedAt: new Date().toISOString(),
  outputRoot: path.relative(process.cwd(), OUTPUT_ROOT),
  sources: [],
};

for (const [levelId, sentences] of Object.entries(sentencesByLevel)) {
  const days = new Map();
  for (const sentence of sentences) {
    if (!days.has(sentence.day)) days.set(sentence.day, []);
    days.get(sentence.day).push(sentence);
  }

  for (const [day, daySentences] of [...days.entries()].sort((a, b) => a[0] - b[0])) {
    if (daySentences.length !== DAILY_SENTENCES) {
      throw new Error(`${levelId} day ${day} has ${daySentences.length} sentences`);
    }

    const source = sourcePathFor(daySentences[0]);
    const totalDuration = getDuration(source);
    const silences = detectSilences(source);
    const candidates = createCandidates(silences, totalDuration, daySentences);
    const plan = chooseCuts(candidates, totalDuration, daySentences);
    const sourceMeta = {
      candidateCount: candidates.length,
      cost: Number(plan.cost.toFixed(4)),
      day,
      levelId,
      source: path.relative(process.cwd(), source),
      totalDuration: Number(totalDuration.toFixed(3)),
      virtualCuts: plan.virtualCuts,
    };
    metadata.sources.push(sourceMeta);

    console.log(
      `${dryRun ? "Checked" : "Splitting"} ${levelId} day ${day}: ${daySentences.length} clips, ${sourceMeta.candidateCount} candidates, ${sourceMeta.virtualCuts} virtual cuts`,
    );

    if (dryRun) continue;

    for (let index = 0; index < daySentences.length; index += 1) {
      const sentence = daySentences[index];
      const start = Math.max(0, plan.boundaries[index] - 0.02);
      const end = Math.min(totalDuration, plan.boundaries[index + 1] + 0.02);
      await splitClip({
        end,
        source,
        start,
        target: clipPathFor(levelId, sentence.id),
      });
      sentence.audioSrc = clipUrlFor(levelId, sentence.id);
    }
  }
}

await fs.mkdir(path.dirname(META_FILE), { recursive: true });
await fs.writeFile(META_FILE, JSON.stringify(metadata, null, 2), "utf8");

const totalClips = Object.values(sentencesByLevel).reduce((sum, rows) => sum + rows.length, 0);
console.log(`${dryRun ? "Planned" : "Generated"} ${totalClips} native-flow sentence clips.`);
