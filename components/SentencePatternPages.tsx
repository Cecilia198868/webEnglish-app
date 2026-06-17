"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { playSpeakFlowTts, stopSpeakFlowTts } from "@/lib/speakFlowTtsClient";
import {
  SPEAKFLOW_DEFAULT_VOICE_ID,
  SPEAKFLOW_VOICES,
} from "@/lib/voiceSettings";
import { recordSentencePatternProgress } from "@/lib/sentencePatternProgress";
import { sentencePatternLevels } from "@/data/sentencePatterns";
import type {
  SentencePatternLevel,
  SentencePatternPractice,
  SentencePatternSection,
  SentencePatternTone,
} from "@/data/sentencePatterns";
import styles from "./SentencePatternPages.module.css";

type StudyProps = {
  level: SentencePatternLevel;
  patternId: number;
  section: SentencePatternSection;
};

type PatternToneStyle = CSSProperties & {
  "--pattern-accent": string;
  "--pattern-accent-dark": string;
  "--pattern-soft": string;
  "--pattern-soft-strong": string;
  "--pattern-glow": string;
};

type SentencePatternProgressSnapshot = {
  challenge?: {
    completed?: number;
    goal?: number;
    percent?: number;
  };
  dailyGoal?: number;
  streakDays?: number;
  todayCompleted?: number;
  totalCompleted?: number;
};

type SentencePatternProgressApiPayload = SentencePatternProgressSnapshot & {
  data?: SentencePatternProgressSnapshot;
  progress?: SentencePatternProgressSnapshot;
  snapshot?: SentencePatternProgressSnapshot;
};

const FINISH_AFTER_SILENCE_MS = 2000;
const RESTART_AFTER_NO_SPEECH_MS = 240;

function sessionKey(levelId: string, patternId: number, practiceId: number) {
  return `sentence-pattern:${levelId}:${patternId}:${practiceId}:transcript`;
}

function readSavedTranscript(
  levelId: string,
  patternId: number,
  practiceId: number
) {
  if (typeof window === "undefined") return "";

  try {
    return (
      window.sessionStorage
        .getItem(sessionKey(levelId, patternId, practiceId))
        ?.trim() || ""
    );
  } catch {
    return "";
  }
}

function getToneStyle(tone: SentencePatternTone): PatternToneStyle {
  const toneMap = {
    green: {
      "--pattern-accent": "#25bd80",
      "--pattern-accent-dark": "#0c9a69",
      "--pattern-soft": "#e9faf4",
      "--pattern-soft-strong": "#d8f6eb",
      "--pattern-glow": "rgba(37, 189, 128, 0.16)",
    },
    orange: {
      "--pattern-accent": "#ff8a1f",
      "--pattern-accent-dark": "#ec5f12",
      "--pattern-soft": "#fff3e8",
      "--pattern-soft-strong": "#ffe7d1",
      "--pattern-glow": "rgba(255, 138, 31, 0.18)",
    },
    purple: {
      "--pattern-accent": "#7657ff",
      "--pattern-accent-dark": "#6042e8",
      "--pattern-soft": "#f0ebff",
      "--pattern-soft-strong": "#e7ddff",
      "--pattern-glow": "rgba(118, 87, 255, 0.18)",
    },
  } satisfies Record<SentencePatternTone, PatternToneStyle>;

  return toneMap[tone];
}

function PatternIcon({
  className = "",
  icon,
}: {
  className?: string;
  icon: SentencePatternLevel["icon"];
}) {
  if (icon === "rocket") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M42 7c-9.6 2.2-17.4 9.2-23.1 21L8 28l8.2 5.7L14 47l13.1-3.1L33 56l.1-12.9C45 37.4 52 29.6 54 20l3-13H42Z" />
        <path d="M39 18a5 5 0 1 0 10 0 5 5 0 0 0-10 0Z" />
        <path d="M15 45c-4 1.2-6.8 4-8.6 8.6 4.6-1.8 7.4-4.6 8.6-8.6Z" />
      </svg>
    );
  }

  if (icon === "trophy") {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M19 10h26v8c0 11.5-5.5 20-13 20s-13-8.5-13-20v-8Z" />
        <path d="M19 15H8v5c0 7.5 5.5 13 13 13M45 15h11v5c0 7.5-5.5 13-13 13M32 38v9M22 54h20M27 47h10" />
        <path d="m32 16 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6-4.3-4.2 6-.9L32 16Z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M31 50c0-17 1-30 20-37 1 18-8 30-20 37Z" />
      <path d="M32 50C30 32 21 23 9 22c-1 16 9 25 23 28ZM32 50V28" />
    </svg>
  );
}

function ChatBubbleArt({ levelId }: { levelId: SentencePatternLevel["id"] }) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={styles.chatArt}
      draggable={false}
      height={275}
      sizes="160px"
      src={`/images/sentence-patterns/overview-${levelId}-art.png`}
      unoptimized
      width={298}
    />
  );
}

function ChevronIcon({ direction = "right" }: { direction?: "down" | "left" | "right" | "up" }) {
  const path =
    direction === "down"
      ? "m8 10 4 4 4-4"
      : direction === "left"
        ? "m15 5-7 7 7 7"
      : direction === "up"
        ? "m8 14 4-4 4 4"
        : "m10 7 5 5-5 5";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function SentencePatternBottomHomeIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sentence-pattern-bottom-home" x1="9" x2="39" y1="39" y2="8">
          <stop offset="0" stopColor="#5e79ff" />
          <stop offset="1" stopColor="#914cff" />
        </linearGradient>
      </defs>
      <path
        d="M8 21.6 24 8l16 13.6v16.2a4 4 0 0 1-4 4h-7.7V29.3h-8.6v12.5H12a4 4 0 0 1-4-4V21.6Z"
        fill="url(#sentence-pattern-bottom-home)"
      />
    </svg>
  );
}

function SentencePatternBottomProgressIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M12 34V21" />
      <path d="M20 34V12" />
      <path d="M28 34V17" />
      <path d="M36 34V9" />
    </svg>
  );
}

function SentencePatternBottomHelpIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 7.5c-9.4 0-17 6.4-17 14.3 0 4.7 2.7 8.9 6.9 11.5l-1.5 7.2 7.2-4.8c1.4.3 2.9.5 4.4.5 9.4 0 17-6.4 17-14.4S33.4 7.5 24 7.5Z" />
      <path d="M19.2 18.8a5.1 5.1 0 0 1 9.8 2.1c0 3.8-5 4.1-5 7.2" />
      <path d="M24 34.2h.1" />
    </svg>
  );
}

function SentencePatternBottomAccountIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="15.2" r="7.1" />
      <path d="M11.8 40c1.5-8 6-12 12.2-12s10.7 4 12.2 12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function StatIcon({
  type,
}: {
  type:
    | "book"
    | "bulb"
    | "chat"
    | "file"
    | "headphones"
    | "mic"
    | "car"
    | "plusChat"
    | "quote"
    | "speaker"
    | "star"
    | "target"
    | "utensils";
}) {
  if (type === "bulb") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M14 3.5a7.2 7.2 0 0 0-4.1 13.1c1 .7 1.7 1.8 1.7 3.1h4.8c0-1.3.7-2.4 1.7-3.1A7.2 7.2 0 0 0 14 3.5Z" />
        <path d="M11 23h6M12 26h4M5.5 12H3M25 12h-2.5M8 5.8 6.3 4.1M20 5.8l1.7-1.7" />
      </svg>
    );
  }
  if (type === "file") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M8 4h9l5 5v15H8V4Z" />
        <path d="M17 4v6h5M11 15h8M11 19h6" />
      </svg>
    );
  }
  if (type === "star") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="m14 4 3 6 6.7 1-4.8 4.7 1.1 6.6-6-3.2-6 3.2 1.1-6.6L4.3 11 11 10l3-6Z" />
      </svg>
    );
  }
  if (type === "book") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M5 6c4-1.3 7-.7 9 1.5V23c-2-2.2-5-2.8-9-1.5V6ZM14 7.5c2-2.2 5-2.8 9-1.5v15.5c-4-1.3-7-.7-9 1.5V7.5Z" />
      </svg>
    );
  }
  if (type === "mic") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect x="10" y="4" width="8" height="13" rx="4" />
        <path d="M6 15c0 4.4 3.6 7 8 7s8-2.6 8-7M14 22v3M10 25h8" />
      </svg>
    );
  }
  if (type === "headphones") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M5 16v-3a9 9 0 0 1 18 0v3" />
        <path d="M5 16a3 3 0 0 1 3-3h1v9H8a3 3 0 0 1-3-3v-3ZM23 16a3 3 0 0 0-3-3h-1v9h1a3 3 0 0 0 3-3v-3Z" />
      </svg>
    );
  }
  if (type === "utensils") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M8 4v8M4.8 4v7.2A3.2 3.2 0 0 0 8 14.4h0a3.2 3.2 0 0 0 3.2-3.2V4M8 14.5V25" />
        <path d="M19 4c2.2 2 3.4 5 3.4 8.5v.7H19V25" />
      </svg>
    );
  }
  if (type === "car") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="m6 14 2.2-6.2A3 3 0 0 1 11 5.8h6a3 3 0 0 1 2.8 2L22 14" />
        <path d="M5 14h18v8H5v-8ZM8 22v2M20 22v2M8.5 18h.1M19.5 18h.1" />
      </svg>
    );
  }
  if (type === "plusChat") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M5 11c0-4 3.6-7 9-7s9 3 9 7-3.6 7-9 7c-1.2 0-2.4-.2-3.4-.5L6 21v-6.1A6.8 6.8 0 0 1 5 11Z" />
        <path d="M14 8v7M10.5 11.5h7" />
      </svg>
    );
  }
  if (type === "quote") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M11 8c-3.2 1.6-5 4-5 7.2 0 2.7 1.8 4.8 4.2 4.8 2 0 3.5-1.4 3.5-3.4 0-1.9-1.4-3.2-3.3-3.2-.5 0-.9.1-1.3.2.4-1.6 1.5-2.9 3.2-4l-1.3-1.6ZM22 8c-3.2 1.6-5 4-5 7.2 0 2.7 1.8 4.8 4.2 4.8 2 0 3.5-1.4 3.5-3.4 0-1.9-1.4-3.2-3.3-3.2-.5 0-.9.1-1.3.2.4-1.6 1.5-2.9 3.2-4L22 8Z" />
      </svg>
    );
  }
  if (type === "speaker") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M4.5 11h5l8-6v18l-8-6h-5v-6Z" />
        <path d="M20.5 10.5c1.2 1.2 1.9 2.7 1.9 4.5s-.7 3.3-1.9 4.5M23 7.8c2.1 2 3.1 4.4 3.1 7.2S25.1 20.2 23 22.2" />
      </svg>
    );
  }
  if (type === "target") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="13" cy="15" r="8" />
        <circle cx="13" cy="15" r="4" />
        <path d="M13 15 24 4M18 4h6v6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path d="M5 9c0-4 3.8-7 9-7s9 3 9 7-3.8 7-9 7c-1.1 0-2.2-.1-3.2-.4L6 19v-5.7A6.2 6.2 0 0 1 5 9Z" />
      <path d="M10 9h.1M14 9h.1M18 9h.1" />
    </svg>
  );
}

function normalizeSentencePatternProgress(
  payload: SentencePatternProgressApiPayload,
): SentencePatternProgressSnapshot {
  return payload.progress ?? payload.snapshot ?? payload.data ?? payload;
}

function SentencePatternHelpModal({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      icon: "quote",
      title: "理解句型",
      text: "先看句型结构和中文意思，理解在什么场景下使用。",
    },
    {
      icon: "mic",
      title: "点击麦克风，录音练习",
      text: "看着中文提示，用英语说出句子，系统会录音并识别你的表达。",
    },
    {
      icon: "speaker",
      title: "查看反馈与推荐表达",
      text: "录音结束后，查看你的表达、推荐表达和更地道的表达方式。",
    },
    {
      icon: "star",
      title: "收藏与复习",
      text: "收藏重点句型，方便后续复习，加深记忆，灵活运用。",
    },
    {
      icon: "target",
      title: "持续练习，提升口语",
      text: "每天坚持练习，积累100个高频句型，让表达更自然、自信！",
    },
  ] as const;

  return (
    <div className={styles.patternHelpBackdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.patternHelpDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sentence-pattern-help-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.patternHelpClose}
          aria-label="关闭帮助"
          onClick={onClose}
        >
          ×
        </button>

        <header className={styles.patternHelpHeader}>
          <h2 id="sentence-pattern-help-title">100句句型学习指引</h2>
          <p>跟着步骤练习，高效掌握实用句型</p>
        </header>

        <div className={styles.patternHelpSteps}>
          {steps.map((step, index) => (
            <article className={styles.patternHelpStep} key={step.title}>
              <span className={styles.patternHelpStepIcon}>
                <StatIcon type={step.icon} />
              </span>
              {index < steps.length - 1 ? (
                <span className={styles.patternHelpStepArrow} aria-hidden="true">
                  <ChevronIcon direction="down" />
                </span>
              ) : null}
              <div className={styles.patternHelpStepCopy}>
                <div className={styles.patternHelpStepTitle}>
                  <span className={styles.patternHelpStepNumber}>{index + 1}</span>
                  <strong>{step.title}</strong>
                </div>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.patternHelpTip}>
          <div className={styles.patternHelpTipTitle}>
            <StatIcon type="bulb" />
            <strong>小贴士</strong>
          </div>
          <ul>
            <li>大胆开口，说错也没关系，练习是进步的关键！</li>
            <li>多听推荐表达，学习更地道的表达方式。</li>
            <li>重复练习，巩固记忆，让句型脱口而出！</li>
          </ul>
        </div>

        <button type="button" className={styles.patternHelpConfirm} onClick={onClose}>
          我知道了
        </button>
      </section>
    </div>
  );
}

function SentencePatternBottomNav() {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressSnapshot, setProgressSnapshot] =
    useState<SentencePatternProgressSnapshot | null>(null);

  const closeModals = () => {
    setIsHelpOpen(false);
    setIsProgressOpen(false);
  };

  useEffect(() => {
    if (!isProgressOpen) return;

    const controller = new AbortController();

    async function loadProgress() {
      setIsProgressLoading(true);
      setProgressError("");

      try {
        const response = await fetch("/api/ai-guided-expression/progress", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load progress");
        }

        const payload = (await response.json()) as SentencePatternProgressApiPayload;

        if (!controller.signal.aborted) {
          setProgressSnapshot(normalizeSentencePatternProgress(payload));
        }
      } catch {
        if (!controller.signal.aborted) {
          setProgressError("暂时无法读取后台学习进度，请稍后再试。");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsProgressLoading(false);
        }
      }
    }

    void loadProgress();

    return () => controller.abort();
  }, [isProgressOpen]);

  useEffect(() => {
    if (!isHelpOpen && !isProgressOpen) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsHelpOpen(false);
        setIsProgressOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHelpOpen, isProgressOpen]);

  const todayCompleted =
    progressSnapshot?.todayCompleted ?? progressSnapshot?.challenge?.completed ?? 0;
  const dailyGoal = progressSnapshot?.dailyGoal ?? progressSnapshot?.challenge?.goal ?? 5;
  const challengePercent =
    progressSnapshot?.challenge?.percent ??
    Math.min(100, Math.round((todayCompleted / Math.max(dailyGoal, 1)) * 100));
  const streakDays = progressSnapshot?.streakDays ?? 0;
  const totalCompleted = progressSnapshot?.totalCompleted ?? todayCompleted;

  return (
    <>
      <nav className={styles.patternBottomNav} aria-label="100句型学习导航">
        <button
          className={`${styles.patternBottomButton} ${styles.patternBottomButtonActive}`}
          type="button"
          aria-label="回到学习首页"
          onClick={() => router.push("/start")}
        >
          <SentencePatternBottomHomeIcon />
        </button>
        <button
          className={styles.patternBottomButton}
          type="button"
          aria-label="查看学习进度"
          aria-haspopup="dialog"
          aria-expanded={isProgressOpen}
          onClick={() => setIsProgressOpen(true)}
        >
          <SentencePatternBottomProgressIcon />
        </button>
        <button
          className={styles.patternBottomButton}
          type="button"
          aria-label="打开100句型学习帮助"
          aria-haspopup="dialog"
          aria-expanded={isHelpOpen}
          onClick={() => setIsHelpOpen(true)}
        >
          <SentencePatternBottomHelpIcon />
        </button>
        <button
          className={styles.patternBottomButton}
          type="button"
          aria-label="打开账户界面"
          onClick={() => router.push("/account")}
        >
          <SentencePatternBottomAccountIcon />
        </button>
      </nav>

      {isProgressOpen ? (
        <div className={styles.patternBottomModalBackdrop} onClick={closeModals}>
          <section
            className={styles.patternBottomModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sentence-pattern-progress-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.patternBottomModalClose}
              type="button"
              aria-label="关闭学习进度"
              onClick={closeModals}
            >
              <CloseIcon />
            </button>
            <h2 id="sentence-pattern-progress-title">学习进度</h2>
            <p>进度会读取后台学习记录，和你的学习数据保持一致。</p>
            {isProgressLoading ? (
              <div className={styles.patternBottomModalStatus}>正在读取学习进度...</div>
            ) : progressError ? (
              <div className={styles.patternBottomModalStatus}>{progressError}</div>
            ) : (
              <div className={styles.patternBottomProgressGrid}>
                <span>
                  <strong>{todayCompleted}</strong>
                  <small>今日完成</small>
                </span>
                <span>
                  <strong>{challengePercent}%</strong>
                  <small>今日目标</small>
                </span>
                <span>
                  <strong>{streakDays}</strong>
                  <small>连续天数</small>
                </span>
                <span>
                  <strong>{totalCompleted}</strong>
                  <small>累计练习</small>
                </span>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {isHelpOpen ? <SentencePatternHelpModal onClose={() => setIsHelpOpen(false)} /> : null}
    </>
  );
}

export function SentencePatternOverviewPage({
  levels,
}: {
  levels: SentencePatternLevel[];
}) {
  const totalPatterns = levels.reduce((sum, level) => sum + level.totalPatterns, 0);

  return (
    <main className={styles.page}>
      <section className={`${styles.phone} ${styles.overviewPhone}`}>
        <div className={styles.overviewHeader}>
          <div>
            <h1>100 个口语常用句型</h1>
            <p>掌握句型，开口更轻松</p>
          </div>
        </div>

        <div className={styles.overviewMeta}>
          <StatIcon type="star" />
          共 {totalPatterns}个句型 · 每个句型 20 个例句
        </div>

        <div className={styles.levelStack}>
          {levels.map((level) => (
            <Link
              className={styles.levelCard}
              data-tone={level.tone}
              href={`/sentence-patterns/${level.id}`}
              key={level.id}
              style={getToneStyle(level.tone)}
            >
              <span className={styles.levelBadge}>{level.badge}</span>
              <span className={styles.levelTitleRow}>
                <PatternIcon icon={level.icon} />
                <strong>{level.cardTitle}</strong>
              </span>
              <span className={styles.levelSubtitle}>{level.subtitle}</span>
              <span className={styles.levelCount}>
                {level.totalPatterns} 个句型 · {level.exampleCount} 个例句
              </span>
              <span className={styles.levelArt}>
                <ChatBubbleArt levelId={level.id} />
              </span>
              <span className={styles.cardChevron}>
                <ChevronIcon />
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.tipCard}>
          <span className={styles.tipIcon}>
            <StatIcon type="bulb" />
          </span>
          <p>每个句型包含 20 个实用例句，跟读练习，加深记忆，建议按顺序学习，效果更佳！</p>
        </div>
        <SentencePatternBottomNav />
      </section>
    </main>
  );
}

export function SentencePatternLevelMenuPage({
  level,
}: {
  level: SentencePatternLevel;
}) {
  const [openSection, setOpenSection] = useState<{
    levelId: string;
    sectionId: string | null;
  }>(() => ({
    levelId: level.id,
    sectionId: null,
  }));
  const [showAllPatternsSectionId, setShowAllPatternsSectionId] = useState<
    string | null
  >(null);
  const openSectionId =
    openSection.levelId === level.id
      ? openSection.sectionId
      : null;

  return (
    <main className={styles.page} style={getToneStyle(level.tone)}>
      <section className={`${styles.phone} ${styles.levelPhone}`}>
        <header className={styles.levelHeader}>
          <Link href="/sentence-patterns" className={styles.roundBack} aria-label="返回一级菜单">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5 8 12l7 7" />
            </svg>
          </Link>
          <div className={styles.levelHeading}>
            <PatternIcon icon={level.icon} />
            <h1>{level.menuTitle}</h1>
            <p>{level.subtitle}</p>
          </div>
        </header>

        <div className={styles.statsBar}>
          <span>
            <StatIcon type="chat" />
            {level.totalPatterns} 个句型
          </span>
          <span>
            <StatIcon type="file" />
            {level.exampleCount} 个例句
          </span>
          <span>
            <StatIcon type="star" />
            {level.benefit}
          </span>
        </div>

        <div className={styles.sectionList}>
          {level.sections.map((section) => {
            const isOpen = openSectionId === section.id;
            const isShowingAllPatterns = showAllPatternsSectionId === section.id;
            const visiblePatterns =
              isOpen && isShowingAllPatterns
                ? section.patterns
                : section.patterns.slice(0, 5);
            const hiddenPatternCount = section.patterns.length - visiblePatterns.length;

            return (
              <section
                className={styles.patternSection}
                data-open={isOpen}
                key={section.id}
              >
                <button
                  aria-controls={`sentence-pattern-section-${section.id}`}
                  aria-expanded={isOpen}
                  className={styles.sectionTitle}
                  onClick={() => {
                    setOpenSection({
                      levelId: level.id,
                      sectionId: isOpen ? null : section.id,
                    });
                    setShowAllPatternsSectionId(null);
                  }}
                  type="button"
                >
                  <span>{section.range}</span>
                  <strong>
                    {section.title}
                    <small>（{section.englishTitle}）</small>
                  </strong>
                  <ChevronIcon direction={isOpen ? "up" : "down"} />
                </button>
                {isOpen ? (
                  <div
                    className={styles.patternRows}
                    id={`sentence-pattern-section-${section.id}`}
                  >
                    {visiblePatterns.map((pattern) => (
                      <Link
                        className={styles.patternRow}
                        href={`/sentence-patterns/${level.id}/${pattern.id}`}
                        key={pattern.id}
                      >
                        <span>{pattern.id}</span>
                        <strong>{pattern.text}</strong>
                        <ChevronIcon />
                      </Link>
                    ))}
                    {hiddenPatternCount > 0 ? (
                      <button
                        className={`${styles.patternRow} ${styles.morePatternRow}`}
                        onClick={() => setShowAllPatternsSectionId(section.id)}
                        type="button"
                      >
                        <span>...</span>
                        <strong>还有 {hiddenPatternCount} 个句型</strong>
                        <ChevronIcon />
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        <div className={styles.adviceCard}>
          <span>
            <StatIcon type="bulb" />
          </span>
          <strong>学习建议</strong>
          <p>{level.suggestion}</p>
          <ChevronIcon />
        </div>
      </section>
    </main>
  );
}

function getPractice(level: SentencePatternLevel, patternId: number, practiceId: number) {
  const pattern = level.sections.flatMap((section) => section.patterns).find((item) => item.id === patternId);
  const fallback: SentencePatternPractice = {
    chinese: "请用这个句型表达一个真实的生活想法。",
    id: 1,
    idiomatic: pattern?.text || "Try to say it in a more natural way.",
    natural: pattern?.text || "Try to say it naturally.",
    recommended: pattern?.text || "Use this sentence pattern to speak English.",
    simple: pattern?.text || "Say it simply.",
    targetEnglish: pattern?.text || "Use this sentence pattern to speak English.",
  };

  if (!pattern?.practices?.length) return { pattern, practice: fallback, practiceCount: 20 };

  const practice =
    pattern.practices.find((item) => item.id === practiceId) || pattern.practices[0];

  return { pattern, practice, practiceCount: pattern.practices.length };
}

function usePracticeId(max: number) {
  const searchParams = useSearchParams();
  const practiceParam = Number(searchParams.get("practice") || "1");
  if (!Number.isFinite(practiceParam)) return 1;
  return Math.min(Math.max(Math.floor(practiceParam), 1), Math.max(max, 1));
}

const NORMAL_READ_RATE = 0.92;
const SLOW_READ_RATE = 0.5;
const SENTENCE_PATTERN_TTS_VOICE_ID =
  SPEAKFLOW_VOICES[0]?.id || SPEAKFLOW_DEFAULT_VOICE_ID;

function speak(text: string, rate = NORMAL_READ_RATE) {
  void playSpeakFlowTts({
    rate,
    text,
    voiceId: SENTENCE_PATTERN_TTS_VOICE_ID,
  });
}

const sentencePatternLearningLinks = [
  { href: "/ai-guided-expression", label: "AI引导表达" },
  { href: "/free-study", label: "自由学习" },
  { href: "/classic-scenes", label: "经典场景口语练习" },
  { href: "/sentence-patterns", label: "100个口语句型练习" },
  { href: "/native-flow", label: "地道语感训练" },
];

type SentencePatternVariant = {
  icon: "car" | "plusChat" | "star" | "utensils";
  label: string;
  text: string;
  tone: "blue" | "featured" | "green" | "orange";
};

function getFirstPatternHref(level: SentencePatternLevel) {
  const firstPattern = level.sections[0]?.patterns[0];
  return firstPattern
    ? `/sentence-patterns/${level.id}/${firstPattern.id}`
    : `/sentence-patterns/${level.id}`;
}

function getLevelToneClass(level: SentencePatternLevel) {
  if (level.tone === "green") return styles.spWebLevelGreen;
  if (level.tone === "orange") return styles.spWebLevelOrange;
  return styles.spWebLevelPurple;
}

function SentencePatternBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 9.5h14" />
      <path d="M7 6h10" />
      <path d="M7 13h6" />
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v10.2a2.8 2.8 0 0 1-2.8 2.8H12l-4.3 2.6v-2.6h-.2A2.5 2.5 0 0 1 5 16V5.5Z" />
    </svg>
  );
}

function ChevronDownSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CrownSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 8 4.5 4L12 6l3.5 6L20 8l-1.4 9H5.4L4 8Z" />
      <path d="M6 20h12" />
    </svg>
  );
}

function BellSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 9a6 6 0 0 1 12 0v4.7l1.6 2.8H4.4L6 13.7V9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function GlobeSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4a12 12 0 0 1 0 16" />
      <path d="M12 4a12 12 0 0 0 0 16" />
    </svg>
  );
}

function SentencePatternWebTopbar() {
  return (
    <header className={styles.spWebTopbar}>
      <Link className={styles.spWebBrand} href="/">
        <span className={styles.spWebBrandMark}>
          <SentencePatternBrandIcon />
        </span>
        <span>SpeakFlow</span>
      </Link>
      <nav className={styles.spWebNav} aria-label="主导航">
        <Link href="/">首页</Link>
        <div className={styles.spWebNavMenu}>
          <button type="button">
            开始学习
            <ChevronDownSmallIcon />
          </button>
          <div className={styles.spWebNavDropdown}>
            {sentencePatternLearningLinks.map((item) => (
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
      <div className={styles.spWebTopActions}>
        <Link href="/subscription" className={styles.spWebUpgrade}>
          <CrownSmallIcon />
          会员版
        </Link>
        <Link href="/notifications" className={styles.spWebIconLink} aria-label="通知">
          <BellSmallIcon />
        </Link>
        <Link href="/account" className={styles.spWebProfile}>
          <span>
            <GlobeSmallIcon />
          </span>
          <strong>English Learner</strong>
        </Link>
      </div>
    </header>
  );
}

function SentencePatternWebSidebar({
  activeLevel,
}: {
  activeLevel: SentencePatternLevel;
}) {
  return (
    <aside className={styles.spWebSidebar} aria-label="100个口语句型课程">
      <div className={styles.spWebSidebarHeader}>
        <span>课程级别</span>
        <strong>从初级到高级</strong>
      </div>
      <div className={styles.spWebLevelList}>
        {sentencePatternLevels.map((item) => (
          <Link
            className={`${styles.spWebLevelCard} ${getLevelToneClass(item)} ${
              item.id === activeLevel.id ? styles.spWebLevelActive : ""
            }`}
            href={getFirstPatternHref(item)}
            key={item.id}
          >
            <span className={styles.spWebLevelIcon}>
              <PatternIcon icon={item.icon} />
            </span>
            <span className={styles.spWebLevelText}>
              <small>{item.badge}</small>
              <strong>{item.cardTitle}</strong>
              <em>{item.subtitle}</em>
            </span>
            <ChevronIcon />
          </Link>
        ))}
      </div>
      <div className={styles.spWebDataNote}>
        <StatIcon type="target" />
        <span>每个级别包含 100 个句型与 2000 个替换例句，覆盖日常表达。</span>
      </div>
    </aside>
  );
}

function SentencePatternVariantRows({
  onPlay,
  variants,
}: {
  onPlay: (text: string, rate?: number) => void;
  variants: SentencePatternVariant[];
}) {
  return (
    <div className={styles.spWebVariantList}>
      {variants.map((variant, index) => (
        <article
          className={`${styles.spWebVariantCard} ${
            index === 0 ? styles.spWebVariantFeatured : ""
          }`}
          data-tone={variant.tone}
          key={variant.label}
        >
          <span className={styles.spWebVariantIcon}>
            <StatIcon type={variant.icon} />
          </span>
          <div className={styles.spWebVariantCopy}>
            <strong>{variant.label}</strong>
            <p>{variant.text}</p>
          </div>
          <button
            type="button"
            aria-label={`播放${variant.label}`}
            onClick={() => onPlay(variant.text)}
          >
            <StatIcon type="speaker" />
          </button>
        </article>
      ))}
    </div>
  );
}

export function SentencePatternStudyPage({ level, patternId, section }: StudyProps) {
  const router = useRouter();
  const { pattern, practiceCount } = getPractice(level, patternId, 1);
  const practiceId = usePracticeId(practiceCount);
  const { practice } = getPractice(level, patternId, practiceId);
  const [isRecording, setIsRecording] = useState(false);
  const transcriptRef = useRef("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const finishAfterSilenceTimerRef = useRef<number | null>(null);
  const finishRecordingRef = useRef(false);
  const heardSpeechRef = useRef(false);
  const restartOnEndRef = useRef(false);
  const progress = Math.round((practiceId / practiceCount) * 100);
  const nextPractice = practiceId >= practiceCount ? practiceId : practiceId + 1;
  const previousPractice = practiceId <= 1 ? practiceId : practiceId - 1;
  const currentPatternText = pattern?.text || practice.targetEnglish;
  const completedPracticeCount = Math.max(practiceId - 1, 0);
  const variants: SentencePatternVariant[] = [
    {
      icon: "star",
      label: "推荐表达",
      text: practice.recommended,
      tone: "featured",
    },
    {
      icon: "utensils",
      label: "更地道",
      text: practice.idiomatic,
      tone: "orange",
    },
    {
      icon: "car",
      label: "更简单",
      text: practice.simple,
      tone: "blue",
    },
    {
      icon: "plusChat",
      label: "更自然",
      text: practice.natural,
      tone: "green",
    },
  ];

  function clearFinishAfterSilenceTimer() {
    if (finishAfterSilenceTimerRef.current === null) return;
    window.clearTimeout(finishAfterSilenceTimerRef.current);
    finishAfterSilenceTimerRef.current = null;
  }

  useEffect(() => {
    return () => {
      finishRecordingRef.current = true;
      if (finishAfterSilenceTimerRef.current !== null) {
        window.clearTimeout(finishAfterSilenceTimerRef.current);
      }
      try {
        recognitionRef.current?.abort?.();
      } catch {}
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    recordSentencePatternProgress({
      completed: false,
      levelId: level.id,
      levelTitle: level.menuTitle,
      patternId,
      patternText: currentPatternText,
      practiceCount,
      practiceId,
      sectionTitle: section.title,
    });
  }, [
    currentPatternText,
    level.id,
    level.menuTitle,
    patternId,
    practiceCount,
    practiceId,
    section.title,
  ]);

  function finishRecording(transcript: string) {
    if (finishRecordingRef.current) return;
    finishRecordingRef.current = true;
    restartOnEndRef.current = false;
    clearFinishAfterSilenceTimer();
    recognitionRef.current = null;
    setIsRecording(false);

    const cleaned = transcript.trim() || practice.targetEnglish;
    try {
      window.sessionStorage.setItem(
        sessionKey(level.id, patternId, practiceId),
        cleaned
      );
    } catch {}
    router.push(`/sentence-patterns/${level.id}/${patternId}/result?practice=${practiceId}`);
  }

  function finishBufferedRecording() {
    const transcript = transcriptRef.current.trim();

    if ((!transcript && !heardSpeechRef.current) || finishRecordingRef.current) {
      return false;
    }

    const recognition = recognitionRef.current;
    try {
      recognition?.stop();
    } catch {}

    finishRecording(transcript);
    return true;
  }

  function stopRecordingForFinalResult() {
    if (finishBufferedRecording()) {
      return;
    }

    try {
      recognitionRef.current?.stop();
    } catch {}
  }

  function startRecording() {
    if (isRecording) {
      stopRecordingForFinalResult();
      return;
    }

    setIsRecording(true);
    transcriptRef.current = "";
    finishRecordingRef.current = false;
    heardSpeechRef.current = false;
    restartOnEndRef.current = false;

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      finishRecording(practice.targetEnglish);
      return;
    }

    const beginRecognition = () => {
      if (finishRecordingRef.current) return;

      const recognition = new Recognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      const scheduleFinishAfterSilence = () => {
        clearFinishAfterSilenceTimer();
        finishAfterSilenceTimerRef.current = window.setTimeout(() => {
          stopRecordingForFinalResult();
        }, FINISH_AFTER_SILENCE_MS);
      };

      recognition.onspeechstart = () => {
        heardSpeechRef.current = true;
        clearFinishAfterSilenceTimer();
      };

      recognition.onspeechend = () => {
        scheduleFinishAfterSilence();
      };

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0]?.transcript || "")
          .join(" ")
          .trim();
        transcriptRef.current = text;
        if (!text) return;

        heardSpeechRef.current = true;
        scheduleFinishAfterSilence();
      };

      recognition.onerror = (event) => {
        const errorName =
          "error" in event && typeof event.error === "string" ? event.error : "";
        if (
          (errorName === "no-speech" || errorName === "aborted") &&
          !transcriptRef.current.trim() &&
          !heardSpeechRef.current
        ) {
          restartOnEndRef.current = errorName === "no-speech";
          return;
        }
        finishRecording(transcriptRef.current);
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        clearFinishAfterSilenceTimer();

        if (finishRecordingRef.current) return;
        const transcript = transcriptRef.current.trim();
        if (transcript) {
          finishRecording(transcript);
          return;
        }

        if (heardSpeechRef.current) {
          finishRecording(transcriptRef.current);
          return;
        }

        if (restartOnEndRef.current) {
          restartOnEndRef.current = false;
          window.setTimeout(beginRecognition, RESTART_AFTER_NO_SPEECH_MS);
          return;
        }

        setIsRecording(false);
      };

      try {
        recognition.start();
      } catch {
        finishRecording(transcriptRef.current);
      }
    };

    try {
      beginRecognition();
    } catch {
      finishRecording(practice.targetEnglish);
    }
  }

  return (
    <main className={styles.spWebPage} style={getToneStyle(level.tone)}>
      <SentencePatternWebTopbar />
      <div className={styles.spWebShell}>
        <SentencePatternWebSidebar activeLevel={level} />
        <section className={styles.spWebMain} aria-label="100个口语句型学习">
          <section className={styles.spWebHero}>
            <span className={styles.spWebHeroIcon}>
              <PatternIcon icon={level.icon} />
            </span>
            <div>
              <h1>100个口语句型</h1>
              <p>300个高频句型，覆盖日常表达</p>
            </div>
            <div className={styles.spWebHeroPills}>
              <span>初级</span>
              <span>中级</span>
              <span>高级</span>
            </div>
          </section>

          <section className={styles.spWebContinue}>
            <span className={styles.spWebContinueIcon}>
              <StatIcon type="target" />
            </span>
            <div>
              <strong>继续上次练习</strong>
              <span>{level.menuTitle} / {section.title}</span>
              <small>
                已完成 {completedPracticeCount} 句，当前第 {practiceId} / {practiceCount} 句
              </small>
            </div>
            <Link href={`/sentence-patterns/${level.id}/${patternId}?practice=${practiceId}`}>
              继续练习
              <ChevronIcon />
            </Link>
          </section>

          <section className={styles.spWebLearningGrid}>
            <div className={styles.spWebStudyColumn}>
              <article className={styles.spWebPatternCard}>
                <header className={styles.spWebPanelHeader}>
                  <div>
                    <span>当前句型标题</span>
                    <h2>{currentPatternText}</h2>
                  </div>
                  <strong>{practiceId} / {practiceCount}</strong>
                </header>
                <div className={styles.spWebProgressRow}>
                  <span>进度：第 {practiceId} / {practiceCount} 句</span>
                  <em>{progress}% 完成</em>
                </div>
                <div className={styles.spWebProgressTrack}>
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className={styles.spWebChineseBox}>
                  <span>中文句子</span>
                  <p>{practice.chinese}</p>
                </div>
              </article>
              <button
                type="button"
                className={styles.spWebRecordButton}
                data-recording={isRecording}
                onClick={startRecording}
              >
                <StatIcon type="mic" />
                {isRecording ? "正在录音..." : "点我，录制英语"}
              </button>
              <div className={styles.spWebControls}>
                <Link href={`/sentence-patterns/${level.id}/${patternId}?practice=${previousPractice}`}>
                  <ChevronIcon direction="left" />
                  上一句
                </Link>
                <button
                  type="button"
                  onClick={() => speak(practice.recommended, SLOW_READ_RATE)}
                >
                  <StatIcon type="headphones" />
                  慢速朗读
                </button>
                <Link href={`/sentence-patterns/${level.id}/${patternId}?practice=${nextPractice}`}>
                  下一句
                  <ChevronIcon />
                </Link>
              </div>
              <section className={styles.spWebUserExpression}>
                <div>
                  <span>
                    <StatIcon type="mic" />
                    你的表达
                  </span>
                  <button
                    type="button"
                    aria-label="播放示例表达"
                    onClick={() => speak(practice.targetEnglish)}
                  >
                    <StatIcon type="speaker" />
                  </button>
                </div>
                <p>
                  {isRecording
                    ? "正在听你说英语，停顿 2 秒后会自动生成反馈。"
                    : "录音结束后，这里会显示你的英语表达。"}
                </p>
              </section>
            </div>

            <article className={styles.spWebRecommendationPanel}>
              <header className={styles.spWebPanelHeader}>
                <div>
                  <span>AI 优化结果</span>
                  <h2>推荐表达</h2>
                </div>
                <small>选择词组或单词，可以收藏进表达库中</small>
              </header>
              <SentencePatternVariantRows variants={variants} onPlay={speak} />
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}

export function SentencePatternResultPage({ level, patternId, section }: StudyProps) {
  const searchParams = useSearchParams();
  const practiceParam = Number(searchParams.get("practice") || "1");
  const practiceId = Number.isFinite(practiceParam)
    ? Math.max(1, Math.floor(practiceParam))
    : 1;
  const { pattern, practice, practiceCount } = getPractice(level, patternId, practiceId);
  const userExpression =
    readSavedTranscript(level.id, patternId, practiceId) ||
    practice.targetEnglish;
  const nextPractice = practiceId >= practiceCount ? practiceId : practiceId + 1;
  const previousPractice = practiceId <= 1 ? practiceId : practiceId - 1;
  const progress = Math.round((practiceId / practiceCount) * 100);
  const currentPatternText = pattern?.text || practice.targetEnglish;

  const variants: SentencePatternVariant[] = [
    {
      icon: "star",
      label: "推荐表达",
      text: practice.recommended,
      tone: "featured",
    },
    {
      icon: "utensils",
      label: "更地道",
      text: practice.idiomatic,
      tone: "orange",
    },
    {
      icon: "car",
      label: "更简单",
      text: practice.simple,
      tone: "blue",
    },
    {
      icon: "plusChat",
      label: "更自然",
      text: practice.natural,
      tone: "green",
    },
  ];

  function playPatternAudio(text: string, rate = NORMAL_READ_RATE) {
    speak(text, rate);
  }

  useEffect(() => {
    recordSentencePatternProgress({
      completed: true,
      levelId: level.id,
      levelTitle: level.menuTitle,
      patternId,
      patternText: currentPatternText,
      practiceCount,
      practiceId,
      sectionTitle: section.title,
    });
  }, [
    currentPatternText,
    level.id,
    level.menuTitle,
    patternId,
    practiceCount,
    practiceId,
    section.title,
  ]);

  useEffect(() => {
    return () => {
      stopSpeakFlowTts();
    };
  }, []);

  return (
    <main className={styles.spWebPage} style={getToneStyle(level.tone)}>
      <SentencePatternWebTopbar />
      <div className={styles.spWebShell}>
        <SentencePatternWebSidebar activeLevel={level} />
        <section className={styles.spWebMain} aria-label="100个口语句型学习结果">
          <section className={styles.spWebHero}>
            <span className={styles.spWebHeroIcon}>
              <PatternIcon icon={level.icon} />
            </span>
            <div>
              <h1>100个口语句型</h1>
              <p>300个高频句型，覆盖日常表达</p>
            </div>
            <div className={styles.spWebHeroPills}>
              <span>初级</span>
              <span>中级</span>
              <span>高级</span>
            </div>
          </section>

          <section className={styles.spWebContinue}>
            <span className={styles.spWebContinueIcon}>
              <StatIcon type="target" />
            </span>
            <div>
              <strong>继续上次练习</strong>
              <span>{level.menuTitle} / {section.title}</span>
              <small>当前第 {practiceId} / {practiceCount} 句，已完成 {progress}%</small>
            </div>
            <Link href={`/sentence-patterns/${level.id}/${patternId}?practice=${practiceId}`}>
              重新录制
              <ChevronIcon />
            </Link>
          </section>

          <section className={styles.spWebLearningGrid}>
            <div className={styles.spWebStudyColumn}>
              <article className={styles.spWebPatternCard}>
                <header className={styles.spWebPanelHeader}>
                  <div>
                    <span>当前句型标题</span>
                    <h2>{currentPatternText}</h2>
                  </div>
                  <strong>{practiceId} / {practiceCount}</strong>
                </header>
                <div className={styles.spWebProgressRow}>
                  <span>进度：第 {practiceId} / {practiceCount} 句</span>
                  <em>{progress}% 完成</em>
                </div>
                <div className={styles.spWebProgressTrack}>
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className={styles.spWebChineseBox}>
                  <span>中文句子</span>
                  <p>{practice.chinese}</p>
                </div>
              </article>
              <Link
                className={styles.spWebRecordButton}
                href={`/sentence-patterns/${level.id}/${patternId}?practice=${practiceId}`}
              >
                <StatIcon type="mic" />
                点我，录制英语
              </Link>
              <div className={styles.spWebControls}>
                <Link href={`/sentence-patterns/${level.id}/${patternId}?practice=${previousPractice}`}>
                  <ChevronIcon direction="left" />
                  上一句
                </Link>
                <button
                  type="button"
                  onClick={() => playPatternAudio(practice.recommended, SLOW_READ_RATE)}
                >
                  <StatIcon type="headphones" />
                  慢速朗读
                </button>
                <Link href={`/sentence-patterns/${level.id}/${patternId}?practice=${nextPractice}`}>
                  下一句
                  <ChevronIcon />
                </Link>
              </div>
              <section className={styles.spWebUserExpression}>
                <div>
                  <span>
                    <StatIcon type="mic" />
                    你的表达
                  </span>
                  <button
                    type="button"
                    aria-label="播放你的表达"
                    onClick={() => speak(userExpression)}
                  >
                    <StatIcon type="speaker" />
                  </button>
                </div>
                <p>{userExpression}</p>
              </section>
            </div>

            <article className={styles.spWebRecommendationPanel}>
              <header className={styles.spWebPanelHeader}>
                <div>
                  <span>AI 优化结果</span>
                  <h2>推荐表达</h2>
                </div>
                <small>选择词组或单词，可以收藏进表达库中</small>
              </header>
              <SentencePatternVariantRows
                variants={variants}
                onPlay={playPatternAudio}
              />
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
