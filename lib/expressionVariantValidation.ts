export const EXPRESSION_VARIANTS_ERROR_MESSAGE =
  "\u751f\u6210\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u5c1d\u8bd5";

export const EXPRESSION_VARIANT_KEYS = [
  "standard",
  "idiomatic",
  "simple",
  "natural",
  "spoken",
] as const;

export const RECOMMENDATION_VARIANT_KEYS = [
  "standard",
  "idiomatic",
  "simple",
  "spoken",
] as const;

export type ExpressionVariantApiKey = (typeof EXPRESSION_VARIANT_KEYS)[number];
export type RecommendationVariantKey =
  (typeof RECOMMENDATION_VARIANT_KEYS)[number];

const ignoredLiteralTerms = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
]);

export function cleanExpressionText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeExpressionForComparison(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function hasDistinctExpressionTexts(values: string[]) {
  const normalizedValues = values
    .map(normalizeExpressionForComparison)
    .filter(Boolean);

  return (
    normalizedValues.length === values.length &&
    new Set(normalizedValues).size === normalizedValues.length
  );
}

export function getRequiredLiteralTermsFromChinese(chinese: string) {
  const matches = chinese.match(/[A-Za-z][A-Za-z0-9+#.-]*/g) || [];

  return Array.from(
    new Set(
      matches
        .map((term) =>
          term.replace(/^[._-]+|[._-]+$/g, "").toLowerCase()
        )
        .filter(
          (term) => term.length >= 2 && !ignoredLiteralTerms.has(term)
        )
    )
  );
}

export function preservesRequiredLiteralTerms(chinese: string, english: string) {
  const requiredTerms = getRequiredLiteralTermsFromChinese(chinese);
  if (!requiredTerms.length) return true;

  const normalizedEnglish = english.toLowerCase();
  return requiredTerms.every((term) => normalizedEnglish.includes(term));
}

export function validateExpressionVariantMap<K extends string>(
  variantMap: Partial<Record<K, unknown>>,
  keys: readonly K[],
  options: { chinese?: string } = {}
) {
  const texts = keys.map((key) => cleanExpressionText(variantMap[key]));

  if (texts.some((text) => !text)) return false;
  if (!hasDistinctExpressionTexts(texts)) return false;

  if (options.chinese) {
    return texts.every((text) =>
      preservesRequiredLiteralTerms(options.chinese || "", text)
    );
  }

  return true;
}
