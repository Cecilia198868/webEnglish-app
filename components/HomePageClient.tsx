import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./WebHomePageClient.module.css";

const HOME_ART_WIDTH = 1713;
const HOME_ART_HEIGHT = 9948;
const HOME_ART_SRC =
  "/image3/%E6%88%91%E8%AE%BE%E8%AE%A1%E7%9A%84%E9%A6%96%E9%A1%B5.png";

type Hotspot = {
  href: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: "nav" | "button" | "section" | "footer";
};

const learningMenuHotspot: Omit<Hotspot, "href"> = {
  label: "Start learning menu",
  x: 500,
  y: 24,
  width: 128,
  height: 58,
  kind: "nav",
};

const learningLinks = [
  {
    href: "/ai-guided-expression",
    label: "\u0041\u0049\u5f15\u5bfc\u8868\u8fbe",
  },
  { href: "/free-study", label: "\u81ea\u7531\u5b66\u4e60" },
  {
    href: "/classic-scenes",
    label: "\u7ecf\u5178\u573a\u666f\u53e3\u8bed\u7ec3\u4e60",
  },
  {
    href: "/sentence-patterns",
    label: "\u0031\u0030\u0030\u4e2a\u53e3\u8bed\u53e5\u578b\u7ec3\u4e60",
  },
  {
    href: "/native-flow",
    label: "\u5730\u9053\u8bed\u611f\u7ec3\u4e60",
  },
];

const hotspots: Hotspot[] = [
  { href: "/", label: "SpeakFlow home", x: 54, y: 24, width: 230, height: 58, kind: "nav" },
  { href: "/", label: "Home", x: 380, y: 24, width: 84, height: 58, kind: "nav" },
  {
    href: "/new-expressions",
    label: "My expressions",
    x: 668,
    y: 24,
    width: 128,
    height: 58,
    kind: "nav",
  },
  {
    href: "/create-course",
    label: "Create course",
    x: 828,
    y: 24,
    width: 130,
    height: 58,
    kind: "nav",
  },
  {
    href: "/menu?panel=about",
    label: "About",
    x: 978,
    y: 24,
    width: 128,
    height: 58,
    kind: "nav",
  },
  {
    href: "/menu?panel=help",
    label: "Contact",
    x: 1115,
    y: 24,
    width: 128,
    height: 58,
    kind: "nav",
  },
  { href: "/account", label: "Upgrade", x: 1300, y: 20, width: 108, height: 62, kind: "nav" },
  {
    href: "/notifications",
    label: "Notifications",
    x: 1430,
    y: 20,
    width: 54,
    height: 62,
    kind: "nav",
  },
  {
    href: "/languages",
    label: "Language",
    x: 1496,
    y: 20,
    width: 165,
    height: 62,
    kind: "nav",
  },
  {
    href: "/ai-guided-expression",
    label: "Start free learning",
    x: 190,
    y: 718,
    width: 292,
    height: 88,
    kind: "button",
  },
  {
    href: "/menu?panel=about",
    label: "Learn about SpeakFlow",
    x: 520,
    y: 718,
    width: 310,
    height: 88,
    kind: "button",
  },
  {
    href: "/free-study",
    label: "Free study",
    x: 0,
    y: 1710,
    width: 1713,
    height: 910,
    kind: "section",
  },
  {
    href: "/free-study",
    label: "Free study phone practice button",
    x: 520,
    y: 2398,
    width: 250,
    height: 78,
    kind: "button",
  },
  {
    href: "/free-study",
    label: "Start free study card button",
    x: 1080,
    y: 2410,
    width: 330,
    height: 92,
    kind: "button",
  },
  {
    href: "/ai-guided-expression",
    label: "AI guided expression",
    x: 0,
    y: 2660,
    width: 1713,
    height: 1090,
    kind: "section",
  },
  {
    href: "/classic-scenes",
    label: "Classic scene practice",
    x: 0,
    y: 3840,
    width: 1713,
    height: 1060,
    kind: "section",
  },
  {
    href: "/sentence-patterns",
    label: "Sentence patterns",
    x: 0,
    y: 4980,
    width: 1713,
    height: 930,
    kind: "section",
  },
  {
    href: "/native-flow",
    label: "Native flow training",
    x: 0,
    y: 5960,
    width: 1713,
    height: 950,
    kind: "section",
  },
  {
    href: "/new-expressions",
    label: "New expressions",
    x: 0,
    y: 7000,
    width: 1713,
    height: 1080,
    kind: "section",
  },
  {
    href: "/create-course",
    label: "Create course section",
    x: 0,
    y: 8068,
    width: 1713,
    height: 1086,
    kind: "section",
  },
  {
    href: "/start",
    label: "Start anywhere",
    x: 86,
    y: 9220,
    width: 1538,
    height: 430,
    kind: "button",
  },
  {
    href: "/menu?panel=help",
    label: "Help center",
    x: 612,
    y: 9730,
    width: 130,
    height: 50,
    kind: "footer",
  },
  {
    href: "/privacy",
    label: "Privacy",
    x: 612,
    y: 9788,
    width: 130,
    height: 50,
    kind: "footer",
  },
  {
    href: "/terms",
    label: "Terms",
    x: 612,
    y: 9846,
    width: 130,
    height: 50,
    kind: "footer",
  },
  {
    href: "/menu?panel=about",
    label: "About footer",
    x: 938,
    y: 9730,
    width: 130,
    height: 50,
    kind: "footer",
  },
  {
    href: "/create-course",
    label: "Create course footer",
    x: 938,
    y: 9788,
    width: 130,
    height: 50,
    kind: "footer",
  },
];

function hotspotStyle(
  hotspot: Pick<Hotspot, "x" | "y" | "width" | "height">
): CSSProperties {
  return {
    height: `${(hotspot.height / HOME_ART_HEIGHT) * 100}%`,
    left: `${(hotspot.x / HOME_ART_WIDTH) * 100}%`,
    top: `${(hotspot.y / HOME_ART_HEIGHT) * 100}%`,
    width: `${(hotspot.width / HOME_ART_WIDTH) * 100}%`,
  };
}

export default function HomePageClient() {
  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>SpeakFlow web home</h1>
      <div className={styles.artboard} aria-label="SpeakFlow web home">
        <Image
          src={HOME_ART_SRC}
          alt="SpeakFlow web home design"
          width={HOME_ART_WIDTH}
          height={HOME_ART_HEIGHT}
          sizes="(max-width: 1713px) 100vw, 1713px"
          priority
          unoptimized
          className={styles.homeArt}
        />
        <nav className={styles.hotspots} aria-label="Home navigation and learning links">
          <div
            className={styles.learningMenu}
            style={hotspotStyle(learningMenuHotspot)}
          >
            <button
              type="button"
              className={styles.learningTrigger}
              aria-haspopup="menu"
            >
              <span className={styles.srOnly}>{learningMenuHotspot.label}</span>
            </button>
            <div className={styles.learningDropdown} role="menu">
              {learningLinks.map((item) => (
                <Link
                  className={styles.learningDropdownItem}
                  href={item.href}
                  key={item.href}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {hotspots.map((hotspot) => (
            <Link
              aria-label={hotspot.label}
              className={styles.hotspot}
              data-kind={hotspot.kind}
              href={hotspot.href}
              key={`${hotspot.href}-${hotspot.label}-${hotspot.x}-${hotspot.y}`}
              style={hotspotStyle(hotspot)}
            >
              <span className={styles.srOnly}>{hotspot.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
