import OpenAI from "openai";
import { NextResponse } from "next/server";
import { isEnglishRelevantToChinese } from "@/lib/freePracticeEnglishFallback";
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
type ExpressionVariantRequestBody = {
  chinese?: unknown;
  standardEnglish?: unknown;
  userEnglish?: unknown;
  variantKeys?: unknown;
};
type OpenAIApiKeyConfig = {
  apiKey: string;
  tokenCount: number;
};

class VariantGenerationError extends Error {
  constructor(
    readonly code: string,
    readonly clientMessage = EXPRESSION_VARIANTS_ERROR_MESSAGE,
    readonly status = 502
  ) {
    super(code);
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

function redactSensitiveText(value: string) {
  return value.replace(/sk-[A-Za-z0-9_-]{10,}/g, "[REDACTED_OPENAI_KEY]");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getOpenAIApiKeyConfig(): OpenAIApiKeyConfig {
  const tokens =
    process.env.OPENAI_API_KEY?.split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean) || [];

  return {
    apiKey: tokens.find((token) => token.startsWith("sk-")) || tokens[0] || "",
    tokenCount: tokens.length,
  };
}

function formatErrorForLog(error: unknown) {
  if (error instanceof Error) {
    return redactSensitiveText(
      JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
  }

  try {
    return redactSensitiveText(JSON.stringify(error));
  } catch {
    return redactSensitiveText(String(error));
  }
}

function logExpressionVariantError(
  stage: string,
  error: unknown,
  context: Record<string, unknown> = {}
) {
  const message = redactSensitiveText(
    error instanceof Error ? error.message : String(error)
  );
  const stack =
    error instanceof Error ? redactSensitiveText(error.stack || "") : undefined;

  console.error("[expression-variants] error", {
    ...context,
    error: formatErrorForLog(error),
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
  const detail = redactSensitiveText(
    error instanceof Error ? error.message : String(error)
  );
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

function jsonError(
  status: number,
  error: string,
  message: string,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      error,
      message,
      ...extra,
    },
    { headers: noStoreHeaders, status }
  );
}

async function readExpressionVariantRequest(
  req: Request
): Promise<ExpressionVariantRequestBody> {
  let body: unknown;

  try {
    body = await req.json();
  } catch (error) {
    logExpressionVariantError("parse_request_json", error);
    throw new VariantGenerationError(
      "INVALID_JSON",
      "Request body must be valid JSON.",
      400
    );
  }

  if (!isRecord(body)) {
    throw new VariantGenerationError(
      "INVALID_REQUEST_BODY",
      "Request body must be a JSON object.",
      400
    );
  }

  return body;
}

async function requestOpenAIExpressionVariants(
  openai: OpenAI,
  requestedVariantKeys: readonly ExpressionVariantApiKey[],
  payload: {
    authoritativeEnglish: string;
    chinese: string;
    learnerTranscript: string;
  }
) {
  try {
    return await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: getVariantPrompt(requestedVariantKeys),
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    });
  } catch (error) {
    const errorDetails = getErrorDetails(error);
    logExpressionVariantError("openai_request", error, errorDetails);
    throw new VariantGenerationError(
      "OPENAI_REQUEST_FAILED",
      `OpenAI request failed: ${errorDetails.detail}`,
      502
    );
  }
}

async function handleExpressionVariantsPost(req: Request) {
  const body = await readExpressionVariantRequest(req);

  const chineseText = cleanExpressionText(body.chinese);
  const learnerTranscript = cleanExpressionText(body.userEnglish);
  let authoritativeEnglish = cleanExpressionText(body.standardEnglish);
  const requestedVariantKeys = normalizeVariantKeys(body.variantKeys);
  const { apiKey, tokenCount } = getOpenAIApiKeyConfig();

  if (!chineseText) {
    return jsonError(400, "NO_CHINESE", "Missing required field: chinese.");
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

    return jsonError(
      500,
      "OPENAI_API_KEY_MISSING",
      "OPENAI_API_KEY is not configured for this Vercel environment."
    );
  }

  if (tokenCount > 1) {
    console.error("[expression-variants] warning", {
      message:
        "OPENAI_API_KEY contains multiple whitespace-separated values; using the first key-like token.",
      requestedVariantKeys,
      stage: "normalize_openai_api_key",
      tokenCount,
    });
  }

  const openai = new OpenAI({ apiKey });
  const completion = await requestOpenAIExpressionVariants(
    openai,
    requestedVariantKeys,
    {
      authoritativeEnglish,
      chinese: chineseText,
      learnerTranscript,
    }
  );

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
      recommendedExpression: sanitizedVariants.standard,
      idiomaticExpression: sanitizedVariants.idiomatic,
      simpleExpression: sanitizedVariants.simple,
      naturalExpression: sanitizedVariants.natural,
      spokenExpression: sanitizedVariants.spoken,
    },
    { headers: noStoreHeaders }
  );
}

export async function POST(req: Request) {
  try {
    return await handleExpressionVariantsPost(req);
  } catch (error) {
    const errorDetails = getErrorDetails(error);
    logExpressionVariantError("post_handler", error, errorDetails);

    if (error instanceof VariantGenerationError) {
      return jsonError(error.status, error.code, error.clientMessage, {
        upstreamCode: errorDetails.upstreamCode,
        upstreamStatus: errorDetails.upstreamStatus,
        upstreamType: errorDetails.upstreamType,
      });
    }

    return jsonError(
      500,
      "AI_GENERATION_FAILED",
      errorDetails.detail || EXPRESSION_VARIANTS_ERROR_MESSAGE,
      {
        upstreamCode: errorDetails.upstreamCode,
        upstreamStatus: errorDetails.upstreamStatus,
        upstreamType: errorDetails.upstreamType,
      }
    );
  }
}