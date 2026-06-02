"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./StartPageClient.module.css";

type AiProgressSummary = {
  challengeCompleted: number;
  challengeGoal: number;
  dailyGoal: number;
  level: number;
  streakDays: number;
  todayCompleted: number;
  totalCompleted: number;
};

type ContinueStudySummary = {
  categoryLabel: string;
  completed: number;
  href: string;
  statusLabel: string;
  title: string;
  total: number;
};

type StartPageClientProps = {
  aiProgress: AiProgressSummary;
  fallbackContinueStudy: ContinueStudySummary;
  userEmail: string;
  userImage: string;
  userName: string;
};

type StoredLesson = {
  id?: unknown;
  title?: unknown;
  txt_content?: unknown;
};

type StoredLastStudy = {
  courseId?: unknown;
  sentenceIndex?: unknown;
};

type PracticeCardTone = "violet" | "blue" | "cyan" | "pink";
type PracticeCardIcon = "mic" | "chat" | "bank" | "star";

const LAST_STUDY_PROGRESS_KEY = "lastStudyProgress";
const LESSONS_STORAGE_KEY = "english-app-lessons";
const BEGINNER_BADGE_LABEL = "🌱 初学者勋章";
const ACCOUNT_AVATAR_STORAGE_PREFIX = "speakflow-account-avatar";

const practiceCards: Array<{
  href: string;
  icon: PracticeCardIcon;
  subtitle: string;
  title: string;
  tone: PracticeCardTone;
}> = [
  {
    href: "/free-study/step-1",
    icon: "mic",
    subtitle: "想到什么说什么，完全自由练习",
    title: "自由学习",
    tone: "violet",
  },
  {
    href: "/ai-guided-expression/step-1",
    icon: "chat",
    subtitle: "不知道说什么？AI 带你聊",
    title: "AI 引导表达",
    tone: "blue",
  },
  {
    href: "/classic-scenes",
    icon: "bank",
    subtitle: "餐厅、银行、机场、工作等场景练习",
    title: "经典场景",
    tone: "cyan",
  },
  {
    href: "/new-expressions",
    icon: "star",
    subtitle: "复习和巩固你学到的地道表达",
    title: "新表达",
    tone: "pink",
  },
];

const starterPracticeCards: Array<{
  href: string;
  icon: Exclude<PracticeCardIcon, "chat">;
  subtitle: string;
  title: string;
  tone: Exclude<PracticeCardTone, "blue">;
}> = [
  {
    href: "/free-study/step-1",
    icon: "mic",
    subtitle: "想说什么就说什么，完全自由练习",
    title: "自由练习",
    tone: "violet",
  },
  {
    href: "/classic-scenes",
    icon: "bank",
    subtitle: "旅行、职场、购物等场景口语练习",
    title: "经典场景",
    tone: "cyan",
  },
  {
    href: "/new-expressions",
    icon: "star",
    subtitle: "学习和收藏地道表达，丰富你的口语",
    title: "新表达",
    tone: "pink",
  },
];

function clampCount(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.floor(value), 0), Math.max(max, 0));
}

function getPercent(completed: number, total: number) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.round((clampCount(completed, total) / total) * 100));
}

function displayName(userName: string, userEmail: string) {
  const cleaned = userName.trim();
  const email = userEmail.trim();
  if (cleaned && cleaned.toLowerCase() !== email.toLowerCase()) return cleaned;

  const localPart = email.split("@")[0]?.trim();
  return localPart || "SpeakFlow 用户";
}

function getAvatarInitials(name: string, email: string, isSignedIn: boolean) {
  if (!isSignedIn) return "Hi";

  const source = name.trim() || email.split("@")[0]?.trim() || "S";
  const words = source.split(/\s+/).filter(Boolean);
  const initials =
    words.length > 1
      ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`
      : source.slice(0, 2);

  return initials.toUpperCase() || "S";
}

function getAccountAvatarStorageKey(identifier: string) {
  return `${ACCOUNT_AVATAR_STORAGE_PREFIX}:${identifier || "local-user"}`;
}

function parseStoredLessons() {
  try {
    const raw = window.localStorage.getItem(LESSONS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { lessons?: StoredLesson[] }) : {};
    return Array.isArray(parsed.lessons) ? parsed.lessons : [];
  } catch {
    return [];
  }
}

function countTrainingItems(content: string, fallbackTotal: number) {
  const trimmed = content.trim();
  if (!trimmed) return fallbackTotal;

  try {
    const parsed = JSON.parse(trimmed) as { items?: unknown };
    if (Array.isArray(parsed.items)) {
      return Math.max(parsed.items.length, fallbackTotal);
    }
  } catch {
    // Plain text lessons are counted below without importing the full parser.
  }

  const nonEmptyLines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return Math.max(Math.ceil(nonEmptyLines.length / 2), fallbackTotal);
}

function createContinueStudyFromStorage(fallback: ContinueStudySummary): ContinueStudySummary {
  try {
    const raw = window.localStorage.getItem(LAST_STUDY_PROGRESS_KEY);
    const saved = raw ? (JSON.parse(raw) as StoredLastStudy) : null;
    const courseId =
      typeof saved?.courseId === "string" ? saved.courseId.trim() : "";

    if (!courseId) return fallback;

    const sentenceIndex =
      typeof saved?.sentenceIndex === "number" &&
      Number.isFinite(saved.sentenceIndex)
        ? Math.max(0, Math.floor(saved.sentenceIndex))
        : 0;
    const storedLesson = parseStoredLessons().find(
      (lesson) => lesson.id === courseId
    );

    if (storedLesson) {
      const title =
        typeof storedLesson.title === "string" && storedLesson.title.trim()
          ? storedLesson.title.trim()
          : "未命名课程";
      const content =
        typeof storedLesson.txt_content === "string"
          ? storedLesson.txt_content
          : "";
      const total =
        countTrainingItems(content, Math.max(sentenceIndex + 1, 1));

      return {
        categoryLabel: "自建课程",
        completed: clampCount(sentenceIndex + 1, total),
        href: `/study/${courseId}`,
        statusLabel: "进行中",
        title,
        total,
      };
    }

    const completed = Math.max(sentenceIndex + 1, 1);
    const total = Math.max(completed, fallback.total || completed);

    return {
      categoryLabel: fallback.categoryLabel,
      completed: clampCount(completed, total),
      href: `/study/${encodeURIComponent(courseId)}`,
      statusLabel: "进行中",
      title: fallback.title,
      total,
    };
  } catch {
    return fallback;
  }

  return fallback;
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32">
      <path d="M8 10h16M8 16h16M8 22h16" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function PracticeIcon({ type }: { type: PracticeCardIcon }) {
  if (type === "chat") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48">
        <path d="M9 22c0-8 6.8-14 16-14s16 6 16 14-6.8 14-16 14c-1.8 0-3.5-.2-5.1-.7L10 40l2.6-8A13.5 13.5 0 0 1 9 22Z" />
        <path d="M17 23h.1M24 23h.1M31 23h.1" />
        <path d="m34 8 1.7 3.5 3.8.5-2.7 2.7.6 3.8-3.4-1.8-3.4 1.8.6-3.8-2.7-2.7 3.8-.5L34 8Z" />
      </svg>
    );
  }

  if (type === "bank") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48">
        <path d="M7 19h34L24 9 7 19Z" />
        <path d="M11 39h26M8 43h32M14 19v17M21 19v17M28 19v17M35 19v17" />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48">
        <path d="m24 8 4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.5L24 32l-9.4 4.9 1.8-10.5L8.8 19l10.5-1.5L24 8Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48">
      <rect x="18" y="7" width="12" height="22" rx="6" />
      <path d="M12 23c0 7 5 12 12 12s12-5 12-12M24 35v7M17 42h14" />
    </svg>
  );
}

function StarBuddy() {
  return (
    <svg aria-hidden="true" className={styles.starBuddy} focusable="false" viewBox="0 0 168 168">
      <defs>
        <linearGradient id="start-star-gradient" x1="30" x2="132" y1="24" y2="144">
          <stop stopColor="#a985ff" />
          <stop offset="1" stopColor="#5e73ff" />
        </linearGradient>
      </defs>
      <path
        d="m84 17 20.2 42.8 45.5 6.9-33 33.2 7.8 46.9L84 124.5l-40.5 22.3 7.8-46.9-33-33.2 45.5-6.9L84 17Z"
        fill="url(#start-star-gradient)"
      />
      <path d="M66 83c4 5.2 10 8 18 8s14-2.8 18-8" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="5" />
      <circle cx="68" cy="70" r="5" fill="#fff" />
      <circle cx="100" cy="70" r="5" fill="#fff" />
      <path d="M29 98h.1M139 46h.1M147 78h.1M42 42h.1" fill="none" stroke="#c7beff" strokeLinecap="round" strokeWidth="10" />
    </svg>
  );
}

function CoffeeScene() {
  return (
    <svg aria-hidden="true" className={styles.coffeeScene} focusable="false" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="start-coffee-bg" x1="10" x2="108" y1="8" y2="112">
          <stop stopColor="#f8f4ea" />
          <stop offset="1" stopColor="#dbe9f6" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#start-coffee-bg)" />
      <path d="M0 84c27-22 56-24 120-18v54H0V84Z" fill="#c99f70" opacity=".38" />
      <ellipse cx="57" cy="83" fill="#a87344" opacity=".28" rx="42" ry="11" />
      <path d="M33 47h44v19c0 14-10 23-22 23S33 80 33 66V47Z" fill="#fff" />
      <path d="M77 54h9c7 0 12 5 12 12s-5 12-12 12h-9" fill="none" stroke="#fff" strokeWidth="8" />
      <ellipse cx="55" cy="48" fill="#8c5730" rx="23" ry="8" />
      <ellipse cx="55" cy="45" fill="#c98a4a" rx="21" ry="6" />
      <path d="M45 33c-5-7 4-11-1-17M60 34c-6-7 4-12-1-18M74 35c-5-7 4-10 0-16" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="4" opacity=".82" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48">
      <rect x="10" y="12" width="28" height="28" rx="6" />
      <path d="M16 8v8M32 8v8M10 20h28M17 28h4M27 28h4M17 34h4" />
    </svg>
  );
}

function StarterBenefitIcon({ type }: { type: "bolt" | "shield" }) {
  if (type === "shield") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M12 3 19 6v5.4c0 4.1-2.7 7.8-7 9.6-4.3-1.8-7-5.5-7-9.6V6l7-3Z" />
        <path d="m9.5 12 1.7 1.7 3.5-4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" />
    </svg>
  );
}

function StarterStarIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.2L12 17.4 6.4 20.3l1.1-6.2L2.9 9.6l6.3-.9L12 3Z" />
    </svg>
  );
}

function StarterRobot() {
  return (
    <svg
      aria-hidden="true"
      className={styles.starterRobot}
      focusable="false"
      viewBox="0 0 190 190"
    >
      <defs>
        <linearGradient id="starter-robot-shadow" x1="28" x2="156" y1="26" y2="162">
          <stop stopColor="#efe8ff" />
          <stop offset="1" stopColor="#dbe9ff" />
        </linearGradient>
        <linearGradient id="starter-robot-accent" x1="52" x2="150" y1="34" y2="154">
          <stop stopColor="#7d5cff" />
          <stop offset="1" stopColor="#3d78ff" />
        </linearGradient>
      </defs>
      <circle cx="105" cy="104" r="74" fill="url(#starter-robot-shadow)" opacity=".78" />
      <path
        d="M62 74c5-30 31-48 63-41 29 6 48 30 44 59-5 32-35 51-70 42-28-7-47-31-41-61Z"
        fill="#fff"
      />
      <path
        d="M68 74c6-23 27-37 53-32 23 5 39 24 35 47-5 25-29 39-56 32-23-6-37-26-32-47Z"
        fill="url(#starter-robot-accent)"
        opacity=".92"
      />
      <rect x="81" y="61" width="63" height="46" rx="22" fill="#111943" />
      <path d="M94 83c4 4 8 4 12 0M124 83c4 4 8 4 12 0" fill="none" stroke="#52e3ff" strokeLinecap="round" strokeWidth="5" />
      <path d="M57 103c-19 5-29 23-22 41 4 11 12 17 24 19" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="14" />
      <path d="M59 112c-12 4-17 15-13 26" fill="none" stroke="#7d5cff" strokeLinecap="round" strokeWidth="8" opacity=".82" />
      <path d="M54 144c2-11 12-18 22-16" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="12" />
      <path d="M159 65h11M50 50l-9-12M42 69l-14-3" fill="none" stroke="#9d88ff" strokeLinecap="round" strokeWidth="8" opacity=".72" />
      <path d="M159 131h.1M37 91h.1M151 31h.1" fill="none" stroke="#b7a7ff" strokeLinecap="round" strokeWidth="9" />
    </svg>
  );
}

export default function StartPageClient({
  aiProgress,
  fallbackContinueStudy,
  userEmail,
  userImage,
  userName,
}: StartPageClientProps) {
  const name = displayName(userName, userEmail);
  const isSignedIn = Boolean(userEmail.trim() || userName.trim());
  const [continueStudy, setContinueStudy] = useState(fallbackContinueStudy);
  const [heroAvatar, setHeroAvatar] = useState({
    failed: false,
    src: userImage,
  });
  const challengeGoal = Math.max(aiProgress.challengeGoal, 1);
  const challengeCompleted = clampCount(
    aiProgress.challengeCompleted,
    challengeGoal
  );
  const challengeRemaining = Math.max(challengeGoal - challengeCompleted, 0);
  const challengeRewardText =
    challengeRemaining > 0
      ? `再完成 ${challengeRemaining} 句，即可解锁`
      : "已解锁";
  const continuePercent = getPercent(continueStudy.completed, continueStudy.total);

  useEffect(() => {
    setContinueStudy(createContinueStudyFromStorage(fallbackContinueStudy));
  }, [fallbackContinueStudy]);

  useEffect(() => {
    const identifier = userEmail || userName || "local-user";
    const timer = window.setTimeout(() => {
      try {
        const savedAvatar = window.localStorage.getItem(
          getAccountAvatarStorageKey(identifier)
        );
        setHeroAvatar({ failed: false, src: savedAvatar || userImage });
      } catch {
        setHeroAvatar({ failed: false, src: userImage });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [userEmail, userImage, userName]);

  const continueProgressStyle = useMemo(
    () => ({ "--progress-percent": `${continuePercent}%` }) as CSSProperties,
    [continuePercent]
  );
  const menuHref = isSignedIn ? "/account" : "/menu";
  const menuLabel = isSignedIn ? "打开账户界面" : "打开游客菜单";
  const isNewUser =
    isSignedIn &&
    aiProgress.todayCompleted <= 0 &&
    aiProgress.totalCompleted <= 0 &&
    aiProgress.streakDays <= 0;
  const showStarterHome = !isSignedIn || isNewUser;
  const starterInitials = getAvatarInitials(name, userEmail, isSignedIn);

  if (showStarterHome) {
    return (
      <main className={styles.starterPage}>
        <section
          className={styles.starterPhone}
          aria-label="游客和新用户的 SpeakFlow 学习首页"
        >
          <header className={styles.starterTopBar}>
            <Link
              href={menuHref}
              className={styles.starterMenuButton}
              aria-label={menuLabel}
            >
              <MenuIcon />
            </Link>
            <Link href="/start" className={styles.starterBrand} aria-label="SpeakFlow 首页">
              <span className={styles.starterBrandIcon}>
                <Image
                  alt=""
                  height={64}
                  priority
                  sizes="54px"
                  src="/brand/speakflow-app-icon.png"
                  width={64}
                />
              </span>
              <span className={styles.starterBrandCopy}>
                <strong>SpeakFlow</strong>
                <small>AI 英语口语练习伙伴</small>
              </span>
            </Link>
            {isSignedIn && heroAvatar.src && !heroAvatar.failed ? (
              <span className={styles.starterAvatar} aria-label="用户头像">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroAvatar.src}
                  alt=""
                  draggable={false}
                  onError={() =>
                    setHeroAvatar((current) => ({ ...current, failed: true }))
                  }
                />
              </span>
            ) : (
              <span
                className={styles.starterAvatar}
                aria-label={isSignedIn ? "用户头像" : "游客体验标识"}
              >
                {starterInitials}
              </span>
            )}
          </header>

          <section className={styles.starterHero} aria-labelledby="starter-title">
            <div className={styles.starterHeroCopy}>
              <h1 id="starter-title">
                你好，
                <br />
                先体验一下 <span>SpeakFlow。</span>
                <span aria-hidden="true">👋</span>
              </h1>
              <div className={styles.starterBenefitRow} aria-label="体验说明">
                <span>
                  <StarterBenefitIcon type="bolt" />
                  30 秒开始开口说英语
                </span>
                <i aria-hidden="true" />
                <span>
                  <StarterBenefitIcon type="shield" />
                  无需注册即可体验
                </span>
              </div>
            </div>
            <StarterRobot />
          </section>

          <section
            className={styles.starterRecommended}
            aria-labelledby="starter-recommended-title"
          >
            <div className={styles.starterRibbon}>
              <StarterStarIcon />
              推荐体验
            </div>
            <div className={styles.starterRecommendedBody}>
              <div className={styles.starterRecommendedCopy}>
                <h2 id="starter-recommended-title">
                  从 <span>AI 引导表达</span> 开始
                </h2>
                <p>AI 会一步一步引导你表达想法，轻松开口，自信说英语。</p>
              </div>
              <div className={styles.starterBubbleArt} aria-hidden="true">
                <span />
                <small />
              </div>
              <Link
                className={styles.starterPrimaryCta}
                href="/ai-guided-expression/step-1"
              >
                <span className={styles.starterCtaIcon}>
                  <PracticeIcon type="mic" />
                </span>
                开始 AI 引导表达
                <span className={styles.starterCtaChevron}>
                  <ChevronIcon />
                </span>
              </Link>
            </div>
          </section>

          <section className={styles.starterMore} aria-labelledby="starter-more-title">
            <div className={styles.starterSectionHeading}>
              <h2 id="starter-more-title">更多练习方式</h2>
              <span>选择适合你的方式</span>
            </div>
            <div className={styles.starterPracticeStack}>
              {starterPracticeCards.map((card) => (
                <Link
                  key={card.href}
                  className={styles.starterPracticeCard}
                  data-tone={card.tone}
                  href={card.href}
                >
                  <span className={styles.starterPracticeIcon}>
                    <PracticeIcon type={card.icon} />
                  </span>
                  <span className={styles.starterPracticeCopy}>
                    <strong>{card.title}</strong>
                    <small>{card.subtitle}</small>
                  </span>
                  <span className={styles.starterPracticeChevron}>
                    <ChevronIcon />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <footer className={styles.starterTrust}>
            <StarterBenefitIcon type="shield" />
            完全免费体验 · 无需注册 · 随时开始
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.phone} aria-label="登录后的 SpeakFlow 首页">
        <header className={styles.topBar}>
          <Link href={menuHref} className={styles.menuButton} aria-label={menuLabel}>
            <MenuIcon />
          </Link>
          <Link href="/start" className={styles.brand} aria-label="SpeakFlow 首页">
            <span className={styles.brandIcon}>
              <Image
                alt=""
                height={64}
                priority
                sizes="48px"
                src="/brand/speakflow-app-icon.png"
                width={64}
              />
            </span>
            <span className={styles.brandCopy}>
              <strong>SpeakFlow</strong>
              <small>AI VOICE PRACTICE</small>
            </span>
          </Link>
        </header>

        <section className={styles.hero} aria-labelledby="start-title">
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>
              {isSignedIn ? (
                <>
                  太好了！<span aria-hidden="true">🎉</span>
                </>
              ) : (
                "你好"
              )}
            </p>
            <h1 id="start-title">
              {isSignedIn ? `欢迎回来 ${name}` : "你好，先体验一下 SpeakFlow"}
            </h1>
            <p className={styles.heroSubcopy}>
              {isSignedIn
                ? "今天也一起大胆开口说英语吧！"
                : "先选一个练习方式，马上开始开口。"}
            </p>
          </div>
          {heroAvatar.src && !heroAvatar.failed ? (
            <span className={styles.heroAvatar} aria-label="用户头像">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroAvatar.src}
                alt=""
                draggable={false}
                onError={() =>
                  setHeroAvatar((current) => ({ ...current, failed: true }))
                }
              />
            </span>
          ) : (
            <StarBuddy />
          )}
        </section>

        <section className={styles.newPractice} aria-labelledby="new-practice-title">
          <div className={styles.sectionHeading}>
            <h2 id="new-practice-title">开始新的练习</h2>
            <p>选择你想要的练习方式</p>
          </div>

          <div className={styles.practiceStack}>
            {practiceCards.map((card) => (
              <Link
                key={card.href}
                className={styles.practiceCard}
                data-tone={card.tone}
                href={card.href}
              >
                <span className={styles.practiceIcon}>
                  <PracticeIcon type={card.icon} />
                </span>
                <span className={styles.practiceCopy}>
                  <strong>{card.title}</strong>
                  <small>{card.subtitle}</small>
                </span>
                <span className={styles.practiceChevron}>
                  <ChevronIcon />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.resumeSection} aria-labelledby="resume-title">
          <div className={styles.sectionHeading}>
            <h2 id="resume-title">继续上次学习</h2>
          </div>

          <Link className={styles.resumeCard} href={continueStudy.href}>
            <span className={styles.resumeVisual}>
              <CoffeeScene />
            </span>
            <span className={styles.resumeContent}>
              <strong>{continueStudy.title}</strong>
              <span className={styles.resumeMeta}>
                <span>{continueStudy.categoryLabel}</span>
                <small>{continueStudy.statusLabel}</small>
              </span>
              <span
                aria-label={`学习进度 ${continueStudy.completed} / ${continueStudy.total} 句`}
                className={styles.resumeProgressRow}
              >
                <span className={styles.progressTrack} style={continueProgressStyle}>
                  <span />
                </span>
                <small>
                  {continueStudy.completed} / {continueStudy.total} 句
                </small>
              </span>
            </span>
            <span className={styles.resumeButton}>继续练习</span>
          </Link>
        </section>

        <Link className={styles.challengeCard} href="/ai-guided-expression/step-1">
          <span className={styles.challengeIcon}>
            <CalendarIcon />
          </span>
          <span className={styles.challengeCopy}>
            <strong>每日挑战</strong>
            <small>
              {challengeRewardText}{" "}
              <span className={styles.badgeReward}>{BEGINNER_BADGE_LABEL}</span>
            </small>
          </span>
          <span className={styles.challengeCount}>
            {challengeCompleted}/{challengeGoal}
          </span>
          <span className={styles.challengeChevron}>
            <ChevronIcon />
          </span>
        </Link>
      </section>
    </main>
  );
}
