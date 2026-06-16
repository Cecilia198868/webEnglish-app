"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./AiGuidedExpressionWebPage.module.css";

const PAGE_ART_WIDTH = 1713;
const PAGE_ART_HEIGHT = 2240;
const PAGE_ART_SRC =
  "/image3/%41%49%E5%BC%95%E5%AF%BC%E8%A1%A8%E8%BE%BE.png";
const DEFAULT_CHINESE_TEXT =
  "\u90a3\u6211\u4eec\u4f11\u606f\u4e00\u4e0b\uff0c\u8fc7\u4f1a\u513f\u518d\u53bb\u6563\u6b65\u5427\u3002";
const DEFAULT_ENGLISH_TEXT = "Let's have a rest, and then we can go hiking.";
const DEFAULT_NEXT_CHINESE =
  "\u8fd0\u52a8\u8ba9\u6211\u611f\u89c9\u7cbe\u795e\u5145\u6c9b\uff0c\u665a\u4e0a\u7761\u5f97\u7279\u522b\u597d\u3002";
const RECORD_BUTTON_LABEL = "\u70b9\u6211\uff0c\u8bf4\u4e2d\u6587";
const ENGLISH_RECORD_BUTTON_LABEL = "\u70b9\u6211\uff0c\u8bf4\u82f1\u6587";
const RETRY_ENGLISH_LABEL = "\u91cd\u65b0\u8bf4";
const EDIT_BUTTON_LABEL = "\u7f16\u8f91\u4e2d\u6587";
const DONE_BUTTON_LABEL = "\u5b8c\u6210";
const NEXT_PROMPT_KICKER_LABEL =
  "\u2726 \u4e0b\u4e00\u53e5\uff0c\u53ef\u4ee5\u8fd9\u6837\u8bf4";
const USE_NEXT_LABEL = "\u7528\u8fd9\u53e5\u7ec3\u4e60";
const CHANGE_NEXT_LABEL = "\u6362\u4e00\u53e5";
const LISTENING_LABEL = "\u6b63\u5728\u542c\u2026";
const UNSUPPORTED_MESSAGE =
  "\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u8bed\u97f3\u8bc6\u522b";
const RECORDING_ERROR_MESSAGE =
  "\u6ca1\u6709\u542c\u6e05\uff0c\u8bf7\u518d\u8bd5\u4e00\u6b21";
const ENGLISH_RECORDING_ERROR_MESSAGE =
  "\u6ca1\u6709\u542c\u6e05\u82f1\u6587\uff0c\u8bf7\u91cd\u65b0\u8bf4\u4e00\u6b21";
const ENGLISH_EMPTY_HINT = "\u70b9\u51fb\u4e0a\u65b9\u6309\u94ae\u5f00\u59cb\u8bf4\u82f1\u6587";
const VARIANTS_LOADING_LABEL = "\u0041\u0049 \u6b63\u5728\u751f\u6210\u6b63\u786e\u8868\u8fbe\u2026";
const VARIANTS_ERROR_LABEL =
  "\u0041\u0049 \u751f\u6210\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u8bf4\u82f1\u6587\u540e\u518d\u8bd5";
const VARIANTS_EMPTY_LABEL =
  "\u8bf4\u5b8c\u82f1\u6587\u540e\uff0c\u8fd9\u91cc\u4f1a\u6839\u636e\u5de6\u4fa7\u4e2d\u6587\u751f\u6210\u6b63\u786e\u8868\u8fbe";
const NEXT_LOADING_LABEL = "\u0041\u0049 \u6b63\u5728\u60f3\u4e0b\u4e00\u53e5\u2026";
const NEXT_ERROR_LABEL =
  "\u6ca1\u60f3\u5230\u65b0\u53e5\u5b50\uff0c\u518d\u70b9\u4e00\u6b21\u8bd5\u8bd5";
const SILENCE_END_DELAY_MS = 2000;

type ActiveRecorder = "chinese" | "english" | null;
type ExpressionVariantKey = "standard" | "idiomatic" | "simple" | "natural";

type ExpressionVariant = {
  key: ExpressionVariantKey;
  label: string;
  text: string;
};

type ExpressionVariantsResponse = {
  variants?: Partial<Record<ExpressionVariantKey, string>>;
};

type AccurateSentenceResponse = {
  english?: string;
};

type GuidedTurn = {
  chinese: string;
  userEnglish: string;
  recommendedEnglish: string;
};

type FollowupResponse = {
  suggestion?: string;
};

type LocalSpeechRecognitionResult = {
  readonly 0?: {
    readonly transcript?: string;
  };
};

type LocalSpeechRecognitionEvent = {
  readonly results: ArrayLike<LocalSpeechRecognitionResult>;
};

type LocalSpeechRecognizer = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  abort: () => void;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: LocalSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type LocalSpeechRecognizerConstructor = new () => LocalSpeechRecognizer;

type Hotspot = {
  href: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: "nav" | "button";
};

const learningMenuHotspot: Omit<Hotspot, "href"> = {
  label: "Start learning menu",
  x: 505,
  y: 48,
  width: 154,
  height: 62,
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

const expressionVariantLabels: Array<{
  key: ExpressionVariantKey;
  label: string;
}> = [
  { key: "standard", label: "\u6807\u51c6\u51c6\u786e" },
  { key: "idiomatic", label: "\u66f4\u5730\u9053" },
  { key: "simple", label: "\u66f4\u7b80\u5355" },
  { key: "natural", label: "\u66f4\u53e3\u8bed" },
];

function createFallbackExpressionVariants(standardEnglish: string): ExpressionVariant[] {
  const fallbackText = standardEnglish || DEFAULT_ENGLISH_TEXT;

  return expressionVariantLabels.map(({ key, label }) => ({
    key,
    label,
    text: fallbackText,
  }));
}

const hotspots: Hotspot[] = [
  { href: "/", label: "SpeakFlow home", x: 50, y: 34, width: 265, height: 82, kind: "nav" },
  { href: "/", label: "Home", x: 390, y: 50, width: 82, height: 60, kind: "nav" },
  {
    href: "/new-expressions",
    label: "My expressions",
    x: 680,
    y: 50,
    width: 125,
    height: 60,
    kind: "nav",
  },
  {
    href: "/create-course",
    label: "Create course",
    x: 824,
    y: 50,
    width: 125,
    height: 60,
    kind: "nav",
  },
  {
    href: "/menu?panel=about",
    label: "About",
    x: 982,
    y: 50,
    width: 120,
    height: 60,
    kind: "nav",
  },
  {
    href: "/menu?panel=help",
    label: "Contact",
    x: 1122,
    y: 50,
    width: 130,
    height: 60,
    kind: "nav",
  },
  {
    href: "/account",
    label: "Upgrade",
    x: 1320,
    y: 45,
    width: 118,
    height: 66,
    kind: "nav",
  },
  {
    href: "/notifications",
    label: "Notifications",
    x: 1450,
    y: 45,
    width: 60,
    height: 66,
    kind: "nav",
  },
  {
    href: "/languages",
    label: "Language",
    x: 1514,
    y: 40,
    width: 170,
    height: 76,
    kind: "nav",
  },
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

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;

  const speechWindow = window as unknown as {
    SpeechRecognition?: LocalSpeechRecognizerConstructor;
    webkitSpeechRecognition?: LocalSpeechRecognizerConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function readTranscript(
  event: LocalSpeechRecognitionEvent,
  separator: "" | " " = ""
) {
  const parts: string[] = [];

  for (let index = 0; index < event.results.length; index += 1) {
    const transcript = event.results[index]?.[0]?.transcript?.trim();

    if (transcript) {
      parts.push(transcript);
    }
  }

  return parts.join(separator).trim();
}

export default function AiGuidedExpressionWebPage() {
  const [chineseText, setChineseText] = useState(DEFAULT_CHINESE_TEXT);
  const [englishText, setEnglishText] = useState(DEFAULT_ENGLISH_TEXT);
  const [nextChinese, setNextChinese] = useState(DEFAULT_NEXT_CHINESE);
  const [expressionVariants, setExpressionVariants] = useState<ExpressionVariant[]>(
    createFallbackExpressionVariants(DEFAULT_ENGLISH_TEXT)
  );
  const [isLoadingExpressionVariants, setIsLoadingExpressionVariants] =
    useState(false);
  const [expressionVariantError, setExpressionVariantError] = useState("");
  const [isLoadingNextChinese, setIsLoadingNextChinese] = useState(false);
  const [nextChineseError, setNextChineseError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeRecorder, setActiveRecorder] = useState<ActiveRecorder>(null);
  const [statusText, setStatusText] = useState("");
  const [englishStatusText, setEnglishStatusText] = useState("");
  const recognitionRef = useRef<LocalSpeechRecognizer | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chineseTextRef = useRef(chineseText);
  const englishTextRef = useRef(englishText);
  const currentPracticeChineseRef = useRef(DEFAULT_CHINESE_TEXT);
  const nextChineseRef = useRef(nextChinese);
  const turnsRef = useRef<GuidedTurn[]>([]);
  const isChineseListening = activeRecorder === "chinese";
  const isEnglishListening = activeRecorder === "english";

  useEffect(() => {
    chineseTextRef.current = chineseText;
  }, [chineseText]);

  useEffect(() => {
    englishTextRef.current = englishText;
  }, [englishText]);

  useEffect(() => {
    nextChineseRef.current = nextChinese;
  }, [nextChinese]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  function clearSilenceTimer() {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  function stopListening() {
    clearSilenceTimer();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setActiveRecorder(null);
  }

  async function loadAccurateEnglish(chinese: string) {
    try {
      const response = await fetch("/api/accurate-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chinese }),
      });
      const data = (await response.json()) as AccurateSentenceResponse;

      return response.ok && typeof data.english === "string"
        ? data.english.trim()
        : "";
    } catch {
      return "";
    }
  }

  async function generateExpressionVariants(
    userEnglish: string,
    sourceChinese = currentPracticeChineseRef.current
  ) {
    const chinese = sourceChinese.trim();
    const learnerEnglish = userEnglish.trim();

    if (!chinese || !learnerEnglish) {
      return "";
    }

    setIsLoadingExpressionVariants(true);
    setExpressionVariantError("");

    const standardEnglish = await loadAccurateEnglish(chinese);
    const fallbackVariants = createFallbackExpressionVariants(standardEnglish);

    try {
      const response = await fetch("/api/expression-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chinese,
          userEnglish: learnerEnglish,
          standardEnglish,
        }),
      });
      const data = (await response.json()) as ExpressionVariantsResponse;

      if (!response.ok || !data.variants) {
        setExpressionVariants(fallbackVariants);
        setExpressionVariantError(VARIANTS_ERROR_LABEL);
        return fallbackVariants[0]?.text || standardEnglish || DEFAULT_ENGLISH_TEXT;
      }

      const nextVariants = expressionVariantLabels.map(({ key, label }) => ({
        key,
        label,
        text:
          typeof data.variants?.[key] === "string" &&
          data.variants[key]?.trim()
            ? data.variants[key]!.trim()
            : fallbackVariants.find((variant) => variant.key === key)?.text || "",
      }));

      setExpressionVariants(nextVariants);
      return (
        nextVariants[0]?.text ||
        fallbackVariants[0]?.text ||
        standardEnglish ||
        DEFAULT_ENGLISH_TEXT
      );
    } catch {
      setExpressionVariants(fallbackVariants);
      setExpressionVariantError(VARIANTS_ERROR_LABEL);
      return fallbackVariants[0]?.text || standardEnglish || DEFAULT_ENGLISH_TEXT;
    } finally {
      setIsLoadingExpressionVariants(false);
    }
  }

  async function loadNextChineseSuggestion({
    sourceChinese,
    userEnglish,
    recommendedEnglish,
  }: {
    sourceChinese: string;
    userEnglish: string;
    recommendedEnglish: string;
  }) {
    const currentChinese = sourceChinese.trim();

    if (!currentChinese) {
      return;
    }

    setIsLoadingNextChinese(true);
    setNextChineseError("");

    try {
      const response = await fetch("/api/expression-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentChinese,
          userEnglish: userEnglish.trim(),
          recommendedEnglish: recommendedEnglish.trim(),
          turns: turnsRef.current,
        }),
      });
      const data = (await response.json()) as FollowupResponse;
      const suggestion =
        response.ok && typeof data.suggestion === "string"
          ? data.suggestion.trim()
          : "";

      if (suggestion) {
        setNextChinese(suggestion);
        nextChineseRef.current = suggestion;
        return;
      }

      setNextChineseError(NEXT_ERROR_LABEL);
    } catch {
      setNextChineseError(NEXT_ERROR_LABEL);
    } finally {
      setIsLoadingNextChinese(false);
    }
  }

  function finishEnglishRecordingAfterPause() {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      const currentRecognition = recognitionRef.current;
      recognitionRef.current = null;
      silenceTimerRef.current = null;
      setActiveRecorder(null);
      currentRecognition?.stop();
      void (async () => {
        const sourceChinese = currentPracticeChineseRef.current.trim();
        const learnerEnglish = englishTextRef.current.trim();
        const recommendedEnglish = await generateExpressionVariants(
          learnerEnglish,
          sourceChinese
        );

        if (sourceChinese && recommendedEnglish) {
          turnsRef.current = [
            ...turnsRef.current,
            {
              chinese: sourceChinese,
              userEnglish: learnerEnglish,
              recommendedEnglish,
            },
          ].slice(-6);
        }

        await loadNextChineseSuggestion({
          sourceChinese,
          userEnglish: learnerEnglish,
          recommendedEnglish,
        });
      })();
    }, SILENCE_END_DELAY_MS);
  }

  function startChineseRecording() {
    if (isChineseListening) {
      stopListening();
      return;
    }

    if (isEnglishListening) {
      stopListening();
    }

    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setStatusText(UNSUPPORTED_MESSAGE);
      return;
    }

    setIsEditing(false);
    setStatusText("");

    try {
      const recognition = new Recognition();
      recognition.lang = "zh-CN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = readTranscript(event);

        if (transcript) {
          setChineseText(transcript);
        }
      };

      recognition.onerror = () => {
        setActiveRecorder(null);
        setStatusText(RECORDING_ERROR_MESSAGE);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setActiveRecorder(null);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      setActiveRecorder("chinese");
      recognition.start();
    } catch {
      setActiveRecorder(null);
      setStatusText(RECORDING_ERROR_MESSAGE);
      recognitionRef.current = null;
    }
  }

  function startEnglishRecording({
    reset = false,
    sourceChinese,
  }: {
    reset?: boolean;
    sourceChinese?: string;
  } = {}) {
    if (isEnglishListening || recognitionRef.current) {
      return;
    }

    if (isChineseListening) {
      stopListening();
    }

    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setEnglishStatusText(UNSUPPORTED_MESSAGE);
      return;
    }

    setIsEditing(false);
    setEnglishStatusText("");

    const nextPracticeChinese = sourceChinese?.trim();

    if (nextPracticeChinese) {
      currentPracticeChineseRef.current = nextPracticeChinese;
    }

    if (reset) {
      setEnglishText("");
      englishTextRef.current = "";
    }

    try {
      const recognition = new Recognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = readTranscript(event, " ");

        if (transcript) {
          setEnglishText(transcript);
          englishTextRef.current = transcript;
          finishEnglishRecordingAfterPause();
        }
      };

      recognition.onerror = () => {
        clearSilenceTimer();
        setActiveRecorder(null);
        setEnglishStatusText(ENGLISH_RECORDING_ERROR_MESSAGE);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        if (silenceTimerRef.current !== null && recognitionRef.current === recognition) {
          try {
            recognition.start();
            return;
          } catch {}
        }

        clearSilenceTimer();
        setActiveRecorder(null);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      setActiveRecorder("english");
      recognition.start();
    } catch {
      clearSilenceTimer();
      setActiveRecorder(null);
      setEnglishStatusText(ENGLISH_RECORDING_ERROR_MESSAGE);
      recognitionRef.current = null;
    }
  }

  function toggleEditing() {
    if (activeRecorder) {
      stopListening();
    }

    setStatusText("");
    setIsEditing((current) => !current);
  }

  function retryEnglishRecording() {
    startEnglishRecording({
      reset: true,
      sourceChinese: currentPracticeChineseRef.current || chineseTextRef.current,
    });
  }

  function useNextChineseForPractice() {
    const sentence = nextChineseRef.current.trim();

    if (!sentence) {
      return;
    }

    startEnglishRecording({
      reset: true,
      sourceChinese: sentence,
    });
  }

  function changeNextChinese() {
    if (isLoadingNextChinese) {
      return;
    }

    void loadNextChineseSuggestion({
      sourceChinese: currentPracticeChineseRef.current || chineseTextRef.current,
      userEnglish: englishTextRef.current,
      recommendedEnglish: expressionVariants[0]?.text || "",
    });
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>SpeakFlow AI guided expression</h1>
      <div className={styles.artboard} aria-label="SpeakFlow AI guided expression">
        <Image
          src={PAGE_ART_SRC}
          alt="SpeakFlow AI guided expression design"
          width={PAGE_ART_WIDTH}
          height={PAGE_ART_HEIGHT}
          sizes="(max-width: 1713px) 100vw, 1713px"
          priority
          unoptimized
          className={styles.pageArt}
        />
        <nav className={styles.hotspots} aria-label="AI expression page navigation">
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
        <button
          type="button"
          className={`${styles.recordButton} ${
            isChineseListening ? styles.isListening : ""
          }`}
          onClick={startChineseRecording}
          aria-label={RECORD_BUTTON_LABEL}
          aria-pressed={isChineseListening}
        >
          {isChineseListening ? (
            <span className={styles.recordButtonState}>{LISTENING_LABEL}</span>
          ) : (
            <span className={styles.srOnly}>{RECORD_BUTTON_LABEL}</span>
          )}
        </button>
        <section className={styles.chineseBox} aria-label={RECORD_BUTTON_LABEL}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              className={styles.chineseTextarea}
              value={chineseText}
              onChange={(event) => setChineseText(event.target.value)}
              aria-label={EDIT_BUTTON_LABEL}
            />
          ) : (
            <p className={styles.chineseText}>{chineseText}</p>
          )}
          {statusText ? (
            <span className={styles.statusText} aria-live="polite">
              {statusText}
            </span>
          ) : null}
          <button
            type="button"
            className={styles.editChineseButton}
            onClick={toggleEditing}
            aria-label={isEditing ? DONE_BUTTON_LABEL : EDIT_BUTTON_LABEL}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
            </svg>
            <span>{isEditing ? DONE_BUTTON_LABEL : EDIT_BUTTON_LABEL}</span>
          </button>
        </section>
        <button
          type="button"
          className={`${styles.englishRecordButton} ${
            isEnglishListening ? styles.isListening : ""
          }`}
          onClick={() => startEnglishRecording({ sourceChinese: chineseText })}
          aria-label={ENGLISH_RECORD_BUTTON_LABEL}
          aria-pressed={isEnglishListening}
        >
          {isEnglishListening ? (
            <span className={styles.recordButtonState}>{LISTENING_LABEL}</span>
          ) : (
            <span className={styles.srOnly}>{ENGLISH_RECORD_BUTTON_LABEL}</span>
          )}
        </button>
        <section className={styles.englishBox} aria-label={ENGLISH_RECORD_BUTTON_LABEL}>
          <p
            className={`${styles.englishText} ${
              englishText ? "" : styles.englishPlaceholder
            }`}
          >
            {englishText || ENGLISH_EMPTY_HINT}
          </p>
          {englishStatusText ? (
            <span className={styles.englishStatusText} aria-live="polite">
              {englishStatusText}
            </span>
          ) : null}
          {isEnglishListening ? (
            <span className={styles.englishListeningStatus} aria-live="polite">
              {LISTENING_LABEL}
            </span>
          ) : null}
          <button
            type="button"
            className={styles.retryEnglishButton}
            onClick={retryEnglishRecording}
            aria-label={RETRY_ENGLISH_LABEL}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M20 11a8 8 0 0 0-14.6-4.5L4 8" />
              <path d="M4 4v4h4" />
              <path d="M4 13a8 8 0 0 0 14.6 4.5L20 16" />
              <path d="M20 20v-4h-4" />
            </svg>
            <span>{RETRY_ENGLISH_LABEL}</span>
          </button>
        </section>
        <section className={styles.variantPanel} aria-label="AI expression variants">
          {isLoadingExpressionVariants ? (
            <div className={styles.variantLoading} aria-live="polite">
              {VARIANTS_LOADING_LABEL}
            </div>
          ) : null}
          {expressionVariantError ? (
            <div className={styles.variantError} aria-live="polite">
              {expressionVariantError}
            </div>
          ) : null}
          {!isLoadingExpressionVariants && !expressionVariants.length ? (
            <div className={styles.variantEmpty}>{VARIANTS_EMPTY_LABEL}</div>
          ) : null}
          <div className={styles.variantList}>
            {expressionVariants.map((variant, index) => (
              <article
                className={styles.variantCard}
                data-variant={variant.key}
                key={variant.key}
              >
                <span className={styles.variantIcon} aria-hidden="true">
                  {index + 1}
                </span>
                <span className={styles.variantCopy}>
                  <span className={styles.variantLabel}>{variant.label}</span>
                  <strong>{variant.text}</strong>
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.nextPromptPanel} aria-label={NEXT_PROMPT_KICKER_LABEL}>
          <span className={styles.nextPromptKicker}>{NEXT_PROMPT_KICKER_LABEL}</span>
          <p className={styles.nextPromptText}>{nextChinese}</p>
          {isLoadingNextChinese ? (
            <span className={styles.nextPromptStatus} aria-live="polite">
              {NEXT_LOADING_LABEL}
            </span>
          ) : null}
          {nextChineseError ? (
            <span className={styles.nextPromptError} aria-live="polite">
              {nextChineseError}
            </span>
          ) : null}
          <button
            type="button"
            className={styles.useNextButton}
            onClick={useNextChineseForPractice}
            aria-label={USE_NEXT_LABEL}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
              <path d="M19 11a7 7 0 0 1-14 0" />
              <path d="M12 18v4" />
              <path d="M8 22h8" />
            </svg>
            <span>{USE_NEXT_LABEL}</span>
          </button>
          <button
            type="button"
            className={styles.changeNextButton}
            onClick={changeNextChinese}
            disabled={isLoadingNextChinese}
            aria-label={CHANGE_NEXT_LABEL}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M20 11a8 8 0 0 0-14.6-4.5L4 8" />
              <path d="M4 4v4h4" />
              <path d="M4 13a8 8 0 0 0 14.6 4.5L20 16" />
              <path d="M20 20v-4h-4" />
            </svg>
            <span>{CHANGE_NEXT_LABEL}</span>
          </button>
        </section>
      </div>
    </main>
  );
}
