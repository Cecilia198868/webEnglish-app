import { authOptions } from "@/auth";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SupportFeedbackRecord = {
  accountEmail: string;
  contactEmail: string;
  createdAt: string;
  id: string;
  issueType: string;
  language: string;
  message: string;
  page: string;
  userAgent: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FEEDBACK_FILE = path.join(DATA_DIR, "support-feedback.json");

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function loadFeedbackRecords() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await readFile(FEEDBACK_FILE, "utf8");
    const parsed = JSON.parse(raw) as SupportFeedbackRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const session = await getServerSession(authOptions);
    const accountEmail = session?.user?.email?.trim().toLowerCase() || "";
    const contactEmail = cleanText(body.contactEmail, 160);
    const issueType = cleanText(body.issueType, 80) || "other";
    const language = cleanText(body.language, 20) || "en";
    const message = cleanText(body.message, 5000);
    const page = cleanText(body.page, 260);
    const userAgent = req.headers.get("user-agent") || "";

    if (!message || message.length < 6) {
      return NextResponse.json(
        { error: "Please describe the issue in more detail." },
        { status: 400 }
      );
    }

    const records = await loadFeedbackRecords();
    const nextRecord: SupportFeedbackRecord = {
      accountEmail,
      contactEmail,
      createdAt: new Date().toISOString(),
      id: randomUUID(),
      issueType,
      language,
      message,
      page,
      userAgent,
    };

    records.unshift(nextRecord);
    await writeFile(FEEDBACK_FILE, JSON.stringify(records, null, 2), "utf8");

    return NextResponse.json({ id: nextRecord.id, ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Submit feedback failed",
      },
      { status: 500 }
    );
  }
}
