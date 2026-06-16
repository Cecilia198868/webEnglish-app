"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  applyExpressionStudyAction,
  deleteVocabularyWordFromCloud,
  loadVocabularyWords,
  loadVocabularyWordsFromCloud,
  saveVocabularyWords,
  type ExpressionLearningStatus,
  type VocabularyWord,
} from "@/lib/vocabulary";
import { playSpeakFlowTts, stopSpeakFlowTts } from "@/lib/speakFlowTtsClient";
import styles from "./NewExpressionsWebPage.module.css";

type Hotspot = {
  href: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: "nav";
};

type LibraryFilter = "all" | "learning" | "mastered" | "review";

const PAGE_ART_WIDTH = 1713;
const PAGE_ART_HEIGHT = 1833;
const PAGE_ART_SRC = "/image3/%E6%96%B0%E8%A1%A8%E8%BE%BE.png";
const ALLOY_VOICE_ID = "alloy";

const learningMenuHotspot: Omit<Hotspot, "href"> = {
  height: 64,
  kind: "nav",
  label: "Start learning menu",
  width: 124,
  x: 488,
  y: 54,
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

const navHotspots: Hotspot[] = [
  { href: "/", label: "SpeakFlow home", x: 50, y: 50, width: 260, height: 68, kind: "nav" },
  { href: "/", label: "Home", x: 382, y: 50, width: 74, height: 68, kind: "nav" },
  { href: "/new-expressions", label: "My expressions", x: 618, y: 50, width: 106, height: 68, kind: "nav" },
  { href: "/create-course", label: "Create course", x: 760, y: 50, width: 108, height: 68, kind: "nav" },
  { href: "/menu?panel=about", label: "About", x: 896, y: 50, width: 104, height: 68, kind: "nav" },
  { href: "/menu?panel=help", label: "Contact", x: 1038, y: 50, width: 122, height: 68, kind: "nav" },
  { href: "/account", label: "Upgrade", x: 1256, y: 46, width: 124, height: 72, kind: "nav" },
  { href: "/notifications", label: "Notifications", x: 1392, y: 46, width: 56, height: 72, kind: "nav" },
  { href: "/languages", label: "Language", x: 1462, y: 46, width: 188, height: 72, kind: "nav" },
];

function hotspotStyle(
  hotspot: Pick<Hotspot, "x" | "y" | "width" | "height">
): CSSProperties {
  return {
    height: `${(hotspot.height / PAGE_ART_HEIGHT) * 100}%`,
    left: `${(hotspot.x / PAGE_ART_WIDTH) * 100}%`,
    top: `${(hotspot.y / PAGE_ART_HEIGHT) * 100}%`,
    width: `${(hotspot.width / PAGE_ART_WIDTH) * 100}%`,
  };
}

function sortVocabularyWords(words: VocabularyWord[]) {
  return [...words].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isReviewDue(word: VocabularyWord) {
  return Boolean(word.nextReviewAt && word.nextReviewAt <= getDateKey());
}

function statusLabel(status: ExpressionLearningStatus) {
  if (status === "mastered") return "\u5df2\u638c\u63e1";
  if (status === "familiar") return "\u5f85\u590d\u4e60";
  if (status === "learning") return "\u5b66\u4e60\u4e2d";
  return "\u5f85\u5b66\u4e60";
}

function statusKind(word: VocabularyWord) {
  if (word.status === "mastered") return "mastered";
  if (isReviewDue(word) || word.status === "familiar") return "review";
  return "learning";
}

function getMeaning(word: VocabularyWord | null) {
  return (
    word?.meaningZh?.trim() ||
    word?.meaning?.trim() ||
    "\u91ca\u4e49\u5f85\u8865\u5145"
  );
}

function getExample(word: VocabularyWord | null) {
  return (
    word?.example?.trim() ||
    word?.sourceSentence?.trim() ||
    `I want to use "${word?.word || "this expression"}" naturally.`
  );
}

function getExampleZh(word: VocabularyWord | null) {
  return word?.exampleZh?.trim() || "\u4f8b\u53e5\u7ffb\u8bd1\u5f85\u8865\u5145";
}

function getPartOfSpeech(word: VocabularyWord | null) {
  if (!word) return "phrase";
  if (word.partOfSpeech.trim()) return word.partOfSpeech.trim();
  return word.word.includes(" ") ? "phrase" : "word";
}

function filterMatches(word: VocabularyWord, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    word.word,
    word.text,
    word.meaning,
    word.meaningZh,
    word.partOfSpeech,
    word.example,
    word.exampleZh,
  ]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedQuery));
}

function filterByStatus(word: VocabularyWord, filter: LibraryFilter) {
  if (filter === "all") return true;
  if (filter === "mastered") return word.status === "mastered";
  if (filter === "review") return isReviewDue(word) || word.status === "familiar";
  return word.status === "learning" || word.status === "new";
}

export function NewExpressionsWebPage() {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");
  const [activeWordKey, setActiveWordKey] = useState("");
  const [openMenuWord, setOpenMenuWord] = useState("");
  const [query, setQuery] = useState("");
  const [words, setWords] = useState<VocabularyWord[]>([]);

  useEffect(() => {
    let cancelled = false;
    const localWords = sortVocabularyWords(loadVocabularyWords());

    setWords(localWords);
    setActiveWordKey((current) => current || localWords[0]?.word || "");

    async function loadCloudWords() {
      const cloudWords = sortVocabularyWords(await loadVocabularyWordsFromCloud());
      if (cancelled) return;

      setWords(cloudWords);
      setActiveWordKey((current) =>
        current && cloudWords.some((word) => word.word === current)
          ? current
          : cloudWords[0]?.word || ""
      );
    }

    void loadCloudWords();

    return () => {
      cancelled = true;
      stopSpeakFlowTts();
    };
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const newestCount = words.filter((word) => {
      const createdTime = new Date(word.createdAt).getTime();
      return Number.isFinite(createdTime) && now - createdTime <= 7 * 86400000;
    }).length;

    return {
      all: words.length,
      learning: words.filter(
        (word) => word.status === "learning" || word.status === "new"
      ).length,
      mastered: words.filter((word) => word.status === "mastered").length,
      newest: newestCount,
      review: words.filter((word) => isReviewDue(word) || word.status === "familiar").length,
    };
  }, [words]);

  const visibleWords = useMemo(
    () =>
      words.filter(
        (word) => filterByStatus(word, activeFilter) && filterMatches(word, query)
      ),
    [activeFilter, query, words]
  );

  const activeWord =
    words.find((word) => word.word === activeWordKey) ||
    visibleWords[0] ||
    words[0] ||
    null;
  const activeVisibleIndex = activeWord
    ? visibleWords.findIndex((word) => word.word === activeWord.word)
    : -1;

  function persistWord(updatedWord: VocabularyWord) {
    const storedWords = loadVocabularyWords();
    const nextStoredWords = storedWords.some((word) => word.word === updatedWord.word)
      ? storedWords.map((word) =>
          word.word === updatedWord.word ? updatedWord : word
        )
      : [...storedWords, updatedWord];

    saveVocabularyWords(nextStoredWords, { sync: "immediate" });
    setWords(sortVocabularyWords(nextStoredWords));
  }

  function openExpression(word: VocabularyWord) {
    const updatedWord = applyExpressionStudyAction(word, "view");
    persistWord(updatedWord);
    setActiveWordKey(updatedWord.word);
    setOpenMenuWord("");
  }

  function removeExpression(word: VocabularyWord) {
    const nextStoredWords = loadVocabularyWords().filter(
      (item) => item.word !== word.word
    );
    const nextWords = sortVocabularyWords(nextStoredWords);

    saveVocabularyWords(nextStoredWords, { sync: false });
    void deleteVocabularyWordFromCloud(word.word);
    setWords(nextWords);
    setOpenMenuWord("");
    setActiveWordKey((current) =>
      current === word.word ? nextWords[0]?.word || "" : current
    );
  }

  function selectRelativeExpression(offset: number) {
    const sourceWords = visibleWords.length ? visibleWords : words;
    if (!sourceWords.length) return;

    const currentIndex = activeWord
      ? sourceWords.findIndex((word) => word.word === activeWord.word)
      : -1;
    const normalizedIndex = currentIndex < 0 ? 0 : currentIndex;
    const nextIndex =
      (normalizedIndex + offset + sourceWords.length) % sourceWords.length;

    openExpression(sourceWords[nextIndex]);
  }

  function playText(text: string, rate = 1) {
    const normalizedText = text.trim();
    if (!normalizedText) return;

    if (activeWord) {
      persistWord(applyExpressionStudyAction(activeWord, "play"));
    }

    void playSpeakFlowTts({
      rate,
      text: normalizedText,
      voiceId: ALLOY_VOICE_ID,
    });
  }

  const statCards = [
    { count: stats.learning, label: "\u5b66\u4e60\u4e2d" },
    { count: stats.mastered, label: "\u5df2\u638c\u63e1" },
    { count: stats.review, label: "\u5f85\u590d\u4e60" },
    { count: stats.newest, label: "\u6700\u8fd1\u65b0\u589e" },
  ];
  const filterTabs: Array<{ count: number; filter: LibraryFilter; label: string }> = [
    { count: stats.all, filter: "all", label: "\u5168\u90e8" },
    { count: stats.learning, filter: "learning", label: "\u5b66\u4e60\u4e2d" },
    { count: stats.mastered, filter: "mastered", label: "\u5df2\u638c\u63e1" },
    { count: stats.review, filter: "review", label: "\u5f85\u590d\u4e60" },
  ];

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>SpeakFlow new expressions</h1>
      <div className={styles.artboard} aria-label="SpeakFlow new expressions page">
        <Image
          src={PAGE_ART_SRC}
          alt="SpeakFlow new expressions web design"
          width={PAGE_ART_WIDTH}
          height={PAGE_ART_HEIGHT}
          sizes="(max-width: 1713px) 100vw, 1713px"
          priority
          unoptimized
          className={styles.pageArt}
        />

        <section className={styles.libraryPanel} aria-label="我的表达库">
          <div className={styles.libraryHeader}>
            <div>
              <h2>我的表达库</h2>
              <p>已收藏 {stats.all} 个表达</p>
            </div>
          </div>

          <div className={styles.statGrid}>
            {statCards.map((card) => (
              <div className={styles.statCard} key={card.label}>
                <span>{card.label}</span>
                <strong>{card.count}</strong>
                <em>个</em>
              </div>
            ))}
          </div>

          <label className={styles.searchBox}>
            <span className={styles.srOnly}>搜索表达</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索表达（中英文均可）"
              value={query}
            />
          </label>

          <div className={styles.filterTabs} role="tablist" aria-label="表达库筛选">
            {filterTabs.map((tab) => (
              <button
                aria-selected={activeFilter === tab.filter}
                className={activeFilter === tab.filter ? styles.activeTab : ""}
                key={tab.filter}
                onClick={() => setActiveFilter(tab.filter)}
                role="tab"
                type="button"
              >
                {tab.label} <span>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className={styles.expressionList}>
            {visibleWords.map((word) => (
              <article
                className={styles.expressionRow}
                data-active={activeWord?.word === word.word}
                key={word.word}
              >
                <button
                  className={styles.expressionMain}
                  onClick={() => openExpression(word)}
                  type="button"
                >
                  <span className={styles.cloudIcon} aria-hidden="true" />
                  <span className={styles.expressionText}>
                    <strong>{word.text || word.word}</strong>
                    <em>{getMeaning(word)}</em>
                    <small>{getPartOfSpeech(word)}</small>
                  </span>
                  <span className={styles.statusPill} data-status={statusKind(word)}>
                    {statusLabel(word.status)}
                  </span>
                </button>
                <div className={styles.rowActions}>
                  <button
                    aria-label={`播放 ${word.word}`}
                    className={styles.inlineAudioButton}
                    onClick={() => playText(word.word, 1)}
                    type="button"
                  >
                    <span aria-hidden="true">▶</span>
                  </button>
                  <button
                    aria-expanded={openMenuWord === word.word}
                    aria-label={`${word.word} 更多操作`}
                    className={styles.moreButton}
                    onClick={() =>
                      setOpenMenuWord((current) =>
                        current === word.word ? "" : word.word
                      )
                    }
                    type="button"
                  >
                    ···
                  </button>
                  {openMenuWord === word.word ? (
                    <div className={styles.rowMenu} role="menu">
                      <button onClick={() => openExpression(word)} role="menuitem" type="button">
                        学习此表达
                      </button>
                      <button onClick={() => removeExpression(word)} role="menuitem" type="button">
                        删除
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}

            {!visibleWords.length ? (
              <div className={styles.emptyState}>
                {query ? "没有找到匹配的表达" : "还没有收藏表达"}
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.learningPanel} aria-label="学习新表达">
          <header className={styles.learningHeader}>
            <h2>学习新表达</h2>
            <p>已掌握 {stats.mastered} 个表达</p>
          </header>

          <article className={styles.wordCard}>
            <div className={styles.cardTopline}>
              <span>★ 已收藏</span>
              <div className={styles.playCluster}>
                <button
                  aria-label="播放表达"
                  onClick={() => playText(activeWord?.word || "", 1)}
                  type="button"
                >
                  ▶
                </button>
                <button
                  aria-label="0.75x 慢速播放表达"
                  onClick={() => playText(activeWord?.word || "", 0.75)}
                  type="button"
                >
                  <strong>0.75x</strong>
                  <small>慢速</small>
                </button>
              </div>
            </div>
            <h3>{activeWord?.text || activeWord?.word || "请选择一个表达"}</h3>
            <div className={styles.shortLine} />
            <p className={styles.detailLabel}>中文含义</p>
            <p className={styles.meaningText}>{getMeaning(activeWord)}</p>
          </article>

          <article className={styles.exampleCard}>
            <div className={styles.cardTopline}>
              <span>例句</span>
              <div className={styles.playCluster}>
                <button
                  aria-label="播放例句"
                  onClick={() => playText(getExample(activeWord), 1)}
                  type="button"
                >
                  ▶
                </button>
                <button
                  aria-label="0.75x 慢速播放例句"
                  onClick={() => playText(getExample(activeWord), 0.75)}
                  type="button"
                >
                  <strong>0.75x</strong>
                  <small>慢速</small>
                </button>
              </div>
            </div>
            <h3>{getExample(activeWord)}</h3>
            <p className={styles.detailLabel}>中文翻译</p>
            <p className={styles.meaningText}>{getExampleZh(activeWord)}</p>
          </article>

          <div className={styles.learningControls}>
            <button onClick={() => selectRelativeExpression(-1)} type="button">
              ← <span>上一句</span>
            </button>
            <button onClick={() => playText(getExample(activeWord), 0.75)} type="button">
              <span>🎧</span>
              <strong>慢速朗读</strong>
            </button>
            <button onClick={() => selectRelativeExpression(1)} type="button">
              <span>下一句</span> →
            </button>
          </div>
        </section>

        <nav className={styles.hotspots} aria-label="New expressions navigation">
          <div className={styles.learningMenu} style={hotspotStyle(learningMenuHotspot)}>
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

          {navHotspots.map((hotspot) => (
            <Link
              aria-label={hotspot.label}
              className={styles.hotspot}
              data-kind={hotspot.kind}
              href={hotspot.href}
              key={`${hotspot.label}-${hotspot.href}`}
              style={hotspotStyle(hotspot)}
            />
          ))}
        </nav>
      </div>
    </main>
  );
}
