"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  EXPRESSION_VARIANTS_ERROR_MESSAGE,
  preservesRequiredLiteralTerms,
  validateExpressionVariantMap,
} from "@/lib/expressionVariantValidation";
import { requestExpressionVariants } from "@/lib/expressionVariantsClient";
import styles from "./AiGuidedExpressionWebPage.module.css";

const DEFAULT_CHINESE_TEXT =
  "\u90a3\u6211\u4eec\u4f11\u606f\u4e00\u4e0b\uff0c\u8fc7\u4f1a\u513f\u518d\u53bb\u6563\u6b65\u5427\u3002";
const DEFAULT_ENGLISH_TEXT = "Let's take a break, and then go for a walk later.";
const DEFAULT_NEXT_CHINESE =
  "\u4f11\u606f\u4e4b\u540e\uff0c\u6211\u4eec\u53ef\u4ee5\u53bb\u9644\u8fd1\u6563\u6563\u6b65\u3002";
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
const VARIANTS_EMPTY_LABEL =
  "\u8bf4\u5b8c\u82f1\u6587\u540e\uff0c\u8fd9\u91cc\u4f1a\u6839\u636e\u5de6\u4fa7\u4e2d\u6587\u751f\u6210\u6b63\u786e\u8868\u8fbe";
const VARIANTS_SAVE_HINT =
  "\u9009\u62e9\u8bcd\u7ec4\u6216\u5355\u8bcd\uff0c\u53ef\u4ee5\u6536\u85cf\u8fdb\u8868\u8fbe\u5e93\u4e2d";
const NEXT_LOADING_LABEL = "\u0041\u0049 \u6b63\u5728\u60f3\u4e0b\u4e00\u53e5\u2026";
const SILENCE_END_DELAY_MS = 2000;

type ActiveRecorder = "chinese" | "english" | null;
type ExpressionVariantKey = "standard" | "idiomatic" | "simple" | "natural";

type ExpressionVariant = {
  key: ExpressionVariantKey;
  label: string;
  text: string;
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

function createFallbackEnglish(chinese: string) {
  const normalizedChinese = chinese.replace(/\s+/g, "");
  const hasConcert = /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
    normalizedChinese
  );
  const hasTuesday = /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(
    normalizedChinese
  );
  const hasCentralPark = /\u4e2d\u592e\u516c\u56ed|centralpark/i.test(
    normalizedChinese
  );
  const hasWe = /\u6211\u4eec|\u54b1\u4eec/.test(normalizedChinese);

  if (hasConcert && hasCentralPark) {
    const subject = hasWe ? "we're" : "I'm";
    const subjectFull = hasWe ? "We're" : "I'm";

    if (hasTuesday) {
      return `Today is Tuesday, and ${subject} going to Central Park to see a concert.`;
    }

    return `${subjectFull} going to Central Park to see a concert today.`;
  }

  if (hasTuesday && hasConcert) {
    return hasWe
      ? "Today is Tuesday, and we're going to a concert."
      : "Today is Tuesday, and I'm going to a concert.";
  }

  if (hasConcert) {
    return hasWe
      ? "We're going to a concert today."
      : "I'm going to a concert today.";
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

  if (
    /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
      normalizedChinese
    ) &&
    !/(concert|gig|recital|live music|music show|performance)/.test(
      normalizedEnglish
    )
  ) {
    return false;
  }

  if (
    /\u4e2d\u592e\u516c\u56ed|centralpark/i.test(normalizedChinese) &&
    !/central park/.test(normalizedEnglish)
  ) {
    return false;
  }

  if (
    /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(normalizedChinese) &&
    !/tuesday/.test(normalizedEnglish)
  ) {
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
  const hasConcert = /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
    normalizedChinese
  );
  const hasTuesday = /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(
    normalizedChinese
  );
  const hasCentralPark = /\u4e2d\u592e\u516c\u56ed|centralpark/i.test(
    normalizedChinese
  );
  const hasWe = /\u6211\u4eec|\u54b1\u4eec/.test(normalizedChinese);

  if (hasConcert && hasCentralPark) {
    const fallbackVariants: Record<ExpressionVariantKey, string> = hasWe
      ? {
          standard:
            standardEnglish ||
            (hasTuesday
              ? "Today is Tuesday, and we're going to Central Park to see a concert."
              : "We're going to Central Park to see a concert today."),
          idiomatic: hasTuesday
            ? "It's Tuesday today, and we're heading to Central Park for a concert."
            : "We're heading to Central Park for a concert today.",
          simple: hasTuesday
            ? "Today is Tuesday. We're going to Central Park to see a concert."
            : "We're going to Central Park to see a concert today.",
          natural: hasTuesday
            ? "It's Tuesday, and we're going to Central Park for a concert later."
            : "We're going to Central Park for a concert later today.",
        }
      : {
          standard:
            standardEnglish ||
            (hasTuesday
              ? "Today is Tuesday, and I'm going to Central Park to see a concert."
              : "I'm going to Central Park to see a concert today."),
          idiomatic: hasTuesday
            ? "It's Tuesday today, and I'm heading to Central Park for a concert."
            : "I'm heading to Central Park for a concert today.",
          simple: hasTuesday
            ? "Today is Tuesday. I'm going to Central Park to see a concert."
            : "I'm going to Central Park to see a concert today.",
          natural: hasTuesday
            ? "It's Tuesday, and I'm going to Central Park for a concert later."
            : "I'm going to Central Park for a concert later today.",
        };

    return expressionVariantLabels.map(({ key, label }) => ({
      key,
      label,
      text: fallbackVariants[key],
    }));
  }

  if (hasTuesday && hasConcert) {
    const fallbackVariants: Record<ExpressionVariantKey, string> = hasWe
      ? {
          standard: standardEnglish || "Today is Tuesday, and we're going to a concert.",
          idiomatic: "It's Tuesday today, and we're going to a concert.",
          simple: "Today is Tuesday. We're going to a concert.",
          natural: "It's Tuesday, and we're going to a concert later.",
        }
      : {
          standard: standardEnglish || "Today is Tuesday, and I'm going to a concert.",
          idiomatic: "It's Tuesday today, and I'm going to a concert.",
          simple: "Today is Tuesday. I'm going to a concert.",
          natural: "It's Tuesday, and I'm going to a concert later.",
        };

    return expressionVariantLabels.map(({ key, label }) => ({
      key,
      label,
      text: fallbackVariants[key],
    }));
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    const fallbackVariants: Record<ExpressionVariantKey, string> = {
      standard: "Let's take a break, and then go for a walk later.",
      idiomatic: "Let's take a break first, then go for a walk later.",
      simple: "Let's rest first, and then take a walk later.",
      natural: "Let's take a break, and we can go for a walk in a while.",
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

function createFallbackNextChinese(currentChinese: string) {
  const normalizedChinese = currentChinese.replace(/\s+/g, "");
  const hasConcert = /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
    normalizedChinese
  );
  const hasCentralPark = /\u4e2d\u592e\u516c\u56ed|centralpark/i.test(
    normalizedChinese
  );

  if (hasConcert && hasCentralPark) {
    return "\u97f3\u4e50\u4f1a\u5f00\u59cb\u524d\uff0c\u6211\u4eec\u53ef\u4ee5\u5728\u516c\u56ed\u91cc\u6563\u6563\u6b65\u3002";
  }

  if (hasConcert) {
    return "\u770b\u5b8c\u97f3\u4e50\u4f1a\u540e\uff0c\u6211\u4eec\u53ef\u4ee5\u804a\u804a\u6700\u559c\u6b22\u7684\u6b4c\u66f2\u3002";
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    return "\u4f11\u606f\u4e4b\u540e\uff0c\u6211\u4eec\u53ef\u4ee5\u53bb\u9644\u8fd1\u6563\u6563\u6b65\u3002";
  }

  if (/\u8fd0\u52a8|\u953b\u70bc|\u7cbe\u795e|\u7761/.test(normalizedChinese)) {
    return "\u6211\u60f3\u6bcf\u5929\u90fd\u62bd\u70b9\u65f6\u95f4\u953b\u70bc\u3002";
  }

  if (/\u5929\u6c14|\u592a\u9633|\u6237\u5916/.test(normalizedChinese)) {
    return "\u6211\u4eec\u53ef\u4ee5\u8fb9\u6563\u6b65\u8fb9\u804a\u5929\u3002";
  }

  return "\u6211\u8fd8\u60f3\u8865\u5145\u4e00\u4e2a\u76f8\u5173\u7684\u7ec6\u8282\u3002";
}

function isNextChineseRelevant(currentChinese: string, suggestion: string) {
  const normalizedChinese = currentChinese.replace(/\s+/g, "");

  if (
    /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
      normalizedChinese
    )
  ) {
    return /\u97f3\u4e50\u4f1a|\u6f14\u51fa|\u516c\u56ed|\u6b4c\u66f2|\u73b0\u573a|\u51fa\u53d1|\u6563\u6b65/.test(
      suggestion
    );
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    return /\u4f11\u606f|\u6563\u6b65|\u653e\u677e|\u9644\u8fd1/.test(suggestion);
  }

  return true;
}

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
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chineseTextRef = useRef(chineseText);
  const englishTextRef = useRef(englishText);
  const currentPracticeChineseRef = useRef(DEFAULT_CHINESE_TEXT);
  const nextChineseRef = useRef(nextChinese);
  const expressionRequestRef = useRef(0);
  const nextChineseRequestRef = useRef(0);
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

  function stopListening() {
    const recorder = activeRecorder;
    clearSilenceTimer();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setActiveRecorder(null);

    if (recorder === "chinese") {
      void refreshChinesePractice(chineseTextRef.current);
    }
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

  async function refreshExpressionVariants(sourceChinese: string, userEnglish = "") {
    const chinese = sourceChinese.trim();
    const learnerEnglish = userEnglish.trim();

    if (!chinese) {
      return "";
    }

    const requestId = expressionRequestRef.current + 1;
    expressionRequestRef.current = requestId;
    currentPracticeChineseRef.current = chinese;
    setIsLoadingExpressionVariants(true);
    setExpressionVariantError("");

    const authoritativeEnglish = await loadAccurateEnglish(chinese);

    if (expressionRequestRef.current !== requestId) {
      return "";
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
        return "";
      }

      if (!response.ok || !data.variants) {
        setExpressionVariants([]);
        setExpressionVariantError(
          data.message || EXPRESSION_VARIANTS_ERROR_MESSAGE
        );
        return authoritativeEnglish;
      }

      if (
        data.source === "fallback" ||
        !validateExpressionVariantMap(
          data.variants,
          expressionVariantLabels.map(({ key }) => key),
          { chinese }
        )
      ) {
        setExpressionVariants([]);
        setExpressionVariantError(EXPRESSION_VARIANTS_ERROR_MESSAGE);
        return authoritativeEnglish;
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
        return authoritativeEnglish;
      }

      setExpressionVariants(nextVariants);
      return nextVariants[0]?.text || authoritativeEnglish;
    } catch {
      if (expressionRequestRef.current === requestId) {
        setExpressionVariants([]);
        setExpressionVariantError(EXPRESSION_VARIANTS_ERROR_MESSAGE);
      }

      return authoritativeEnglish;
    } finally {
      if (expressionRequestRef.current === requestId) {
        setIsLoadingExpressionVariants(false);
      }
    }
  }

  async function generateExpressionVariants(
    userEnglish: string,
    sourceChinese = currentPracticeChineseRef.current
  ) {
    return refreshExpressionVariants(sourceChinese, userEnglish);
  }

  async function refreshChinesePractice(sourceChinese: string) {
    const chinese = sourceChinese.trim();

    if (!chinese) {
      return;
    }

    const recommendedEnglish = await refreshExpressionVariants(chinese);
    await loadNextChineseSuggestion({
      sourceChinese: chinese,
      userEnglish: "",
      recommendedEnglish,
    });
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

    const requestId = nextChineseRequestRef.current + 1;
    nextChineseRequestRef.current = requestId;
    setIsLoadingNextChinese(true);
    setNextChineseError("");
    const fallbackSuggestion = createFallbackNextChinese(currentChinese);

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

      if (nextChineseRequestRef.current !== requestId) {
        return;
      }

      if (suggestion && isNextChineseRelevant(currentChinese, suggestion)) {
        setNextChinese(suggestion);
        nextChineseRef.current = suggestion;
        return;
      }

      setNextChinese(fallbackSuggestion);
      nextChineseRef.current = fallbackSuggestion;
    } catch {
      if (nextChineseRequestRef.current === requestId) {
        setNextChinese(fallbackSuggestion);
        nextChineseRef.current = fallbackSuggestion;
        setNextChineseError("");
      }
    } finally {
      if (nextChineseRequestRef.current === requestId) {
        setIsLoadingNextChinese(false);
      }
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
          chineseTextRef.current = transcript;
          currentPracticeChineseRef.current = transcript;
        }
      };

      recognition.onerror = () => {
        setActiveRecorder(null);
        setStatusText(RECORDING_ERROR_MESSAGE);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setActiveRecorder(null);

        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
          void refreshChinesePractice(chineseTextRef.current);
        }
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

    if (isEditing) {
      setIsEditing(false);
      chineseTextRef.current = chineseText;
      currentPracticeChineseRef.current = chineseText;
      void refreshChinesePractice(chineseText);
      return;
    }

    setIsEditing(true);
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

      <section className={styles.workspace} aria-label="AI 引导表达工作台">
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>AI 引导表达</p>
            <h1>不知道说什么？让 AI 帮你接下一句</h1>
            <p>
              先确认中文想法，再说英文。AI 会给你可直接开口练的表达，并根据语境继续引导下一句。
            </p>
          </div>
          <div className={styles.flowSummary} aria-label="学习流程">
            <span>1 确认中文</span>
            <span>2 说英文</span>
            <span>3 优化表达</span>
            <span>4 接下一句</span>
          </div>
        </section>

        <section className={styles.topGrid} aria-label="第一步和第二步">
          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <span className={styles.stepLabel}>第一步</span>
                <h2>用户输入 / 中文确认</h2>
              </div>
              <button
                type="button"
                className={`${styles.primaryButton} ${
                  isChineseListening ? styles.isListening : ""
                }`}
                onClick={startChineseRecording}
                aria-label={RECORD_BUTTON_LABEL}
                aria-pressed={isChineseListening}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <path d="M12 19v3" />
                </svg>
                <span>{isChineseListening ? LISTENING_LABEL : RECORD_BUTTON_LABEL}</span>
              </button>
            </header>

            <div className={styles.textSurface}>
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  className={styles.chineseTextarea}
                  value={chineseText}
                  onChange={(event) => {
                    const nextChineseText = event.target.value;
                    setChineseText(nextChineseText);
                    chineseTextRef.current = nextChineseText;
                    currentPracticeChineseRef.current = nextChineseText;
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
                onClick={toggleEditing}
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
                <h2>AI 引导话题 / 英文表达</h2>
              </div>
              <button
                type="button"
                className={`${styles.primaryButton} ${
                  isEnglishListening ? styles.isListening : ""
                }`}
                onClick={() => startEnglishRecording({ sourceChinese: chineseText })}
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

        <section className={styles.bottomGrid} aria-label="第三步和第四步">
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

          <article className={styles.nextPanel} aria-label={NEXT_PROMPT_KICKER_LABEL}>
            <header className={styles.panelHeader}>
              <div>
                <span className={styles.stepLabel}>第四步</span>
                <h2>用这句练习 / 换一句</h2>
              </div>
            </header>
            <div className={styles.nextTextSurface}>
              <span className={styles.nextPromptKicker}>{NEXT_PROMPT_KICKER_LABEL}</span>
              <p className={styles.nextPromptText}>{nextChinese}</p>
              {isLoadingNextChinese ? (
                <span className={styles.statusText} aria-live="polite">
                  {NEXT_LOADING_LABEL}
                </span>
              ) : null}
              {nextChineseError ? (
                <span className={styles.statusText} aria-live="polite">
                  {nextChineseError}
                </span>
              ) : null}
            </div>
            <footer className={styles.nextActions}>
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
            </footer>
          </article>
        </section>
      </section>
    </main>
  );
}
