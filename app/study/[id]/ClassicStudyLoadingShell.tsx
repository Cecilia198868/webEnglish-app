import styles from "./ClassicStudyPage.module.css";

const text = {
  brandTitle: "SpeakFlow",
  brandSubtitle: "VOICE PRACTICE",
  topicLabel: "\u5f53\u524d\u8bfe\u7a0b",
  topicTitle: "\u7ecf\u5178\u573a\u666f\u53e3\u8bed\u7ec3\u4e60",
  topicProgress: "\u8bfe\u7a0b\u6b63\u5728\u51c6\u5907\u4e2d",
  status: "\u6b63\u5728\u8fdb\u5165",
  title: "\u6b63\u5728\u6253\u5f00\u573a\u666f\u8bfe\u7a0b",
  detail:
    "\u6b63\u5728\u51c6\u5907\u771f\u5b9e\u5bf9\u8bdd\u3001\u8ddf\u8bfb\u7ec3\u4e60\u548c\u8868\u8fbe\u5361\u7247\u3002",
  prompt: "\u8bf7\u7a0d\u7b49\uff0c\u5b66\u4e60\u754c\u9762\u9a6c\u4e0a\u5c31\u597d\u3002",
  recording: "\u5f55\u97f3\u7ec3\u4e60\u51c6\u5907\u4e2d",
  hint: "\u6b63\u5728\u4e3a\u4f60\u8fde\u63a5\u5230\u7b2c\u4e00\u9875\u7ec3\u4e60",
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 11 8-7 8 7" />
      <path d="M6.5 10.5V20h15V10.5" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <rect x="3.5" y="4" width="21" height="17" rx="8" />
      <path d="M9 25c1.8-1.1 2.8-2.5 3-4" />
      <path d="M9 12.5h.1M14 12.5h.1M19 12.5h.1" />
    </svg>
  );
}

function TopicIcon() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <path d="M15 29c-4.4 0-8-3.6-8-8s3.6-8 8-8h21c5 0 9 4 9 9s-4 9-9 9H24l-9 8v-10Z" />
      <path d="M16 21h.1M25 21h.1M34 21h.1" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <rect x="10" y="4" width="8" height="13" rx="4" />
      <path d="M6 15c0 4.4 3.6 7 8 7s8-2.6 8-7M14 22v3M10 25h8" />
    </svg>
  );
}

export default function ClassicStudyLoadingShell() {
  return (
    <main className={styles.classicShell}>
      <section
        className={styles.classicPhone}
        aria-busy="true"
        aria-live="polite"
      >
        <header className={styles.classicTopbar}>
          <span className={styles.menuButton} aria-hidden="true">
            <HomeIcon />
          </span>

          <div className={styles.brand} aria-label="SpeakFlow Voice Practice">
            <span className={styles.brandIcon}>
              <BrandIcon />
            </span>
            <span className={styles.brandCopy}>
              <span className={styles.brandTitle}>{text.brandTitle}</span>
              <span className={styles.brandSubtitle}>{text.brandSubtitle}</span>
            </span>
          </div>

          <span className={styles.avatarButton} aria-hidden="true" />
        </header>

        <section className={styles.topicBar} aria-label={text.topicLabel}>
          <span className={styles.topicArrow} aria-hidden="true" />
          <span className={styles.topicIcon}>
            <TopicIcon />
          </span>
          <div className={styles.topicCopy}>
            <h1 className={styles.topicTitle}>{text.topicTitle}</h1>
            <p className={styles.topicProgress}>{text.topicProgress}</p>
          </div>
          <span className={styles.topicArrow} aria-hidden="true" />
        </section>

        <div className={styles.classicLoadingMain}>
          <section className={styles.classicLoadingCard}>
            <span className={styles.classicLoadingPill}>{text.status}</span>
            <h2 className={styles.classicLoadingTitle}>{text.title}</h2>
            <p className={styles.classicLoadingText}>{text.detail}</p>
            <div className={styles.classicLoadingLines} aria-hidden="true">
              <span />
              <span className={styles.classicLoadingLineShort} />
              <span />
            </div>
          </section>

          <section className={styles.classicLoadingPrompt}>
            <span className={styles.classicLoadingQuote} aria-hidden="true">
              &ldquo;
            </span>
            <p>{text.prompt}</p>
            <span className={styles.classicLoadingQuote} aria-hidden="true">
              &rdquo;
            </span>
          </section>

          <section className={styles.classicLoadingCard}>
            <div className={styles.classicLoadingMicRow}>
              <span className={styles.classicLoadingMic}>
                <MicIcon />
              </span>
              <div>
                <h2 className={styles.classicLoadingTitle}>{text.recording}</h2>
                <p className={styles.classicLoadingText}>{text.hint}</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
