"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";
import HomeMenuIcon from "@/components/HomeMenuIcon";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";

type ConfirmSpeakState = "confirmChinese" | "recordingEnglish";

type AiGuidedConfirmSpeakPageProps = {
  chineseText: string;
  viewState: ConfirmSpeakState;
  headerAddon?: ReactNode;
  menuLabel?: string;
  onMenuClick: () => void;
  onEditChinese: (value: string) => void;
  onRetryChinese: () => void;
  onStartEnglishRecording: () => void;
  onStopEnglishRecording: () => void;
};

const emptyChineseText = "这里会显示你刚才说的中文";

function getChineseCharacterCount(value: string) {
  return Array.from(value.replace(/\s/g, "")).length;
}

function getChineseTextSize(value: string) {
  const count = getChineseCharacterCount(value);
  if (count <= 16) return 1.42;
  if (count <= 32) return 1.22;
  if (count <= 52) return 1.05;
  return 0.94;
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

function WaveGlyph() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M8 19v2M13 15v10M18 10v20M23 14v12M28 8v24M33 16v8" />
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

export default function AiGuidedConfirmSpeakPage({
  chineseText,
  viewState,
  headerAddon,
  menuLabel = "回到学习首页",
  onMenuClick,
  onEditChinese,
  onRetryChinese,
  onStartEnglishRecording,
  onStopEnglishRecording,
}: AiGuidedConfirmSpeakPageProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isRecordingEnglish = viewState === "recordingEnglish";
  const displayChineseText = chineseText.trim() || emptyChineseText;
  const chineseTextSize = getChineseTextSize(displayChineseText);
  const chineseTextStyle = {
    "--sf-ai-confirm-speak-chinese-size": `${chineseTextSize.toFixed(3)}rem`,
  } as CSSProperties;

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
    if (!chineseText.trim()) return;
    onStartEnglishRecording();
  }

  return (
    <section
      className={`sf-ai-confirm-speak-page ${
        isRecordingEnglish ? "is-recording-english" : "is-confirm-chinese"
      }`}
      aria-label={
        isRecordingEnglish ? "看着中文说英文" : "确认识别出的中文"
      }
    >
      <style>{`
        .sf-ai-confirm-speak-page,
        .sf-ai-confirm-speak-page * {
          box-sizing: border-box;
        }

        .sf-ai-confirm-speak-page {
          width: 100%;
          height: 100%;
          min-height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          color: #08143f;
          background:
            radial-gradient(circle at 18% 16%, rgba(219, 242, 255, 0.82), transparent 35%),
            radial-gradient(circle at 82% 45%, rgba(237, 231, 255, 0.7), transparent 34%),
            linear-gradient(180deg, #eef8ff 0%, #f8fbff 48%, #f4f8ff 100%);
          font-family: var(--sf-font-zh, "PingFang SC", "Microsoft YaHei", sans-serif);
        }

        .sf-ai-confirm-speak-frame {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100%;
          padding: calc(env(safe-area-inset-top, 0px) + 1.2rem) clamp(1.15rem, 5vw, 1.55rem)
            calc(env(safe-area-inset-bottom, 0px) + 1.35rem);
          overflow: hidden;
        }

        .sf-ai-confirm-speak-frame::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.92), transparent 34%),
            radial-gradient(circle at 50% 67%, rgba(141, 189, 255, 0.18), transparent 43%);
        }

        .sf-ai-confirm-speak-header {
          display: grid;
          grid-template-columns: 3rem minmax(0, 1fr) 3rem;
          align-items: center;
          gap: 0.6rem;
          min-height: 4.55rem;
        }

        .sf-ai-confirm-speak-home,
        .sf-ai-confirm-speak-help {
          display: grid;
          width: 3rem;
          height: 3rem;
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          color: #11162f;
          box-shadow:
            0 14px 28px rgba(67, 101, 176, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .sf-ai-confirm-speak-home:active,
        .sf-ai-confirm-speak-help:active,
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
          outline: 3px solid rgba(61, 115, 255, 0.36);
          outline-offset: 4px;
        }

        .sf-ai-confirm-speak-home .sf-home-menu-icon,
        .sf-ai-confirm-speak-home .sf-home-menu-icon svg {
          width: 1.95rem;
          height: 1.95rem;
        }

        .sf-ai-confirm-speak-home .sf-home-menu-icon svg {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.8;
        }

        .sf-ai-confirm-speak-help {
          justify-self: end;
          font-size: 1.42rem;
          font-weight: 900;
          line-height: 1;
        }

        .sf-ai-confirm-speak-brand {
          display: flex;
          min-width: 0;
          align-items: center;
          justify-content: center;
          gap: clamp(0.65rem, 2.4vw, 0.9rem);
        }

        .sf-ai-confirm-speak-logo {
          display: grid;
          width: 3.1rem;
          height: 3.1rem;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 1.18rem;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 18px 34px rgba(91, 118, 201, 0.15);
        }

        .sf-ai-confirm-speak-logo-mark {
          width: 72%;
          height: 72%;
        }

        .sf-ai-confirm-speak-brand-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
        }

        .sf-ai-confirm-speak-brand-title {
          color: #08133f;
          font-size: 1.95rem;
          font-weight: 950;
          letter-spacing: 0;
          line-height: 0.94;
        }

        .sf-ai-confirm-speak-brand-subtitle {
          margin-top: 0.32rem;
          color: #3473f4 !important;
          font-size: 0.72rem;
          font-weight: 760;
          letter-spacing: 0;
          line-height: 1;
        }

        .sf-ai-confirm-speak-content {
          display: flex;
          flex-direction: column;
          min-height: calc(100% - 6rem);
          padding-top: clamp(1.6rem, 5dvh, 2.7rem);
        }

        .sf-ai-confirm-speak-title {
          margin: 0;
          color: #08133f;
          font-size: clamp(1.9rem, 9vw, 2.65rem);
          font-weight: 950;
          letter-spacing: 0;
          line-height: 1.08;
          text-align: center;
          text-shadow: 0 18px 44px rgba(52, 109, 255, 0.12);
        }

        .sf-ai-confirm-speak-chinese-card {
          position: relative;
          margin-top: 1.05rem;
          border: 1px solid rgba(201, 218, 255, 0.92);
          border-radius: 1.35rem;
          background:
            radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.95), transparent 44%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 252, 255, 0.86));
          box-shadow:
            0 24px 56px rgba(67, 101, 176, 0.13),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
          padding: 1rem;
        }

        .sf-ai-confirm-speak-card-head {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .sf-ai-confirm-speak-edit {
          display: inline-flex;
          align-items: center;
          gap: 0.36rem;
          border: 0;
          border-radius: 999px;
          background: rgba(232, 240, 255, 0.82);
          color: #2f6fff;
          padding: 0.42rem 0.7rem;
          font-size: 0.82rem;
          font-weight: 820;
          cursor: pointer;
        }

        .sf-ai-confirm-speak-edit svg {
          width: 1rem;
          height: 1rem;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.1;
        }

        .sf-ai-confirm-speak-textarea {
          width: 100%;
          min-height: 7.6rem;
          max-height: 12rem;
          margin-top: 0.66rem;
          border: 0;
          background: transparent;
          color: #08133f;
          resize: none;
          text-align: center;
          font: inherit;
          font-size: var(--sf-ai-confirm-speak-chinese-size);
          font-weight: 850;
          letter-spacing: 0;
          line-height: 1.35;
          outline: none;
        }

        .sf-ai-confirm-speak-textarea::placeholder {
          color: rgba(61, 72, 114, 0.52);
        }

        .sf-ai-confirm-speak-card-note {
          margin: 0.55rem 0 0;
          color: rgba(58, 70, 113, 0.68);
          font-size: 0.84rem;
          font-weight: 560;
          line-height: 1.35;
          text-align: center;
        }

        .sf-ai-confirm-speak-actions {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          gap: 0.72rem;
          margin-top: 1rem;
        }

        .sf-ai-confirm-speak-retry-button,
        .sf-ai-confirm-speak-confirm-button,
        .sf-ai-confirm-speak-stop-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          min-height: 3.35rem;
          border: 0;
          border-radius: 1rem;
          font-weight: 850;
          letter-spacing: 0;
          cursor: pointer;
          box-shadow: 0 15px 30px rgba(67, 101, 176, 0.13);
        }

        .sf-ai-confirm-speak-retry-button {
          background: rgba(255, 255, 255, 0.84);
          color: #30517d;
          font-size: 0.94rem;
        }

        .sf-ai-confirm-speak-confirm-button {
          background: linear-gradient(135deg, #43b8ff 0%, #1f66ff 100%);
          color: #fff !important;
          font-size: 0.9rem;
          line-height: 1.18;
          padding-inline: 0.62rem;
        }

        .sf-ai-confirm-speak-confirm-button:disabled {
          cursor: not-allowed;
          opacity: 0.58;
        }

        .sf-ai-confirm-speak-retry-button svg,
        .sf-ai-confirm-speak-confirm-button svg,
        .sf-ai-confirm-speak-stop-button svg {
          width: 1.1rem;
          height: 1.1rem;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.35;
        }

        .sf-ai-confirm-speak-record-panel {
          position: relative;
          margin-top: 1.1rem;
          border: 1px solid rgba(207, 222, 252, 0.88);
          border-radius: 1.4rem;
          background: rgba(255, 255, 255, 0.76);
          box-shadow:
            0 20px 46px rgba(67, 101, 176, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.94);
          padding: 1.05rem 1rem 1.1rem;
          text-align: center;
          transition: opacity 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }

        .sf-ai-confirm-speak-record-panel-idle {
          opacity: 0.58;
        }

        .sf-ai-confirm-speak-record-panel-active {
          opacity: 1;
          transform: translateY(-0.15rem);
          box-shadow:
            0 26px 58px rgba(44, 63, 181, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        .sf-ai-confirm-speak-record-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          margin: 0;
          color: #286bff;
          font-size: 0.86rem;
          font-weight: 820;
          line-height: 1.2;
        }

        .sf-ai-confirm-speak-record-kicker svg {
          width: 1rem;
          height: 1rem;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-width: 2.4;
        }

        .sf-ai-confirm-speak-record-title {
          margin: 0.45rem 0 0;
          color: #08133f;
          font-size: 1.48rem;
          font-weight: 950;
          line-height: 1.12;
        }

        .sf-ai-confirm-speak-record-copy {
          margin: 0.4rem 0 0;
          color: rgba(54, 68, 110, 0.7);
          font-size: 0.92rem;
          font-weight: 560;
          line-height: 1.32;
        }

        .sf-ai-confirm-speak-record-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.44rem;
          margin: 0.72rem 0 0;
          color: #265dff;
          font-size: 0.96rem;
          font-weight: 850;
          line-height: 1.2;
        }

        .sf-ai-confirm-speak-wave-mini {
          display: inline-flex;
          align-items: center;
          gap: 0.14rem;
          height: 1.2rem;
        }

        .sf-ai-confirm-speak-wave-mini span {
          display: block;
          width: 0.18rem;
          border-radius: 999px;
          background: currentColor;
          animation: sf-ai-confirm-speak-wave 1.08s ease-in-out infinite;
        }

        .sf-ai-confirm-speak-wave-mini span:nth-child(2) {
          animation-delay: 100ms;
        }

        .sf-ai-confirm-speak-wave-mini span:nth-child(3) {
          animation-delay: 200ms;
        }

        .sf-ai-confirm-speak-mic-wrap {
          position: relative;
          display: grid;
          width: min(56vw, 12.5rem);
          aspect-ratio: 1;
          place-items: center;
          margin: 0.95rem auto 0;
        }

        .sf-ai-confirm-speak-mic-wrap::before,
        .sf-ai-confirm-speak-mic-wrap::after {
          content: "";
          position: absolute;
          inset: -0.52rem;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(95, 105, 255, 0.16), transparent 66%);
        }

        .sf-ai-confirm-speak-mic-wrap::after {
          inset: -1.2rem;
          border: 1px solid rgba(98, 116, 255, 0.13);
          background: transparent;
        }

        .sf-ai-confirm-speak-record-panel-active .sf-ai-confirm-speak-mic-wrap::before {
          animation: sf-ai-confirm-speak-pulse 1.75s ease-in-out infinite;
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
          border: 0;
          border-radius: 999px;
          background: linear-gradient(135deg, #d9e9ff 0%, #edf4ff 100%);
          color: rgba(64, 100, 170, 0.46);
          cursor: pointer;
          box-shadow:
            0 16px 40px rgba(67, 101, 176, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        .sf-ai-confirm-speak-mic-active {
          background: linear-gradient(135deg, #6d4cff 0%, #3157ff 55%, #111a8f 100%);
          color: #fff;
          box-shadow:
            0 24px 54px rgba(47, 70, 214, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.34);
        }

        .sf-ai-confirm-speak-mic svg {
          width: 44%;
          height: 44%;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 3.4;
        }

        .sf-ai-confirm-speak-record-wave {
          position: absolute;
          top: 50%;
          width: 3.5rem;
          height: 4.8rem;
          transform: translateY(-50%);
          opacity: 0.2;
          color: #567cff;
          background:
            linear-gradient(90deg, transparent 0 8%, currentColor 8% 13%, transparent 13% 21%, currentColor 21% 29%, transparent 29% 38%, currentColor 38% 45%, transparent 45% 56%, currentColor 56% 63%, transparent 63% 74%, currentColor 74% 80%, transparent 80% 100%);
          border-radius: 999px;
          filter: blur(0.2px);
        }

        .sf-ai-confirm-speak-record-panel-active .sf-ai-confirm-speak-record-wave {
          opacity: 0.33;
          animation: sf-ai-confirm-speak-wave-float 1.7s ease-in-out infinite;
        }

        .sf-ai-confirm-speak-record-wave-left {
          right: calc(50% + min(28vw, 6.25rem));
        }

        .sf-ai-confirm-speak-record-wave-right {
          left: calc(50% + min(28vw, 6.25rem));
        }

        .sf-ai-confirm-speak-stop-button {
          width: min(100%, 18.5rem);
          min-height: 3.55rem;
          margin-top: 0.95rem;
          background: linear-gradient(135deg, #35b8ff 0%, #245dff 100%);
          color: #fff !important;
          font-size: 1.02rem;
        }

        .sf-ai-confirm-speak-tip {
          margin: 0.72rem 0 0;
          color: rgba(42, 54, 91, 0.68);
          font-size: 0.85rem;
          font-weight: 560;
          line-height: 1.35;
        }

        @keyframes sf-ai-confirm-speak-wave {
          0%,
          100% {
            transform: scaleY(0.56);
            opacity: 0.6;
          }

          50% {
            transform: scaleY(1.12);
            opacity: 1;
          }
        }

        @keyframes sf-ai-confirm-speak-pulse {
          0%,
          100% {
            transform: scale(0.96);
            opacity: 0.62;
          }

          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }

        @keyframes sf-ai-confirm-speak-wave-float {
          0%,
          100% {
            transform: translateY(-50%) scaleY(0.86);
          }

          50% {
            transform: translateY(-50%) scaleY(1.08);
          }
        }

        @media (max-width: 480px) {
          .sf-ai-confirm-speak-frame {
            padding-inline: 1.05rem;
          }

          .sf-ai-confirm-speak-header {
            grid-template-columns: 2.8rem minmax(0, 1fr) 2.8rem;
          }

          .sf-ai-confirm-speak-home,
          .sf-ai-confirm-speak-help {
            width: 2.8rem;
            height: 2.8rem;
          }

          .sf-ai-confirm-speak-logo {
            width: 2.8rem;
            height: 2.8rem;
            border-radius: 0.95rem;
          }

          .sf-ai-confirm-speak-brand-title {
            font-size: 1.72rem;
          }

          .sf-ai-confirm-speak-brand-subtitle {
            font-size: 0.68rem;
          }

          .sf-ai-confirm-speak-content {
            padding-top: 1.45rem;
          }

          .sf-ai-confirm-speak-textarea {
            min-height: 6.6rem;
          }

          .sf-ai-confirm-speak-actions {
            gap: 0.58rem;
          }

          .sf-ai-confirm-speak-retry-button {
            font-size: 0.86rem;
          }

          .sf-ai-confirm-speak-confirm-button {
            font-size: 0.82rem;
          }

          .sf-ai-confirm-speak-record-title {
            font-size: 1.34rem;
          }
        }

        @media (max-height: 760px) {
          .sf-ai-confirm-speak-content {
            padding-top: 1.05rem;
          }

          .sf-ai-confirm-speak-chinese-card {
            margin-top: 0.75rem;
          }

          .sf-ai-confirm-speak-textarea {
            min-height: 5.8rem;
          }

          .sf-ai-confirm-speak-actions {
            margin-top: 0.76rem;
          }

          .sf-ai-confirm-speak-record-panel {
            margin-top: 0.82rem;
            padding-block: 0.82rem 0.9rem;
          }

          .sf-ai-confirm-speak-mic-wrap {
            width: min(48vw, 10.2rem);
          }
        }
      `}</style>

      <div className="sf-ai-confirm-speak-frame">
        <header className="sf-ai-confirm-speak-header">
          <button
            type="button"
            aria-label={menuLabel}
            onClick={onMenuClick}
            className="sf-ai-confirm-speak-home"
          >
            <HomeMenuIcon label={null} showHint={false} />
          </button>

          <div
            className="sf-ai-confirm-speak-brand"
            aria-label="SpeakFlow AI Voice Practice"
          >
            <span className="sf-ai-confirm-speak-logo">
              <SpeakFlowBrandMark className="sf-ai-confirm-speak-logo-mark" />
            </span>
            <span className="sf-ai-confirm-speak-brand-copy">
              <span className="sf-ai-confirm-speak-brand-title">SpeakFlow</span>
              <span className="sf-ai-confirm-speak-brand-subtitle">
                AI VOICE PRACTICE
              </span>
            </span>
          </div>

          <button
            type="button"
            aria-label="查看帮助"
            className="sf-ai-confirm-speak-help"
          >
            ?
          </button>
        </header>

        {headerAddon}

        <main className="sf-ai-confirm-speak-content">
          <h1 className="sf-ai-confirm-speak-title">你想表达的是：</h1>

          <section className="sf-ai-confirm-speak-chinese-card">
            <div className="sf-ai-confirm-speak-card-head">
              <button
                type="button"
                className="sf-ai-confirm-speak-edit"
                onClick={focusChineseText}
              >
                <EditGlyph />
                <span>编辑中文</span>
              </button>
            </div>
            <textarea
              ref={textareaRef}
              aria-label="识别出的中文，可编辑"
              className="sf-ai-confirm-speak-textarea"
              placeholder={emptyChineseText}
              style={chineseTextStyle}
              value={chineseText}
              onChange={(event) => onEditChinese(event.target.value)}
            />
            <p className="sf-ai-confirm-speak-card-note">
              这是我们听到的内容，你可以修改后再确认
            </p>
          </section>

          {!isRecordingEnglish ? (
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
                className="sf-ai-confirm-speak-confirm-button"
                onClick={handleStartEnglishRecording}
                disabled={!chineseText.trim()}
              >
                <CheckGlyph />
                <span>确认，点击麦克风说英文</span>
              </button>
            </section>
          ) : null}

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
                <p className="sf-ai-confirm-speak-record-kicker">
                  <WaveGlyph />
                  <span>正在听你说...</span>
                </p>
                <h2 className="sf-ai-confirm-speak-record-title">
                  看着中文，说英文
                </h2>
                <p className="sf-ai-confirm-speak-record-copy">
                  可以不完美，大胆说出来
                </p>
              </>
            ) : (
              <>
                <h2 className="sf-ai-confirm-speak-record-title">
                  确认后，就可以看着中文说英文
                </h2>
                <p className="sf-ai-confirm-speak-record-copy">
                  下方麦克风会在确认后亮起
                </p>
              </>
            )}

            <div className="sf-ai-confirm-speak-mic-wrap">
              <span
                aria-hidden="true"
                className="sf-ai-confirm-speak-record-wave sf-ai-confirm-speak-record-wave-left"
              />
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
              >
                <MicGlyph />
              </button>
              <span
                aria-hidden="true"
                className="sf-ai-confirm-speak-record-wave sf-ai-confirm-speak-record-wave-right"
              />
            </div>

            {isRecordingEnglish ? (
              <>
                <p className="sf-ai-confirm-speak-record-status">
                  <span
                    aria-hidden="true"
                    className="sf-ai-confirm-speak-wave-mini"
                  >
                    <span style={{ height: "0.55rem" }} />
                    <span style={{ height: "1rem" }} />
                    <span style={{ height: "0.72rem" }} />
                  </span>
                  <span>正在听你说...</span>
                </p>
                <button
                  type="button"
                  className="sf-ai-confirm-speak-stop-button"
                  onClick={onStopEnglishRecording}
                >
                  <MicGlyph />
                  <span>点击麦克风结束录音</span>
                </button>
                <p className="sf-ai-confirm-speak-tip">
                  说完后，AI 会给你更自然的英文表达
                </p>
              </>
            ) : null}
          </section>
        </main>
      </div>
    </section>
  );
}
