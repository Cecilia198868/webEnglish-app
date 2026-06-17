"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  createSentencePatternProgressHref,
  recordSentencePatternProgress,
  readSentencePatternContinueProgress,
  type SentencePatternContinueProgress,
  type SentencePatternProgressSnapshot,
} from "@/lib/sentencePatternProgress";
import { playSpeakFlowTts, stopSpeakFlowTts } from "@/lib/speakFlowTtsClient";
import type {
  SentencePattern,
  SentencePatternLevel,
  SentencePatternLevelId,
  SentencePatternPractice,
  SentencePatternSection,
} from "@/data/sentencePatterns";
import styles from "./SentencePatternsWebPage.module.css";

const PAGE_ART_WIDTH = 992;
const PAGE_ART_HEIGHT = 1586;
const PAGE_ART_SRC =
  "/image3/100%E4%B8%AA%E5%8F%A3%E8%AF%AD%E5%8F%A5%E5%9E%8B.png";
const FINISH_AFTER_SILENCE_MS = 2000;
const SENTENCE_PATTERN_TTS_RATE = 0.75;
const SENTENCE_PATTERN_TTS_VOICE_ID = "alloy";
const UNSUPPORTED_RECORDING_MESSAGE =
  "\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u8bed\u97f3\u8bc6\u522b\uff0c\u8bf7\u4f7f\u7528 Chrome \u518d\u8bd5\u3002";
const RECORDING_ERROR_MESSAGE =
  "\u5f55\u97f3\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u9ea6\u514b\u98ce\u6743\u9650\u540e\u91cd\u8bd5\u3002";

type Hotspot = {
  href: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: "nav" | "button" | "card" | "control";
};

type LevelCardPosition = {
  id: SentencePatternLevelId;
  x: number;
  y: number;
  width: number;
  height: number;
};

type SelectedPattern = {
  levelId: SentencePatternLevelId;
  patternId: number;
};

type PatternEntry = {
  href: string;
  level: SentencePatternLevel;
  pattern: SentencePattern;
  practice: SentencePatternPractice;
  section: SentencePatternSection;
};

type AdjacentPatternTarget = {
  levelId: SentencePatternLevelId;
  patternId: number;
};

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function readTranscript(
  event: SpeechRecognitionResultEventLike,
  separator: "" | " " = " "
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

const learningMenuHotspot: Omit<Hotspot, "href"> = {
  label: "Start learning menu",
  x: 300,
  y: 18,
  width: 96,
  height: 48,
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
  { href: "/", label: "SpeakFlow home", x: 24, y: 16, width: 176, height: 52, kind: "nav" },
  { href: "/", label: "Home", x: 225, y: 18, width: 54, height: 48, kind: "nav" },
  {
    href: "/new-expressions",
    label: "My expressions",
    x: 412,
    y: 18,
    width: 78,
    height: 48,
    kind: "nav",
  },
  {
    href: "/create-course",
    label: "Create course",
    x: 514,
    y: 18,
    width: 84,
    height: 48,
    kind: "nav",
  },
  {
    href: "/menu?panel=about",
    label: "About",
    x: 615,
    y: 18,
    width: 72,
    height: 48,
    kind: "nav",
  },
  {
    href: "/menu?panel=help",
    label: "Contact",
    x: 708,
    y: 18,
    width: 84,
    height: 48,
    kind: "nav",
  },
  { href: "/account", label: "Upgrade", x: 804, y: 16, width: 78, height: 52, kind: "nav" },
  {
    href: "/notifications",
    label: "Notifications",
    x: 862,
    y: 16,
    width: 36,
    height: 52,
    kind: "nav",
  },
  { href: "/languages", label: "Language", x: 894, y: 16, width: 86, height: 52, kind: "nav" },
];

const levelCardPositions: LevelCardPosition[] = [
  {
    id: "basic",
    x: 23,
    y: 272,
    width: 252,
    height: 186,
  },
  {
    id: "intermediate",
    x: 23,
    y: 477,
    width: 252,
    height: 181,
  },
  {
    id: "advanced",
    x: 23,
    y: 675,
    width: 252,
    height: 187,
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

function getFirstPractice(pattern: SentencePattern): SentencePatternPractice {
  return (
    pattern.practices?.[0] || {
      chinese: "\u8bf7\u770b\u7740\u4e2d\u6587\uff0c\u7528\u8fd9\u4e2a\u53e5\u578b\u8bf4\u4e00\u53e5\u82f1\u8bed\u3002",
      id: 1,
      idiomatic: pattern.text,
      natural: pattern.text,
      recommended: pattern.text,
      simple: pattern.text,
      targetEnglish: pattern.text,
    }
  );
}

function getPractice(pattern: SentencePattern, practiceId: number) {
  const practiceCount = getPracticeCount(pattern);
  const safePracticeId = clampPracticeId(practiceId, practiceCount);

  return (
    pattern.practices?.find((practice) => practice.id === safePracticeId) ||
    pattern.practices?.[0] ||
    getFirstPractice(pattern)
  );
}

function getPracticeCount(pattern: SentencePattern) {
  return pattern.practices?.length || 20;
}

function clampPracticeId(practiceId: number, practiceCount: number) {
  return Math.min(Math.max(Math.floor(practiceId), 1), Math.max(practiceCount, 1));
}

function getPatternEntryByIds(
  levels: SentencePatternLevel[],
  levelId: string,
  patternId: number
): PatternEntry | null {
  const level = levels.find((item) => item.id === levelId);
  if (!level) return null;

  for (const section of level.sections) {
    const pattern = section.patterns.find((item) => item.id === patternId);
    if (pattern) {
      return {
        href: `/sentence-patterns/${level.id}/${pattern.id}?practice=1`,
        level,
        pattern,
        practice: getFirstPractice(pattern),
        section,
      };
    }
  }

  return null;
}

function getPatternEntry(
  levels: SentencePatternLevel[],
  selected: SelectedPattern
): PatternEntry {
  const level = levels.find((item) => item.id === selected.levelId) || levels[0];
  const patterns = level.sections.flatMap((section) =>
    section.patterns.map((pattern) => ({ pattern, section }))
  );
  const match =
    patterns.find((item) => item.pattern.id === selected.patternId) ||
    patterns[0];

  return {
    href: `/sentence-patterns/${level.id}/${match.pattern.id}?practice=1`,
    level,
    pattern: match.pattern,
    practice: getFirstPractice(match.pattern),
    section: match.section,
  };
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

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 10v4" />
      <path d="M8 7v10" />
      <path d="M12 9v6" />
      <path d="M16 5v14" />
      <path d="M20 9v6" />
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

function PlusChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 11.4c0-4.1 3.4-7 8-7s8 2.9 8 7-3.4 7-8 7c-1 0-1.9-.1-2.8-.4L5 20.5v-5.2a6.4 6.4 0 0 1 0-3.9Z" />
      <path d="M13 8v7" />
      <path d="M9.5 11.5h7" />
    </svg>
  );
}

function variantIcon(tone: string): ReactNode {
  if (tone === "idiomatic") return <UtensilsIcon />;
  if (tone === "simple") return <CarIcon />;
  if (tone === "natural") return <PlusChatIcon />;
  return <StarIcon />;
}

function getAdjacentPattern(
  level: SentencePatternLevel,
  patternId: number,
  direction: -1 | 1
): AdjacentPatternTarget {
  const patterns = level.sections.flatMap((section) => section.patterns);
  const currentIndex = patterns.findIndex((pattern) => pattern.id === patternId);
  const fallbackIndex = currentIndex < 0 ? 0 : currentIndex;
  const nextIndex = Math.min(
    Math.max(fallbackIndex + direction, 0),
    Math.max(patterns.length - 1, 0)
  );
  const nextPattern = patterns[nextIndex] || patterns[0];

  return {
    levelId: level.id,
    patternId: nextPattern.id,
  };
}

export default function SentencePatternsWebPage({
  levels,
}: {
  levels: SentencePatternLevel[];
}) {
  const [openLevelId, setOpenLevelId] =
    useState<SentencePatternLevelId | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<SelectedPattern>({
    levelId: "basic",
    patternId: 1,
  });
  const [continueProgress, setContinueProgress] =
    useState<SentencePatternContinueProgress | null>(null);
  const [activePracticeId, setActivePracticeId] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const transcriptRef = useRef("");
  const selectedEntry = useMemo(
    () => getPatternEntry(levels, selectedPattern),
    [levels, selectedPattern]
  );
  const continueEntry = useMemo(
    () =>
      continueProgress
        ? getPatternEntryByIds(
            levels,
            continueProgress.levelId,
            continueProgress.patternId
          )
        : null,
    [continueProgress, levels]
  );
  const openLevel = openLevelId
    ? levels.find((level) => level.id === openLevelId) || null
    : null;
  const previousPatternTarget = getAdjacentPattern(
    selectedEntry.level,
    selectedEntry.pattern.id,
    -1
  );
  const nextPatternTarget = getAdjacentPattern(
    selectedEntry.level,
    selectedEntry.pattern.id,
    1
  );
  const selectedPracticeCount = getPracticeCount(selectedEntry.pattern);
  const selectedProgressPracticeId = clampPracticeId(
    activePracticeId,
    selectedPracticeCount
  );
  const selectedPractice = getPractice(
    selectedEntry.pattern,
    selectedProgressPracticeId
  );
  const selectedPercent =
    Math.min(
      100,
      Math.round(
        (selectedProgressPracticeId / Math.max(selectedPracticeCount, 1)) * 100
      )
    );
  const selectedChinesePrompt =
    selectedPractice.chinese.trim() ||
    "\u8bf7\u770b\u7740\u8fd9\u4e2a\u53e5\u578b\uff0c\u7528\u82f1\u8bed\u8bf4\u51fa\u4e00\u53e5\u771f\u5b9e\u8868\u8fbe\u3002";
  const continuePracticeCount = continueEntry
    ? getPracticeCount(continueEntry.pattern)
    : getPracticeCount(selectedEntry.pattern);
  const continuePracticeId =
    continueEntry && continueProgress
      ? clampPracticeId(continueProgress.practiceId, continuePracticeCount)
      : selectedEntry.practice.id || 1;
  const continueHref = continueEntry
    ? createSentencePatternProgressHref(
        continueEntry.level.id,
        continueEntry.pattern.id,
        continuePracticeId
      )
    : selectedEntry.href;
  const continueTitle = continueEntry
    ? `${continueEntry.level.menuTitle} > ${continueEntry.section.title}`
    : `${selectedEntry.level.menuTitle} > ${selectedEntry.section.title}`;
  const continueSubtitle = continueEntry
    ? `\u4e0a\u6b21\u5b66\u4e60\uff1a\u7b2c ${continuePracticeId} / ${continuePracticeCount} \u53e5`
    : `\u4e0a\u6b21\u5b66\u4e60\uff1a\u7b2c ${
        selectedEntry.practice.id || 1
      } / ${continuePracticeCount} \u53e5`;
  const variants = [
    {
      label: "\u63a8\u8350\u8868\u8fbe",
      text: selectedPractice.recommended,
      tone: "recommended",
    },
    {
      label: "\u66f4\u5730\u9053",
      text: selectedPractice.idiomatic,
      tone: "idiomatic",
    },
    {
      label: "\u66f4\u7b80\u5355",
      text: selectedPractice.simple,
      tone: "simple",
    },
    {
      label: "\u66f4\u81ea\u7136",
      text: selectedPractice.natural,
      tone: "natural",
    },
  ];

  function playPrebuiltExpression(text: string) {
    void playSpeakFlowTts({
      rate: SENTENCE_PATTERN_TTS_RATE,
      text,
      voiceId: SENTENCE_PATTERN_TTS_VOICE_ID,
    });
  }

  function openLevelMenu(levelId: SentencePatternLevelId) {
    setOpenLevelId((current) => (current === levelId ? null : levelId));
  }

  function choosePattern(levelId: SentencePatternLevelId, patternId: number) {
    setSelectedPattern({ levelId, patternId });
    setActivePracticeId(1);
    setUserTranscript("");
    setRecordingStatus("");
    setOpenLevelId(null);
  }

  function chooseAdjacentPattern(target: AdjacentPatternTarget) {
    setSelectedPattern(target);
    setActivePracticeId(1);
    setUserTranscript("");
    setRecordingStatus("");
    setOpenLevelId(null);
  }

  function clearSilenceTimer() {
    if (silenceTimerRef.current === null) return;

    window.clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  }

  function saveCurrentPracticeProgress(practiceId: number, completed: boolean) {
    recordSentencePatternProgress({
      completed,
      levelId: selectedEntry.level.id,
      levelTitle: selectedEntry.level.menuTitle,
      patternId: selectedEntry.pattern.id,
      patternText: selectedEntry.pattern.text,
      practiceCount: selectedPracticeCount,
      practiceId,
      sectionTitle: selectedEntry.section.title,
    });
  }

  function stopRecording() {
    clearSilenceTimer();
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    setIsRecording(false);

    try {
      recognition?.stop();
    } catch {}
  }

  function finishRecording() {
    stopRecording();
    setRecordingStatus("");

    if (transcriptRef.current.trim()) {
      saveCurrentPracticeProgress(selectedProgressPracticeId, true);
    }
  }

  function finishRecordingAfterPause() {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      finishRecording();
    }, FINISH_AFTER_SILENCE_MS);
  }

  function choosePractice(nextPracticeId: number) {
    const safePracticeId = clampPracticeId(nextPracticeId, selectedPracticeCount);
    setActivePracticeId(safePracticeId);
    setUserTranscript("");
    setRecordingStatus("");
    saveCurrentPracticeProgress(safePracticeId, false);

    if (isRecording) {
      stopRecording();
    }
  }

  function startEnglishRecording() {
    if (isRecording) {
      finishRecording();
      return;
    }

    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setRecordingStatus(UNSUPPORTED_RECORDING_MESSAGE);
      return;
    }

    clearSilenceTimer();
    setRecordingStatus("\u6b63\u5728\u5f55\u97f3\uff0c\u8bf4\u5b8c\u540e\u505c\u987f 2 \u79d2\u4f1a\u81ea\u52a8\u7ed3\u675f\u3002");
    setUserTranscript("");
    transcriptRef.current = "";

    try {
      const recognition = new Recognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = readTranscript(event, " ");

        if (!transcript) return;

        transcriptRef.current = transcript;
        setUserTranscript(transcript);
        finishRecordingAfterPause();
      };

      recognition.onerror = () => {
        clearSilenceTimer();
        setIsRecording(false);
        setRecordingStatus(RECORDING_ERROR_MESSAGE);

        if (recognitionRef.current === recognition) {
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

        setIsRecording(false);

        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
          clearSilenceTimer();
        }

        if (transcriptRef.current.trim()) {
          setRecordingStatus("");
        }
      };

      recognitionRef.current = recognition;
      setIsRecording(true);
      recognition.start();
    } catch {
      clearSilenceTimer();
      setIsRecording(false);
      setRecordingStatus(RECORDING_ERROR_MESSAGE);
      recognitionRef.current = null;
    }
  }

  useEffect(() => {
    function syncContinueProgress() {
      const savedProgress = readSentencePatternContinueProgress();
      const savedEntry = savedProgress
        ? getPatternEntryByIds(
            levels,
            savedProgress.levelId,
            savedProgress.patternId
          )
        : null;

      setContinueProgress(savedEntry ? savedProgress : null);
    }

    syncContinueProgress();
    window.addEventListener("focus", syncContinueProgress);
    window.addEventListener("storage", syncContinueProgress);

    return () => {
      window.removeEventListener("focus", syncContinueProgress);
      window.removeEventListener("storage", syncContinueProgress);
    };
  }, [levels]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSelectedProgress() {
      const fallbackProgress = readSentencePatternContinueProgress();
      const fallbackEntry = fallbackProgress
        ? getPatternEntryByIds(
            levels,
            fallbackProgress.levelId,
            fallbackProgress.patternId
          )
        : null;

      if (
        fallbackEntry &&
        fallbackProgress?.levelId === selectedEntry.level.id &&
        fallbackProgress.patternId === selectedEntry.pattern.id
      ) {
        setActivePracticeId(
          clampPracticeId(fallbackProgress.practiceId, selectedPracticeCount)
        );
      } else {
        setActivePracticeId(1);
      }

      try {
        const params = new URLSearchParams({
          levelId: selectedEntry.level.id,
          patternId: String(selectedEntry.pattern.id),
          practiceCount: String(selectedPracticeCount),
        });
        const response = await fetch(`/api/sentence-patterns/progress?${params}`, {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const progress =
          (await response.json()) as SentencePatternProgressSnapshot;
        if (!controller.signal.aborted) {
          setActivePracticeId(
            clampPracticeId(progress.currentPracticeId, selectedPracticeCount)
          );
        }
      } catch {}
    }

    void loadSelectedProgress();

    return () => controller.abort();
  }, [
    levels,
    selectedEntry.level.id,
    selectedEntry.pattern.id,
    selectedPracticeCount,
  ]);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setUserTranscript("");
      setRecordingStatus("");
    }, 0);

    return () => {
      window.clearTimeout(resetTimer);
      stopSpeakFlowTts();
      clearSilenceTimer();
      try {
        recognitionRef.current?.abort?.();
      } catch {}
      recognitionRef.current = null;
      transcriptRef.current = "";
      setIsRecording(false);
    };
  }, [
    selectedEntry.level.id,
    selectedEntry.pattern.id,
    selectedProgressPracticeId,
  ]);

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>SpeakFlow 100 sentence patterns</h1>
      <div className={styles.artboard} aria-label="100 sentence patterns learning page">
        <Image
          alt="\u0031\u0030\u0030\u4e2a\u53e3\u8bed\u53e5\u578b\u5b66\u4e60\u754c\u9762"
          className={styles.pageArt}
          height={PAGE_ART_HEIGHT}
          priority
          src={PAGE_ART_SRC}
          unoptimized
          width={PAGE_ART_WIDTH}
        />
        <nav className={styles.hotspots} aria-label="100 sentence patterns navigation">
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
        <div className={styles.levelButtons} aria-label="\u0031\u0030\u0030\u4e2a\u53e3\u8bed\u53e5\u578b\u4e00\u7ea7\u83dc\u5355">
          {levelCardPositions.map((position) => {
            const level = levels.find((item) => item.id === position.id);
            if (!level) return null;

            return (
              <button
                type="button"
                className={`${styles.levelButton} ${
                  openLevelId === level.id ? styles.levelButtonActive : ""
                }`}
                key={level.id}
                style={hotspotStyle(position)}
                aria-expanded={openLevelId === level.id}
                onClick={() => openLevelMenu(level.id)}
              >
                <span className={styles.srOnly}>
                  {`\u6253\u5f00${level.menuTitle}\u4e8c\u7ea7\u83dc\u5355`}
                </span>
              </button>
            );
          })}
        </div>

        {openLevel ? (
          <aside
            className={styles.secondaryMenu}
            aria-label={`${openLevel.menuTitle}\u4e8c\u7ea7\u83dc\u5355`}
          >
            <header className={styles.secondaryHeader}>
              <strong>{openLevel.menuTitle}</strong>
              <span>{openLevel.totalPatterns} \u4e2a\u9884\u5236\u53e5\u578b</span>
            </header>
            <div className={styles.secondaryList}>
              {openLevel.sections.map((section) => (
                <section className={styles.secondarySection} key={section.id}>
                  <div className={styles.secondarySectionTitle}>
                    <strong>{section.title}</strong>
                    <span>{section.range}</span>
                  </div>
                  {section.patterns.map((pattern) => (
                    <button
                      type="button"
                      className={styles.secondaryItem}
                      key={pattern.id}
                      onClick={() => choosePattern(openLevel.id, pattern.id)}
                    >
                      <span>{pattern.id}</span>
                      <strong>{pattern.text}</strong>
                    </button>
                  ))}
                </section>
              ))}
            </div>
          </aside>
        ) : null}

        <section
          className={styles.practiceLayer}
          aria-label={`${selectedEntry.level.menuTitle} - ${selectedEntry.pattern.text}`}
        >
          <div className={styles.continueCopy}>
            <strong>{continueTitle}</strong>
            <span>{continueSubtitle}</span>
          </div>
          <Link
            aria-label="\u7ee7\u7eed\u5b66\u4e60\u4e0a\u6b21\u7684\u53e5\u578b\u7ec3\u4e60"
            className={styles.continueAction}
            href={continueHref}
          />
          <div className={styles.patternTitle}>
            <span>{`${selectedProgressPracticeId} / ${selectedPracticeCount}`}</span>
            <strong>{selectedEntry.pattern.text}</strong>
          </div>
          <button
            type="button"
            aria-label="\u4e0a\u4e00\u4e2a\u53e5\u578b"
            className={styles.previousPatternAction}
            onClick={() => chooseAdjacentPattern(previousPatternTarget)}
          />
          <button
            type="button"
            aria-label="\u4e0b\u4e00\u4e2a\u53e5\u578b"
            className={styles.nextPatternAction}
            onClick={() => chooseAdjacentPattern(nextPatternTarget)}
          />
          <div className={styles.patternProgressCopy}>
            <span>{`\u8fdb\u5ea6\uff1a\u7b2c ${selectedProgressPracticeId} / ${selectedPracticeCount} \u53e5`}</span>
            <strong>{`${selectedPercent}% \u5b8c\u6210`}</strong>
          </div>
          <div className={styles.patternProgressTrack} aria-hidden="true">
            <span style={{ width: `${selectedPercent}%` }} />
          </div>
          <div className={styles.promptText}>
            {selectedChinesePrompt}
          </div>
          <button
            type="button"
            aria-label="\u5f00\u59cb\u5f55\u5236\u5f53\u524d\u53e5\u578b"
            className={styles.recordAction}
            data-recording={isRecording}
            onClick={startEnglishRecording}
          >
            <span className={styles.recordActionContent}>
              <MicrophoneIcon />
              {isRecording ? "正在录制英语" : "点我，录制英语"}
            </span>
          </button>
          <button
            type="button"
            aria-label="\u4e0a\u4e00\u53e5\u7ec3\u4e60"
            className={`${styles.controlAction} ${styles.previousAction}`}
            onClick={() => choosePractice(selectedProgressPracticeId - 1)}
          >
            <span className={styles.controlActionContent}>
              <ArrowLeftIcon />
              上一句
            </span>
          </button>
          <button
            type="button"
            aria-label="\u7528 Alloy \u58f0\u97f3\u0030\u002e\u0037\u0035\u500d\u901f\u6717\u8bfb\u63a8\u8350\u8868\u8fbe"
            className={`${styles.controlAction} ${styles.slowAction}`}
            onClick={() => playPrebuiltExpression(selectedPractice.recommended)}
          >
            <span className={styles.controlActionContent}>
              <HeadphonesIcon />
              慢速朗读
            </span>
          </button>
          <button
            type="button"
            aria-label="\u4e0b\u4e00\u53e5\u7ec3\u4e60"
            className={`${styles.controlAction} ${styles.nextAction}`}
            onClick={() => choosePractice(selectedProgressPracticeId + 1)}
          >
            <span className={styles.controlActionContent}>
              下一句
              <ArrowRightIcon />
            </span>
          </button>
          <div className={styles.userExpressionCard}>
            <span className={styles.userExpressionLabel}>
              <MicrophoneIcon />
              你的表达
            </span>
            <button
              type="button"
              className={styles.userExpressionAudio}
              aria-label="播放你的表达"
              onClick={() =>
                playPrebuiltExpression(userTranscript || selectedPractice.targetEnglish)
              }
            >
              <SpeakerIcon />
            </button>
            <p>
              {userTranscript ||
                recordingStatus ||
                "点击蓝色按钮，录制你的英语表达"}
            </p>
            <small>
              <WaveIcon />
              点击播放你的录音
            </small>
          </div>
          <div className={styles.variantList}>
            {variants.map((variant) => (
              <article
                className={styles.variantCard}
                data-tone={variant.tone}
                key={variant.label}
              >
                <span className={styles.variantIcon} aria-hidden="true">
                  {variantIcon(variant.tone)}
                </span>
                <div className={styles.variantCopy}>
                  <strong>{variant.label}</strong>
                  <p>{variant.text}</p>
                  {variant.tone === "recommended" ? (
                    <small>
                      <StarIcon />
                      最自然、更常用的表达
                    </small>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={styles.variantAudioButton}
                  aria-label={`用 Alloy 声音0.75倍速朗读${variant.label}`}
                  onClick={() => playPrebuiltExpression(variant.text)}
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
