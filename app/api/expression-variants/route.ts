import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  isEnglishRelevantToChinese,
} from "@/lib/freePracticeEnglishFallback";
import {
  cleanExpressionText,
  EXPRESSION_VARIANTS_ERROR_MESSAGE,
  EXPRESSION_VARIANT_KEYS,
  hasDistinctExpressionTexts,
  preservesRequiredLiteralTerms,
  type ExpressionVariantApiKey,
} from "@/lib/expressionVariantValidation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type VariantResponse = Partial<Record<ExpressionVariantApiKey, string>>;

class VariantGenerationError extends Error {}

function sanitizeExpressionVariants(
  chinese: string,
  variants: VariantResponse
): Record<ExpressionVariantApiKey, string> {
  const sanitized = EXPRESSION_VARIANT_KEYS.reduce((nextVariants, key) => {
    const candidate = cleanExpressionText(variants[key]);

    if (
      !candidate ||
      !isEnglishRelevantToChinese(chinese, candidate) ||
      !preservesRequiredLiteralTerms(chinese, candidate)
    ) {
      throw new VariantGenerationError("INVALID_VARIANT_CONTENT");
    }

    nextVariants[key] = candidate;
    return nextVariants;
  }, {} as Record<ExpressionVariantApiKey, string>);

  const variantTexts = EXPRESSION_VARIANT_KEYS.map((key) => sanitized[key]);
  if (!hasDistinctExpressionTexts(variantTexts)) {
    throw new VariantGenerationError("DUPLICATE_VARIANTS");
  }

  return sanitized;
}

export async function POST(req: Request) {
  try {
    const { chinese, userEnglish, standardEnglish } = (await req.json()) as {
      chinese?: unknown;
      userEnglish?: unknown;
      standardEnglish?: unknown;
    };

    const chineseText = cleanExpressionText(chinese);
    const learnerTranscript = cleanExpressionText(userEnglish);
    let authoritativeEnglish = cleanExpressionText(standardEnglish);

    if (!chineseText) {
      return NextResponse.json({ error: "NO_CHINESE" }, { status: 400 });
    }

    if (
      authoritativeEnglish &&
      (!isEnglishRelevantToChinese(chineseText, authoritativeEnglish) ||
        !preservesRequiredLiteralTerms(chineseText, authoritativeEnglish))
    ) {
      authoritativeEnglish = "";
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
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Create five different English alternatives for a spoken English learner. Semantic authority is strict: use "authoritativeEnglish" when it is provided and relevant; otherwise use only the meaning of "chinese". Every returned sentence must preserve all core facts from the Chinese: tense or completed action, time, place, activity, people, degree words, mixed Chinese/English technical terms such as Bug or API, and feelings or results. Never drop feelings like relaxed, happy, tired, or confident. "learnerTranscript" is an unreliable speech-recognition transcript of the learner\'s attempt. It may contain wrong words or extra facts. Never copy or preserve facts, nouns, reasons, places, events, or causal links from learnerTranscript unless they are clearly supported by chinese or authoritativeEnglish. If learnerTranscript conflicts with chinese or authoritativeEnglish, ignore learnerTranscript. Return only JSON with keys "standard", "idiomatic", "simple", "natural", and "spoken". Keep each value one sentence. All five values must be meaning-preserving and must not be identical or near-duplicate. "standard" is the most natural and idiomatic recommendation. "idiomatic" should be a different native-sounding phrasing. "simple" should be easy beginner English. "natural" should sound casual and everyday. "spoken" should be relaxed conversational English.',
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

    const content = completion.choices[0]?.message?.content || "";
    if (!content.trim()) {
      throw new VariantGenerationError("EMPTY_VARIANTS");
    }

    const variants = JSON.parse(content) as VariantResponse;
    const sanitizedVariants = sanitizeExpressionVariants(chineseText, variants);

    return NextResponse.json({
      source: "ai",
      variants: sanitizedVariants,
    });
  } catch (error) {
    const status = error instanceof VariantGenerationError ? 502 : 500;

    return NextResponse.json(
      {
        error: "AI_GENERATION_FAILED",
        message: EXPRESSION_VARIANTS_ERROR_MESSAGE,
      },
      { status }
    );
  }
}
