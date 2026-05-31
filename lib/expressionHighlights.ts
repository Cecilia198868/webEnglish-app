export type HighlightedExpression = {
  phrase: string;
  meaning: string;
};

const FALLBACK_EXPRESSION_MEANINGS: Record<string, string> = {
  "lush and verdant": "🌱 生机盎然",
  "open a bank account": "🏦 开银行账户",
  "bring along": "🎒 随身带上",
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

export function normalizeExpressionPhrase(phrase: string) {
  return phrase.toLowerCase().replace(/\s+/g, " ").trim();
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
      .sort((a, b) => a.index - b.index || b.expression.phrase.length - a.expression.phrase.length)[0];

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
