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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

type VariantResponse = Partial<Record<ExpressionVariantApiKey, string>>;

class VariantGenerationError extends Error {
  constructor(
    message: string,
    readonly code = message
  ) {
    super(message);
    this.name = "VariantGenerationError";
  }
}

const variantInstructions: Record<ExpressionVariantApiKey, string> = {
  idiomatic: '"idiomatic" should be a different native-sounding phrasing.',
  natural: '"natural" should sound casual and everyday.',
  simple: '"simple" should be easy beginner English.',
  spoken: '"spoken" should be relaxed conversational English.',
  standard: '"standard" is the most natural and idiomatic recommendation.',
};

function normalizeVariantKeys(value: unknown): ExpressionVariantApiKey[] {
  if (!Array.isArray(value)) return [...EXPRESSION_VARIANT_KEYS];

  const keys = value.filter((key): key is ExpressionVariantApiKey =>
    EXPRESSION_VARIANT_KEYS.includes(key as ExpressionVariantApiKey)
  );
  const distinctKeys = Array.from(new Set(keys));

  return distinctKeys.length ? distinctKeys : [...EXPRESSION_VARIANT_KEYS];
}

function getVariantPrompt(keys: readonly ExpressionVariantApiKey[]) {
  const quotedKeys = keys.map((key) => `"${key}"`).join(", ");
  const instructions = keys.map((key) => variantInstructions[key]).join(" ");

  return `Create ${keys.length} different English alternatives for a spoken English learner. Semantic authority is strict: use "authoritativeEnglish" when it is provided and relevant; otherwise use only the meaning of "chinese". Every returned sentence must preserve all core facts from the Chinese: tense or completed action, time, place, activity, people, degree words, mixed Chinese/English technical terms such as Bug or API, and feelings or results. Never drop feelings like relaxed, happy, tired, or confident. "learnerTranscript" is an unreliable speech-recognition transcript of the learner's attempt. It may contain wrong words or extra facts. Never copy or preserve facts, nouns, reasons, places, events, or causal links from learnerTranscript unless they are clearly supported by chinese or authoritativeEnglish. If learnerTranscript conflicts with chinese or authoritativeEnglish, ignore learnerTranscript. Return only JSON with keys ${quotedKeys}. Keep each value one sentence. All values must be meaning-preserving and must not be identical or near-duplicate. ${instructions}`;
}

function sanitizeExpressionVariants(
  chinese: string,
  variants: VariantResponse,
  keys: readonly ExpressionVariantApiKey[]
): Partial<Record<ExpressionVariantApiKey, string>> {
  const sanitized = keys.reduce((nextVariants, key) => {
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
  }, {} as Partial<Record<ExpressionVariantApiKey, string>>);

  const variantTexts = keys.map((key) => sanitized[key] || "");
  if (!hasDistinctExpressionTexts(variantTexts)) {
    throw new VariantGenerationError("DUPLICATE_VARIANTS");
  }

  return sanitized;
}

function logExpressionVariantError(
  stage: string,
  error: unknown,
  context: Record<string, unknown> = {}
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[expression-variants]", {
    ...context,
    message,
    stack,
    stage,
  });
}

function getErrorProperty(error: unknown, key: string) {
  if (!error || typeof error !== "object" || !(key in error)) return undefined;
  return (error as Record<string, unknown>)[key];
}

function getErrorDetails(error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  const upstreamStatus = getErrorProperty(error, "status");
  const upstreamCode = getErrorProperty(error, "code");
  const upstreamType = getErrorProperty(error, "type");

  return {
    detail,
    upstreamCode: typeof upstreamCode === "string" ? upstreamCode : undefined,
    upstreamStatus:
      typeof upstreamStatus === "number" ? upstreamStatus : undefined,
    upstreamType: typeof upstreamType === "string" ? upstreamType : undefined,
  };
}

async function readExpressionVariantRequest(req: Request) {
  try {
    return (await req.json()) as {
      chinese?: unknown;
      standardEnglish?: unknown;
      userEnglish?: unknown;
      variantKeys?: unknown;
    };
  } catch (error) {
    logExpressionVariantError("parse_request_json", error);
    throw new VariantGenerationError("INVALID_JSON");
  }
}

export async function POST(req: Request) {
  try {
    const { chinese, userEnglish, standardEnglish, variantKeys } =
      await readExpressionVariantRequest(req);

    const chineseText = cleanExpressionText(chinese);
    const learnerTranscript = cleanExpressionText(userEnglish);
    let authoritativeEnglish = cleanExpressionText(standardEnglish);
    const requestedVariantKeys = normalizeVariantKeys(variantKeys);
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!chineseText) {
      return NextResponse.json(
        { error: "NO_CHINESE", message: "Missing required field: chinese." },
        { headers: noStoreHeaders, status: 400 }
      );
    }

    if (
      authoritativeEnglish &&
      (!isEnglishRelevantToChinese(chineseText, authoritativeEnglish) ||
        !preservesRequiredLiteralTerms(chineseText, authoritativeEnglish))
    ) {
      authoritativeEnglish = "";
    }

    if (!apiKey) {
      logExpressionVariantError(
        "missing_openai_api_key",
        "OPENAI_API_KEY is missing",
        { requestedVariantKeys }
      );

      return NextResponse.json(
        {
          error: "OPENAI_API_KEY_MISSING",
          message:
            "OPENAI_API_KEY is not configured for this Vercel environment.",
        },
        { headers: noStoreHeaders, status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: getVariantPrompt(requestedVariantKeys),
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

    let variants: VariantResponse;
    try {
      variants = JSON.parse(content) as VariantResponse;
    } catch (error) {
      logExpressionVariantError("parse_openai_json", error, {
        contentPreview: content.slice(0, 500),
      });
      throw new VariantGenerationError("INVALID_OPENAI_JSON");
    }

    const sanitizedVariants = sanitizeExpressionVariants(
      chineseText,
      variants,
      requestedVariantKeys
    );

    return NextResponse.json(
      {
        source: "ai",
        variants: sanitizedVariants,
      },
      { headers: noStoreHeaders }
    );
  } catch (error) {
    const errorDetails = getErrorDetails(error);
    logExpressionVariantError("post_handler", error, errorDetails);

    if (
      error instanceof VariantGenerationError &&
      error.code === "INVALID_JSON"
    ) {
      return NextResponse.json(
        {
          error: error.code,
          message: "Request body must be valid JSON.",
        },
        { headers: noStoreHeaders, status: 400 }
      );
    }

    const isVariantError = error instanceof VariantGenerationError;
    const status = isVariantError || errorDetails.upstreamStatus ? 502 : 500;
    const errorCode = isVariantError
      ? error.code
      : errorDetails.upstreamStatus
        ? "OPENAI_REQUEST_FAILED"
        : "AI_GENERATION_FAILED";

    return NextResponse.json(
      {
        error: errorCode,
        message: isVariantError
          ? EXPRESSION_VARIANTS_ERROR_MESSAGE
          : errorDetails.detail || EXPRESSION_VARIANTS_ERROR_MESSAGE,
        upstreamCode: errorDetails.upstreamCode,
        upstreamStatus: errorDetails.upstreamStatus,
        upstreamType: errorDetails.upstreamType,
      },
      { headers: noStoreHeaders, status }
    );
  }
}
