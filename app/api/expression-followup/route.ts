import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GuidedTurn = {
  chinese?: unknown;
  userEnglish?: unknown;
  recommendedEnglish?: unknown;
};

type FollowupResponse = {
  suggestion?: string;
};

const fallbackSuggestionGroups = [
  {
    pattern: /\u5929\u6c14|\u592a\u9633|\u8212\u670d|\u540e\u9662|\u6237\u5916/,
    suggestions: [
      "\u6211\u60f3\u5728\u6237\u5916\u591a\u5f85\u4e00\u4f1a\u513f\u3002",
      "\u8fd9\u6837\u7684\u5929\u6c14\u8ba9\u6211\u5fc3\u60c5\u5f88\u597d\u3002",
      "\u6211\u4eec\u53ef\u4ee5\u8fb9\u6563\u6b65\u8fb9\u804a\u5929\u3002",
    ],
  },
  {
    pattern: /\u8fd0\u52a8|\u6563\u6b65|\u8dd1\u6b65|\u953b\u70bc|\u7cbe\u795e|\u7761/,
    suggestions: [
      "\u8fd0\u52a8\u8ba9\u6211\u611f\u89c9\u7cbe\u795e\u5145\u6c9b\uff0c\u665a\u4e0a\u7761\u5f97\u7279\u522b\u597d\u3002",
      "\u6211\u60f3\u6bcf\u5929\u90fd\u62bd\u70b9\u65f6\u95f4\u953b\u70bc\u3002",
      "\u6563\u6b65\u4e4b\u540e\uff0c\u6211\u7684\u5fc3\u60c5\u4f1a\u653e\u677e\u5f88\u591a\u3002",
    ],
  },
  {
    pattern: /\u7d2f|\u75b2\u60eb|\u4f11\u606f|\u653e\u677e/,
    suggestions: [
      "\u6211\u60f3\u627e\u4e2a\u5b89\u9759\u7684\u5730\u65b9\u4f11\u606f\u4e00\u4e0b\u3002",
      "\u4f11\u606f\u51e0\u5206\u949f\u540e\uff0c\u6211\u5e94\u8be5\u4f1a\u597d\u4e00\u4e9b\u3002",
      "\u6211\u4eec\u5148\u653e\u677e\u4e00\u4e0b\uff0c\u7136\u540e\u518d\u7ee7\u7eed\u5427\u3002",
    ],
  },
  {
    pattern: /\u5f00\u5fc3|\u9ad8\u5174|\u559c\u6b22|\u4eab\u53d7/,
    suggestions: [
      "\u8fd9\u79cd\u611f\u89c9\u8ba9\u6211\u4e00\u6574\u5929\u90fd\u5f88\u5f00\u5fc3\u3002",
      "\u6211\u5f88\u559c\u6b22\u8fd9\u6837\u8f7b\u677e\u7684\u65f6\u523b\u3002",
      "\u8fd9\u4ef6\u4e8b\u8ba9\u6211\u89c9\u5f97\u5f88\u6709\u52a8\u529b\u3002",
    ],
  },
  {
    pattern: /\u997f|\u5403|\u5496\u5561|\u8336|\u559d/,
    suggestions: [
      "\u7b49\u4e00\u4e0b\u6211\u60f3\u53bb\u4e70\u70b9\u597d\u5403\u7684\u3002",
      "\u6211\u60f3\u559d\u4e00\u676f\u70ed\u8336\uff0c\u8ba9\u81ea\u5df1\u653e\u677e\u4e00\u70b9\u3002",
      "\u5403\u70b9\u4e1c\u897f\u4e4b\u540e\uff0c\u6211\u4f1a\u66f4\u6709\u7cbe\u795e\u3002",
    ],
  },
];

const defaultSuggestions = [
  "\u6211\u8fd8\u60f3\u591a\u8bf4\u4e00\u70b9\u6211\u7684\u611f\u53d7\u3002",
  "\u8fd9\u4ef6\u4e8b\u8ba9\u6211\u60f3\u5230\u4e86\u53e6\u4e00\u4e2a\u7ec6\u8282\u3002",
  "\u6211\u89c9\u5f97\u8fd9\u6837\u7684\u7ec3\u4e60\u80fd\u8ba9\u6211\u66f4\u81ea\u4fe1\u3002",
];

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function chooseSuggestion(
  candidates: string[],
  currentChinese: string,
  usedChinese: string[]
) {
  const available = candidates.filter(
    (candidate) =>
      candidate !== currentChinese && !usedChinese.includes(candidate)
  );
  const pool = available.length ? available : candidates;
  const seed = Array.from(currentChinese).reduce(
    (total, char) => total + char.charCodeAt(0),
    usedChinese.length
  );

  return pool[seed % pool.length] || defaultSuggestions[0];
}

function createFallbackSuggestion(currentChinese: string, usedChinese: string[]) {
  const group = fallbackSuggestionGroups.find(({ pattern }) =>
    pattern.test(currentChinese)
  );

  return chooseSuggestion(
    group?.suggestions || defaultSuggestions,
    currentChinese,
    usedChinese
  );
}

export async function POST(req: Request) {
  let fallbackChinese = defaultSuggestions[0];
  let usedChinese: string[] = [];

  try {
    const body = (await req.json()) as {
      currentChinese?: unknown;
      userEnglish?: unknown;
      recommendedEnglish?: unknown;
      turns?: GuidedTurn[];
    };

    const currentChinese = cleanText(body.currentChinese);
    const userEnglish = cleanText(body.userEnglish);
    const recommendedEnglish = cleanText(body.recommendedEnglish);
    const turns = Array.isArray(body.turns)
      ? body.turns
          .map((turn) => ({
            chinese: cleanText(turn.chinese),
            recommendedEnglish: cleanText(turn.recommendedEnglish),
          }))
          .filter((turn) => turn.chinese || turn.recommendedEnglish)
          .slice(-6)
      : [];

    usedChinese = turns.map((turn) => turn.chinese).filter(Boolean);

    if (!currentChinese) {
      return NextResponse.json({ suggestion: "" });
    }

    fallbackChinese = createFallbackSuggestion(currentChinese, usedChinese);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        suggestion: fallbackChinese,
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
            'You are a Chinese conversation coach inside an English speaking practice app. Generate the next Simplified Chinese sentence the learner can say so the conversation continues naturally. The semantic sources are currentChinese and recommendedEnglish. learnerTranscript is only an unreliable speech-recognition transcript, so never add facts, people, objects, locations, reasons, or events from it unless they are supported by currentChinese or recommendedEnglish. Requirements: keep context continuous, make the next detail natural and concrete, suitable for a lower-intermediate learner, one Simplified Chinese sentence only, around 12 to 34 Chinese characters, no English, no explanation. Return only JSON: {"suggestion":"..."}.',
        },
        {
          role: "user",
          content: JSON.stringify({
            currentChinese,
            learnerTranscript: userEnglish,
            recommendedEnglish,
            recentTurns: turns,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as FollowupResponse;
    const suggestion = cleanText(parsed.suggestion);

    return NextResponse.json({
      suggestion: suggestion || fallbackChinese,
    });
  } catch {
    return NextResponse.json({
      suggestion: fallbackChinese,
      source: "fallback",
    });
  }
}
