import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  createFallbackEnglish,
  isEnglishRelevantToChinese,
  shouldUseDeterministicFallback,
} from "@/lib/freePracticeEnglishFallback";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export async function POST(req: Request) {
  try {
    const { chinese } = (await req.json()) as { chinese?: unknown };

    const chineseText = cleanText(chinese);

    if (!chineseText) {
      return NextResponse.json({ error: "NO_CHINESE" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY || shouldUseDeterministicFallback(chineseText)) {
      return NextResponse.json({
        english: createFallbackEnglish(chineseText),
        source: "fallback",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Translate the user's Chinese into one natural, idiomatic spoken English sentence for daily conversation practice. The Chinese is the only semantic source. Preserve every concrete detail from the Chinese, including tense or completed action, time, place, activity, people, degree words, and feelings or results. Do not drop feelings like relaxed/happy/tired. Do not add new facts, reasons, objects, places, or events. Return only the English sentence. No explanation.",
        },
        {
          role: "user",
          content: chineseText,
        },
      ],
    });

    const english = completion.choices[0]?.message?.content?.trim() || "";

    if (!english) {
      return NextResponse.json({ error: "EMPTY_ENGLISH" }, { status: 500 });
    }

    return NextResponse.json({
      english: isEnglishRelevantToChinese(chineseText, english)
        ? english
        : createFallbackEnglish(chineseText),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Generate accurate sentence failed",
      },
      { status: 500 }
    );
  }
}
