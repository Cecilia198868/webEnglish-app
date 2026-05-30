"use client";

import type { CSSProperties } from "react";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";

type AiGuidedExpressionStepFourProps = {
  isRecordingEnglish: boolean;
  nativeSpeech: string;
  menuLabel?: string;
  accountLabel?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  onMenuClick: () => void;
  onAccountClick: () => void;
  onMicrophoneClick: () => void;
  onAvatarError?: () => void;
};

const COPY = {
  accountLabel: "打开账户界面",
  body: "看着这句中文，用英语说出来",
  emptyNative: "这里会显示你确认好的中文",
  menuLabel: "回到主菜单",
  pageLabel: "AI 引导表达英文录音",
  readyStatus: "点击麦克风开始录音",
  recordingStatus: "正在自动录音，说完后会进入下一页",
  titlePrefix: "正在听你说",
  titleSuffix: "英文",
} as const;

const tips = [
  {
    description: "说得越多，进步越快",
    icon: "mic",
    title: "大胆开口",
  },
  {
    description: "AI 会耐心帮你优化",
    icon: "chat",
    title: "可以不完美",
  },
  {
    description: "像母语者一样自然",
    icon: "sparkles",
    title: "练习地道表达",
  },
] as const;

function getChineseCharacterCount(value: string) {
  return Array.from(value.replace(/\s/g, "")).length;
}

function getFontFitBounds(characterCount: number) {
  if (characterCount <= 8) return { max: 2.92 };
  if (characterCount <= 14) return { max: 2.42 };
  if (characterCount <= 24) return { max: 1.92 };
  if (characterCount <= 40) return { max: 1.48 };
  return { max: 1.2 };
}

function getLineHeight(fontSizeRem: number) {
  if (fontSizeRem >= 2.3) return 1.12;
  if (fontSizeRem >= 1.8) return 1.18;
  if (fontSizeRem >= 1.4) return 1.28;
  return 1.38;
}

function splitNativeSpeech(value: string) {
  const characters = Array.from(value);
  if (characters.length <= 1) {
    return { after: "", before: value, highlight: "" };
  }

  const highlightIndex = Math.min(1, characters.length - 1);

  return {
    after: characters.slice(highlightIndex + 1).join(""),
    before: characters.slice(0, highlightIndex).join(""),
    highlight: characters[highlightIndex],
  };
}

function MenuGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
      <path
        d="M8 10h16M8 16h16M8 22h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
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

function ChatGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 44 44">
      <path
        d="M22 8.2c-7.6 0-13.8 5.2-13.8 11.7 0 3.7 2 7 5.2 9.1l-1.1 5.2 5.4-2.8c1.3.3 2.8.5 4.3.5 7.6 0 13.8-5.3 13.8-11.8S29.6 8.2 22 8.2Z"
        fill="currentColor"
      />
      <circle cx="16.8" cy="20" fill="white" opacity="0.86" r="1.6" />
      <circle cx="22" cy="20" fill="white" opacity="0.86" r="1.6" />
      <circle cx="27.2" cy="20" fill="white" opacity="0.86" r="1.6" />
    </svg>
  );
}

function SparklesGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 44 44">
      <path
        d="M20 6.8 24 17l10.2 4L24 25l-4 10.2L16 25 5.8 21 16 17l4-10.2Z"
        fill="currentColor"
      />
      <path
        d="m32 7.4 1.7 4.2 4.2 1.7-4.2 1.7-1.7 4.2-1.7-4.2-4.2-1.7 4.2-1.7L32 7.4ZM34.5 27l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1 1.1-2.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <rect
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        width="14"
        x="5"
        y="10"
      />
      <path
        d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10M12 14v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function TipIcon({ name }: { name: (typeof tips)[number]["icon"] }) {
  if (name === "chat") return <ChatGlyph />;
  if (name === "sparkles") return <SparklesGlyph />;
  return <MicGlyph />;
}

export default function AiGuidedExpressionStepFour({
  isRecordingEnglish,
  nativeSpeech,
  menuLabel = COPY.menuLabel,
  accountLabel = COPY.accountLabel,
  avatarSrc = "",
  avatarAlt = "user",
  onMenuClick,
  onAccountClick,
  onMicrophoneClick,
  onAvatarError,
}: AiGuidedExpressionStepFourProps) {
  const displayNativeSpeech = nativeSpeech.trim() || COPY.emptyNative;
  const characterCount = getChineseCharacterCount(displayNativeSpeech);
  const nativeTextFontSize = getFontFitBounds(characterCount).max;
  const nativeTextStyle = {
    "--sf-ai-step-four-native-size": `${nativeTextFontSize.toFixed(3)}rem`,
    "--sf-ai-step-four-native-line": String(getLineHeight(nativeTextFontSize)),
  } as CSSProperties;
  const nativeParts = splitNativeSpeech(displayNativeSpeech);

  return (
    <section className="sf-ai-guided-step-four" aria-label={COPY.pageLabel}>
      <div className="sf-ai-guided-step-four-frame">
        <header className="sf-ai-guided-step-four-header">
          <button
            type="button"
            aria-label={menuLabel}
            onClick={onMenuClick}
            className="sf-ai-guided-step-four-menu"
          >
            <MenuGlyph />
          </button>

          <div
            className="sf-ai-guided-step-four-brand"
            aria-label="SpeakFlow AI Voice Practice"
          >
            <span className="sf-ai-guided-step-four-logo">
              <SpeakFlowBrandMark className="sf-ai-guided-step-four-logo-mark" />
            </span>
            <span className="sf-ai-guided-step-four-brand-copy">
              <span className="sf-ai-guided-step-four-brand-title">SpeakFlow</span>
              <span className="sf-ai-guided-step-four-brand-subtitle">
                AI VOICE PRACTICE
              </span>
            </span>
          </div>

          <button
            type="button"
            aria-label={accountLabel}
            onClick={onAccountClick}
            className="sf-ai-guided-step-four-avatar-button"
            title={avatarAlt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc || "/default-avatar.png"}
              alt=""
              className="sf-ai-guided-step-four-avatar-image"
              onError={onAvatarError}
              draggable={false}
            />
          </button>
        </header>

        <main className="sf-ai-guided-step-four-content">
          <section className="sf-ai-guided-step-four-hero" aria-label={COPY.body}>
            <span className="sf-ai-guided-step-four-orbit" aria-hidden="true" />
            <span
              className="sf-ai-guided-step-four-orbit sf-ai-guided-step-four-orbit-inner"
              aria-hidden="true"
            />
            <span className="sf-ai-guided-step-four-dot sf-ai-guided-step-four-dot-left" />
            <span className="sf-ai-guided-step-four-dot sf-ai-guided-step-four-dot-right" />
            <span className="sf-ai-guided-step-four-wave" aria-hidden="true">
              <WaveGlyph />
            </span>

            <p
              lang="zh-CN"
              className="sf-ai-guided-step-four-native"
              style={nativeTextStyle}
            >
              {nativeParts.before}
              {nativeParts.highlight ? <span>{nativeParts.highlight}</span> : null}
              {nativeParts.after}
            </p>

            <h1>
              {COPY.titlePrefix}
              <span>{COPY.titleSuffix}</span>...
            </h1>
            <p className="sf-ai-guided-step-four-hero-copy">{COPY.body}</p>
          </section>

          <div className="sf-ai-guided-step-four-wave-field" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <ul className="sf-ai-guided-step-four-tips" aria-label={COPY.recordingStatus}>
            {tips.map((tip) => (
              <li key={tip.title}>
                <span className="sf-ai-guided-step-four-tip-icon">
                  <TipIcon name={tip.icon} />
                </span>
                <strong>{tip.title}</strong>
                <span>{tip.description}</span>
              </li>
            ))}
          </ul>
        </main>

        <footer className="sf-ai-guided-step-four-record" aria-live="polite">
          <span
            aria-hidden="true"
            className="sf-ai-guided-step-four-record-wave sf-ai-guided-step-four-record-wave-left"
          />
          <button
            type="button"
            aria-label={
              isRecordingEnglish ? "结束英文录音" : "开始英文录音"
            }
            onClick={onMicrophoneClick}
            className={`sf-ai-guided-step-four-mic ${
              isRecordingEnglish ? "is-recording" : ""
            }`}
          >
            <span className="sf-ai-guided-step-four-mic-ring" />
            <span className="sf-ai-guided-step-four-mic-core">
              <MicGlyph />
            </span>
          </button>
          <span
            aria-hidden="true"
            className="sf-ai-guided-step-four-record-wave sf-ai-guided-step-four-record-wave-right"
          />
          <p className="sf-ai-guided-step-four-status">
            <LockGlyph />
            <span>{isRecordingEnglish ? COPY.recordingStatus : COPY.readyStatus}</span>
          </p>
        </footer>
      </div>
    </section>
  );
}
