import Link from "next/link";
import styles from "./FooterInfoPage.module.css";

type InfoTone = "violet" | "blue" | "green" | "amber";

export type InfoSection = {
  eyebrow?: string;
  title: string;
  text?: string;
  items?: Array<{
    title: string;
    text: string;
  }>;
};

export type FooterInfoPageData = {
  badges: string[];
  eyebrow: string;
  lead: string;
  sections: InfoSection[];
  summary: {
    items: string[];
    title: string;
  };
  title: string;
  tone?: InfoTone;
  updated?: string;
};

function BrandMark() {
  return (
    <span className={styles.brandIcon} aria-hidden="true">
      <svg viewBox="0 0 48 48" focusable="false">
        <path d="M24 6c9.9 0 18 7 18 15.8 0 5.5-3.2 10.4-8.1 13.2l.8 6.2-6.5-3.2c-1.4.3-2.8.5-4.2.5-9.9 0-18-7-18-15.8S14.1 6 24 6Z" />
        <path d="M17 22v5M22 17v15M27 20v9M32 23v3" />
      </svg>
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function InfoVisual({ data }: { data: FooterInfoPageData }) {
  return (
    <aside className={styles.visualCard} aria-label={`${data.title}概要`}>
      <div className={styles.visualHeader}>
        <span className={styles.visualIcon} aria-hidden="true">
          <svg viewBox="0 0 32 32" focusable="false">
            <path d="M16 4 19.4 12.6 28 16l-8.6 3.4L16 28l-3.4-8.6L4 16l8.6-3.4L16 4Z" />
          </svg>
        </span>
        <div>
          <p>{data.eyebrow}</p>
          <h2>{data.summary.title}</h2>
        </div>
      </div>
      <ul>
        {data.summary.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}

export default function FooterInfoPage({ data }: { data: FooterInfoPageData }) {
  return (
    <main className={styles.page} data-tone={data.tone ?? "violet"}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="返回 SpeakFlow 首页">
          <BrandMark />
          <span>SpeakFlow</span>
        </Link>
        <nav className={styles.topnav} aria-label="页脚信息页导航">
          <Link href="/help">帮助中心</Link>
          <Link href="/contact">联系我们</Link>
          <Link href="/about">关于我们</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{data.eyebrow}</p>
          <h1>{data.title}</h1>
          <p>{data.lead}</p>
          {data.updated ? <span className={styles.updated}>{data.updated}</span> : null}
          <div className={styles.badges} aria-label="页面要点">
            {data.badges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
        <InfoVisual data={data} />
      </section>

      <section className={styles.content} aria-label={`${data.title}内容`}>
        {data.sections.map((section) => (
          <article className={styles.section} key={section.title}>
            {section.eyebrow ? <p className={styles.sectionEyebrow}>{section.eyebrow}</p> : null}
            <h2>{section.title}</h2>
            {section.text ? <p>{section.text}</p> : null}
            {section.items ? (
              <div className={styles.itemGrid}>
                {section.items.map((item) => (
                  <div className={styles.item} key={item.title}>
                    <span aria-hidden="true">
                      <ArrowIcon />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
