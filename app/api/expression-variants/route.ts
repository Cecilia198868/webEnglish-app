import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  createFallbackEnglish,
  createFallbackVariants,
  type FreePracticeExpressionVariants,
  isEnglishRelevantToChinese,
  shouldUseDeterministicFallback,
} from "@/lib/freePracticeEnglishFallback";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type VariantResponse = {
  standard?: string;
  idiomatic?: string;
  simple?: string;
  natural?: string;
  spoken?: string;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

const variantKeys = [
  "standard",
  "idiomatic",
  "simple",
  "natural",
  "spoken",
] as const;

function sanitizeExpressionVariants(
  chinese: string,
  variants: VariantResponse,
  fallbackVariants: FreePracticeExpressionVariants
): FreePracticeExpressionVariants {
  return variantKeys.reduce((nextVariants, key) => {
    const candidate = cleanText(variants[key]);
    nextVariants[key] =
      candidate && isEnglishRelevantToChinese(chinese, candidate)
        ? candidate
        : fallbackVariants[key];

    return nextVariants;
  }, {} as FreePracticeExpressionVariants);
}

export async function POST(req: Request) {
  try {
    const { chinese, userEnglish, standardEnglish } = (await req.json()) as {
      chinese?: unknown;
      userEnglish?: unknown;
      standardEnglish?: unknown;
    };

    const chineseText = cleanText(chinese);
    const learnerTranscript = cleanText(userEnglish);
    let authoritativeEnglish = cleanText(standardEnglish);

    if (!chineseText) {
      return NextResponse.json({ error: "NO_CHINESE" }, { status: 400 });
    }

    if (
      authoritativeEnglish &&
      !isEnglishRelevantToChinese(chineseText, authoritativeEnglish)
    ) {
      authoritativeEnglish = createFallbackEnglish(chineseText);
    }

    if (!process.env.OPENAI_API_KEY || shouldUseDeterministicFallback(chineseText)) {
      return NextResponse.json({
        variants: createFallbackVariants(chineseText, authoritativeEnglish),
        source: "fallback",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Create five English alternatives for a spoken English learner. Semantic authority is strict: use "authoritativeEnglish" when it is provided and relevant; otherwise use only the meaning of "chinese". Every returned sentence must preserve all core facts from the Chinese: tense or completed action, time, place, activity, people, degree words, and feelings or results. Never drop feelings like relaxed, happy, tired, or confident. "learnerTranscript" is an unreliable speech-recognition transcript of the learner\'s attempt. It may contain wrong words or extra facts. Never copy or preserve facts, nouns, reasons, places, events, or causal links from learnerTranscript unless they are clearly supported by chinese or authoritativeEnglish. If learnerTranscript conflicts with chinese or authoritativeEnglish, ignore learnerTranscript. Return only JSON with keys "standard", "idiomatic", "simple", "natural", and "spoken". Keep each value one sentence. "standard" should be accurate and polished. "idiomatic" should sound more native. "simple" should be easy beginner English. "natural" should sound casual and everyday. "spoken" should be relaxed conversational English.',
        },
        {
          role: "user",
          content: JSON.stringify({
            authoritativeEnglish,
            chinese: chineseText,
            learnerTranscript,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const variants = JSON.parse(content) as VariantResponse;
    const fallbackVariants = createFallbackVariants(
      chineseText,
      authoritativeEnglish
    );

    return NextResponse.json({
      variants: sanitizeExpressionVariants(
        chineseText,
        variants,
        fallbackVariants
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Generate expression variants failed",
      },
      { status: 500 }
    );
  }
}
