import type { NativeFlowLevelId } from "@/data/nativeFlow/courseData";

export type NativeFlowContinueProgress = {
  levelId: NativeFlowLevelId;
  sentenceId: number;
  updatedAt: string;
};

export type NativeFlowProgressRowSnapshot = {
  completed: number;
  levelId: NativeFlowLevelId;
  percent: number;
  totalSentences: number;
};

export type NativeFlowProgressSnapshot = {
  continueProgress: NativeFlowContinueProgress | null;
  rows: NativeFlowProgressRowSnapshot[];
};

export type NativeFlowProgressRequest = {
  completed?: boolean;
  levelId: NativeFlowLevelId;
  saveContinue?: boolean;
  sentenceId: number;
  totalSentences?: number;
};

const NATIVE_FLOW_CONTINUE_STORAGE_KEY = "speakflow-native-flow-continue";

export function createNativeFlowLearnHref(
  levelId: NativeFlowLevelId,
  sentenceId = 1
) {
  return `/native-flow/${levelId}/learn?sentence=${sentenceId}`;
}

export function isNativeFlowLevelId(value: unknown): value is NativeFlowLevelId {
  return (
    value === "everyday" ||
    value === "simple-life" ||
    value === "natural" ||
    value === "native"
  );
}

export function normalizeNativeFlowSentenceId(
  value: unknown,
  totalSentences = 600,
  minimum = 1
) {
  const sentenceId =
    typeof value === "number" ? value : Number.parseInt(String(value || "1"), 10);

  if (!Number.isFinite(sentenceId)) return 1;

  return Math.min(Math.max(Math.floor(sentenceId), minimum), totalSentences);
}

export function readNativeFlowContinueProgress() {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(NATIVE_FLOW_CONTINUE_STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Partial<NativeFlowContinueProgress>;
    if (!isNativeFlowLevelId(parsed.levelId)) return null;

    return {
      levelId: parsed.levelId,
      sentenceId: normalizeNativeFlowSentenceId(parsed.sentenceId),
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    } satisfies NativeFlowContinueProgress;
  } catch {
    return null;
  }
}

export function saveNativeFlowContinueProgress({
  levelId,
  sentenceId,
  totalSentences,
}: {
  levelId: NativeFlowLevelId;
  sentenceId: number;
  totalSentences?: number;
}) {
  if (typeof window === "undefined") return;

  const progress: NativeFlowContinueProgress = {
    levelId,
    sentenceId: normalizeNativeFlowSentenceId(sentenceId, totalSentences),
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    NATIVE_FLOW_CONTINUE_STORAGE_KEY,
    JSON.stringify(progress)
  );
}

function normalizeProgressRows(value: unknown): NativeFlowProgressRowSnapshot[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Partial<NativeFlowProgressRowSnapshot>;
    if (!isNativeFlowLevelId(row.levelId)) return [];

    const totalSentences = normalizeNativeFlowSentenceId(
      row.totalSentences || 600,
      10000
    );
    const completed = Math.min(
      normalizeNativeFlowSentenceId(row.completed || 0, totalSentences, 0),
      totalSentences
    );
    const percent =
      typeof row.percent === "number" && Number.isFinite(row.percent)
        ? Math.min(100, Math.max(0, Math.round(row.percent)))
        : Math.round((completed / Math.max(totalSentences, 1)) * 100);

    return [{
      completed,
      levelId: row.levelId,
      percent,
      totalSentences,
    }];
  });
}

function normalizeProgressSnapshot(value: unknown): NativeFlowProgressSnapshot | null {
  if (!value || typeof value !== "object") return null;

  const snapshot = value as Partial<NativeFlowProgressSnapshot>;
  const rows = normalizeProgressRows(snapshot.rows);
  const continueProgress = snapshot.continueProgress;

  return {
    continueProgress:
      continueProgress && isNativeFlowLevelId(continueProgress.levelId)
        ? {
            levelId: continueProgress.levelId,
            sentenceId: normalizeNativeFlowSentenceId(continueProgress.sentenceId),
            updatedAt:
              typeof continueProgress.updatedAt === "string"
                ? continueProgress.updatedAt
                : new Date().toISOString(),
          }
        : null,
    rows,
  };
}

export async function fetchNativeFlowProgress() {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch("/api/native-flow/progress", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) return null;

    return normalizeProgressSnapshot(await response.json());
  } catch {
    return null;
  }
}

export async function recordNativeFlowProgress(progress: NativeFlowProgressRequest) {
  if (progress.saveContinue !== false) {
    saveNativeFlowContinueProgress(progress);
  }

  if (typeof window === "undefined") return null;

  try {
    const response = await fetch("/api/native-flow/progress", {
      body: JSON.stringify(progress),
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    if (!response.ok) return null;

    return normalizeProgressSnapshot(await response.json());
  } catch {
    return null;
  }
}
