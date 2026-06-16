import Image from "next/image";
import Link from "next/link";
import styles from "./WebHomePageClient.module.css";

type IconName =
  | "app"
  | "arrow"
  | "bell"
  | "book"
  | "bot"
  | "chevronDown"
  | "course"
  | "download"
  | "globe"
  | "headphones"
  | "home"
  | "library"
  | "message"
  | "mic"
  | "play"
  | "plus"
  | "spark"
  | "star"
  | "store"
  | "target";

type FeatureMockup =
  | "free"
  | "ai"
  | "scene"
  | "patterns"
  | "native"
  | "library";

type Feature = {
  number: string;
  title: string;
  subtitle: string;
  copy: string;
  cta: string;
  href: string;
  icon: IconName;
  toneClass: string;
  mockup: FeatureMockup;
  bullets: string[];
  metrics?: { value: string; label: string }[];
  visualFirst?: boolean;
};

const learningLinks = [
  { href: "/free-study", label: "自由学习" },
  { href: "/ai-guided-expression", label: "AI 引导表达" },
  { href: "/classic-scenes", label: "经典场景口语练习" },
  { href: "/sentence-patterns", label: "100 个口语句型" },
  { href: "/native-flow", label: "地道语感训练" },
  { href: "/new-expressions", label: "新表达" },
];

const features: Feature[] = [
  {
    number: "1",
    title: "自由学习",
    subtitle: "想到什么就说什么",
    copy: "你不需要背单词，也不需要先学语法。只要把脑子里的想法说出来，SpeakFlow 会帮你优化表达。",
    cta: "立即开始",
    href: "/free-study",
    icon: "mic",
    toneClass: "toneViolet",
    mockup: "free",
    visualFirst: true,
    bullets: ["不受教材限制，随时开口说", "AI 分析你的表达问题", "把生硬句子变成自然说法"],
  },
  {
    number: "2",
    title: "AI 引导表达",
    subtitle: "不知道说什么？",
    copy: "AI 会主动给你话题、追问和提示，一步一步帮你把想法说完整。",
    cta: "体验 AI 引导",
    href: "/ai-guided-expression",
    icon: "bot",
    toneClass: "toneBlue",
    mockup: "ai",
    bullets: ["AI 主动抛出场景问题", "根据你的回答继续追问", "把表达升级成更地道的版本"],
  },
  {
    number: "3",
    title: "经典场景口语练习",
    subtitle: "真实生活场景，开口就能用",
    copy: "覆盖银行、购物、餐厅、住房、交通等 100+ 高频场景，让你练的每一句都贴近日常。",
    cta: "开始场景练习",
    href: "/classic-scenes",
    icon: "store",
    toneClass: "toneOrange",
    mockup: "scene",
    bullets: ["按场景整理高频表达", "中英双语提示更好理解", "适合移民、旅行和生活沟通"],
  },
  {
    number: "4",
    title: "100 个口语句型",
    subtitle: "600 个高频句型，覆盖日常表达",
    copy: "从核心句型、系统学习口语句法。用可替换的结构反复造句，表达会越来越顺。",
    cta: "开始学句型",
    href: "/sentence-patterns",
    icon: "message",
    toneClass: "toneViolet",
    mockup: "patterns",
    bullets: ["基础到进阶分层训练", "每个句型都有跟读和替换练习", "让开口不再只靠临场翻译"],
    metrics: [
      { value: "200+", label: "基础句型" },
      { value: "200+", label: "进阶句型" },
      { value: "200+", label: "高级句型" },
    ],
  },
  {
    number: "5",
    title: "地道语感训练",
    subtitle: "1800 句精选例句，培养地道语感",
    copy: "通过大量自然英文输入，熟悉英语节奏、搭配和表达方式，让英语听起来更像真实交流。",
    cta: "开始语感训练",
    href: "/native-flow",
    icon: "headphones",
    toneClass: "toneCyan",
    mockup: "native",
    bullets: ["每日语感 Everyday Flow", "自然表达 Natural Flow", "地道语法 Native Flow"],
  },
  {
    number: "6",
    title: "新表达",
    subtitle: "自动收藏，建立自己的表达库",
    copy: "学习中遇到的好表达会自动整理进表达库。随时复习、跟读、迁移到自己的真实语境。",
    cta: "查看表达库",
    href: "/new-expressions",
    icon: "star",
    toneClass: "toneViolet",
    mockup: "library",
    bullets: ["自动记录新表达", "按主题和场景归类", "复习时直接进入跟读训练"],
  },
];

const heroAvatars = ["J", "M", "A", "R", "L"];

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    "aria-hidden": true,
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.4,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "app":
      return (
        <svg {...common}>
          <rect height="15" rx="4" width="15" x="4.5" y="4.5" />
          <path d="M9 9h6M9 13h4" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 0-3 3V4Z" />
          <path d="M5 18h12" />
        </svg>
      );
    case "bot":
      return (
        <svg {...common}>
          <rect height="12" rx="4" width="16" x="4" y="8" />
          <path d="M12 4v4M8.5 13h.01M15.5 13h.01M9 17h6" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "course":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M7 18h10" />
          <rect height="16" rx="3" width="18" x="3" y="4" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v11M7 10l5 5 5-5M5 21h14" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "headphones":
      return (
        <svg {...common}>
          <path d="M4 14a8 8 0 0 1 16 0" />
          <rect height="6" rx="2" width="4" x="3" y="13" />
          <rect height="6" rx="2" width="4" x="17" y="13" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m4 11 8-7 8 7" />
          <path d="M6 10v10h12V10" />
        </svg>
      );
    case "library":
      return (
        <svg {...common}>
          <path d="M5 5h5v14H5zM10 7h5v12h-5zM15 4h4v15h-4z" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M21 12a7 7 0 0 1-7 7H8l-5 3 2-5a7 7 0 1 1 16-5Z" />
          <path d="M8 11h8M8 15h5" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect height="10" rx="4" width="6" x="9" y="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m9 7 8 5-8 5V7Z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3 9.8 9.8 3 12l6.8 2.2L12 21l2.2-6.8L21 12l-6.8-2.2L12 3Z" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
        </svg>
      );
    case "store":
      return (
        <svg {...common}>
          <path d="M4 10h16l-1-5H5l-1 5ZM6 10v10h12V10" />
          <path d="M9 20v-5h6v5M8 10v2M12 10v2M16 10v2" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
  }
}

function qrCellIsDark(index: number) {
  const size = 17;
  const x = index % size;
  const y = Math.floor(index / size);
  const inTopLeft = x < 5 && y < 5;
  const inTopRight = x > 11 && y < 5;
  const inBottomLeft = x < 5 && y > 11;
  const finder = inTopLeft || inTopRight || inBottomLeft;

  if (finder) {
    const localX = inTopRight ? x - 12 : x;
    const localY = inBottomLeft ? y - 12 : y;
    return (
      localX === 0 ||
      localX === 4 ||
      localY === 0 ||
      localY === 4 ||
      (localX === 2 && localY === 2)
    );
  }

  return (x * 7 + y * 11 + x * y) % 5 < 2;
}

function AppStoreBadge({ store }: { store: "apple" | "google" }) {
  return (
    <span className={styles.storeBadge}>
      <span className={styles.storeIcon}>{store === "apple" ? "A" : "G"}</span>
      <span>
        <small>{store === "apple" ? "Download on the" : "GET IT ON"}</small>
        <strong>{store === "apple" ? "App Store" : "Google Play"}</strong>
      </span>
    </span>
  );
}

function QrCode({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-label="扫码下载 SpeakFlow"
      className={`${styles.qrCode} ${compact ? styles.qrCodeCompact : ""}`}
      role="img"
    >
      {Array.from({ length: 17 * 17 }, (_, index) => (
        <span
          className={qrCellIsDark(index) ? styles.qrDark : undefined}
          key={index}
        />
      ))}
      <span className={styles.qrLogo}>S</span>
    </div>
  );
}

function PhoneFrame({
  children,
  title,
  tone = "violet",
}: {
  children: React.ReactNode;
  title: string;
  tone?: "violet" | "blue" | "orange" | "green";
}) {
  return (
    <div className={`${styles.phoneFrame} ${styles[`phoneTone${tone}`]}`}>
      <div className={styles.phoneStatus}>
        <span>9:41</span>
        <span className={styles.phoneSignal}>•••</span>
      </div>
      <div className={styles.phoneHeader}>
        <span>{title}</span>
        <span className={styles.phoneHeaderPill}>AI</span>
      </div>
      <div className={styles.phoneScreen}>{children}</div>
      <div className={styles.phoneNav}>
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className={styles.heroIllustration} aria-hidden="true">
      <div className={`${styles.speechBubble} ${styles.speechBubbleOne}`}>
        I need a coffee.
      </div>
      <div className={`${styles.speechBubble} ${styles.speechBubbleTwo}`}>
        I feel so tired today.
      </div>
      <div className={`${styles.speechBubble} ${styles.speechBubbleThree}`}>
        Could you help me?
      </div>
      <div className={styles.heroLaptop}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.heroPerson}>
        <span className={styles.personHair} />
        <span className={styles.personFace} />
        <span className={styles.personBody} />
        <span className={styles.personArm} />
      </div>
    </div>
  );
}

function FreeMockup() {
  return (
    <div className={styles.mockupScene}>
      <div className={styles.decorMic} aria-hidden="true">
        <Icon name="mic" />
      </div>
      <PhoneFrame title="自由学习">
        <div className={styles.practiceCard}>
          <small>Today is Monday</small>
          <strong>I want to talk about my plan.</strong>
          <div className={styles.progressLine}>
            <span style={{ width: "72%" }} />
          </div>
        </div>
        {["Today is Wednesday.", "I feel relaxed.", "Could you repeat that?"].map(
          (item) => (
            <div className={styles.practiceRow} key={item}>
              <span />
              <p>{item}</p>
              <b>98%</b>
            </div>
          )
        )}
        <button className={styles.mockButton} type="button">
          <Icon name="mic" />
          开始练习
        </button>
      </PhoneFrame>
      <div className={styles.coffeeCup} aria-hidden="true" />
    </div>
  );
}

function AiMockup() {
  return (
    <div className={styles.aiMockup}>
      <div className={styles.robotCard} aria-hidden="true">
        <Image
          alt=""
          height={330}
          src="/images/starter-robot-standard.png"
          width={328}
        />
      </div>
      <PhoneFrame title="AI 引导表达" tone="blue">
        <div className={styles.chatPrompt}>
          <span>Topic</span>
          <strong>Today is Wednesday. I go out to Robin and it&apos;s very happy.</strong>
        </div>
        <div className={styles.chatBubbleAi}>
          你想说的是“我和 Robin 出去玩，很开心”吗？
        </div>
        <div className={styles.chatBubbleUser}>Yes, I went to the park.</div>
        <div className={styles.chatSuggestion}>
          <Icon name="spark" />
          <p>Try: I hung out with Robin today and had a great time.</p>
        </div>
      </PhoneFrame>
    </div>
  );
}

function SceneMockup() {
  const chips = ["银行", "餐厅", "住房", "交通"];
  return (
    <div className={styles.sceneMockup}>
      <div className={styles.sceneChips}>
        {chips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>
      <div className={styles.shoppingBasket} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <PhoneFrame title="银行与金融" tone="orange">
        <div className={styles.dialogCard}>
          <b>What kind of account do you offer?</b>
          <span>你们提供哪种账户？</span>
        </div>
        <div className={styles.dialogCard}>
          <b>What types of accounts do you offer?</b>
          <span>更自然</span>
        </div>
        <div className={styles.dialogCard}>
          <b>What accounts do you offer?</b>
          <span>更简洁</span>
        </div>
      </PhoneFrame>
    </div>
  );
}

function PatternsMockup() {
  return (
    <div className={styles.patternMockup}>
      <div className={styles.patternStats}>
        {["200+", "200+", "200+"].map((value, index) => (
          <div key={`${value}-${index}`}>
            <strong>{value}</strong>
            <span>{["基础句型", "进阶句型", "高级句型"][index]}</span>
          </div>
        ))}
      </div>
      <PhoneFrame title="What I want/need is" tone="blue">
        <div className={styles.patternPrompt}>
          What I need is a cup of coffee.
        </div>
        {[
          "What I want is more time.",
          "What I need is a better plan.",
          "What I'm trying to find is...",
        ].map((line) => (
          <div className={styles.patternLine} key={line}>
            <Icon name="play" />
            <span>{line}</span>
          </div>
        ))}
      </PhoneFrame>
    </div>
  );
}

function NativeMockup() {
  return (
    <div className={styles.nativeMockup}>
      <div className={styles.headphoneDecor} aria-hidden="true">
        <Icon name="headphones" />
      </div>
      <div className={styles.flowCards}>
        <span>Everyday Flow</span>
        <span>Natural Flow</span>
        <span>Native Flow</span>
      </div>
      <PhoneFrame title="地道语感训练" tone="green">
        <div className={styles.audioLesson}>
          <strong>When things get tough, keep reminding yourself why you started.</strong>
          <p>听原声，跟读，理解真实语境。</p>
        </div>
        <div className={styles.audioControls}>
          <button type="button">
            <Icon name="play" />
          </button>
          <span />
          <span />
        </div>
      </PhoneFrame>
    </div>
  );
}

function LibraryMockup() {
  return (
    <div className={styles.libraryMockup}>
      <div className={styles.expressionFolder} aria-hidden="true">
        <Icon name="star" />
      </div>
      <PhoneFrame title="新表达">
        <div className={styles.libraryGroup}>
          <strong>重要表达</strong>
          <p>That&apos;s exactly what I mean.</p>
        </div>
        <div className={styles.libraryGroup}>
          <strong>自然说法</strong>
          <p>I totally agree with you.</p>
        </div>
        <div className={styles.libraryGroupGreen}>
          <strong>待复习</strong>
          <p>Let&apos;s figure it out together.</p>
        </div>
      </PhoneFrame>
    </div>
  );
}

function FeatureVisual({ mockup }: { mockup: FeatureMockup }) {
  switch (mockup) {
    case "free":
      return <FreeMockup />;
    case "ai":
      return <AiMockup />;
    case "scene":
      return <SceneMockup />;
    case "patterns":
      return <PatternsMockup />;
    case "native":
      return <NativeMockup />;
    case "library":
      return <LibraryMockup />;
  }
}

function FeatureSection({ feature }: { feature: Feature }) {
  return (
    <section
      className={[
        styles.featureSection,
        styles[feature.toneClass],
        feature.visualFirst ? styles.visualFirst : "",
      ].join(" ")}
    >
      <div className={styles.featureCopy}>
        <div className={styles.featureKicker}>
          <span className={styles.featureIcon}>
            <Icon name={feature.icon} />
          </span>
          <span className={styles.featureNumber}>{feature.number}</span>
          <h2>{feature.title}</h2>
        </div>
        <p className={styles.featureSubtitle}>{feature.subtitle}</p>
        <p className={styles.featureText}>{feature.copy}</p>
        {feature.metrics ? (
          <div className={styles.metricRow}>
            {feature.metrics.map((metric) => (
              <div key={`${feature.title}-${metric.label}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        ) : null}
        <ul className={styles.featureBullets}>
          {feature.bullets.map((bullet) => (
            <li key={bullet}>
              <Icon name="spark" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <Link className={styles.featureButton} href={feature.href}>
          {feature.cta}
          <Icon name="arrow" />
        </Link>
      </div>
      <div className={styles.featureVisual}>
        <FeatureVisual mockup={feature.mockup} />
      </div>
    </section>
  );
}

function CreateCourseSection() {
  return (
    <section className={`${styles.featureSection} ${styles.toneViolet}`}>
      <div className={styles.featureCopy}>
        <div className={styles.featureKicker}>
          <span className={styles.featureIcon}>
            <Icon name="plus" />
          </span>
          <span className={styles.featureNumber}>7</span>
          <h2>创建课程</h2>
        </div>
        <p className={styles.featureSubtitle}>AI 助力，快速生成专属课程</p>
        <p className={styles.featureText}>
          上传学习材料、粘贴文本或输入目标，AI 会帮你拆解成可练习的口语课程。
        </p>
        <ul className={styles.featureBullets}>
          <li>
            <Icon name="spark" />
            <span>上传学习资料，自动提炼表达</span>
          </li>
          <li>
            <Icon name="spark" />
            <span>AI 生成课程结构、例句和练习</span>
          </li>
          <li>
            <Icon name="spark" />
            <span>按你的目标持续迭代内容</span>
          </li>
        </ul>
        <Link className={styles.featureButton} href="/create-course">
          开始创建课程
          <Icon name="arrow" />
        </Link>
      </div>
      <div className={styles.featureVisual}>
        <div className={styles.courseMockup}>
          <div className={styles.courseToolbar}>
            <span />
            <span />
            <span />
            <button type="button">Aa</button>
          </div>
          <div className={styles.courseGrid}>
            <div className={styles.coursePanelWide}>
              <strong>创建你的专属英语课</strong>
              <p>把面试、旅行、工作汇报变成可练习课程。</p>
              <span />
            </div>
            <div>
              <b>学习目标</b>
              <p>Job interview</p>
            </div>
            <div>
              <b>AI 生成</b>
              <p>12 个练习任务</p>
            </div>
            <div>
              <b>表达卡片</b>
              <p>48 条常用表达</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePageClient() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link aria-label="SpeakFlow 首页" className={styles.logo} href="/">
            <Image
              alt=""
              height={64}
              priority
              src="/brand/speakflow-app-icon.png"
              width={64}
            />
            <span>SpeakFlow</span>
          </Link>
          <nav aria-label="主导航" className={styles.nav}>
            <Link href="/">首页</Link>
            <div className={styles.navDropdown}>
              <button type="button">
                开始学习
                <Icon name="chevronDown" />
              </button>
              <div className={styles.dropdownMenu}>
                {learningLinks.map((item) => (
                  <Link href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/new-expressions">我的表达</Link>
            <Link href="/create-course">创建课程</Link>
            <Link href="/menu?panel=about">关于我们</Link>
            <Link href="/menu?panel=help">联系我们</Link>
          </nav>
          <div className={styles.headerActions}>
            <Link className={styles.upgradeLink} href="/account">
              <Icon name="spark" />
              会员版
            </Link>
            <Link aria-label="通知" className={styles.iconButton} href="/notifications">
              <Icon name="bell" />
            </Link>
            <Link className={styles.languageLink} href="/languages">
              <Icon name="globe" />
              English learner
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.heroWrap}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>SpeakFlow</p>
            <h1>
              开口，
              <span>本身就是学习</span>
            </h1>
            <p className={styles.heroText}>
              不要死学语法，AI 陪你一开口就表达。从第一天开始就能说。
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/free-study">
                <Icon name="mic" />
                开始免费学习
              </Link>
              <Link className={styles.secondaryButton} href="/menu?panel=about">
                了解 SpeakFlow
              </Link>
            </div>
            <div className={styles.heroProof}>
              <div className={styles.avatarStack}>
                {heroAvatars.map((avatar) => (
                  <span key={avatar}>{avatar}</span>
                ))}
              </div>
              <div>
                <strong>4.9</strong>
                <span>来自 50,000+ 用户的学习反馈</span>
              </div>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </section>

      <section className={styles.downloadSection}>
        <div className={styles.downloadCard}>
          <p>扫码下载 SpeakFlow</p>
          <QrCode />
          <div className={styles.downloadBadges}>
            <AppStoreBadge store="apple" />
            <AppStoreBadge store="google" />
          </div>
        </div>
        <div className={styles.sectionTitle}>
          <Icon name="spark" />
          <h2>六大学习方式</h2>
          <Icon name="spark" />
        </div>
        <p className={styles.sectionSubtitle}>
          全方位提升你的英语表达能力
        </p>
      </section>

      <div className={styles.contentStack}>
        {features.map((feature) => (
          <FeatureSection feature={feature} key={feature.title} />
        ))}
        <CreateCourseSection />
      </div>

      <section className={styles.bottomBanner}>
        <div>
          <p>随时随地，想说就说</p>
          <h2>下载 SpeakFlow App，把你的英语表达带在身边</h2>
          <div className={styles.bannerBadges}>
            <AppStoreBadge store="apple" />
            <AppStoreBadge store="google" />
          </div>
        </div>
        <QrCode compact />
        <div className={styles.bannerPhone} aria-hidden="true">
          <span>SpeakFlow</span>
          <strong>今日练习</strong>
          <p>I can say it naturally.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Link className={styles.logo} href="/">
            <Image
              alt=""
              height={64}
              src="/brand/speakflow-app-icon.png"
              width={64}
            />
            <span>SpeakFlow</span>
          </Link>
          <p>AI 口语陪练应用</p>
          <small>© 2024 SpeakFlow. All rights reserved.</small>
        </div>
        <div className={styles.footerLinks}>
          <div>
            <h3>支持</h3>
            <Link href="/menu?panel=help">帮助中心</Link>
            <Link href="/menu?panel=help">联系我们</Link>
            <Link href="/privacy">隐私政策</Link>
            <Link href="/terms">服务条款</Link>
          </div>
          <div>
            <h3>关于</h3>
            <Link href="/menu?panel=about">关于我们</Link>
            <Link href="/create-course">创建课程</Link>
          </div>
        </div>
        <div className={styles.socialLinks} aria-label="社交链接">
          <a aria-label="Apple" href="#">
            <span></span>
          </a>
          <a aria-label="Facebook" href="#">
            <span>f</span>
          </a>
          <a aria-label="Instagram" href="#">
            <span>◎</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
