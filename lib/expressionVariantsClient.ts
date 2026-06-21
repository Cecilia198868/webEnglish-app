import type { ExpressionVariantApiKey } from "@/lib/expressionVariantValidation";

export const EXPRESSION_VARIANTS_API_PATH = "/api/expression-variants";

export type ExpressionVariantsApiResponse<
  K extends string = ExpressionVariantApiKey,
> = {
  error?: string;
  message?: string;
  source?: string;
  variants?: Partial<Record<K, string>>;
};

export type ExpressionVariantsRequest = {
  chinese: string;
  standardEnglish?: string;
  userEnglish?: string;
  variantKeys?: readonly string[];
};

export async function requestExpressionVariants<
  K extends string = ExpressionVariantApiKey,
>(payload: ExpressionVariantsRequest) {
  const response = await fetch(EXPRESSION_VARIANTS_API_PATH, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "same-origin",
    body: JSON.stringify({
      chinese: payload.chinese,
      standardEnglish: payload.standardEnglish || "",
      userEnglish: payload.userEnglish || "",
      variantKeys: payload.variantKeys,
    }),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? ((await response.json()) as ExpressionVariantsApiResponse<K>)
    : ({
        error: response.statusText || "NON_JSON_RESPONSE",
        message: await response.text(),
      } satisfies ExpressionVariantsApiResponse<K>);

  return {
    data,
    path: EXPRESSION_VARIANTS_API_PATH,
    response,
    status: response.status,
  };
}
