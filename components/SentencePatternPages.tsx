"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import HomeMenuIcon from "@/components/HomeMenuIcon";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";
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

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type PatternToneStyle = CSSProperties & {
  "--pattern-accent": string;
  "--pattern-accent-dark": string;
  "--pattern-soft": string;
  "--pattern-soft-strong": string;
  "--pattern-glow": string;
};

function sessionKey(levelId: string, patternId: number, practiceId: number) {
  return `sentence-pattern:${levelId}:${patternId}:${practiceId}:transcript`;
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

function ChatBubbleArt() {
  return (
    <svg viewBox="0 0 210 170" aria-hidden="true" className={styles.chatArt}>
      <circle cx="102" cy="82" r="66" />
      <path d="M56 63c0-27 23-47 57-47 33 0 56 20 56 47s-23 48-56 48c-5 0-10-.5-15-1.5L73 130v-27c-11-9-17-23-17-40Z" />
      <circle cx="93" cy="64" r="7" />
      <circle cx="116" cy="64" r="7" />
      <circle cx="139" cy="64" r="7" />
      <circle cx="154" cy="121" r="34" />
      <path d="M141 119c8 5 17 5 26 0M154 105v27" />
    </svg>
  );
}

function BrandHeader() {
  return (
    <header className={styles.brandHeader}>
      <Link href="/start" className={styles.homeButton} aria-label="回到学习首页">
        <HomeMenuIcon label={null} showHint={false} />
      </Link>
      <Link href="/start" className={styles.brand} aria-label="SpeakFlow 学习首页">
        <SpeakFlowBrandMark className={styles.brandMark} />
        <span>
          <strong>SpeakFlow</strong>
          <small>VOICE PRACTICE</small>
        </span>
      </Link>
      <Link href="/sentence-patterns" className={styles.switchButton}>
        切换课程
      </Link>
    </header>
  );
}

function ChevronIcon({ direction = "right" }: { direction?: "down" | "right" | "up" }) {
  const path =
    direction === "down"
      ? "m8 10 4 4 4-4"
      : direction === "up"
        ? "m8 14 4-4 4 4"
        : "m10 7 5 5-5 5";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function StatIcon({ type }: { type: "book" | "chat" | "file" | "mic" | "star" }) {
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
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path d="M5 9c0-4 3.8-7 9-7s9 3 9 7-3.8 7-9 7c-1.1 0-2.2-.1-3.2-.4L6 19v-5.7A6.2 6.2 0 0 1 5 9Z" />
      <path d="M10 9h.1M14 9h.1M18 9h.1" />
    </svg>
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
      <section className={styles.phone}>
        <div className={styles.overviewHeader}>
          <Link href="/start" className={styles.roundBack} aria-label="回到学习首页">
            <HomeMenuIcon label={null} showHint={false} />
          </Link>
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
                <ChatBubbleArt />
              </span>
              <span className={styles.cardChevron}>
                <ChevronIcon />
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.tipCard}>
          <span className={styles.tipIcon}>
            <StatIcon type="star" />
          </span>
          <p>每个句型包含 20 个实用例句，跟读练习，加深记忆，建议按顺序学习，效果更佳！</p>
        </div>
      </section>
    </main>
  );
}

export function SentencePatternLevelMenuPage({
  level,
}: {
  level: SentencePatternLevel;
}) {
  return (
    <main className={styles.page} style={getToneStyle(level.tone)}>
      <section className={styles.phone}>
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
            {level.stats[0]}
          </span>
          <span>
            <StatIcon type="file" />
            {level.stats[1]}
          </span>
          <span>
            <StatIcon type="star" />
            {level.stats[2]}
          </span>
        </div>

        <div className={styles.sectionList}>
          {level.sections.map((section, index) => {
            const visiblePatterns = index === 0 ? section.patterns.slice(0, 5) : [];
            const hiddenCount = Math.max(section.patterns.length - visiblePatterns.length, 0);

            return (
              <section
                className={styles.patternSection}
                data-open={index === 0}
                key={section.id}
              >
                <div className={styles.sectionTitle}>
                  <span>{section.range}</span>
                  <strong>
                    {section.title}
                    <small>（{section.englishTitle}）</small>
                  </strong>
                  <ChevronIcon direction={index === 0 ? "up" : "down"} />
                </div>
                {visiblePatterns.length > 0 ? (
                  <div className={styles.patternRows}>
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
                    {hiddenCount > 0 ? (
                      <Link
                        className={styles.patternRow}
                        href={`/sentence-patterns/${level.id}/${visiblePatterns.length + 1}`}
                      >
                        <span>...</span>
                        <strong>还有 {hiddenCount} 个句型</strong>
                        <ChevronIcon />
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        <Link href={`/sentence-patterns/${level.id}/1`} className={styles.adviceCard}>
          <span>
            <StatIcon type="star" />
          </span>
          <strong>{level.id === "advanced" ? "顶级练习建议" : level.id === "intermediate" ? "进阶练习建议" : "学习建议"}</strong>
          <p>{level.suggestion}</p>
          <ChevronIcon />
        </Link>
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

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

export function SentencePatternStudyPage({ level, patternId, section }: StudyProps) {
  const router = useRouter();
  const { pattern, practiceCount } = getPractice(level, patternId, 1);
  const practiceId = usePracticeId(practiceCount);
  const { practice } = getPractice(level, patternId, practiceId);
  const [isRecording, setIsRecording] = useState(false);
  const transcriptRef = useRef("");
  const progress = Math.round((practiceId / practiceCount) * 100);
  const nextPractice = practiceId >= practiceCount ? practiceId : practiceId + 1;
  const previousPractice = practiceId <= 1 ? practiceId : practiceId - 1;

  function finishRecording(transcript: string) {
    const cleaned = transcript.trim() || practice.targetEnglish;
    try {
      window.sessionStorage.setItem(
        sessionKey(level.id, patternId, practiceId),
        cleaned
      );
    } catch {}
    router.push(`/sentence-patterns/${level.id}/${patternId}/result?practice=${practiceId}`);
  }

  function startRecording() {
    if (isRecording) return;
    setIsRecording(true);
    transcriptRef.current = "";

    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      window.setTimeout(() => finishRecording(practice.targetEnglish), 1200);
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0]?.transcript || "")
          .join(" ")
          .trim();
        transcriptRef.current = text;
      };
      recognition.onerror = () => finishRecording(transcriptRef.current);
      recognition.onend = () => finishRecording(transcriptRef.current);
      recognition.start();
      window.setTimeout(() => {
        try {
          recognition.stop();
        } catch {}
      }, 7000);
    } catch {
      finishRecording(practice.targetEnglish);
    }
  }

  return (
    <main className={styles.studyPage} style={getToneStyle(level.tone)}>
      <section className={styles.studyPhone}>
        <BrandHeader />

        <Link href={`/sentence-patterns/${level.id}`} className={styles.courseCrumb}>
          <span>
            <PatternIcon icon={level.icon} />
          </span>
          <strong>{level.menuTitle}</strong>
          <ChevronIcon />
          <small>{section.title}（{section.englishTitle}）</small>
        </Link>

        <section className={styles.studyCard}>
          <div className={styles.studyTitleRow}>
            <span className={styles.practicePill}>{practiceId} / {practiceCount}</span>
            <h1>{pattern?.text || practice.targetEnglish}</h1>
            <Link
              href={`/sentence-patterns/${level.id}/${patternId}?practice=${nextPractice}`}
              aria-label="下一句"
            >
              <ChevronIcon />
            </Link>
          </div>

          <div className={styles.progressRow}>
            <span>进度：第 {practiceId} / {practiceCount} 句</span>
            <strong>{progress}% 完成</strong>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className={styles.promptCard}>
            <span className={styles.quoteLeft}>“</span>
            <p>{practice.chinese}</p>
            <span className={styles.quoteRight}>”</span>
            <i className={styles.roomArt} aria-hidden="true" />
          </div>

          <div className={styles.promptTip}>
            <StatIcon type="star" />
            小贴士：看着中文，尝试用英语表达出来，提升你的口语流利度！
          </div>
        </section>

        <section className={styles.recordCard}>
          <p>
            <StatIcon type="mic" />
            {isRecording ? "正在录音，请说出你的英文表达" : "点击麦克风，开始录制你的英文表达"}
          </p>
          <small>录音建议 5-15 秒</small>
          <button
            type="button"
            className={styles.bigMic}
            data-recording={isRecording}
            onClick={startRecording}
            aria-label="开始录音"
          >
            <StatIcon type="mic" />
          </button>
          <Link
            href={`/sentence-patterns/${level.id}/${patternId}?practice=${previousPractice}`}
            className={styles.prevButton}
          >
            ← 上一句
          </Link>
          <Link
            href={`/sentence-patterns/${level.id}/${patternId}?practice=${nextPractice}`}
            className={styles.skipButton}
          >
            跳过 →
          </Link>
        </section>

        <div className={styles.bottomTip}>
          <span>
            <StatIcon type="star" />
          </span>
          <strong>学习小贴士</strong>
          <p>大胆开口，不用担心语法错误，先表达出来才是进步的第一步！</p>
        </div>
      </section>
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
  const [userExpression, setUserExpression] = useState(practice.targetEnglish);
  const nextPractice = practiceId >= practiceCount ? practiceId : practiceId + 1;
  const previousPractice = practiceId <= 1 ? practiceId : practiceId - 1;
  const progress = Math.round((practiceId / practiceCount) * 100);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.sessionStorage.getItem(
          sessionKey(level.id, patternId, practiceId)
        );
        if (saved?.trim()) setUserExpression(saved.trim());
      } catch {}
    }, 0);

    return () => window.clearTimeout(timer);
  }, [level.id, patternId, practiceId]);

  const variants = [
    {
      icon: "star",
      label: "推荐表达",
      text: practice.recommended,
      tone: "featured",
    },
    {
      icon: "chat",
      label: "更地道",
      text: practice.idiomatic,
      tone: "orange",
    },
    {
      icon: "book",
      label: "更简单",
      text: practice.simple,
      tone: "blue",
    },
    {
      icon: "chat",
      label: "更自然",
      text: practice.natural,
      tone: "green",
    },
  ] as const;

  return (
    <main className={styles.studyPage} style={getToneStyle(level.tone)}>
      <section className={styles.studyPhone}>
        <BrandHeader />

        <Link href={`/sentence-patterns/${level.id}`} className={styles.courseCrumb}>
          <span>
            <PatternIcon icon={level.icon} />
          </span>
          <strong>{level.menuTitle}</strong>
          <ChevronIcon />
          <small>{section.title}（{section.englishTitle}）</small>
        </Link>

        <section className={styles.resultIntro}>
          <div className={styles.studyTitleRow}>
            <span className={styles.practicePill}>{practiceId} / {practiceCount}</span>
            <h1>{pattern?.text || practice.targetEnglish}</h1>
            <Link
              href={`/sentence-patterns/${level.id}/${patternId}?practice=${nextPractice}`}
              aria-label="下一句"
            >
              <ChevronIcon />
            </Link>
          </div>
          <div className={styles.progressRow}>
            <span>进度：第 {practiceId} / {practiceCount} 句</span>
            <strong>{progress}% 完成</strong>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className={styles.expressionStack}>
          <div className={styles.userExpression}>
            <span className={styles.expressionLabel}>
              <StatIcon type="mic" />
              你的表达
            </span>
            <p>{userExpression}</p>
            <button type="button" onClick={() => speak(userExpression)} aria-label="播放你的表达">
              <StatIcon type="mic" />
            </button>
            <small>点击播放你的录音</small>
          </div>

          {variants.map((variant) => (
            <article
              className={styles.variantCard}
              data-tone={variant.tone}
              key={variant.label}
            >
              <span className={styles.variantIcon}>
                <StatIcon type={variant.icon} />
              </span>
              <div>
                <strong>{variant.label}</strong>
                <p>{variant.text}</p>
              </div>
              <button type="button" onClick={() => speak(variant.text)} aria-label={`播放${variant.label}`}>
                <StatIcon type="mic" />
              </button>
            </article>
          ))}
        </section>

        <section className={styles.followCard}>
          <div>
            <strong>
              <StatIcon type="book" />
              跟读练习
            </strong>
            <p>听标准发音，跟读练习更地道</p>
          </div>
          <button type="button" onClick={() => speak(practice.recommended)}>
            慢速朗读
          </button>
          <Link
            href={`/sentence-patterns/${level.id}/${patternId}?practice=${previousPractice}`}
            className={styles.prevButton}
          >
            ← 上一句
          </Link>
          <button
            type="button"
            className={styles.bigMic}
            onClick={() => speak(practice.recommended)}
            aria-label="点击跟读"
          >
            <StatIcon type="mic" />
          </button>
          <Link
            href={`/sentence-patterns/${level.id}/${patternId}?practice=${nextPractice}`}
            className={styles.skipButton}
          >
            下一句 →
          </Link>
          <small>点击跟读</small>
        </section>

        <div className={styles.bottomTip}>
          <span>
            <StatIcon type="star" />
          </span>
          <strong>学习小贴士</strong>
          <p>多听多模仿，注意语音语调，表达会更自然！</p>
        </div>
      </section>
    </main>
  );
}
