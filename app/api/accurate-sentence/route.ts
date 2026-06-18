import OpenAI from "openai";
import { NextResponse } from "next/server";
import { isEnglishRelevantToChinese } from "@/lib/freePracticeEnglishFallback";
import {
  cleanExpressionText,
  EXPRESSION_VARIANTS_ERROR_MESSAGE,
  preservesRequiredLiteralTerms,
} from "@/lib/expressionVariantValidation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { chinese } = (await req.json()) as { chinese?: unknown };

    const chineseText = cleanExpressionText(chinese);

    if (!chineseText) {
      return NextResponse.json({ error: "NO_CHINESE" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "AI_GENERATION_FAILED",
          message: EXPRESSION_VARIANTS_ERROR_MESSAGE,
        },
        { status: 503 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Translate the user's Chinese into one natural, idiomatic spoken English sentence for daily conversation practice. The Chinese is the only semantic source. Preserve every concrete detail from the Chinese, including tense or completed action, time, place, activity, people, degree words, mixed Chinese/English technical terms such as Bug or API, and feelings or results. Do not drop feelings like relaxed/happy/tired. Do not add new facts, reasons, objects, places, or events. Return only the English sentence. No explanation.",
        },
        {
          role: "user",
          content: chineseText,
        },
      ],
    });

    const english = completion.choices[0]?.message?.content?.trim() || "";

    if (
      !english ||
      !isEnglishRelevantToChinese(chineseText, english) ||
      !preservesRequiredLiteralTerms(chineseText, english)
    ) {
      return NextResponse.json(
        {
          error: "AI_GENERATION_FAILED",
          message: EXPRESSION_VARIANTS_ERROR_MESSAGE,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      english,
      source: "ai",
    });
  } catch {
    return NextResponse.json(
      {
        error: "AI_GENERATION_FAILED",
        message: EXPRESSION_VARIANTS_ERROR_MESSAGE,
      },
      { status: 500 }
    );
  }
}
