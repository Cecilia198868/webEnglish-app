import { featuredLessonRecords } from "@/data/featuredCourses";
import {
  prebuiltClassicExpressionContent,
  type PrebuiltClassicExpressionVariantContent,
} from "@/data/prebuiltClassicExpressionContent";
import {
  createFallbackHighlightedExpressions,
  type HighlightedExpression,
} from "@/lib/expressionHighlights";
import { parseTrainingContent } from "@/lib/training";

export type PrebuiltClassicExpressionVariantKey =
  | "standard"
  | "idiomatic"
  | "simple"
  | "natural";

export type PrebuiltClassicExpressionVariant = {
  key: PrebuiltClassicExpressionVariantKey;
  label: string;
  text: string;
};

export type PrebuiltClassicExpressionSet = {
  lessonId: string;
  sentenceIndex: number;
  chinese: string;
  standardEnglish: string;
  variants: PrebuiltClassicExpressionVariant[];
  highlights: Partial<
    Record<PrebuiltClassicExpressionVariantKey, HighlightedExpression[]>
  >;
};

const prebuiltVariantLabels: Array<{
  key: PrebuiltClassicExpressionVariantKey;
  label: string;
}> = [
  { key: "standard", label: "\u63a8\u8350\u8868\u8fbe" },
  { key: "idiomatic", label: "\u66f4\u5730\u9053" },
  { key: "simple", label: "\u66f4\u7b80\u5355" },
  { key: "natural", label: "\u66f4\u81ea\u7136" },
];

function normalizeExpressionText(text: string) {
  return text
    .replace(/鈥檇/g, "'d")
    .replace(/鈥檓/g, "'m")
    .replace(/鈥檚/g, "'s")
    .replace(/鈥檙e/g, "'re")
    .replace(/鈥檝e/g, "'ve")
    .replace(/鈥檒l/g, "'ll")
    .replace(/鈥檛/g, "n't")
    .replace(/鈥�/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForCompare(text: string) {
  return normalizeExpressionText(text)
    .toLowerCase()
    .replace(/[.,!?;:'"()\-\u2013\u2014]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function lowerFirst(text: string) {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

function stripFinalPunctuation(text: string) {
  return normalizeExpressionText(text).replace(/[.!?]+$/g, "");
}

function addQuestionMark(text: string) {
  return `${stripFinalPunctuation(text)}?`;
}

function embeddedQuestionFrom(text: string) {
  const body = stripFinalPunctuation(text);

  const helpMatch = body.match(/^how can i help you(?: today)?$/i);
  if (helpMatch) return "what I can help you with today";

  const whatOfferMatch = body.match(/^what (types?|kinds?) of (.+) do you offer$/i);
  if (whatOfferMatch) {
    return `what ${whatOfferMatch[1].toLowerCase()} of ${whatOfferMatch[2]} you offer`;
  }

  const whatHaveMatch = body.match(/^what (types?|kinds?) of (.+) do you have$/i);
  if (whatHaveMatch) {
    return `what ${whatHaveMatch[1].toLowerCase()} of ${whatHaveMatch[2]} you have`;
  }

  const whatAreMatch = body.match(/^what are (.+)$/i);
  if (whatAreMatch) return `what ${whatAreMatch[1]} are`;

  const whatIsMatch = body.match(/^what is (.+)$/i);
  if (whatIsMatch) return `what ${whatIsMatch[1]} is`;

  const howMatch = body.match(/^how (.+)$/i);
  if (howMatch) return `how ${howMatch[1]}`;

  const canMatch = body.match(/^(can|could) (i|you|we|they|he|she) (.+)$/i);
  if (canMatch) {
    return `whether ${canMatch[2].toLowerCase()} ${canMatch[1].toLowerCase()} ${canMatch[3]}`;
  }

  const doMatch = body.match(/^(do|does|did) (i|you|we|they|he|she) (.+)$/i);
  if (doMatch) {
    return `whether ${doMatch[2].toLowerCase()} ${doMatch[3]}`;
  }

  const areMatch = body.match(/^(are|is) there (.+)$/i);
  if (areMatch) return `whether there ${areMatch[1].toLowerCase()} ${areMatch[2]}`;

  return lowerFirst(body);
}

function createIdiomaticFallback(standardEnglish: string) {
  const text = normalizeExpressionText(standardEnglish);
  const body = stripFinalPunctuation(text);

  if (/^how can i help you/i.test(body)) {
    return "What can I help you with today?";
  }

  const offerMatch = body.match(/^what (types?|kinds?) of (.+) do you offer$/i);
  if (offerMatch) return `What kinds of ${offerMatch[2]} are available?`;

  const haveMatch = body.match(/^what (types?|kinds?) of (.+) do you have$/i);
  if (haveMatch) return `What kinds of ${haveMatch[2]} are available?`;

  if (/^i want to /i.test(body)) {
    return `${body.replace(/^i want to /i, "I'd like to ")}.`;
  }

  if (/^i would like to /i.test(body)) {
    return `${body.replace(/^i would like to /i, "I'd like to ")}.`;
  }

  if (/^can you /i.test(body)) {
    return addQuestionMark(body.replace(/^can you /i, "Could you "));
  }

  if (text.endsWith("?")) {
    return `Could you let me know ${embeddedQuestionFrom(text)}?`;
  }

  if (/^good morning/i.test(body)) {
    return body.replace(/^good morning!?/i, "Good morning,").replace(/\.$/, ".");
  }

  return `Just to be clear, ${lowerFirst(body)}.`;
}

function createSimpleFallback(standardEnglish: string) {
  const text = normalizeExpressionText(standardEnglish);
  const body = stripFinalPunctuation(text);

  const accountOfferMatch = body.match(/^what (types?|kinds?) of (.+) do you offer$/i);
  if (accountOfferMatch) return addQuestionMark(`What ${accountOfferMatch[2]} do you have`);

  const accountHaveMatch = body.match(/^what (types?|kinds?) of (.+) do you have$/i);
  if (accountHaveMatch) return addQuestionMark(`What ${accountHaveMatch[2]} do you have`);

  if (/^how can i help you/i.test(body)) return "How can I help you?";

  if (/^i'd like to /i.test(body)) {
    return `${body.replace(/^i'd like to /i, "I want to ")}.`;
  }

  if (/^i would like to /i.test(body)) {
    return `${body.replace(/^i would like to /i, "I want to ")}.`;
  }

  if (/^could you /i.test(body)) {
    return addQuestionMark(body.replace(/^could you /i, "Can you "));
  }

  if (/minimum deposit required/i.test(body)) {
    return "How much money do I need to start?";
  }

  if (text.endsWith("?")) {
    return addQuestionMark(
      body
        .replace(/\bcurrently\b/gi, "")
        .replace(/\bright now\b/gi, "")
        .replace(/\btypes of\b/gi, "")
        .replace(/\bkinds of\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  if (/welcome to/i.test(body)) return "Good morning! Welcome.";

  return `${body
    .replace(/\bcurrently\b/gi, "")
    .replace(/\bif possible\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()}.`;
}

function createNaturalFallback(standardEnglish: string) {
  const text = normalizeExpressionText(standardEnglish);
  const body = stripFinalPunctuation(text);
  const optionSubject = (value: string) =>
    value.replace(/\baccounts\b/gi, "account").trim();

  const offerMatch = body.match(/^what (types?|kinds?) of (.+) do you offer$/i);
  if (offerMatch) {
    return `Could you walk me through the ${optionSubject(offerMatch[2])} options?`;
  }

  const haveMatch = body.match(/^what (types?|kinds?) of (.+) do you have$/i);
  if (haveMatch) {
    return `Could you walk me through the ${optionSubject(haveMatch[2])} options?`;
  }

  if (/^how can i help you/i.test(body)) {
    return "Hi, what can I help you with today?";
  }

  if (/^i'd like to /i.test(body)) {
    return `${body.replace(/^i'd like to /i, "I'm hoping to ")}.`;
  }

  if (/^i want to /i.test(body)) {
    return `${body.replace(/^i want to /i, "I'm looking to ")}.`;
  }

  if (text.endsWith("?")) {
    return `I was wondering ${embeddedQuestionFrom(text)}.`;
  }

  if (/^good morning/i.test(body)) return "Morning! Welcome in.";

  return `Basically, ${lowerFirst(body)}.`;
}

function createGeneratedVariant(
  key: PrebuiltClassicExpressionVariantKey,
  standardEnglish: string
) {
  if (key === "idiomatic") return createIdiomaticFallback(standardEnglish);
  if (key === "simple") return createSimpleFallback(standardEnglish);
  if (key === "natural") return createNaturalFallback(standardEnglish);
  return normalizeExpressionText(standardEnglish);
}

function chooseDistinctVariantText(
  key: PrebuiltClassicExpressionVariantKey,
  storedText: string,
  standardText: string,
  usedTexts: Set<string>
) {
  const generatedText = createGeneratedVariant(key, standardText);
  const storedIsRepeated =
    !storedText ||
    normalizeForCompare(storedText) === normalizeForCompare(standardText) ||
    usedTexts.has(normalizeForCompare(storedText));

  const candidates = [
    key === "standard" ? standardText : storedIsRepeated ? generatedText : storedText,
    generatedText,
    createIdiomaticFallback(standardText),
    createSimpleFallback(standardText),
    createNaturalFallback(standardText),
  ];

  const distinctText =
    candidates.find((candidate) => {
      const normalized = normalizeForCompare(candidate);
      return normalized && !usedTexts.has(normalized);
    }) || candidates[0];

  usedTexts.add(normalizeForCompare(distinctText));
  return distinctText;
}

function createPrebuiltVariants(
  standardEnglish: string,
  storedContent?: Partial<PrebuiltClassicExpressionVariantContent>
) {
  const fallbackText =
    normalizeExpressionText(standardEnglish) ||
    "This sentence is still being prepared.";
  const standardText =
    normalizeExpressionText(storedContent?.standard || "") || fallbackText;
  const usedTexts = new Set<string>();

  return prebuiltVariantLabels.map(({ key, label }) => {
    const storedText =
      key === "standard"
        ? standardText
        : normalizeExpressionText(storedContent?.[key] || "");

    return {
      key,
      label,
      text: chooseDistinctVariantText(
        key,
        storedText,
        standardText,
        usedTexts
      ),
    };
  });
}

function createPrebuiltHighlights(
  variants: PrebuiltClassicExpressionVariant[]
) {
  return variants.reduce<PrebuiltClassicExpressionSet["highlights"]>(
    (result, variant) => {
      result[variant.key] = createFallbackHighlightedExpressions(variant.text);
      return result;
    },
    {}
  );
}

export const prebuiltClassicExpressionLibrary: Record<
  string,
  PrebuiltClassicExpressionSet[]
> = Object.fromEntries(
  featuredLessonRecords.map((lesson) => [
    lesson.id,
    parseTrainingContent(lesson.txt_content || "").map((pair, sentenceIndex) => {
      const variants = createPrebuiltVariants(
        pair.english || "",
        prebuiltClassicExpressionContent[lesson.id]?.[sentenceIndex]
      );

      return {
        lessonId: lesson.id,
        sentenceIndex,
        chinese: pair.chinese,
        standardEnglish: normalizeExpressionText(pair.english || ""),
        variants,
        highlights: createPrebuiltHighlights(variants),
      };
    }),
  ])
);

export function hasPrebuiltClassicExpressionLesson(lessonId: string) {
  return Array.isArray(prebuiltClassicExpressionLibrary[lessonId]);
}

export function getPrebuiltClassicExpressionSet(
  lessonId: string,
  sentenceIndex: number
) {
  const lessonExpressions = prebuiltClassicExpressionLibrary[lessonId];
  if (!lessonExpressions) return null;

  return lessonExpressions[sentenceIndex] || null;
}
