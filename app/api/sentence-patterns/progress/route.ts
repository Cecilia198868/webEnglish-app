import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { authOptions } from "@/auth";
import type {
  SentencePatternContinueProgress,
  SentencePatternProgressSnapshot,
} from "@/lib/sentencePatternProgress";
import { createSentencePatternProgressHref } from "@/lib/sentencePatternProgress";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ANONYMOUS_PROGRESS_COOKIE = "speakflow-sentence-pattern-progress-id";
const DATA_DIR = path.join(process.cwd(), ".data");
const PROGRESS_FILE = path.join(DATA_DIR, "sentence-pattern-progress.json");

type ProgressOwner = {
  anonymousId?: string;
  shouldSetCookie: boolean;
  userKey: string;
};

type StoredSentencePatternProgress = {
  completedPracticeIds: Record<string, number[]>;
  continueProgress: SentencePatternContinueProgress | null;
  createdAt: string;
  updatedAt: string;
  userKey: string;
};

type ProgressFileStore = Record<string, StoredSentencePatternProgress>;

type ProgressBody = {
  completed?: unknown;
  levelId?: unknown;
  levelTitle?: unknown;
  patternId?: unknown;
  patternText?: unknown;
  practiceCount?: unknown;
  practiceId?: unknown;
  sectionTitle?: unknown;
};

async function getProgressOwner(request: NextRequest): Promise<ProgressOwner> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (email) {
    return {
      shouldSetCookie: false,
      userKey: `user:${email}`,
    };
  }

  const existingAnonymousId =
    request.cookies.get(ANONYMOUS_PROGRESS_COOKIE)?.value || "";
  const anonymousId = existingAnonymousId || randomUUID();

  return {
    anonymousId,
    shouldSetCookie: !existingAnonymousId,
    userKey: `anonymous:${anonymousId}`,
  };
}

function withAnonymousCookie(response: NextResponse, owner: ProgressOwner) {
  if (!owner.shouldSetCookie || !owner.anonymousId) return response;

  response.cookies.set(ANONYMOUS_PROGRESS_COOKIE, owner.anonymousId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

function clampInteger(value: unknown, fallback: number, minimum = 0) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numeric)
    ? Math.max(minimum, Math.floor(numeric))
    : fallback;
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createEmptyProgress(userKey: string): StoredSentencePatternProgress {
  const now = new Date().toISOString();

  return {
    completedPracticeIds: {},
    continueProgress: null,
    createdAt: now,
    updatedAt: now,
    userKey,
  };
}

function normalizePracticeIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => clampInteger(item, 0, 1))
        .filter((item) => item > 0)
    )
  ).sort((a, b) => a - b);
}

function normalizeStoredProgress(
  userKey: string,
  rawProgress: unknown
): StoredSentencePatternProgress {
  if (!rawProgress || typeof rawProgress !== "object") {
    return createEmptyProgress(userKey);
  }

  const record = rawProgress as Partial<StoredSentencePatternProgress>;
  const completedPracticeIds: Record<string, number[]> = {};
  Object.entries(record.completedPracticeIds || {}).forEach(([key, value]) => {
    if (!key.includes(":")) return;
    completedPracticeIds[key] = normalizePracticeIds(value);
  });

  return {
    completedPracticeIds,
    continueProgress: normalizeContinueProgress(record.continueProgress),
    createdAt: cleanText(record.createdAt, new Date().toISOString()),
    updatedAt: cleanText(record.updatedAt, new Date().toISOString()),
    userKey,
  };
}

function normalizeContinueProgress(value: unknown) {
  if (!value || typeof value !== "object") return null;

  const record = value as Partial<SentencePatternContinueProgress>;
  const levelId = cleanText(record.levelId);
  const patternId = clampInteger(record.patternId, 0, 1);
  const practiceCount = clampInteger(record.practiceCount, 20, 1);
  const practiceId = Math.min(
    clampInteger(record.practiceId, 1, 1),
    practiceCount
  );

  if (!levelId || patternId < 1) return null;

  return {
    href: createSentencePatternProgressHref(levelId, patternId, practiceId),
    levelId,
    levelTitle: cleanText(record.levelTitle, "100个口语句型"),
    patternId,
    patternText: cleanText(record.patternText),
    practiceCount,
    practiceId,
    sectionTitle: cleanText(record.sectionTitle),
    updatedAt: cleanText(record.updatedAt, new Date().toISOString()),
  } satisfies SentencePatternContinueProgress;
}

function progressKey(levelId: string, patternId: number) {
  return `${levelId}:${patternId}`;
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

async function loadStoredProgress(userKey: string) {
  const store = await readFileStore();
  return normalizeStoredProgress(userKey, store[userKey]);
}

async function saveStoredProgress(progress: StoredSentencePatternProgress) {
  const store = await readFileStore();
  store[progress.userKey] = progress;
  await writeFileStore(store);
}

function snapshotFromStoredProgress(
  progress: StoredSentencePatternProgress,
  levelId: string,
  patternId: number,
  practiceCount: number
): SentencePatternProgressSnapshot {
  const key = progressKey(levelId, patternId);
  const completedPracticeIds = normalizePracticeIds(progress.completedPracticeIds[key]);
  const completedPracticeCount = completedPracticeIds.filter(
    (practiceId) => practiceId <= practiceCount
  ).length;
  const matchingContinueProgress =
    progress.continueProgress?.levelId === levelId &&
    progress.continueProgress.patternId === patternId
      ? progress.continueProgress
      : null;
  const nextPracticeAfterCompleted = Math.min(
    completedPracticeCount + 1,
    practiceCount
  );
  const currentPracticeId = matchingContinueProgress
    ? Math.min(matchingContinueProgress.practiceId, practiceCount)
    : Math.max(nextPracticeAfterCompleted, 1);

  return {
    completedPracticeCount,
    continueProgress: progress.continueProgress,
    currentPracticeId,
    percent: Math.min(
      100,
      Math.round((currentPracticeId / Math.max(practiceCount, 1)) * 100)
    ),
    practiceCount,
  };
}

export async function GET(request: NextRequest) {
  const owner = await getProgressOwner(request);
  const progress = await loadStoredProgress(owner.userKey);
  const { searchParams } = request.nextUrl;
  const levelId = cleanText(searchParams.get("levelId"), "basic");
  const patternId = clampInteger(searchParams.get("patternId"), 1, 1);
  const practiceCount = clampInteger(searchParams.get("practiceCount"), 20, 1);

  return withAnonymousCookie(
    NextResponse.json(
      snapshotFromStoredProgress(progress, levelId, patternId, practiceCount)
    ),
    owner
  );
}

export async function POST(request: NextRequest) {
  const owner = await getProgressOwner(request);
  const body = (await request.json().catch(() => ({}))) as ProgressBody;
  const levelId = cleanText(body.levelId);
  const patternId = clampInteger(body.patternId, 0, 1);
  const practiceCount = clampInteger(body.practiceCount, 20, 1);
  const practiceId = Math.min(
    clampInteger(body.practiceId, 1, 1),
    practiceCount
  );

  if (!levelId || patternId < 1) {
    return withAnonymousCookie(
      NextResponse.json({ error: "Invalid sentence pattern progress." }, { status: 400 }),
      owner
    );
  }

  const progress = await loadStoredProgress(owner.userKey);
  const now = new Date().toISOString();
  progress.continueProgress = {
    href: createSentencePatternProgressHref(levelId, patternId, practiceId),
    levelId,
    levelTitle: cleanText(body.levelTitle, "100个口语句型"),
    patternId,
    patternText: cleanText(body.patternText),
    practiceCount,
    practiceId,
    sectionTitle: cleanText(body.sectionTitle),
    updatedAt: now,
  };

  if (body.completed === true) {
    const key = progressKey(levelId, patternId);
    const practiceIds = normalizePracticeIds(progress.completedPracticeIds[key]);
    if (!practiceIds.includes(practiceId)) {
      practiceIds.push(practiceId);
      progress.completedPracticeIds[key] = practiceIds.sort((a, b) => a - b);
    }
  }

  progress.updatedAt = now;
  await saveStoredProgress(progress);

  return withAnonymousCookie(
    NextResponse.json(
      snapshotFromStoredProgress(progress, levelId, patternId, practiceCount)
    ),
    owner
  );
}
