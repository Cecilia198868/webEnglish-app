"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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

type LevelDisplay = {
  badge: string;
  description: string;
  title: string;
};

const learningLinks = [
  { href: "/ai-guided-expression", label: "AI引导表达" },
  { href: "/free-study", label: "自由学习" },
  { href: "/classic-scenes", label: "经典场景口语练习" },
  { href: "/sentence-patterns", label: "100个口语句型练习" },
  { href: "/native-flow", label: "地道语感训练" },
];

const levelDisplayMap: Record<NativeFlowLevelId, LevelDisplay> = {
  everyday: {
    badge: "初级",
    description: "从生活短句开始，建立语感基础",
    title: "日常语感",
  },
  natural: {
    badge: "中级",
    description: "练习更完整的句子，让表达更自然顺滑",
    title: "自然表达",
  },
  native: {
    badge: "高级",
    description: "训练连读、节奏和长句，让英语更像母语者",
    title: "地道语流",
  },
};

const progressColors: Record<NativeFlowLevelId, string> = {
  everyday: "#18a987",
  natural: "#3478f6",
  native: "#7057f5",
};

const chineseFallbacks: Partial<Record<NativeFlowLevelId, Record<number, string>>> = {
  everyday: {
    1: "嘿，你今天过得怎么样？",
    2: "我一整个早上都在忙来忙去，现在终于能喘口气了。",
    3: "最近事情挺忙的，不过我还应付得来。",
    4: "你这周都在忙些什么？",
    5: "我一直在努力平衡工作和在家放松的时间。",
    6: "最近感觉日子过得特别快。",
    7: "我一直在想你，也想知道你那边一切怎么样。",
    8: "生活里有一些好时光，也有一些小挑战，你懂的。",
    9: "我真的很期待周末，这样就能好好充电。",
    10: "你上次提到的那件事后来怎么样了？",
    11: "我一直在努力保持专注，而不是担心所有事情。",
    12: "今天天气很好，让我想坐在外面放松一下。",
    13: "今天就是那种什么事情都比预想更花时间的日子。",
    14: "最近我和一些老朋友联系了一下，感觉真的很好。",
    15: "有时候我只是需要一个没有任何安排的安静夜晚。",
    16: "你现在对这一切感觉怎么样？",
    17: "我最近有点按固定节奏生活，但也愿意尝试一些新东西。",
    18: "我们有一阵子没有聊轻松的话题了。",
    19: "在忙碌的一周里，我很感激这些小小的安静时刻。",
    20: "我们尽量多保持联系吧，因为我很喜欢和你聊天。",
  },
};

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

function getLevelDisplay(level: NativeFlowLevel) {
  return levelDisplayMap[level.id];
}

function getProgressRow(
  rows: NativeFlowProgressRowSnapshot[],
  level: NativeFlowLevel
) {
  return rows.find((row) => row.levelId === level.id) || {
    completed: 0,
    levelId: level.id,
    percent: 0,
    totalSentences: level.totalSentences,
  };
}

function getNextSentenceIdForLevel(
  rows: NativeFlowProgressRowSnapshot[],
  level: NativeFlowLevel
) {
  const row = getProgressRow(rows, level);
  return Math.min(Math.max(row.completed + 1, 1), level.totalSentences);
}

function isReadableChinese(value: string) {
  const text = value.trim();
  if (!text) return false;
  if (/[�€�]/.test(text)) return false;
  if (/(鍦|璇|绋|紝|锛|銆|鐨|浣|瀛|鏃|鎴|鍒)/.test(text)) return false;

  return /[\u4e00-\u9fff]/.test(text);
}

function getChineseSentence(levelId: NativeFlowLevelId, sentence: NativeFlowSentence) {
  if (isReadableChinese(sentence.chinese)) return sentence.chinese.trim();

  return (
    chineseFallbacks[levelId]?.[sentence.id] ||
    "中文理解：先听原声抓住意思，再模仿语调、重音和停顿，把这句话自然说出来。"
  );
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 12v.01M8 8v8M12 5v14M16 8v8M20 12v.01" />
    </svg>
  );
}

function ChevronIcon({ direction = "right" }: { direction?: "right" | "left" | "up" }) {
  return (
    <svg
      className={
        direction === "left"
          ? styles.iconLeft
          : direction === "up"
            ? styles.iconUp
            : undefined
      }
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function LevelIcon({ levelId }: { levelId: NativeFlowLevelId }) {
  if (levelId === "everyday") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 20V9" />
        <path d="M11 10C7 5 4 6 3 6.5c.7 4.2 4 6 8 4.3Z" />
        <path d="M13 10c3.8-5.3 7-4.3 8-3.8-.4 4.1-3.1 6.2-8 4.6Z" />
      </svg>
    );
  }

  if (levelId === "natural") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 15c4-7 10-7 14 0" />
        <path d="M7 15c3.2-4.5 7.8-4.5 10.2 0" />
        <path d="M12 9v10" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 4v16" />
      <path d="M12 4h7l-2 3 2 3h-7" />
      <path d="m4 20 5-8 3 5 3-5 5 8H4Z" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 13h4v7H6a2 2 0 0 1-2-2v-5ZM20 13h-4v7h2a2 2 0 0 0 2-2v-5Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 7a7 7 0 0 1 10 0l1 1" />
      <path d="M18 4v4h-4" />
      <path d="M17 17a7 7 0 0 1-10 0l-1-1" />
      <path d="M6 20v-4h4" />
    </svg>
  );
}

function SlowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 14c4 2 8 1 10-4 1.5 5 4.5 7 9 5" />
      <path d="M8 11a5 5 0 0 1 10 0" />
      <path d="M6 19h12" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 19h16" />
      <path d="M7 16v-5M12 16V7M17 16V9" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 21c-4.2 0-7-2.8-7-6.4 0-2.7 1.7-5.1 4.8-7.5-.2 2.3 1 3.7 2.3 4.3.5-3.3 2.2-5.8 5-7.3-.3 3.2.7 4.9 1.7 6.5.8 1.2 1.2 2.4 1.2 3.9 0 3.7-3 6.5-8 6.5Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4a12 12 0 0 1 0 16" />
      <path d="M12 4a12 12 0 0 0 0 16" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 9a6 6 0 0 1 12 0v4.5l1.5 3H4.5l1.5-3V9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 8 4.5 4L12 6l3.5 6L20 8l-1.4 9H5.4L4 8Z" />
      <path d="M6 20h12" />
    </svg>
  );
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
  const activeLevelDisplay = getLevelDisplay(activeLevel);
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
  const activeProgressRow = getProgressRow(progressRowsForDisplay, activeLevel);
  const progressPercent = Math.max(
    1,
    Math.round((currentSentenceId / Math.max(activeLevel.totalSentences, 1)) * 100)
  );
  const totalCompleted = progressRowsForDisplay.reduce(
    (sum, row) => sum + row.completed,
    0
  );
  const chineseSentence = getChineseSentence(activeLevel.id, activeSentence);

  const applyProgressSnapshot = useCallback((snapshot: NativeFlowProgressSnapshot | null) => {
    if (!snapshot) return;

    setProgressSnapshot({
      continueProgress: snapshot.continueProgress,
      rows: normalizeProgressRowsForDisplay(snapshot, levels),
    });
  }, [levels]);

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

  function repeatAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    syncProgress({
      completed: true,
      levelId: activeLevel.id,
      saveContinue: true,
      sentenceId: currentSentenceId,
      totalSentences: activeLevel.totalSentences,
    });
    audio.currentTime = 0;
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
  }, [applyProgressSnapshot]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, [activeSentence.audioSrc]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>
            <BrandIcon />
          </span>
          <strong>SpeakFlow</strong>
        </Link>
        <nav className={styles.nav} aria-label="主导航">
          <Link href="/">首页</Link>
          <div className={styles.navMenu}>
            <button type="button">
              开始学习
              <ChevronIcon />
            </button>
            <div className={styles.navDropdown}>
              {learningLinks.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/new-expressions">我的表达</Link>
          <Link href="/create-course">创建课程</Link>
          <Link href="/about">关于我们</Link>
          <Link href="/contact">联系我们</Link>
        </nav>
        <div className={styles.topActions}>
          <Link href="/subscription" className={styles.upgrade}>
            <CrownIcon />
            会员版
          </Link>
          <Link href="/notifications" className={styles.iconLink} aria-label="通知">
            <BellIcon />
          </Link>
          <Link href="/account" className={styles.profile}>
            <span>
              <GlobeIcon />
            </span>
            <strong>English Learner</strong>
          </Link>
        </div>
      </header>

      <div className={styles.shell}>
        <section className={styles.hero} aria-labelledby="native-flow-title">
          <span className={styles.heroIcon}>
            <HeadphonesIcon />
          </span>
          <div>
            <p>1800句跟读模仿训练</p>
            <h1 id="native-flow-title">地道语感训练</h1>
            <span>从听到说，培养地道语感</span>
          </div>
          <div className={styles.heroStats}>
            <span>30 天课程</span>
            <span>每日 20 句</span>
            <span>三档训练</span>
          </div>
        </section>

        <aside className={styles.levelRail} aria-label="训练级别">
          <header className={styles.railHeader}>
            <span>训练级别</span>
            <h2>选择语感路线</h2>
          </header>
          <div className={styles.levelList}>
            {levels.map((level) => {
              const display = getLevelDisplay(level);
              const row = getProgressRow(progressRowsForDisplay, level);

              return (
                <button
                  className={styles.levelCard}
                  data-active={level.id === activeLevel.id}
                  data-tone={level.tone}
                  key={level.id}
                  onClick={() =>
                    chooseSentence(
                      level.id,
                      getNextSentenceIdForLevel(progressRowsForDisplay, level)
                    )
                  }
                  type="button"
                >
                  <span className={styles.levelIcon}>
                    <LevelIcon levelId={level.id} />
                  </span>
                  <span className={styles.levelCopy}>
                    <small>{display.badge}</small>
                    <strong>
                      {display.title}
                      <em>{level.englishTitle}</em>
                    </strong>
                    <span>{display.description}</span>
                  </span>
                  <span className={styles.levelProgress}>
                    <b>{row.completed} / {level.totalSentences} 句</b>
                    <i>
                      <span style={{ width: `${row.percent}%` }} />
                    </i>
                  </span>
                </button>
              );
            })}
          </div>
          <section className={styles.railSummary}>
            <ChartIcon />
            <div>
              <strong>各级别学习进度</strong>
              <span>总计完成 {totalCompleted} / 1800 句</span>
            </div>
          </section>
        </aside>

        <section className={styles.studyArea} aria-label="地道语感训练学习区">
          <section className={styles.continueCard}>
            <span className={styles.continueIcon}>
              <RepeatIcon />
            </span>
            <div>
              <span>继续学习</span>
              <strong>
                {activeLevelDisplay.title} / {activeLevel.englishTitle}
              </strong>
              <p>
                上次练到第 {activeProgressRow.completed || currentSentenceId} /{" "}
                {activeLevel.totalSentences} 句
              </p>
            </div>
            <button type="button" onClick={continueLearning}>
              继续学习
              <ChevronIcon />
            </button>
          </section>

          <article className={styles.sentenceCard}>
            <header className={styles.sentenceHeader}>
              <div>
                <span>
                  Day {activeSentence.day} · 第 {activeSentence.daySentence} 句
                </span>
                <h2>
                  {activeLevelDisplay.title} / {activeLevel.englishTitle}
                </h2>
              </div>
              <strong>{progressPercent}%</strong>
            </header>
            <span className={styles.mainProgress}>
              <i style={{ width: `${progressPercent}%` }} />
            </span>
            <section className={styles.englishBox}>
              <span>英文句子</span>
              <p>{activeSentence.english}</p>
            </section>
            <section className={styles.chineseBox}>
              <span>中文句子</span>
              <p>{chineseSentence}</p>
            </section>
          </article>

          <audio
            aria-hidden="true"
            preload="metadata"
            ref={audioRef}
            src={activeSentence.audioSrc}
          />

          <section className={styles.audioControls} aria-label="播放控制">
            <button type="button" onClick={() => playAudio()}>
              <span>
                <PlayIcon />
              </span>
              播放
            </button>
            <button type="button" onClick={() => playAudio(0.75)}>
              <span>
                <SlowIcon />
              </span>
              慢速播放
              <small>0.75x</small>
            </button>
            <button type="button" onClick={repeatAudio}>
              <span>
                <RepeatIcon />
              </span>
              重复
            </button>
          </section>

          <nav className={styles.sentenceNav} aria-label="句子导航">
            <button type="button" onClick={() => goToSentence(previousSentenceId)}>
              <ChevronIcon direction="left" />
              上一句
            </button>
            <button type="button" onClick={() => goToSentence(jumpSentenceId)}>
              跳转
              <small>
                {activeSentence.daySentence} / {activeLevel.dailySentences}
              </small>
              <ChevronIcon direction="up" />
            </button>
            <button type="button" onClick={() => goToSentence(nextSentenceId)}>
              下一句
              <ChevronIcon />
            </button>
          </nav>

          <section className={styles.insightGrid}>
            <article className={styles.progressPanel}>
              <header>
                <span>
                  <ChartIcon />
                </span>
                <h2>各级别学习进度</h2>
              </header>
              <div>
                {levels.map((level) => {
                  const display = getLevelDisplay(level);
                  const row = getProgressRow(progressRowsForDisplay, level);

                  return (
                    <button
                      className={styles.progressRow}
                      data-tone={level.tone}
                      key={level.id}
                      onClick={() =>
                        chooseSentence(
                          level.id,
                          getNextSentenceIdForLevel(progressRowsForDisplay, level)
                        )
                      }
                      style={{ "--flow-color": progressColors[level.id] } as CSSProperties}
                      type="button"
                    >
                      <strong>{display.title}</strong>
                      <span>{level.englishTitle}</span>
                      <em>{row.completed} / {level.totalSentences} 句</em>
                      <i>
                        <b style={{ width: `${row.percent}%` }} />
                      </i>
                    </button>
                  );
                })}
              </div>
            </article>

            <article className={styles.streakPanel}>
              <header>
                <span>
                  <FlameIcon />
                </span>
                <h2>连续学习记录</h2>
              </header>
              <div className={styles.streakNumber}>
                <strong>7</strong>
                <span>天连续学习</span>
              </div>
              <p>今日已练 {activeSentence.daySentence} / {activeLevel.dailySentences} 句</p>
              <div className={styles.streakDots} aria-label="本周学习打卡">
                {["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
                  <span data-done={index < 5} key={day}>
                    {day}
                  </span>
                ))}
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
