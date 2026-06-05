"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import HomeMenuIcon from "@/components/HomeMenuIcon";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";

type FreeStudyPageFiveTopProps = {
  userEnglishText: string;
  expressions: string[];
  selectedExpressionIndex: number;
  avatarSrc?: string;
  avatarAlt?: string;
  accountLabel?: string;
  onAiGuidedPractice: () => void;
  onRetryEnglish: () => void;
  onMenuClick: () => void;
  onAccountClick: () => void;
  onAvatarError?: () => void;
  onPlayExpression: (index: number, rate?: number) => void;
  onSelectExpression: (index: number) => void;
  renderExpressionText?: (
    text: string,
    index: number,
    tone: string
  ) => ReactNode;
  renderUserExpressionText?: (text: string) => ReactNode;
};

const expressionMeta = [
  {
    badge: "最自然地道",
    description: "自然地道 · 最推荐",
    icon: "star",
    tone: "violet",
  },
  {
    badge: "更地道",
    description: "",
    icon: "tree",
    tone: "green",
  },
  {
    badge: "更简单",
    description: "",
    icon: "leaf",
    tone: "blue",
  },
  {
    badge: "更口语",
    description: "",
    icon: "chat",
    tone: "purple",
  },
] as const;

function WaveGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M9 21v6M16 14v20M23 10v28M30 14v20M37 21v6" />
    </svg>
  );
}

function SparklesGlyph() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M18.5 6.2 22 15l8.8 3.5L22 22l-3.5 8.8L15 22l-8.8-3.5L15 15l3.5-8.8Z" />
      <path d="m29.5 5.8 1.5 3.7 3.7 1.5-3.7 1.5-1.5 3.7-1.5-3.7-3.7-1.5L28 9.5l1.5-3.7Z" />
    </svg>
  );
}

function LightGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M15 21a9 9 0 1 1 18 0c0 4.8-3.4 7.2-5.2 10.5h-7.6C18.4 28.2 15 25.8 15 21Z" />
      <path d="M20 36h8M21 41h6M24 4v4M9.5 10.5l2.8 2.8M38.5 10.5l-2.8 2.8" />
    </svg>
  );
}

function RefreshGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6" />
      <path d="M7 18H4v-3M17 6h3v3" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M11.2 8.4v15.2L22.8 16 11.2 8.4Z" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" />
      <path d="m7.8 12.2 2.6 2.5 5.8-6" />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="m20 5 4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L20 28.6 10.7 33.5l1.8-10.3L5 15.9l10.4-1.5L20 5Z" />
    </svg>
  );
}

function TreeGlyph() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M20 5c5 4.2 7.2 8.6 6.5 13.2-3.5-.5-5.8-2-7-4.4-1.2 2.8-3.6 4.6-7.2 5.4-.8-5.1 1.8-9.8 7.7-14.2Z" />
      <path d="M20 17v15M20 24c-3 0-5.8-1.2-8-3.6M20 24c3 0 5.8-1.2 8-3.6" />
    </svg>
  );
}

function LeafGlyph() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M23 5C29 10 30.5 16 27.5 23.2c-5.2-.3-8.6-2.7-10.1-7.2-2 2.9-4.6 4.8-7.9 5.7C8.2 14.9 12.7 9.4 23 5Z" />
      <path d="M18.5 21.5 11 32M18.5 21.5c3-.4 5.6-1.8 7.8-4.4" />
    </svg>
  );
}

function ChatGlyph() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M20 8c-7 0-12.5 4.8-12.5 10.7 0 3.4 1.9 6.4 4.9 8.3l-1 4.8 5-2.7c1.1.2 2.3.4 3.6.4 7 0 12.5-4.8 12.5-10.8S27 8 20 8Z" />
      <path d="M15 19h.1M20 19h.1M25 19h.1" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 5 19 19M19 5 5 19" />
    </svg>
  );
}

function ExpressionIcon({ name }: { name: (typeof expressionMeta)[number]["icon"] }) {
  if (name === "tree") return <TreeGlyph />;
  if (name === "leaf") return <LeafGlyph />;
  if (name === "chat") return <ChatGlyph />;
  return <StarGlyph />;
}

function renderExpressionText(text: string, tone: string) {
  const normalized = text.trim() || "Preparing a better expression.";
  const match = normalized.match(/^(.*?)([A-Za-z]+(?:\s+[A-Za-z]+)?)([.!?。！？]*)$/);

  if (!match) return normalized;

  return (
    <>
      {match[1]}
      <span className={`sf-free-result-emphasis is-${tone}`}>{match[2]}</span>
      {match[3]}
    </>
  );
}

export default function FreeStudyPageFiveTop({
  userEnglishText,
  expressions,
  selectedExpressionIndex,
  onAiGuidedPractice,
  onRetryEnglish,
  onMenuClick,
  onPlayExpression,
  onSelectExpression,
  renderExpressionText: renderInteractiveExpressionText,
  renderUserExpressionText,
}: FreeStudyPageFiveTopProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const displayText = userEnglishText.trim() || " ";
  const preparedExpressions = expressionMeta.map((meta, index) => ({
    ...meta,
    text:
      expressions[index]?.trim() ||
      expressions[0]?.trim() ||
      "Preparing a better expression.",
  }));
  const safeSelectedIndex = Math.min(
    Math.max(selectedExpressionIndex, 0),
    preparedExpressions.length - 1
  );

  useEffect(() => {
    if (!isHelpOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsHelpOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isHelpOpen]);

  return (
    <section className="sf-free-result-page" aria-label="自由学习英语结果">
      <style>{`
        .sf-free-result-page,
        .sf-free-result-page * {
          box-sizing: border-box;
        }

        .sf-free-result-page {
          position: absolute;
          inset: 0;
          z-index: 90;
          overflow-y: auto;
          overflow-x: hidden;
          color: #101342;
          background:
            radial-gradient(circle at 50% 0%, rgba(244,231,255,.95), transparent 36%),
            radial-gradient(circle at 82% 78%, rgba(228,216,255,.82), transparent 40%),
            linear-gradient(180deg, #f4edff 0%, #fbfaff 45%, #f4edff 100%);
          font-family: var(--sf-font-zh, "PingFang SC", "Microsoft YaHei", sans-serif);
        }

        .sf-free-result-frame {
          min-height: 100%;
          padding: calc(env(safe-area-inset-top, 0px) + .75rem) clamp(.95rem, 4vw, 1.45rem)
            calc(env(safe-area-inset-bottom, 0px) + 1.35rem);
        }

        .sf-free-result-header,
        .sf-free-result-ai-card,
        .sf-free-result-user-card,
        .sf-free-result-expression-card {
          border: 1px solid rgba(157,111,233,.12);
          background: rgba(255,255,255,.82);
          box-shadow: 0 16px 36px rgba(110,74,180,.1), inset 0 1px 0 rgba(255,255,255,.96);
        }

        .sf-free-result-header {
          display: grid;
          grid-template-columns: 3.6rem minmax(0, 1fr) 3.6rem;
          align-items: center;
          gap: .72rem;
          min-height: 5.8rem;
          border-radius: 1.8rem;
          padding: .85rem .95rem;
        }

        .sf-free-result-home,
        .sf-free-result-help,
        .sf-free-result-help-close {
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: rgba(255,255,255,.92);
          color: #101342;
          box-shadow: 0 12px 24px rgba(97,73,170,.14), inset 0 1px 0 rgba(255,255,255,.98);
          cursor: pointer;
        }

        .sf-free-result-home,
        .sf-free-result-help {
          width: 3.35rem;
          height: 3.35rem;
        }

        .sf-free-result-home .sf-home-menu-icon,
        .sf-free-result-home .sf-home-menu-icon svg {
          width: 2rem;
          height: 2rem;
          color: currentColor;
        }

        .sf-free-result-help {
          justify-self: end;
          font-size: 1.5rem;
          font-weight: 950;
        }

        .sf-free-result-brand {
          display: flex;
          min-width: 0;
          align-items: center;
          justify-content: center;
          gap: .62rem;
        }

        .sf-free-result-logo {
          display: grid;
          width: 3rem;
          height: 3rem;
          place-items: center;
        }

        .sf-free-result-logo svg {
          width: 2.85rem;
          height: 2.85rem;
        }

        .sf-free-result-brand-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
        }

        .sf-free-result-brand-title {
          color: #0b1244;
          font-size: clamp(1.86rem, 7.6vw, 2.55rem);
          font-weight: 950;
          line-height: .94;
          letter-spacing: 0;
        }

        .sf-free-result-brand-subtitle {
          margin-top: .38rem;
          color: #202344;
          font-size: clamp(.68rem, 2.7vw, .88rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: .16em;
        }

        .sf-free-result-ai-card {
          display: grid;
          grid-template-columns: 4.4rem minmax(0, 1fr) auto;
          align-items: center;
          gap: .95rem;
          margin-top: 1.15rem;
          border-radius: 1.45rem;
          padding: 1.15rem 1.05rem;
        }

        .sf-free-result-ai-icon {
          display: grid;
          width: 4rem;
          height: 4rem;
          place-items: center;
          border-radius: 50%;
          background: rgba(236,228,255,.86);
          color: #8353ef;
        }

        .sf-free-result-ai-icon svg,
        .sf-free-result-section-title svg,
        .sf-free-result-user-title svg {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-result-ai-icon svg {
          width: 2.45rem;
          height: 2.45rem;
          stroke-width: 3;
        }

        .sf-free-result-ai-copy strong {
          display: block;
          color: #101342;
          font-size: clamp(1.35rem, 5.6vw, 1.9rem);
          font-weight: 950;
          line-height: 1.2;
        }

        .sf-free-result-ai-copy span {
          display: block;
          margin-top: .15rem;
          color: #8353ef;
          font-size: clamp(1.18rem, 4.8vw, 1.55rem);
          font-weight: 900;
        }

        .sf-free-result-change {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          min-height: 3.2rem;
          border: 1px solid #9a61ef;
          border-radius: 999px;
          background: rgba(255,255,255,.7);
          padding: 0 .95rem;
          color: #8353ef;
          font-size: 1.06rem;
          font-weight: 900;
          cursor: pointer;
        }

        .sf-free-result-change svg {
          width: 1.28rem;
          height: 1.28rem;
          fill: currentColor;
        }

        .sf-free-result-user-card {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: .85rem;
          margin-top: 1.1rem;
          border-radius: 1.45rem;
          padding: 1.45rem 1.15rem;
        }

        .sf-free-result-user-title {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: .72rem;
          color: #101342;
          font-size: clamp(1.5rem, 6vw, 2rem);
          font-weight: 950;
          line-height: 1;
        }

        .sf-free-result-user-title svg {
          width: 1.55rem;
          height: 1.55rem;
          color: #8655ef;
          stroke-width: 3.4;
        }

        .sf-free-result-user-text {
          align-self: center;
          margin: 0;
          color: #101342;
          font-size: clamp(2.45rem, 10.8vw, 4.1rem);
          font-weight: 950;
          line-height: 1.12;
          letter-spacing: 0;
          word-break: break-word;
        }

        .sf-free-result-user-highlight {
          display: inline;
          border-radius: .65rem;
          background: linear-gradient(180deg, #fff0b7, #ffe289);
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          padding: .02em .12em;
        }

        .sf-free-result-retry {
          align-self: center;
          display: inline-flex;
          align-items: center;
          gap: .55rem;
          min-height: 3.35rem;
          border: 1px solid #9a61ef;
          border-radius: 1.1rem;
          background: rgba(255,255,255,.78);
          padding: 0 1rem;
          color: #101342;
          font-size: 1.08rem;
          font-weight: 900;
          white-space: nowrap;
          cursor: pointer;
        }

        .sf-free-result-retry svg {
          width: 1.4rem;
          height: 1.4rem;
          fill: none;
          stroke: #8a54ee;
          stroke-width: 2.3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-result-section-title {
          display: flex;
          align-items: center;
          gap: .65rem;
          margin: 1.25rem 0 .75rem;
          color: #101342;
          font-size: clamp(1.35rem, 5.7vw, 1.82rem);
          font-weight: 950;
        }

        .sf-free-result-section-title svg {
          width: 1.65rem;
          height: 1.65rem;
          color: #8a54ee;
          fill: currentColor;
        }

        .sf-free-result-list {
          display: grid;
          gap: .75rem;
        }

        .sf-free-result-expression-card {
          display: grid;
          grid-template-columns: 4.25rem minmax(0, 1fr) auto;
          align-items: center;
          gap: .9rem;
          border-radius: 1.25rem;
          padding: 1.05rem .9rem;
          cursor: pointer;
        }

        .sf-free-result-expression-card.is-selected {
          box-shadow: 0 16px 34px rgba(110,74,180,.13), inset 0 0 0 1px rgba(139,86,238,.32);
        }

        .sf-free-result-expression-icon {
          display: grid;
          width: 3.45rem;
          height: 3.45rem;
          place-items: center;
          border-radius: 50%;
          color: #8353ef;
          background: rgba(237,229,255,.86);
        }

        .sf-free-result-expression-card.is-green .sf-free-result-expression-icon {
          color: #18a85d;
          background: rgba(221,249,232,.9);
        }

        .sf-free-result-expression-card.is-blue .sf-free-result-expression-icon {
          color: #2e78ee;
          background: rgba(226,239,255,.9);
        }

        .sf-free-result-expression-card.is-purple .sf-free-result-expression-icon {
          color: #7b55e8;
          background: rgba(237,229,255,.9);
        }

        .sf-free-result-expression-icon svg {
          width: 2rem;
          height: 2rem;
          fill: currentColor;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-result-badge {
          display: inline-flex;
          align-items: center;
          min-height: 1.68rem;
          border-radius: .5rem;
          background: linear-gradient(90deg, #9c66ff, #7452ed);
          padding: 0 .65rem;
          color: white;
          font-size: .9rem;
          font-weight: 900;
          line-height: 1;
        }

        .sf-free-result-expression-card.is-green .sf-free-result-badge {
          background: linear-gradient(90deg, #49c989, #1fa85f);
        }

        .sf-free-result-expression-card.is-blue .sf-free-result-badge {
          background: linear-gradient(90deg, #5797ff, #2d78ee);
        }

        .sf-free-result-expression-text {
          margin: .42rem 0 0;
          color: #101342;
          font-size: clamp(1.65rem, 6.7vw, 2.25rem);
          font-weight: 900;
          line-height: 1.16;
          letter-spacing: 0;
          word-break: break-word;
        }

        .sf-free-result-note {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          margin-top: .55rem;
          color: rgba(54,55,98,.72);
          font-size: 1rem;
          font-weight: 650;
        }

        .sf-free-result-note svg {
          width: 1.25rem;
          height: 1.25rem;
          fill: #7a58dc;
        }

        .sf-free-result-note svg path {
          fill: none;
          stroke: white;
          stroke-width: 2.1;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-result-actions {
          display: flex;
          gap: .6rem;
          align-items: center;
        }

        .sf-free-result-play,
        .sf-free-result-slow {
          display: grid;
          place-items: center;
          border: 1px solid rgba(157,111,233,.12);
          border-radius: 999px;
          background: rgba(255,255,255,.88);
          color: #101342;
          box-shadow: 0 10px 22px rgba(100,74,168,.1);
          cursor: pointer;
        }

        .sf-free-result-play {
          width: 3.25rem;
          height: 3.25rem;
        }

        .sf-free-result-play svg {
          width: 1.55rem;
          height: 1.55rem;
          fill: currentColor;
        }

        .sf-free-result-slow {
          min-width: 3.65rem;
          height: 3.25rem;
          padding: 0 .55rem;
          color: #6f4dea;
          font-size: 1.16rem;
          font-weight: 850;
        }

        .sf-free-result-expression-card.is-green .sf-free-result-slow {
          color: #1d9b59;
        }

        .sf-free-result-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          padding: 1rem 0 .15rem;
          color: #6f4dea;
          font-size: 1rem;
          font-weight: 800;
        }

        .sf-free-result-more::after {
          content: "⌄";
          font-size: 1.25rem;
          line-height: 1;
        }

        .sf-free-result-help-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: grid;
          place-items: center;
          background: rgba(25,27,44,.36);
          padding: 1rem;
          backdrop-filter: blur(10px);
        }

        .sf-free-result-help-modal {
          width: min(100%, 24rem);
          border: 1px solid rgba(159,121,230,.18);
          border-radius: 1.8rem;
          background: rgba(255,255,255,.96);
          padding: 1.35rem;
          box-shadow: 0 28px 60px rgba(37,31,78,.24);
        }

        .sf-free-result-help-modal header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .sf-free-result-help-modal h2 {
          margin: 0;
          color: #101342;
          font-size: 1.4rem;
          font-weight: 950;
        }

        .sf-free-result-help-close {
          width: 2.6rem;
          height: 2.6rem;
        }

        .sf-free-result-help-close svg {
          width: 1.35rem;
          height: 1.35rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.6;
          stroke-linecap: round;
        }

        .sf-free-result-help-modal p {
          margin: 1rem 0 0;
          color: rgba(37,39,83,.72);
          font-size: 1rem;
          font-weight: 650;
          line-height: 1.65;
        }

        @media (max-width: 380px) {
          .sf-free-result-frame {
            padding-left: .75rem;
            padding-right: .75rem;
          }

          .sf-free-result-ai-card {
            grid-template-columns: 3.6rem minmax(0, 1fr);
          }

          .sf-free-result-change {
            grid-column: 1 / -1;
            justify-content: center;
          }

          .sf-free-result-user-card {
            grid-template-columns: 1fr;
          }

          .sf-free-result-retry {
            justify-self: start;
          }

          .sf-free-result-expression-card {
            grid-template-columns: 3.6rem minmax(0, 1fr);
          }

          .sf-free-result-actions {
            grid-column: 2;
          }
        }
      `}</style>

      <div className="sf-free-result-frame">
        <header className="sf-free-result-header">
          <button
            type="button"
            aria-label="回到学习首页"
            onClick={onMenuClick}
            className="sf-free-result-home"
          >
            <HomeMenuIcon label={null} showHint={false} />
          </button>

          <div className="sf-free-result-brand" aria-label="SpeakFlow AI Voice Practice">
            <span className="sf-free-result-logo" aria-hidden="true">
              <SpeakFlowBrandMark />
            </span>
            <span className="sf-free-result-brand-copy">
              <span className="sf-free-result-brand-title">SpeakFlow</span>
              <span className="sf-free-result-brand-subtitle">AI VOICE PRACTICE</span>
            </span>
          </div>

          <button
            type="button"
            aria-label="打开自由学习帮助"
            onClick={() => setIsHelpOpen(true)}
            className="sf-free-result-help"
          >
            ?
          </button>
        </header>

        <section className="sf-free-result-ai-card">
          <span className="sf-free-result-ai-icon" aria-hidden="true">
            <LightGlyph />
          </span>
          <span className="sf-free-result-ai-copy">
            <strong>不知道说什么？</strong>
            <span>AI 帮我练</span>
          </span>
          <button
            type="button"
            onClick={onAiGuidedPractice}
            className="sf-free-result-change"
          >
            <SparklesGlyph />
            换一换
          </button>
        </section>

        <section className="sf-free-result-user-card">
          <h1 className="sf-free-result-user-title">
            你的表达
            <WaveGlyph />
          </h1>
          <p lang="en" className="sf-free-result-user-text">
            <span className="sf-free-result-user-highlight">
              {renderUserExpressionText
                ? renderUserExpressionText(displayText)
                : displayText}
            </span>
          </p>
          <button
            type="button"
            onClick={onRetryEnglish}
            className="sf-free-result-retry"
          >
            <RefreshGlyph />
            重新说
          </button>
        </section>

        <h2 className="sf-free-result-section-title">
          <SparklesGlyph />
          推荐表达
        </h2>

        <section className="sf-free-result-list">
          {preparedExpressions.map((expression, index) => {
            const selected = safeSelectedIndex === index;

            return (
              <article
                key={`${expression.tone}-${index}-${expression.text}`}
                className={`sf-free-result-expression-card is-${expression.tone} ${
                  selected ? "is-selected" : ""
                }`}
                onClick={() => onSelectExpression(index)}
              >
                <span className="sf-free-result-expression-icon" aria-hidden="true">
                  <ExpressionIcon name={expression.icon} />
                </span>

                <span>
                  <span className="sf-free-result-badge">{expression.badge}</span>
                  <p lang="en" className="sf-free-result-expression-text">
                    {renderInteractiveExpressionText
                      ? renderInteractiveExpressionText(
                          expression.text,
                          index,
                          expression.tone
                        )
                      : renderExpressionText(expression.text, expression.tone)}
                  </p>
                  {expression.description ? (
                    <span className="sf-free-result-note">
                      <CheckGlyph />
                      {expression.description}
                    </span>
                  ) : null}
                </span>

                <span className="sf-free-result-actions">
                  <button
                    type="button"
                    aria-label="播放这句表达"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectExpression(index);
                      onPlayExpression(index, 1);
                    }}
                    className="sf-free-result-play"
                  >
                    <PlayGlyph />
                  </button>
                  <button
                    type="button"
                    aria-label="0.5倍速播放这句表达"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectExpression(index);
                      onPlayExpression(index, 0.5);
                    }}
                    className="sf-free-result-slow"
                  >
                    0.5x
                  </button>
                </span>
              </article>
            );
          })}
        </section>

        <div className="sf-free-result-more">向下查看更多表达</div>
      </div>

      {isHelpOpen ? (
        <div
          className="sf-free-result-help-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="自由学习帮助"
          onClick={() => setIsHelpOpen(false)}
        >
          <section
            className="sf-free-result-help-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>自由学习怎么练？</h2>
              <button
                type="button"
                aria-label="关闭帮助"
                onClick={() => setIsHelpOpen(false)}
                className="sf-free-result-help-close"
              >
                <CloseGlyph />
              </button>
            </header>
            <p>
              这里会展示你刚才说的英文和 AI 推荐表达。你可以播放、0.5x 慢速听，
              也可以重新录一遍英文继续练习。
            </p>
          </section>
        </div>
      ) : null}
    </section>
  );
}
