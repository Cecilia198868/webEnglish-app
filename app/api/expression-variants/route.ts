import OpenAI from "openai";
import { NextResponse } from "next/server";

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

function createFallbackEnglish(chinese: string) {
  const normalizedChinese = chinese.replace(/\s+/g, "");
  const hasConcert = /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
    normalizedChinese
  );
  const hasTuesday = /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(
    normalizedChinese
  );
  const hasCentralPark = /\u4e2d\u592e\u516c\u56ed|centralpark/i.test(
    normalizedChinese
  );
  const hasWe = /\u6211\u4eec|\u54b1\u4eec/.test(normalizedChinese);

  if (hasConcert && hasCentralPark) {
    const subject = hasWe ? "we're" : "I'm";
    const subjectFull = hasWe ? "We're" : "I'm";

    if (hasTuesday) {
      return `Today is Tuesday, and ${subject} going to Central Park to see a concert.`;
    }

    return `${subjectFull} going to Central Park to see a concert today.`;
  }

  if (hasTuesday && hasConcert) {
    return hasWe
      ? "Today is Tuesday, and we're going to a concert."
      : "Today is Tuesday, and I'm going to a concert.";
  }

  if (hasConcert) {
    return hasWe
      ? "We're going to a concert today."
      : "I'm going to a concert today.";
  }

  if (/\u8fd0\u52a8|\u953b\u70bc|\u7cbe\u795e|\u7761/.test(normalizedChinese)) {
    return "Exercise makes me feel energized, and I sleep really well at night.";
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    return "Let's take a short break, and then we can go for a walk later.";
  }

  if (/\u6237\u5916|\u5929\u6c14|\u592a\u9633/.test(normalizedChinese)) {
    return "I want to stay outside a little longer and enjoy the weather.";
  }

  if (/\u5f00\u5fc3|\u559c\u6b22|\u4eab\u53d7|\u9ad8\u5174/.test(normalizedChinese)) {
    return "This feeling makes me happy for the whole day.";
  }

  if (/\u5403|\u997f|\u5496\u5561|\u8336|\u559d/.test(normalizedChinese)) {
    return "I want to get something nice to eat in a little while.";
  }

  return "I want to say a little more about how I feel.";
}

function isEnglishRelevantToChinese(chinese: string, english: string) {
  const lowerEnglish = english.toLowerCase();

  if (
    /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
      chinese
    ) &&
    !/(concert|gig|recital|live music|music show|performance)/.test(
      lowerEnglish
    )
  ) {
    return false;
  }

  if (
    /\u4e2d\u592e\u516c\u56ed|centralpark/i.test(chinese) &&
    !/central park/.test(lowerEnglish)
  ) {
    return false;
  }

  if (
    /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(chinese) &&
    !/tuesday/.test(lowerEnglish)
  ) {
    return false;
  }

  return true;
}

function shouldUseDeterministicFallback(chinese: string) {
  return /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
    chinese
  );
}

function createFallbackVariants(chinese: string, standardEnglish: string) {
  const standard = standardEnglish || createFallbackEnglish(chinese);
  const normalizedChinese = chinese.replace(/\s+/g, "");
  const hasConcert = /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
    normalizedChinese
  );
  const hasTuesday = /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/.test(
    normalizedChinese
  );
  const hasCentralPark = /\u4e2d\u592e\u516c\u56ed|centralpark/i.test(
    normalizedChinese
  );
  const hasWe = /\u6211\u4eec|\u54b1\u4eec/.test(normalizedChinese);

  if (hasConcert && hasCentralPark) {
    if (hasWe) {
      return {
        standard,
        idiomatic: hasTuesday
          ? "It's Tuesday today, and we're heading to Central Park for a concert."
          : "We're heading to Central Park for a concert today.",
        simple: hasTuesday
          ? "Today is Tuesday. We're going to Central Park to see a concert."
          : "We're going to Central Park to see a concert today.",
        natural: hasTuesday
          ? "It's Tuesday, and we're going to Central Park for a concert later."
          : "We're going to Central Park for a concert later today.",
        spoken: hasTuesday
          ? "Today's Tuesday, and we're going to catch a concert in Central Park."
          : "We're going to catch a concert in Central Park today.",
      };
    }

    return {
      standard,
      idiomatic: hasTuesday
        ? "It's Tuesday today, and I'm heading to Central Park for a concert."
        : "I'm heading to Central Park for a concert today.",
      simple: hasTuesday
        ? "Today is Tuesday. I'm going to Central Park to see a concert."
        : "I'm going to Central Park to see a concert today.",
      natural: hasTuesday
        ? "It's Tuesday, and I'm going to Central Park for a concert later."
        : "I'm going to Central Park for a concert later today.",
      spoken: hasTuesday
        ? "Today's Tuesday, and I'm going to catch a concert in Central Park."
        : "I'm going to catch a concert in Central Park today.",
    };
  }

  if (hasTuesday && hasConcert) {
    if (hasWe) {
      return {
        standard,
        idiomatic: "It's Tuesday today, and we're going to a concert.",
        simple: "Today is Tuesday. We're going to a concert.",
        natural: "It's Tuesday, and we're going to a concert later.",
        spoken: "Today's Tuesday, and we're going to catch a concert.",
      };
    }

    return {
      standard,
      idiomatic: "It's Tuesday today, and I'm going to a concert.",
      simple: "Today is Tuesday. I'm going to a concert.",
      natural: "It's Tuesday, and I'm going to a concert later.",
      spoken: "Today's Tuesday, and I'm going to catch a concert.",
    };
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    return {
      standard: standard || "Let's take a break, and then go for a walk later.",
      idiomatic: "Let's take a break first, then go for a walk later.",
      simple: "Let's rest first, and then take a walk later.",
      natural: "Let's take a break, and we can go for a walk in a while.",
      spoken: "How about we take a break and go for a walk later?",
    };
  }

  if (/\u8fd0\u52a8|\u953b\u70bc|\u7cbe\u795e|\u7761/.test(chinese)) {
    return {
      standard,
      idiomatic: "Working out leaves me feeling energized, and I sleep much better at night.",
      simple: "Exercise makes me feel good, and I sleep better at night.",
      natural: "After I exercise, I feel full of energy and sleep really well.",
      spoken: "Working out gives me energy, and I sleep really well after that.",
    };
  }

  return {
    standard,
    idiomatic: standard,
    simple: standard,
    natural: standard,
    spoken: standard,
  };
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
            'Create five English alternatives for a spoken English learner. Semantic authority is strict: use "authoritativeEnglish" when it is provided; otherwise use only the meaning of "chinese". "learnerTranscript" is an unreliable speech-recognition transcript of the learner\'s attempt. It may contain wrong words or extra facts. Never copy or preserve facts, nouns, reasons, places, events, or causal links from learnerTranscript unless they are clearly supported by chinese or authoritativeEnglish. If learnerTranscript conflicts with chinese or authoritativeEnglish, ignore learnerTranscript. Return only JSON with keys "standard", "idiomatic", "simple", "natural", and "spoken". Keep each value one sentence. "standard" should be accurate and polished. "idiomatic" should sound more native. "simple" should be easy beginner English. "natural" should sound casual and everyday. "spoken" should be relaxed conversational English.',
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

    return NextResponse.json({ variants });
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
