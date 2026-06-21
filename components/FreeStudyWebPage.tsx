"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  EXPRESSION_VARIANTS_ERROR_MESSAGE,
  preservesRequiredLiteralTerms,
  validateExpressionVariantMap,
} from "@/lib/expressionVariantValidation";
import { requestExpressionVariants } from "@/lib/expressionVariantsClient";
import styles from "./FreeStudyWebPage.module.css";

const DEFAULT_CHINESE_TEXT =
  "\u90a3\u6211\u4eec\u4f11\u606f\u4e00\u4e0b\uff0c\u8fc7\u4f1a\u513f\u518d\u53bb\u6563\u6b65\u5427\u3002";
const DEFAULT_ENGLISH_TEXT = "Let's take a break, and then go for a walk later.";
const RECORD_BUTTON_LABEL = "\u70b9\u6211\uff0c\u8bf4\u4e2d\u6587";
const ENGLISH_RECORD_BUTTON_LABEL = "\u70b9\u6211\uff0c\u8bf4\u82f1\u6587";
const RETRY_ENGLISH_LABEL = "\u91cd\u65b0\u8bf4";
const EDIT_BUTTON_LABEL = "\u7f16\u8f91\u4e2d\u6587";
const DONE_BUTTON_LABEL = "\u5b8c\u6210";
const LISTENING_LABEL = "\u6b63\u5728\u542c\u2026";
const UNSUPPORTED_MESSAGE =
  "\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u8bed\u97f3\u8bc6\u522b";
const RECORDING_ERROR_MESSAGE =
  "\u6ca1\u6709\u542c\u6e05\uff0c\u8bf7\u518d\u8bd5\u4e00\u6b21";
const ENGLISH_RECORDING_ERROR_MESSAGE =
  "\u6ca1\u6709\u542c\u6e05\u82f1\u6587\uff0c\u8bf7\u91cd\u65b0\u8bf4\u4e00\u6b21";
const ENGLISH_EMPTY_HINT = "\u770b\u7740\u5de6\u4fa7\u4e2d\u6587\uff0c\u70b9\u51fb\u4e0a\u65b9\u6309\u94ae\u8bf4\u82f1\u6587";
const VARIANTS_LOADING_LABEL = "\u0041\u0049 \u6b63\u5728\u751f\u6210\u6b63\u786e\u8868\u8fbe\u2026";
const VARIANTS_EMPTY_LABEL =
  "\u8bf4\u5b8c\u82f1\u6587\u540e\uff0c\u8fd9\u91cc\u4f1a\u6839\u636e\u4e2d\u6587\u751f\u6210\u6b63\u786e\u8868\u8fbe";
const VARIANTS_SAVE_HINT =
  "\u9009\u62e9\u8bcd\u7ec4\u6216\u5355\u8bcd\uff0c\u53ef\u4ee5\u6536\u85cf\u8fdb\u8868\u8fbe\u5e93\u4e2d";
const SILENCE_END_DELAY_MS = 2000;

type ExpressionVariantKey =
  | "standard"
  | "idiomatic"
  | "simple"
  | "natural"
  | "spoken";

type ExpressionVariant = {
  key: ExpressionVariantKey;
  label: string;
  text: string;
};

type AccurateSentenceResponse = {
  english?: string;
};

const expressionVariantLabels: Array<{
  key: ExpressionVariantKey;
  label: string;
}> = [
  { key: "standard", label: "\u6700\u81ea\u7136\u5730\u9053" },
  { key: "idiomatic", label: "\u66f4\u5730\u9053" },
  { key: "simple", label: "\u66f4\u7b80\u5355" },
  { key: "natural", label: "\u66f4\u53e3\u8bed" },
  { key: "spoken", label: "\u66f4\u53e3\u8bed" },
];

function createFallbackEnglish(chinese: string) {
  const normalizedChinese = chinese.replace(/\s+/g, "");
  const hasConcert = /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50/.test(
    normalizedChinese
  );
  const hasTuesday = /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(
    normalizedChinese
  );

  if (hasTuesday && hasConcert) {
    return "Today is Tuesday, and I'm going to a concert.";
  }

  if (hasConcert) {
    return "I'm going to a concert today.";
  }

  if (hasTuesday) {
    return "Today is Tuesday.";
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    return "Let's take a break, and then go for a walk later.";
  }

  if (/\u8fd0\u52a8|\u953b\u70bc|\u7cbe\u795e|\u7761/.test(normalizedChinese)) {
    return "Exercise makes me feel energized, and I sleep really well at night.";
  }

  if (/\u6237\u5916|\u5929\u6c14|\u592a\u9633/.test(normalizedChinese)) {
    return "I want to stay outside a little longer and enjoy the weather.";
  }

  if (/\u5f00\u5fc3|\u559c\u6b22|\u4eab\u53d7|\u9ad8\u5174/.test(normalizedChinese)) {
    return "This feeling makes me happy for the whole day.";
  }

  if (/\u5403|\u997f|\u5496\u5561|\u8336|\u559d/.test(normalizedChinese)) {
    return "I want to get something nice to eat in a little while.";
  }

  return "I want to say a little more about this.";
}

function isEnglishRelevantToChinese(chinese: string, english: string) {
  const normalizedChinese = chinese.replace(/\s+/g, "");
  const normalizedEnglish = english.toLowerCase();
  const hasConcert = /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50/.test(
    normalizedChinese
  );
  const hasTuesday = /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(
    normalizedChinese
  );

  if (
    hasConcert &&
    !/(concert|gig|recital|live music|music show|performance)/.test(
      normalizedEnglish
    )
  ) {
    return false;
  }

  if (hasTuesday && !/tuesday/.test(normalizedEnglish)) {
    return false;
  }

  if (
    /\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese) &&
    !/(break|rest|walk|stroll)/.test(normalizedEnglish)
  ) {
    return false;
  }

  return true;
}

function createFallbackExpressionVariants(
  standardEnglish = "",
  chinese = DEFAULT_CHINESE_TEXT
): ExpressionVariant[] {
  const normalizedChinese = chinese.replace(/\s+/g, "");
  const hasConcert = /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50/.test(
    normalizedChinese
  );
  const hasTuesday = /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(
    normalizedChinese
  );

  if (hasTuesday && hasConcert) {
    const fallbackVariants: Record<ExpressionVariantKey, string> = {
      idiomatic: "It's Tuesday today, and I'm going to a concert.",
      natural: "It's Tuesday, and I'm going to a concert later.",
      simple: "Today is Tuesday. I'm going to a concert.",
      spoken: "Today's Tuesday, and I'm going to catch a concert.",
      standard:
        standardEnglish || "Today is Tuesday, and I'm going to a concert.",
    };

    return expressionVariantLabels.map(({ key, label }) => ({
      key,
      label,
      text: fallbackVariants[key],
    }));
  }

  if (hasConcert) {
    const fallbackVariants: Record<ExpressionVariantKey, string> = {
      idiomatic: "I'm heading to a concert today.",
      natural: "I'm going to a concert later today.",
      simple: "I'm going to a concert today.",
      spoken: "I'm going to catch a concert today.",
      standard: standardEnglish || "I'm going to a concert today.",
    };

    return expressionVariantLabels.map(({ key, label }) => ({
      key,
      label,
      text: fallbackVariants[key],
    }));
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    const fallbackVariants: Record<ExpressionVariantKey, string> = {
      idiomatic: "Let's take a break first, then go for a walk later.",
      natural: "Let's take a break, and we can go for a walk in a while.",
      simple: "Let's rest first, and then take a walk later.",
      spoken: "How about we take a break and go for a walk later?",
      standard: "Let's take a break, and then go for a walk later.",
    };

    return expressionVariantLabels.map(({ key, label }) => ({
      key,
      label,
      text: fallbackVariants[key],
    }));
  }

  const fallbackText = standardEnglish || createFallbackEnglish(chinese);

  return expressionVariantLabels.map(({ key, label }) => ({
    key,
    label,
    text: fallbackText,
  }));
}

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

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function readTranscript(
  event: SpeechRecognitionResultEventLike,
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

export default function FreeStudyWebPage() {
  const [chineseText, setChineseText] = useState(DEFAULT_CHINESE_TEXT);
  const [englishText, setEnglishText] = useState(DEFAULT_ENGLISH_TEXT);
  const [expressionVariants, setExpressionVariants] = useState<ExpressionVariant[]>(
    createFallbackExpressionVariants(DEFAULT_ENGLISH_TEXT, DEFAULT_CHINESE_TEXT)
  );
  const [isLoadingExpressionVariants, setIsLoadingExpressionVariants] =
    useState(false);
  const [expressionVariantError, setExpressionVariantError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isEnglishListening, setIsEnglishListening] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [englishStatusText, setEnglishStatusText] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chineseTextRef = useRef(chineseText);
  const englishTextRef = useRef(englishText);
  const expressionRequestRef = useRef(0);

  useEffect(() => {
    chineseTextRef.current = chineseText;
  }, [chineseText]);

  useEffect(() => {
    englishTextRef.current = englishText;
  }, [englishText]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
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

  function stopChineseRecording() {
    clearSilenceTimer();
    const currentRecognition = recognitionRef.current;
    recognitionRef.current = null;
    setIsListening(false);
    currentRecognition?.stop();
    void refreshExpressionVariants(chineseTextRef.current);
  }

  function stopEnglishRecording() {
    clearSilenceTimer();
    const currentRecognition = recognitionRef.current;
    recognitionRef.current = null;
    setIsEnglishListening(false);
    currentRecognition?.stop();
  }

  function finishChineseRecordingAfterPause() {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      const currentRecognition = recognitionRef.current;
      recognitionRef.current = null;
      silenceTimerRef.current = null;
      setIsListening(false);
      currentRecognition?.stop();
      void refreshExpressionVariants(chineseTextRef.current);
    }, SILENCE_END_DELAY_MS);
  }

  function finishEnglishRecordingAfterPause() {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      const currentRecognition = recognitionRef.current;
      recognitionRef.current = null;
      silenceTimerRef.current = null;
      setIsEnglishListening(false);
      currentRecognition?.stop();
      void generateExpressionVariants(englishTextRef.current);
    }, SILENCE_END_DELAY_MS);
  }

  async function loadAccurateEnglish(chinese: string) {
    try {
      const response = await fetch("/api/accurate-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chinese }),
      });
      const data = (await response.json()) as AccurateSentenceResponse;
      const english =
        response.ok && typeof data.english === "string"
          ? data.english.trim()
          : "";

      return english && isEnglishRelevantToChinese(chinese, english)
        && preservesRequiredLiteralTerms(chinese, english)
        ? english
        : "";
    } catch {
      return "";
    }
  }

  async function refreshExpressionVariants(chineseInput: string, userEnglish = "") {
    const chinese = chineseInput.trim();
    const learnerEnglish = userEnglish.trim();

    if (!chinese) {
      return;
    }

    const requestId = expressionRequestRef.current + 1;
    expressionRequestRef.current = requestId;
    setIsLoadingExpressionVariants(true);
    setExpressionVariantError("");

    const authoritativeEnglish = await loadAccurateEnglish(chinese);

    if (expressionRequestRef.current !== requestId) {
      return;
    }

    if (!learnerEnglish) {
      setEnglishText(authoritativeEnglish);
      englishTextRef.current = authoritativeEnglish;
    }

    try {
      const { data, response } =
        await requestExpressionVariants<ExpressionVariantKey>({
          chinese,
          userEnglish: learnerEnglish || authoritativeEnglish,
          standardEnglish: authoritativeEnglish,
          variantKeys: expressionVariantLabels.map(({ key }) => key),
        });

      if (expressionRequestRef.current !== requestId) {
        return;
      }

      if (
        !response.ok ||
        data.source === "fallback" ||
        !validateExpressionVariantMap(
          data.variants || {},
          expressionVariantLabels.map(({ key }) => key),
          { chinese }
        )
      ) {
        setExpressionVariants([]);
        setExpressionVariantError(
          data.message || EXPRESSION_VARIANTS_ERROR_MESSAGE
        );
        return;
      }

      const nextVariants = expressionVariantLabels.map(({ key, label }) => {
        const responseText =
          typeof data.variants?.[key] === "string" &&
          data.variants[key]?.trim()
            ? data.variants[key]!.trim()
            : "";

        return {
          key,
          label,
          text:
            responseText &&
            isEnglishRelevantToChinese(chinese, responseText) &&
            preservesRequiredLiteralTerms(chinese, responseText)
              ? responseText
              : "",
        };
      });

      if (nextVariants.some((variant) => !variant.text)) {
        setExpressionVariants([]);
        setExpressionVariantError(EXPRESSION_VARIANTS_ERROR_MESSAGE);
        return;
      }

      setExpressionVariants(nextVariants);
    } catch {
      if (expressionRequestRef.current === requestId) {
        setExpressionVariants([]);
        setExpressionVariantError(EXPRESSION_VARIANTS_ERROR_MESSAGE);
      }
    } finally {
      if (expressionRequestRef.current === requestId) {
        setIsLoadingExpressionVariants(false);
      }
    }
  }

  async function generateExpressionVariants(userEnglish: string) {
    await refreshExpressionVariants(chineseTextRef.current, userEnglish);
  }

  function playExpression(text: string, rate = 1) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function startChineseRecording() {
    if (isListening) {
      stopChineseRecording();
      return;
    }

    if (isEnglishListening) {
      stopEnglishRecording();
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
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = readTranscript(event);

        if (transcript) {
          setChineseText(transcript);
          chineseTextRef.current = transcript;
          finishChineseRecordingAfterPause();
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setStatusText(RECORDING_ERROR_MESSAGE);

        if (recognitionRef.current === recognition) {
          clearSilenceTimer();
          recognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        if (silenceTimerRef.current !== null && recognitionRef.current === recognition) {
          try {
            recognition.start();
            return;
          } catch {}
        }

        setIsListening(false);

        if (recognitionRef.current === recognition) {
          clearSilenceTimer();
          recognitionRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      setIsListening(true);
      recognition.start();
    } catch {
      clearSilenceTimer();
      setIsListening(false);
      setStatusText(RECORDING_ERROR_MESSAGE);
      recognitionRef.current = null;
    }
  }

  function startEnglishRecording({ reset = false }: { reset?: boolean } = {}) {
    if (isEnglishListening) {
      if (reset) {
        setEnglishText("");
        englishTextRef.current = "";
      }

      return;
    }

    if (isListening) {
      stopChineseRecording();
    }

    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setEnglishStatusText(UNSUPPORTED_MESSAGE);
      return;
    }

    setIsEditing(false);
    setEnglishStatusText("");

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
        setIsEnglishListening(false);
        setEnglishStatusText(ENGLISH_RECORDING_ERROR_MESSAGE);

        if (recognitionRef.current === recognition) {
          clearSilenceTimer();
          recognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        if (silenceTimerRef.current !== null && recognitionRef.current === recognition) {
          try {
            recognition.start();
            return;
          } catch {}
        }

        setIsEnglishListening(false);

        if (recognitionRef.current === recognition) {
          clearSilenceTimer();
          recognitionRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      setIsEnglishListening(true);
      recognition.start();
    } catch {
      clearSilenceTimer();
      setIsEnglishListening(false);
      setEnglishStatusText(ENGLISH_RECORDING_ERROR_MESSAGE);
      recognitionRef.current = null;
    }
  }

  function retryEnglishRecording() {
    if (isEnglishListening) {
      setEnglishText("");
      englishTextRef.current = "";
      return;
    }

    startEnglishRecording({ reset: true });
  }

  function startEditing() {
    if (isListening) {
      stopChineseRecording();
    }

    if (isEnglishListening) {
      stopEnglishRecording();
    }

    setStatusText("");
    setIsEditing(true);
  }

  function toggleEditing() {
    if (isEditing) {
      setIsEditing(false);
      chineseTextRef.current = chineseText;
      void refreshExpressionVariants(chineseText);
      return;
    }

    startEditing();
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar} aria-label="SpeakFlow 顶部导航">
        <Link href="/" className={styles.brand} aria-label="返回 SpeakFlow 首页">
          <span className={styles.brandMark} aria-hidden="true">
            <svg viewBox="0 0 40 40" focusable="false">
              <circle cx="20" cy="20" r="20" />
              <path d="M12 21v-4M17 26V13M22 29V10M27 25V15M32 21v-4" />
            </svg>
          </span>
          <span>SpeakFlow</span>
        </Link>
        <nav className={styles.nav} aria-label="主要导航">
          <Link href="/">首页</Link>
          <div className={styles.learningMenu}>
            <button type="button" className={styles.learningButton} aria-haspopup="menu">
              开始学习
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="m5 8 5 5 5-5" />
              </svg>
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
          <Link href="/new-expressions">我的表达</Link>
          <Link href="/create-course">创建课程</Link>
          <Link href="/about">关于我们</Link>
          <Link href="/contact">联系我们</Link>
        </nav>
        <div className={styles.topActions}>
          <Link href="/subscription" className={styles.upgradeLink}>
            <span aria-hidden="true">✦</span>
            会员版
          </Link>
          <Link href="/notifications" className={styles.iconLink} aria-label="通知">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </Link>
          <Link href="/account" className={styles.profileLink}>
            <span>EN</span>
            <strong>English Learner</strong>
          </Link>
        </div>
      </header>

      <section className={styles.workspace} aria-label="自由学习工作台">
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>自由学习</p>
            <h1>想到什么，就练什么</h1>
            <p>
              先把中文想法说出来，再用英文表达。AI 会帮你生成自然、地道、可直接开口练习的说法。
            </p>
          </div>
          <div className={styles.flowSummary} aria-label="学习流程">
            <span>1 说中文</span>
            <span>2 练英文</span>
            <span>3 收藏表达</span>
          </div>
        </div>

        <section className={styles.inputGrid} aria-label="中文与英文表达">
          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <span className={styles.stepLabel}>第一步</span>
                <h2>中文输入结果</h2>
              </div>
              <button
                type="button"
                className={`${styles.primaryButton} ${
                  isListening ? styles.isListening : ""
                }`}
                onClick={startChineseRecording}
                aria-label={RECORD_BUTTON_LABEL}
                aria-pressed={isListening}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <path d="M12 19v3" />
                </svg>
                <span>{isListening ? LISTENING_LABEL : RECORD_BUTTON_LABEL}</span>
              </button>
            </header>

            <div
              className={styles.textSurface}
              onClick={isEditing ? undefined : startEditing}
              role="presentation"
            >
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  className={styles.chineseTextarea}
                  value={chineseText}
                  onChange={(event) => {
                    const nextChineseText = event.target.value;
                    setChineseText(nextChineseText);
                    chineseTextRef.current = nextChineseText;
                  }}
                  aria-label={EDIT_BUTTON_LABEL}
                />
              ) : (
                <p className={styles.chineseText}>{chineseText}</p>
              )}
            </div>

            <footer className={styles.panelFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleEditing();
                }}
                aria-label={isEditing ? DONE_BUTTON_LABEL : EDIT_BUTTON_LABEL}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                </svg>
                <span>{isEditing ? DONE_BUTTON_LABEL : EDIT_BUTTON_LABEL}</span>
              </button>
              {statusText ? (
                <span className={styles.statusText} aria-live="polite">
                  {statusText}
                </span>
              ) : null}
            </footer>
          </article>

          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <span className={styles.stepLabel}>第二步</span>
                <h2>英文表达结果</h2>
              </div>
              <button
                type="button"
                className={`${styles.primaryButton} ${
                  isEnglishListening ? styles.isListening : ""
                }`}
                onClick={() => startEnglishRecording()}
                aria-label={ENGLISH_RECORD_BUTTON_LABEL}
                aria-pressed={isEnglishListening}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <path d="M12 19v3" />
                </svg>
                <span>
                  {isEnglishListening ? LISTENING_LABEL : ENGLISH_RECORD_BUTTON_LABEL}
                </span>
              </button>
            </header>

            <div className={styles.textSurface}>
              <p
                className={`${styles.englishText} ${
                  englishText ? "" : styles.englishPlaceholder
                }`}
              >
                {englishText || ENGLISH_EMPTY_HINT}
              </p>
            </div>

            <footer className={styles.panelFooter}>
              <button
                type="button"
                className={styles.ghostButton}
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
              {englishStatusText ? (
                <span className={styles.statusText} aria-live="polite">
                  {englishStatusText}
                </span>
              ) : null}
              {isEnglishListening ? (
                <span className={styles.statusText} aria-live="polite">
                  {LISTENING_LABEL}
                </span>
              ) : null}
            </footer>
          </article>
        </section>

        <section className={styles.resultGrid} aria-label="推荐表达与 AI 练习">
          <article className={styles.variantsPanel}>
            <header className={styles.variantsHeader}>
              <div>
                <span className={styles.stepLabel}>第三步</span>
                <h2>推荐表达 <em>AI 优化结果</em></h2>
              </div>
              <p>{VARIANTS_SAVE_HINT}</p>
            </header>

            <div className={styles.variantStateStack}>
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
            </div>

            <div className={styles.variantList}>
              {expressionVariants.map((variant) => (
                <article
                  className={styles.variantCard}
                  data-variant={variant.key}
                  key={variant.key}
                >
                  <span className={styles.variantLabel}>{variant.label}</span>
                  <strong>{variant.text}</strong>
                  <div className={styles.variantActions}>
                    <button
                      type="button"
                      className={styles.variantPlayButton}
                      onClick={() => playExpression(variant.text)}
                      aria-label={`播放 ${variant.label}`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M8 5v14l11-7-11-7Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={styles.variantSlowButton}
                      onClick={() => playExpression(variant.text, 0.75)}
                      aria-label={`慢速播放 ${variant.label}`}
                    >
                      0.75x
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className={styles.practiceCoach}>
            <span className={styles.stepLabel}>第四步</span>
            <h2>AI 帮我练</h2>
            <p>
              不知道下一句怎么接？让 AI 给你情境提示和追问，把一句表达延展成真实对话。
            </p>
            <Link href="/ai-guided-expression" className={styles.coachButton}>
              进入 AI 引导表达
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </Link>
          </aside>
        </section>
      </section>
    </main>
  );
}
