"use client";

import { useEffect, useMemo, useState } from "react";
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

type LibraryFilter = "all" | "learning" | "mastered" | "review" | "recent";

const ALLOY_VOICE_ID = "alloy";

const learningLinks = [
  { href: "/ai-guided-expression", label: "AI引导表达" },
  { href: "/free-study", label: "自由学习" },
  { href: "/classic-scenes", label: "经典场景口语练习" },
  { href: "/sentence-patterns", label: "100个口语句型练习" },
  { href: "/native-flow", label: "地道语感训练" },
];

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

function isRecentWord(word: VocabularyWord) {
  const createdTime = new Date(word.createdAt).getTime();
  return Number.isFinite(createdTime) && Date.now() - createdTime <= 7 * 86400000;
}

function isReviewDue(word: VocabularyWord) {
  return Boolean(word.nextReviewAt && word.nextReviewAt <= getDateKey());
}

function hasMojibake(value: string) {
  return /[�€�]|(鍦|璇|绋|紝|锛|銆|鐨|浣|瀛|鏃|鎴|鍒|鈻|馃|鉁)/.test(value);
}

function cleanText(value: string | null | undefined, fallback: string) {
  const text = (value || "").trim();
  if (!text || hasMojibake(text)) return fallback;
  return text;
}

function statusLabel(status: ExpressionLearningStatus) {
  if (status === "mastered") return "已掌握";
  if (status === "familiar") return "待复习";
  if (status === "learning") return "学习中";
  return "最近新增";
}

function statusKind(word: VocabularyWord) {
  if (word.status === "mastered") return "mastered";
  if (isReviewDue(word) || word.status === "familiar") return "review";
  if (isRecentWord(word) && word.status === "new") return "recent";
  return "learning";
}

function getDisplayWord(word: VocabularyWord | null) {
  return cleanText(word?.text || word?.word, "请选择一个表达");
}

function getMeaning(word: VocabularyWord | null) {
  return cleanText(
    word?.meaningZh || word?.meaning,
    word ? "释义待补充" : "从左侧表达库选择一个表达后，这里会显示中文含义。"
  );
}

function getExample(word: VocabularyWord | null) {
  return cleanText(
    word?.example || word?.sourceSentence,
    word
      ? `I want to use "${word.word}" naturally in a real conversation.`
      : "Choose an expression from your library to start practicing."
  );
}

function getExampleZh(word: VocabularyWord | null) {
  return cleanText(
    word?.exampleZh,
    word ? "例句翻译待补充" : "选择表达后，这里会显示例句的中文翻译。"
  );
}

function getPartOfSpeech(word: VocabularyWord | null) {
  if (!word) return "expression";
  const partOfSpeech = cleanText(word.partOfSpeech, "");
  if (partOfSpeech) return partOfSpeech;
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
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(normalizedQuery));
}

function filterByStatus(word: VocabularyWord, filter: LibraryFilter) {
  if (filter === "all") return true;
  if (filter === "mastered") return word.status === "mastered";
  if (filter === "review") return isReviewDue(word) || word.status === "familiar";
  if (filter === "recent") return isRecentWord(word);
  return word.status === "learning" || word.status === "new";
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 9.5h14" />
      <path d="M7 6h10" />
      <path d="M7 13h6" />
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v10.2a2.8 2.8 0 0 1-2.8 2.8H12l-4.3 2.6v-2.6h-.2A2.5 2.5 0 0 1 5 16V5.5Z" />
    </svg>
  );
}

function ChevronIcon({ direction = "right" }: { direction?: "right" | "left" }) {
  return (
    <svg
      className={direction === "left" ? styles.iconLeft : undefined}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 3.5 3.5" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Z" />
      <path d="M8 16h11" />
      <path d="M9 8h6M9 11h5" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3 9.6 9.6 3 12l6.6 2.4L12 21l2.4-6.6L21 12l-6.6-2.4L12 3Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 14v-4h4l5-4v12l-5-4H4Z" />
      <path d="M16 9.5a4 4 0 0 1 0 5" />
      <path d="M18.5 7a7.5 7.5 0 0 1 0 10" />
    </svg>
  );
}

function SlowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 14c4 2 8 1 10-4 1.5 5 4.5 7 9 5" />
      <path d="M8 11a5 5 0 0 1 10 0" />
      <path d="M6 19h12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 12h.01M12 12h.01M18 12h.01" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 9a6 6 0 0 1 12 0v4.5l1.5 3H4.5l1.5-3V9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4a12 12 0 0 1 0 16" />
      <path d="M12 4a12 12 0 0 0 0 16" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 8 4.5 4L12 6l3.5 6L20 8l-1.4 9H5.4L4 8Z" />
      <path d="M6 20h12" />
    </svg>
  );
}

export function NewExpressionsWebPage() {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");
  const [activeWordKey, setActiveWordKey] = useState("");
  const [openMenuWord, setOpenMenuWord] = useState("");
  const [query, setQuery] = useState("");
  const [words, setWords] = useState<VocabularyWord[]>(() =>
    sortVocabularyWords(loadVocabularyWords())
  );

  useEffect(() => {
    let cancelled = false;

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

  const stats = useMemo(
    () => ({
      all: words.length,
      learning: words.filter(
        (word) => word.status === "learning" || word.status === "new"
      ).length,
      mastered: words.filter((word) => word.status === "mastered").length,
      recent: words.filter(isRecentWord).length,
      review: words.filter((word) => isReviewDue(word) || word.status === "familiar")
        .length,
    }),
    [words]
  );

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
  const hasExpressions = words.length > 0;
  const activeVisibleIndex = activeWord
    ? visibleWords.findIndex((word) => word.word === activeWord.word)
    : -1;
  const activeWordText = getDisplayWord(activeWord);
  const activeMeaning = getMeaning(activeWord);
  const activeExample = getExample(activeWord);
  const activeExampleZh = getExampleZh(activeWord);

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

  function markExpressionMastered(word: VocabularyWord) {
    const updatedWord = applyExpressionStudyAction(word, "mastered");
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
    { count: stats.learning, label: "学习中" },
    { count: stats.mastered, label: "已掌握" },
    { count: stats.review, label: "待复习" },
    { count: stats.recent, label: "最近新增" },
  ];
  const filterTabs: Array<{ count: number; filter: LibraryFilter; label: string }> = [
    { count: stats.all, filter: "all", label: "全部" },
    { count: stats.learning, filter: "learning", label: "学习中" },
    { count: stats.mastered, filter: "mastered", label: "已掌握" },
    { count: stats.review, filter: "review", label: "待复习" },
    { count: stats.recent, filter: "recent", label: "最近新增" },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>
            <BrandIcon />
          </span>
          <strong>SpeakFlow</strong>
        </Link>
        <nav className={styles.nav} aria-label="主导航">
          <Link href="/">首页</Link>
          <div className={styles.navMenu}>
            <button type="button">
              开始学习
              <ChevronIcon />
            </button>
            <div className={styles.navDropdown}>
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
        <div className={styles.topActions}>
          <Link href="/subscription" className={styles.upgrade}>
            <CrownIcon />
            会员版
          </Link>
          <Link href="/notifications" className={styles.iconLink} aria-label="通知">
            <BellIcon />
          </Link>
          <Link href="/account" className={styles.profile}>
            <span>
              <GlobeIcon />
            </span>
            <strong>English Learner</strong>
          </Link>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="new-expression-title">
        <span className={styles.heroIcon}>
          <SparkleIcon />
        </span>
        <div>
          <p>自动收藏，建立自己的表达库</p>
          <h1 id="new-expression-title">新表达</h1>
          <span>把练习中遇到的好表达整理、复习、跟读，慢慢变成自己的英语。</span>
        </div>
        <div className={styles.heroStats}>
          <span>表达库 {stats.all}</span>
          <span>待复习 {stats.review}</span>
          <span>最近新增 {stats.recent}</span>
        </div>
      </section>

      <div className={styles.shell}>
        <section className={styles.libraryPanel} aria-label="我的表达库">
          <header className={styles.sectionHeader}>
            <span>
              <LibraryIcon />
            </span>
            <div>
              <p>我的表达库</p>
              <h2>查找和管理收藏表达</h2>
            </div>
          </header>

          <div className={styles.statGrid}>
            {statCards.map((card) => (
              <article className={styles.statCard} key={card.label}>
                <span>{card.label}</span>
                <strong>{card.count}</strong>
                <em>个</em>
              </article>
            ))}
          </div>

          <label className={styles.searchBox}>
            <SearchIcon />
            <span className={styles.srOnly}>搜索表达</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索表达"
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
                {tab.label}
                <span>{tab.count}</span>
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
                  <span className={styles.expressionGlyph}>
                    <SparkleIcon />
                  </span>
                  <span className={styles.expressionText}>
                    <strong>{getDisplayWord(word)}</strong>
                    <em>{getMeaning(word)}</em>
                  </span>
                  <span className={styles.statusPill} data-status={statusKind(word)}>
                    {statusLabel(word.status)}
                  </span>
                </button>
                <div className={styles.rowActions}>
                  <button
                    aria-label={`播放 ${getDisplayWord(word)}`}
                    className={styles.inlineAudioButton}
                    onClick={() => playText(word.word, 1)}
                    type="button"
                  >
                    <VolumeIcon />
                  </button>
                  <button
                    aria-expanded={openMenuWord === word.word}
                    aria-label={`${getDisplayWord(word)} 更多操作`}
                    className={styles.moreButton}
                    onClick={() =>
                      setOpenMenuWord((current) =>
                        current === word.word ? "" : word.word
                      )
                    }
                    type="button"
                  >
                    <MoreIcon />
                  </button>
                  {openMenuWord === word.word ? (
                    <div className={styles.rowMenu} role="menu">
                      <button onClick={() => openExpression(word)} role="menuitem" type="button">
                        学习此表达
                      </button>
                      <button
                        onClick={() => markExpressionMastered(word)}
                        role="menuitem"
                        type="button"
                      >
                        标为已掌握
                      </button>
                      <button onClick={() => removeExpression(word)} role="menuitem" type="button">
                        <TrashIcon />
                        删除
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}

            {!visibleWords.length ? (
              <div className={styles.emptyState}>
                <LibraryIcon />
                <strong>{query ? "没有找到匹配的表达" : "还没有收藏表达"}</strong>
                <p>在推荐表达里收藏词组或单词后，它们会出现在这里。</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.learningPanel} aria-label="学习新表达">
          <header className={styles.sectionHeader}>
            <span>
              <SparkleIcon />
            </span>
            <div>
              <p>学习新表达</p>
              <h2>跟读、理解、复习收藏表达</h2>
            </div>
          </header>

          <article className={styles.wordCard}>
            <div className={styles.cardTopline}>
              <span>单词或表达</span>
              <div className={styles.playCluster}>
                <button
                  aria-label="播放表达"
                  disabled={!hasExpressions}
                  onClick={() => playText(activeWord?.word || "", 1)}
                  type="button"
                >
                  <PlayIcon />
                </button>
                <button
                  aria-label="慢速朗读表达"
                  disabled={!hasExpressions}
                  onClick={() => playText(activeWord?.word || "", 0.75)}
                  type="button"
                >
                  <SlowIcon />
                  <strong>0.75x</strong>
                </button>
              </div>
            </div>
            <h3>{activeWordText}</h3>
            <div className={styles.wordMeta}>
              <span>{getPartOfSpeech(activeWord)}</span>
              <span>{activeWord ? statusLabel(activeWord.status) : "待学习"}</span>
              <span>
                {activeVisibleIndex >= 0 ? activeVisibleIndex + 1 : 0} /{" "}
                {visibleWords.length || words.length || 0}
              </span>
            </div>
            <div className={styles.meaningBlock}>
              <p>中文含义</p>
              <strong>{activeMeaning}</strong>
            </div>
          </article>

          <article className={styles.exampleCard}>
            <div className={styles.cardTopline}>
              <span>例句</span>
              <div className={styles.playCluster}>
                <button
                  aria-label="播放例句"
                  disabled={!hasExpressions}
                  onClick={() => playText(activeExample, 1)}
                  type="button"
                >
                  <PlayIcon />
                </button>
                <button
                  aria-label="慢速朗读例句"
                  disabled={!hasExpressions}
                  onClick={() => playText(activeExample, 0.75)}
                  type="button"
                >
                  <SlowIcon />
                  <strong>0.75x</strong>
                </button>
              </div>
            </div>
            <h3>{activeExample}</h3>
            <div className={styles.meaningBlock}>
              <p>中文翻译</p>
              <strong>{activeExampleZh}</strong>
            </div>
          </article>

          <nav className={styles.learningControls} aria-label="新表达学习控制">
            <button
              disabled={!hasExpressions}
              onClick={() => selectRelativeExpression(-1)}
              type="button"
            >
              <ChevronIcon direction="left" />
              上一句
            </button>
            <button
              disabled={!hasExpressions}
              onClick={() => playText(activeExample, 0.75)}
              type="button"
            >
              <SlowIcon />
              慢速朗读
            </button>
            <button
              disabled={!hasExpressions}
              onClick={() => selectRelativeExpression(1)}
              type="button"
            >
              下一句
              <ChevronIcon />
            </button>
          </nav>

          {activeWord ? (
            <button
              className={styles.masteredButton}
              onClick={() => markExpressionMastered(activeWord)}
              type="button"
            >
              <CheckIcon />
              标为已掌握
            </button>
          ) : (
            <Link className={styles.masteredButton} href="/free-study">
              <SparkleIcon />
              去练习并收藏表达
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
