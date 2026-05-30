"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionResponse = {
  user?: {
    avatarUrl?: string | null;
    image?: string | null;
    photoURL?: string | null;
    photoUrl?: string | null;
    picture?: string | null;
  } | null;
};

type MenuEntry = {
  tone: "ai" | "new" | "classic";
  title: string;
  badge?: string;
  primary: string;
  secondary: string;
  route: string;
  ariaLabel: string;
};

const MENU_ENTRIES: MenuEntry[] = [
  {
    tone: "ai",
    title: "AI引导表达（推荐）",
    badge: "推荐",
    primary: "AI一步一步引导你开口",
    secondary: "从想中文 → 说英文 → 更地道表达",
    route: "/ai-guided-expression/step-1",
    ariaLabel: "进入AI引导表达学习第一页",
  },
  {
    tone: "new",
    title: "新表达",
    primary: "收藏、学习和复习你的常用表达",
    secondary: "打造你的专属表达库",
    route: "/speak-english?menu=1&submenu=expression",
    ariaLabel: "进入新表达下一级菜单",
  },
  {
    tone: "classic",
    title: "经典场景口语练习",
    primary: "按真实生活场景练高频口语",
    secondary: "随时随地，开口自信说",
    route: "/speak-english?menu=1&submenu=classic",
    ariaLabel: "进入经典场景口语练习下一级菜单",
  },
];

function getAvatarSrc(user?: SessionResponse["user"]) {
  return (
    user?.avatarUrl ||
    user?.image ||
    user?.photoURL ||
    user?.photoUrl ||
    user?.picture ||
    "/default-avatar.png"
  );
}

function MenuGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

function ChevronGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function WandGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="m15 34 19-19" />
      <path d="m28 9 11 11" />
      <path d="M10 13h4M12 11v4M32 31h5M34.5 28.5v5M18 6l1.8 4.2L24 12l-4.2 1.8L18 18l-1.8-4.2L12 12l4.2-1.8L18 6Z" />
    </svg>
  );
}

function ExpressionGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M12 12h24a6 6 0 0 1 6 6v11a6 6 0 0 1-6 6H22l-9 7v-7h-1a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z" />
      <path d="M17 29 22 17h2l5 12M19 25h8M34 29V18" />
    </svg>
  );
}

function HeadphoneGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M10 28v-5a14 14 0 0 1 28 0v5" />
      <path d="M10 27a5 5 0 0 1 5-5h2v16h-2a5 5 0 0 1-5-5v-6ZM38 27a5 5 0 0 0-5-5h-2v16h2a5 5 0 0 0 5-5v-6Z" />
    </svg>
  );
}

function CardIcon({ tone }: { tone: MenuEntry["tone"] }) {
  if (tone === "new") {
    return <ExpressionGlyph />;
  }

  if (tone === "classic") {
    return <HeadphoneGlyph />;
  }

  return <WandGlyph />;
}

export default function MenuPage() {
  const router = useRouter();
  const [avatarSrc, setAvatarSrc] = useState("/default-avatar.png");

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const session = (await response.json()) as SessionResponse;

        if (!cancelled) {
          setAvatarSrc(getAvatarSrc(session.user));
        }
      } catch {
        if (!cancelled) {
          setAvatarSrc("/default-avatar.png");
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="sf-menu-page">
      <section className="sf-menu-page-phone" aria-label="SpeakFlow主菜单">
        <div className="sf-menu-page-frame">
          <header className="sf-menu-page-header">
            <button
              type="button"
              aria-label="进入自由学习第一页"
              onClick={() => router.push("/free-study/step-1")}
              className="sf-menu-page-menu-button"
            >
              <MenuGlyph />
            </button>

            <div className="sf-menu-page-brand" aria-label="SpeakFlow AI Voice Practice">
              <span aria-hidden="true" className="sf-menu-page-logo" />
              <span className="sf-menu-page-brand-copy">
                <span className="sf-menu-page-brand-title">SpeakFlow</span>
                <span className="sf-menu-page-brand-subtitle">AI VOICE PRACTICE</span>
              </span>
            </div>

            <button
              type="button"
              aria-label="打开账户界面"
              onClick={() => router.push("/account")}
              className="sf-menu-page-avatar-button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt=""
                className="sf-menu-page-avatar-image"
                onError={() => setAvatarSrc("/default-avatar.png")}
              />
              <span aria-hidden="true" className="sf-menu-page-avatar-dot" />
            </button>
          </header>

          <nav className="sf-menu-page-card-list" aria-label="学习入口">
            {MENU_ENTRIES.map((entry) => (
              <button
                key={entry.tone}
                type="button"
                aria-label={entry.ariaLabel}
                onClick={() => router.push(entry.route)}
                className={`sf-menu-page-card sf-menu-page-card-${entry.tone}`}
              >
                <span aria-hidden="true" className="sf-menu-page-card-mark">
                  <CardIcon tone={entry.tone} />
                </span>

                <span className="sf-menu-page-card-copy">
                  <span className="sf-menu-page-card-title-row">
                    <span className="sf-menu-page-card-title">{entry.title}</span>
                    {entry.badge ? (
                      <span className="sf-menu-page-card-badge">{entry.badge}</span>
                    ) : null}
                  </span>
                  <span aria-hidden="true" className="sf-menu-page-card-rule" />
                  <span className="sf-menu-page-card-text">{entry.primary}</span>
                  <span className="sf-menu-page-card-text">{entry.secondary}</span>
                </span>

                <span aria-hidden="true" className="sf-menu-page-card-arrow">
                  <ChevronGlyph />
                </span>
              </button>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
