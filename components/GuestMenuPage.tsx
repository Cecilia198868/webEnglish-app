import Image from "next/image";
import Link from "next/link";
import styles from "./GuestMenuPage.module.css";

type MenuTone = "home" | "login" | "pro" | "help" | "about";
type MenuIconName = "home" | "login" | "star" | "help" | "info";
export type GuestMenuPanel = "help" | "about";

const guestMenuRows: Array<{
  description: string;
  href: string;
  icon: MenuIconName;
  label: string;
  tone: MenuTone;
}> = [
  {
    description: "回到首页，继续你的学习",
    href: "/start",
    icon: "home",
    label: "首页",
    tone: "home",
  },
  {
    description: "登录你的账号，同步学习进度",
    href: "/login",
    icon: "login",
    label: "登录",
    tone: "login",
  },
  {
    description: "常见问题与使用指南",
    href: "/menu?panel=help",
    icon: "help",
    label: "帮助",
    tone: "help",
  },
  {
    description: "了解 SpeakFlow",
    href: "/menu?panel=about",
    icon: "info",
    label: "关于",
    tone: "about",
  },
];

const guestMenuPanels: Record<
  GuestMenuPanel,
  {
    description: string;
    icon: MenuIconName;
    items: string[];
    title: string;
    tone: MenuTone;
  }
> = {
  help: {
    description: "这里整理了常见问题和使用提示，帮助你更顺畅地开始练习。",
    icon: "help",
    items: [
      "点击首页可以回到学习首页，继续游客体验。",
      "登录账号后，可以同步学习进度和表达收藏。",
      "麦克风无法使用时，请检查浏览器或系统的录音权限。",
    ],
    title: "帮助",
    tone: "help",
  },
  about: {
    description: "SpeakFlow 专注帮你把真实想法变成自然、地道、能开口说出来的英语。",
    icon: "info",
    items: [
      "用 AI 引导表达，把中文想法一步步变成自然英文。",
      "通过 100 个口语句型和经典场景，反复练习高频表达。",
      "把新表达收藏起来，持续复习，慢慢形成自己的表达库。",
    ],
    title: "关于 SpeakFlow",
    tone: "about",
  },
};

function MenuIcon({ name }: { name: MenuIconName }) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="m5.5 15.4 10.5-9 10.5 9v11a2.2 2.2 0 0 1-2.2 2.2h-5.1v-8.3h-7.4v8.3H7.7a2.2 2.2 0 0 1-2.2-2.2v-11Z" />
      </svg>
    );
  }

  if (name === "login") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle cx="16" cy="11.5" r="5.3" />
        <path d="M6.5 27c1.8-5.4 5.2-8.2 9.5-8.2s7.7 2.8 9.5 8.2" />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="m16 4.4 3.4 7 7.7 1.1-5.6 5.4 1.3 7.7L16 22l-6.8 3.6 1.3-7.7-5.6-5.4 7.7-1.1L16 4.4Z" />
      </svg>
    );
  }

  if (name === "help") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M12.2 11.2a5 5 0 0 1 9.7 1.8c0 3.6-4.1 4.4-4.1 7.5" />
        <path d="M16.8 25.5h.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="11.5" />
      <path d="M16 14.5v8M16 9.5h.1" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export default function GuestMenuPage({
  activePanel = null,
}: {
  activePanel?: GuestMenuPanel | null;
}) {
  const panel = activePanel ? guestMenuPanels[activePanel] : null;

  return (
    <main className={styles.page}>
      <section className={styles.phone} aria-label="SpeakFlow 游客菜单">
        <header className={styles.hero}>
          <div className={styles.brandRow}>
            <Link href="/" className={styles.brand} aria-label="SpeakFlow 首页">
              <span className={styles.brandIcon}>
                <Image
                  alt=""
                  height={64}
                  preload
                  sizes="50px"
                  src="/brand/speakflow-app-icon.png"
                  width={64}
                />
              </span>
              <span className={styles.brandText}>SpeakFlow</span>
            </Link>
          </div>

          <div className={styles.heroCopy}>
            <h1>流利表达，自信开口</h1>
            <p>AI 陪你练习地道英语口语</p>
          </div>

          <span aria-hidden="true" className={styles.decorDot} />
          <span aria-hidden="true" className={styles.decorDotSmall} />
          <span aria-hidden="true" className={styles.bubbleDots}>
            <span />
            <span />
            <span />
          </span>
        </header>

        {panel ? (
          <section className={styles.panel} aria-labelledby="guest-menu-panel-title">
            <Link href="/menu" className={styles.panelBack} aria-label="返回游客菜单">
              <ChevronIcon />
              <span>返回</span>
            </Link>
            <div className={styles.panelHeader}>
              <span className={styles.rowIcon} data-tone={panel.tone}>
                <MenuIcon name={panel.icon} />
              </span>
              <div>
                <h2 id="guest-menu-panel-title">{panel.title}</h2>
                <p>{panel.description}</p>
              </div>
            </div>
            <ul className={styles.panelList}>
              {panel.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : (
          <nav className={styles.menuList} aria-label="游客导航">
            {guestMenuRows.map((row) => (
              <Link key={row.label} href={row.href} className={styles.menuRow}>
                <span className={styles.rowIcon} data-tone={row.tone}>
                  <MenuIcon name={row.icon} />
                </span>
                <span className={styles.rowCopy}>
                  <strong>{row.label}</strong>
                  <small>{row.description}</small>
                </span>
                <span className={styles.chevron}>
                  <ChevronIcon />
                </span>
              </Link>
            ))}
          </nav>
        )}
      </section>
    </main>
  );
}
