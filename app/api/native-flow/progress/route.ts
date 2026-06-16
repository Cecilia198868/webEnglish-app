import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { authOptions } from "@/auth";
import { nativeFlowLevels, type NativeFlowLevelId } from "@/data/nativeFlow/courseData";
import {
  isNativeFlowLevelId,
  normalizeNativeFlowSentenceId,
  type NativeFlowContinueProgress,
  type NativeFlowProgressSnapshot,
} from "@/lib/nativeFlowProgress";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ANONYMOUS_PROGRESS_COOKIE = "speakflow-native-flow-progress-id";
const DATA_DIR = path.join(process.cwd(), ".data");
const PROGRESS_FILE = path.join(DATA_DIR, "native-flow-progress.json");

type ProgressOwner = {
  anonymousId?: string;
  shouldSetCookie: boolean;
  userKey: string;
};

type StoredNativeFlowProgress = {
  completedSentenceIds: Record<NativeFlowLevelId, number[]>;
  continueProgress: NativeFlowContinueProgress | null;
  createdAt: string;
  updatedAt: string;
  userKey: string;
};

type ProgressFileStore = Record<string, StoredNativeFlowProgress>;

type ProgressBody = {
  completed?: unknown;
  levelId?: unknown;
  saveContinue?: unknown;
  sentenceId?: unknown;
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

function createEmptyCompletedSentenceIds() {
  return nativeFlowLevels.reduce(
    (records, level) => ({
      ...records,
      [level.id]: [],
    }),
    {} as Record<NativeFlowLevelId, number[]>
  );
}

function createEmptyProgress(userKey: string): StoredNativeFlowProgress {
  const now = new Date().toISOString();

  return {
    completedSentenceIds: createEmptyCompletedSentenceIds(),
    continueProgress: null,
    createdAt: now,
    updatedAt: now,
    userKey,
  };
}

function normalizeCompletedIds(value: unknown, totalSentences: number) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => normalizeNativeFlowSentenceId(item, totalSentences, 0))
        .filter((item) => item > 0 && item <= totalSentences)
    )
  ).sort((a, b) => a - b);
}

function normalizeContinueProgress(value: unknown): NativeFlowContinueProgress | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Partial<NativeFlowContinueProgress>;
  if (!isNativeFlowLevelId(record.levelId)) return null;

  const level = nativeFlowLevels.find((item) => item.id === record.levelId);
  if (!level) return null;

  return {
    levelId: record.levelId,
    sentenceId: normalizeNativeFlowSentenceId(record.sentenceId, level.totalSentences),
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : new Date().toISOString(),
  };
}

function normalizeStoredProgress(
  userKey: string,
  rawProgress: unknown
): StoredNativeFlowProgress {
  if (!rawProgress || typeof rawProgress !== "object") {
    return createEmptyProgress(userKey);
  }

  const record = rawProgress as Partial<StoredNativeFlowProgress>;
  const completedSentenceIds = createEmptyCompletedSentenceIds();
  nativeFlowLevels.forEach((level) => {
    completedSentenceIds[level.id] = normalizeCompletedIds(
      record.completedSentenceIds?.[level.id],
      level.totalSentences
    );
  });

  return {
    completedSentenceIds,
    continueProgress: normalizeContinueProgress(record.continueProgress),
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : new Date().toISOString(),
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

async function loadStoredProgress(userKey: string) {
  const store = await readFileStore();
  return normalizeStoredProgress(userKey, store[userKey]);
}

async function saveStoredProgress(progress: StoredNativeFlowProgress) {
  const store = await readFileStore();
  store[progress.userKey] = progress;
  await writeFileStore(store);
}

function snapshotFromStoredProgress(
  progress: StoredNativeFlowProgress
): NativeFlowProgressSnapshot {
  return {
    continueProgress: progress.continueProgress,
    rows: nativeFlowLevels.map((level) => {
      const completed = normalizeCompletedIds(
        progress.completedSentenceIds[level.id],
        level.totalSentences
      ).length;

      return {
        completed,
        levelId: level.id,
        percent: Math.round((completed / Math.max(level.totalSentences, 1)) * 100),
        totalSentences: level.totalSentences,
      };
    }),
  };
}

export async function GET(request: NextRequest) {
  const owner = await getProgressOwner(request);
  const progress = await loadStoredProgress(owner.userKey);

  return withAnonymousCookie(
    NextResponse.json(snapshotFromStoredProgress(progress)),
    owner
  );
}

export async function POST(request: NextRequest) {
  const owner = await getProgressOwner(request);
  const body = (await request.json().catch(() => ({}))) as ProgressBody;

  if (!isNativeFlowLevelId(body.levelId)) {
    return withAnonymousCookie(
      NextResponse.json({ error: "Invalid native flow progress." }, { status: 400 }),
      owner
    );
  }

  const level = nativeFlowLevels.find((item) => item.id === body.levelId);
  if (!level) {
    return withAnonymousCookie(
      NextResponse.json({ error: "Invalid native flow level." }, { status: 400 }),
      owner
    );
  }

  const sentenceId = normalizeNativeFlowSentenceId(
    body.sentenceId,
    level.totalSentences
  );
  const progress = await loadStoredProgress(owner.userKey);
  const now = new Date().toISOString();

  if (body.saveContinue !== false) {
    progress.continueProgress = {
      levelId: body.levelId,
      sentenceId,
      updatedAt: now,
    };
  }

  if (body.completed === true) {
    const completedIds = normalizeCompletedIds(
      progress.completedSentenceIds[body.levelId],
      level.totalSentences
    );
    if (!completedIds.includes(sentenceId)) {
      completedIds.push(sentenceId);
      progress.completedSentenceIds[body.levelId] = completedIds.sort((a, b) => a - b);
    }
  }

  progress.updatedAt = now;
  await saveStoredProgress(progress);

  return withAnonymousCookie(
    NextResponse.json(snapshotFromStoredProgress(progress)),
    owner
  );
}
