"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";
import styles from "./ClassicScenesMenuPage.module.css";

type SessionResponse = {
  user?: {
    avatarUrl?: string | null;
    image?: string | null;
    photoURL?: string | null;
    photoUrl?: string | null;
    picture?: string | null;
  } | null;
};

type SceneCardIcon =
  | "bank"
  | "bag"
  | "utensils"
  | "car"
  | "home"
  | "shield"
  | "wrench"
  | "graduation"
  | "ai"
  | "chat";

type SceneCard = {
  accent: string;
  badge?: string;
  count?: number;
  description: string;
  href?: string;
  icon: SceneCardIcon;
  id: string;
  status?: string;
  title: string;
};

const sceneCards: SceneCard[] = [
  {
    id: "finance-government",
    title: "金融与行政事务",
    description: "银行、支付、税务、签证等场景",
    count: 70,
    href: "/classic-scenes/bank-finance",
    icon: "bank",
    accent: "#7f401f",
  },
  {
    id: "shopping-consumption",
    title: "购物与消费",
    description: "购物、退换、支付、讨价还价",
    status: "课程整理中",
    icon: "bag",
    accent: "#8a4a25",
  },
  {
    id: "restaurant-takeout",
    title: "餐饮与外卖",
    description: "点餐、外卖、咖啡、餐厅沟通",
    status: "课程整理中",
    icon: "utensils",
    accent: "#8b431d",
  },
  {
    id: "transportation-travel",
    title: "交通与出行",
    description: "机场、地铁、打车、问路",
    status: "课程整理中",
    icon: "car",
    accent: "#8a4a25",
  },
  {
    id: "housing-home",
    title: "住宿与家居",
    description: "酒店入住、租房、家居生活",
    status: "课程整理中",
    icon: "home",
    accent: "#7f401f",
  },
  {
    id: "health-medical",
    title: "健康与医疗",
    description: "看病、买药、体检、健康咨询",
    status: "课程整理中",
    icon: "shield",
    accent: "#8b431d",
  },
  {
    id: "service-repair",
    title: "服务与维修",
    description: "快递、售后、维修、美容美发",
    status: "课程整理中",
    icon: "wrench",
    accent: "#7f401f",
  },
  {
    id: "education-work-social",
    title: "教育、工作与社交生活",
    description: "工作沟通、面试、社交、学校生活",
    status: "课程整理中",
    icon: "graduation",
    accent: "#8a4a25",
  },
  {
    id: "guided",
    title: "AI 引导表达",
    description: "根据你的想法，AI 帮你组织更地道的表达",
    badge: "NEW",
    href: "/ai-guided-expression/step-1",
    icon: "ai",
    accent: "#7f401f",
  },
  {
    id: "expression",
    title: "新表达",
    description: "学习最常用表达，让你的英语更自然",
    badge: "NEW",
    href: "/new-expressions",
    icon: "chat",
    accent: "#7f401f",
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M8 11h16M8 16h16M8 21h16" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m7 9 5 5 5-5" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function CardIcon({ icon }: { icon: SceneCardIcon }) {
  if (icon === "ai") {
    return <span className={styles.aiLetters}>AI</span>;
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {icon === "bank" && (
        <>
          <path d="M5 13h22L16 6 5 13Z" />
          <path d="M8 14v10M14 14v10M20 14v10M26 14v10M5 26h22" />
        </>
      )}
      {icon === "bag" && (
        <>
          <path d="M8 12h16l-1 15H9L8 12Z" />
          <path d="M12 12a4 4 0 0 1 8 0" />
        </>
      )}
      {icon === "utensils" && (
        <>
          <path d="M9 6v9M6 6v7a3 3 0 0 0 6 0V6M18 6v20M24 7c-3 2-5 6-5 11h5" />
        </>
      )}
      {icon === "car" && (
        <>
          <path d="m7 18 2-6h14l2 6" />
          <path d="M6 18h20v7H6v-7Z" />
          <path d="M10 25v2M22 25v2" />
          <circle cx="11" cy="21" r="1.6" />
          <circle cx="21" cy="21" r="1.6" />
        </>
      )}
      {icon === "home" && (
        <>
          <path d="m5 16 11-9 11 9" />
          <path d="M8 15v12h16V15" />
          <path d="M13 27v-8h6v8" />
        </>
      )}
      {icon === "shield" && (
        <>
          <path d="M16 5 26 9v7c0 6-4 10-10 12C10 26 6 22 6 16V9l10-4Z" />
          <path d="M16 11v10M11 16h10" />
        </>
      )}
      {icon === "wrench" && (
        <path d="M21 6a7 7 0 0 0-8 9L6 22a3 3 0 1 0 4 4l7-7a7 7 0 0 0 9-8l-5 5-4-4 5-5Z" />
      )}
      {icon === "graduation" && (
        <>
          <path d="m4 12 12-6 12 6-12 6L4 12Z" />
          <path d="M9 15v6c4 3 10 3 14 0v-6" />
          <path d="M27 13v8" />
        </>
      )}
      {icon === "chat" && (
        <>
          <path d="M7 9h18v12H13l-6 5V9Z" />
          <circle cx="13" cy="15" r="1.2" />
          <circle cx="17" cy="15" r="1.2" />
          <circle cx="21" cy="15" r="1.2" />
        </>
      )}
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className={styles.heroVisual} aria-hidden="true">
      <span className={`${styles.spark} ${styles.sparkOne}`}>✦</span>
      <span className={`${styles.spark} ${styles.sparkTwo}`}>✦</span>
      <span className={styles.backPlate} />
      <span className={styles.chatPlate}>
        <span className={styles.chatBubble}>
          <span />
          <span />
          <span />
        </span>
      </span>
    </div>
  );
}

export default function ClassicScenesMenuPage() {
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
        if (!cancelled) setAvatarSrc("/default-avatar.png");
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const goHome = () => router.push("/menu");
  const openAccount = () => router.push("/account");
  const openCard = (card: SceneCard) => {
    if (card.href) router.push(card.href);
  };

  return (
    <main className={styles.pageShell}>
      <section className={styles.panel} aria-label="经典场景口语练习一级菜单">
        <header className={styles.header}>
          <button
            className={styles.menuButton}
            type="button"
            aria-label="回到主菜单"
            onClick={goHome}
          >
            <MenuIcon />
          </button>

          <div className={styles.brand}>
            <SpeakFlowBrandMark className={styles.brandMark} />
            <div className={styles.brandText}>
              <strong>SpeakFlow</strong>
              <span>VOICE PRACTICE</span>
            </div>
          </div>

          <button
            className={styles.avatarButton}
            type="button"
            aria-label="进入账户界面"
            onClick={openAccount}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt=""
              className={styles.avatar}
              onError={() => setAvatarSrc("/default-avatar.png")}
              draggable={false}
            />
            <ChevronDown />
          </button>
        </header>

        <section className={styles.hero}>
          <button className={styles.backLink} type="button" onClick={goHome}>
            <span aria-hidden="true">←</span>
            返回上一级
          </button>
          <div className={styles.heroText}>
            <h1>经典场景口语练习</h1>
            <p>覆盖日常生活场景，按分类练高频表达</p>
          </div>
          <HeroVisual />
        </section>

        <section className={styles.cardGrid} aria-label="经典场景分类">
          {sceneCards.map((card) => {
            const tileStyle = { "--card-accent": card.accent } as CSSProperties;
            const content = (
              <>
                {card.badge && <span className={styles.badge}>{card.badge}</span>}
                <span className={styles.iconTile} aria-hidden="true">
                  <CardIcon icon={card.icon} />
                </span>
                <span className={styles.cardCopy}>
                  <strong>{card.title}</strong>
                  <span>{card.description}</span>
                </span>
                <span className={styles.cardMeta}>
                  {typeof card.count === "number"
                    ? `${card.count} 个课程`
                    : card.status}
                </span>
                <span className={styles.arrowCircle} aria-hidden="true">
                  <ArrowRight />
                </span>
              </>
            );

            if (!card.href) {
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`${styles.sceneCard} ${styles.pendingCard}`}
                  style={tileStyle}
                  onClick={() => openCard(card)}
                  aria-label={`${card.title}，${card.status || "课程整理中"}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <button
                key={card.id}
                type="button"
                className={styles.sceneCard}
                style={tileStyle}
                onClick={() => openCard(card)}
                aria-label={`进入${card.title}`}
              >
                {content}
              </button>
            );
          })}
        </section>
      </section>
    </main>
  );
}
