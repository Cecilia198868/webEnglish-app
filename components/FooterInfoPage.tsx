import Image from "next/image";
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
  visual: {
    alt: string;
    src: string;
  };
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function FooterInfoPage({ data }: { data: FooterInfoPageData }) {
  return (
    <main className={styles.page} data-tone={data.tone ?? "violet"}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="返回 SpeakFlow 首页">
          <Image
            alt=""
            className={styles.brandIcon}
            height={48}
            priority
            src="/brand/speakflow-app-icon.png"
            width={48}
          />
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
        <div className={styles.heroVisual}>
          <div className={styles.visualFrame}>
            <Image
              alt={data.visual.alt}
              className={styles.visualImage}
              fill
              priority
              sizes="(max-width: 900px) 90vw, 520px"
              src={data.visual.src}
            />
          </div>
          <div className={styles.summaryPanel}>
            <h2>{data.summary.title}</h2>
            <ul>
              {data.summary.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
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
