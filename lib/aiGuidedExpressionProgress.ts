import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const AI_GUIDED_DAILY_GOAL = 10;

export type AiGuidedStepId = "native" | "english" | "suggestions" | "follow";
export type AiGuidedStepStatus = "active" | "completed" | "locked";

export type AiGuidedProgressStep = {
  id: AiGuidedStepId;
  label: string;
  status: AiGuidedStepStatus;
};

export type AiGuidedProgressSnapshot = {
  challenge: {
    completed: number;
    goal: number;
    percent: number;
  };
  dailyGoal: number;
  level: number;
  steps: Record<AiGuidedStepId, AiGuidedProgressStep>;
  streakDays: number;
  todayCompleted: number;
  totalCompleted: number;
};

export type AiGuidedProgressEvent = {
  completionId?: string;
  countExpression?: boolean;
  step?: AiGuidedStepId;
};

type StoredAiGuidedProgress = {
  completedExpressionIds: string[];
  createdAt: string;
  dailyCounts: Record<string, number>;
  stepCompletions: Partial<Record<AiGuidedStepId, string>>;
  updatedAt: string;
  userKey: string;
};

type ProgressFileStore = Record<string, StoredAiGuidedProgress>;

type ProgressRow = {
  progress: unknown;
  user_key: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const PROGRESS_FILE = path.join(DATA_DIR, "ai-guided-expression-progress.json");
const stepIds = new Set<AiGuidedStepId>([
  "native",
  "english",
  "suggestions",
  "follow",
]);

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, delta: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + delta);
  return getTodayKey(date);
}

function createEmptyProgress(userKey: string): StoredAiGuidedProgress {
  const now = new Date().toISOString();

  return {
    completedExpressionIds: [],
    createdAt: now,
    dailyCounts: {},
    stepCompletions: {},
    updatedAt: now,
    userKey,
  };
}

function cleanCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function cleanDate(value: unknown) {
  if (typeof value !== "string") return "";

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? value : "";
}

function cleanStepCompletions(value: unknown) {
  const completions: Partial<Record<AiGuidedStepId, string>> = {};
  if (!value || typeof value !== "object") return completions;

  Object.entries(value as Record<string, unknown>).forEach(([key, completedAt]) => {
    if (!stepIds.has(key as AiGuidedStepId)) return;

    const cleanCompletedAt = cleanDate(completedAt);
    if (cleanCompletedAt) {
      completions[key as AiGuidedStepId] = cleanCompletedAt;
    }
  });

  return completions;
}

function normalizeProgress(
  userKey: string,
  rawProgress: unknown
): StoredAiGuidedProgress {
  if (!rawProgress || typeof rawProgress !== "object") {
    return createEmptyProgress(userKey);
  }

  const record = rawProgress as Partial<StoredAiGuidedProgress>;
  const dailyCounts: Record<string, number> = {};
  Object.entries(record.dailyCounts || {}).forEach(([dateKey, count]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
    dailyCounts[dateKey] = cleanCount(count);
  });

  return {
    completedExpressionIds: Array.isArray(record.completedExpressionIds)
      ? record.completedExpressionIds.filter(
          (id): id is string => typeof id === "string" && Boolean(id.trim())
        )
      : [],
    createdAt: cleanDate(record.createdAt) || new Date().toISOString(),
    dailyCounts,
    stepCompletions: cleanStepCompletions(record.stepCompletions),
    updatedAt: cleanDate(record.updatedAt) || new Date().toISOString(),
    userKey,
  };
}

async function ensureFileStoreDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readFileStore() {
  let raw = "{}";

  try {
    raw = await readFile(PROGRESS_FILE, "utf8");
  } catch {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as ProgressFileStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeFileStore(store: ProgressFileStore) {
  await ensureFileStoreDir();
  await writeFile(PROGRESS_FILE, JSON.stringify(store, null, 2), "utf8");
}

async function loadCloudProgress(userKey: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_ai_guided_progress")
    .select("user_key, progress")
    .eq("user_key", userKey)
    .maybeSingle<ProgressRow>();

  if (error) throw error;

  return data ? normalizeProgress(userKey, data.progress) : null;
}

async function saveCloudProgress(progress: StoredAiGuidedProgress) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("user_ai_guided_progress").upsert(
    {
      progress,
      updated_at: progress.updatedAt,
      user_key: progress.userKey,
    },
    { onConflict: "user_key" }
  );

  if (error) throw error;
}

async function loadStoredProgress(userKey: string) {
  try {
    const cloudProgress = await loadCloudProgress(userKey);
    if (cloudProgress) return cloudProgress;
  } catch {
    // Fall back to the local backend store when Supabase or the table is absent.
  }

  const store = await readFileStore();
  return normalizeProgress(userKey, store[userKey]);
}

async function saveStoredProgress(progress: StoredAiGuidedProgress) {
  try {
    await saveCloudProgress(progress);
  } catch {
    // Local backend fallback keeps the feature usable without the optional table.
  }

  const store = await readFileStore();
  store[progress.userKey] = progress;
  await writeFileStore(store);
}

function isCompleted(
  progress: StoredAiGuidedProgress,
  step: AiGuidedStepId
) {
  return Boolean(progress.stepCompletions[step]);
}

function stepLabel(status: AiGuidedStepStatus, step: AiGuidedStepId) {
  if (status === "completed") return "已完成";
  if (status === "locked") return "待解锁";
  return step === "suggestions" || step === "follow" ? "已解锁" : "开始练习";
}

function createStep(
  progress: StoredAiGuidedProgress,
  step: AiGuidedStepId,
  status: AiGuidedStepStatus
): AiGuidedProgressStep {
  return {
    id: step,
    label: stepLabel(status, step),
    status,
  };
}

function calculateStreakDays(dailyCounts: Record<string, number>) {
  let streak = 0;
  let cursor = getTodayKey();

  while (cleanCount(dailyCounts[cursor]) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function markStepCompleted(
  progress: StoredAiGuidedProgress,
  step: AiGuidedStepId,
  completedAt: string
) {
  progress.stepCompletions[step] ||= completedAt;
}

function markStepWithPrerequisites(
  progress: StoredAiGuidedProgress,
  step: AiGuidedStepId,
  completedAt: string
) {
  if (step === "native") {
    markStepCompleted(progress, "native", completedAt);
    return;
  }

  if (step === "english") {
    markStepCompleted(progress, "native", completedAt);
    markStepCompleted(progress, "english", completedAt);
    markStepCompleted(progress, "suggestions", completedAt);
    return;
  }

  if (step === "suggestions") {
    markStepCompleted(progress, "native", completedAt);
    markStepCompleted(progress, "english", completedAt);
    markStepCompleted(progress, "suggestions", completedAt);
    return;
  }

  markStepCompleted(progress, "native", completedAt);
  markStepCompleted(progress, "english", completedAt);
  markStepCompleted(progress, "suggestions", completedAt);
  markStepCompleted(progress, "follow", completedAt);
}

function snapshotFromStoredProgress(
  progress: StoredAiGuidedProgress
): AiGuidedProgressSnapshot {
  const nativeCompleted = isCompleted(progress, "native");
  const englishCompleted = isCompleted(progress, "english");
  const suggestionsCompleted = isCompleted(progress, "suggestions");
  const followCompleted = isCompleted(progress, "follow");
  const todayCompleted = cleanCount(progress.dailyCounts[getTodayKey()]);
  const totalCompleted = Object.values(progress.dailyCounts).reduce(
    (sum, count) => sum + cleanCount(count),
    0
  );

  return {
    challenge: {
      completed: todayCompleted,
      goal: AI_GUIDED_DAILY_GOAL,
      percent: Math.min(100, Math.round((todayCompleted / AI_GUIDED_DAILY_GOAL) * 100)),
    },
    dailyGoal: AI_GUIDED_DAILY_GOAL,
    level: Math.max(1, Math.floor(totalCompleted / AI_GUIDED_DAILY_GOAL) + 1),
    steps: {
      english: createStep(
        progress,
        "english",
        !nativeCompleted ? "locked" : englishCompleted ? "completed" : "active"
      ),
      follow: createStep(
        progress,
        "follow",
        !suggestionsCompleted
          ? "locked"
          : followCompleted
            ? "completed"
            : "active"
      ),
      native: createStep(
        progress,
        "native",
        nativeCompleted ? "completed" : "active"
      ),
      suggestions: createStep(
        progress,
        "suggestions",
        !englishCompleted
          ? "locked"
          : suggestionsCompleted
            ? "completed"
            : "active"
      ),
    },
    streakDays: calculateStreakDays(progress.dailyCounts),
    todayCompleted,
    totalCompleted,
  };
}

export function isAiGuidedStepId(value: unknown): value is AiGuidedStepId {
  return typeof value === "string" && stepIds.has(value as AiGuidedStepId);
}

export async function getAiGuidedProgress(userKey: string) {
  const progress = await loadStoredProgress(userKey);
  return snapshotFromStoredProgress(progress);
}

export async function recordAiGuidedProgressEvent(
  userKey: string,
  event: AiGuidedProgressEvent
) {
  const progress = await loadStoredProgress(userKey);
  const now = new Date().toISOString();

  if (event.step) {
    markStepWithPrerequisites(progress, event.step, now);
  }

  if (event.countExpression) {
    const todayKey = getTodayKey();
    const completionId =
      event.completionId?.trim() || `${todayKey}:${progress.completedExpressionIds.length + 1}`;

    if (!progress.completedExpressionIds.includes(completionId)) {
      progress.completedExpressionIds.push(completionId);
      progress.dailyCounts[todayKey] = cleanCount(progress.dailyCounts[todayKey]) + 1;
    }
  }

  progress.updatedAt = now;
  await saveStoredProgress(progress);

  return snapshotFromStoredProgress(progress);
}
