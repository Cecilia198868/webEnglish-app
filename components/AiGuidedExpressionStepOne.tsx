"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AiGuidedExpressionHelpModal from "@/components/AiGuidedExpressionHelpModal";
import { FREE_PRACTICE_DAILY_LIMIT } from "@/lib/freePracticeLimit";

type AiGuidedExpressionStepOneProps = {
  hasProEntitlement?: boolean;
  onAccountClick?: () => void;
  onHomeClick?: () => void;
  onStartChineseRecording?: () => void;
  onStopChineseRecording?: () => void;
  recordingState?: "idle" | "recording";
  showGuestProgress?: boolean;
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

const learningFlow = [
  { icon: "mic", title: "说中文" },
  { icon: "chat", title: "试着说英文" },
  { icon: "robot", title: "AI 给你表达" },
  { icon: "light", title: "继续下一句" },
] as const;

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

function SparkleGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 4 29.8 18.2 44 24l-14.2 5.8L24 44l-5.8-14.2L4 24l14.2-5.8L24 4Z" />
      <path d="M39 3.5 41 9l5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2 2-5.5Z" />
    </svg>
  );
}

function UpArrowGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 18V6" />
      <path d="m7 11 5-5 5 5" />
    </svg>
  );
}

function CheckCircleGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="17" />
      <path d="m16 24 6 6 11-13" />
    </svg>
  );
}

function HelpBoltGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m13.8 2.6-8.1 11h5.2l-1 7.8 8.4-11.8h-5.4l.9-7Z" />
    </svg>
  );
}

function BottomHomeIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sf-ai-bottom-home-gradient" x1="9" x2="39" y1="39" y2="8">
          <stop offset="0" stopColor="#5e79ff" />
          <stop offset="1" stopColor="#914cff" />
        </linearGradient>
      </defs>
      <path
        d="M8 21.6 24 8l16 13.6v16.2a4 4 0 0 1-4 4h-7.7V29.3h-8.6v12.5H12a4 4 0 0 1-4-4V21.6Z"
        fill="url(#sf-ai-bottom-home-gradient)"
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

function StepIcon({ icon }: { icon: (typeof learningFlow)[number]["icon"] }) {
  if (icon === "mic") return <MicGlyph />;
  if (icon === "chat") return <ChatGlyph />;
  if (icon === "robot") return <RobotGlyph />;
  return <LightGlyph />;
}

function WaveBars({ side }: { side: "left" | "right" }) {
  return (
    <span
      className={`sf-ai-guide-start-wave-bars sf-ai-guide-start-wave-bars-${side}`}
      aria-hidden="true"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <span key={`${side}-${index}`} />
      ))}
    </span>
  );
}

export default function AiGuidedExpressionStepOne({
  hasProEntitlement = false,
  onAccountClick,
  onHomeClick,
  onStartChineseRecording,
  onStopChineseRecording,
  recordingState,
  showGuestProgress = false,
}: AiGuidedExpressionStepOneProps) {
  void showGuestProgress;

  const router = useRouter();
  const [localRecordingState, setLocalRecordingState] = useState<
    "idle" | "recording"
  >("idle");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressSnapshot, setProgressSnapshot] =
    useState<AiGuidedProgressSnapshot | null>(null);

  const effectiveRecordingState = recordingState ?? localRecordingState;
  const isRecording = effectiveRecordingState === "recording";

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

  function handleHomeClick() {
    if (onHomeClick) {
      onHomeClick();
      return;
    }

    router.push("/start");
  }

  function handleAccountClick() {
    if (onAccountClick) {
      onAccountClick();
      return;
    }

    router.push("/account");
  }

  function openProgress() {
    setIsProgressLoading(true);
    setIsProgressOpen(true);
  }

  function startChineseRecording() {
    setLocalRecordingState("recording");
    onStartChineseRecording?.();
  }

  function stopChineseRecording() {
    setLocalRecordingState("idle");
    onStopChineseRecording?.();
  }

  function handleMicrophoneClick() {
    if (isRecording) {
      stopChineseRecording();
      return;
    }

    startChineseRecording();
  }

  const titleText = isRecording ? "正在听你说话..." : "先说中文";
  const instructionText = isRecording
    ? "再次点击上方麦克风，结束录音"
    : "点击上方麦克风开始说中文";
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
    <main
      className={`sf-ai-guide-start-page ${
        isRecording ? "is-recording" : "is-idle"
      } ${isHelpOpen ? "is-help-open" : ""} ${
        isProgressOpen ? "is-progress-open" : ""
      }`}
    >
      <style>{`
        .sf-ai-guide-start-page,
        .sf-ai-guide-start-page * {
          box-sizing: border-box;
        }

        .sf-speak-page:has(.sf-ai-guide-start-page) {
          background:
            radial-gradient(circle at 18% 3%, rgba(220, 239, 255, 0.9), transparent 30%),
            radial-gradient(circle at 88% 0%, rgba(233, 225, 255, 0.86), transparent 28%),
            linear-gradient(180deg, #f4fbff 0%, #fbfdff 48%, #f2f6ff 100%) !important;
        }

        .sf-speak-page:has(.sf-ai-guide-start-page) > div {
          width: 100vw !important;
          max-width: none !important;
          min-height: 100dvh !important;
          align-items: stretch !important;
          justify-content: center !important;
          padding: 0 !important;
        }

        .sf-speak-page:has(.sf-ai-guide-start-page) .sf-speak-phone {
          width: min(100vw, 430px) !important;
          max-width: 430px !important;
          height: 100dvh !important;
          min-height: 100dvh !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          overflow: hidden !important;
          box-shadow: none !important;
        }

        .sf-speak-page:has(.sf-ai-guide-start-page) .sf-speak-phone::before,
        .sf-speak-page:has(.sf-ai-guide-start-page) .sf-speak-phone::after,
        .sf-speak-page:has(.sf-ai-guide-start-page) .sf-speak-phone > .pointer-events-none {
          display: none !important;
        }

        .sf-speak-page:has(.sf-ai-guide-start-page) .sf-speak-phone > .absolute:has(.sf-ai-guide-start-page) {
          z-index: 200 !important;
          overflow: hidden !important;
        }

        .sf-ai-guide-start-page {
          width: 100%;
          height: 100%;
          min-height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          justify-content: center;
          color: #080d33;
          background:
            radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.92), transparent 24rem),
            radial-gradient(circle at 7% 28%, rgba(202, 234, 255, 0.56), transparent 9rem),
            radial-gradient(circle at 95% 33%, rgba(226, 217, 255, 0.72), transparent 10rem),
            linear-gradient(180deg, #eef9ff 0%, #fbfdff 43%, #f3f6ff 100%);
          font-family: var(--sf-font-zh, "PingFang SC", "Microsoft YaHei", sans-serif);
          -webkit-font-smoothing: antialiased;
        }

        .sf-ai-guide-start-page.is-help-open,
        .sf-ai-guide-start-page.is-progress-open {
          overflow: hidden;
        }

        .sf-ai-guide-start-shell {
          position: relative;
          width: min(100%, 430px);
          min-height: 100%;
          padding: clamp(0.62rem, 2.2dvh, 0.98rem) clamp(0.95rem, 4.6vw, 1.36rem) 1rem;
          display: flex;
          flex-direction: column;
          isolation: isolate;
        }

        .sf-ai-guide-start-shell::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 3.6rem -7.8rem auto;
          height: min(56vw, 15rem);
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-bottom: 0;
          border-radius: 999px 999px 0 0;
          opacity: 0.75;
        }

        .sf-ai-guide-start-shell::after {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 4.85rem -4.2rem auto;
          height: min(47vw, 12.8rem);
          border: 1px solid rgba(255, 255, 255, 0.62);
          border-bottom: 0;
          border-radius: 999px 999px 0 0;
          opacity: 0.65;
        }

        .sf-ai-guide-start-header {
          position: relative;
          z-index: 3;
          min-height: clamp(2.72rem, 10.5vw, 3.45rem);
          padding: 0.33rem clamp(0.45rem, 2.6vw, 0.72rem);
          border: 1px solid rgba(199, 214, 244, 0.66);
          border-radius: clamp(1.05rem, 5vw, 1.6rem);
          background: rgba(255, 255, 255, 0.76);
          display: grid;
          grid-template-columns: clamp(2.05rem, 9.2vw, 2.55rem) minmax(0, 1fr) clamp(2.05rem, 9.2vw, 2.55rem);
          align-items: center;
          gap: 0.42rem;
          box-shadow:
            0 1.1rem 2.3rem rgba(112, 139, 196, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(18px);
        }

        .sf-ai-guide-start-home-button,
        .sf-ai-guide-start-help-button,
        .sf-ai-guide-start-mic-button {
          border: 0;
          padding: 0;
          font: inherit;
          cursor: pointer;
          appearance: none;
          -webkit-tap-highlight-color: transparent;
        }

        .sf-ai-guide-start-home-button,
        .sf-ai-guide-start-help-button {
          width: clamp(2.05rem, 9.2vw, 2.55rem);
          height: clamp(2.05rem, 9.2vw, 2.55rem);
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #07103d;
          background: #ffffff;
          box-shadow:
            0 0.75rem 1.45rem rgba(85, 99, 154, 0.15),
            inset 0 0 0 1px rgba(216, 223, 244, 0.74);
          transition: transform 150ms ease, box-shadow 150ms ease;
        }

        .sf-ai-guide-start-home-button:active,
        .sf-ai-guide-start-help-button:active,
        .sf-ai-guide-start-mic-button:active,
        .sf-ai-guide-start-instruction:active {
          transform: scale(0.97);
        }

        .sf-ai-guide-start-home-button:focus-visible,
        .sf-ai-guide-start-help-button:focus-visible,
        .sf-ai-guide-start-mic-button:focus-visible,
        .sf-ai-guide-start-help-close:focus-visible,
        .sf-ai-guide-start-instruction:focus-visible {
          outline: 3px solid rgba(132, 103, 255, 0.36);
          outline-offset: 3px;
        }

        .sf-ai-guide-start-home-button .sf-home-menu-icon {
          width: 54%;
          height: 54%;
        }

        .sf-ai-guide-start-home-button .sf-home-menu-icon svg {
          width: 100%;
          height: 100%;
          stroke-width: 2.7px;
        }

        .sf-ai-guide-start-help-button {
          font-size: clamp(1.08rem, 4.8vw, 1.45rem);
          font-weight: 950;
          line-height: 1;
        }

        .sf-ai-guide-start-brand {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.32rem, 1.55vw, 0.46rem);
        }

        .sf-ai-guide-start-logo {
          width: clamp(1.53rem, 7.25vw, 1.98rem);
          height: clamp(1.53rem, 7.25vw, 1.98rem);
          border-radius: 0.62rem;
          background: rgba(255, 255, 255, 0.9);
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(226, 220, 255, 0.76);
          flex: 0 0 auto;
        }

        .sf-ai-guide-start-logo-mark {
          width: 78%;
          height: 78%;
        }

        .sf-ai-guide-start-brand-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1;
        }

        .sf-ai-guide-start-brand-title {
          color: #070c31;
          font-size: clamp(0.84rem, 4.15vw, 1.18rem);
          font-weight: 1000;
          letter-spacing: 0;
          white-space: nowrap;
        }

        .sf-ai-guide-start-brand-subtitle {
          margin-top: 0.14rem;
          color: #4d66ff;
          font-size: clamp(0.36rem, 1.78vw, 0.52rem);
          font-weight: 900;
          letter-spacing: 0.17em;
          white-space: nowrap;
        }

        .sf-ai-guide-start-hero {
          position: relative;
          z-index: 2;
          margin-top: clamp(1.02rem, 4.4dvh, 1.8rem);
          text-align: center;
        }

        .sf-ai-guide-start-sparkle {
          position: absolute;
          color: rgba(139, 109, 255, 0.76);
          filter: drop-shadow(0 0.34rem 0.85rem rgba(147, 113, 255, 0.2));
        }

        .sf-ai-guide-start-sparkle svg {
          display: block;
          width: 100%;
          height: 100%;
          fill: currentColor;
        }

        .sf-ai-guide-start-sparkle-left {
          left: clamp(0.5rem, 5vw, 1.5rem);
          top: clamp(1.1rem, 5.8vw, 2.1rem);
          width: clamp(0.78rem, 4.5vw, 1.28rem);
          height: clamp(0.78rem, 4.5vw, 1.28rem);
        }

        .sf-ai-guide-start-sparkle-right {
          right: clamp(0.62rem, 5.6vw, 1.8rem);
          top: clamp(0.22rem, 1.5vw, 0.55rem);
          width: clamp(0.62rem, 3.5vw, 1.05rem);
          height: clamp(0.62rem, 3.5vw, 1.05rem);
          color: rgba(255, 255, 255, 0.95);
        }

        .sf-ai-guide-start-title {
          margin: 0;
          color: transparent;
          background: linear-gradient(93deg, #071047 0%, #14217a 47%, #3d67ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          font-size: clamp(2.15rem, 11.4vw, 3.25rem);
          font-weight: 1000;
          line-height: 1.04;
          letter-spacing: 0;
          text-shadow: 0 0.7rem 1.55rem rgba(63, 83, 183, 0.08);
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-title {
          background: linear-gradient(93deg, #17208c 0%, #7257ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          font-size: clamp(1.78rem, 9.2vw, 2.64rem);
        }

        .sf-ai-guide-start-subtitle {
          margin: clamp(0.4rem, 2vw, 0.68rem) 0 0;
          color: rgba(73, 79, 124, 0.7);
          font-size: clamp(0.82rem, 4.1vw, 1.1rem);
          font-weight: 800;
          line-height: 1.38;
          letter-spacing: 0.02em;
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-subtitle {
          display: flex;
          flex-direction: column;
          gap: 0.08rem;
          color: rgba(70, 75, 119, 0.72);
        }

        .sf-ai-guide-start-recording-status {
          margin-top: clamp(0.42rem, 1.8dvh, 0.74rem);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.38rem;
          color: #7656ff;
          font-size: clamp(0.72rem, 3.5vw, 0.94rem);
          font-weight: 950;
        }

        .sf-ai-guide-start-status-bars {
          display: inline-flex;
          align-items: center;
          gap: 0.12rem;
          height: 1rem;
        }

        .sf-ai-guide-start-status-bars span {
          width: 0.14rem;
          border-radius: 999px;
          background: currentColor;
          animation: sf-ai-guide-start-wave 840ms ease-in-out infinite;
        }

        .sf-ai-guide-start-status-bars span:nth-child(1) { height: 0.44rem; }
        .sf-ai-guide-start-status-bars span:nth-child(2) { height: 0.78rem; animation-delay: 80ms; }
        .sf-ai-guide-start-status-bars span:nth-child(3) { height: 1rem; animation-delay: 160ms; }
        .sf-ai-guide-start-status-bars span:nth-child(4) { height: 0.68rem; animation-delay: 240ms; }

        .sf-ai-guide-start-mic-zone {
          position: relative;
          z-index: 2;
          margin-top: clamp(0.72rem, 3.2dvh, 1.24rem);
          min-height: clamp(11rem, 50vw, 14.9rem);
          display: grid;
          place-items: center;
        }

        .sf-ai-guide-start-mic-ring {
          position: relative;
          width: clamp(8.85rem, 53vw, 13.45rem);
          aspect-ratio: 1;
          display: grid;
          place-items: center;
        }

        .sf-ai-guide-start-mic-ring::before,
        .sf-ai-guide-start-mic-ring::after {
          content: "";
          position: absolute;
          inset: -1.15rem;
          border-radius: 999px;
          pointer-events: none;
        }

        .sf-ai-guide-start-mic-ring::before {
          background:
            radial-gradient(circle, rgba(179, 124, 255, 0.22), rgba(100, 145, 255, 0.1) 52%, transparent 70%);
          filter: blur(0.22rem);
        }

        .sf-ai-guide-start-mic-ring::after {
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow:
            0 0 0 0.55rem rgba(255, 255, 255, 0.42),
            0 0 0 1.45rem rgba(218, 226, 255, 0.24),
            0 0 3.2rem rgba(122, 111, 255, 0.24);
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-mic-ring::before {
          animation: sf-ai-guide-start-pulse 1.7s ease-in-out infinite;
          background:
            radial-gradient(circle, rgba(170, 109, 255, 0.28), rgba(125, 141, 255, 0.18) 52%, transparent 73%);
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-mic-ring::after {
          box-shadow:
            0 0 0 0.65rem rgba(255, 255, 255, 0.52),
            0 0 0 1.8rem rgba(214, 199, 255, 0.3),
            0 0 4.4rem rgba(142, 91, 255, 0.35);
        }

        .sf-ai-guide-start-mic-button {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #ffffff;
          background:
            radial-gradient(circle at 31% 22%, rgba(255, 255, 255, 0.54), transparent 18%),
            linear-gradient(135deg, #f2a2ff 0%, #9474ff 48%, #39a2ff 100%);
          box-shadow:
            inset 0 0 0 0.18rem rgba(255, 255, 255, 0.88),
            inset -1.1rem -1.4rem 2.6rem rgba(32, 72, 218, 0.18),
            0 1.2rem 2.55rem rgba(105, 90, 223, 0.2);
          transition: transform 170ms ease, box-shadow 170ms ease, filter 170ms ease;
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-mic-button {
          background:
            radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.45), transparent 18%),
            linear-gradient(135deg, #eba0ff 0%, #9c62ff 50%, #5c75ff 100%);
          box-shadow:
            inset 0 0 0 0.18rem rgba(255, 255, 255, 0.92),
            inset -1.3rem -1.5rem 2.4rem rgba(42, 44, 184, 0.2),
            0 1.35rem 2.8rem rgba(126, 87, 255, 0.26);
          filter: saturate(1.07);
        }

        .sf-ai-guide-start-mic-button svg {
          width: clamp(4.2rem, 24vw, 6.3rem);
          height: clamp(4.2rem, 24vw, 6.3rem);
          fill: none;
          stroke: currentColor;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0.42rem 0.78rem rgba(31, 51, 130, 0.12));
        }

        .sf-ai-guide-start-wave-bars {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: clamp(3.65rem, 18vw, 5.1rem);
          height: clamp(3rem, 15vw, 4.3rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(116, 180, 255, 0.48);
          pointer-events: none;
        }

        .sf-ai-guide-start-wave-bars-left {
          right: calc(50% + clamp(5.1rem, 28vw, 7.55rem));
        }

        .sf-ai-guide-start-wave-bars-right {
          left: calc(50% + clamp(5.1rem, 28vw, 7.55rem));
        }

        .sf-ai-guide-start-wave-bars span {
          width: clamp(0.13rem, 0.8vw, 0.24rem);
          border-radius: 999px;
          background: currentColor;
          opacity: 0.75;
          animation: sf-ai-guide-start-wave 1.34s ease-in-out infinite;
        }

        .sf-ai-guide-start-wave-bars span:nth-child(1),
        .sf-ai-guide-start-wave-bars span:nth-child(8) { height: 22%; animation-delay: 0ms; }
        .sf-ai-guide-start-wave-bars span:nth-child(2),
        .sf-ai-guide-start-wave-bars span:nth-child(7) { height: 48%; animation-delay: 110ms; }
        .sf-ai-guide-start-wave-bars span:nth-child(3),
        .sf-ai-guide-start-wave-bars span:nth-child(6) { height: 70%; animation-delay: 220ms; }
        .sf-ai-guide-start-wave-bars span:nth-child(4),
        .sf-ai-guide-start-wave-bars span:nth-child(5) { height: 88%; animation-delay: 330ms; }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-wave-bars {
          color: rgba(163, 111, 255, 0.58);
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-wave-bars span {
          opacity: 0.9;
          animation-duration: 820ms;
        }

        .sf-ai-guide-start-action-area {
          position: relative;
          z-index: 3;
          margin-top: clamp(0.58rem, 2.3dvh, 0.9rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(0.5rem, 1.8dvh, 0.72rem);
        }

        .sf-ai-guide-start-instruction {
          width: min(100%, 19.2rem);
          min-height: clamp(2.32rem, 10.4vw, 2.8rem);
          border: 1px solid rgba(205, 205, 240, 0.82);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.6);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.46rem;
          color: rgba(72, 76, 116, 0.74);
          font-size: clamp(0.77rem, 3.55vw, 0.98rem);
          font-weight: 850;
          letter-spacing: 0;
          box-shadow:
            0 0.66rem 1.25rem rgba(105, 119, 181, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(14px);
          cursor: pointer;
          transition: transform 150ms ease, border-color 150ms ease, color 150ms ease;
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-instruction {
          color: rgba(77, 73, 128, 0.75);
        }

        .sf-ai-guide-start-instruction-icon {
          width: 1.28rem;
          height: 1.28rem;
          display: grid;
          place-items: center;
          color: #b88cff;
          border-radius: 999px;
          flex: 0 0 auto;
        }

        .sf-ai-guide-start-instruction-icon svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
          stroke: none;
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-instruction-icon {
          width: 1.18rem;
          height: 1.18rem;
          background: rgba(174, 129, 255, 0.22);
          color: #8a62ff;
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-instruction-icon svg {
          fill: none;
          stroke: currentColor;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-ai-guide-start-note {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.34rem;
          margin: 0;
          color: rgba(74, 80, 125, 0.68);
          font-size: clamp(0.64rem, 3vw, 0.78rem);
          font-weight: 760;
          line-height: 1.25;
          text-align: center;
        }

        .sf-ai-guide-start-note svg {
          width: 0.98rem;
          height: 0.98rem;
          fill: none;
          stroke: #ac86ff;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex: 0 0 auto;
        }

        .sf-ai-guide-start-help-card {
          position: relative;
          z-index: 2;
          margin-top: auto;
          border: 1px solid rgba(219, 225, 246, 0.82);
          border-radius: clamp(0.92rem, 4.8vw, 1.34rem);
          background: rgba(255, 255, 255, 0.72);
          padding: clamp(0.74rem, 3vw, 1rem) clamp(0.64rem, 3.2vw, 0.95rem) clamp(0.72rem, 3vw, 0.95rem);
          box-shadow:
            0 1rem 2.3rem rgba(98, 111, 168, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(18px);
        }

        .sf-ai-guide-start-help-title {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.38rem;
          color: #081039;
          font-size: clamp(0.86rem, 4vw, 1.02rem);
          font-weight: 950;
          line-height: 1;
        }

        .sf-ai-guide-start-help-title svg {
          width: 1.05rem;
          height: 1.05rem;
          fill: #8b63ff;
          flex: 0 0 auto;
        }

        .sf-ai-guide-start-steps {
          margin-top: clamp(0.62rem, 2.8vw, 0.85rem);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(0.24rem, 1.4vw, 0.42rem);
        }

        .sf-ai-guide-start-step {
          position: relative;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.34rem;
          color: #1f2856;
          text-align: center;
          font-size: clamp(0.62rem, 2.8vw, 0.75rem);
          font-weight: 760;
          line-height: 1.12;
        }

        .sf-ai-guide-start-step:not(:last-child)::after {
          content: "";
          position: absolute;
          top: clamp(0.88rem, 4.3vw, 1.15rem);
          left: calc(50% + clamp(1.08rem, 5vw, 1.38rem));
          width: clamp(0.9rem, 4.5vw, 1.25rem);
          border-top: 2px dashed rgba(170, 146, 244, 0.48);
        }

        .sf-ai-guide-start-step-icon {
          width: clamp(2.08rem, 10vw, 2.7rem);
          height: clamp(2.08rem, 10vw, 2.7rem);
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #9a5dff;
          background: rgba(157, 111, 255, 0.1);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.75);
        }

        .sf-ai-guide-start-step-icon svg {
          width: 57%;
          height: 57%;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }

        .sf-ai-guide-start-help-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          padding: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(9, 14, 38, 0.34);
          backdrop-filter: blur(12px);
        }

        .sf-ai-guide-start-help-modal {
          width: min(100%, 24rem);
          max-height: min(86dvh, 39rem);
          overflow-y: auto;
          border: 1px solid rgba(218, 226, 248, 0.9);
          border-radius: 1.35rem;
          background:
            radial-gradient(circle at 92% 8%, rgba(218, 204, 255, 0.55), transparent 8rem),
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 252, 255, 0.96));
          padding: 1.1rem;
          box-shadow: 0 1.7rem 4rem rgba(28, 36, 78, 0.2);
        }

        .sf-ai-guide-start-help-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .sf-ai-guide-start-help-head h2 {
          margin: 0;
          color: #090e36;
          font-size: 1.32rem;
          font-weight: 950;
          line-height: 1.2;
        }

        .sf-ai-guide-start-help-head p {
          margin: 0.38rem 0 0;
          color: rgba(52, 61, 105, 0.72);
          font-size: 0.82rem;
          font-weight: 700;
        }

        .sf-ai-guide-start-help-close {
          width: 2.25rem;
          height: 2.25rem;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          color: #11183f;
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(211, 221, 244, 0.9);
          cursor: pointer;
        }

        .sf-ai-guide-start-help-close svg {
          width: 1.02rem;
          height: 1.02rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.6;
          stroke-linecap: round;
        }

        .sf-ai-guide-start-help-list {
          margin-top: 1rem;
          display: grid;
          gap: 0.7rem;
        }

        .sf-ai-guide-start-help-row {
          display: grid;
          grid-template-columns: 2.35rem 1fr;
          gap: 0.72rem;
          align-items: center;
          padding: 0.8rem;
          border-radius: 1rem;
          border: 1px solid rgba(221, 226, 245, 0.88);
          background: rgba(255, 255, 255, 0.75);
        }

        .sf-ai-guide-start-help-row-icon {
          width: 2.35rem;
          height: 2.35rem;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #8a63ff;
          background: rgba(144, 96, 255, 0.1);
        }

        .sf-ai-guide-start-help-row-icon svg {
          width: 56%;
          height: 56%;
          fill: none;
          stroke: currentColor;
          stroke-width: 3.4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-ai-guide-start-help-row strong {
          display: block;
          color: #0a1037;
          font-size: 0.9rem;
          font-weight: 900;
        }

        .sf-ai-guide-start-help-row-copy > span {
          display: block;
          margin-top: 0.2rem;
          color: rgba(62, 70, 113, 0.72);
          font-size: 0.76rem;
          font-weight: 700;
          line-height: 1.45;
        }

        html[data-app-theme] body .sf-ai-guide-start-page .sf-ai-guide-start-title {
          color: transparent !important;
        }

        html[data-app-theme] body .sf-ai-guide-start-page .sf-ai-guide-start-mic-button,
        html[data-app-theme] body .sf-ai-guide-start-page .sf-ai-guide-start-mic-button * {
          color: #ffffff !important;
        }

        html[data-app-theme] body .sf-ai-guide-start-page .sf-ai-guide-start-mic-button svg,
        html[data-app-theme] body .sf-ai-guide-start-page .sf-ai-guide-start-mic-button svg * {
          stroke: #ffffff !important;
        }

        @keyframes sf-ai-guide-start-wave {
          0%, 100% {
            transform: scaleY(0.58);
          }
          50% {
            transform: scaleY(1);
          }
        }

        @keyframes sf-ai-guide-start-pulse {
          0%, 100% {
            transform: scale(0.98);
            opacity: 0.72;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes sf-ai-guide-start-mic-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.96;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }

        @media (min-width: 720px) {
          .sf-ai-guide-start-shell {
            width: 430px;
          }
        }

        @media (max-width: 370px) {
          .sf-ai-guide-start-shell {
            padding-left: 0.74rem;
            padding-right: 0.74rem;
          }

          .sf-ai-guide-start-mic-zone {
            min-height: 10.4rem;
          }

          .sf-ai-guide-start-wave-bars {
            width: 2.75rem;
          }

          .sf-ai-guide-start-wave-bars-left {
            right: calc(50% + 4.65rem);
          }

          .sf-ai-guide-start-wave-bars-right {
            left: calc(50% + 4.65rem);
          }

          .sf-ai-guide-start-step:not(:last-child)::after {
            width: 0.72rem;
            left: calc(50% + 0.98rem);
          }
        }

        @media (max-height: 680px) {
          .sf-ai-guide-start-shell {
            padding-top: 0.5rem;
          }

          .sf-ai-guide-start-hero {
            margin-top: 0.72rem;
          }

          .sf-ai-guide-start-mic-zone {
            margin-top: 0.45rem;
            min-height: 9.8rem;
          }

          .sf-ai-guide-start-mic-ring {
            width: clamp(7.75rem, 45vw, 11.2rem);
          }

          .sf-ai-guide-start-action-area {
            margin-top: 0.42rem;
            gap: 0.38rem;
          }

          .sf-ai-guide-start-help-card {
            padding-top: 0.64rem;
            padding-bottom: 0.68rem;
          }

          .sf-ai-guide-start-steps {
            margin-top: 0.54rem;
          }
        }

        .sf-ai-guide-start-page {
          background:
            radial-gradient(circle at 18% 4%, rgba(222, 241, 255, 0.82), transparent 31%),
            radial-gradient(circle at 92% 28%, rgba(233, 224, 255, 0.68), transparent 28%),
            linear-gradient(180deg, #f5fbff 0%, #fbfdff 49%, #f4f7ff 100%);
        }

        .sf-ai-guide-start-shell {
          width: min(100%, 430px);
          min-height: 100%;
          padding:
            max(0.34rem, calc(env(safe-area-inset-top, 0px) + 0.34rem))
            clamp(0.9rem, 4vw, 1.18rem)
            clamp(0.85rem, 2.6dvh, 1.15rem);
          border: 1px solid rgba(198, 214, 240, 0.78);
          border-radius: clamp(1.18rem, 5vw, 1.9rem);
          background:
            radial-gradient(circle at 50% 32%, rgba(255, 255, 255, 0.96), transparent 30%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.08));
          overflow: hidden;
        }

        .sf-ai-guide-start-shell::before {
          inset: 7.2rem -5.8rem auto;
          height: min(68vw, 18.8rem);
          border-color: rgba(223, 232, 250, 0.54);
        }

        .sf-ai-guide-start-shell::after {
          inset: 8.1rem -3.2rem auto;
          height: min(57vw, 15.4rem);
          border-color: rgba(232, 238, 252, 0.5);
        }

        .sf-ai-guide-start-header {
          min-height: clamp(2.34rem, 8.4vw, 2.76rem);
          padding: 0.22rem clamp(0.38rem, 2vw, 0.58rem);
          grid-template-columns: clamp(1.92rem, 8.4vw, 2.42rem) minmax(0, 1fr) clamp(1.92rem, 8.4vw, 2.42rem);
          border-radius: 1.46rem !important;
          background: rgba(255, 255, 255, 0.82);
          box-shadow:
            0 0.95rem 2rem rgba(104, 126, 178, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
        }

        .sf-ai-guide-start-home-button,
        .sf-ai-guide-start-help-button {
          width: clamp(1.92rem, 8.4vw, 2.42rem);
          height: clamp(1.92rem, 8.4vw, 2.42rem);
          box-shadow:
            0 0.62rem 1.2rem rgba(85, 99, 154, 0.13),
            inset 0 0 0 1px rgba(219, 226, 246, 0.78);
        }

        .sf-ai-guide-start-hero {
          margin-top: clamp(5.4rem, 12dvh, 6.9rem);
        }

        .sf-ai-guide-start-title {
          font-size: clamp(1.82rem, 8.9vw, 2.58rem);
          font-weight: 700;
          line-height: 1.03;
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-title {
          font-size: clamp(1.58rem, 7.55vw, 2.18rem);
          font-weight: 750;
        }

        .sf-ai-guide-start-subtitle {
          margin-top: clamp(0.42rem, 1.5dvh, 0.62rem);
          font-size: clamp(0.82rem, 3.72vw, 1.02rem);
          color: rgba(72, 78, 122, 0.74);
        }

        .sf-ai-guide-start-recording-status {
          margin-top: clamp(0.42rem, 1.6dvh, 0.7rem);
          color: #316cff;
        }

        .sf-ai-guide-start-mic-zone {
          margin-top: clamp(0.64rem, 2.1dvh, 1rem);
          min-height: clamp(8.28rem, 38.5vw, 10.55rem);
        }

        .sf-ai-guide-start-page.is-idle .sf-ai-guide-start-mic-zone {
          margin-top: clamp(2.35rem, 5.8dvh, 3.2rem);
        }

        .sf-ai-guide-start-mic-ring {
          width: clamp(7.55rem, 37.8vw, 10.1rem);
        }

        .sf-ai-guide-start-mic-ring::before {
          inset: -1.35rem;
          background:
            radial-gradient(circle, rgba(176, 126, 255, 0.2), rgba(109, 151, 255, 0.11) 50%, transparent 68%);
        }

        .sf-ai-guide-start-mic-ring::after {
          inset: -1rem;
          box-shadow:
            0 0 0 0.34rem rgba(255, 255, 255, 0.58),
            0 0 0 0.84rem rgba(225, 232, 255, 0.34),
            0 0 0 1.38rem rgba(225, 232, 255, 0.2),
            0 0 2.4rem rgba(111, 111, 229, 0.18);
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-mic-ring::after {
          box-shadow:
            0 0 0 0.38rem rgba(255, 255, 255, 0.66),
            0 0 0 0.96rem rgba(218, 204, 255, 0.36),
            0 0 0 1.55rem rgba(218, 204, 255, 0.22),
            0 0 3.1rem rgba(143, 95, 255, 0.28);
        }

        .sf-ai-guide-start-mic-button {
          background:
            radial-gradient(circle at 32% 21%, rgba(255, 255, 255, 0.5), transparent 18%),
            linear-gradient(135deg, #d79cff 0%, #8b70ff 48%, #4b9cff 100%);
          box-shadow:
            inset 0 0 0 0.14rem rgba(255, 255, 255, 0.9),
            inset -0.9rem -1.1rem 2.2rem rgba(34, 70, 210, 0.18),
            0 0.95rem 2.05rem rgba(105, 90, 223, 0.18);
          animation: sf-ai-guide-start-mic-breathe 2.5s ease-in-out infinite;
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-mic-button {
          background:
            radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.46), transparent 18%),
            linear-gradient(135deg, #dca2ff 0%, #8f5fff 50%, #4f7dff 100%);
          box-shadow:
            inset 0 0 0 0.14rem rgba(255, 255, 255, 0.92),
            inset -0.96rem -1.12rem 2.15rem rgba(44, 50, 188, 0.22),
            0 1rem 2.2rem rgba(126, 87, 255, 0.23);
        }

        .sf-ai-guide-start-mic-button svg {
          width: 41%;
          height: 41%;
          stroke-width: 4.35;
        }

        .sf-ai-guide-start-wave-bars {
          width: clamp(3.1rem, 15.2vw, 4.42rem);
          height: clamp(2.82rem, 13.8vw, 4.05rem);
          color: rgba(105, 176, 255, 0.52);
        }

        .sf-ai-guide-start-wave-bars-left {
          right: calc(50% + clamp(3.44rem, 20.8vw, 5.18rem));
        }

        .sf-ai-guide-start-wave-bars-right {
          left: calc(50% + clamp(3.44rem, 20.8vw, 5.18rem));
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-wave-bars {
          color: rgba(150, 101, 255, 0.68);
        }

        .sf-ai-guide-start-action-area {
          margin-top: clamp(0.32rem, 1.35dvh, 0.58rem);
          gap: clamp(0.5rem, 1.7dvh, 0.66rem);
        }

        .sf-ai-guide-start-instruction {
          width: auto;
          min-height: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          backdrop-filter: none;
          display: inline-flex;
          flex-direction: column;
          gap: 0.38rem;
          color: #245fff;
          font-size: clamp(0.78rem, 3.45vw, 0.95rem);
          font-weight: 900;
        }

        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-instruction {
          color: #245fff;
        }

        .sf-ai-guide-start-instruction-icon,
        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-instruction-icon {
          width: 1.42rem;
          height: 1.42rem;
          border: 2px solid currentColor;
          background: rgba(255, 255, 255, 0.72);
          color: #2d67ff;
          box-shadow: 0 0.38rem 0.8rem rgba(69, 100, 220, 0.12);
        }

        .sf-ai-guide-start-instruction-icon svg,
        .sf-ai-guide-start-page.is-recording .sf-ai-guide-start-instruction-icon svg {
          width: 62%;
          height: 62%;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-ai-guide-start-note {
          flex-direction: column;
          gap: 0.22rem;
          color: rgba(72, 78, 122, 0.68);
          font-size: clamp(0.62rem, 2.75vw, 0.74rem);
          font-weight: 760;
        }

        .sf-ai-guide-start-note svg {
          width: 0.95rem;
          height: 0.95rem;
          stroke: #7d78ff;
        }

        .sf-ai-guide-start-note-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.34rem;
          min-height: 1.72rem;
          padding: 0 0.68rem;
          border: 1px solid rgba(196, 195, 255, 0.62);
          border-radius: 999px;
          color: #5f62a5;
          background: rgba(255, 255, 255, 0.66);
          box-shadow:
            0 0.5rem 1rem rgba(94, 101, 172, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.88);
        }

        .sf-ai-guide-start-note-save {
          color: rgba(92, 96, 136, 0.62);
          font-size: 0.95em;
          font-weight: 720;
        }

        .sf-ai-guide-start-help-card {
          margin-top: auto;
          border-radius: 1.18rem;
          background: rgba(255, 255, 255, 0.74);
          padding: clamp(0.78rem, 2.5vw, 0.95rem) clamp(0.72rem, 2.8vw, 0.9rem) clamp(0.7rem, 2.5vw, 0.86rem);
        }

        .sf-ai-guide-start-help-title {
          font-size: clamp(0.9rem, 3.75vw, 1.02rem);
        }

        .sf-ai-guide-start-steps {
          margin-top: clamp(0.62rem, 2.4vw, 0.78rem);
          gap: clamp(0.18rem, 1.1vw, 0.32rem);
        }

        .sf-ai-guide-start-step {
          gap: 0.32rem;
          font-size: clamp(0.64rem, 2.95vw, 0.78rem);
        }

        .sf-ai-guide-start-step-icon {
          width: clamp(2.12rem, 9.3vw, 2.48rem);
          height: clamp(2.12rem, 9.3vw, 2.48rem);
        }

        .sf-ai-guide-start-step:not(:last-child)::after {
          top: clamp(0.9rem, 4vw, 1.08rem);
          left: calc(50% + clamp(0.98rem, 4.3vw, 1.22rem));
          width: clamp(0.74rem, 3.5vw, 1.05rem);
        }

        .sf-ai-guide-start-bottom-nav {
          position: relative;
          z-index: 4;
          margin-top: clamp(2.05rem, 5.8dvh, 3.55rem);
          min-height: clamp(3.95rem, 17vw, 4.7rem);
          padding: clamp(0.38rem, 1.7vw, 0.52rem) clamp(0.82rem, 4.2vw, 1.18rem);
          border: 1px solid rgba(220, 227, 247, 0.92);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: center;
          gap: clamp(0.18rem, 1vw, 0.42rem);
          box-shadow:
            0 1.05rem 2.4rem rgba(94, 112, 172, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(18px);
        }

        .sf-ai-guide-start-bottom-button {
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

        .sf-ai-guide-start-bottom-button:active {
          transform: scale(0.96);
        }

        .sf-ai-guide-start-bottom-button:focus-visible,
        .sf-ai-guide-start-progress-close:focus-visible {
          outline: 3px solid rgba(132, 103, 255, 0.34);
          outline-offset: 3px;
        }

        .sf-ai-guide-start-bottom-button svg {
          width: clamp(1.62rem, 7.2vw, 2.05rem);
          height: clamp(1.62rem, 7.2vw, 2.05rem);
          fill: none;
          stroke: currentColor;
          stroke-width: 3.1;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }

        .sf-ai-guide-start-bottom-button.is-active svg {
          width: clamp(1.72rem, 7.8vw, 2.16rem);
          height: clamp(1.72rem, 7.8vw, 2.16rem);
          stroke: none;
        }

        .sf-ai-guide-start-bottom-pro {
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

        .sf-ai-guide-start-progress-backdrop {
          position: fixed;
          inset: 0;
          z-index: 60;
          padding: max(1rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom));
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 19, 46, 0.28);
          backdrop-filter: blur(14px);
        }

        .sf-ai-guide-start-progress-modal {
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

        .sf-ai-guide-start-progress-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .sf-ai-guide-start-progress-kicker {
          margin: 0 0 0.26rem;
          color: #765cff;
          font-size: 0.78rem;
          font-weight: 900;
          line-height: 1;
        }

        .sf-ai-guide-start-progress-head h2 {
          margin: 0;
          color: #07103d;
          font-size: 1.42rem;
          font-weight: 950;
          line-height: 1.14;
        }

        .sf-ai-guide-start-progress-close {
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

        .sf-ai-guide-start-progress-close svg {
          width: 1.06rem;
          height: 1.06rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.7;
          stroke-linecap: round;
        }

        .sf-ai-guide-start-progress-loading,
        .sf-ai-guide-start-progress-error {
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

        .sf-ai-guide-start-progress-error {
          color: #9b3351;
          background: rgba(255, 242, 247, 0.82);
        }

        .sf-ai-guide-start-progress-grid {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .sf-ai-guide-start-progress-stat,
        .sf-ai-guide-start-progress-card,
        .sf-ai-guide-start-progress-step {
          border: 1px solid rgba(222, 228, 247, 0.9);
          background: rgba(255, 255, 255, 0.76);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.94);
        }

        .sf-ai-guide-start-progress-stat {
          min-height: 4.35rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.18rem;
          text-align: center;
        }

        .sf-ai-guide-start-progress-stat span {
          color: #07103d;
          font-size: 1.46rem;
          font-weight: 1000;
          line-height: 1;
        }

        .sf-ai-guide-start-progress-stat small {
          color: #6a7197;
          font-size: 0.66rem;
          font-weight: 780;
          line-height: 1.16;
        }

        .sf-ai-guide-start-progress-card {
          margin-top: 0.7rem;
          border-radius: 1.06rem;
          padding: 0.88rem;
        }

        .sf-ai-guide-start-progress-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          color: #07103d;
          font-size: 0.9rem;
          font-weight: 900;
        }

        .sf-ai-guide-start-progress-card-head strong {
          color: #765cff;
          font-size: 1rem;
        }

        .sf-ai-guide-start-progress-track {
          margin-top: 0.65rem;
          height: 0.6rem;
          border-radius: 999px;
          background: rgba(230, 225, 255, 0.95);
          overflow: hidden;
        }

        .sf-ai-guide-start-progress-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #845cff, #3f82ff);
        }

        .sf-ai-guide-start-progress-card p {
          margin: 0.42rem 0 0;
          color: #6a7197;
          font-size: 0.72rem;
          font-weight: 760;
        }

        .sf-ai-guide-start-progress-steps {
          margin-top: 0.75rem;
          display: grid;
          gap: 0.48rem;
        }

        .sf-ai-guide-start-progress-step {
          min-height: 3.55rem;
          border-radius: 0.95rem;
          padding: 0.62rem 0.72rem;
          display: grid;
          grid-template-columns: 2rem minmax(0, 1fr);
          align-items: center;
          gap: 0.64rem;
        }

        .sf-ai-guide-start-progress-step-index {
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

        .sf-ai-guide-start-progress-step.is-completed .sf-ai-guide-start-progress-step-index {
          background: linear-gradient(135deg, #6b76ff, #8d5cff);
        }

        .sf-ai-guide-start-progress-step.is-active .sf-ai-guide-start-progress-step-index {
          background: linear-gradient(135deg, #3f8cff, #7b63ff);
        }

        .sf-ai-guide-start-progress-step-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.16rem;
        }

        .sf-ai-guide-start-progress-step-copy strong {
          color: #07103d;
          font-size: 0.9rem;
          font-weight: 900;
          line-height: 1.18;
        }

        .sf-ai-guide-start-progress-step-copy small {
          color: #6d7398;
          font-size: 0.72rem;
          font-weight: 780;
        }

        @media (max-height: 760px) {
          .sf-ai-guide-start-hero {
            margin-top: clamp(3.6rem, 8.2dvh, 4.8rem);
          }

          .sf-ai-guide-start-mic-zone {
            min-height: 8.4rem;
          }

          .sf-ai-guide-start-mic-ring {
            width: clamp(7.4rem, 38vw, 9.7rem);
          }

          .sf-ai-guide-start-help-card {
            margin-top: 0.9rem;
          }
        }
      `}</style>

      <div className="sf-ai-guide-start-shell">
        <section className="sf-ai-guide-start-hero" aria-live="polite">
          <span className="sf-ai-guide-start-sparkle sf-ai-guide-start-sparkle-left">
            <SparkleGlyph />
          </span>
          <span className="sf-ai-guide-start-sparkle sf-ai-guide-start-sparkle-right">
            <SparkleGlyph />
          </span>

          <h1 className="sf-ai-guide-start-title">{titleText}</h1>
          {isRecording ? (
            <p className="sf-ai-guide-start-subtitle">
              <span>大胆说出你想表达的中文</span>
              <span>AI 会一步步帮你优化</span>
            </p>
          ) : (
            <p className="sf-ai-guide-start-subtitle">
              AI 帮你变成自然英语
            </p>
          )}

          {isRecording ? (
            <div className="sf-ai-guide-start-recording-status">
              <span className="sf-ai-guide-start-status-bars" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              <span>录音中</span>
            </div>
          ) : null}
        </section>

        <section className="sf-ai-guide-start-mic-zone" aria-label={titleText}>
          <WaveBars side="left" />
          <div className="sf-ai-guide-start-mic-ring">
            <button
              type="button"
              className="sf-ai-guide-start-mic-button"
              onClick={handleMicrophoneClick}
              aria-label={isRecording ? "结束中文录音" : "开始中文录音"}
              aria-pressed={isRecording}
            >
              <MicGlyph />
            </button>
          </div>
          <WaveBars side="right" />
        </section>

        <section className="sf-ai-guide-start-action-area">
          <button
            type="button"
            className="sf-ai-guide-start-instruction"
            onClick={handleMicrophoneClick}
            aria-label={isRecording ? "结束中文录音" : "开始中文录音"}
          >
            <span className="sf-ai-guide-start-instruction-icon" aria-hidden="true">
              <UpArrowGlyph />
            </span>
            <span>{instructionText}</span>
          </button>

          <p className="sf-ai-guide-start-note">
            <span className="sf-ai-guide-start-note-pill">
              <CheckCircleGlyph />
              <span>免费体验 {FREE_PRACTICE_DAILY_LIMIT} 句</span>
            </span>
            <span className="sf-ai-guide-start-note-save">
              登录可保存学习记录
            </span>
          </p>
        </section>

        <section className="sf-ai-guide-start-help-card" aria-label="怎么练">
          <h2 className="sf-ai-guide-start-help-title">
            <HelpBoltGlyph />
            <span>怎么练？</span>
          </h2>
          <div className="sf-ai-guide-start-steps">
            {learningFlow.map((item) => (
              <div className="sf-ai-guide-start-step" key={item.title}>
                <span className="sf-ai-guide-start-step-icon" aria-hidden="true">
                  <StepIcon icon={item.icon} />
                </span>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </section>

        <nav className="sf-ai-guide-start-bottom-nav" aria-label="学习导航">
          <button
            type="button"
            className="sf-ai-guide-start-bottom-button is-active"
            onClick={handleHomeClick}
            aria-label="回到学习首页"
          >
            <BottomHomeIcon />
          </button>
          <button
            type="button"
            className="sf-ai-guide-start-bottom-button"
            onClick={openProgress}
            aria-label="查看学习进度"
            aria-haspopup="dialog"
            aria-expanded={isProgressOpen}
          >
            <BottomProgressIcon />
          </button>
          <button
            type="button"
            className="sf-ai-guide-start-bottom-button"
            onClick={() => setIsHelpOpen(true)}
            aria-label="打开使用帮助"
            aria-haspopup="dialog"
            aria-expanded={isHelpOpen}
          >
            <BottomHelpIcon />
          </button>
          <button
            type="button"
            className="sf-ai-guide-start-bottom-button"
            onClick={handleAccountClick}
            aria-label="打开账户"
          >
            <BottomAccountIcon />
            {hasProEntitlement ? (
              <span className="sf-ai-guide-start-bottom-pro">PRO</span>
            ) : null}
          </button>
        </nav>
      </div>

      <AiGuidedExpressionHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {isProgressOpen ? (
        <div
          className="sf-ai-guide-start-progress-backdrop"
          role="presentation"
          onClick={() => setIsProgressOpen(false)}
        >
          <section
            className="sf-ai-guide-start-progress-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sf-ai-guide-progress-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sf-ai-guide-start-progress-head">
              <div>
                <p className="sf-ai-guide-start-progress-kicker">学习进度</p>
                <h2 id="sf-ai-guide-progress-title">AI 引导表达</h2>
              </div>
              <button
                type="button"
                className="sf-ai-guide-start-progress-close"
                onClick={() => setIsProgressOpen(false)}
                aria-label="关闭学习进度"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {progressError ? (
              <div className="sf-ai-guide-start-progress-error">
                {progressError}
              </div>
            ) : isProgressLoading || !progressSnapshot ? (
              <div className="sf-ai-guide-start-progress-loading">
                正在同步学习进度...
              </div>
            ) : (
              <>
                <div className="sf-ai-guide-start-progress-grid">
                  <div className="sf-ai-guide-start-progress-stat">
                    <span>{todayCompleted}</span>
                    <small>今日完成 / {dailyGoal}</small>
                  </div>
                  <div className="sf-ai-guide-start-progress-stat">
                    <span>{streakDays}</span>
                    <small>连续天数</small>
                  </div>
                  <div className="sf-ai-guide-start-progress-stat">
                    <span>{totalCompleted}</span>
                    <small>累计完成</small>
                  </div>
                </div>

                <div className="sf-ai-guide-start-progress-card">
                  <div className="sf-ai-guide-start-progress-card-head">
                    <span>今日挑战</span>
                    <strong>
                      {challengeCompleted}/{challengeGoal}
                    </strong>
                  </div>
                  <div className="sf-ai-guide-start-progress-track">
                    <span style={{ width: `${challengePercent}%` }} />
                  </div>
                  <p>{challengePercent}% 已完成</p>
                </div>

                <div className="sf-ai-guide-start-progress-steps">
                  {progressStepOrder.map((item, index) => {
                    const step = progressSnapshot?.steps?.[item.id];
                    const status = step?.status ?? "locked";

                    return (
                      <div
                        className={`sf-ai-guide-start-progress-step is-${status}`}
                        key={item.id}
                      >
                        <span className="sf-ai-guide-start-progress-step-index">
                          {index + 1}
                        </span>
                        <span className="sf-ai-guide-start-progress-step-copy">
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
    </main>
  );
}
