"use client";

import { useEffect, useState } from "react";
import HomeMenuIcon from "@/components/HomeMenuIcon";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";

type FreeStudyPageOneProps = {
  accountLabel?: string;
  avatarAlt?: string;
  avatarSrc?: string;
  menuIcon?: "menu" | "home";
  menuLabel?: string;
  onAccountClick: () => void;
  onAvatarError?: () => void;
  onMenuClick: () => void;
  onMicrophoneClick: () => void;
  recordingState?: "idle" | "recording";
};

const flowSteps = [
  { icon: "mic", title: "说中文" },
  { icon: "chat", title: "试着说英文" },
  { icon: "robot", title: "AI 给你表达" },
  { icon: "light", title: "继续下一句" },
] as const;

const helpSteps = [
  {
    body: "点击麦克风，说出你现在想表达的内容。",
    icon: "mic",
    title: "先说中文",
  },
  {
    body: "如果识别有误，可以先编辑中文，再继续练习。",
    icon: "edit",
    title: "修改中文",
  },
  {
    body: "看着中文，用你自己的英文先说出来，不需要一开始就完美。",
    icon: "speak",
    title: "大胆说英文",
  },
  {
    body: "AI 会给你准确、地道、简洁等不同表达，你可以播放、跟读并收藏有用句子。",
    icon: "listen",
    title: "看推荐表达并跟读",
  },
] as const;

function MicGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 29a8 8 0 0 0 8-8v-8a8 8 0 0 0-16 0v8a8 8 0 0 0 8 8Z" />
      <path d="M11 22a13 13 0 0 0 26 0M24 35v8M18 43h12" />
    </svg>
  );
}

function ChatGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M8 18c0-7 6-12 16-12s16 5 16 12-6 12-16 12c-1.7 0-3.4-.1-4.9-.5L10 36l2.4-8.2C9.6 25.8 8 23.2 8 18Z" />
      <path d="M17 19h.1M24 19h.1M31 19h.1" />
    </svg>
  );
}

function RobotGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="10" y="14" width="28" height="23" rx="7" />
      <path d="M18 14v-4M30 14v-4M15 26h.1M33 26h.1M20 32c3 2 8 2 11 0" />
    </svg>
  );
}

function LightGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M15 21a9 9 0 1 1 18 0c0 4.8-3.4 7.2-5.2 10.5h-7.6C18.4 28.2 15 25.8 15 21Z" />
      <path d="M20 36h8M21 41h6" />
    </svg>
  );
}

function EditGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M11 37h8L36 20a4.3 4.3 0 0 0-6-6L13 31l-2 6Z" />
      <path d="m27 17 4 4M10 41h28" />
    </svg>
  );
}

function SpeakGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M19 10c-5 3-7 8-7 14s2.2 10.5 7 14" />
      <path d="M24 17c4 2 6 4.5 6 7s-2 5-6 7M34 14c5 4 7.5 7.5 7.5 10S39 30 34 34" />
    </svg>
  );
}

function ListenGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M11 25v-3a13 13 0 0 1 26 0v3" />
      <rect x="7" y="23" width="10" height="15" rx="5" />
      <rect x="31" y="23" width="10" height="15" rx="5" />
      <path d="M20 13h8M19 36l5-4 5 4" />
    </svg>
  );
}

function WaveGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M9 21v6M16 14v20M23 10v28M30 14v20M37 21v6" />
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

function HelpStepIcon({ icon }: { icon: (typeof helpSteps)[number]["icon"] }) {
  if (icon === "edit") return <EditGlyph />;
  if (icon === "speak") return <SpeakGlyph />;
  if (icon === "listen") return <ListenGlyph />;
  return <MicGlyph />;
}

function FlowIcon({ icon }: { icon: (typeof flowSteps)[number]["icon"] }) {
  if (icon === "chat") return <ChatGlyph />;
  if (icon === "robot") return <RobotGlyph />;
  if (icon === "light") return <LightGlyph />;
  return <MicGlyph />;
}

export default function FreeStudyPageOne({
  menuLabel = "回到学习首页",
  onMenuClick,
  onMicrophoneClick,
  recordingState = "idle",
}: FreeStudyPageOneProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isRecording = recordingState === "recording";

  useEffect(() => {
    if (!isHelpOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsHelpOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isHelpOpen]);

  return (
    <section
      className={`sf-free-start-page ${isRecording ? "is-recording" : "is-idle"} ${
        isHelpOpen ? "is-help-open" : ""
      }`}
      aria-label="自由学习第一页"
    >
      <style>{`
        .sf-free-start-page,
        .sf-free-start-page * {
          box-sizing: border-box;
        }

        .sf-free-start-page {
          position: absolute;
          inset: 0;
          z-index: 90;
          overflow-y: auto;
          overflow-x: hidden;
          color: #101342;
          background:
            radial-gradient(circle at 50% 43%, rgba(255,255,255,.92), transparent 32%),
            radial-gradient(circle at 18% 12%, rgba(238,219,255,.92), transparent 36%),
            radial-gradient(circle at 82% 78%, rgba(228,213,255,.78), transparent 34%),
            linear-gradient(180deg, #f2e9ff 0%, #fbf8ff 48%, #f3eaff 100%);
          font-family: var(--sf-font-zh, "PingFang SC", "Microsoft YaHei", sans-serif);
        }

        .sf-free-start-page.is-help-open {
          overflow: hidden;
        }

        .sf-free-start-frame {
          position: relative;
          min-height: 100%;
          isolation: isolate;
          padding: calc(env(safe-area-inset-top, 0px) + 1.45rem) clamp(1.35rem, 5vw, 1.85rem)
            calc(env(safe-area-inset-bottom, 0px) + 1.55rem);
        }

        .sf-free-start-frame::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 13.5%;
          z-index: -1;
          width: min(45rem, 118vw);
          aspect-ratio: 1;
          transform: translateX(-50%);
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.82);
          box-shadow:
            inset 0 0 0 1.65rem rgba(255,255,255,.16),
            inset 0 0 0 3.1rem rgba(255,255,255,.13),
            0 0 5.5rem rgba(157,97,255,.16);
        }

        .sf-free-start-header {
          display: grid;
          grid-template-columns: 3.55rem minmax(0, 1fr) 3.55rem;
          align-items: center;
          gap: .72rem;
        }

        .sf-free-start-home,
        .sf-free-start-help,
        .sf-free-start-help-close {
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: rgba(255,255,255,.88);
          color: #101342;
          box-shadow: 0 16px 30px rgba(97,73,170,.15), inset 0 1px 0 rgba(255,255,255,.96);
          cursor: pointer;
        }

        .sf-free-start-home,
        .sf-free-start-help {
          width: 3.55rem;
          height: 3.55rem;
        }

        .sf-free-start-help {
          justify-self: end;
          border: 1px solid rgba(124,89,238,.08);
          font-size: 1.55rem;
          font-weight: 950;
        }

        .sf-free-start-home .sf-home-menu-icon,
        .sf-free-start-home .sf-home-menu-icon svg {
          width: 2.12rem;
          height: 2.12rem;
          color: currentColor;
        }

        .sf-free-start-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .78rem;
          min-width: 0;
        }

        .sf-free-start-logo {
          display: grid;
          width: 3.65rem;
          height: 3.65rem;
          place-items: center;
          border-radius: 1.1rem;
          background: rgba(255,255,255,.94);
          box-shadow: 0 18px 30px rgba(119,76,205,.14);
        }

        .sf-free-start-logo svg {
          width: 2.6rem;
          height: 2.6rem;
        }

        .sf-free-start-brand-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
        }

        .sf-free-start-brand-title {
          color: #0b1244;
          font-size: clamp(2rem, 8.5vw, 2.85rem);
          font-weight: 950;
          line-height: .92;
          letter-spacing: 0;
        }

        .sf-free-start-brand-subtitle {
          margin-top: .45rem;
          color: #8a59ef;
          font-size: clamp(.72rem, 3vw, .98rem);
          font-weight: 850;
          line-height: 1;
          letter-spacing: .08em;
        }

        .sf-free-start-hero {
          position: relative;
          margin-top: clamp(4rem, 11dvh, 6.2rem);
          text-align: center;
        }

        .sf-free-start-spark {
          position: absolute;
          width: 1.15rem;
          aspect-ratio: 1;
          transform: rotate(45deg);
          background: rgba(255,255,255,.94);
          clip-path: polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);
        }

        .sf-free-start-spark.is-left {
          left: 4%;
          top: -2.4rem;
        }

        .sf-free-start-spark.is-right {
          right: 9%;
          top: -1.35rem;
        }

        .sf-free-start-title {
          margin: 0;
          color: transparent;
          background: linear-gradient(94deg, #101342 0%, #101342 33%, #7b52dc 71%, #925af0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          font-size: clamp(4.08rem, 17vw, 5.95rem);
          font-weight: 950;
          letter-spacing: 0;
          line-height: .97;
          white-space: nowrap;
        }

        .sf-free-start-page.is-recording .sf-free-start-title {
          font-size: clamp(3.18rem, 13.4vw, 4.86rem);
        }

        .sf-free-start-subtitle {
          margin: 1.05rem 0 0;
          color: rgba(37,39,83,.62);
          font-size: clamp(1.28rem, 5.4vw, 1.9rem);
          font-weight: 700;
          line-height: 1.45;
        }

        .sf-free-start-subtitle span {
          display: block;
        }

        .sf-free-start-recording-pill {
          display: none;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          margin-top: 1.2rem;
          color: #8353ef;
          font-size: 1.12rem;
          font-weight: 900;
        }

        .sf-free-start-recording-pill svg {
          width: 1.6rem;
          height: 1.6rem;
          stroke: currentColor;
          stroke-width: 3.8;
          stroke-linecap: round;
        }

        .sf-free-start-page.is-recording .sf-free-start-recording-pill {
          display: inline-flex;
        }

        .sf-free-start-mic-area {
          position: relative;
          display: grid;
          place-items: center;
          margin-top: clamp(2.3rem, 5.6dvh, 3.55rem);
        }

        .sf-free-start-mic-area::before,
        .sf-free-start-mic-area::after {
          content: "";
          position: absolute;
          width: min(24rem, 86vw);
          aspect-ratio: 1;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.74);
          box-shadow: 0 0 3.2rem rgba(171,103,255,.2);
        }

        .sf-free-start-mic-area::after {
          width: min(20rem, 72vw);
          opacity: .7;
        }

        .sf-free-start-mic {
          position: relative;
          z-index: 2;
          display: grid;
          width: clamp(13.6rem, 58vw, 17.2rem);
          aspect-ratio: 1;
          place-items: center;
          border: 4px solid rgba(255,255,255,.92);
          border-radius: 50%;
          background: linear-gradient(135deg, #f0a3ff 0%, #ac64f2 48%, #7556f4 100%);
          color: white;
          box-shadow:
            0 22px 42px rgba(126,82,234,.24),
            0 0 0 1.3rem rgba(255,255,255,.14),
            0 0 0 2.65rem rgba(255,255,255,.09);
          cursor: pointer;
        }

        .sf-free-start-page.is-recording .sf-free-start-mic {
          box-shadow:
            0 25px 46px rgba(126,82,234,.26),
            0 0 0 1.25rem rgba(255,255,255,.18),
            0 0 0 2.55rem rgba(160,94,244,.12),
            0 0 0 4.1rem rgba(255,255,255,.08);
        }

        .sf-free-start-mic svg {
          width: 50%;
          height: 50%;
          fill: currentColor;
          stroke: currentColor;
          stroke-width: 3.4;
          stroke-linecap: round;
        }

        .sf-free-start-wave-bars {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 1;
          display: none;
          width: min(32rem, 108vw);
          transform: translate(-50%, -50%);
          justify-content: space-between;
          pointer-events: none;
        }

        .sf-free-start-page.is-recording .sf-free-start-wave-bars {
          display: flex;
        }

        .sf-free-start-wave-group {
          display: flex;
          align-items: center;
          gap: .45rem;
          opacity: .44;
        }

        .sf-free-start-wave-group span {
          width: .42rem;
          border-radius: 999px;
          background: linear-gradient(180deg, #ad7cff, #7b55eb);
          animation: sf-free-start-wave 1s ease-in-out infinite alternate;
        }

        .sf-free-start-wave-group span:nth-child(2) { animation-delay: .08s; }
        .sf-free-start-wave-group span:nth-child(3) { animation-delay: .16s; }
        .sf-free-start-wave-group span:nth-child(4) { animation-delay: .24s; }
        .sf-free-start-wave-group span:nth-child(5) { animation-delay: .32s; }

        @keyframes sf-free-start-wave {
          from { transform: scaleY(.72); opacity: .42; }
          to { transform: scaleY(1.12); opacity: .8; }
        }

        .sf-free-start-tip-bubble {
          position: absolute;
          right: 0;
          top: -1.6rem;
          z-index: 4;
          min-width: 9.8rem;
          border: 1px solid rgba(153,112,235,.18);
          border-radius: 999px;
          background: rgba(255,255,255,.84);
          padding: .95rem 1.2rem;
          color: #8754ee;
          font-size: 1.15rem;
          font-weight: 900;
          box-shadow: 0 16px 32px rgba(107,76,188,.12), inset 0 1px 0 rgba(255,255,255,.92);
        }

        .sf-free-start-tip-bubble svg {
          position: absolute;
          right: 1rem;
          top: 100%;
          width: 4.6rem;
          height: 3.7rem;
          fill: none;
          stroke: #8d58ee;
          stroke-width: 6;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-start-page.is-recording .sf-free-start-tip-bubble {
          display: none;
        }

        .sf-free-start-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          width: 100%;
          min-height: 4.65rem;
          margin-top: clamp(2.3rem, 5dvh, 3.5rem);
          border: 1px solid rgba(255,255,255,.7);
          border-radius: 999px;
          background: linear-gradient(90deg, #dca2ff 0%, #9b60ef 52%, #7654f1 100%);
          color: white;
          box-shadow: 0 20px 38px rgba(136,82,239,.28), inset 0 1px 0 rgba(255,255,255,.55);
          font-size: clamp(1.6rem, 7.4vw, 2.24rem);
          font-weight: 950;
          letter-spacing: 0;
          cursor: pointer;
        }

        .sf-free-start-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .55rem;
          margin: 1.05rem 0 0;
          color: rgba(58,58,101,.72);
          font-size: clamp(.95rem, 4vw, 1.25rem);
          font-weight: 650;
        }

        .sf-free-start-note::before {
          content: "✓";
          display: grid;
          width: 1.35rem;
          height: 1.35rem;
          place-items: center;
          border: 2px solid #c392ff;
          border-radius: 50%;
          color: #9f66ee;
          font-size: .9rem;
          font-weight: 950;
        }

        .sf-free-start-help-card,
        .sf-free-start-small-tip {
          margin-top: 2rem;
          border: 1px solid rgba(159,121,230,.12);
          border-radius: 1.55rem;
          background: rgba(255,255,255,.72);
          box-shadow: 0 18px 42px rgba(111,78,182,.1), inset 0 1px 0 rgba(255,255,255,.92);
        }

        .sf-free-start-help-card {
          padding: 1.28rem 1rem 1.35rem;
        }

        .sf-free-start-help-card h2,
        .sf-free-start-small-tip strong {
          margin: 0;
          color: #101342;
          font-size: 1.25rem;
          font-weight: 950;
        }

        .sf-free-start-help-title {
          display: flex;
          align-items: center;
          gap: .55rem;
          margin-bottom: 1.2rem;
          color: #8d58ee;
        }

        .sf-free-start-flow {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: .35rem;
          align-items: start;
        }

        .sf-free-start-flow-item {
          position: relative;
          display: grid;
          justify-items: center;
          gap: .55rem;
          color: #20234f;
          font-size: .92rem;
          font-weight: 700;
          text-align: center;
        }

        .sf-free-start-flow-item:not(:last-child)::after {
          content: "";
          position: absolute;
          left: calc(50% + 1.55rem);
          top: 1.55rem;
          width: calc(100% - 2.8rem);
          border-top: 2px dashed rgba(156,112,237,.32);
        }

        .sf-free-start-flow-icon {
          display: grid;
          width: 3.45rem;
          height: 3.45rem;
          place-items: center;
          border-radius: 50%;
          background: rgba(238,230,255,.86);
          color: #8e57ee;
        }

        .sf-free-start-flow-icon svg {
          width: 2.05rem;
          height: 2.05rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 3.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-start-small-tip {
          display: none;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.35rem;
        }

        .sf-free-start-page.is-recording .sf-free-start-help-card {
          display: none;
        }

        .sf-free-start-page.is-recording .sf-free-start-small-tip {
          display: flex;
        }

        .sf-free-start-small-tip-icon {
          display: grid;
          width: 3.3rem;
          height: 3.3rem;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 50%;
          background: rgba(230,213,255,.88);
          color: #8a56ee;
        }

        .sf-free-start-small-tip-icon svg {
          width: 2rem;
          height: 2rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 3.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-start-small-tip span:last-child {
          display: block;
          margin-top: .28rem;
          color: rgba(42,43,86,.72);
          font-size: 1rem;
          font-weight: 650;
          line-height: 1.42;
        }

        .sf-free-help-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: grid;
          place-items: end center;
          overflow-y: auto;
          background: rgba(26,28,45,.36);
          padding: 1.6rem 1rem;
          backdrop-filter: blur(10px);
        }

        .sf-free-help-modal {
          width: min(100%, 25.5rem);
          border: 1px solid rgba(159,121,230,.18);
          border-radius: 2rem;
          background:
            radial-gradient(circle at 82% 12%, rgba(239,229,255,.9), transparent 26%),
            linear-gradient(180deg, rgba(255,255,255,.97), rgba(252,249,255,.96));
          box-shadow: 0 28px 60px rgba(37,31,78,.24), inset 0 1px 0 rgba(255,255,255,.95);
          padding: 1.35rem 1.2rem 1.25rem;
        }

        .sf-free-help-head {
          display: grid;
          grid-template-columns: 3rem minmax(0, 1fr) 3rem;
          align-items: center;
          gap: .75rem;
          margin-bottom: 1.4rem;
        }

        .sf-free-help-head .sf-free-start-brand {
          gap: .5rem;
        }

        .sf-free-help-head .sf-free-start-logo {
          width: 2.65rem;
          height: 2.65rem;
          border-radius: .88rem;
        }

        .sf-free-help-head .sf-free-start-brand-title {
          font-size: 1.72rem;
        }

        .sf-free-help-head .sf-free-start-brand-subtitle {
          font-size: .66rem;
        }

        .sf-free-start-help-close {
          width: 2.65rem;
          height: 2.65rem;
          justify-self: end;
          color: #121542;
        }

        .sf-free-start-help-close svg {
          width: 1.35rem;
          height: 1.35rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.6;
          stroke-linecap: round;
        }

        .sf-free-help-modal h2 {
          margin: .35rem 0 .35rem;
          text-align: center;
          color: #101342;
          font-size: 2rem;
          font-weight: 950;
          letter-spacing: 0;
        }

        .sf-free-help-intro {
          margin: 0 0 1.25rem;
          text-align: center;
          color: rgba(40,41,88,.7);
          font-size: 1rem;
          font-weight: 650;
          line-height: 1.5;
        }

        .sf-free-help-step-list {
          display: grid;
          gap: .55rem;
        }

        .sf-free-help-step {
          display: grid;
          grid-template-columns: 4.25rem minmax(0, 1fr) 1.2rem;
          align-items: center;
          gap: .85rem;
          border: 1px solid rgba(159,121,230,.13);
          border-radius: 1.2rem;
          background: rgba(255,255,255,.72);
          padding: .82rem .85rem;
          box-shadow: 0 10px 24px rgba(111,78,182,.08);
        }

        .sf-free-help-step-icon {
          display: grid;
          width: 3.5rem;
          height: 3.5rem;
          place-items: center;
          border-radius: 50%;
          background: rgba(236,228,255,.86);
          color: #8b56ee;
        }

        .sf-free-help-step-icon svg {
          width: 2.1rem;
          height: 2.1rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-help-step-number {
          display: inline-grid;
          width: 1.78rem;
          height: 1.78rem;
          place-items: center;
          border-radius: .5rem;
          background: linear-gradient(135deg, #ceb6ff, #8d59ee);
          color: white;
          font-weight: 950;
        }

        .sf-free-help-step h3 {
          margin: 0 0 .18rem;
          color: #101342;
          font-size: 1.16rem;
          font-weight: 950;
        }

        .sf-free-help-step p {
          margin: 0;
          color: rgba(37,39,83,.7);
          font-size: .9rem;
          font-weight: 620;
          line-height: 1.45;
        }

        .sf-free-help-chevron {
          color: #8b56ee;
          font-size: 2rem;
          font-weight: 300;
        }

        .sf-free-help-card {
          margin-top: .9rem;
          border: 1px solid rgba(159,121,230,.14);
          border-radius: 1.25rem;
          background: rgba(255,255,255,.72);
          padding: 1rem 1.05rem;
          color: #111642;
          box-shadow: 0 12px 28px rgba(111,78,182,.08);
        }

        .sf-free-help-card strong {
          display: block;
          margin-bottom: .45rem;
          font-size: 1.05rem;
          font-weight: 950;
        }

        .sf-free-help-card ul {
          margin: 0;
          padding-left: 1.2rem;
          color: rgba(37,39,83,.72);
          font-size: .92rem;
          font-weight: 620;
          line-height: 1.7;
        }

        .sf-free-help-ok {
          width: 100%;
          min-height: 3.35rem;
          margin-top: 1rem;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(90deg, #b174ff, #7a52ee);
          color: white;
          font-size: 1.22rem;
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(128,82,236,.28), inset 0 1px 0 rgba(255,255,255,.45);
          cursor: pointer;
        }

        @media (max-width: 360px) {
          .sf-free-start-frame {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .sf-free-start-title {
            font-size: 3.52rem;
          }

          .sf-free-start-page.is-recording .sf-free-start-title {
            font-size: 2.82rem;
          }

          .sf-free-start-flow-item {
            font-size: .78rem;
          }
        }
      `}</style>

      <div className="sf-free-start-frame">
        <header className="sf-free-start-header">
          <button
            type="button"
            aria-label={menuLabel}
            onClick={onMenuClick}
            className="sf-free-start-home"
          >
            <HomeMenuIcon label={null} showHint={false} />
          </button>

          <div className="sf-free-start-brand" aria-label="SpeakFlow AI Voice Practice">
            <span className="sf-free-start-logo" aria-hidden="true">
              <SpeakFlowBrandMark />
            </span>
            <span className="sf-free-start-brand-copy">
              <span className="sf-free-start-brand-title">SpeakFlow</span>
              <span className="sf-free-start-brand-subtitle">AI VOICE PRACTICE</span>
            </span>
          </div>

          <button
            type="button"
            aria-label="打开自由学习帮助"
            onClick={() => setIsHelpOpen(true)}
            className="sf-free-start-help"
          >
            ?
          </button>
        </header>

        <main>
          <section className="sf-free-start-hero" aria-live="polite">
            <span className="sf-free-start-spark is-left" aria-hidden="true" />
            <span className="sf-free-start-spark is-right" aria-hidden="true" />
            <h1 className="sf-free-start-title">
              {isRecording ? "正在听你说话..." : "先说中文"}
            </h1>
            <p className="sf-free-start-subtitle">
              {isRecording ? (
                <>
                  大胆说出你想表达的中文
                  <span>AI 会一步步帮你优化</span>
                </>
              ) : (
                "AI 帮你变成自然英语"
              )}
            </p>
            <span className="sf-free-start-recording-pill">
              <WaveGlyph />
              录音中
            </span>
          </section>

          <section className="sf-free-start-mic-area">
            <span className="sf-free-start-tip-bubble">
              点这里，说中文
              <svg viewBox="0 0 112 88" aria-hidden="true" focusable="false">
                <path d="M96 8C84 43 60 61 24 63" />
                <path d="M35 47 20 64l20 12" />
              </svg>
            </span>
            <span className="sf-free-start-wave-bars" aria-hidden="true">
              <span className="sf-free-start-wave-group">
                {[24, 48, 64, 46, 28].map((height) => (
                  <span key={`left-${height}`} style={{ height }} />
                ))}
              </span>
              <span className="sf-free-start-wave-group">
                {[28, 46, 64, 48, 24].map((height) => (
                  <span key={`right-${height}`} style={{ height }} />
                ))}
              </span>
            </span>
            <button
              type="button"
              aria-label={isRecording ? "点击麦克风结束录音" : "点这里说中文"}
              onClick={onMicrophoneClick}
              className="sf-free-start-mic"
            >
              <MicGlyph />
            </button>
          </section>

          <button
            type="button"
            onClick={onMicrophoneClick}
            className="sf-free-start-primary"
          >
            <span aria-hidden="true">🎤</span>
            {isRecording ? "点击麦克风结束录音" : "点我说中文"}
          </button>

          <p className="sf-free-start-note">
            免费体验 5 句 · 登录可保存学习记录
          </p>

          <section className="sf-free-start-help-card" aria-label="怎么练">
            <div className="sf-free-start-help-title">
              <span aria-hidden="true">✦</span>
              <h2>怎么练？</h2>
            </div>
            <div className="sf-free-start-flow">
              {flowSteps.map((step) => (
                <div className="sf-free-start-flow-item" key={step.title}>
                  <span className="sf-free-start-flow-icon">
                    <FlowIcon icon={step.icon} />
                  </span>
                  <span>{step.title}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="sf-free-start-small-tip" aria-label="小提示">
            <span className="sf-free-start-small-tip-icon">
              <LightGlyph />
            </span>
            <span>
              <strong>小提示</strong>
              <span>尽量完整表达，你说得越多，AI 给出的建议会越精准！</span>
            </span>
            <WaveGlyph />
          </section>
        </main>
      </div>

      {isHelpOpen ? (
        <div
          className="sf-free-help-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="自由学习帮助"
          onClick={() => setIsHelpOpen(false)}
        >
          <section
            className="sf-free-help-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="sf-free-help-head">
              <button
                type="button"
                aria-label={menuLabel}
                onClick={onMenuClick}
                className="sf-free-start-home"
              >
                <HomeMenuIcon label={null} showHint={false} />
              </button>

              <div className="sf-free-start-brand" aria-label="SpeakFlow AI Voice Practice">
                <span className="sf-free-start-logo" aria-hidden="true">
                  <SpeakFlowBrandMark />
                </span>
                <span className="sf-free-start-brand-copy">
                  <span className="sf-free-start-brand-title">SpeakFlow</span>
                  <span className="sf-free-start-brand-subtitle">AI VOICE PRACTICE</span>
                </span>
              </div>

              <button
                type="button"
                aria-label="关闭帮助"
                onClick={() => setIsHelpOpen(false)}
                className="sf-free-start-help-close"
              >
                <CloseGlyph />
              </button>
            </header>

            <h2>自由学习怎么练？</h2>
            <p className="sf-free-help-intro">
              想说什么就说什么，AI 会帮你一步步变成自然英语。
            </p>

            <div className="sf-free-help-step-list">
              {helpSteps.map((step, index) => (
                <article className="sf-free-help-step" key={step.title}>
                  <span className="sf-free-help-step-icon">
                    <HelpStepIcon icon={step.icon} />
                  </span>
                  <span>
                    <span className="sf-free-help-step-number">{index + 1}</span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </span>
                  <span className="sf-free-help-chevron" aria-hidden="true">
                    ›
                  </span>
                </article>
              ))}
            </div>

            <section className="sf-free-help-card">
              <strong>自由学习和 AI 引导表达有什么不同？</strong>
              <ul>
                <li>自由学习：你自己决定想说什么</li>
                <li>没有固定下一句，更适合随时练习</li>
                <li>更像真实表达训练</li>
              </ul>
            </section>

            <section className="sf-free-help-card">
              <strong>小提示</strong>
              <ul>
                <li>先自然表达，不要一开始就追求完美。</li>
                <li>中文越清楚，AI 给出的建议通常越准确。</li>
                <li>遇到喜欢的表达，记得收藏到新表达。</li>
              </ul>
            </section>

            <button
              type="button"
              className="sf-free-help-ok"
              onClick={() => setIsHelpOpen(false)}
            >
              我知道了，开始自由学习
            </button>
          </section>
        </div>
      ) : null}
    </section>
  );
}
