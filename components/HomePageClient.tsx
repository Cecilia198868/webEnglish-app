import Image from "next/image";
import Link from "next/link";
import HomeAccountLink from "./HomeAccountLink";
import styles from "./WebHomePageClient.module.css";

type IconName =
  | "app"
  | "arrow"
  | "arrowLeft"
  | "barChart"
  | "bell"
  | "book"
  | "bot"
  | "bank"
  | "calendar"
  | "car"
  | "cart"
  | "chevronDown"
  | "course"
  | "crown"
  | "check"
  | "download"
  | "edit"
  | "fileText"
  | "folder"
  | "globe"
  | "headphones"
  | "home"
  | "hospital"
  | "library"
  | "lightbulb"
  | "message"
  | "mic"
  | "play"
  | "plus"
  | "plane"
  | "seed"
  | "search"
  | "speaker"
  | "spark"
  | "star"
  | "store"
  | "target"
  | "upload"
  | "utensils"
  | "users"
  | "wand";

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
    title: "100个口语句型",
    subtitle: "600个高频句型，覆盖日常表达",
    copy: "从初级到高级，系统学习口语句型，帮你快速建立英语表达骨架。",
    cta: "开始学习句型",
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
    subtitle: "1800句跟读模仿训练，培养地道语感",
    copy: "通过大量跟读模仿，感受英语的节奏、语调和表达方式，让英语像音乐一样自然流出。",
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

const sceneScenarioTabs: {
  label: string;
  icon: IconName;
  tone: "orange" | "green" | "blue" | "violet";
}[] = [
  { label: "超市", icon: "cart", tone: "orange" },
  { label: "银行", icon: "bank", tone: "green" },
  { label: "医院", icon: "hospital", tone: "blue" },
  { label: "机场", icon: "plane", tone: "violet" },
];

const sceneBenefitCards: {
  title: string;
  text: string;
  icon: IconName;
  tone: "orange" | "amber" | "cyan" | "yellow";
}[] = [
  { title: "真实对话", text: "贴近生活", icon: "message", tone: "orange" },
  { title: "情景角色扮演", text: "更沉浸", icon: "users", tone: "amber" },
  { title: "即时反馈", text: "纠正优化", icon: "wand", tone: "cyan" },
  { title: "实用表达", text: "学了就能用", icon: "target", tone: "yellow" },
];

const scenePhoneLines: {
  label: string;
  text: string;
  icon: IconName;
  tone: "green" | "orange" | "blue";
  note?: string;
}[] = [
  {
    label: "推荐表达",
    text: "What types of accounts do you offer?",
    icon: "star",
    tone: "green",
    note: "最自然、最常用的表达",
  },
  {
    label: "更地道",
    text: "What types of accounts do you offer?",
    icon: "utensils",
    tone: "orange",
  },
  {
    label: "更简单",
    text: "What accounts do you offer?",
    icon: "car",
    tone: "blue",
  },
  {
    label: "更自然",
    text: "What kinds of accounts do you have?",
    icon: "hospital",
    tone: "green",
  },
];

const patternLevelCards: {
  level: string;
  value: string;
  label: string;
  note: string;
  icon: IconName;
  tone: "green" | "blue" | "violet";
}[] = [
  {
    level: "初级",
    value: "200+",
    label: "基础句型",
    note: "日常入门必备",
    icon: "seed",
    tone: "green",
  },
  {
    level: "中级",
    value: "200+",
    label: "进阶句型",
    note: "表达更自然",
    icon: "barChart",
    tone: "blue",
  },
  {
    level: "高级",
    value: "200+",
    label: "高阶句型",
    note: "地道表达升级",
    icon: "crown",
    tone: "violet",
  },
];

const patternPhoneOptions: {
  label: string;
  text: string;
  icon: IconName;
  tone: "violet" | "orange" | "blue" | "green";
  note?: string;
}[] = [
  {
    label: "推荐表达",
    text: "What types of accounts do you offer?",
    icon: "star",
    tone: "violet",
    note: "更自然、更常用的表达",
  },
  {
    label: "更地道",
    text: "What types of accounts do you offer?",
    icon: "utensils",
    tone: "orange",
  },
  {
    label: "更简单",
    text: "What accounts do you offer?",
    icon: "car",
    tone: "blue",
  },
  {
    label: "更自然",
    text: "What kinds of accounts do you have?",
    icon: "hospital",
    tone: "green",
  },
];

const nativeFlowCards: {
  level: string;
  title: string;
  subtitle: string;
  tone: "green" | "blue" | "violet";
  visual: "sprout" | "tree" | "mountain";
}[] = [
  {
    level: "初级",
    title: "日常语感",
    subtitle: "Everyday Flow",
    tone: "green",
    visual: "sprout",
  },
  {
    level: "中级",
    title: "自然表达",
    subtitle: "Natural Flow",
    tone: "blue",
    visual: "tree",
  },
  {
    level: "高级",
    title: "地道语流",
    subtitle: "Native Flow",
    tone: "violet",
    visual: "mountain",
  },
];

const nativePhoneActions: {
  label: string;
  icon: IconName;
  tone: "violet" | "blue";
}[] = [
  { label: "播放", icon: "speaker", tone: "violet" },
  { label: "慢速播放\n0.75x", icon: "headphones", tone: "blue" },
  { label: "重复", icon: "arrow", tone: "violet" },
];

const expressionFeatureItems: {
  title: string;
  text: string;
  icon: IconName;
}[] = [
  {
    title: "自动收藏",
    text: "学习和练习时，遇到的新表达自动保存",
    icon: "wand",
  },
  {
    title: "分类管理",
    text: "按场景和主题分类，查找更方便",
    icon: "folder",
  },
  {
    title: "随时复习",
    text: "反复练习，真正掌握每一个表达",
    icon: "star",
  },
  {
    title: "持续积累",
    text: "表达库越用越丰富，英语表达更地道",
    icon: "barChart",
  },
];

const expressionDiscoverPoints = [
  "精选高频表达",
  "场景化例句",
  "地道发音跟读",
  "智能标记重点表达",
];

const expressionLibraryPoints = [
  "查看全部收藏内容",
  "按场景学习中的表达",
  "复习可以跟读练习",
  "分类管理更高效",
];

const createCourseFeatureItems: {
  title: string;
  text: string;
  icon: IconName;
}[] = [
  {
    title: "上传学习材料",
    text: "支持文字、音频等多种格式",
    icon: "upload",
  },
  {
    title: "AI 生成课程",
    text: "智能分析，生成课程大纲与内容",
    icon: "fileText",
  },
  {
    title: "预览与编辑",
    text: "预览课程效果，自定义编辑优化",
    icon: "edit",
  },
  {
    title: "发布与分享",
    text: "一键发布课程，分享给更多学习者",
    icon: "plane",
  },
];

const createCourseSteps = [
  { title: "上传内容", text: "上传学习资料" },
  { title: "课程设置", text: "设置课程信息" },
  { title: "AI 生成课程", text: "生成课程内容" },
  { title: "预览与编辑", text: "预览并自定义" },
  { title: "发布课程", text: "发布分享课程" },
];

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
    case "arrowLeft":
      return (
        <svg {...common}>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      );
    case "bank":
      return (
        <svg {...common}>
          <path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16" />
          <path d="m12 4 8 4H4l8-4Z" />
        </svg>
      );
    case "barChart":
      return (
        <svg {...common}>
          <path d="M5 19V11M12 19V7M19 19V4" />
          <path d="M4 19h16" />
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
    case "calendar":
      return (
        <svg {...common}>
          <rect height="16" rx="3" width="16" x="4" y="5" />
          <path d="M8 3v4M16 3v4M4 10h16M8 14h2M13 14h3" />
        </svg>
      );
    case "car":
      return (
        <svg {...common}>
          <path d="M5 16h14l-1.4-5.2A3 3 0 0 0 14.7 8H9.3a3 3 0 0 0-2.9 2.8L5 16Z" />
          <path d="M7 16v2M17 16v2M8 13h8" />
          <circle cx="8" cy="18" r="1.5" />
          <circle cx="16" cy="18" r="1.5" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <path d="M4 5h2l2 10h9l2-7H7" />
          <circle cx="10" cy="19" r="1.5" />
          <circle cx="17" cy="19" r="1.5" />
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
    case "crown":
      return (
        <svg {...common}>
          <path d="m4 8 4 4 4-7 4 7 4-4-2 10H6L4 8Z" />
          <path d="M6 21h12" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16.5 9" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v11M7 10l5 5 5-5M5 21h14" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M4 20h4l11-11a2.6 2.6 0 0 0-4-4L4 16v4Z" />
          <path d="m13.5 6.5 4 4" />
        </svg>
      );
    case "fileText":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7z" />
          <path d="M14 3v5h5M10 12h6M10 16h5" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M4 7h6l2 2h8v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z" />
          <path d="M4 10h16" />
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
    case "hospital":
      return (
        <svg {...common}>
          <rect height="16" rx="3" width="16" x="4" y="5" />
          <path d="M12 9v8M8 13h8" />
        </svg>
      );
    case "library":
      return (
        <svg {...common}>
          <path d="M5 5h5v14H5zM10 7h5v12h-5zM15 4h4v15h-4z" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6M10 22h4" />
          <path d="M8 13a6 6 0 1 1 8 0c-1 1-1.5 2-1.5 3h-5c0-1-.5-2-1.5-3Z" />
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
    case "plane":
      return (
        <svg {...common}>
          <path d="M2.5 16.5 21 3l-5 18-4-7-7 4 3-7-5.5-4.5Z" />
        </svg>
      );
    case "seed":
      return (
        <svg {...common}>
          <path d="M12 20V10" />
          <path d="M12 13c-4 0-7-2.6-7-6 4 0 7 2.6 7 6Z" />
          <path d="M12 12c4 0 7-2.6 7-6-4 0-7 2.6-7 6Z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "speaker":
      return (
        <svg {...common}>
          <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
          <path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a8 8 0 0 1 0 10" />
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
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V5M7 10l5-5 5 5" />
          <path d="M5 19h14" />
          <path d="M6 15a4 4 0 0 1 1-7.8A5 5 0 0 1 17 8a4 4 0 0 1 1 7" />
        </svg>
      );
    case "utensils":
      return (
        <svg {...common}>
          <path d="M7 3v8M4.5 3v8M9.5 3v8M4.5 8h5M7 11v10" />
          <path d="M16 3c2 1.5 3 3.6 3 6.5S18 14 16 15v6" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M15 6.5a3 3 0 0 1 0 5.5M17 20a5 5 0 0 0-3-4.5" />
        </svg>
      );
    case "wand":
      return (
        <svg {...common}>
          <path d="m4 20 10.5-10.5M12 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM18 3l.7 1.4L20 5l-1.3.6L18 7l-.7-1.4L16 5l1.3-.6L18 3Z" />
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
      <div className={styles.heroImageShell}>
        <Image
          alt=""
          className={styles.heroImage}
          height={591}
          preload
          sizes="(max-width: 1060px) 82vw, 520px"
          src="/images/home-hero-speaking.png"
          width={620}
        />
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
        <Link className={styles.mockButton} href="/free-study">
          <Icon name="mic" />
          开始练习
        </Link>
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
        <Link className={styles.chatBubbleUser} href="/ai-guided-expression">
          Yes, I went to the park.
        </Link>
        <div className={styles.chatSuggestion}>
          <Icon name="spark" />
          <p>Try: I hung out with Robin today and had a great time.</p>
        </div>
      </PhoneFrame>
    </div>
  );
}

function ScenePhoneContent() {
  return (
    <div className={styles.scenePhoneUi}>
      <div className={styles.scenePhoneStatus}>
        <span>9:41</span>
        <span className={styles.scenePhoneSignal} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={styles.scenePhoneHeader}>
        <Icon name="arrowLeft" />
        <div className={styles.scenePhoneTitle}>
          <span>
            <Icon name="bank" />
            新开银行账户
          </span>
          <small>第 1 / 113 句</small>
        </div>
      </div>
      <div className={styles.scenePhoneProgressRow}>
        <span className={styles.scenePhoneProgress}>
          <i />
        </span>
        <b>1% 完成</b>
      </div>
      <div className={styles.scenePhoneUserLine}>
        <span className={styles.sceneAvatar} aria-hidden="true" />
        <div>
          <small>你的表达</small>
          <p>what kind of account do you offer</p>
        </div>
        <button aria-label="播放你的表达" type="button">
          <Icon name="speaker" />
        </button>
      </div>
      <div className={styles.scenePhoneOptions}>
        {scenePhoneLines.map((line) => (
          <div
            className={[
              styles.scenePhoneOption,
              styles[`scenePhoneOption${line.tone}`],
              line.note ? styles.scenePhoneOptionRecommended : "",
            ].join(" ")}
            key={line.label}
          >
            <span className={styles.scenePhoneOptionRibbon}>
              <Icon name={line.icon} />
            </span>
            <div>
              <strong>{line.label}</strong>
              <p>{line.text}</p>
              {line.note ? <small>{line.note}</small> : null}
            </div>
            <button aria-label={`播放${line.label}`} type="button">
              <Icon name="speaker" />
            </button>
          </div>
        ))}
      </div>
      <div className={styles.scenePhoneNav}>
        <button type="button">
          <Icon name="arrowLeft" />
          上一句
        </button>
        <button type="button">
          <Icon name="headphones" />
          慢速朗读
        </button>
        <button type="button">
          下一句
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}

function SceneFeatureSection({ feature }: { feature: Feature }) {
  return (
    <section
      className={[
        styles.featureSection,
        styles[feature.toneClass],
        styles.sceneFeatureSection,
      ].join(" ")}
    >
      <div className={styles.sceneDesignCopy}>
        <div className={styles.sceneDesignTitle}>
          <span className={styles.sceneDesignIcon}>
            <Icon name={feature.icon} />
          </span>
          <span className={styles.sceneDesignNumber}>{feature.number}</span>
          <h2>{feature.title}</h2>
        </div>
        <p className={styles.sceneDesignSubtitle}>{feature.subtitle}</p>
        <div className={styles.sceneScenarioTabs}>
          {sceneScenarioTabs.map((tab) => (
            <span
              className={[
                styles.sceneScenarioTab,
                styles[`sceneScenarioTab${tab.tone}`],
              ].join(" ")}
              key={tab.label}
            >
              <Icon name={tab.icon} />
              {tab.label}
            </span>
          ))}
        </div>
        <p className={styles.sceneDesignText}>
          覆盖 100+ 真实场景
          <br />
          模拟真实对话，让你在任何场合都能自信开口。
        </p>
        <div className={styles.sceneBenefitGrid}>
          {sceneBenefitCards.map((card) => (
            <div
              className={[
                styles.sceneBenefitCard,
                styles[`sceneBenefitCard${card.tone}`],
              ].join(" ")}
              key={card.title}
            >
              <span>
                <Icon name={card.icon} />
              </span>
              <strong>{card.title}</strong>
              <small>{card.text}</small>
            </div>
          ))}
        </div>
        <Link className={styles.sceneDesignButton} href={feature.href}>
          {feature.cta}
          <Icon name="arrow" />
        </Link>
      </div>
      <ScenePhoneContent />
    </section>
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

function PatternPhoneContent() {
  return (
    <div className={styles.patternPhoneShell}>
      <div className={styles.patternPhoneHeader}>
        <Icon name="arrowLeft" />
        <strong>What I want/need is + 名词/从句</strong>
        <Icon name="arrow" />
      </div>
      <div className={styles.patternPhoneMeta}>
        <span>进度：第 1 / 15 句</span>
        <b>7% 完成</b>
      </div>
      <div className={styles.patternPhoneProgress}>
        <i />
      </div>
      <div className={styles.patternExpressionCard}>
        <div className={styles.patternExpressionTop}>
          <span>
            <Icon name="mic" />
            你的表达
          </span>
          <button aria-label="播放你的表达" type="button">
            <Icon name="speaker" />
          </button>
        </div>
        <p>what kind of account do you offer</p>
        <small>点击重新收听你的录音</small>
      </div>
      <div className={styles.patternPhoneOptions}>
        {patternPhoneOptions.map((option) => (
          <div
            className={[
              styles.patternPhoneOption,
              styles[`patternPhoneOption${option.tone}`],
              option.note ? styles.patternPhoneOptionRecommended : "",
            ].join(" ")}
            key={option.label}
          >
            <span className={styles.patternPhoneOptionIcon}>
              <Icon name={option.icon} />
            </span>
            <div>
              <strong>{option.label}</strong>
              <p>{option.text}</p>
              {option.note ? <small>{option.note}</small> : null}
            </div>
            <button aria-label={`播放${option.label}`} type="button">
              <Icon name="speaker" />
            </button>
          </div>
        ))}
      </div>
      <div className={styles.patternPhoneNav}>
        <button type="button">
          <Icon name="arrowLeft" />
          上一句
        </button>
        <button type="button">
          <Icon name="headphones" />
          慢速朗读
        </button>
        <button type="button">
          下一句
          <Icon name="arrow" />
        </button>
      </div>
      <div className={styles.patternPhoneTabs} aria-hidden="true">
        <span className={styles.patternPhoneTabActive}>
          <Icon name="home" />
        </span>
        <span>
          <Icon name="barChart" />
        </span>
        <span>
          <Icon name="message" />
        </span>
        <span>
          <Icon name="users" />
        </span>
      </div>
    </div>
  );
}

function PatternFeatureSection({ feature }: { feature: Feature }) {
  return (
    <section
      className={[
        styles.featureSection,
        styles[feature.toneClass],
        styles.patternFeatureSection,
      ].join(" ")}
    >
      <span className={styles.patternDottedField} aria-hidden="true" />
      <span className={styles.patternGhostBubble} aria-hidden="true">
        <Icon name="message" />
      </span>
      <div className={styles.patternDesignCopy}>
        <div className={styles.patternDesignTitle}>
          <span className={styles.patternDesignIcon}>
            <Icon name={feature.icon} />
          </span>
          <span className={styles.patternDesignNumber}>{feature.number}</span>
          <h2>{feature.title}</h2>
        </div>
        <p className={styles.patternDesignSubtitle}>{feature.subtitle}</p>
        <p className={styles.patternDesignText}>{feature.copy}</p>
        <div className={styles.patternLevelGrid}>
          {patternLevelCards.map((card) => (
            <div
              className={[
                styles.patternLevelCard,
                styles[`patternLevelCard${card.tone}`],
              ].join(" ")}
              key={card.level}
            >
              <span>
                <Icon name={card.icon} />
                {card.level}
              </span>
              <strong>{card.value}</strong>
              <b>{card.label}</b>
              <small>{card.note}</small>
            </div>
          ))}
        </div>
        <div className={styles.patternSummaryCard}>
          <span>
            <Icon name="target" />
          </span>
          <div>
            <strong>600+ 高频句型</strong>
            <p>真实场景｜实用地道｜开口就能用</p>
          </div>
        </div>
        <Link className={styles.patternDesignButton} href={feature.href}>
          {feature.cta}
          <Icon name="arrow" />
        </Link>
      </div>
      <PatternPhoneContent />
    </section>
  );
}

function NativePhoneContent() {
  return (
    <div className={styles.nativePhoneShell}>
      <div className={styles.nativePhoneHeader}>
        <button aria-label="返回" type="button">
          <Icon name="arrowLeft" />
        </button>
        <div>
          <strong>地道语感训练</strong>
          <span>初级 · Everyday Flow</span>
        </div>
      </div>
      <div className={styles.nativePhoneHero}>
        <button type="button">语速慢</button>
        <span>
          <i />
        </span>
        <small>第 1 / 600 句</small>
      </div>
      <div className={styles.nativeLessonCard}>
        <div className={styles.nativeLessonMeta}>
          <span>每日 20 句</span>
          <b>Day 1 · 句子 1</b>
        </div>
        <small>英文句子</small>
        <p>When things get tough, keep reminding yourself why you started.</p>
        <b>中文翻译</b>
        <em>当事情变得艰难时，不断提醒自己为什么开始。</em>
      </div>
      <div className={styles.nativePhoneActions}>
        {nativePhoneActions.map((action) => (
          <button
            className={styles[`nativePhoneAction${action.tone}`]}
            key={action.label}
            type="button"
          >
            <span>
              <Icon name={action.icon} />
            </span>
            {action.label}
          </button>
        ))}
      </div>
      <div className={styles.nativePhoneFooter}>
        <button type="button">
          <Icon name="arrowLeft" />
          上一句
        </button>
        <span>
          进度
          <b>15 / 20</b>
        </span>
        <button type="button">
          下一句
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}

function NativeFeatureSection({ feature }: { feature: Feature }) {
  return (
    <section
      className={[
        styles.featureSection,
        styles[feature.toneClass],
        styles.nativeFeatureSection,
      ].join(" ")}
    >
      <span className={styles.nativeMusicStaff} aria-hidden="true" />
      <span className={styles.nativeHeadphonesArt} aria-hidden="true">
        <Icon name="headphones" />
      </span>
      <span className={styles.nativeNoteOne} aria-hidden="true">
        ♪
      </span>
      <span className={styles.nativeNoteTwo} aria-hidden="true">
        ♫
      </span>
      <div className={styles.nativeDesignCopy}>
        <div className={styles.nativeDesignTitle}>
          <span className={styles.nativeDesignIcon}>
            <Icon name={feature.icon} />
          </span>
          <span className={styles.nativeDesignNumber}>{feature.number}</span>
          <h2>{feature.title}</h2>
        </div>
        <p className={styles.nativeDesignSubtitle}>{feature.subtitle}</p>
        <p className={styles.nativeDesignText}>{feature.copy}</p>
        <div className={styles.nativeFlowGrid}>
          {nativeFlowCards.map((card) => (
            <div
              className={[
                styles.nativeFlowCard,
                styles[`nativeFlowCard${card.tone}`],
              ].join(" ")}
              key={card.title}
            >
              <span className={styles.nativeFlowLevel}>{card.level}</span>
              <span
                className={[
                  styles.nativeFlowVisual,
                  styles[`nativeFlowVisual${card.visual}`],
                ].join(" ")}
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
              </span>
              <strong>{card.title}</strong>
              <b>{card.subtitle}</b>
              <div className={styles.nativeFlowStats}>
                <span>
                  <Icon name="calendar" />
                  30天课程
                </span>
                <span>
                  <Icon name="book" />
                  600句
                </span>
              </div>
              <button aria-label={`进入${card.title}`} type="button">
                <Icon name="arrow" />
              </button>
            </div>
          ))}
        </div>
        <div className={styles.nativeSummaryRow}>
          <div>
            <span>
              <Icon name="headphones" />
            </span>
            <strong>总计 1800+ 句跟读训练</strong>
            <p>每天20句，持续30天，全面提升语感与表达</p>
          </div>
          <span className={styles.nativeSummaryChart} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className={styles.nativeActionRow}>
          <Link className={styles.nativeDesignButton} href={feature.href}>
            <Icon name="play" />
            {feature.cta}
            <Icon name="arrow" />
          </Link>
          <div className={styles.nativePracticeBadge}>
            <span>★</span>
            <div>
              <strong>坚持练习</strong>
              <p>英语会更自然地流出来！</p>
            </div>
          </div>
        </div>
      </div>
      <NativePhoneContent />
    </section>
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

function ExpressionFolderArt() {
  return (
    <div className={styles.expressionDesignArt} aria-hidden="true">
      <span className={styles.expressionSparkOne} aria-hidden="true">
        *
      </span>
      <span className={styles.expressionSparkTwo} aria-hidden="true">
        *
      </span>
      <div
        className={[
          styles.expressionPaper,
          styles.expressionPaperOne,
        ].join(" ")}
      >
        <strong>That makes sense.</strong>
        <small>自然交流</small>
      </div>
      <div
        className={[
          styles.expressionPaper,
          styles.expressionPaperTwo,
        ].join(" ")}
      >
        <strong>I totally agree.</strong>
        <small>常用表达</small>
      </div>
      <div
        className={[
          styles.expressionPaper,
          styles.expressionPaperThree,
        ].join(" ")}
      >
        <strong>Thanks for your help!</strong>
        <small>感谢</small>
      </div>
      <div className={styles.expressionFolderBox}>
        <Icon name="star" />
      </div>
      <span className={styles.expressionMagnifier}>
        <Icon name="search" />
      </span>
    </div>
  );
}

function ExpressionPhoneCard({
  title,
  subtitle,
  icon,
  tone,
  points,
  cta,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  tone: "violet" | "green";
  points: string[];
  cta: string;
}) {
  return (
    <div
      className={[
        styles.expressionPhoneCard,
        styles[`expressionPhoneCard${tone}`],
      ].join(" ")}
    >
      <div className={styles.expressionPhoneCardHeader}>
        <span>
          <Icon name={icon} />
        </span>
        <div>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>
      </div>
      <ul>
        {points.map((point) => (
          <li key={point}>
            <Icon name="check" />
            {point}
          </li>
        ))}
      </ul>
      <button type="button">
        {cta}
        <Icon name="arrow" />
      </button>
      {tone === "violet" ? (
        <span className={styles.expressionPhoneBook} aria-hidden="true">
          <Icon name="book" />
          <b>Aa</b>
        </span>
      ) : (
        <span className={styles.expressionPhoneFolder} aria-hidden="true">
          <Icon name="folder" />
          <i>
            <Icon name="search" />
          </i>
        </span>
      )}
    </div>
  );
}

function ExpressionPhoneContent() {
  return (
    <div className={styles.expressionPhoneShell}>
      <div className={styles.expressionPhoneStatus}>
        <span>9:41</span>
        <span aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={styles.expressionPhoneTitle}>
        <Icon name="book" />
        <div>
          <strong>新表达</strong>
          <small>发现、学习和管理地道表达</small>
        </div>
      </div>
      <ExpressionPhoneCard
        cta="去学习新表达"
        icon="star"
        points={expressionDiscoverPoints}
        subtitle="学习地道、实用的英语表达"
        title="发现新表达"
        tone="violet"
      />
      <ExpressionPhoneCard
        cta="打开我的表达库"
        icon="folder"
        points={expressionLibraryPoints}
        subtitle="查看收藏、复习和管理你的表达"
        title="我的表达库"
        tone="green"
      />
      <div className={styles.expressionPhoneTip}>
        <Icon name="lightbulb" />
        <p>小贴士</p>
        <span>坚持学习和复习，你会发现自己的表达越来越自然！</span>
      </div>
      <div className={styles.expressionPhoneTabs} aria-hidden="true">
        <span className={styles.expressionPhoneTabActive}>
          <Icon name="home" />
          首页
        </span>
        <span>
          <Icon name="barChart" />
          学习记录
        </span>
        <span>
          <Icon name="message" />
          帮助中心
        </span>
        <span>
          <Icon name="users" />
          我的
        </span>
      </div>
    </div>
  );
}

function ExpressionFeatureSection({ feature }: { feature: Feature }) {
  return (
    <section
      className={[
        styles.featureSection,
        styles[feature.toneClass],
        styles.expressionFeatureSection,
      ].join(" ")}
    >
      <div className={styles.expressionDesignCopy}>
        <div className={styles.expressionDesignTitle}>
          <span className={styles.expressionDesignIcon}>
            <Icon name={feature.icon} />
          </span>
          <span className={styles.expressionDesignNumber}>{feature.number}</span>
          <h2>{feature.title}</h2>
        </div>
        <p className={styles.expressionDesignSubtitle}>{feature.subtitle}</p>
        <p className={styles.expressionDesignText}>{feature.copy}</p>
        <ul className={styles.expressionFeatureList}>
          {expressionFeatureItems.map((item) => (
            <li key={item.title}>
              <span>
                <Icon name={item.icon} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link className={styles.expressionDesignButton} href={feature.href}>
          查看我的表达库
          <Icon name="arrow" />
        </Link>
      </div>
      <ExpressionFolderArt />
      <ExpressionPhoneContent />
    </section>
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
      return <ScenePhoneContent />;
    case "patterns":
      return <PatternsMockup />;
    case "native":
      return <NativeMockup />;
    case "library":
      return <LibraryMockup />;
  }
}

function FeatureSection({ feature }: { feature: Feature }) {
  if (feature.mockup === "scene") {
    return <SceneFeatureSection feature={feature} />;
  }

  if (feature.mockup === "patterns") {
    return <PatternFeatureSection feature={feature} />;
  }

  if (feature.mockup === "native") {
    return <NativeFeatureSection feature={feature} />;
  }

  if (feature.mockup === "library") {
    return <ExpressionFeatureSection feature={feature} />;
  }

  return (
    <section
      className={[
        styles.featureSection,
        styles[feature.toneClass],
        feature.visualFirst ? styles.visualFirst : "",
        feature.mockup === "free" ? styles.freeStudyFeatureSection : "",
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
    <section
      className={[
        styles.featureSection,
        styles.toneViolet,
        styles.createFeatureSection,
      ].join(" ")}
    >
      <div className={styles.createDesignCopy}>
        <div className={styles.createDesignTitle}>
          <span className={styles.createDesignIcon}>
            <Icon name="plus" />
          </span>
          <span className={styles.createDesignNumber}>7</span>
          <h2>创建课程</h2>
        </div>
        <p className={styles.createDesignSubtitle}>AI 助力，快速生成专属课程</p>
        <p className={styles.createDesignText}>
          上传学习材料、粘贴文本或输入目标，AI 会帮你拆解成可练习的口语课程。
        </p>
        <ul className={styles.createFeatureList}>
          {createCourseFeatureItems.map((item) => (
            <li key={item.title}>
              <span>
                <Icon name={item.icon} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link className={styles.createDesignButton} href="/create-course">
          开始创建课程
          <Icon name="arrow" />
        </Link>
      </div>
      <div className={styles.createWorkspace}>
        <div className={styles.createHeroPanel}>
          <div className={styles.createWindowBar}>
            <span />
            <span />
            <span />
            <button type="button">Aa</button>
          </div>
          <div className={styles.createHeroContent}>
            <div>
              <strong>创建你的专属课程</strong>
              <p>上传材料，AI 助力你自动生成结构化课程内容</p>
            </div>
            <div className={styles.createHeroGraphic} aria-hidden="true">
              <span>Aa</span>
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className={styles.createStepRow}>
            {createCourseSteps.map((step, index) => (
              <div
                className={index === 0 ? styles.createStepActive : ""}
                key={step.title}
              >
                <span>{index + 1}</span>
                <strong>{step.title}</strong>
                <small>{step.text}</small>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.createWorkspaceGrid}>
          <div className={styles.createUploadPanel}>
            <strong>上传学习材料</strong>
            <div className={styles.createUploadTabs}>
              <span>
                <Icon name="fileText" />
                上传文章
              </span>
              <span>
                <Icon name="speaker" />
                上传音频
              </span>
            </div>
            <div className={styles.createDropzone}>
              <Icon name="upload" />
              <b>拖拽文件到这里 或 点击上传</b>
              <p>支持 TXT、PDF、DOCX 格式，最大 20MB</p>
            </div>
            <div className={styles.createTextarea}>
              <span>直接粘贴或输入文字</span>
              <p>在此粘贴或输入你的学习材料内容...</p>
              <small>87/50000</small>
            </div>
          </div>
          <div className={styles.createPracticePanel}>
            <strong>看着中文说英文</strong>
            <div className={styles.createChineseCard}>
              那我们休息一下，
              <br />
              过会儿再去散步吧。
            </div>
            <Link className={styles.createPracticeCta} href="/create-course">
              <Icon name="mic" />
              点我，录制英语
            </Link>
            <div className={styles.createEnglishCard}>
              <small>你的英文表达</small>
              <p>Let&apos;s have a rest, and then we can go to hiking.</p>
              <span>
                <Icon name="spark" />
                重新说
              </span>
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
            <Link href="/about">关于我们</Link>
            <Link href="/contact">联系我们</Link>
          </nav>
          <div className={styles.headerActions}>
            <Link className={styles.upgradeLink} href="/subscription">
              <Icon name="spark" />
              会员版
            </Link>
            <Link aria-label="通知" className={styles.iconButton} href="/notifications">
              <Icon name="bell" />
            </Link>
            <HomeAccountLink />
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
              <Link className={styles.primaryButton} href="/ai-guided-expression">
                <Icon name="mic" />
                开始免费学习
              </Link>
              <Link className={styles.secondaryButton} href="/about">
                了解 SpeakFlow
              </Link>
            </div>
            <div
              className={styles.heroProof}
              aria-label="4.9 分，来自 50,000+ 用户的反馈"
            >
              <Image
                alt=""
                className={styles.heroProofImage}
                height={98}
                sizes="(max-width: 520px) 320px, 340px"
                src="/images/home-proof-feedback.png"
                width={556}
              />
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
            <Link href="/help">帮助中心</Link>
            <Link href="/contact">联系我们</Link>
            <Link href="/privacy">隐私政策</Link>
            <Link href="/terms">服务条款</Link>
          </div>
          <div>
            <h3>关于</h3>
            <Link href="/about">关于我们</Link>
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
