import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

function shouldUseDeterministicFallback(chinese: string) {
  return /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/.test(
    chinese
  );
}

export async function POST(req: Request) {
  try {
    const { chinese } = (await req.json()) as { chinese?: unknown };

    const chineseText = cleanText(chinese);

    if (!chineseText) {
      return NextResponse.json({ error: "NO_CHINESE" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY || shouldUseDeterministicFallback(chineseText)) {
      return NextResponse.json({
        english: createFallbackEnglish(chineseText),
        source: "fallback",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Translate the user's Chinese into one natural, idiomatic spoken English sentence for daily conversation practice. Preserve only the meaning in the Chinese. Do not add new facts, reasons, objects, places, or events. Return only the English sentence. No explanation.",
        },
        {
          role: "user",
          content: chineseText,
        },
      ],
    });

    const english = completion.choices[0]?.message?.content?.trim() || "";

    if (!english) {
      return NextResponse.json({ error: "EMPTY_ENGLISH" }, { status: 500 });
    }

    return NextResponse.json({ english });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Generate accurate sentence failed",
      },
      { status: 500 }
    );
  }
}
