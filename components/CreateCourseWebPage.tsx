"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  parseTrainingContent,
  serializeTrainingItems,
  type TrainingItem,
} from "@/lib/training";
import styles from "./CreateCourseWebPage.module.css";

type CourseStatus = "published" | "draft" | "generating" | "failed";
type CourseSource = "text" | "audio" | "paste";
type UploadMode = "text" | "audio";
type StatusFilter = "all" | CourseStatus;

type StoredCourse = {
  id: string;
  title: string;
  txt_content: string;
  created_at: string;
  status?: CourseStatus;
  description?: string;
  sourceType?: CourseSource;
  error?: string;
};

type CourseRecord = {
  attempts: number;
  completedSentences: number;
  lastPracticedAt?: string;
  lastTranscript?: string;
};

type StoragePayload = Record<string, unknown> & {
  lessons?: StoredCourse[];
};

type GeneratedPair = {
  chinese?: unknown;
  english?: unknown;
  zh?: unknown;
  en?: unknown;
};

type ExtractTextResponse = {
  text?: string;
  fileName?: string;
  error?: string;
  message?: string;
};

type AudioTrainingResponse = {
  pairs?: GeneratedPair[];
  title?: string;
  error?: string;
  message?: string;
};

const LESSONS_STORAGE_KEY = "english-app-lessons";
const LAST_STUDY_PROGRESS_KEY = "lastStudyProgress";
const RECORDING_SILENCE_DELAY_MS = 2000;
const COURSE_RECORD_PREFIX = "create-course-record:";

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "全部课程", value: "all" },
  { label: "已发布", value: "published" },
  { label: "草稿", value: "draft" },
  { label: "生成中", value: "generating" },
  { label: "生成失败", value: "failed" },
];

const statusLabels: Record<CourseStatus, string> = {
  draft: "草稿",
  failed: "生成失败",
  generating: "生成中",
  published: "已发布",
};

const sourceLabels: Record<CourseSource, string> = {
  audio: "音频资料",
  paste: "粘贴文本",
  text: "文字资料",
};

const methodCards = [
  { icon: "1", label: "上传内容", text: "上传文字或音频材料" },
  { icon: "2", label: "课程设置", text: "设置课程信息和偏好" },
  { icon: "3", label: "AI 生成课程", text: "AI 分析并生成课程内容" },
  { icon: "4", label: "预览与编辑", text: "预览并自定义课程" },
  { icon: "5", label: "发布课程", text: "发布并分享课程" },
];

function normalizeStatus(status?: string): CourseStatus {
  if (
    status === "draft" ||
    status === "failed" ||
    status === "generating" ||
    status === "published"
  ) {
    return status;
  }

  return "published";
}

function readCourseStorage() {
  if (typeof window === "undefined") {
    return { courses: [] as StoredCourse[], payload: {} as StoragePayload };
  }

  try {
    const raw = window.localStorage.getItem(LESSONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const payload =
      typeof parsed === "object" && parsed !== null
        ? (parsed as StoragePayload)
        : {};
    const courses = Array.isArray(payload.lessons)
      ? payload.lessons.filter(
          (item): item is StoredCourse =>
            Boolean(item) &&
            typeof item.id === "string" &&
            typeof item.title === "string"
        )
      : [];

    return { courses, payload };
  } catch {
    return { courses: [] as StoredCourse[], payload: {} as StoragePayload };
  }
}

function writeCourseStorage(payload: StoragePayload, courses: StoredCourse[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LESSONS_STORAGE_KEY,
    JSON.stringify({ ...payload, lessons: courses })
  );
}

function sortCourses(courses: StoredCourse[]) {
  return [...courses].sort((a, b) => {
    const first = Date.parse(a.created_at || "");
    const second = Date.parse(b.created_at || "");
    return (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first);
  });
}

function createCourseId(source: CourseSource) {
  return `my-course-${source}-${Date.now()}`;
}

function stripFileExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function getCourseTitle(source: CourseSource, input: string) {
  const cleaned = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (cleaned) {
    return cleaned.length > 22 ? `${cleaned.slice(0, 22)}...` : cleaned;
  }

  if (source === "audio") return "音频生成课程";
  if (source === "paste") return "粘贴文本课程";
  return "文字生成课程";
}

function createDescription(count: number, source: CourseSource) {
  const sourceLabel = sourceLabels[source];
  if (!count) return `${sourceLabel}正在生成课程内容`;
  return `${sourceLabel}生成，共 ${count} 句练习`;
}

function normalizeTrainingPairs(data: unknown): TrainingItem[] {
  const rawItems = Array.isArray(data)
    ? data
    : typeof data === "object" &&
        data !== null &&
        Array.isArray((data as { pairs?: unknown[] }).pairs)
      ? (data as { pairs: unknown[] }).pairs
      : [];

  return rawItems
    .map((item) => {
      const record = item as GeneratedPair;
      const zh =
        typeof record.zh === "string"
          ? record.zh
          : typeof record.chinese === "string"
            ? record.chinese
            : "";
      const en =
        typeof record.en === "string"
          ? record.en
          : typeof record.english === "string"
            ? record.english
            : "";

      return {
        zh: zh.trim(),
        en: en.trim(),
      };
    })
    .filter((item) => item.zh || item.en);
}

async function readJsonError(response: Response) {
  try {
    const data = (await response.json()) as {
      error?: unknown;
      message?: unknown;
    };
    return (
      (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      "请求失败"
    );
  } catch {
    return "请求失败";
  }
}

async function requestTrainingFromText(text: string) {
  const response = await fetch("/api/generate-training", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response));
  }

  const data = await response.json();
  const items = normalizeTrainingPairs(data);

  if (items.length === 0) {
    throw new Error("没有生成可学习的句子，请换一段更完整的内容。");
  }

  return items;
}

async function requestTextFromFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/extract-text", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as ExtractTextResponse;

  if (!response.ok) {
    throw new Error(data.message || data.error || "文件文字读取失败");
  }

  if (!data.text?.trim()) {
    throw new Error("没有从文件里读取到文字内容。");
  }

  return data.text.trim();
}

async function requestTrainingFromAudio(file: File, title: string) {
  const formData = new FormData();
  formData.append("audio", file);
  formData.append("title", title);

  const response = await fetch("/api/audio-to-training", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as AudioTrainingResponse;

  if (!response.ok) {
    throw new Error(data.message || data.error || "音频识别失败");
  }

  const items = normalizeTrainingPairs(data.pairs || []);

  if (items.length === 0) {
    throw new Error("没有从音频里生成可学习的句子。");
  }

  return items;
}

function getPairs(course?: StoredCourse | null) {
  if (!course?.txt_content) return [];
  return parseTrainingContent(course.txt_content);
}

function getProgressIndex(courseId: string, total: number) {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(`lesson-progress-${courseId}`);
  const value = raw === null ? 0 : Number(raw);

  if (Number.isNaN(value) || value < 0) return 0;
  return Math.min(value, Math.max(0, total - 1));
}

function readCourseRecord(courseId: string): CourseRecord {
  if (typeof window === "undefined") {
    return { attempts: 0, completedSentences: 0 };
  }

  try {
    const raw = window.localStorage.getItem(`${COURSE_RECORD_PREFIX}${courseId}`);
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      attempts:
        typeof parsed?.attempts === "number" && parsed.attempts > 0
          ? parsed.attempts
          : 0,
      completedSentences:
        typeof parsed?.completedSentences === "number" &&
        parsed.completedSentences > 0
          ? parsed.completedSentences
          : 0,
      lastPracticedAt:
        typeof parsed?.lastPracticedAt === "string"
          ? parsed.lastPracticedAt
          : undefined,
      lastTranscript:
        typeof parsed?.lastTranscript === "string"
          ? parsed.lastTranscript
          : undefined,
    };
  } catch {
    return { attempts: 0, completedSentences: 0 };
  }
}

function writeCourseRecord(courseId: string, record: CourseRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `${COURSE_RECORD_PREFIX}${courseId}`,
    JSON.stringify(record)
  );
}

function formatDate(value?: string) {
  if (!value) return "暂无记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "暂无记录";
  return date.toLocaleString("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function estimateMinutes(count: number) {
  return Math.max(3, Math.ceil(count * 0.7));
}

function getCourseVisual(index: number) {
  const visuals = [
    styles.visualBlue,
    styles.visualGreen,
    styles.visualPurple,
    styles.visualOrange,
  ];
  return visuals[index % visuals.length];
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 9.5h14" />
      <path d="M8 6v7" />
      <path d="M12 4v12" />
      <path d="M16 7v6" />
      <path d="M7 18h10" />
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 16V5" />
      <path d="m7 10 5-5 5 5" />
      <path d="M5 19h14" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h5" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 18V6" />
      <path d="M13 16V8" />
      <path d="M17 14v-4" />
      <path d="M5 14v-4" />
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
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

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v6h-6" />
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

export function CreateCourseWebPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<StoredCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadMode, setUploadMode] = useState<UploadMode>("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [openMenuId, setOpenMenuId] = useState("");
  const [recordCourseId, setRecordCourseId] = useState("");
  const [spokenEnglish, setSpokenEnglish] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const textFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const speechSilenceTimerRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const { courses: storedCourses } = readCourseStorage();
    const sorted = sortCourses(storedCourses);
    setCourses(sorted);
    if (sorted[0]) {
      setSelectedCourseId(sorted[0].id);
      setCurrentIndex(0);
    }
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );
  const selectedPairs = useMemo(
    () => getPairs(selectedCourse),
    [selectedCourse]
  );
  const currentPair = selectedPairs[currentIndex] || null;

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const status = normalizeStatus(course.status);
      if (statusFilter !== "all" && status !== statusFilter) return false;

      if (!normalizedQuery) return true;

      const pairs = getPairs(course);
      const searchable = [
        course.title,
        course.description || "",
        course.error || "",
        pairs.map((pair) => `${pair.chinese} ${pair.english}`).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [courses, query, statusFilter]);

  const visibleCourses = showAllCourses
    ? filteredCourses
    : filteredCourses.slice(0, 4);

  const recordCourse =
    courses.find((course) => course.id === recordCourseId) || null;
  const recordPairs = getPairs(recordCourse);
  const storedRecord = recordCourse
    ? readCourseRecord(recordCourse.id)
    : { attempts: 0, completedSentences: 0 };
  const storedProgress =
    recordCourse && recordPairs.length
      ? getProgressIndex(recordCourse.id, recordPairs.length)
      : 0;
  const completedForRecord = recordPairs.length
    ? Math.min(
        recordPairs.length,
        Math.max(storedRecord.completedSentences, storedProgress + 1)
      )
    : 0;
  const progressPercent = recordPairs.length
    ? Math.round((completedForRecord / recordPairs.length) * 100)
    : 0;

  function saveCourses(nextCourses: StoredCourse[]) {
    const { payload } = readCourseStorage();
    const sorted = sortCourses(nextCourses);
    writeCourseStorage(payload, sorted);
    setCourses(sorted);
  }

  function updateCourse(courseId: string, patch: Partial<StoredCourse>) {
    setCourses((current) => {
      const nextCourses = sortCourses(
        current.map((course) =>
          course.id === courseId ? { ...course, ...patch } : course
        )
      );
      const { payload } = readCourseStorage();
      writeCourseStorage(payload, nextCourses);
      return nextCourses;
    });
  }

  function addPendingCourse(source: CourseSource, title: string) {
    const course: StoredCourse = {
      id: createCourseId(source),
      title,
      txt_content: "",
      created_at: new Date().toISOString(),
      description: createDescription(0, source),
      sourceType: source,
      status: "generating",
    };
    const nextCourses = [course, ...courses.filter((item) => item.id !== course.id)];
    saveCourses(nextCourses);
    setSelectedCourseId(course.id);
    setCurrentIndex(0);
    setSpokenEnglish("");
    setLiveTranscript("");
    return course;
  }

  function finishCourse(courseId: string, items: TrainingItem[], source: CourseSource) {
    const titleSource = source === "paste" ? pastedText : selectedFile?.name || "";
    const courseTitle = getCourseTitle(source, stripFileExtension(titleSource));
    const nextContent = serializeTrainingItems(items, {
      preserveOriginalItems: true,
    });

    updateCourse(courseId, {
      title: courseTitle,
      txt_content: nextContent,
      description: createDescription(items.length, source),
      status: "published",
      error: "",
    });
    setSelectedCourseId(courseId);
    setCurrentIndex(0);
    setSpokenEnglish("");
    setLiveTranscript("");
    window.localStorage.setItem("currentLessonTitle", courseTitle);
    window.localStorage.removeItem(`lesson-progress-${courseId}`);
    setMessage(`已生成 ${items.length} 句练习，课程已放到列表最顶部。`);
  }

  function failCourse(courseId: string, error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "课程生成失败，请稍后再试。";

    updateCourse(courseId, {
      description: errorMessage,
      error: errorMessage,
      status: "failed",
    });
    setMessage(errorMessage);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage(file ? `已选择：${file.name}` : "");
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      setMessage(`已选择：${file.name}`);
    }
  }

  function openFilePicker() {
    if (uploadMode === "audio") {
      audioFileInputRef.current?.click();
      return;
    }

    textFileInputRef.current?.click();
  }

  async function generateCourse() {
    if (isGenerating) return;

    const trimmedText = pastedText.trim();
    const hasTextFile = uploadMode === "text" && selectedFile;
    const hasAudioFile = uploadMode === "audio" && selectedFile;

    if (!hasTextFile && !hasAudioFile && !trimmedText) {
      setMessage("请先上传文字/音频资料，或在方框里粘贴文本。");
      return;
    }

    setIsGenerating(true);
    setMessage("正在生成课程...");

    const source: CourseSource = hasAudioFile
      ? "audio"
      : trimmedText
        ? "paste"
        : "text";
    const pendingTitle = selectedFile
      ? stripFileExtension(selectedFile.name)
      : getCourseTitle("paste", trimmedText);
    const pendingCourse = addPendingCourse(source, pendingTitle);

    try {
      let items: TrainingItem[];

      if (hasAudioFile && selectedFile) {
        items = await requestTrainingFromAudio(selectedFile, pendingTitle);
      } else {
        const sourceText =
          hasTextFile && selectedFile
            ? await requestTextFromFile(selectedFile)
            : trimmedText;
        items = await requestTrainingFromText(sourceText);
      }

      finishCourse(pendingCourse.id, items, source);
      setSelectedFile(null);
      setPastedText("");
    } catch (error) {
      failCourse(pendingCourse.id, error);
    } finally {
      setIsGenerating(false);
    }
  }

  function selectCourse(course: StoredCourse, useSavedProgress = false) {
    const pairs = getPairs(course);
    setSelectedCourseId(course.id);
    setCurrentIndex(useSavedProgress ? getProgressIndex(course.id, pairs.length) : 0);
    setOpenMenuId("");
    setSpokenEnglish("");
    setLiveTranscript("");
    setMessage("");
  }

  function startCourseInStudyPage(course: StoredCourse) {
    window.localStorage.setItem("currentLessonTitle", course.title);
    router.push(`/study/${course.id}`);
  }

  function deleteCourse(courseId: string) {
    const course = courses.find((item) => item.id === courseId);
    const confirmed = window.confirm(`删除课程“${course?.title || "未命名课程"}”？`);
    if (!confirmed) return;

    const nextCourses = courses.filter((item) => item.id !== courseId);
    saveCourses(nextCourses);
    window.localStorage.removeItem(`lesson-progress-${courseId}`);
    window.localStorage.removeItem(`${COURSE_RECORD_PREFIX}${courseId}`);

    try {
      const rawProgress = window.localStorage.getItem(LAST_STUDY_PROGRESS_KEY);
      const progress = rawProgress ? JSON.parse(rawProgress) : null;
      if (progress?.courseId === courseId) {
        window.localStorage.removeItem(LAST_STUDY_PROGRESS_KEY);
      }
    } catch {
      window.localStorage.removeItem(LAST_STUDY_PROGRESS_KEY);
    }

    if (selectedCourseId === courseId) {
      setSelectedCourseId(nextCourses[0]?.id || "");
      setCurrentIndex(0);
      setSpokenEnglish("");
      setLiveTranscript("");
    }

    setOpenMenuId("");
    setMessage("课程已删除。");
  }

  function getRecognitionConstructor() {
    if (typeof window === "undefined") return null;

    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function clearSpeechSilenceTimer() {
    if (speechSilenceTimerRef.current !== null) {
      window.clearTimeout(speechSilenceTimerRef.current);
      speechSilenceTimerRef.current = null;
    }
  }

  function stopEnglishRecognition() {
    clearSpeechSilenceTimer();
    recognitionRef.current?.stop();
  }

  function savePracticeRecord(finalTranscript: string) {
    if (!selectedCourse) return;
    const previous = readCourseRecord(selectedCourse.id);
    const completedSentences = Math.max(
      previous.completedSentences,
      Math.min(selectedPairs.length, currentIndex + 1)
    );
    const nextRecord: CourseRecord = {
      attempts: previous.attempts + 1,
      completedSentences,
      lastPracticedAt: new Date().toISOString(),
      lastTranscript: finalTranscript,
    };

    writeCourseRecord(selectedCourse.id, nextRecord);
    window.localStorage.setItem(`lesson-progress-${selectedCourse.id}`, String(currentIndex));
    window.localStorage.setItem(
      LAST_STUDY_PROGRESS_KEY,
      JSON.stringify({
        courseId: selectedCourse.id,
        sentenceIndex: currentIndex,
        updatedAt: nextRecord.lastPracticedAt,
      })
    );
  }

  function startEnglishRecognition(resetTranscript = false) {
    if (!currentPair) {
      setMessage("请先选择一个已有内容的课程。");
      return;
    }

    const RecognitionConstructor = getRecognitionConstructor();
    if (!RecognitionConstructor) {
      setMessage("当前浏览器不支持语音识别，请换用 Chrome 或 Edge。");
      return;
    }

    if (resetTranscript) {
      setSpokenEnglish("");
      setLiveTranscript("");
    }

    recognitionRef.current?.abort?.();
    clearSpeechSilenceTimer();
    finalTranscriptRef.current = "";

    const recognition = new RecognitionConstructor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    setIsRecording(true);
    setMessage("正在录音，说完停顿 2 秒会自动停止。");

    recognition.onresult = (event) => {
      let interim = "";
      const startIndex = event.resultIndex || 0;

      for (let index = startIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript || "";
        if (!transcript) continue;

        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${transcript}`.trim();
        } else {
          interim = `${interim} ${transcript}`.trim();
        }
      }

      const combined = `${finalTranscriptRef.current} ${interim}`.trim();
      if (combined) {
        setLiveTranscript(combined);
      }

      clearSpeechSilenceTimer();
      speechSilenceTimerRef.current = window.setTimeout(() => {
        stopEnglishRecognition();
      }, RECORDING_SILENCE_DELAY_MS);
    };

    recognition.onerror = () => {
      clearSpeechSilenceTimer();
      setIsRecording(false);
      setLiveTranscript("");
      setMessage("没有听清，请再试一次。");
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      clearSpeechSilenceTimer();
      const finalTranscript = (
        finalTranscriptRef.current || liveTranscript || ""
      ).trim();
      if (finalTranscript) {
        setSpokenEnglish(finalTranscript);
        savePracticeRecord(finalTranscript);
        setMessage("录音已保存。");
      } else {
        setMessage("没有听清，请再试一次。");
      }
      setLiveTranscript("");
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }

  function handleRecordButton() {
    if (isRecording) {
      stopEnglishRecognition();
      return;
    }

    startEnglishRecognition(false);
  }

  function handleRetryRecording() {
    if (isRecording) return;
    startEnglishRecognition(true);
  }

  function goPreviousSentence() {
    if (!selectedCourse || currentIndex <= 0) return;
    const nextIndex = currentIndex - 1;
    setCurrentIndex(nextIndex);
    setSpokenEnglish("");
    setLiveTranscript("");
    window.localStorage.setItem(`lesson-progress-${selectedCourse.id}`, String(nextIndex));
  }

  function goNextSentence() {
    if (!selectedCourse || currentIndex >= selectedPairs.length - 1) return;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSpokenEnglish("");
    setLiveTranscript("");
    window.localStorage.setItem(`lesson-progress-${selectedCourse.id}`, String(nextIndex));
  }

  const practiceTranscript = isRecording && liveTranscript ? liveTranscript : spokenEnglish;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="SpeakFlow 首页">
          <span className={styles.brandIcon}>
            <BrandIcon />
          </span>
          <span>SpeakFlow</span>
        </Link>
        <nav className={styles.nav} aria-label="主导航">
          <Link href="/">首页</Link>
          <Link href="/free-study">开始学习</Link>
          <Link href="/new-expressions">我的表达</Link>
          <Link href="/create-course" className={styles.activeNav}>
            创建课程
          </Link>
          <Link href="/about">关于我们</Link>
          <Link href="/contact">联系我们</Link>
        </nav>
        <div className={styles.topActions}>
          <Link href="/subscription" className={styles.upgrade}>
            <CrownIcon />
            会员版
          </Link>
          <Link href="/notifications" aria-label="通知" className={styles.iconLink}>
            <BellIcon />
          </Link>
          <Link href="/account" className={styles.language}>
            <span>
              <GlobeIcon />
            </span>
            English Learner
          </Link>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="create-course-title">
        <span className={styles.heroIcon}>
          <SparkleIcon />
        </span>
        <div className={styles.heroCopy}>
          <h1>创建你的专属课程</h1>
          <p>上传你的学习材料，AI 将为你自动生成结构化课程内容</p>
        </div>
        <div className={styles.heroStats}>
          <span>已创建 {courses.length} 门</span>
          <span>{selectedPairs.length || 0} 句预览</span>
        </div>
      </section>

      <section className={styles.steps} aria-label="创建课程步骤">
        {methodCards.map((card, index) => (
          <div
            className={`${styles.step} ${index === 0 ? styles.stepActive : ""}`}
            key={card.label}
          >
            <span>{card.icon}</span>
            <div>
              <strong>{card.label}</strong>
              <p>{card.text}</p>
            </div>
          </div>
        ))}
      </section>

      <div className={styles.workspace}>
        <section className={styles.leftColumn}>
          <section
            className={`${styles.panel} ${styles.uploadPanel}`}
            aria-labelledby="upload-material-title"
          >
            <header className={styles.panelHeader}>
              <span>
                <UploadIcon />
              </span>
              <div>
                <p>上传内容</p>
                <h2 id="upload-material-title">上传学习材料</h2>
              </div>
            </header>

            <div className={styles.uploadTabs}>
              <button
                type="button"
                className={uploadMode === "text" ? styles.tabActive : ""}
                onClick={() => {
                  setUploadMode("text");
                  setSelectedFile(null);
                }}
              >
                <FileTextIcon />
                上传文字
              </button>
              <button
                type="button"
                className={uploadMode === "audio" ? styles.tabActive : ""}
                onClick={() => {
                  setUploadMode("audio");
                  setSelectedFile(null);
                }}
              >
                <AudioIcon />
                上传音频
              </button>
            </div>

            <input
              ref={textFileInputRef}
              type="file"
              accept=".txt,.text,.srt,.pdf,.docx"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.webm,.ogg"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />

            <button
              type="button"
              className={styles.dropzone}
              onClick={openFilePicker}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <span className={styles.fileIcon}>
                {uploadMode === "audio" ? <AudioIcon /> : <UploadIcon />}
              </span>
              <strong>
                {selectedFile
                  ? selectedFile.name
                  : uploadMode === "audio"
                    ? "拖拽音频到这里 或 点击上传"
                    : "拖拽文件到这里 或 点击上传"}
              </strong>
              <small>
                {uploadMode === "audio"
                  ? "支持 MP3、M4A、WAV、WEBM 等音频格式"
                  : "支持 TXT、PDF、DOCX 格式，最大 20MB"}
              </small>
            </button>

            <div className={styles.divider}>
              <span>或</span>
            </div>

            <label className={styles.textareaLabel} htmlFor="course-textarea">
              直接粘贴或输入文字
            </label>
            <textarea
              id="course-textarea"
              value={pastedText}
              onChange={(event) => {
                setPastedText(event.target.value.slice(0, 50000));
                setMessage("");
              }}
              placeholder="在此粘贴或输入你的学习材料内容..."
              className={styles.textarea}
            />
            <div className={styles.textareaMeta}>
              <span>小贴士：内容越完整，生成的课程质量越高哦！</span>
              <span>{pastedText.length} / 50000</span>
            </div>

            <button
              type="button"
              className={styles.generateButton}
              disabled={isGenerating}
              onClick={generateCourse}
            >
              <SparkleIcon />
              {isGenerating ? "正在生成课程" : "一键生成课程"}
            </button>

            {message ? <p className={styles.message}>{message}</p> : null}
          </section>

          <section className={`${styles.panel} ${styles.coursePanel}`}>
            <div className={styles.courseHeader}>
              <div>
                <p>课程列表</p>
                <h2>学习自己创建的课程</h2>
              </div>
              <span>{filteredCourses.length} 门</span>
            </div>

            <div className={styles.courseControls}>
              <label className={styles.searchBox}>
                <SearchIcon />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setShowAllCourses(false);
                  }}
                  placeholder="搜索课程名称"
                />
              </label>
              <label className={styles.statusSelect}>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as StatusFilter);
                    setShowAllCourses(false);
                  }}
                >
                  {statusOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.courseList}>
              {visibleCourses.length ? (
                visibleCourses.map((course, index) => {
                  const pairs = getPairs(course);
                  const status = normalizeStatus(course.status);
                  const canStudy = status === "published" && pairs.length > 0;

                  return (
                    <article className={styles.courseCard} key={course.id}>
                      <button
                        type="button"
                        className={`${styles.courseVisual} ${getCourseVisual(index)}`}
                        aria-label={`预览 ${course.title}`}
                        onClick={() => selectCourse(course)}
                      >
                        {course.sourceType === "audio" ? <AudioIcon /> : <FileTextIcon />}
                      </button>

                      <button
                        type="button"
                        className={styles.courseCopy}
                        onClick={() => selectCourse(course)}
                      >
                        <span>
                          <strong>{course.title}</strong>
                          <em data-status={status}>{statusLabels[status]}</em>
                        </span>
                        <small>{course.description || createDescription(pairs.length, "text")}</small>
                        <i>
                          <span>{Math.max(1, Math.ceil(pairs.length / 12))} 个章节</span>
                          <span>{estimateMinutes(pairs.length)} 分钟</span>
                        </i>
                      </button>

                      <div className={styles.courseActions}>
                        <button
                          type="button"
                          className={styles.studyButton}
                          disabled={!canStudy}
                          onClick={() => selectCourse(course)}
                        >
                          {status === "draft"
                            ? "继续编辑"
                            : status === "generating"
                              ? "生成中"
                              : status === "failed"
                                ? "失败"
                                : "开始学习"}
                        </button>
                        {canStudy ? (
                          <button
                            type="button"
                            className={styles.openStudyButton}
                            onClick={() => startCourseInStudyPage(course)}
                          >
                            打开学习页
                          </button>
                        ) : null}
                        <div className={styles.menuWrap}>
                          <button
                            type="button"
                            aria-label={`${course.title} 更多操作`}
                          className={styles.moreButton}
                          onClick={() =>
                            setOpenMenuId((current) =>
                              current === course.id ? "" : course.id
                            )
                          }
                        >
                            <MoreIcon />
                        </button>
                        {openMenuId === course.id ? (
                          <div className={styles.courseMenu}>
                            <button
                              type="button"
                                onClick={() => {
                                  setRecordCourseId(course.id);
                                setOpenMenuId("");
                              }}
                            >
                              <ChartIcon />
                              学习记录
                            </button>
                            <button
                              type="button"
                              className={styles.deleteMenuItem}
                              onClick={() => deleteCourse(course.id)}
                            >
                              <TrashIcon />
                              删除课程
                            </button>
                          </div>
                        ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className={styles.emptyCourses}>
                  <strong>还没有课程</strong>
                  <span>上传材料或粘贴文本后，生成的课程会显示在这里。</span>
                </div>
              )}
            </div>

            {filteredCourses.length > 4 ? (
              <button
                type="button"
                className={styles.showAllButton}
                onClick={() => setShowAllCourses((current) => !current)}
              >
                {showAllCourses ? "收起课程" : "查看全部课程"}
                <ChevronIcon />
              </button>
            ) : null}
          </section>
        </section>

        <aside className={styles.practicePanel}>
          <section className={styles.previewCard} aria-labelledby="preview-title">
            <header className={styles.panelHeader}>
              <span>
                <MicIcon />
              </span>
              <div>
                <p>学习预览</p>
                <h2 id="preview-title">看看中文说英文</h2>
              </div>
            </header>
            <div className={styles.chineseBox}>
              {currentPair?.chinese || "点击左侧课程卡片，第一句中文会出现在这里。"}
            </div>
            <button
              type="button"
              className={`${styles.recordButton} ${isRecording ? styles.recording : ""}`}
              onClick={handleRecordButton}
              disabled={!currentPair}
            >
              <MicIcon />
              {isRecording ? "再次点击，停止录音" : "点我，录制英语"}
            </button>
          </section>

          <section className={styles.recordCard}>
            <div className={styles.sectionTitleRow}>
              <h2>你的英文录音</h2>
              <button
                type="button"
                className={styles.retryButton}
                onClick={handleRetryRecording}
                disabled={!currentPair || isRecording}
              >
                <RefreshIcon />
                重新说
              </button>
            </div>
            <div className={styles.englishBox}>
              {practiceTranscript || "录制完成后，用户说的英文会出现在这里。"}
            </div>
          </section>

          <section className={styles.recommendPanel}>
            <h2>
              推荐表达 <span>AI 优化结果</span>
            </h2>
            <div className={styles.variantList}>
              {currentPair?.english ? (
                <>
                  <div className={styles.variantCard} data-tone="blue">
                    <strong>推荐表达</strong>
                    <p>{currentPair.english}</p>
                  </div>
                  <div className={styles.variantCard} data-tone="green">
                    <strong>更简单</strong>
                    <p>{currentPair.english}</p>
                  </div>
                  <div className={styles.variantCard} data-tone="purple">
                    <strong>更口语</strong>
                    <p>{currentPair.english}</p>
                  </div>
                </>
              ) : (
                <div className={styles.emptyRecommendation}>
                  选择课程后，这里会显示这句中文对应的正确英文表达。
                </div>
              )}
            </div>
          </section>

          <div className={styles.practiceNavigation}>
            <button type="button" onClick={goPreviousSentence} disabled={currentIndex <= 0}>
              <ChevronIcon direction="left" />
              上一句
            </button>
            <span>
              {selectedPairs.length ? currentIndex + 1 : 0} / {selectedPairs.length || 0}
            </span>
            <button
              type="button"
              onClick={goNextSentence}
              disabled={!selectedPairs.length || currentIndex >= selectedPairs.length - 1}
            >
              下一句
              <ChevronIcon />
            </button>
          </div>
        </aside>
      </div>

      {recordCourse ? (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <section className={styles.recordModal}>
            <button
              type="button"
              className={styles.closeModal}
              onClick={() => setRecordCourseId("")}
              aria-label="关闭学习记录"
            >
              关闭
            </button>
            <h2>学习记录</h2>
            <p className={styles.modalCourseTitle}>{recordCourse.title}</p>
            <div className={styles.recordStats}>
              <div>
                <strong>{completedForRecord}</strong>
                <span>已练句子</span>
              </div>
              <div>
                <strong>{recordPairs.length}</strong>
                <span>总句数</span>
              </div>
              <div>
                <strong>{progressPercent}%</strong>
                <span>完成度</span>
              </div>
              <div>
                <strong>{storedRecord.attempts}</strong>
                <span>录音次数</span>
              </div>
            </div>
            <div className={styles.progressTrack}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <dl className={styles.recordDetails}>
              <div>
                <dt>最近练习</dt>
                <dd>{formatDate(storedRecord.lastPracticedAt)}</dd>
              </div>
              <div>
                <dt>当前进度</dt>
                <dd>
                  第 {recordPairs.length ? Math.min(storedProgress + 1, recordPairs.length) : 0} /{" "}
                  {recordPairs.length} 句
                </dd>
              </div>
              <div>
                <dt>最近录音</dt>
                <dd>{storedRecord.lastTranscript || "暂无录音文本"}</dd>
              </div>
            </dl>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  selectCourse(recordCourse, true);
                  setRecordCourseId("");
                }}
              >
                回到此进度
              </button>
              <button
                type="button"
                onClick={() => {
                  startCourseInStudyPage(recordCourse);
                  setRecordCourseId("");
                }}
              >
                打开学习页
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
