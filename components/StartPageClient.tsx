"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./StartPageClient.module.css";

type StartPageClientProps = {
  userEmail: string;
  userImage: string;
  userName: string;
};

const continueCards = [
  {
    href: "/ai-guided-expression/step-1",
    title: "AI 引导表达",
    subtitle: "不知道说什么？让 AI 帮你想",
    icon: "voice",
    tone: "purple",
  },
  {
    href: "/classic-scenes",
    title: "经典场景口语练习",
    subtitle: "覆盖出国生活、工作、日常等场景",
    icon: "scene",
    tone: "cyan",
  },
  {
    href: "/new-expressions",
    title: "新表达",
    subtitle: "复习和巩固你学到的地道表达",
    icon: "bookmark",
    tone: "pink",
  },
] as const;

const tabs = [
  { href: "/start", label: "首页", icon: "home", active: true },
  { href: "/classic-scenes", label: "场景", icon: "scene", active: false },
  { href: "/new-expressions", label: "新表达", icon: "spark", active: false },
  { href: "/account", label: "我的", icon: "user", active: false },
] as const;

function ContinueIcon({ type }: { type: (typeof continueCards)[number]["icon"] }) {
  if (type === "scene") {
    return (
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M10 9h16v18H10z" />
        <path d="M13 13h10M13 18h10M13 23h6" />
      </svg>
    );
  }

  if (type === "bookmark") {
    return (
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M11 8h14v21l-7-4-7 4V8Z" />
        <path d="M16 14h4M16 18h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <path d="M18 7a4.5 4.5 0 0 0-4.5 4.5v7a4.5 4.5 0 1 0 9 0v-7A4.5 4.5 0 0 0 18 7Z" />
      <path d="M10 18a8 8 0 0 0 16 0M18 26v4M14 30h8" />
    </svg>
  );
}

function TabIcon({ type }: { type: (typeof tabs)[number]["icon"] }) {
  if (type === "scene") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M9 7h14v18H9z" />
        <path d="M12 12h8M12 16h8M12 20h5" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 5 18.8 13.2 27 16l-8.2 2.8L16 27l-2.8-8.2L5 16l8.2-2.8L16 5Z" />
      </svg>
    );
  }

  if (type === "user") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z" />
        <path d="M7 27c1.3-5.1 4.3-7.6 9-7.6s7.7 2.5 9 7.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 15 16 6l11 9v11h-7v-7h-8v7H5V15Z" />
    </svg>
  );
}

function displayName(userName: string, userEmail: string) {
  const cleaned = userName.trim();
  if (cleaned) return cleaned.split(/\s+/)[0] || cleaned;

  const localPart = userEmail.split("@")[0]?.trim();
  return localPart || "Cecilia";
}

export default function StartPageClient({
  userEmail,
  userImage,
  userName,
}: StartPageClientProps) {
  const name = displayName(userName, userEmail);

  return (
    <main className={styles.page}>
      <section className={styles.phone} aria-label="登录后的 SpeakFlow 首页">
        <div className={styles.statusBar} aria-hidden="true">
          <span>10:15</span>
          <span>⌁ ◒ ▰</span>
        </div>

        <header className={styles.header}>
          <Link href="/account" className={styles.proPill}>
            <span aria-hidden="true">◆</span>
            Pro
          </Link>
        </header>

        <section className={styles.greeting}>
          <div>
            <p>太好了！<span aria-hidden="true">🎉</span></p>
            <h1>欢迎回来 {name}</h1>
            <small>继续你的英语练习吧</small>
          </div>
          <Link href="/account" className={styles.avatar} aria-label="打开我的页面">
            {userImage ? (
              <Image
                src={userImage}
                alt={userEmail}
                width={72}
                height={72}
                sizes="72px"
              />
            ) : (
              <span>{name.slice(0, 1).toUpperCase()}</span>
            )}
          </Link>
        </section>

        <section className={styles.progressCard} aria-label="今日学习进度">
          <div>
            <span>今日学习进度</span>
            <strong>3 <small>/ 5 句</small></strong>
            <p>再练习 2 句即可完成每日目标</p>
            <div className={styles.progressTrack} aria-hidden="true">
              <span />
            </div>
          </div>
          <span className={styles.trophy} aria-hidden="true">🏆</span>
        </section>

        <h2 className={styles.sectionTitle}>继续练习</h2>

        <div className={styles.cardStack}>
          {continueCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`${styles.continueCard} ${styles[card.tone]}`}
            >
              <span className={styles.cardIcon}>
                <ContinueIcon type={card.icon} />
              </span>
              <span className={styles.cardCopy}>
                <strong>{card.title}</strong>
                <small>{card.subtitle}</small>
              </span>
              <span className={styles.chevron} aria-hidden="true">›</span>
            </Link>
          ))}
        </div>

        <nav className={styles.bottomNav} aria-label="主导航">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={tab.active ? styles.activeTab : styles.tab}
            >
              <TabIcon type={tab.icon} />
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
