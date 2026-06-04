export type HighlightedExpression = {
  phrase: string;
  meaning: string;
};

const FALLBACK_EXPRESSION_MEANINGS: Record<string, string> = {
  "bring along": "\ud83c\udf92 \u968f\u8eab\u5e26\u4e0a",
  "lush and verdant": "\ud83c\udf3f \u751f\u673a\u76ce\u7136",
  "open a bank account": "\ud83c\udfe6 \u5f00\u94f6\u884c\u8d26\u6237",
};

const FALLBACK_HIGHLIGHT_MEANING =
  "\u2728 \u503c\u5f97\u6536\u85cf\u7684\u8868\u8fbe";

const FALLBACK_PHRASE_PATTERNS: RegExp[] = [
  /\b(?:would like to|want to|need to|have to|going to|trying to|looking for)\b/i,
  /\b(?:set up|apply for|pay for|look for|check in|check out)\s+(?:a|an|the|my|your)?\s*[A-Za-z]+(?:\s+[A-Za-z]+){0,2}\b/i,
  /\b(?:open|close|transfer|withdraw|deposit|exchange|book|cancel|change)\s+(?:a|an|the|my|your)?\s*[A-Za-z]+(?:\s+[A-Za-z]+){0,2}\b/i,
  /\b(?:in|on|at|to|from|with|for|about|by|into|over|under|through|around|during|after|before|without)\s+(?:a|an|the|my|your|his|her|our|their)\s+[A-Za-z]+(?:\s+[A-Za-z]+){0,2}\b/i,
  /\b[A-Za-z]+s?\s+of\s+[A-Za-z]+s?\b/i,
];

const FALLBACK_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "for",
  "from",
  "had",
  "has",
  "have",
  "he",
  "her",
  "his",
  "i",
  "if",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "she",
  "that",
  "the",
  "their",
  "this",
  "to",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
  "would",
  "you",
  "your",
]);

export function normalizeExpressionPhrase(phrase: string) {
  return phrase.toLowerCase().replace(/\s+/g, " ").trim();
}

function getFallbackPhraseCandidate(sentence: string) {
  const words = Array.from(sentence.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)).map(
    (match) => match[0]
  );
  let bestCandidate = "";
  let bestScore = -1;

  for (let start = 0; start < words.length - 1; start += 1) {
    for (let length = Math.min(4, words.length - start); length >= 2; length -= 1) {
      const phraseWords = words.slice(start, start + length);
      const normalizedWords = phraseWords.map((word) => word.toLowerCase());
      const contentWords = normalizedWords.filter(
        (word) => !FALLBACK_STOP_WORDS.has(word)
      );

      if (!contentWords.length) continue;
      if (contentWords.length === 1 && contentWords[0].length < 5) continue;

      const hasUsefulBridge = normalizedWords.some((word) =>
        /^(about|after|before|for|from|in|of|on|to|with)$/.test(word)
      );
      const score =
        contentWords.length * 12 +
        contentWords.join("").length +
        (hasUsefulBridge ? 5 : 0) -
        start * 0.2;

      if (score > bestScore) {
        bestCandidate = phraseWords.join(" ");
        bestScore = score;
      }
    }
  }

  return bestCandidate;
}

export function createFallbackHighlightedExpressions(sentence: string) {
  const normalizedSentence = normalizeExpressionPhrase(sentence);
  const expressions: HighlightedExpression[] = [];

  function addExpression(rawPhrase: string, meaning?: string) {
    const phrase = normalizeExpressionPhrase(rawPhrase);
    if (!phrase || !normalizedSentence.includes(phrase)) return;
    if (phrase.split(" ").length < 2) return;
    if (expressions.some((item) => item.phrase === phrase)) return;

    expressions.push({
      phrase,
      meaning:
        meaning ||
        FALLBACK_EXPRESSION_MEANINGS[phrase] ||
        FALLBACK_HIGHLIGHT_MEANING,
    });
  }

  for (const [phrase, meaning] of Object.entries(FALLBACK_EXPRESSION_MEANINGS)) {
    if (normalizedSentence.includes(phrase)) {
      addExpression(phrase, meaning);
    }
  }

  const andPhraseMatch = sentence.match(
    /\b([A-Za-z]+(?:ful|ent|ant|ous|ive|y)?\s+and\s+[A-Za-z]+(?:ful|ent|ant|ous|ive|y)?)\b/
  );

  if (andPhraseMatch?.[1]) {
    addExpression(andPhraseMatch[1]);
  }

  for (const pattern of FALLBACK_PHRASE_PATTERNS) {
    const match = sentence.match(pattern);
    if (match?.[0]) {
      addExpression(match[0]);
    }
  }

  if (!expressions.length) {
    addExpression(getFallbackPhraseCandidate(sentence));
  }

  return expressions.slice(0, 3);
}

export function splitSentenceByHighlightedExpressions(
  sentence: string,
  expressions: HighlightedExpression[]
) {
  const usableExpressions = expressions
    .map((expression) => ({
      ...expression,
      phrase: expression.phrase.trim(),
    }))
    .filter((expression) => expression.phrase)
    .sort((a, b) => b.phrase.length - a.phrase.length);

  const segments: Array<
    | { type: "text"; value: string }
    | { type: "expression"; value: string; expression: HighlightedExpression }
  > = [];
  let cursor = 0;
  const lowerSentence = sentence.toLowerCase();

  while (cursor < sentence.length) {
    const match = usableExpressions
      .map((expression) => ({
        expression,
        index: lowerSentence.indexOf(expression.phrase.toLowerCase(), cursor),
      }))
      .filter((item) => item.index >= cursor)
      .sort(
        (a, b) =>
          a.index - b.index ||
          b.expression.phrase.length - a.expression.phrase.length
      )[0];

    if (!match) {
      segments.push({ type: "text", value: sentence.slice(cursor) });
      break;
    }

    if (match.index > cursor) {
      segments.push({ type: "text", value: sentence.slice(cursor, match.index) });
    }

    const value = sentence.slice(
      match.index,
      match.index + match.expression.phrase.length
    );
    segments.push({
      type: "expression",
      value,
      expression: match.expression,
    });
    cursor = match.index + match.expression.phrase.length;
  }

  return segments;
}
