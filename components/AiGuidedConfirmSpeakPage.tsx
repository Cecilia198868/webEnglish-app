"use client";

import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AiGuidedExpressionHelpModal from "@/components/AiGuidedExpressionHelpModal";
import { FREE_PRACTICE_DAILY_LIMIT } from "@/lib/freePracticeLimit";

type ConfirmSpeakState = "confirmChinese" | "recordingEnglish";

type AiGuidedConfirmSpeakPageProps = {
  chineseText: string;
  hasProEntitlement?: boolean;
  viewState: ConfirmSpeakState;
  menuLabel?: string;
  onAccountClick: () => void;
  onMenuClick: () => void;
  onEditChinese: (value: string) => void;
  onRetryChinese: () => void;
  onStartEnglishRecording: () => void;
  onStopEnglishRecording: () => void;
};

type AiGuidedProgressStepId =
  | "native"
  | "english"
  | "suggestions"
  | "follow";

type AiGuidedProgressStepStatus = "active" | "completed" | "locked";

type AiGuidedProgressSnapshot = {
  challenge?: {
    completed?: number;
    goal?: number;
    percent?: number;
  };
  dailyGoal?: number;
  level?: number;
  steps?: Partial<
    Record<
      AiGuidedProgressStepId,
      {
        id?: AiGuidedProgressStepId;
        label?: string;
        status?: AiGuidedProgressStepStatus;
      }
    >
  >;
  streakDays?: number;
  todayCompleted?: number;
  totalCompleted?: number;
};

const emptyChineseText = "这里会显示你刚才说的中文";

const progressStepOrder: Array<{
  id: AiGuidedProgressStepId;
  fallbackLabel: string;
}> = [
  { id: "native", fallbackLabel: "说中文" },
  { id: "english", fallbackLabel: "试着说英文" },
  { id: "suggestions", fallbackLabel: "AI 给你表达" },
  { id: "follow", fallbackLabel: "继续下一句" },
];

const progressStatusCopy: Record<AiGuidedProgressStepStatus, string> = {
  active: "进行中",
  completed: "已完成",
  locked: "待练习",
};

function getChineseCharacterCount(value: string) {
  return Array.from(value.replace(/\s/g, "")).length;
}

function getChineseTextSize(value: string) {
  const count = getChineseCharacterCount(value);
  if (count <= 10) return 1.76;
  if (count <= 22) return 1.54;
  if (count <= 42) return 1.3;
  return 1.08;
}

function MicGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 29a8 8 0 0 0 8-8v-8a8 8 0 0 0-16 0v8a8 8 0 0 0 8 8Z" />
      <path d="M11 22a13 13 0 0 0 26 0M24 35v8M18 43h12" />
    </svg>
  );
}

function EditGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 19h4.2L18.4 9.8a2.2 2.2 0 0 0-3.1-3.1L6.1 15.9 5 19Z" />
      <path d="m13.8 8.2 2 2M4.8 21h14.4" />
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

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function ShieldGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3 19 6v5.2c0 4.6-2.9 7.9-7 9.8-4.1-1.9-7-5.2-7-9.8V6l7-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

function SparkleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.6 14.9 9l6.5 3-6.5 3-2.9 6.4L9.1 15l-6.5-3 6.5-3L12 2.6Z" />
      <path d="m19 2.5.9 2.1 2.1.9-2.1.9L19 8.5l-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
    </svg>
  );
}

function BottomHomeIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient
          id="sf-ai-confirm-bottom-home-gradient"
          x1="9"
          x2="39"
          y1="39"
          y2="8"
        >
          <stop offset="0" stopColor="#5e79ff" />
          <stop offset="1" stopColor="#914cff" />
        </linearGradient>
      </defs>
      <path
        d="M8 21.6 24 8l16 13.6v16.2a4 4 0 0 1-4 4h-7.7V29.3h-8.6v12.5H12a4 4 0 0 1-4-4V21.6Z"
        fill="url(#sf-ai-confirm-bottom-home-gradient)"
      />
    </svg>
  );
}

function BottomProgressIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M12 34V21" />
      <path d="M20 34V12" />
      <path d="M28 34V17" />
      <path d="M36 34V9" />
    </svg>
  );
}

function BottomHelpIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 7.5c-9.4 0-17 6.4-17 14.3 0 4.7 2.7 8.9 6.9 11.5l-1.5 7.2 7.2-4.8c1.4.3 2.9.5 4.4.5 9.4 0 17-6.4 17-14.4S33.4 7.5 24 7.5Z" />
      <path d="M19.2 18.8a5.1 5.1 0 0 1 9.8 2.1c0 3.8-5 4.1-5 7.2" />
      <path d="M24 34.2h.1" />
    </svg>
  );
}

function BottomAccountIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="15.2" r="7.1" />
      <path d="M11.8 40c1.5-8 6-12 12.2-12s10.7 4 12.2 12" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <span className="sf-ai-confirm-speak-title-wave" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function WaveBars({ side }: { side: "left" | "right" }) {
  return (
    <span
      className={`sf-ai-confirm-speak-wave-bars sf-ai-confirm-speak-wave-bars-${side}`}
      aria-hidden="true"
    >
      {Array.from({ length: 7 }).map((_, index) => (
        <span key={`${side}-${index}`} />
      ))}
    </span>
  );
}

export default function AiGuidedConfirmSpeakPage({
  chineseText,
  hasProEntitlement = false,
  viewState,
  menuLabel = "回到学习首页",
  onAccountClick,
  onMenuClick,
  onEditChinese,
  onRetryChinese,
  onStartEnglishRecording,
  onStopEnglishRecording,
}: AiGuidedConfirmSpeakPageProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressSnapshot, setProgressSnapshot] =
    useState<AiGuidedProgressSnapshot | null>(null);
  const isRecordingEnglish = viewState === "recordingEnglish";
  const displayChineseText = chineseText.trim() || emptyChineseText;
  const chineseTextSize = getChineseTextSize(displayChineseText);
  const chineseTextStyle = {
    "--sf-ai-confirm-speak-chinese-size": `${chineseTextSize.toFixed(3)}rem`,
  } as CSSProperties;

  useEffect(() => {
    if (!isProgressOpen) return;

    let isActive = true;

    async function loadProgress() {
      setIsProgressLoading(true);
      setProgressError("");

      try {
        const response = await fetch("/api/ai-guided-expression/progress", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Progress request failed");
        }

        const snapshot = (await response.json()) as AiGuidedProgressSnapshot;
        if (isActive) {
          setProgressSnapshot(snapshot);
        }
      } catch {
        if (isActive) {
          setProgressError("学习进度暂时没有同步成功，请稍后再试。");
        }
      } finally {
        if (isActive) {
          setIsProgressLoading(false);
        }
      }
    }

    void loadProgress();

    return () => {
      isActive = false;
    };
  }, [isProgressOpen]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const maxHeight = Number.parseFloat(getComputedStyle(textarea).maxHeight);
    const nextHeight = Number.isFinite(maxHeight)
      ? Math.min(textarea.scrollHeight, maxHeight)
      : textarea.scrollHeight;
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > nextHeight + 1 ? "auto" : "hidden";
  }, [chineseText]);

  function focusChineseText() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
  }

  function handleStartEnglishRecording() {
    if (!chineseText.trim() || isRecordingEnglish) return;
    onStartEnglishRecording();
  }

  const todayCompleted = progressSnapshot?.todayCompleted ?? 0;
  const dailyGoal = progressSnapshot?.dailyGoal ?? FREE_PRACTICE_DAILY_LIMIT;
  const streakDays = progressSnapshot?.streakDays ?? 0;
  const totalCompleted = progressSnapshot?.totalCompleted ?? 0;
  const challengeCompleted = progressSnapshot?.challenge?.completed ?? 0;
  const challengeGoal = progressSnapshot?.challenge?.goal ?? dailyGoal;
  const challengePercent = Math.max(
    0,
    Math.min(100, Math.round(progressSnapshot?.challenge?.percent ?? 0))
  );

  return (
    <section
      className={`sf-ai-confirm-speak-page ${
        isRecordingEnglish ? "is-recording-english" : "is-confirm-chinese"
      } ${isHelpOpen ? "is-help-open" : ""} ${
        isProgressOpen ? "is-progress-open" : ""
      }`}
      aria-label={isRecordingEnglish ? "看着中文说英文" : "确认识别出的中文"}
    >
      <style>{`
        .sf-ai-confirm-speak-page,
        .sf-ai-confirm-speak-page * {
          box-sizing: border-box;
        }

        .sf-ai-confirm-speak-page {
          width: 100%;
          height: 100dvh;
          min-height: 100dvh;
          overflow-x: hidden;
          overflow-y: auto;
          color: #080d33;
          background:
            radial-gradient(circle at 14% 12%, rgba(224, 244, 255, 0.82), transparent 32%),
            radial-gradient(circle at 86% 40%, rgba(236, 229, 255, 0.7), transparent 34%),
            linear-gradient(180deg, #eff9ff 0%, #fbfdff 47%, #f4f6ff 100%);
          font-family: var(--sf-font-zh, "PingFang SC", "Microsoft YaHei", sans-serif);
          -webkit-font-smoothing: antialiased;
        }

        .sf-ai-confirm-speak-page.is-help-open,
        .sf-ai-confirm-speak-page.is-progress-open {
          overflow: hidden;
        }

        .sf-ai-confirm-speak-frame {
          position: relative;
          isolation: isolate;
          width: min(100%, 430px);
          min-height: 100dvh;
          margin: 0 auto;
          padding: calc(env(safe-area-inset-top, 0px) + clamp(0.1rem, 0.6dvh, 0.28rem))
            clamp(0.88rem, 4.5vw, 1.2rem)
            calc(env(safe-area-inset-bottom, 0px) + 6.1rem);
          overflow: hidden;
        }

        .sf-ai-confirm-speak-frame::before {
          content: "";
          position: absolute;
          inset: 2.15rem -4rem auto;
          z-index: -1;
          height: 12rem;
          border: 1px solid rgba(255, 255, 255, 0.68);
          border-bottom: 0;
          border-radius: 999px 999px 0 0;
          opacity: 0.54;
        }

        .sf-ai-confirm-speak-header {
          display: grid;
          grid-template-columns: clamp(2.1rem, 9.5vw, 2.58rem) minmax(0, 1fr) clamp(2.1rem, 9.5vw, 2.58rem);
          align-items: center;
          gap: clamp(0.42rem, 2vw, 0.62rem);
          min-height: clamp(2.34rem, 10vw, 2.9rem);
        }

        .sf-ai-confirm-speak-home,
        .sf-ai-confirm-speak-help,
        .sf-ai-confirm-speak-retry-button,
        .sf-ai-confirm-speak-confirm-button,
        .sf-ai-confirm-speak-mic,
        .sf-ai-confirm-speak-stop-button {
          border: 0;
          padding: 0;
          font: inherit;
          cursor: pointer;
          appearance: none;
          -webkit-tap-highlight-color: transparent;
        }

        .sf-ai-confirm-speak-home,
        .sf-ai-confirm-speak-help {
          display: grid;
          width: clamp(2.1rem, 9.5vw, 2.58rem);
          height: clamp(2.1rem, 9.5vw, 2.58rem);
          place-items: center;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.86);
          color: #07103a;
          box-shadow:
            0 0.7rem 1.4rem rgba(72, 92, 149, 0.13),
            inset 0 0 0 1px rgba(218, 226, 246, 0.78);
          transition: transform 150ms ease;
        }

        .sf-ai-confirm-speak-home:active,
        .sf-ai-confirm-speak-help:active,
        .sf-ai-confirm-speak-edit:active,
        .sf-ai-confirm-speak-retry-button:active,
        .sf-ai-confirm-speak-confirm-button:active,
        .sf-ai-confirm-speak-mic:active,
        .sf-ai-confirm-speak-stop-button:active {
          transform: scale(0.97);
        }

        .sf-ai-confirm-speak-home:focus-visible,
        .sf-ai-confirm-speak-help:focus-visible,
        .sf-ai-confirm-speak-edit:focus-visible,
        .sf-ai-confirm-speak-retry-button:focus-visible,
        .sf-ai-confirm-speak-confirm-button:focus-visible,
        .sf-ai-confirm-speak-mic:focus-visible,
        .sf-ai-confirm-speak-stop-button:focus-visible {
          outline: 3px solid rgba(132, 88, 255, 0.34);
          outline-offset: 3px;
        }

        .sf-ai-confirm-speak-home .sf-home-menu-icon,
        .sf-ai-confirm-speak-home .sf-home-menu-icon svg {
          width: 58%;
          height: 58%;
        }

        .sf-ai-confirm-speak-home .sf-home-menu-icon svg {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.85;
        }

        .sf-ai-confirm-speak-help {
          justify-self: end;
          font-size: clamp(1rem, 4.8vw, 1.35rem);
          font-weight: 950;
          line-height: 1;
        }

        .sf-ai-confirm-speak-brand {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.32rem, 1.7vw, 0.48rem);
        }

        .sf-ai-confirm-speak-logo {
          display: grid;
          width: clamp(1.66rem, 7.9vw, 2.08rem);
          height: clamp(1.66rem, 7.9vw, 2.08rem);
          flex: 0 0 auto;
          place-items: center;
          border-radius: 0.62rem;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: inset 0 0 0 1px rgba(224, 218, 255, 0.72);
        }

        .sf-ai-confirm-speak-logo-mark {
          width: 78%;
          height: 78%;
        }

        .sf-ai-confirm-speak-brand-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1;
        }

        .sf-ai-confirm-speak-brand-title {
          max-width: 100%;
          color: #07103a;
          font-size: clamp(1.06rem, 4.55vw, 1.38rem);
          font-weight: 1000;
          letter-spacing: 0;
          line-height: 0.95;
          white-space: nowrap;
        }

        .sf-ai-confirm-speak-brand-subtitle {
          margin-top: 0.18rem;
          color: #4e62ff !important;
          font-size: clamp(0.41rem, 1.92vw, 0.57rem);
          font-weight: 900;
          letter-spacing: 0.16em;
          line-height: 1;
          white-space: nowrap;
        }

        .sf-ai-confirm-speak-addon {
          margin-top: 0.36rem;
        }

        .sf-ai-confirm-speak-content {
          display: flex;
          flex-direction: column;
          min-height: auto;
          padding-top: clamp(2.55rem, 5.8dvh, 3.35rem);
        }

        .sf-ai-confirm-speak-title-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.75rem;
        }

        .sf-ai-confirm-speak-title {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.42rem;
          color: #07103a;
          font-size: clamp(1.26rem, 5.75vw, 1.58rem);
          font-weight: 950;
          letter-spacing: 0;
          line-height: 1.12;
          text-align: left;
        }

        .sf-ai-confirm-speak-title svg {
          width: 1.36rem;
          height: 1.36rem;
          fill: #875cff;
          flex: 0 0 auto;
          filter: drop-shadow(0 0.32rem 0.6rem rgba(142, 98, 255, 0.18));
        }

        .sf-ai-confirm-speak-chinese-card {
          position: relative;
          margin-top: clamp(0.54rem, 2.2dvh, 0.84rem);
          min-height: clamp(11.9rem, 27.6dvh, 13.4rem);
          border: 1px solid rgba(214, 224, 247, 0.9);
          border-radius: clamp(1.12rem, 5vw, 1.38rem);
          background: rgba(255, 255, 255, 0.88);
          box-shadow:
            0 1.05rem 2.5rem rgba(81, 96, 156, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
          padding: clamp(0.86rem, 3.6vw, 1.08rem);
          backdrop-filter: blur(16px);
        }

        .sf-ai-confirm-speak-card-head {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-height: 1.35rem;
        }

        .sf-ai-confirm-speak-edit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.36rem;
          border: 0;
          border-radius: 0;
          background: rgba(255, 255, 255, 0.76);
          color: #6547ff;
          padding: 0.52rem 0.78rem;
          font-size: clamp(0.88rem, 3.9vw, 1.02rem);
          font-weight: 900;
          line-height: 1;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.9);
        }

        .sf-ai-confirm-speak-edit svg {
          width: 1.08rem;
          height: 1.08rem;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.35;
        }

        .sf-ai-confirm-speak-textarea {
          width: 100%;
          min-height: clamp(5.72rem, 19dvh, 6.92rem);
          max-height: clamp(8.8rem, 23.6dvh, 10.5rem);
          margin-top: 0;
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          appearance: none;
          color: #070d34;
          resize: none;
          text-align: left;
          font: inherit;
          font-size: var(--sf-ai-confirm-speak-chinese-size);
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1.58;
          outline: none;
          padding: clamp(1.44rem, 5.8dvh, 2.3rem) clamp(1.3rem, 6vw, 2.05rem) 0;
        }

        .sf-ai-confirm-speak-textarea::placeholder {
          color: rgba(61, 72, 114, 0.52);
        }

        .sf-ai-confirm-speak-card-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.42rem;
          margin: clamp(0.58rem, 2.4dvh, 0.78rem) 0 0;
          color: rgba(45, 58, 112, 0.72);
          font-size: clamp(0.63rem, 2.9vw, 0.75rem);
          font-weight: 720;
          line-height: 1.35;
          text-align: center;
        }

        .sf-ai-confirm-speak-card-note svg {
          width: 1.02rem;
          height: 1.02rem;
          flex: 0 0 auto;
          fill: url(#sf-ai-confirm-shield-gradient);
          stroke: #ffffff;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0.35rem 0.72rem rgba(118, 90, 255, 0.22));
        }

        .sf-ai-confirm-speak-actions {
          display: grid;
          grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.32fr);
          gap: clamp(0.58rem, 2.9vw, 0.86rem);
          margin-top: clamp(0.72rem, 3dvh, 0.96rem);
        }

        .sf-ai-confirm-speak-retry-button,
        .sf-ai-confirm-speak-confirm-button {
          min-width: 0;
          min-height: clamp(2.86rem, 11.2vw, 3.36rem);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.38rem;
          border-radius: 1rem;
          font-weight: 920;
          letter-spacing: 0;
          line-height: 1.16;
          box-shadow:
            0 0.82rem 1.7rem rgba(76, 92, 151, 0.11),
            inset 0 1px 0 rgba(255, 255, 255, 0.92);
          transition: opacity 160ms ease, transform 160ms ease, box-shadow 160ms ease;
        }

        .sf-ai-confirm-speak-retry-button {
          background: rgba(255, 255, 255, 0.84);
          color: #08103a;
          font-size: clamp(0.73rem, 3.35vw, 0.88rem);
        }

        .sf-ai-confirm-speak-confirm-button {
          background: linear-gradient(135deg, #bd86ff 0%, #7454ff 50%, #1c66ff 100%);
          color: #fff !important;
          font-size: clamp(0.64rem, 3vw, 0.8rem);
          padding-inline: 0.48rem;
          text-align: center;
          box-shadow:
            0 0.9rem 1.9rem rgba(124, 86, 255, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.52);
        }

        .sf-ai-confirm-speak-confirm-button:disabled,
        .sf-ai-confirm-speak-confirm-button.is-recording-disabled {
          cursor: default;
          color: rgba(123, 96, 190, 0.56) !important;
          background: rgba(255, 255, 255, 0.54);
          box-shadow: inset 0 0 0 1px rgba(193, 169, 255, 0.58);
        }

        .sf-ai-confirm-speak-retry-button svg,
        .sf-ai-confirm-speak-confirm-button svg {
          width: clamp(0.96rem, 4.2vw, 1.14rem);
          height: clamp(0.96rem, 4.2vw, 1.14rem);
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.45;
          flex: 0 0 auto;
        }

        .sf-ai-confirm-speak-divider {
          margin: clamp(0.82rem, 3.4dvh, 1.08rem) 0 clamp(0.62rem, 2.6dvh, 0.84rem);
          border-top: 2px dashed rgba(216, 199, 255, 0.55);
        }

        .sf-ai-confirm-speak-record-panel {
          position: relative;
          border: 1px solid rgba(217, 224, 247, 0.9);
          border-radius: clamp(1.06rem, 4.9vw, 1.36rem);
          background: rgba(255, 255, 255, 0.78);
          box-shadow:
            0 1.05rem 2.35rem rgba(86, 99, 153, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
          padding: clamp(0.9rem, 3.7vw, 1.12rem) clamp(0.78rem, 3.6vw, 1.06rem);
          text-align: center;
          overflow: hidden;
          transition: opacity 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }

        .sf-ai-confirm-speak-record-panel::before {
          content: "";
          position: absolute;
          inset: auto 8% -25% 8%;
          height: 8rem;
          background: radial-gradient(circle, rgba(169, 133, 255, 0.13), transparent 67%);
          pointer-events: none;
        }

        .sf-ai-confirm-speak-record-panel-idle {
          opacity: 0.55;
          min-height: clamp(9.5rem, 31dvh, 11.2rem);
        }

        .sf-ai-confirm-speak-record-panel-active {
          opacity: 1;
          min-height: clamp(14.2rem, 41dvh, 16.5rem);
          border-color: rgba(199, 213, 255, 0.86);
          box-shadow:
            0 1.24rem 2.9rem rgba(83, 105, 210, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
        }

        .sf-ai-confirm-speak-record-title {
          position: relative;
          z-index: 1;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          color: #315fff;
          font-size: clamp(1rem, 4.35vw, 1.16rem);
          font-weight: 950;
          line-height: 1.18;
        }

        .sf-ai-confirm-speak-record-title > svg {
          width: 1rem;
          height: 1rem;
          fill: currentColor;
          flex: 0 0 auto;
        }

        .sf-ai-confirm-speak-record-panel-idle .sf-ai-confirm-speak-record-title {
          color: rgba(70, 69, 107, 0.66);
          font-size: clamp(0.92rem, 4vw, 1.06rem);
          line-height: 1.3;
        }

        .sf-ai-confirm-speak-record-copy {
          position: relative;
          z-index: 1;
          margin: 0.32rem 0 0;
          color: rgba(54, 62, 106, 0.68);
          font-size: clamp(0.64rem, 2.95vw, 0.76rem);
          font-weight: 720;
          line-height: 1.32;
        }

        .sf-ai-confirm-speak-listening-copy {
          position: relative;
          z-index: 1;
          margin: 0.52rem 0 0;
          color: #315fff;
          font-size: clamp(0.82rem, 3.55vw, 0.96rem);
          font-weight: 900;
          line-height: 1.15;
        }

        .sf-ai-confirm-speak-title-wave {
          display: inline-flex;
          align-items: center;
          gap: 0.1rem;
          height: 1rem;
          color: #b080ff;
        }

        .sf-ai-confirm-speak-title-wave span {
          width: 0.12rem;
          border-radius: 999px;
          background: currentColor;
          animation: sf-ai-confirm-speak-wave 860ms ease-in-out infinite;
        }

        .sf-ai-confirm-speak-title-wave span:nth-child(1),
        .sf-ai-confirm-speak-title-wave span:nth-child(5) { height: 0.38rem; }
        .sf-ai-confirm-speak-title-wave span:nth-child(2),
        .sf-ai-confirm-speak-title-wave span:nth-child(4) { height: 0.72rem; animation-delay: 90ms; }
        .sf-ai-confirm-speak-title-wave span:nth-child(3) { height: 1rem; animation-delay: 180ms; }

        .sf-ai-confirm-speak-mic-area {
          position: relative;
          z-index: 1;
          min-height: clamp(5.9rem, 24vw, 7rem);
          margin-top: clamp(0.7rem, 2.8vw, 0.92rem);
          display: grid;
          place-items: center;
        }

        .sf-ai-confirm-speak-mic-wrap {
          position: relative;
          display: grid;
          width: clamp(4.8rem, 20.5vw, 5.75rem);
          aspect-ratio: 1;
          place-items: center;
        }

        .sf-ai-confirm-speak-mic-wrap::before,
        .sf-ai-confirm-speak-mic-wrap::after {
          content: "";
          position: absolute;
          inset: -0.44rem;
          border-radius: 999px;
          background: rgba(170, 133, 255, 0.1);
          pointer-events: none;
        }

        .sf-ai-confirm-speak-mic-wrap::after {
          inset: -0.92rem;
          border: 1px solid rgba(162, 139, 255, 0.14);
          background: transparent;
        }

        .sf-ai-confirm-speak-record-panel-active .sf-ai-confirm-speak-mic-wrap::before {
          animation: sf-ai-confirm-speak-pulse 1.75s ease-in-out infinite;
          background: rgba(83, 113, 255, 0.18);
        }

        .sf-ai-confirm-speak-record-panel-active .sf-ai-confirm-speak-mic-wrap::after {
          animation: sf-ai-confirm-speak-pulse 1.75s ease-in-out infinite 260ms;
        }

        .sf-ai-confirm-speak-mic {
          position: relative;
          z-index: 1;
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          border-radius: 999px;
          background: linear-gradient(135deg, #f3f6ff 0%, #e4e8ff 100%);
          color: rgba(118, 123, 151, 0.54);
          box-shadow:
            0 0.74rem 1.6rem rgba(96, 105, 158, 0.1),
            inset 0 0 0 0.28rem rgba(255, 255, 255, 0.78);
        }

        .sf-ai-confirm-speak-mic-active {
          background:
            radial-gradient(circle at 33% 22%, rgba(255, 255, 255, 0.52), transparent 18%),
            linear-gradient(135deg, #8a6dff 0%, #3459ff 56%, #1430c5 100%);
          color: #ffffff;
          box-shadow:
            0 1rem 2.2rem rgba(101, 70, 226, 0.32),
            inset 0 0 0 0.3rem rgba(255, 255, 255, 0.88);
        }

        .sf-ai-confirm-speak-mic svg {
          width: 48%;
          height: 48%;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 3.75;
        }

        .sf-ai-confirm-speak-wave-bars {
          position: absolute;
          top: 50%;
          width: clamp(3.35rem, 16vw, 4.35rem);
          height: clamp(2.95rem, 13vw, 3.7rem);
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(145, 180, 255, 0.46);
          pointer-events: none;
        }

        .sf-ai-confirm-speak-wave-bars-left {
          right: calc(50% + clamp(3.2rem, 14.5vw, 4.05rem));
        }

        .sf-ai-confirm-speak-wave-bars-right {
          left: calc(50% + clamp(3.2rem, 14.5vw, 4.05rem));
        }

        .sf-ai-confirm-speak-wave-bars span {
          width: 0.14rem;
          border-radius: 999px;
          background: currentColor;
          animation: sf-ai-confirm-speak-wave 1.1s ease-in-out infinite;
        }

        .sf-ai-confirm-speak-wave-bars span:nth-child(1),
        .sf-ai-confirm-speak-wave-bars span:nth-child(7) { height: 24%; }
        .sf-ai-confirm-speak-wave-bars span:nth-child(2),
        .sf-ai-confirm-speak-wave-bars span:nth-child(6) { height: 48%; animation-delay: 100ms; }
        .sf-ai-confirm-speak-wave-bars span:nth-child(3),
        .sf-ai-confirm-speak-wave-bars span:nth-child(5) { height: 72%; animation-delay: 200ms; }
        .sf-ai-confirm-speak-wave-bars span:nth-child(4) { height: 100%; animation-delay: 300ms; }

        .sf-ai-confirm-speak-record-panel-active .sf-ai-confirm-speak-wave-bars {
          color: rgba(79, 95, 255, 0.64);
        }

        .sf-ai-confirm-speak-record-panel-idle .sf-ai-confirm-speak-wave-bars span,
        .sf-ai-confirm-speak-record-panel-idle .sf-ai-confirm-speak-title-wave span {
          animation: none;
        }

        .sf-ai-confirm-speak-stop-button {
          position: relative;
          z-index: 1;
          width: min(100%, 13rem);
          min-height: clamp(2.08rem, 8.8vw, 2.42rem);
          margin-top: clamp(0.48rem, 2.1vw, 0.68rem);
          border: 1px solid rgba(43, 84, 255, 0.76);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.68);
          color: #265cff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.34rem;
          font-size: clamp(0.66rem, 3vw, 0.78rem);
          font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .sf-ai-confirm-speak-stop-button.is-idle {
          color: rgba(120, 106, 156, 0.52);
          border-color: rgba(174, 153, 222, 0.42);
          cursor: default;
        }

        .sf-ai-confirm-speak-stop-button svg {
          width: 0.96rem;
          height: 0.96rem;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 3;
        }

        .sf-ai-confirm-speak-tip {
          position: relative;
          z-index: 1;
          width: min(100%, 17.6rem);
          margin: clamp(0.56rem, 2.2vw, 0.72rem) auto 0;
          border-radius: 999px;
          background: rgba(235, 241, 255, 0.76);
          color: rgba(56, 76, 137, 0.76);
          padding: 0.45rem 0.7rem;
          font-size: clamp(0.6rem, 2.65vw, 0.72rem);
          font-weight: 760;
          line-height: 1.2;
        }

        .sf-ai-confirm-speak-tip svg {
          display: inline-block;
          width: 0.76rem;
          height: 0.76rem;
          margin-right: 0.24rem;
          fill: #a36eff;
          vertical-align: -0.1rem;
        }

        .sf-ai-confirm-bottom-nav {
          position: fixed;
          z-index: 56;
          left: 50%;
          bottom: max(0.7rem, env(safe-area-inset-bottom, 0px));
          width: min(calc(100% - 1.55rem), 398px);
          min-height: clamp(3.95rem, 17vw, 4.7rem);
          padding: clamp(0.38rem, 1.7vw, 0.52rem) clamp(0.82rem, 4.2vw, 1.18rem);
          border: 1px solid rgba(220, 227, 247, 0.92);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: center;
          gap: clamp(0.18rem, 1vw, 0.42rem);
          box-shadow:
            0 1.05rem 2.4rem rgba(94, 112, 172, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          transform: translateX(-50%);
          backdrop-filter: blur(18px);
        }

        .sf-ai-confirm-bottom-button {
          position: relative;
          width: 100%;
          height: clamp(2.55rem, 11.5vw, 3.12rem);
          border: 0;
          border-radius: 999px;
          padding: 0;
          display: grid;
          place-items: center;
          color: #8b8eaf;
          background: transparent;
          appearance: none;
          cursor: pointer;
          transition: color 160ms ease, transform 160ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .sf-ai-confirm-bottom-button:active {
          transform: scale(0.96);
        }

        .sf-ai-confirm-bottom-button:focus-visible,
        .sf-ai-confirm-progress-close:focus-visible {
          outline: 3px solid rgba(132, 103, 255, 0.34);
          outline-offset: 3px;
        }

        .sf-ai-confirm-bottom-button svg {
          width: clamp(1.62rem, 7.2vw, 2.05rem);
          height: clamp(1.62rem, 7.2vw, 2.05rem);
          fill: none;
          stroke: currentColor;
          stroke-width: 3.1;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }

        .sf-ai-confirm-bottom-button.is-active svg {
          width: clamp(1.72rem, 7.8vw, 2.16rem);
          height: clamp(1.72rem, 7.8vw, 2.16rem);
          stroke: none;
        }

        .sf-ai-confirm-bottom-pro {
          position: absolute;
          right: clamp(0.34rem, 1.8vw, 0.52rem);
          bottom: clamp(0.18rem, 0.9vw, 0.28rem);
          padding: 0.06rem 0.18rem 0.05rem;
          border-radius: 0.26rem;
          background: rgba(9, 14, 54, 0.9);
          color: #ffffff;
          font-size: 0.44rem;
          font-weight: 950;
          line-height: 1;
          letter-spacing: 0;
          box-shadow: 0 0.18rem 0.36rem rgba(9, 14, 54, 0.16);
        }

        .sf-ai-confirm-progress-backdrop {
          position: fixed;
          inset: 0;
          z-index: 60;
          padding: max(1rem, env(safe-area-inset-top, 0px)) 1rem max(1rem, env(safe-area-inset-bottom, 0px));
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 19, 46, 0.28);
          backdrop-filter: blur(14px);
        }

        .sf-ai-confirm-progress-modal {
          width: min(100%, 24rem);
          max-height: min(84dvh, 40rem);
          overflow-y: auto;
          border: 1px solid rgba(220, 228, 250, 0.94);
          border-radius: 1.45rem;
          background:
            radial-gradient(circle at 88% 6%, rgba(222, 207, 255, 0.62), transparent 8rem),
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 252, 255, 0.97));
          padding: 1.08rem;
          box-shadow:
            0 1.8rem 4.2rem rgba(25, 32, 74, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        .sf-ai-confirm-progress-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .sf-ai-confirm-progress-kicker {
          margin: 0 0 0.26rem;
          color: #765cff;
          font-size: 0.78rem;
          font-weight: 900;
          line-height: 1;
        }

        .sf-ai-confirm-progress-head h2 {
          margin: 0;
          color: #07103d;
          font-size: 1.42rem;
          font-weight: 950;
          line-height: 1.14;
        }

        .sf-ai-confirm-progress-close {
          width: 2.35rem;
          height: 2.35rem;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          color: #12183e;
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(211, 221, 244, 0.9);
          cursor: pointer;
        }

        .sf-ai-confirm-progress-close svg {
          width: 1.06rem;
          height: 1.06rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.7;
          stroke-linecap: round;
        }

        .sf-ai-confirm-progress-loading,
        .sf-ai-confirm-progress-error {
          margin-top: 1rem;
          min-height: 7rem;
          border-radius: 1rem;
          display: grid;
          place-items: center;
          color: #687197;
          background: rgba(255, 255, 255, 0.72);
          font-size: 0.9rem;
          font-weight: 820;
          text-align: center;
        }

        .sf-ai-confirm-progress-error {
          color: #9b3351;
          background: rgba(255, 242, 247, 0.82);
        }

        .sf-ai-confirm-progress-grid {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .sf-ai-confirm-progress-stat,
        .sf-ai-confirm-progress-card,
        .sf-ai-confirm-progress-step {
          border: 1px solid rgba(222, 228, 247, 0.9);
          background: rgba(255, 255, 255, 0.76);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.94);
        }

        .sf-ai-confirm-progress-stat {
          min-height: 4.35rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.18rem;
          text-align: center;
        }

        .sf-ai-confirm-progress-stat span {
          color: #07103d;
          font-size: 1.46rem;
          font-weight: 1000;
          line-height: 1;
        }

        .sf-ai-confirm-progress-stat small {
          color: #6a7197;
          font-size: 0.66rem;
          font-weight: 780;
          line-height: 1.16;
        }

        .sf-ai-confirm-progress-card {
          margin-top: 0.7rem;
          border-radius: 1.06rem;
          padding: 0.88rem;
        }

        .sf-ai-confirm-progress-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          color: #07103d;
          font-size: 0.9rem;
          font-weight: 900;
        }

        .sf-ai-confirm-progress-card-head strong {
          color: #765cff;
          font-size: 1rem;
        }

        .sf-ai-confirm-progress-track {
          margin-top: 0.65rem;
          height: 0.6rem;
          border-radius: 999px;
          background: rgba(230, 225, 255, 0.95);
          overflow: hidden;
        }

        .sf-ai-confirm-progress-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #845cff, #3f82ff);
        }

        .sf-ai-confirm-progress-card p {
          margin: 0.42rem 0 0;
          color: #6a7197;
          font-size: 0.72rem;
          font-weight: 760;
        }

        .sf-ai-confirm-progress-steps {
          margin-top: 0.75rem;
          display: grid;
          gap: 0.48rem;
        }

        .sf-ai-confirm-progress-step {
          min-height: 3.55rem;
          border-radius: 0.95rem;
          padding: 0.62rem 0.72rem;
          display: grid;
          grid-template-columns: 2rem minmax(0, 1fr);
          align-items: center;
          gap: 0.64rem;
        }

        .sf-ai-confirm-progress-step-index {
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #ffffff;
          background: #a8abc4;
          font-size: 0.86rem;
          font-weight: 950;
        }

        .sf-ai-confirm-progress-step.is-completed .sf-ai-confirm-progress-step-index {
          background: linear-gradient(135deg, #6b76ff, #8d5cff);
        }

        .sf-ai-confirm-progress-step.is-active .sf-ai-confirm-progress-step-index {
          background: linear-gradient(135deg, #3f8cff, #7b63ff);
        }

        .sf-ai-confirm-progress-step-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.16rem;
        }

        .sf-ai-confirm-progress-step-copy strong {
          color: #07103d;
          font-size: 0.9rem;
          font-weight: 900;
          line-height: 1.18;
        }

        .sf-ai-confirm-progress-step-copy small {
          color: #6d7398;
          font-size: 0.72rem;
          font-weight: 780;
        }

        .sf-ai-confirm-speak-hidden-gradient {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        html[data-app-theme] body .sf-ai-confirm-speak-page .sf-ai-confirm-speak-confirm-button:not(:disabled):not(.is-recording-disabled),
        html[data-app-theme] body .sf-ai-confirm-speak-page .sf-ai-confirm-speak-confirm-button:not(:disabled):not(.is-recording-disabled) * {
          color: #ffffff !important;
        }

        @keyframes sf-ai-confirm-speak-wave {
          0%, 100% {
            transform: scaleY(0.58);
            opacity: 0.68;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes sf-ai-confirm-speak-pulse {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.62;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @media (max-height: 720px) {
          .sf-ai-confirm-speak-frame {
            padding-top: calc(env(safe-area-inset-top, 0px) + 0.12rem);
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.58rem);
          }

          .sf-ai-confirm-speak-content {
            padding-top: 0.9rem;
          }

          .sf-ai-confirm-speak-chinese-card {
            min-height: 7.35rem;
            margin-top: 0.64rem;
            padding-top: 0.74rem;
            padding-bottom: 0.74rem;
          }

          .sf-ai-confirm-speak-textarea {
            min-height: 4.75rem;
            max-height: 6.15rem;
            line-height: 1.48;
          }

          .sf-ai-confirm-speak-card-note {
            margin-top: 0.38rem;
          }

          .sf-ai-confirm-speak-actions {
            margin-top: 0.58rem;
          }

          .sf-ai-confirm-speak-divider {
            margin-top: 0.66rem;
            margin-bottom: 0.52rem;
          }

          .sf-ai-confirm-speak-record-panel {
            padding-top: 0.74rem;
            padding-bottom: 0.78rem;
          }

          .sf-ai-confirm-speak-record-panel-idle {
            min-height: 8.55rem;
          }

          .sf-ai-confirm-speak-record-panel-active {
            min-height: 13.25rem;
          }

          .sf-ai-confirm-speak-mic-area {
            min-height: 5.1rem;
            margin-top: 0.46rem;
          }

          .sf-ai-confirm-speak-mic-wrap {
            width: 4.45rem;
          }

          .sf-ai-confirm-speak-tip {
            margin-top: 0.42rem;
          }
        }

        @media (max-width: 360px) {
          .sf-ai-confirm-speak-frame {
            padding-inline: 0.72rem;
          }

          .sf-ai-confirm-speak-brand-title {
            font-size: 0.92rem;
          }

          .sf-ai-confirm-speak-brand-subtitle {
            font-size: 0.35rem;
          }

          .sf-ai-confirm-speak-actions {
            gap: 0.4rem;
          }

          .sf-ai-confirm-speak-retry-button {
            font-size: 0.68rem;
          }

          .sf-ai-confirm-speak-confirm-button {
            font-size: 0.6rem;
          }
        }
      `}</style>

      <svg className="sf-ai-confirm-speak-hidden-gradient" aria-hidden="true">
        <defs>
          <linearGradient id="sf-ai-confirm-shield-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="#b083ff" />
            <stop offset="1" stopColor="#6b4bff" />
          </linearGradient>
        </defs>
      </svg>

      <div className="sf-ai-confirm-speak-frame">
        <main className="sf-ai-confirm-speak-content">
          <div className="sf-ai-confirm-speak-title-row">
            <h1 className="sf-ai-confirm-speak-title">
              <SparkleGlyph />
              <span>你想表达的是：</span>
            </h1>
            <button
              type="button"
              className="sf-ai-confirm-speak-edit"
              onClick={focusChineseText}
            >
              <EditGlyph />
              <span>编辑中文</span>
            </button>
          </div>

          <section className="sf-ai-confirm-speak-chinese-card">
            <textarea
              ref={textareaRef}
              aria-label="识别出的中文，可以编辑"
              className="sf-ai-confirm-speak-textarea"
              placeholder={emptyChineseText}
              style={chineseTextStyle}
              value={chineseText}
              onChange={(event) => onEditChinese(event.target.value)}
            />
          </section>

          <p className="sf-ai-confirm-speak-card-note">
            <ShieldGlyph />
            <span>这是我们听到的内容，你可以修改后再确认</span>
          </p>

          <section className="sf-ai-confirm-speak-actions">
            <button
              type="button"
              className="sf-ai-confirm-speak-retry-button"
              onClick={onRetryChinese}
            >
              <RefreshGlyph />
              <span>重新说中文</span>
            </button>
            <button
              type="button"
              className={`sf-ai-confirm-speak-confirm-button ${
                isRecordingEnglish ? "is-recording-disabled" : ""
              }`}
              onClick={handleStartEnglishRecording}
              disabled={!chineseText.trim() || isRecordingEnglish}
            >
              <CheckGlyph />
              <span>确认，点击麦克风说英文</span>
            </button>
          </section>

          <div className="sf-ai-confirm-speak-divider" />

          <section
            className={`sf-ai-confirm-speak-record-panel ${
              isRecordingEnglish
                ? "sf-ai-confirm-speak-record-panel-active"
                : "sf-ai-confirm-speak-record-panel-idle"
            }`}
            aria-label={
              isRecordingEnglish
                ? "看着中文说英文，正在录音"
                : "确认后开始英文录音"
            }
          >
            {isRecordingEnglish ? (
              <>
                <h2 className="sf-ai-confirm-speak-record-title">
                  <WaveIcon />
                  <span>看着中文，说英文</span>
                  <WaveIcon />
                </h2>
                <p className="sf-ai-confirm-speak-record-copy">
                  可以不完美，大胆说出来
                </p>
                <p className="sf-ai-confirm-speak-listening-copy">
                  正在听你说...
                </p>
              </>
            ) : (
              <>
                <h2 className="sf-ai-confirm-speak-record-title">
                  <SparkleGlyph />
                  <span>确认后，就可以看着中文说英文</span>
                </h2>
                <p className="sf-ai-confirm-speak-record-copy">
                  下方麦克风会在确认后亮起
                </p>
              </>
            )}

            <div className="sf-ai-confirm-speak-mic-area">
              <WaveBars side="left" />
              <div className="sf-ai-confirm-speak-mic-wrap">
                <button
                  type="button"
                  aria-label={
                    isRecordingEnglish
                      ? "点击麦克风结束录音"
                      : "确认后可开始英文录音"
                  }
                  className={`sf-ai-confirm-speak-mic ${
                    isRecordingEnglish ? "sf-ai-confirm-speak-mic-active" : ""
                  }`}
                  onClick={
                    isRecordingEnglish ? onStopEnglishRecording : undefined
                  }
                  disabled={!isRecordingEnglish}
                >
                  <MicGlyph />
                </button>
              </div>
              <WaveBars side="right" />
            </div>

            <button
              type="button"
              className={`sf-ai-confirm-speak-stop-button ${
                isRecordingEnglish ? "" : "is-idle"
              }`}
              onClick={isRecordingEnglish ? onStopEnglishRecording : undefined}
              disabled={!isRecordingEnglish}
            >
              <MicGlyph />
              <span>
                {isRecordingEnglish
                  ? "点击麦克风结束录音"
                  : "点击麦克风开始说英文"}
              </span>
            </button>

            {isRecordingEnglish ? (
              <p className="sf-ai-confirm-speak-tip">
                <SparkleGlyph />
                <span>说完后，AI 会给你更自然的英文表达</span>
              </p>
            ) : null}
          </section>
        </main>
      </div>

      <nav className="sf-ai-confirm-bottom-nav" aria-label="学习导航">
        <button
          type="button"
          className="sf-ai-confirm-bottom-button is-active"
          onClick={onMenuClick}
          aria-label={menuLabel}
        >
          <BottomHomeIcon />
        </button>
        <button
          type="button"
          className="sf-ai-confirm-bottom-button"
          onClick={() => {
            setIsProgressLoading(true);
            setIsProgressOpen(true);
          }}
          aria-label="查看学习进度"
          aria-haspopup="dialog"
          aria-expanded={isProgressOpen}
        >
          <BottomProgressIcon />
        </button>
        <button
          type="button"
          className="sf-ai-confirm-bottom-button"
          onClick={() => setIsHelpOpen(true)}
          aria-label="打开使用帮助"
          aria-haspopup="dialog"
          aria-expanded={isHelpOpen}
        >
          <BottomHelpIcon />
        </button>
        <button
          type="button"
          className="sf-ai-confirm-bottom-button"
          onClick={onAccountClick}
          aria-label="打开账户"
        >
          <BottomAccountIcon />
          {hasProEntitlement ? (
            <span className="sf-ai-confirm-bottom-pro">PRO</span>
          ) : null}
        </button>
      </nav>

      <AiGuidedExpressionHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {isProgressOpen ? (
        <div
          className="sf-ai-confirm-progress-backdrop"
          role="presentation"
          onClick={() => setIsProgressOpen(false)}
        >
          <section
            className="sf-ai-confirm-progress-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sf-ai-confirm-progress-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sf-ai-confirm-progress-head">
              <div>
                <p className="sf-ai-confirm-progress-kicker">学习进度</p>
                <h2 id="sf-ai-confirm-progress-title">AI 引导表达</h2>
              </div>
              <button
                type="button"
                className="sf-ai-confirm-progress-close"
                onClick={() => setIsProgressOpen(false)}
                aria-label="关闭学习进度"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {progressError ? (
              <div className="sf-ai-confirm-progress-error">{progressError}</div>
            ) : isProgressLoading || !progressSnapshot ? (
              <div className="sf-ai-confirm-progress-loading">
                正在同步学习进度...
              </div>
            ) : (
              <>
                <div className="sf-ai-confirm-progress-grid">
                  <div className="sf-ai-confirm-progress-stat">
                    <span>{todayCompleted}</span>
                    <small>今日完成 / {dailyGoal}</small>
                  </div>
                  <div className="sf-ai-confirm-progress-stat">
                    <span>{streakDays}</span>
                    <small>连续天数</small>
                  </div>
                  <div className="sf-ai-confirm-progress-stat">
                    <span>{totalCompleted}</span>
                    <small>累计完成</small>
                  </div>
                </div>

                <div className="sf-ai-confirm-progress-card">
                  <div className="sf-ai-confirm-progress-card-head">
                    <span>今日挑战</span>
                    <strong>
                      {challengeCompleted}/{challengeGoal}
                    </strong>
                  </div>
                  <div className="sf-ai-confirm-progress-track">
                    <span style={{ width: `${challengePercent}%` }} />
                  </div>
                  <p>{challengePercent}% 已完成</p>
                </div>

                <div className="sf-ai-confirm-progress-steps">
                  {progressStepOrder.map((item, index) => {
                    const step = progressSnapshot?.steps?.[item.id];
                    const status = step?.status ?? "locked";

                    return (
                      <div
                        className={`sf-ai-confirm-progress-step is-${status}`}
                        key={item.id}
                      >
                        <span className="sf-ai-confirm-progress-step-index">
                          {index + 1}
                        </span>
                        <span className="sf-ai-confirm-progress-step-copy">
                          <strong>{step?.label ?? item.fallbackLabel}</strong>
                          <small>{progressStatusCopy[status]}</small>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
