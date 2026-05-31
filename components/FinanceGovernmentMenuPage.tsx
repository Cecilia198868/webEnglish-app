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

type FinanceCardIcon =
  | "bank"
  | "id"
  | "government"
  | "car"
  | "shield"
  | "cone"
  | "document"
  | "grid";

type FinanceCard = {
  accent: string;
  count: number;
  description: string;
  href: string;
  icon: FinanceCardIcon;
  id: string;
  title: string;
};

const financeCards: FinanceCard[] = [
  {
    id: "bank-finance",
    title: "银行与金融交易",
    description: "开户、存款、取款、转账、等常用表达",
    count: 20,
    href: "/classic-scenes/bank-finance",
    icon: "bank",
    accent: "#7f401f",
  },
  {
    id: "identity-immigration",
    title: "身份与移民相关",
    description: "护照、签证、居留申请、移民面试等场景",
    count: 8,
    href: "/study/government_apply_ssn_zh",
    icon: "id",
    accent: "#7f401f",
  },
  {
    id: "public-services",
    title: "政府福利与公共服务",
    description: "社保、失业救济、公共服务申请等表达",
    count: 10,
    href: "/study/government_snap_benefits_zh",
    icon: "government",
    accent: "#7f401f",
  },
  {
    id: "driver-vehicle",
    title: "驾照与车辆管理",
    description: "驾照考试、换证、车辆注册、车检等场景",
    count: 16,
    href: "/study/government_state_id_driver_license_zh",
    icon: "car",
    accent: "#7f401f",
  },
  {
    id: "insurance-consulting",
    title: "保险咨询",
    description: "咨询保险、购买保险、理赔、保险条款解读等",
    count: 10,
    href: "/study/driver_new_driver_car_insurance_zh",
    icon: "shield",
    accent: "#7f401f",
  },
  {
    id: "traffic-safety",
    title: "交通安全",
    description: "交通规则、违章处理、罚款、交通事故等场景",
    count: 8,
    href: "/study/driver_accident_insurance_claim_zh",
    icon: "cone",
    accent: "#7f401f",
  },
  {
    id: "tax-government-forms",
    title: "税务与政府表格",
    description: "报税、税务咨询、填写政府表格等常用表达",
    count: 10,
    href: "/study/government_apply_itin_zh",
    icon: "document",
    accent: "#7f401f",
  },
  {
    id: "all-finance",
    title: "查看全部",
    description: "从金融、身份、政府、车辆等多领域扩展更多场景",
    count: 83,
    href: "/classic-scenes/bank-finance",
    icon: "grid",
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

function CardIcon({ icon }: { icon: FinanceCardIcon }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {icon === "bank" && (
        <>
          <path d="M5 13h22L16 6 5 13Z" />
          <path d="M8 14v10M14 14v10M20 14v10M26 14v10M5 26h22" />
        </>
      )}
      {icon === "id" && (
        <>
          <path d="M9 5h14v22H9V5Z" />
          <circle cx="16" cy="13" r="3.1" />
          <path d="M11.5 23c1.1-3 7.9-3 9 0M12 8h8" />
        </>
      )}
      {icon === "government" && (
        <>
          <path d="M5 13h22L16 6 5 13Z" />
          <path d="M8 14v10M14 14v10M20 14v10M26 14v10M5 26h22" />
        </>
      )}
      {icon === "car" && (
        <>
          <path d="m7 18 2-6h14l2 6" />
          <path d="M6 18h20v7H6v-7Z" />
          <circle cx="11" cy="21" r="1.6" />
          <circle cx="21" cy="21" r="1.6" />
        </>
      )}
      {icon === "shield" && (
        <>
          <path d="M16 5 26 9v7c0 6-4 10-10 12C10 26 6 22 6 16V9l10-4Z" />
          <path d="M16 11v10M11 16h10" />
        </>
      )}
      {icon === "cone" && (
        <>
          <path d="M13 6h6l5 20H8l5-20Z" />
          <path d="M11 17h10M10 22h12" />
        </>
      )}
      {icon === "document" && (
        <>
          <path d="M9 5h10l5 5v17H9V5Z" />
          <path d="M19 5v6h5M13 15h7M13 20h7M13 24h5" />
        </>
      )}
      {icon === "grid" && (
        <>
          <rect x="7" y="7" width="7" height="7" rx="1.5" />
          <rect x="18" y="7" width="7" height="7" rx="1.5" />
          <rect x="7" y="18" width="7" height="7" rx="1.5" />
          <rect x="18" y="18" width="7" height="7" rx="1.5" />
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

export default function FinanceGovernmentMenuPage() {
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
  const goBack = () => router.push("/classic-scenes");
  const openAccount = () => router.push("/account");

  return (
    <main className={styles.pageShell}>
      <section className={styles.panel} aria-label="金融与行政事务二级菜单">
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
          <button className={styles.backLink} type="button" onClick={goBack}>
            <span aria-hidden="true">←</span>
            返回上一级
          </button>
          <div className={styles.heroText}>
            <h1>金融与行政事务</h1>
            <p>银行、支付、税务、签证等场景</p>
          </div>
          <HeroVisual />
        </section>

        <section className={styles.cardGrid} aria-label="金融与行政事务分类">
          {financeCards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={styles.sceneCard}
              style={{ "--card-accent": card.accent } as CSSProperties}
              onClick={() => router.push(card.href)}
              aria-label={`进入${card.title}`}
            >
              <span className={styles.iconTile} aria-hidden="true">
                <CardIcon icon={card.icon} />
              </span>
              <span className={styles.cardCopy}>
                <strong>{card.title}</strong>
                <span>{card.description}</span>
              </span>
              <span className={styles.cardMeta}>{card.count} 个课程</span>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowRight />
              </span>
            </button>
          ))}
        </section>
      </section>
    </main>
  );
}
