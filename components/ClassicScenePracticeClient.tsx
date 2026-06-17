"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { pickBrowserVoiceForSpeakFlowVoice } from "@/lib/voiceSettings";
import styles from "./ClassicScenePracticeWebPage.module.css";

const PAGE_ART_WIDTH = 1402;
const PAGE_ART_HEIGHT = 1815;
const PAGE_ART_SRC =
  "/image3/%E7%BB%8F%E5%85%B8%E5%9C%BA%E6%99%AF%E5%8F%A3%E8%AF%AD%E7%BB%83%E4%B9%A0.png";
const SILENCE_END_DELAY_MS = 2000;
const LISTENING_LABEL = "\u6b63\u5728\u542c\u4f60\u8bf4\u82f1\u6587\u2026";
const UNSUPPORTED_MESSAGE =
  "\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u8bed\u97f3\u8bc6\u522b";
const RECORDING_ERROR_MESSAGE =
  "\u6ca1\u6709\u542c\u6e05\u82f1\u6587\uff0c\u8bf7\u518d\u8bd5\u4e00\u6b21";
const LAST_STUDY_PROGRESS_KEY = "lastStudyProgress";

export type ClassicScenePracticeVariant = {
  key: "standard" | "idiomatic" | "simple" | "natural";
  label: string;
  text: string;
};

export type ClassicScenePracticeTurn = {
  chinese: string;
  standardEnglish: string;
  variants: ClassicScenePracticeVariant[];
};

export type ClassicScenePracticeLesson = {
  continueHref: string;
  id: string;
  initialIndex: number;
  sectionTitle: string;
  title: string;
  turns: ClassicScenePracticeTurn[];
};

export type ClassicScenePracticeMenuLesson = {
  href: string;
  id: string;
  number: number;
  sentenceCount: number;
  title: string;
};

export type ClassicScenePracticeMenuSection = {
  id: string;
  lessons: ClassicScenePracticeMenuLesson[];
  title: string;
};

export type ClassicScenePracticeMenuCategory = {
  description: string;
  id: string;
  sections: ClassicScenePracticeMenuSection[];
  title: string;
};

type LastStudyProgress = {
  courseId?: string;
  sentenceIndex?: number;
  updatedAt?: string;
};

type ContinuePracticeTarget = {
  categoryTitle: string;
  courseId: string;
  href: string;
  lessonTitle: string;
  sectionTitle: string;
  sentenceIndex: number;
  totalSentences: number;
};

type ClassicSceneLessonResponse = {
  error?: string;
  lesson?: ClassicScenePracticeLesson;
};

type Hotspot = {
  href: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: "nav" | "button" | "category";
};

const learningMenuHotspot: Omit<Hotspot, "href"> = {
  label: "Start learning menu",
  x: 414,
  y: 12,
  width: 112,
  height: 56,
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
  { href: "/", label: "SpeakFlow home", x: 26, y: 10, width: 255, height: 60, kind: "nav" },
  { href: "/", label: "Home", x: 334, y: 12, width: 72, height: 58, kind: "nav" },
  {
    href: "/new-expressions",
    label: "My expressions",
    x: 538,
    y: 12,
    width: 96,
    height: 58,
    kind: "nav",
  },
  {
    href: "/create-course",
    label: "Create course",
    x: 654,
    y: 12,
    width: 98,
    height: 58,
    kind: "nav",
  },
  {
    href: "/menu?panel=about",
    label: "About",
    x: 780,
    y: 12,
    width: 92,
    height: 58,
    kind: "nav",
  },
  {
    href: "/menu?panel=help",
    label: "Contact",
    x: 906,
    y: 12,
    width: 96,
    height: 58,
    kind: "nav",
  },
  { href: "/account", label: "Upgrade", x: 1010, y: 10, width: 120, height: 60, kind: "nav" },
  {
    href: "/notifications",
    label: "Notifications",
    x: 1142,
    y: 10,
    width: 46,
    height: 60,
    kind: "nav",
  },
  { href: "/languages", label: "Language", x: 1190, y: 10, width: 186, height: 60, kind: "nav" },
];

const categoryButtonPositions: Array<{
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}> = [
  {
    id: "finance-government",
    x: 58,
    y: 221,
    width: 300,
    height: 100,
  },
  {
    id: "shopping-consumption",
    x: 58,
    y: 328,
    width: 300,
    height: 100,
  },
  {
    id: "restaurant-takeout",
    x: 58,
    y: 435,
    width: 300,
    height: 100,
  },
  {
    id: "transportation-travel",
    x: 58,
    y: 543,
    width: 300,
    height: 100,
  },
  {
    id: "housing-home",
    x: 58,
    y: 651,
    width: 300,
    height: 100,
  },
  {
    id: "health-medical",
    x: 58,
    y: 758,
    width: 300,
    height: 100,
  },
  {
    id: "service-repair",
    x: 58,
    y: 865,
    width: 300,
    height: 100,
  },
  {
    id: "education-work-social",
    x: 58,
    y: 972,
    width: 300,
    height: 100,
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

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function variantToneClass(key: ClassicScenePracticeVariant["key"]) {
  if (key === "idiomatic") return styles.variantIdiomatic;
  if (key === "simple") return styles.variantSimple;
  if (key === "natural") return styles.variantNatural;
  return styles.variantStandard;
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9.5v5h3.6l4.9 4.1V5.4L7.6 9.5H4Z" />
      <path d="M16 8.3a5.4 5.4 0 0 1 0 7.4" />
      <path d="M18.7 5.7a9.2 9.2 0 0 1 0 12.6" />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0" />
      <path d="M12 17.4V21" />
      <path d="M8.4 21h7.2" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m10 6-6 6 6 6" />
      <path d="M5 12h15" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m14 6 6 6-6 6" />
      <path d="M4 12h15" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 14v-2a7 7 0 0 1 14 0v2" />
      <path d="M5 14h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" />
      <path d="M19 14h-3v6h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 3.5 2.45 5 5.55.8-4 3.9.95 5.5L12 16.1l-4.95 2.6.95-5.5-4-3.9 5.55-.8L12 3.5Z" />
    </svg>
  );
}

function UtensilsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 3v8" />
      <path d="M4.8 3v8" />
      <path d="M9.2 3v8" />
      <path d="M4.8 11h4.4" />
      <path d="M7 11v10" />
      <path d="M16.5 3c2 1.9 3 4.1 3 6.8 0 2.3-.9 3.9-2.7 4.7V21" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 1.6-4.2A2.8 2.8 0 0 1 9.2 6h5.6a2.8 2.8 0 0 1 2.6 1.8L19 12" />
      <path d="M4 12h16v5H4v-5Z" />
      <path d="M7 17v2" />
      <path d="M17 17v2" />
      <path d="M7.5 14.5h.1" />
      <path d="M16.4 14.5h.1" />
    </svg>
  );
}

function ShieldCrossIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.5 19 6v5.7c0 4.2-2.7 7.5-7 8.8-4.3-1.3-7-4.6-7-8.8V6l7-2.5Z" />
      <path d="M12 8v7" />
      <path d="M8.5 11.5h7" />
    </svg>
  );
}

function variantIcon(key: ClassicScenePracticeVariant["key"]): ReactNode {
  if (key === "idiomatic") return <UtensilsIcon />;
  if (key === "simple") return <CarIcon />;
  if (key === "natural") return <ShieldCrossIcon />;
  return <StarIcon />;
}

let activeAudio: HTMLAudioElement | null = null;
let activeAudioUrl = "";

function stopEnglishAudio() {
  if (typeof window === "undefined") return;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  if (activeAudioUrl) {
    window.URL.revokeObjectURL(activeAudioUrl);
    activeAudioUrl = "";
  }

  window.speechSynthesis?.cancel();
}

function speakWithBrowserVoice(text: string, rate = 1) {
  if (typeof window === "undefined" || !text.trim()) return;
  window.speechSynthesis?.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.voice = pickBrowserVoiceForSpeakFlowVoice(
    window.speechSynthesis.getVoices(),
    "alloy"
  );
  window.speechSynthesis.speak(utterance);
}

async function speakEnglish(text: string, rate = 1) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (typeof window === "undefined" || !cleanText) return;

  stopEnglishAudio();

  try {
    const response = await fetch("/api/text-to-speech", {
      body: JSON.stringify({
        rate,
        text: cleanText,
        voice: "alloy",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("TEXT_TO_SPEECH_FAILED");
    }

    const audioBlob = await response.blob();
    activeAudioUrl = window.URL.createObjectURL(audioBlob);
    activeAudio = new Audio(activeAudioUrl);
    activeAudio.onended = stopEnglishAudio;
    activeAudio.onerror = stopEnglishAudio;
    await activeAudio.play();
  } catch {
    stopEnglishAudio();
    speakWithBrowserVoice(cleanText, rate);
  }
}

function clampSentenceIndex(index: number, sentenceCount: number) {
  if (sentenceCount <= 0) return 0;
  return Math.min(Math.max(index, 0), sentenceCount - 1);
}

export default function ClassicScenePracticeClient({
  lesson,
  menuCategories,
}: {
  lesson: ClassicScenePracticeLesson;
  menuCategories: ClassicScenePracticeMenuCategory[];
}) {
  const [activeLesson, setActiveLesson] = useState(lesson);
  const [currentIndex, setCurrentIndex] = useState(lesson.initialIndex);
  const [spokenEnglish, setSpokenEnglish] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [continueTarget, setContinueTarget] =
    useState<ContinuePracticeTarget | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechBufferRef = useRef("");

  const storageKey = `classic-scene-web-progress:${activeLesson.id}`;
  const turns = activeLesson.turns;
  const sentenceCount = turns.length;
  const safeCurrentIndex = clampSentenceIndex(currentIndex, sentenceCount);
  const currentTurn = turns[safeCurrentIndex] || turns[0];
  const displayedEnglish = liveTranscript || spokenEnglish;
  const visibleVariants = useMemo(
    () => (currentTurn?.variants || []).slice(0, 4),
    [currentTurn]
  );
  const activeCategory = useMemo(
    () =>
      menuCategories.find((category) => category.id === activeCategoryId) ||
      null,
    [activeCategoryId, menuCategories]
  );
  const activeSection = useMemo(
    () =>
      activeCategory?.sections.find((section) => section.id === activeSectionId) ||
      null,
    [activeCategory, activeSectionId]
  );
  const activeLessonMenuTarget = useMemo(() => {
    for (const category of menuCategories) {
      for (const section of category.sections) {
        const item = section.lessons.find(
          (lessonItem) => lessonItem.id === activeLesson.id
        );

        if (item) {
          return { category, item, section };
        }
      }
    }

    return null;
  }, [activeLesson.id, menuCategories]);
  const defaultContinueTarget = useMemo<ContinuePracticeTarget>(
    () => ({
      categoryTitle:
        activeLessonMenuTarget?.category.title ||
        "\u91d1\u878d\u4e0e\u884c\u653f\u4e8b\u52a1",
      courseId: activeLesson.id,
      href: activeLessonMenuTarget?.item.href || activeLesson.continueHref,
      lessonTitle: activeLessonMenuTarget?.item.title || activeLesson.title,
      sectionTitle:
        activeLessonMenuTarget?.section.title ||
        activeLesson.sectionTitle ||
        "\u94f6\u884c\u4e0e\u91d1\u878d\u4ea4\u6613",
      sentenceIndex: safeCurrentIndex,
      totalSentences: Math.max(sentenceCount, 1),
    }),
    [
      activeLesson.continueHref,
      activeLesson.id,
      activeLesson.sectionTitle,
      activeLesson.title,
      activeLessonMenuTarget,
      safeCurrentIndex,
      sentenceCount,
    ]
  );
  const continueDisplay = continueTarget || defaultContinueTarget;

  const findLessonTarget = useCallback(
    (courseId: string) => {
      for (const category of menuCategories) {
        for (const section of category.sections) {
          const item = section.lessons.find(
            (lessonItem) => lessonItem.id === courseId
          );

          if (item) {
            return { category, item, section };
          }
        }
      }

      return null;
    },
    [menuCategories]
  );

  const createContinueTarget = useCallback(
    (
      courseId: string,
      sentenceIndex: number
    ): ContinuePracticeTarget | null => {
      const target = findLessonTarget(courseId);
      if (!target) return null;

      const totalSentences = Math.max(target.item.sentenceCount, 1);
      const clampedIndex = Math.min(
        Math.max(Number.isFinite(sentenceIndex) ? sentenceIndex : 0, 0),
        totalSentences - 1
      );

      return {
        categoryTitle: target.category.title,
        courseId,
        href: target.item.href,
        lessonTitle: target.item.title,
        sectionTitle: target.section.title,
        sentenceIndex: clampedIndex,
        totalSentences,
      };
    },
    [findLessonTarget]
  );

  const readLastStudyProgressTarget = useCallback(() => {
    try {
      const rawProgress = window.localStorage.getItem(LAST_STUDY_PROGRESS_KEY);
      if (!rawProgress) return null;

      const progress = JSON.parse(rawProgress) as LastStudyProgress | null;
      if (typeof progress?.courseId !== "string") return null;

      return createContinueTarget(
        progress.courseId,
        typeof progress.sentenceIndex === "number" ? progress.sentenceIndex : 0
      );
    } catch {
      return null;
    }
  }, [createContinueTarget]);

  useEffect(() => {
    const savedTarget = readLastStudyProgressTarget();

    if (savedTarget) {
      setContinueTarget(savedTarget);

      if (savedTarget.courseId === activeLesson.id) {
        setCurrentIndex(savedTarget.sentenceIndex);
        return;
      }
    }

    const savedIndex = window.localStorage.getItem(storageKey);
    if (savedIndex) {
      const parsedIndex = Number.parseInt(savedIndex, 10);
      if (
        Number.isInteger(parsedIndex) &&
        parsedIndex >= 0 &&
        parsedIndex < sentenceCount
      ) {
        setCurrentIndex(parsedIndex);
        return;
      }
    }

    setCurrentIndex(activeLesson.initialIndex);
  }, [
    activeLesson.id,
    activeLesson.initialIndex,
    readLastStudyProgressTarget,
    sentenceCount,
    storageKey,
  ]);

  useEffect(() => {
    setLiveTranscript("");
    setSpokenEnglish("");
    setStatusText("");
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      recognitionRef.current?.abort();
      stopEnglishAudio();
    };
  }, []);

  function clearSilenceTimer() {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  function saveContinueProgress(courseId: string, sentenceIndex: number) {
    const nextTarget = createContinueTarget(courseId, sentenceIndex);
    if (!nextTarget) return;

    window.localStorage.setItem(
      `lesson-progress-${courseId}`,
      String(nextTarget.sentenceIndex)
    );
    window.localStorage.setItem(
      LAST_STUDY_PROGRESS_KEY,
      JSON.stringify({
        courseId,
        sentenceIndex: nextTarget.sentenceIndex,
        updatedAt: new Date().toISOString(),
      })
    );
    setContinueTarget(nextTarget);
  }

  function saveCurrentLessonProgress(index: number) {
    const clampedIndex = clampSentenceIndex(index, sentenceCount);
    window.localStorage.setItem(storageKey, String(clampedIndex));
    saveContinueProgress(activeLesson.id, clampedIndex);
  }

  function finishRecordingAfterPause() {
    clearSilenceTimer();
    const recognizer = recognitionRef.current;
    if (recognizer) {
      recognizer.onend = null;
      recognizer.stop();
    }

    setIsListening(false);
    setLiveTranscript("");
    const finalText = speechBufferRef.current.trim();
    if (finalText) {
      setSpokenEnglish(finalText);
      setStatusText("");
      saveCurrentLessonProgress(safeCurrentIndex);
    } else {
      setStatusText(RECORDING_ERROR_MESSAGE);
    }
  }

  function startEnglishRecording() {
    if (isListening) return;

    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setStatusText(UNSUPPORTED_MESSAGE);
      return;
    }

    clearSilenceTimer();
    recognitionRef.current?.abort();
    stopEnglishAudio();

    const recognizer = new Recognition();
    recognitionRef.current = recognizer;
    speechBufferRef.current = "";
    setSpokenEnglish("");
    setLiveTranscript("");
    setStatusText(LISTENING_LABEL);
    setIsListening(true);
    saveCurrentLessonProgress(safeCurrentIndex);

    recognizer.lang = "en-US";
    recognizer.continuous = true;
    recognizer.interimResults = true;

    recognizer.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!transcript) return;

      speechBufferRef.current = transcript;
      setLiveTranscript(transcript);
      setStatusText(LISTENING_LABEL);
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(
        finishRecordingAfterPause,
        SILENCE_END_DELAY_MS
      );
    };

    recognizer.onerror = () => {
      clearSilenceTimer();
      setIsListening(false);
      setLiveTranscript("");
      setStatusText(RECORDING_ERROR_MESSAGE);
    };

    recognizer.onend = () => {
      setIsListening(false);
      if (!speechBufferRef.current.trim()) {
        setStatusText(RECORDING_ERROR_MESSAGE);
      }
    };

    try {
      recognizer.start();
    } catch {
      setIsListening(false);
      setStatusText(RECORDING_ERROR_MESSAGE);
    }
  }

  function selectSentence(index: number) {
    if (!sentenceCount) return;

    const nextIndex = clampSentenceIndex(index, sentenceCount);
    clearSilenceTimer();
    recognitionRef.current?.abort();
    stopEnglishAudio();
    setIsListening(false);
    setLiveTranscript("");
    setSpokenEnglish("");
    setStatusText("");
    saveCurrentLessonProgress(nextIndex);
    setCurrentIndex(nextIndex);
  }

  function moveSentence(delta: number) {
    selectSentence(safeCurrentIndex + delta);
  }

  function openCategory(categoryId: string) {
    setActiveCategoryId((currentCategoryId) => {
      if (currentCategoryId === categoryId) {
        setActiveSectionId(null);
        return null;
      }

      const nextCategory = menuCategories.find(
        (category) => category.id === categoryId
      );
      setActiveSectionId(nextCategory?.sections[0]?.id || null);
      return categoryId;
    });
  }

  async function chooseLesson(item: ClassicScenePracticeMenuLesson) {
    setIsLoadingLesson(true);
    setStatusText("\u6b63\u5728\u8f7d\u5165\u8bfe\u7a0b\u2026");

    try {
      const response = await fetch(
        `/api/classic-scene-lesson?lessonId=${encodeURIComponent(item.id)}`
      );
      const data = (await response.json()) as ClassicSceneLessonResponse;

      if (!response.ok || !data.lesson) {
        throw new Error(data.error || "Failed to load classic scene lesson.");
      }

      setActiveLesson(data.lesson);
      setCurrentIndex(0);
      setSpokenEnglish("");
      setLiveTranscript("");
      setStatusText("");
      window.localStorage.setItem(
        `classic-scene-web-progress:${item.id}`,
        "0"
      );
      saveContinueProgress(item.id, 0);
      setActiveCategoryId(null);
      setActiveSectionId(null);
    } catch {
      setStatusText("\u8bfe\u7a0b\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u518d\u8bd5\u4e00\u6b21");
    } finally {
      setIsLoadingLesson(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.artboard}>
        <Image
          alt="\u7ecf\u5178\u573a\u666f\u53e3\u8bed\u7ec3\u4e60"
          className={styles.pageArt}
          height={PAGE_ART_HEIGHT}
          priority
          src={PAGE_ART_SRC}
          width={PAGE_ART_WIDTH}
        />
        <nav className={styles.hotspots} aria-label="Classic scene navigation">
          <div
            className={styles.learningMenu}
            style={hotspotStyle(learningMenuHotspot)}
          >
            <button
              type="button"
              className={styles.learningTrigger}
              aria-haspopup="menu"
              aria-label={learningMenuHotspot.label}
            />
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

        <div className={styles.categoryButtons} aria-label="\u7ecf\u5178\u573a\u666f\u4e00\u7ea7\u83dc\u5355">
          {categoryButtonPositions.map((position) => {
            const category = menuCategories.find(
              (item) => item.id === position.id
            );
            if (!category) return null;

            return (
              <button
                type="button"
                className={`${styles.categoryButton} ${
                  activeCategoryId === category.id ? styles.categoryButtonActive : ""
                }`}
                key={category.id}
                style={hotspotStyle(position)}
                aria-expanded={activeCategoryId === category.id}
                onClick={() => openCategory(category.id)}
              >
                <span className={styles.srOnly}>
                  {`\u6253\u5f00${category.title}\u4e8c\u7ea7\u83dc\u5355`}
                </span>
              </button>
            );
          })}
        </div>

        {activeCategory ? (
          <div className={styles.menuFlyout} aria-label="\u7ecf\u5178\u573a\u666f\u8bfe\u7a0b\u83dc\u5355">
            <section className={styles.menuPanel}>
              <div className={styles.menuPanelHeader}>
                <strong>{activeCategory.title}</strong>
                <span>{activeCategory.description}</span>
              </div>
              <div className={styles.menuList}>
                {activeCategory.sections.map((section) => (
                  <button
                    type="button"
                    className={`${styles.menuItem} ${
                      activeSectionId === section.id ? styles.menuItemActive : ""
                    }`}
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                  >
                    <span>{section.title}</span>
                    <small>{`${section.lessons.length} \u8bfe`}</small>
                  </button>
                ))}
              </div>
            </section>

            {activeSection ? (
              <section className={`${styles.menuPanel} ${styles.lessonPanel}`}>
                <div className={styles.menuPanelHeader}>
                  <strong>{activeSection.title}</strong>
                  <span>选择一项课程开始练习</span>
                </div>
                <div className={styles.menuList}>
                  {activeSection.lessons.map((item) => (
                    <button
                      type="button"
                      className={styles.lessonMenuItem}
                      key={item.id}
                      onClick={() => chooseLesson(item)}
                    >
                      <span>{item.number}</span>
                      <strong>{item.title}</strong>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        <section className={styles.courseLayer} aria-label={activeLesson.title}>
          <div className={styles.continueLessonMeta}>
            <strong>
              {`${continueDisplay.categoryTitle} > ${continueDisplay.sectionTitle}`}
            </strong>
            <span>
              {`\u4e0a\u6b21\u5b66\u4e60\uff1a${continueDisplay.lessonTitle} \u7b2c ${
                continueDisplay.sentenceIndex + 1
              } / ${continueDisplay.totalSentences} \u53e5`}
            </span>
          </div>
          <Link
            className={styles.continueLessonButton}
            href={continueDisplay.href}
          >
            继续学习
          </Link>

          <div className={styles.chinesePromptBox}>
            {isLoadingLesson
              ? "\u8bfe\u7a0b\u6b63\u5728\u8f7d\u5165\u4e2d"
              : currentTurn?.chinese ||
                "\u8fd9\u53e5\u8bfe\u6587\u6b63\u5728\u51c6\u5907\u4e2d"}
          </div>

          <button
            type="button"
            className={`${styles.recordEnglishButton} ${
              isListening ? styles.isListening : ""
            }`}
            disabled={isLoadingLesson || !currentTurn}
            onClick={startEnglishRecording}
          >
            <span className={styles.recordButtonContent}>
              <MicrophoneIcon />
              {isLoadingLesson
                ? "\u8bfe\u7a0b\u8f7d\u5165\u4e2d"
                : isListening
                  ? "\u6b63\u5728\u542c..."
                  : "\u70b9\u6211\uff0c\u8bf4\u82f1\u6587"}
            </span>
          </button>

          <button
            type="button"
            className={`${styles.practiceControl} ${styles.previousButton}`}
            disabled={safeCurrentIndex <= 0}
            onClick={() => moveSentence(-1)}
          >
            <span className={styles.practiceButtonContent}>
              <ArrowLeftIcon />
              上一句
            </span>
          </button>
          <button
            type="button"
            className={`${styles.practiceControl} ${styles.slowButton}`}
            onClick={() => speakEnglish(currentTurn?.standardEnglish || "", 0.75)}
          >
            <span className={styles.practiceButtonContent}>
              <HeadphonesIcon />
              慢速朗读
            </span>
          </button>
          <button
            type="button"
            className={`${styles.practiceControl} ${styles.nextButton}`}
            disabled={safeCurrentIndex >= sentenceCount - 1}
            onClick={() => moveSentence(1)}
          >
            <span className={styles.practiceButtonContent}>
              下一句
              <ArrowRightIcon />
            </span>
          </button>

          <div className={styles.userExpressionText}>
            {displayedEnglish || "\u70b9\u51fb\u4e0a\u65b9\u6309\u94ae\u5f00\u59cb\u8bf4\u82f1\u6587"}
          </div>
          {statusText ? <p className={styles.statusText}>{statusText}</p> : null}

          <div className={styles.variantCards}>
            {visibleVariants.map((variant) => (
              <article
                className={`${styles.variantCard} ${variantToneClass(variant.key)}`}
                key={variant.key}
              >
                <span className={styles.variantIcon} aria-hidden="true">
                  {variantIcon(variant.key)}
                </span>
                <div className={styles.variantCopy}>
                  <span className={styles.variantLabel}>{variant.label}</span>
                  <p>{variant.text}</p>
                  {variant.key === "standard" ? (
                    <span className={styles.variantNote}>
                      <StarIcon />
                      最自然、最常用的表达
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={styles.variantAudioButton}
                  aria-label={`\u64ad\u653e${variant.label}`}
                  onClick={() => speakEnglish(variant.text)}
                >
                  <SpeakerIcon />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
