"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { pickBrowserVoiceForSpeakFlowVoice } from "@/lib/voiceSettings";
import styles from "./ClassicScenePracticeWebPage.module.css";

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

function BrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 11.2a8 8 0 1 1 4 6.9L4.5 20l.7-3.9A8 8 0 0 1 4 11.2Z" />
      <path d="M8 10.2v3.6" />
      <path d="M11 8.4v7.2" />
      <path d="M14 10.2v3.6" />
      <path d="M17 9.2v5.6" />
    </svg>
  );
}

function StorefrontIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 10.5v8h14v-8" />
      <path d="M4 10.5h16L18.4 5H5.6L4 10.5Z" />
      <path d="M8.5 10.5V5" />
      <path d="M15.5 10.5V5" />
      <path d="M9 18.5V14h6v4.5" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 10h16" />
      <path d="M6 10v8" />
      <path d="M10 10v8" />
      <path d="M14 10v8" />
      <path d="M18 10v8" />
      <path d="M3.5 18.5h17" />
      <path d="m12 4 8 4H4l8-4Z" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 8.5h12l-1 11H7L6 8.5Z" />
      <path d="M9 8.5a3 3 0 0 1 6 0" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 11 8-6 8 6" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.7 5.3a4.5 4.5 0 0 0 4 5.9L10 19.9a2.4 2.4 0 0 1-3.4-3.4l8.7-8.7a4.5 4.5 0 0 0-.6-2.5Z" />
      <path d="m7.4 17.2.1.1" />
    </svg>
  );
}

function GraduationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
      <path d="M7 10.5v4.2c1.3 1.4 3 2.1 5 2.1s3.7-.7 5-2.1v-4.2" />
      <path d="M20 9v5" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M18 9a7 7 0 0 0-11.8-2.6L4 9" />
      <path d="M6 15a7 7 0 0 0 11.8 2.6L20 15" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 9a6 6 0 0 1 12 0v4.7l1.6 2.8H4.4L6 13.7V9Z" />
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

function categoryIcon(categoryId: string): ReactNode {
  if (categoryId === "finance-government") return <BuildingIcon />;
  if (categoryId === "shopping-consumption") return <ShoppingBagIcon />;
  if (categoryId === "restaurant-takeout") return <UtensilsIcon />;
  if (categoryId === "transportation-travel") return <CarIcon />;
  if (categoryId === "housing-home") return <HomeIcon />;
  if (categoryId === "health-medical") return <ShieldCrossIcon />;
  if (categoryId === "service-repair") return <WrenchIcon />;
  if (categoryId === "education-work-social") return <GraduationIcon />;
  return <StorefrontIcon />;
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
  const sidebarCategory =
    activeCategory || activeLessonMenuTarget?.category || menuCategories[0] || null;
  const sidebarSection =
    activeSection ||
    sidebarCategory?.sections.find(
      (section) => section.title === continueDisplay.sectionTitle
    ) ||
    sidebarCategory?.sections[0] ||
    null;
  const sidebarLessons = sidebarSection?.lessons.slice(0, 4) || [];
  const currentProgressPercent =
    sentenceCount > 0 ? Math.round(((safeCurrentIndex + 1) / sentenceCount) * 100) : 0;

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
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>
            <BrandIcon />
          </span>
          <span>SpeakFlow</span>
        </Link>
        <nav className={styles.navLinks} aria-label="主导航">
          <Link href="/">首页</Link>
          <div className={styles.navMenu}>
            <button type="button" className={styles.navMenuButton}>
              开始学习
              <ChevronDownIcon />
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
          <Link href="/subscription" className={styles.upgradeLink}>
            <CrownIcon />
            会员版
          </Link>
          <Link href="/notifications" className={styles.iconLink} aria-label="通知">
            <BellIcon />
          </Link>
          <Link href="/account" className={styles.profileLink}>
            <span className={styles.profileBadge}>
              <GlobeIcon />
            </span>
            <strong>English Learner</strong>
          </Link>
        </div>
      </header>

      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="经典场景分类">
          <div className={styles.sidebarHeader}>
            <span>场景分类</span>
            <strong>按生活情境练习</strong>
          </div>
          <div className={styles.categoryList}>
            {menuCategories.map((category) => {
              const isSelected =
                activeCategoryId === category.id ||
                (!activeCategoryId &&
                  activeLessonMenuTarget?.category.id === category.id);

              return (
                <button
                  type="button"
                  className={`${styles.categoryCard} ${
                    isSelected ? styles.categoryCardActive : ""
                  }`}
                  key={category.id}
                  onClick={() => openCategory(category.id)}
                >
                  <span className={styles.categoryIcon} aria-hidden="true">
                    {categoryIcon(category.id)}
                  </span>
                  <span className={styles.categoryText}>
                    <strong>{category.title}</strong>
                    <small>{category.description}</small>
                  </span>
                  <ArrowRightIcon />
                </button>
              );
            })}
          </div>

          {sidebarCategory ? (
            <section className={styles.lessonDrawer}>
              <div className={styles.lessonDrawerHeader}>
                <span>当前分类</span>
                <strong>{sidebarCategory.title}</strong>
              </div>
              <div className={styles.sectionTabs}>
                {sidebarCategory.sections.slice(0, 3).map((section) => (
                  <button
                    type="button"
                    className={
                      sidebarSection?.id === section.id ? styles.sectionTabActive : ""
                    }
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
              <div className={styles.lessonList}>
                {sidebarLessons.map((item) => (
                  <button
                    type="button"
                    className={styles.lessonItem}
                    disabled={isLoadingLesson}
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
        </aside>

        <section className={styles.mainColumn} aria-label="经典场景口语练习">
          <section className={styles.heroBanner}>
            <span className={styles.heroIcon}>
              <StorefrontIcon />
            </span>
            <div className={styles.heroCopy}>
              <h1>经典场景口语练习</h1>
              <p>真实生活场景，开口就能用</p>
            </div>
            <div className={styles.heroStats} aria-label="课程信息">
              <span>100+ 高频场景</span>
              <span>中英提示</span>
              <span>跟读优化</span>
            </div>
          </section>

          <section className={styles.continueCard}>
            <span className={styles.continueIcon}>
              <RefreshIcon />
            </span>
            <div className={styles.continueCopy}>
              <strong>继续上次的练习</strong>
              <span>
                {continueDisplay.categoryTitle} / {continueDisplay.sectionTitle}
              </span>
              <small>
                上次学习：{continueDisplay.lessonTitle} 第{" "}
                {continueDisplay.sentenceIndex + 1} /{" "}
                {continueDisplay.totalSentences} 句
              </small>
            </div>
            <Link className={styles.continueButton} href={continueDisplay.href}>
              继续学习
              <ArrowRightIcon />
            </Link>
          </section>

          <section className={styles.learningGrid}>
            <article className={styles.practicePanel}>
              <div className={styles.panelHeader}>
                <div>
                  <span>当前句子</span>
                  <h2>看看中文说英文</h2>
                </div>
                <strong>
                  {safeCurrentIndex + 1} / {Math.max(sentenceCount, 1)}
                </strong>
              </div>

              <div className={styles.progressTrack} aria-hidden="true">
                <span style={{ width: `${currentProgressPercent}%` }} />
              </div>

              <div className={styles.chinesePromptBox}>
                {isLoadingLesson
                  ? "课程正在载入中"
                  : currentTurn?.chinese || "这句课文正在准备中"}
              </div>

              <button
                type="button"
                className={`${styles.recordEnglishButton} ${
                  isListening ? styles.isListening : ""
                }`}
                disabled={isLoadingLesson || !currentTurn}
                onClick={startEnglishRecording}
              >
                <MicrophoneIcon />
                {isLoadingLesson
                  ? "课程载入中"
                  : isListening
                    ? "正在听..."
                    : "点我，说英文"}
              </button>

              <div className={styles.practiceControls}>
                <button
                  type="button"
                  disabled={safeCurrentIndex <= 0}
                  onClick={() => moveSentence(-1)}
                >
                  <ArrowLeftIcon />
                  上一句
                </button>
                <button
                  type="button"
                  disabled={!currentTurn}
                  onClick={() => speakEnglish(currentTurn?.standardEnglish || "", 0.75)}
                >
                  <HeadphonesIcon />
                  慢速朗读
                </button>
                <button
                  type="button"
                  disabled={safeCurrentIndex >= sentenceCount - 1}
                  onClick={() => moveSentence(1)}
                >
                  下一句
                  <ArrowRightIcon />
                </button>
              </div>

              <section className={styles.userExpressionCard}>
                <div className={styles.expressionHeader}>
                  <span>
                    <MicrophoneIcon />
                    你的表达
                  </span>
                  <button
                    type="button"
                    disabled={!displayedEnglish}
                    onClick={() => speakEnglish(displayedEnglish)}
                    aria-label="播放你的表达"
                  >
                    <SpeakerIcon />
                  </button>
                </div>
                <p>
                  {displayedEnglish || "点击上方按钮，录制你的英语表达"}
                </p>
                {statusText ? (
                  <small className={styles.statusText}>{statusText}</small>
                ) : null}
              </section>
            </article>

            <article className={styles.variantsPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <span>AI 优化结果</span>
                  <h2>推荐表达</h2>
                </div>
                <small>选择词组或单词，可以收藏进表达库中</small>
              </div>

              <div className={styles.variantList}>
                {visibleVariants.length > 0 ? (
                  visibleVariants.map((variant) => (
                    <article
                      className={`${styles.variantCard} ${variantToneClass(
                        variant.key
                      )}`}
                      key={variant.key}
                    >
                      <span className={styles.variantIcon} aria-hidden="true">
                        {variantIcon(variant.key)}
                      </span>
                      <div className={styles.variantCopy}>
                        <strong>{variant.label}</strong>
                        <p>{variant.text}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.variantAudioButton}
                        aria-label={`播放${variant.label}`}
                        onClick={() => speakEnglish(variant.text)}
                      >
                        <PlayIcon />
                      </button>
                    </article>
                  ))
                ) : (
                  <p className={styles.emptyVariants}>
                    说完英语后，这里会展示更自然、更地道的表达。
                  </p>
                )}
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
