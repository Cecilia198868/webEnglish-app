"use client";

import type { CSSProperties } from "react";

type FreeStudyPageFourProps = {
  isRecordingEnglish: boolean;
  nativeSpeech: string;
  menuLabel?: string;
  accountLabel?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  onMenuClick: () => void;
  onAccountClick: () => void;
  onAvatarError?: () => void;
};

const COPY = {
  accountLabel: "\u6253\u5f00\u8d26\u6237\u754c\u9762",
  body: "\u770b\u7740\u8fd9\u53e5\u4e2d\u6587\uff0c\u7528\u82f1\u8bed\u8bf4\u51fa\u6765",
  emptyNative: "\u8fd9\u91cc\u4f1a\u663e\u793a\u4f60\u786e\u8ba4\u597d\u7684\u4e2d\u6587",
  menuLabel: "\u56de\u5230\u4e3b\u83dc\u5355",
  pageLabel: "\u81ea\u7531\u5b66\u4e60\u82f1\u6587\u5f55\u97f3",
  readyStatus: "\u51c6\u5907\u542c\u4f60\u8bf4\u82f1\u6587",
  recordingStatus: "\u6b63\u5728\u5f55\u97f3\uff0c\u8bf4\u5b8c\u540e\u8fdb\u5165\u4e0b\u4e00\u9875",
  titlePrefix: "\u6b63\u5728\u542c\u4f60\u8bf4",
  titleSuffix: "\u82f1\u6587",
} as const;

const tips = [
  {
    description: "\u8bf4\u5f97\u8d8a\u591a\uff0c\u8fdb\u6b65\u8d8a\u5feb",
    icon: "mic",
    title: "\u5927\u80c6\u5f00\u53e3",
  },
  {
    description: "AI \u4f1a\u8010\u5fc3\u5e2e\u4f60\u4f18\u5316",
    icon: "chat",
    title: "\u53ef\u4ee5\u4e0d\u5b8c\u7f8e",
  },
  {
    description: "\u50cf\u6bcd\u8bed\u8005\u4e00\u6837\u81ea\u7136",
    icon: "sparkles",
    title: "\u7ec3\u4e60\u5730\u9053\u8868\u8fbe",
  },
] as const;

function getChineseCharacterCount(value: string) {
  return Array.from(value.replace(/\s/g, "")).length;
}

function getLineHeight(fontSizeRem: number) {
  if (fontSizeRem >= 1.72) return 1.18;
  if (fontSizeRem >= 1.5) return 1.22;
  if (fontSizeRem >= 1.25) return 1.28;
  return 1.36;
}

function getFontFitBounds(characterCount: number) {
  if (characterCount <= 18) return { min: 1.08, max: 1.56 };
  if (characterCount <= 30) return { min: 1, max: 1.38 };
  if (characterCount <= 48) return { min: 0.92, max: 1.22 };
  if (characterCount <= 70) return { min: 0.82, max: 1.08 };
  return { min: 0.74, max: 0.96 };
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
      <circle cx="16.8" cy="20" fill="white" opacity="0.85" r="1.6" />
      <circle cx="22" cy="20" fill="white" opacity="0.85" r="1.6" />
      <circle cx="27.2" cy="20" fill="white" opacity="0.85" r="1.6" />
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

export default function FreeStudyPageFour({
  isRecordingEnglish,
  nativeSpeech,
  menuLabel = COPY.menuLabel,
  accountLabel = COPY.accountLabel,
  avatarSrc = "",
  avatarAlt = "user",
  onMenuClick,
  onAccountClick,
  onAvatarError,
}: FreeStudyPageFourProps) {
  const displayNativeSpeech = nativeSpeech.trim() || COPY.emptyNative;
  const chineseCharacterCount = getChineseCharacterCount(displayNativeSpeech);
  const nativeTextFontSize = getFontFitBounds(chineseCharacterCount).max;
  const nativeTextStyle = {
    "--sf-page-four-font-size": `${nativeTextFontSize.toFixed(3)}rem`,
    "--sf-page-four-line-height": String(getLineHeight(nativeTextFontSize)),
  } as CSSProperties;

  return (
    <section className="sf-free-study-page-four" aria-label={COPY.pageLabel}>
      <div className="sf-free-study-page-four-frame">
        <header className="sf-free-study-page-four-header">
          <button
            type="button"
            aria-label={menuLabel}
            onClick={onMenuClick}
            className="sf-free-study-page-four-menu"
          >
            <MenuGlyph />
          </button>

          <div
            className="sf-free-study-page-four-brand"
            aria-label="SpeakFlow AI Voice Practice"
          >
            <span className="sf-free-study-page-four-logo" aria-hidden="true">
              <WaveGlyph />
            </span>
            <span className="sf-free-study-page-four-brand-copy">
              <span className="sf-free-study-page-four-brand-title">SpeakFlow</span>
              <span className="sf-free-study-page-four-brand-subtitle">
                AI VOICE PRACTICE
              </span>
            </span>
          </div>

          <button
            type="button"
            aria-label={accountLabel}
            onClick={onAccountClick}
            className="sf-free-study-page-four-avatar-button"
            title={avatarAlt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc || "/default-avatar.png"}
              alt=""
              className="sf-free-study-page-four-avatar-image"
              onError={onAvatarError}
              draggable={false}
            />
          </button>
        </header>

        <main className="sf-free-study-page-four-content">
          <div className="sf-free-study-page-four-wave" aria-hidden="true">
            <WaveGlyph />
          </div>

          <section className="sf-free-study-page-four-chinese" aria-label={COPY.body}>
            <p
              lang="zh-CN"
              className="sf-free-study-page-four-chinese-text"
              style={nativeTextStyle}
            >
              {displayNativeSpeech}
            </p>
          </section>

          <section className="sf-free-study-page-four-listening" aria-live="polite">
            <h1>
              {COPY.titlePrefix}
              <span>{COPY.titleSuffix}</span>...
            </h1>
            <p>{COPY.body}</p>
          </section>

          <ul className="sf-free-study-page-four-tips" aria-label={COPY.recordingStatus}>
            {tips.map((tip) => (
              <li key={tip.title}>
                <span className="sf-free-study-page-four-tip-icon">
                  <TipIcon name={tip.icon} />
                </span>
                <strong>{tip.title}</strong>
                <span>{tip.description}</span>
              </li>
            ))}
          </ul>

        </main>

        <footer
          className="sf-free-study-page-four-record-bar"
          aria-live="polite"
        >
          <div
            aria-hidden="true"
            className={`sf-free-study-page-four-mic ${
              isRecordingEnglish ? "is-recording" : ""
            }`}
          >
            <span className="sf-free-study-page-four-mic-ring" />
            <span className="sf-free-study-page-four-mic-core">
              <MicGlyph />
            </span>
          </div>

          <p className="sf-free-study-page-four-bottom-status">
            <span className="sf-free-study-page-four-lock">
              <LockGlyph />
            </span>
            {isRecordingEnglish ? COPY.recordingStatus : COPY.readyStatus}
          </p>
        </footer>
      </div>
    </section>
  );
}
