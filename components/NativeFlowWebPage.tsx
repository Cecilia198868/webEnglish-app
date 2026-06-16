"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getNativeFlowSentence,
  type NativeFlowLevel,
  type NativeFlowLevelId,
  type NativeFlowProgressRow,
  type NativeFlowSentence,
} from "@/data/nativeFlow/courseData";
import {
  fetchNativeFlowProgress,
  readNativeFlowContinueProgress,
  recordNativeFlowProgress,
  type NativeFlowProgressSnapshot,
  type NativeFlowProgressRowSnapshot,
} from "@/lib/nativeFlowProgress";
import styles from "./NativeFlowWebPage.module.css";

type NavHotspot = {
  href: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: "nav" | "button" | "card" | "control" | "row";
};

type ActionHotspot = Omit<NavHotspot, "href"> & {
  levelId: NativeFlowLevelId;
  sentenceId: number;
};

const PAGE_ART_WIDTH = 1083;
const PAGE_ART_HEIGHT = 1652;
const PAGE_ART_SRC =
  "/image3/%E5%9C%B0%E9%81%93%E8%AF%AD%E6%84%9F.png";

const learningMenuHotspot: Omit<NavHotspot, "href"> = {
  height: 52,
  kind: "nav",
  label: "Start learning menu",
  width: 104,
  x: 318,
  y: 24,
};

const learningLinks = [
  {
    href: "/ai-guided-expression",
    label: "\u0041\u0049\u5f15\u5bfc\u8868\u8fbe",
  },
  { href: "/free-study", label: "\u81ea\u7531\u5b66\u4e60" },
  {
    href: "/classic-scenes",
    label: "\u7ecf\u5178\u573a\u666f\u53e3\u8bed\u7ec3\u4e60",
  },
  {
    href: "/sentence-patterns",
    label: "\u0031\u0030\u0030\u4e2a\u53e3\u8bed\u53e5\u578b\u7ec3\u4e60",
  },
  {
    href: "/native-flow",
    label: "\u5730\u9053\u8bed\u611f\u7ec3\u4e60",
  },
];

const navHotspots: NavHotspot[] = [
  { href: "/", label: "SpeakFlow home", x: 38, y: 22, width: 175, height: 54, kind: "nav" },
  { href: "/", label: "Home", x: 252, y: 22, width: 56, height: 54, kind: "nav" },
  { href: "/new-expressions", label: "My expressions", x: 431, y: 22, width: 80, height: 54, kind: "nav" },
  { href: "/create-course", label: "Create course", x: 523, y: 22, width: 82, height: 54, kind: "nav" },
  { href: "/menu?panel=about", label: "About", x: 612, y: 22, width: 72, height: 54, kind: "nav" },
  { href: "/menu?panel=help", label: "Contact", x: 704, y: 22, width: 88, height: 54, kind: "nav" },
  { href: "/account", label: "Upgrade", x: 811, y: 20, width: 83, height: 58, kind: "nav" },
  { href: "/notifications", label: "Notifications", x: 900, y: 20, width: 42, height: 58, kind: "nav" },
  { href: "/languages", label: "Language", x: 948, y: 20, width: 117, height: 58, kind: "nav" },
];

const levelCardPositions: Record<
  NativeFlowLevelId,
  Pick<NavHotspot, "x" | "y" | "width" | "height">
> = {
  everyday: { height: 124, width: 354, x: 54, y: 534 },
  natural: { height: 124, width: 354, x: 54, y: 668 },
  native: { height: 124, width: 354, x: 54, y: 802 },
};

const progressRowPositions: Record<
  NativeFlowLevelId,
  Pick<NavHotspot, "x" | "y" | "width" | "height">
> = {
  everyday: { height: 62, width: 630, x: 234, y: 1264 },
  natural: { height: 62, width: 630, x: 234, y: 1343 },
  native: { height: 62, width: 630, x: 234, y: 1422 },
};

const progressColors: Record<NativeFlowLevelId, string> = {
  everyday: "#20bfae",
  natural: "#3e7bf4",
  native: "#7657f4",
};

function hotspotStyle(
  hotspot: Pick<NavHotspot, "x" | "y" | "width" | "height">
): CSSProperties {
  return {
    height: `${(hotspot.height / PAGE_ART_HEIGHT) * 100}%`,
    left: `${(hotspot.x / PAGE_ART_WIDTH) * 100}%`,
    top: `${(hotspot.y / PAGE_ART_HEIGHT) * 100}%`,
    width: `${(hotspot.width / PAGE_ART_WIDTH) * 100}%`,
  };
}

function createProgressSnapshotFromRows(
  rows: NativeFlowProgressRow[],
  levels: NativeFlowLevel[]
): NativeFlowProgressSnapshot {
  return {
    continueProgress: null,
    rows: levels.map((level) => {
      const row = rows.find((item) => item.levelId === level.id);
      const completed = Math.min(
        Math.max(Math.floor(row?.completed || 0), 0),
        level.totalSentences
      );

      return {
        completed,
        levelId: level.id,
        percent: Math.round((completed / Math.max(level.totalSentences, 1)) * 100),
        totalSentences: level.totalSentences,
      };
    }),
  };
}

function normalizeProgressRowsForDisplay(
  snapshot: NativeFlowProgressSnapshot,
  levels: NativeFlowLevel[]
): NativeFlowProgressRowSnapshot[] {
  return levels.map((level) => {
    const row = snapshot.rows.find((item) => item.levelId === level.id);
    const completed = Math.min(
      Math.max(Math.floor(row?.completed || 0), 0),
      level.totalSentences
    );

    return {
      completed,
      levelId: level.id,
      percent: Math.round((completed / Math.max(level.totalSentences, 1)) * 100),
      totalSentences: level.totalSentences,
    };
  });
}

export function NativeFlowWebPage({
  initialLevel,
  initialSentence,
  levels,
  progressRows,
}: {
  initialLevel: NativeFlowLevel;
  initialSentence: NativeFlowSentence;
  levels: NativeFlowLevel[];
  progressRows: NativeFlowProgressRow[];
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progressSnapshot, setProgressSnapshot] = useState(() =>
    createProgressSnapshotFromRows(progressRows, levels)
  );
  const [activeTarget, setActiveTarget] = useState<{
    levelId: NativeFlowLevelId;
    sentenceId: number;
  }>({
    levelId: initialLevel.id,
    sentenceId: initialSentence.id,
  });
  const activeResult = getNativeFlowSentence(
    activeTarget.levelId,
    activeTarget.sentenceId
  ) || {
    level: initialLevel,
    sentence: initialSentence,
  };
  const activeLevel = activeResult.level;
  const activeSentence = activeResult.sentence;
  const currentSentenceId = activeSentence.id;
  const previousSentenceId = Math.max(1, currentSentenceId - 1);
  const nextSentenceId = Math.min(activeLevel.totalSentences, currentSentenceId + 1);
  const jumpSentenceId = Math.min(
    activeLevel.totalSentences,
    activeSentence.day * activeLevel.dailySentences
  );
  const progressRowsForDisplay = normalizeProgressRowsForDisplay(
    progressSnapshot,
    levels
  );
  const levelHotspots: ActionHotspot[] = levels
    .flatMap((level) => {
      const position = levelCardPositions[level.id];
      if (!position) return [];

      return [{
        ...position,
        kind: "card",
        label: `${level.englishTitle} training`,
        levelId: level.id,
        sentenceId: 1,
      }];
    });
  const progressHotspots: ActionHotspot[] = progressRowsForDisplay
    .flatMap((row) => {
      const position = progressRowPositions[row.levelId];
      const level = levels.find((item) => item.id === row.levelId);
      if (!position) return [];

      return [{
        ...position,
        kind: "row",
        label: `Native flow progress ${row.percent}%`,
        levelId: row.levelId,
        sentenceId: Math.min(
          Math.max(row.completed + 1, 1),
          level?.totalSentences || 600
        ),
      }];
    });

  function applyProgressSnapshot(snapshot: NativeFlowProgressSnapshot | null) {
    if (!snapshot) return;

    setProgressSnapshot({
      continueProgress: snapshot.continueProgress,
      rows: normalizeProgressRowsForDisplay(snapshot, levels),
    });
  }

  function applyOptimisticProgress({
    completed,
    levelId,
    saveContinue = true,
    sentenceId,
  }: {
    completed?: boolean;
    levelId: NativeFlowLevelId;
    saveContinue?: boolean;
    sentenceId: number;
  }) {
    setProgressSnapshot((current) => {
      const nextContinueProgress = saveContinue
        ? {
            levelId,
            sentenceId,
            updatedAt: new Date().toISOString(),
          }
        : current.continueProgress;

      return {
        continueProgress: nextContinueProgress,
        rows: current.rows.map((row) => {
          if (row.levelId !== levelId || !completed) return row;

          const nextCompleted = Math.min(
            Math.max(row.completed, sentenceId),
            row.totalSentences
          );

          return {
            ...row,
            completed: nextCompleted,
            percent: Math.round(
              (nextCompleted / Math.max(row.totalSentences, 1)) * 100
            ),
          };
        }),
      };
    });
  }

  function syncProgress({
    completed,
    levelId,
    saveContinue = true,
    sentenceId,
    totalSentences,
  }: {
    completed?: boolean;
    levelId: NativeFlowLevelId;
    saveContinue?: boolean;
    sentenceId: number;
    totalSentences: number;
  }) {
    if (saveContinue || completed) {
      applyOptimisticProgress({ completed, levelId, saveContinue, sentenceId });
    }

    void recordNativeFlowProgress({
      completed,
      levelId,
      saveContinue,
      sentenceId,
      totalSentences,
    }).then(applyProgressSnapshot);
  }

  function chooseSentence(levelId: NativeFlowLevelId, sentenceId: number) {
    const result = getNativeFlowSentence(levelId, sentenceId);
    if (!result) return;

    setActiveTarget({
      levelId: result.level.id,
      sentenceId: result.sentence.id,
    });
    syncProgress({
      levelId: result.level.id,
      saveContinue: true,
      sentenceId: result.sentence.id,
      totalSentences: result.level.totalSentences,
    });
  }

  function continueLearning() {
    const serverProgress = progressSnapshot.continueProgress;
    const serverLevel = serverProgress
      ? levels.find((level) => level.id === serverProgress.levelId)
      : null;

    if (serverProgress && serverLevel) {
      chooseSentence(
        serverLevel.id,
        Math.min(serverProgress.sentenceId, serverLevel.totalSentences)
      );
      return;
    }

    const savedProgress = readNativeFlowContinueProgress();
    const savedLevel = savedProgress
      ? levels.find((level) => level.id === savedProgress.levelId)
      : null;

    if (savedProgress && savedLevel) {
      chooseSentence(
        savedLevel.id,
        Math.min(savedProgress.sentenceId, savedLevel.totalSentences)
      );
      return;
    }

    chooseSentence(activeLevel.id, currentSentenceId);
  }

  function playAudio(playbackRate = 1) {
    const audio = audioRef.current;
    if (!audio) return;

    syncProgress({
      completed: true,
      levelId: activeLevel.id,
      saveContinue: true,
      sentenceId: currentSentenceId,
      totalSentences: activeLevel.totalSentences,
    });
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = playbackRate;
    void audio.play().catch(() => undefined);
  }

  function goToSentence(sentenceId: number) {
    syncProgress({
      completed: true,
      levelId: activeLevel.id,
      saveContinue: false,
      sentenceId: currentSentenceId,
      totalSentences: activeLevel.totalSentences,
    });
    chooseSentence(activeLevel.id, sentenceId);
  }

  useEffect(() => {
    let isCurrent = true;

    void fetchNativeFlowProgress().then((snapshot) => {
      if (!isCurrent) return;
      applyProgressSnapshot(snapshot);
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, [activeSentence.audioSrc]);

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>SpeakFlow native flow training</h1>
      <div className={styles.artboard} aria-label="Native flow training page">
        <Image
          alt="\u5730\u9053\u8bed\u611f\u8bad\u7ec3\u5b66\u4e60\u754c\u9762"
          className={styles.pageArt}
          height={PAGE_ART_HEIGHT}
          priority
          src={PAGE_ART_SRC}
          unoptimized
          width={PAGE_ART_WIDTH}
        />
        <audio aria-hidden="true" preload="metadata" ref={audioRef} src={activeSentence.audioSrc} />

        <nav className={styles.hotspots} aria-label="Native flow navigation">
          <div className={styles.learningMenu} style={hotspotStyle(learningMenuHotspot)}>
            <button
              type="button"
              aria-haspopup="menu"
              className={styles.learningTrigger}
            >
              <span className={styles.srOnly}>{learningMenuHotspot.label}</span>
            </button>
            <div className={styles.learningDropdown} role="menu">
              {learningLinks.map((item) => (
                <Link
                  className={styles.learningDropdownItem}
                  href={item.href}
                  key={item.href}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {navHotspots.map((hotspot) => (
            <Link
              aria-label={hotspot.label}
              className={styles.hotspot}
              data-kind={hotspot.kind}
              href={hotspot.href}
              key={`${hotspot.href}-${hotspot.label}-${hotspot.x}-${hotspot.y}`}
              style={hotspotStyle(hotspot)}
            >
              <span className={styles.srOnly}>{hotspot.label}</span>
            </Link>
          ))}

          {[...levelHotspots, ...progressHotspots].map((hotspot) => (
            <button
              type="button"
              aria-label={hotspot.label}
              className={styles.hotspot}
              data-kind={hotspot.kind}
              key={`${hotspot.levelId}-${hotspot.sentenceId}-${hotspot.label}-${hotspot.x}-${hotspot.y}`}
              onClick={() => chooseSentence(hotspot.levelId, hotspot.sentenceId)}
              style={hotspotStyle(hotspot)}
            >
              <span className={styles.srOnly}>{hotspot.label}</span>
            </button>
          ))}

          <button
            type="button"
            aria-label="\u7ee7\u7eed\u5b66\u4e60\u5730\u9053\u8bed\u611f\u8bad\u7ec3"
            className={`${styles.hotspot} ${styles.continueHotspot}`}
            data-kind="button"
            onClick={continueLearning}
          >
            <span className={styles.srOnly}>Continue native flow training</span>
          </button>

          <button
            type="button"
            aria-label="\u64ad\u653e\u5f53\u524d\u82f1\u6587\u53e5\u5b50"
            className={`${styles.audioAction} ${styles.playAction}`}
            onClick={() => playAudio()}
          />
          <button
            type="button"
            aria-label="\u0030\u002e\u0037\u0035\u500d\u901f\u6162\u901f\u64ad\u653e"
            className={`${styles.audioAction} ${styles.slowAction}`}
            onClick={() => playAudio(0.75)}
          />
          <button
            type="button"
            aria-label="\u91cd\u590d\u64ad\u653e\u5f53\u524d\u53e5\u5b50"
            className={`${styles.audioAction} ${styles.repeatAction}`}
            onClick={() => playAudio()}
          />

          <button
            type="button"
            aria-label="\u4e0a\u4e00\u53e5"
            className={`${styles.hotspot} ${styles.previousAction}`}
            data-kind="control"
            onClick={() => goToSentence(previousSentenceId)}
          />
          <button
            type="button"
            aria-label="\u8df3\u8f6c\u5230\u5f53\u5929\u8bad\u7ec3"
            className={`${styles.hotspot} ${styles.jumpAction}`}
            data-kind="control"
            onClick={() => goToSentence(jumpSentenceId)}
          />
          <button
            type="button"
            aria-label="\u4e0b\u4e00\u53e5"
            className={`${styles.hotspot} ${styles.nextAction}`}
            data-kind="control"
            onClick={() => goToSentence(nextSentenceId)}
          />
          <Link
            aria-label="\u67e5\u770b\u5168\u90e8\u5b66\u4e60\u8bb0\u5f55"
            className={`${styles.hotspot} ${styles.recordsAction}`}
            data-kind="control"
            href="/native-flow/records"
          />
        </nav>

        <section className={styles.sentenceLayer} aria-label="\u5f53\u524d\u5730\u9053\u8bed\u611f\u53e5\u5b50">
          <p className={styles.englishSentence}>{activeSentence.english}</p>
          {activeSentence.chinese ? (
            <p className={styles.chineseSentence}>{activeSentence.chinese}</p>
          ) : null}
          <span className={styles.jumpCopy}>
            {activeSentence.daySentence} / {activeLevel.dailySentences}
          </span>
        </section>

        <section className={styles.progressLayer} aria-label="\u5730\u9053\u8bed\u611f\u771f\u5b9e\u5b66\u4e60\u8fdb\u5ea6">
          {progressRowsForDisplay.map((row) => (
            <div
              className={styles.progressOverlayRow}
              data-level={row.levelId}
              key={row.levelId}
              style={{ "--progress-color": progressColors[row.levelId] } as CSSProperties}
            >
              <span className={styles.progressCount}>
                {row.completed} / {row.totalSentences} \u53e5
              </span>
              <span className={styles.progressPercent}>{row.percent}%</span>
              <span className={styles.progressTrack}>
                <i style={{ width: `${row.percent}%` }} />
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
