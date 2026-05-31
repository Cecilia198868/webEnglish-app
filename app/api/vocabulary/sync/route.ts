import { authOptions } from "@/auth";
import {
  deleteCloudVocabularyWord,
  listCloudVocabularyWords,
  mergeCloudVocabularyWords,
} from "@/lib/cloudVocabulary";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getCurrentVocabularyOwner() {
  const session = await getServerSession(authOptions);
  return (
    session?.user?.email?.trim().toLowerCase() ||
    session?.user?.name?.trim().toLowerCase() ||
    ""
  );
}

export async function GET() {
  const owner = await getCurrentVocabularyOwner();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const words = await listCloudVocabularyWords(owner);
    return NextResponse.json({ words });
  } catch (error) {
    console.error("Vocabulary cloud sync GET failed", error);
    return NextResponse.json(
      { error: "Vocabulary sync is unavailable" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const owner = await getCurrentVocabularyOwner();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      words?: unknown;
    };
    const words = await mergeCloudVocabularyWords(owner, body.words);
    return NextResponse.json({ words });
  } catch (error) {
    console.error("Vocabulary cloud sync POST failed", error);
    return NextResponse.json(
      { error: "Vocabulary sync is unavailable" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const owner = await getCurrentVocabularyOwner();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    await deleteCloudVocabularyWord(owner, url.searchParams.get("word") || "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Vocabulary cloud sync DELETE failed", error);
    return NextResponse.json(
      { error: "Vocabulary sync is unavailable" },
      { status: 500 }
    );
  }
}
