import styles from "@/components/SentencePatternPages.module.css";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 11 8-7 8 7" />
      <path d="M6.5 10.5V20h15V10.5" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12c5.5 0 9-3.5 9-9 4 2.5 5.5 6.5 3.5 10.5C14.5 17.5 10 19 4 12Z" />
      <path d="M12 14c.5 2.2.3 4.4-1 6" />
    </svg>
  );
}

function BrandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="22" height="22" rx="7" />
      <path d="M8 14h2.5M12.5 9v10M16 11v8M19.5 14H22" />
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

export default function Loading() {
  return (
    <main className={styles.studyPage}>
      <section className={styles.studyPhone} aria-busy="true">
        <header className={styles.brandHeader}>
          <span className={styles.homeButton} aria-hidden="true">
            <HomeIcon />
          </span>
          <span className={styles.brand} aria-hidden="true">
            <BrandIcon className={styles.brandMark} />
            <span>
              <strong>SpeakFlow</strong>
              <small>VOICE PRACTICE</small>
            </span>
          </span>
          <span className={styles.switchButton}>切换课程</span>
        </header>

        <div className={styles.courseCrumb}>
          <span>
            <LeafIcon />
          </span>
          <strong>100个口语句型</strong>
          <small>句型练习准备中</small>
        </div>

        <section className={styles.studyCard}>
          <div className={styles.studyTitleRow}>
            <span className={styles.practicePill}>1 / 20</span>
            <h1>正在准备句型练习...</h1>
          </div>
          <div className={styles.progressRow}>
            <span>进度：第 1 / 20 句</span>
            <strong>5% 完成</strong>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: "5%" }} />
          </div>
          <div className={`${styles.promptCard} ${styles.loadingPromptCard}`}>
            <span className={styles.quoteLeft}>“</span>
            <p>请稍等，句型练习马上开始。</p>
            <span className={styles.quoteRight}>”</span>
            <i className={styles.roomArt} aria-hidden="true" />
          </div>
          <div className={styles.promptTip}>学习页正在加载，请保持在当前页面。</div>
        </section>

        <section className={`${styles.recordCard} ${styles.loadingRecordCard}`}>
          <p>
            <MicIcon />
            正在打开录音练习
          </p>
          <small>准备麦克风与跟读内容</small>
          <span className={styles.bigMic} aria-hidden="true">
            <MicIcon />
          </span>
        </section>
      </section>
    </main>
  );
}
