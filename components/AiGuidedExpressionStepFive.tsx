"use client";

import type { ReactNode } from "react";
import HomeMenuIcon from "@/components/HomeMenuIcon";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";

type AiGuidedExpressionStepFiveProps = {
  userEnglishText: string;
  nextChineseText: string;
  isLoadingNextChinese?: boolean;
  expressions: string[];
  selectedExpressionIndex: number;
  avatarSrc?: string;
  avatarAlt?: string;
  headerAddon?: ReactNode;
  accountLabel?: string;
  menuLabel?: string;
  onMenuClick: () => void;
  onRetryEnglish: () => void;
  onUseNextChinese: () => void;
  onChangeNextChinese: () => void;
  onAccountClick: () => void;
  onAvatarError?: () => void;
  onPlayExpression: (index: number, rate?: number) => void;
  onSelectExpression: (index: number) => void;
  onFollowPractice: () => void;
  onSlowPlayback: () => void;
  renderExpressionText?: (
    text: string,
    index: number,
    tone: string
  ) => ReactNode;
  renderUserExpressionText?: (text: string) => ReactNode;
};

const COPY = {
  accountLabel: "打开账户界面",
  change: "换一句",
  changeAria: "换一句新的中文建议",
  loadingNext: "正在为你准备下一句...",
  menuLabel: "回到学习首页",
  nextFallback: "那我们休息一下，过会儿再去散步吧。",
  nextTitle: "下一句，可以这样说",
  pageLabel: "AI引导表达结果页",
  playAria: "播放这句表达",
  records: "表达训练记录",
  retry: "重新说",
  retryAria: "回到第四页重新录制英语",
  seeMore: "向下查看更多表达",
  useNext: "用这句练习",
  useNextAria: "用这句中文进入第四页练习",
  userExpression: "你的表达",
} as const;

const expressionMeta = [
  {
    badge: "最自然地道",
    icon: "bookmark",
    tone: "violet",
  },
  {
    badge: "更地道",
    icon: "leaf",
    tone: "green",
  },
  {
    badge: "更简单",
    icon: "feather",
    tone: "blue",
  },
  {
    badge: "更口语",
    icon: "chat",
    tone: "purple",
  },
] as const;

function SparklesGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 36 36">
      <path
        d="M17 5.8 20.3 15l9.2 3.3-9.2 3.3L17 30.8l-3.3-9.2-9.2-3.3 9.2-3.3L17 5.8Z"
        fill="currentColor"
      />
      <path
        d="m28.4 4.8 1.3 3.4 3.4 1.3-3.4 1.3-1.3 3.4-1.3-3.4-3.4-1.3 3.4-1.3 1.3-3.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WaveGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 36 36">
      <path
        d="M7 16v4M12.5 11v14M18 7v22M23.5 11v14M29 16v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3.4"
      />
    </svg>
  );
}

function RefreshGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M7 18H4v-3M17 6h3v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function MicGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 44 44">
      <path
        d="M22 6.8a6.9 6.9 0 0 0-6.9 6.9v9A6.9 6.9 0 0 0 22 29.6a6.9 6.9 0 0 0 6.9-6.9v-9A6.9 6.9 0 0 0 22 6.8Z"
        fill="currentColor"
      />
      <path
        d="M11 21.5a11 11 0 0 0 22 0M22 32.6v5.8M17 38.4h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3.2"
      />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
      <path d="M11.2 8.4v15.2L22.8 16 11.2 8.4Z" fill="currentColor" />
    </svg>
  );
}

function LeafGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 36 36">
      <path
        d="M18.6 5.2c5.4 4 7.5 9.2 6 15.4-3.8-.6-6.4-2.4-7.8-5.3-1.4 3-3.8 5-7.2 6.1-1.2-6.2 1.8-11.6 9-16.2Z"
        fill="currentColor"
      />
      <path
        d="M17 18.2v11M17 23c2.1-1.3 3.9-3.1 5.1-5.4M17 23.8c-2-1.1-3.6-2.6-4.7-4.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function FeatherGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 36 36">
      <path
        d="M20.3 5.5c5.4 4.1 7.3 9.2 5.8 15.4-3.6-.5-6-2.3-7.3-5.2-1.3 2.8-3.4 4.8-6.4 5.9-1.4-6.2 1.2-11.5 7.9-16.1Z"
        fill="currentColor"
      />
      <path
        d="M18 17.4v11M18 21.1c1.6-.8 3-2 4.2-3.6M18 22.4c-1.6-.7-2.9-1.8-3.9-3.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function ChatGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 36 36">
      <path
        d="M18 7.5c-6.4 0-11.5 4.3-11.5 9.7 0 3.1 1.7 5.8 4.4 7.5L10 29l4.5-2.4c1.1.3 2.3.4 3.5.4 6.4 0 11.5-4.4 11.5-9.8S24.4 7.5 18 7.5Z"
        fill="currentColor"
      />
      <circle cx="13.8" cy="17.5" fill="white" opacity="0.86" r="1.25" />
      <circle cx="18" cy="17.5" fill="white" opacity="0.86" r="1.25" />
      <circle cx="22.2" cy="17.5" fill="white" opacity="0.86" r="1.25" />
    </svg>
  );
}

function ChevronDownGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function ExpressionIcon({ name }: { name: (typeof expressionMeta)[number]["icon"] }) {
  if (name === "leaf") return <LeafGlyph />;
  if (name === "feather") return <FeatherGlyph />;
  if (name === "chat") return <ChatGlyph />;

  return (
    <span className="sf-ai-guided-step-five-bookmark" aria-hidden="true">
      <span />
    </span>
  );
}

function renderExpressionText(text: string, tone: string) {
  const normalized = text.trim() || "Preparing a better expression.";
  const match = normalized.match(/^(.*?)([A-Za-z]+(?:\s+[A-Za-z]+)?)([.!?]*)$/);

  if (!match) return normalized;

  return (
    <>
      {match[1]}
      <span className={`sf-ai-guided-step-five-emphasis is-${tone}`}>
        {match[2]}
      </span>
      {match[3]}
    </>
  );
}

export default function AiGuidedExpressionStepFive({
  userEnglishText,
  nextChineseText,
  isLoadingNextChinese = false,
  expressions,
  selectedExpressionIndex,
  headerAddon,
  accountLabel = COPY.accountLabel,
  menuLabel = COPY.menuLabel,
  onMenuClick,
  onRetryEnglish,
  onUseNextChinese,
  onChangeNextChinese,
  onAccountClick,
  onPlayExpression,
  onSelectExpression,
  renderExpressionText: renderInteractiveExpressionText,
  renderUserExpressionText,
}: AiGuidedExpressionStepFiveProps) {
  const displayEnglish = userEnglishText.trim() || "I'm practicing this sentence.";
  const displayNextChinese =
    nextChineseText.trim() || (isLoadingNextChinese ? COPY.loadingNext : COPY.nextFallback);
  const safeExpressions =
    expressions.length > 0 ? expressions : ["That's why I'm looking for a better job."];

  return (
    <section className="sf-ai-guided-step-five" aria-label={COPY.pageLabel}>
      <style>{`
        .sf-ai-guided-step-five,
        .sf-ai-guided-step-five * {
          box-sizing: border-box;
        }

        .sf-ai-guided-step-five {
          position: absolute;
          inset: 0;
          z-index: 90;
          width: 100%;
          height: 100%;
          overflow: hidden;
          color: #08143f;
          background:
            radial-gradient(circle at 18% 12%, rgba(222, 244, 255, 0.82), transparent 34%),
            radial-gradient(circle at 82% 42%, rgba(235, 231, 255, 0.72), transparent 35%),
            linear-gradient(180deg, #eef8ff 0%, #f8fbff 48%, #f3f8ff 100%);
          font-family: var(--sf-font-zh, "PingFang SC", "Microsoft YaHei", sans-serif);
        }

        .sf-ai-guided-step-five-frame {
          display: flex;
          width: 100%;
          height: 100%;
          min-height: 100%;
          flex-direction: column;
          overflow: hidden;
          padding: calc(env(safe-area-inset-top, 0px) + 1.12rem) clamp(1.05rem, 4vw, 1.55rem)
            calc(env(safe-area-inset-bottom, 0px) + 0.9rem);
        }

        .sf-ai-guided-step-five-header {
          display: grid;
          grid-template-columns: 3rem minmax(0, 1fr) 3rem;
          align-items: center;
          gap: 0.6rem;
          min-height: 4.55rem;
          flex: 0 0 auto;
        }

        .sf-ai-guided-step-five-menu,
        .sf-ai-guided-step-five-help-button {
          display: grid;
          width: 3rem;
          height: 3rem;
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          color: #11162f;
          box-shadow:
            0 14px 28px rgba(67, 101, 176, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          cursor: pointer;
          transition: transform 160ms ease;
        }

        .sf-ai-guided-step-five-menu:active,
        .sf-ai-guided-step-five-help-button:active,
        .sf-ai-guided-step-five-retry:active,
        .sf-ai-guided-step-five-use-next:active,
        .sf-ai-guided-step-five-change:active,
        .sf-ai-guided-step-five-play:active,
        .sf-ai-guided-step-five-slow-button:active {
          transform: scale(0.97);
        }

        .sf-ai-guided-step-five-menu:focus-visible,
        .sf-ai-guided-step-five-help-button:focus-visible,
        .sf-ai-guided-step-five-retry:focus-visible,
        .sf-ai-guided-step-five-use-next:focus-visible,
        .sf-ai-guided-step-five-change:focus-visible,
        .sf-ai-guided-step-five-play:focus-visible,
        .sf-ai-guided-step-five-slow-button:focus-visible {
          outline: 3px solid rgba(61, 115, 255, 0.36);
          outline-offset: 4px;
        }

        .sf-ai-guided-step-five-menu .sf-home-menu-icon,
        .sf-ai-guided-step-five-menu .sf-home-menu-icon svg {
          width: 1.95rem;
          height: 1.95rem;
        }

        .sf-ai-guided-step-five-menu .sf-home-menu-icon svg {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.8;
        }

        .sf-ai-guided-step-five-help-button {
          justify-self: end;
          font-size: 1.42rem;
          font-weight: 950;
          line-height: 1;
        }

        .sf-ai-guided-step-five-brand {
          display: flex;
          min-width: 0;
          align-items: center;
          justify-content: center;
          gap: clamp(0.65rem, 2.4vw, 0.9rem);
        }

        .sf-ai-guided-step-five-logo {
          display: grid;
          width: 3.1rem;
          height: 3.1rem;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 999px;
        }

        .sf-ai-guided-step-five-logo-mark {
          width: 100%;
          height: 100%;
        }

        .sf-ai-guided-step-five-brand-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
        }

        .sf-ai-guided-step-five-brand-title {
          color: #08133f;
          font-size: 1.95rem;
          font-weight: 950;
          letter-spacing: 0;
          line-height: 0.94;
        }

        .sf-ai-guided-step-five-brand-subtitle {
          margin-top: 0.32rem;
          color: #0f66ff !important;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        .sf-ai-guided-step-five-scroll {
          flex: 1 1 auto;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 1.1rem 0 1.25rem;
          scrollbar-width: none;
        }

        .sf-ai-guided-step-five-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .sf-ai-guided-step-five-user-card,
        .sf-ai-guided-step-five-next-card,
        .sf-ai-guided-step-five-record-card {
          border: 1px solid rgba(206, 222, 252, 0.9);
          background:
            radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.98), transparent 35%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 252, 255, 0.88));
          box-shadow:
            0 20px 48px rgba(67, 101, 176, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        .sf-ai-guided-step-five-user-card {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 0.75rem;
          align-items: center;
          border-radius: 1.25rem;
          padding: 1.25rem 1.15rem 1.45rem;
        }

        .sf-ai-guided-step-five-card-heading {
          grid-column: 1 / -1;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          color: #0568ff;
          font-size: 1.02rem;
          font-weight: 900;
          line-height: 1.1;
        }

        .sf-ai-guided-step-five-mini-wave {
          display: inline-grid;
          width: 1.45rem;
          height: 1.45rem;
          place-items: center;
          color: #0f66ff;
        }

        .sf-ai-guided-step-five-mini-wave svg {
          width: 100%;
          height: 100%;
        }

        .sf-ai-guided-step-five-user-text {
          min-width: 0;
          margin: 0;
          color: #07113f;
          font-size: clamp(3rem, 13vw, 5rem);
          font-weight: 950;
          letter-spacing: 0;
          line-height: 0.98;
          overflow-wrap: anywhere;
        }

        .sf-ai-guided-step-five-retry {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          min-width: 6.4rem;
          min-height: 3.2rem;
          border: 0;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.88);
          color: #075fff;
          font-size: 1rem;
          font-weight: 850;
          box-shadow:
            0 14px 28px rgba(67, 101, 176, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          cursor: pointer;
        }

        .sf-ai-guided-step-five-retry svg,
        .sf-ai-guided-step-five-use-next svg,
        .sf-ai-guided-step-five-change svg {
          width: 1.25rem;
          height: 1.25rem;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.4;
        }

        .sf-ai-guided-step-five-next-card {
          position: relative;
          min-height: 13.6rem;
          margin-top: 1rem;
          border-radius: 1.25rem;
          padding: 1.25rem 1.05rem 1.15rem;
          overflow: hidden;
        }

        .sf-ai-guided-step-five-next-card h2 {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin: 0;
          color: #0d66ff;
          font-size: 1.08rem;
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1.16;
        }

        .sf-ai-guided-step-five-next-card h2 svg {
          width: 1.25rem;
          height: 1.25rem;
          color: #0d66ff;
        }

        .sf-ai-guided-step-five-next-text {
          position: relative;
          z-index: 1;
          width: min(100%, 15rem);
          margin: 1.15rem 0 0;
          color: #07113f;
          font-size: clamp(2rem, 9.2vw, 3.15rem);
          font-weight: 950;
          letter-spacing: 0;
          line-height: 1.22;
          overflow-wrap: anywhere;
        }

        .sf-ai-guided-step-five-next-robot {
          position: absolute;
          right: 1.1rem;
          top: 3.5rem;
          width: 5.55rem;
          height: 5.55rem;
          border-radius: 2rem;
          background: linear-gradient(180deg, #ffffff 0%, #ecf5ff 70%, #9bc4ff 100%);
          box-shadow:
            0 16px 34px rgba(28, 95, 216, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        .sf-ai-guided-step-five-next-robot::before {
          content: "";
          position: absolute;
          left: 50%;
          top: -1.2rem;
          width: 0.22rem;
          height: 1.35rem;
          border-radius: 999px;
          background: linear-gradient(180deg, #2f75ff, #80b4ff);
          transform: translateX(-50%);
          box-shadow: 0 -0.25rem 0 0.18rem #2f75ff;
        }

        .sf-ai-guided-step-five-robot-face {
          position: absolute;
          inset: 0.85rem 0.75rem 1.35rem;
          border-radius: 1.05rem;
          background: #07113f;
        }

        .sf-ai-guided-step-five-robot-face::before,
        .sf-ai-guided-step-five-robot-face::after {
          content: "";
          position: absolute;
          top: 1.12rem;
          width: 0.72rem;
          height: 0.72rem;
          border-radius: 999px;
          background: #22d4e5;
        }

        .sf-ai-guided-step-five-robot-face::before {
          left: 1.05rem;
        }

        .sf-ai-guided-step-five-robot-face::after {
          right: 1.05rem;
        }

        .sf-ai-guided-step-five-robot-face span {
          position: absolute;
          left: 50%;
          bottom: 0.76rem;
          width: 1.2rem;
          height: 0.54rem;
          border-bottom: 0.18rem solid #24d4e5;
          border-radius: 0 0 999px 999px;
          transform: translateX(-50%);
        }

        .sf-ai-guided-step-five-next-actions {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          gap: 0.8rem;
          margin-top: 1.25rem;
        }

        .sf-ai-guided-step-five-use-next,
        .sf-ai-guided-step-five-change {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          min-height: 3.45rem;
          border: 0;
          border-radius: 1rem;
          font-size: 1.04rem;
          font-weight: 900;
          cursor: pointer;
        }

        .sf-ai-guided-step-five-use-next {
          background: linear-gradient(135deg, #35b8ff 0%, #155dff 100%);
          color: #fff !important;
          box-shadow: 0 16px 30px rgba(33, 103, 255, 0.22);
        }

        .sf-ai-guided-step-five-change {
          background: rgba(255, 255, 255, 0.9);
          color: #075fff;
          box-shadow:
            0 14px 28px rgba(67, 101, 176, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }

        .sf-ai-guided-step-five-use-next:disabled,
        .sf-ai-guided-step-five-change:disabled {
          cursor: not-allowed;
          opacity: 0.58;
        }

        .sf-ai-guided-step-five-records {
          margin-top: 1.05rem;
        }

        .sf-ai-guided-step-five-records > h2 {
          display: grid;
          grid-template-columns: auto auto minmax(0, 1fr);
          align-items: center;
          gap: 0.58rem;
          margin: 0 0 0.7rem;
          color: #176cff;
          font-size: 1.08rem;
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1.1;
        }

        .sf-ai-guided-step-five-records > h2::after {
          content: "";
          display: block;
          height: 1px;
          background: rgba(105, 135, 190, 0.28);
        }

        .sf-ai-guided-step-five-records > h2 svg {
          width: 1.3rem;
          height: 1.3rem;
        }

        .sf-ai-guided-step-five-record-list {
          display: grid;
          gap: 0.64rem;
        }

        .sf-ai-guided-step-five-record-card {
          display: grid;
          grid-template-columns: 3.6rem minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.7rem;
          min-height: 5.7rem;
          border-radius: 1rem;
          padding: 0.9rem 0.72rem 0.9rem 0.85rem;
          cursor: pointer;
        }

        .sf-ai-guided-step-five-record-card.is-selected {
          border-color: rgba(50, 106, 255, 0.52);
          box-shadow:
            0 18px 38px rgba(43, 102, 255, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        .sf-ai-guided-step-five-record-icon {
          display: grid;
          width: 3.25rem;
          height: 3.25rem;
          place-items: center;
          border-radius: 999px;
          color: #fff;
          background: linear-gradient(135deg, #4b83ff, #155dff);
        }

        .sf-ai-guided-step-five-record-icon.is-green {
          background: linear-gradient(135deg, #b9f2c9, #08a136);
        }

        .sf-ai-guided-step-five-record-icon.is-blue {
          background: linear-gradient(135deg, #cae9ff, #287dff);
        }

        .sf-ai-guided-step-five-record-icon.is-purple {
          background: linear-gradient(135deg, #cebaff, #6f43e9);
        }

        .sf-ai-guided-step-five-record-icon svg {
          width: 1.65rem;
          height: 1.65rem;
        }

        .sf-ai-guided-step-five-bookmark {
          position: relative;
          display: grid;
          width: 1.85rem;
          height: 2.15rem;
          place-items: center;
          border-radius: 0.22rem 0.22rem 0.12rem 0.12rem;
          background: currentColor;
        }

        .sf-ai-guided-step-five-bookmark::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -0.02rem;
          width: 0.9rem;
          height: 0.9rem;
          background: inherit;
          transform: translateX(-50%) rotate(45deg);
        }

        .sf-ai-guided-step-five-bookmark span {
          position: relative;
          z-index: 1;
          width: 0.8rem;
          height: 0.8rem;
          color: #fff;
          background: currentColor;
          clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
        }

        .sf-ai-guided-step-five-record-copy {
          min-width: 0;
        }

        .sf-ai-guided-step-five-record-badge {
          display: inline-flex;
          margin: 0 0 0.25rem;
          border-radius: 999px;
          background: rgba(47, 112, 255, 0.12);
          color: #0f66ff;
          padding: 0.12rem 0.52rem;
          font-size: 0.72rem;
          font-weight: 850;
          line-height: 1.1;
        }

        .sf-ai-guided-step-five-record-badge.is-green {
          background: rgba(36, 194, 80, 0.14);
          color: #139d36;
        }

        .sf-ai-guided-step-five-record-badge.is-purple {
          background: rgba(128, 82, 235, 0.14);
          color: #7146de;
        }

        .sf-ai-guided-step-five-record-text {
          margin: 0;
          color: #07113f;
          font-size: clamp(1.55rem, 6.4vw, 2.35rem);
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1.14;
          overflow-wrap: anywhere;
        }

        .sf-ai-guided-step-five-emphasis {
          color: inherit;
        }

        .sf-ai-guided-step-five-record-actions {
          display: grid;
          grid-template-columns: 2.78rem 3.12rem;
          gap: 0.45rem;
          align-items: center;
        }

        .sf-ai-guided-step-five-play,
        .sf-ai-guided-step-five-slow-button {
          display: grid;
          height: 2.78rem;
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          color: #075fff;
          font-size: 0.98rem;
          font-weight: 850;
          box-shadow:
            0 12px 24px rgba(67, 101, 176, 0.13),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          cursor: pointer;
        }

        .sf-ai-guided-step-five-play {
          width: 2.78rem;
        }

        .sf-ai-guided-step-five-play svg {
          width: 1.2rem;
          height: 1.2rem;
        }

        .sf-ai-guided-step-five-slow-button {
          width: 3.12rem;
        }

        .sf-ai-guided-step-five-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          margin: 1rem 0 0;
          color: #176cff;
          font-size: 1rem;
          font-weight: 780;
        }

        .sf-ai-guided-step-five-more svg {
          width: 1.05rem;
          height: 1.05rem;
        }

        @media (max-width: 480px) {
          .sf-ai-guided-step-five-frame {
            padding-inline: 0.95rem;
          }

          .sf-ai-guided-step-five-header {
            grid-template-columns: 2.8rem minmax(0, 1fr) 2.8rem;
          }

          .sf-ai-guided-step-five-menu,
          .sf-ai-guided-step-five-help-button {
            width: 2.8rem;
            height: 2.8rem;
          }

          .sf-ai-guided-step-five-logo {
            width: 2.75rem;
            height: 2.75rem;
          }

          .sf-ai-guided-step-five-brand-title {
            font-size: 1.72rem;
          }

          .sf-ai-guided-step-five-brand-subtitle {
            font-size: 0.66rem;
          }

          .sf-ai-guided-step-five-user-card {
            padding: 1.05rem 0.92rem 1.2rem;
          }

          .sf-ai-guided-step-five-user-text {
            font-size: clamp(2.65rem, 12vw, 4.2rem);
          }

          .sf-ai-guided-step-five-retry {
            min-width: 5.7rem;
            padding-inline: 0.65rem;
          }

          .sf-ai-guided-step-five-next-text {
            width: min(100%, 13.3rem);
            font-size: clamp(1.82rem, 8.6vw, 2.65rem);
          }

          .sf-ai-guided-step-five-next-robot {
            right: 0.88rem;
            width: 4.9rem;
            height: 4.9rem;
          }

          .sf-ai-guided-step-five-use-next,
          .sf-ai-guided-step-five-change {
            font-size: 0.94rem;
          }

          .sf-ai-guided-step-five-record-card {
            grid-template-columns: 3.2rem minmax(0, 1fr) auto;
            gap: 0.62rem;
            padding-inline: 0.72rem 0.55rem;
          }

          .sf-ai-guided-step-five-record-icon {
            width: 2.95rem;
            height: 2.95rem;
          }

          .sf-ai-guided-step-five-record-text {
            font-size: clamp(1.42rem, 5.7vw, 2rem);
          }

          .sf-ai-guided-step-five-record-actions {
            grid-template-columns: 2.55rem 2.85rem;
            gap: 0.35rem;
          }

          .sf-ai-guided-step-five-play,
          .sf-ai-guided-step-five-slow-button {
            height: 2.55rem;
          }

          .sf-ai-guided-step-five-play {
            width: 2.55rem;
          }

          .sf-ai-guided-step-five-slow-button {
            width: 2.85rem;
          }
        }
      `}</style>

      <div className="sf-ai-guided-step-five-frame">
        <header className="sf-ai-guided-step-five-header">
          <button
            type="button"
            aria-label={menuLabel}
            onClick={onMenuClick}
            className="sf-ai-guided-step-five-menu"
          >
            <HomeMenuIcon label={null} showHint={false} />
          </button>

          <div
            className="sf-ai-guided-step-five-brand"
            aria-label="SpeakFlow AI Voice Practice"
          >
            <span className="sf-ai-guided-step-five-logo">
              <SpeakFlowBrandMark className="sf-ai-guided-step-five-logo-mark" />
            </span>
            <span className="sf-ai-guided-step-five-brand-copy">
              <span className="sf-ai-guided-step-five-brand-title">SpeakFlow</span>
              <span className="sf-ai-guided-step-five-brand-subtitle">
                AI VOICE PRACTICE
              </span>
            </span>
          </div>

          <button
            type="button"
            aria-label={accountLabel}
            onClick={onAccountClick}
            className="sf-ai-guided-step-five-help-button"
          >
            ?
          </button>
        </header>

        {headerAddon}

        <main className="sf-ai-guided-step-five-scroll">
          <section className="sf-ai-guided-step-five-user-card">
            <div className="sf-ai-guided-step-five-card-heading">
              <span>{COPY.userExpression}</span>
              <span className="sf-ai-guided-step-five-mini-wave" aria-hidden="true">
                <WaveGlyph />
              </span>
            </div>
            <p lang="en" className="sf-ai-guided-step-five-user-text">
              {renderUserExpressionText
                ? renderUserExpressionText(displayEnglish)
                : displayEnglish}
            </p>
            <button
              type="button"
              aria-label={COPY.retryAria}
              onClick={onRetryEnglish}
              className="sf-ai-guided-step-five-retry"
            >
              <RefreshGlyph />
              <span>{COPY.retry}</span>
            </button>
          </section>

          <section className="sf-ai-guided-step-five-next-card">
            <div className="sf-ai-guided-step-five-next-robot" aria-hidden="true">
              <span className="sf-ai-guided-step-five-robot-face">
                <span />
              </span>
            </div>
            <h2>
              <SparklesGlyph />
              <span>{COPY.nextTitle}</span>
            </h2>
            <p lang="zh-CN" className="sf-ai-guided-step-five-next-text">
              {isLoadingNextChinese ? COPY.loadingNext : displayNextChinese}
            </p>
            <div className="sf-ai-guided-step-five-next-actions">
              <button
                type="button"
                aria-label={COPY.useNextAria}
                onClick={onUseNextChinese}
                disabled={isLoadingNextChinese}
                className="sf-ai-guided-step-five-use-next"
              >
                <MicGlyph />
                <span>{COPY.useNext}</span>
              </button>
              <button
                type="button"
                aria-label={COPY.changeAria}
                onClick={onChangeNextChinese}
                disabled={isLoadingNextChinese}
                className="sf-ai-guided-step-five-change"
              >
                <RefreshGlyph />
                <span>{COPY.change}</span>
              </button>
            </div>
          </section>

          <section className="sf-ai-guided-step-five-records">
            <h2>
              <WaveGlyph />
              <span>{COPY.records}</span>
            </h2>
            <div className="sf-ai-guided-step-five-record-list">
              {safeExpressions.map((text, index) => {
                const meta =
                  expressionMeta[index] ||
                  expressionMeta[expressionMeta.length - 1];
                const isSelected = selectedExpressionIndex === index;

                return (
                  <article
                    key={`ai-guided-step-five-expression-${index}-${text}`}
                    className={`sf-ai-guided-step-five-record-card is-${meta.tone} ${
                      isSelected ? "is-selected" : ""
                    }`}
                    onClick={() => onSelectExpression(index)}
                  >
                    <div
                      className={`sf-ai-guided-step-five-record-icon is-${meta.tone}`}
                      aria-hidden="true"
                    >
                      <ExpressionIcon name={meta.icon} />
                    </div>
                    <div className="sf-ai-guided-step-five-record-copy">
                      <p className={`sf-ai-guided-step-five-record-badge is-${meta.tone}`}>
                        {meta.badge}
                      </p>
                      <p lang="en" className="sf-ai-guided-step-five-record-text">
                        {renderInteractiveExpressionText
                          ? renderInteractiveExpressionText(text, index, meta.tone)
                          : renderExpressionText(text, meta.tone)}
                      </p>
                    </div>
                    <div className="sf-ai-guided-step-five-record-actions">
                      <button
                        type="button"
                        aria-label={`${COPY.playAria} ${index + 1}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectExpression(index);
                          onPlayExpression(index, 1);
                        }}
                        className="sf-ai-guided-step-five-play"
                      >
                        <PlayGlyph />
                      </button>
                      <button
                        type="button"
                        aria-label={`以 0.5 倍速播放第 ${index + 1} 条表达`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectExpression(index);
                          onPlayExpression(index, 0.5);
                        }}
                        className="sf-ai-guided-step-five-slow-button"
                      >
                        0.5x
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="sf-ai-guided-step-five-more">
              <span>{COPY.seeMore}</span>
              <ChevronDownGlyph />
            </p>
          </section>
        </main>
      </div>
    </section>
  );
}
