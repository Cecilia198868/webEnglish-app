"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HomeMenuIcon from "@/components/HomeMenuIcon";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";

type FreeStudyPageThreeProps = {
  chineseText: string;
  avatarSrc?: string;
  avatarAlt?: string;
  accountLabel?: string;
  headingText?: string;
  headerAddon?: ReactNode;
  menuLabel?: string;
  variant?: "free" | "guided";
  viewState?: "confirmChinese" | "recordingEnglish";
  onEditChinese: (value: string) => void;
  onRetryChinese: () => void;
  onStartEnglishPractice: () => void;
  onStopEnglishRecording?: () => void;
  onAccountClick?: () => void;
  onAvatarError?: () => void;
  onMenuClick?: () => void;
};

const COPY = {
  confirmAria: "确认中文并开始录制英语",
  confirmButton: "确认，点击麦克风说英文",
  editChinese: "编辑中文",
  editRecognized: "编辑识别出的中文",
  emptyChinese: "这里会显示你刚才说的中文",
  pageLabel: "自由学习确认中文和录英文",
  retryAria: "重新录制中文",
  retryButton: "重新说中文",
} as const;

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

function ShieldGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3 19 6v6.2c0 4.3-2.7 7.3-7 8.8-4.3-1.5-7-4.5-7-8.8V6l7-3Z" />
      <path d="m8.8 12 2.3 2.3 5-5.4" />
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

export default function FreeStudyPageThree({
  chineseText,
  headerAddon,
  menuLabel = "回到学习首页",
  viewState = "confirmChinese",
  onEditChinese,
  onRetryChinese,
  onStartEnglishPractice,
  onStopEnglishRecording,
  onMenuClick,
}: FreeStudyPageThreeProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isRecordingEnglish = viewState === "recordingEnglish";
  const canConfirm = Boolean(chineseText.trim()) && !isRecordingEnglish;

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

  useEffect(() => {
    if (!isHelpOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsHelpOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isHelpOpen]);

  function focusChineseEditor() {
    const textarea = textareaRef.current;
    if (!textarea || isRecordingEnglish) return;

    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
  }

  function stopEnglishRecording() {
    onStopEnglishRecording?.();
  }

  return (
    <section
      className={`sf-free-confirm-page ${
        isRecordingEnglish ? "is-recording-english" : "is-confirming"
      }`}
      aria-label={COPY.pageLabel}
    >
      <style>{`
        .sf-free-confirm-page,
        .sf-free-confirm-page * {
          box-sizing: border-box;
        }

        .sf-free-confirm-page {
          position: absolute;
          inset: 0;
          z-index: 90;
          overflow-y: auto;
          overflow-x: hidden;
          color: #101342;
          background:
            radial-gradient(circle at 50% 11%, rgba(244,231,255,.92), transparent 38%),
            radial-gradient(circle at 80% 75%, rgba(230,217,255,.75), transparent 38%),
            linear-gradient(180deg, #f5ecff 0%, #fbf8ff 45%, #f4eaff 100%);
          font-family: var(--sf-font-zh, "PingFang SC", "Microsoft YaHei", sans-serif);
        }

        .sf-free-confirm-frame {
          min-height: 100%;
          padding: calc(env(safe-area-inset-top, 0px) + 1.45rem) clamp(1.4rem, 5vw, 1.85rem)
            calc(env(safe-area-inset-bottom, 0px) + 1.35rem);
        }

        .sf-free-confirm-header {
          display: grid;
          grid-template-columns: 3.55rem minmax(0, 1fr) 3.55rem;
          align-items: center;
          gap: .72rem;
          margin-bottom: clamp(2.3rem, 6dvh, 3.65rem);
        }

        .sf-free-confirm-home,
        .sf-free-confirm-help,
        .sf-free-confirm-help-close {
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: rgba(255,255,255,.88);
          color: #101342;
          box-shadow: 0 16px 30px rgba(97,73,170,.15), inset 0 1px 0 rgba(255,255,255,.96);
          cursor: pointer;
        }

        .sf-free-confirm-home,
        .sf-free-confirm-help {
          width: 3.55rem;
          height: 3.55rem;
        }

        .sf-free-confirm-home .sf-home-menu-icon,
        .sf-free-confirm-home .sf-home-menu-icon svg {
          width: 2.12rem;
          height: 2.12rem;
          color: currentColor;
        }

        .sf-free-confirm-help {
          justify-self: end;
          color: #7a4dea;
          font-size: 1.55rem;
          font-weight: 950;
        }

        .sf-free-confirm-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .75rem;
          min-width: 0;
        }

        .sf-free-confirm-logo {
          width: 3.28rem;
          height: 3.28rem;
          display: grid;
          place-items: center;
        }

        .sf-free-confirm-logo svg {
          width: 3.2rem;
          height: 3.2rem;
        }

        .sf-free-confirm-brand-copy {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .sf-free-confirm-brand-title {
          color: #0b1244;
          font-size: clamp(2rem, 8.5vw, 2.75rem);
          font-weight: 950;
          line-height: .94;
          letter-spacing: 0;
        }

        .sf-free-confirm-brand-subtitle {
          margin-top: .42rem;
          color: #7c4eed;
          font-size: clamp(.72rem, 3vw, .98rem);
          font-weight: 850;
          line-height: 1;
          letter-spacing: .1em;
        }

        .sf-free-confirm-title {
          display: flex;
          align-items: center;
          gap: .78rem;
          margin: 0 0 1.25rem;
          color: #101342;
          font-size: clamp(1.9rem, 7.6vw, 2.68rem);
          font-weight: 950;
          line-height: 1.08;
          letter-spacing: 0;
        }

        .sf-free-confirm-title svg {
          width: 2.1rem;
          height: 2.1rem;
          flex: 0 0 auto;
          fill: #8a56ee;
        }

        .sf-free-confirm-card {
          border: 1px solid rgba(157,111,233,.12);
          border-radius: 1.9rem;
          background: rgba(255,255,255,.82);
          min-height: clamp(13.5rem, 31dvh, 18.4rem);
          padding: clamp(1.2rem, 4.8vw, 1.9rem);
          box-shadow: 0 18px 40px rgba(110,74,180,.1), inset 0 1px 0 rgba(255,255,255,.96);
        }

        .sf-free-confirm-card-head {
          display: flex;
          justify-content: flex-end;
          margin-bottom: clamp(1.2rem, 4dvh, 2.2rem);
        }

        .sf-free-confirm-edit {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          border: 0;
          background: transparent;
          color: #8a54ee;
          font-size: 1.12rem;
          font-weight: 900;
          cursor: pointer;
        }

        .sf-free-confirm-edit:disabled {
          opacity: .55;
          cursor: default;
        }

        .sf-free-confirm-edit svg,
        .sf-free-confirm-retry svg,
        .sf-free-confirm-button svg {
          width: 1.42rem;
          height: 1.42rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-confirm-textarea {
          display: block;
          width: 100%;
          max-height: 9.6rem;
          resize: none;
          border: 0;
          outline: 0;
          background: transparent;
          color: #101342;
          font: inherit;
          font-size: clamp(2.2rem, 8.2vw, 3.05rem);
          font-weight: 900;
          line-height: 1.5;
          letter-spacing: 0;
        }

        .sf-free-confirm-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .72rem;
          margin: 1rem 0 1.1rem;
          color: rgba(48,48,93,.72);
          font-size: clamp(.96rem, 3.8vw, 1.2rem);
          font-weight: 650;
          line-height: 1.45;
          text-align: center;
        }

        .sf-free-confirm-note svg {
          width: 1.65rem;
          height: 1.65rem;
          flex: 0 0 auto;
          fill: #7f56ee;
          stroke: white;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sf-free-confirm-actions {
          display: grid;
          grid-template-columns: minmax(0, .9fr) minmax(0, 1.35fr);
          gap: .85rem;
          margin-bottom: 1.15rem;
        }

        .sf-free-confirm-retry,
        .sf-free-confirm-button {
          display: flex;
          min-height: 4.2rem;
          align-items: center;
          justify-content: center;
          gap: .72rem;
          border-radius: 1.35rem;
          font-size: clamp(1rem, 4vw, 1.28rem);
          font-weight: 900;
          cursor: pointer;
        }

        .sf-free-confirm-retry {
          border: 0;
          background: rgba(255,255,255,.86);
          color: #101342;
          box-shadow: 0 14px 28px rgba(104,75,173,.1), inset 0 1px 0 rgba(255,255,255,.96);
        }

        .sf-free-confirm-button {
          border: 1px solid rgba(255,255,255,.6);
          background: linear-gradient(90deg, #dca2ff 0%, #9b60ef 52%, #7654f1 100%);
          color: white;
          box-shadow: 0 16px 30px rgba(136,82,239,.24), inset 0 1px 0 rgba(255,255,255,.52);
        }

        .sf-free-confirm-button:disabled {
          border-color: rgba(160,115,237,.32);
          background: rgba(255,255,255,.46);
          color: rgba(122,80,221,.46);
          box-shadow: inset 0 0 0 1px rgba(153,111,235,.18);
          cursor: default;
        }

        .sf-free-record-divider {
          height: 1px;
          margin: 0 0 1.25rem;
          background-image: linear-gradient(90deg, transparent 0, transparent 2%, rgba(161,117,238,.34) 2%, rgba(161,117,238,.34) 4%, transparent 4%, transparent 7%);
          background-size: 1.4rem 1px;
        }

        .sf-free-record-panel {
          border: 1px solid rgba(157,111,233,.13);
          border-radius: 1.65rem;
          background: rgba(255,255,255,.72);
          padding: 1.25rem 1.1rem;
          text-align: center;
          box-shadow: 0 18px 42px rgba(111,78,182,.1), inset 0 1px 0 rgba(255,255,255,.95);
        }

        .sf-free-confirm-page.is-confirming .sf-free-record-panel {
          opacity: .46;
        }

        .sf-free-record-panel h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .72rem;
          margin: 0;
          color: #8a54ee;
          font-size: clamp(1.35rem, 5.6vw, 1.95rem);
          font-weight: 950;
          line-height: 1.14;
        }

        .sf-free-record-panel h2 svg {
          width: 1.55rem;
          height: 1.55rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 3.1;
          stroke-linecap: round;
        }

        .sf-free-record-panel > p {
          margin: .42rem 0 0;
          color: rgba(41,43,86,.72);
          font-size: clamp(.96rem, 3.8vw, 1.18rem);
          font-weight: 650;
        }

        .sf-free-record-status {
          display: none;
          margin-top: .85rem;
          color: #8a54ee;
          font-size: 1.18rem;
          font-weight: 900;
        }

        .sf-free-confirm-page.is-recording-english .sf-free-record-status {
          display: block;
        }

        .sf-free-record-mic-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(1rem, 6vw, 2.1rem);
          margin: 1.1rem 0 .95rem;
        }

        .sf-free-record-wave {
          display: flex;
          align-items: center;
          gap: .34rem;
          color: #a36df4;
          opacity: .68;
        }

        .sf-free-record-wave span {
          width: .34rem;
          border-radius: 999px;
          background: currentColor;
        }

        .sf-free-record-mic {
          display: grid;
          width: clamp(5.7rem, 24vw, 7.2rem);
          aspect-ratio: 1;
          place-items: center;
          border: .55rem solid rgba(255,255,255,.82);
          border-radius: 50%;
          background: linear-gradient(135deg, #dba0ff, #8a54ee 62%, #6f4af0);
          color: white;
          box-shadow: 0 15px 34px rgba(133,78,235,.24), 0 0 0 .85rem rgba(148,94,238,.12);
          cursor: pointer;
        }

        .sf-free-confirm-page.is-confirming .sf-free-record-mic {
          cursor: default;
        }

        .sf-free-record-mic svg {
          width: 46%;
          height: 46%;
          fill: currentColor;
          stroke: currentColor;
          stroke-width: 3.4;
          stroke-linecap: round;
        }

        .sf-free-record-stop {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: .55rem;
          width: min(100%, 16rem);
          min-height: 3.05rem;
          border: 1px solid #9b63ef;
          border-radius: 999px;
          background: rgba(255,255,255,.74);
          color: #8353ef;
          font-size: 1.05rem;
          font-weight: 850;
          cursor: pointer;
        }

        .sf-free-record-tip {
          margin: 1.05rem auto 0;
          border-radius: 1rem;
          background: rgba(240,232,255,.78);
          padding: .9rem 1rem;
          color: rgba(76,62,125,.72);
          font-size: 1rem;
          font-weight: 650;
        }

        .sf-free-confirm-help-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: grid;
          place-items: center;
          background: rgba(25,27,44,.36);
          padding: 1rem;
          backdrop-filter: blur(10px);
        }

        .sf-free-confirm-help-modal {
          width: min(100%, 24rem);
          border: 1px solid rgba(159,121,230,.18);
          border-radius: 1.8rem;
          background: rgba(255,255,255,.96);
          padding: 1.35rem;
          box-shadow: 0 28px 60px rgba(37,31,78,.24);
        }

        .sf-free-confirm-help-modal header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .sf-free-confirm-help-modal h2 {
          margin: 0;
          color: #101342;
          font-size: 1.4rem;
          font-weight: 950;
        }

        .sf-free-confirm-help-close {
          width: 2.6rem;
          height: 2.6rem;
        }

        .sf-free-confirm-help-close svg {
          width: 1.35rem;
          height: 1.35rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.6;
          stroke-linecap: round;
        }

        .sf-free-confirm-help-modal p {
          margin: 1rem 0 0;
          color: rgba(37,39,83,.72);
          font-size: 1rem;
          font-weight: 650;
          line-height: 1.65;
        }

        @media (max-width: 360px) {
          .sf-free-confirm-frame {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .sf-free-confirm-actions {
            grid-template-columns: 1fr;
          }

          .sf-free-confirm-textarea {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="sf-free-confirm-frame">
        <header className="sf-free-confirm-header">
          <button
            type="button"
            aria-label={menuLabel}
            onClick={onMenuClick}
            className="sf-free-confirm-home"
          >
            <HomeMenuIcon label={null} showHint={false} />
          </button>

          <div className="sf-free-confirm-brand" aria-label="SpeakFlow AI Voice Practice">
            <span className="sf-free-confirm-logo" aria-hidden="true">
              <SpeakFlowBrandMark />
            </span>
            <span className="sf-free-confirm-brand-copy">
              <span className="sf-free-confirm-brand-title">SpeakFlow</span>
              <span className="sf-free-confirm-brand-subtitle">AI VOICE PRACTICE</span>
            </span>
          </div>

          <button
            type="button"
            aria-label="打开自由学习帮助"
            onClick={() => setIsHelpOpen(true)}
            className="sf-free-confirm-help"
          >
            ?
          </button>
        </header>

        {headerAddon}

        <main>
          <h1 className="sf-free-confirm-title">
            <SparklesGlyph />
            你想表达的是：
          </h1>

          <section className="sf-free-confirm-card">
            <div className="sf-free-confirm-card-head">
              <button
                type="button"
                onClick={focusChineseEditor}
                disabled={isRecordingEnglish}
                className="sf-free-confirm-edit"
              >
                <EditGlyph />
                {COPY.editChinese}
              </button>
            </div>

            <textarea
              ref={textareaRef}
              aria-label={COPY.editRecognized}
              lang="zh-CN"
              value={chineseText}
              onChange={(event) => onEditChinese(event.target.value)}
              placeholder={COPY.emptyChinese}
              readOnly={isRecordingEnglish}
              className="sf-free-confirm-textarea"
            />
          </section>

          <p className="sf-free-confirm-note">
            <ShieldGlyph />
            这是我们听到的内容，你可以修改后再确认
          </p>

          <div className="sf-free-confirm-actions">
            <button
              type="button"
              aria-label={COPY.retryAria}
              onClick={onRetryChinese}
              className="sf-free-confirm-retry"
            >
              <RefreshGlyph />
              {COPY.retryButton}
            </button>

            <button
              type="button"
              aria-label={COPY.confirmAria}
              onClick={onStartEnglishPractice}
              disabled={!canConfirm}
              className="sf-free-confirm-button"
            >
              {COPY.confirmButton}
            </button>
          </div>

          <div className="sf-free-record-divider" />

          <section className="sf-free-record-panel" aria-live="polite">
            <h2>
              <WaveGlyph />
              {isRecordingEnglish
                ? "看着中文，说英文"
                : "确认后，就可以看着中文说英文"}
              <WaveGlyph />
            </h2>
            {isRecordingEnglish ? <p>可以不完美，大胆说出来</p> : null}
            <span className="sf-free-record-status">正在听你说...</span>

            <div className="sf-free-record-mic-row">
              <span className="sf-free-record-wave" aria-hidden="true">
                {[24, 42, 64, 48, 28].map((height) => (
                  <span key={`left-${height}`} style={{ height }} />
                ))}
              </span>
              <button
                type="button"
                aria-label={
                  isRecordingEnglish ? "点击麦克风结束录音" : "等待确认中文后录英文"
                }
                onClick={isRecordingEnglish ? stopEnglishRecording : undefined}
                className="sf-free-record-mic"
              >
                <MicGlyph />
              </button>
              <span className="sf-free-record-wave" aria-hidden="true">
                {[28, 48, 64, 42, 24].map((height) => (
                  <span key={`right-${height}`} style={{ height }} />
                ))}
              </span>
            </div>

            {isRecordingEnglish ? (
              <>
                <button
                  type="button"
                  onClick={stopEnglishRecording}
                  className="sf-free-record-stop"
                >
                  <MicGlyph />
                  点击麦克风结束录音
                </button>
                <p className="sf-free-record-tip">
                  说完后，AI 会给你更自然的英文表达
                </p>
              </>
            ) : (
              <button
                type="button"
                disabled
                className="sf-free-record-stop"
              >
                <MicGlyph />
                点击麦克风开始说英文
              </button>
            )}
          </section>
        </main>
      </div>

      {isHelpOpen ? (
        <div
          className="sf-free-confirm-help-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="自由学习帮助"
          onClick={() => setIsHelpOpen(false)}
        >
          <section
            className="sf-free-confirm-help-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>自由学习怎么练？</h2>
              <button
                type="button"
                aria-label="关闭帮助"
                onClick={() => setIsHelpOpen(false)}
                className="sf-free-confirm-help-close"
              >
                <CloseGlyph />
              </button>
            </header>
            <p>
              先确认识别出的中文，再看着中文大胆说英文。说完以后，
              SpeakFlow 会给你更自然、更地道、更简单和更口语的表达。
            </p>
          </section>
        </div>
      ) : null}
    </section>
  );
}
