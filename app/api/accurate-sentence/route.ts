import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function createFallbackEnglish(chinese: string) {
  if (/\u8fd0\u52a8|\u953b\u70bc|\u7cbe\u795e|\u7761/.test(chinese)) {
    return "Exercise makes me feel energized, and I sleep really well at night.";
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(chinese)) {
    return "Let's take a short break, and then we can go for a walk later.";
  }

  if (/\u6237\u5916|\u5929\u6c14|\u592a\u9633/.test(chinese)) {
    return "I want to stay outside a little longer and enjoy the weather.";
  }

  if (/\u5f00\u5fc3|\u559c\u6b22|\u4eab\u53d7|\u9ad8\u5174/.test(chinese)) {
    return "This feeling makes me happy for the whole day.";
  }

  if (/\u5403|\u997f|\u5496\u5561|\u8336|\u559d/.test(chinese)) {
    return "I want to get something nice to eat in a little while.";
  }

  return "I want to say a little more about how I feel.";
}

export async function POST(req: Request) {
  try {
    const { chinese } = (await req.json()) as { chinese?: unknown };

    const chineseText = cleanText(chinese);

    if (!chineseText) {
      return NextResponse.json({ error: "NO_CHINESE" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
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
