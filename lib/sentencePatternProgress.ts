export const SENTENCE_PATTERN_CONTINUE_STORAGE_KEY =
  "speakflow:sentence-patterns:continue-progress";

export type SentencePatternContinueProgress = {
  href: string;
  levelId: string;
  levelTitle: string;
  patternId: number;
  patternText: string;
  practiceCount: number;
  practiceId: number;
  sectionTitle: string;
  updatedAt: string;
};

type SentencePatternContinueProgressInput = {
  levelId: string;
  levelTitle: string;
  patternId: number;
  patternText: string;
  practiceCount: number;
  practiceId: number;
  sectionTitle: string;
};

export type SentencePatternProgressSnapshot = {
  completedPracticeCount: number;
  continueProgress: SentencePatternContinueProgress | null;
  currentPracticeId: number;
  percent: number;
  practiceCount: number;
};

export type SentencePatternProgressRequest = SentencePatternContinueProgressInput & {
  completed?: boolean;
};

function clampPositiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : fallback;
}

function cleanText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function createSentencePatternProgressHref(
  levelId: string,
  patternId: number,
  practiceId: number
) {
  return `/sentence-patterns/${levelId}/${patternId}?practice=${practiceId}`;
}

export function readSentencePatternContinueProgress() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(
      SENTENCE_PATTERN_CONTINUE_STORAGE_KEY
    );
    const parsed = raw
      ? (JSON.parse(raw) as Partial<SentencePatternContinueProgress>)
      : null;

    if (!parsed) return null;

    const levelId = cleanText(parsed.levelId, "");
    const patternId = clampPositiveInteger(parsed.patternId, 0);
    const practiceId = clampPositiveInteger(parsed.practiceId, 1);
    const practiceCount = clampPositiveInteger(parsed.practiceCount, 20);

    if (!levelId || patternId < 1) return null;

    const safePracticeId = Math.min(practiceId, practiceCount);

    return {
      href: createSentencePatternProgressHref(
        levelId,
        patternId,
        safePracticeId
      ),
      levelId,
      levelTitle: cleanText(
        parsed.levelTitle,
        "\u0031\u0030\u0030\u4e2a\u53e3\u8bed\u53e5\u578b"
      ),
      patternId,
      patternText: cleanText(parsed.patternText, ""),
      practiceCount,
      practiceId: safePracticeId,
      sectionTitle: cleanText(parsed.sectionTitle, ""),
      updatedAt: cleanText(parsed.updatedAt, new Date().toISOString()),
    } satisfies SentencePatternContinueProgress;
  } catch {
    return null;
  }
}

export function writeSentencePatternContinueProgress(
  progress: SentencePatternContinueProgressInput
) {
  if (typeof window === "undefined") return;

  try {
    const practiceCount = clampPositiveInteger(progress.practiceCount, 20);
    const practiceId = Math.min(
      clampPositiveInteger(progress.practiceId, 1),
      practiceCount
    );
    const patternId = clampPositiveInteger(progress.patternId, 1);
    const levelId = progress.levelId.trim();

    if (!levelId || !patternId) return;

    const payload: SentencePatternContinueProgress = {
      href: createSentencePatternProgressHref(levelId, patternId, practiceId),
      levelId,
      levelTitle: progress.levelTitle.trim(),
      patternId,
      patternText: progress.patternText.trim(),
      practiceCount,
      practiceId,
      sectionTitle: progress.sectionTitle.trim(),
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      SENTENCE_PATTERN_CONTINUE_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch {}
}

export function recordSentencePatternProgress(
  progress: SentencePatternProgressRequest
) {
  writeSentencePatternContinueProgress(progress);

  if (typeof window === "undefined") return;

  void fetch("/api/sentence-patterns/progress", {
    body: JSON.stringify(progress),
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).catch(() => {
    // Local progress is already saved; the backend can catch up later.
  });
}
