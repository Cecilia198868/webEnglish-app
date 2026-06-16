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
};

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

function createFallbackVariants(chinese: string, standardEnglish: string) {
  const standard = standardEnglish || createFallbackEnglish(chinese);

  if (/\u4f11\u606f|\u6563\u6b65/.test(chinese)) {
    return {
      standard: standard || "Let's take a break, and then go for a walk later.",
      idiomatic: "Let's take a break first, then go for a walk later.",
      simple: "Let's rest first, and then take a walk later.",
      natural: "Let's take a break, and we can go for a walk in a while.",
    };
  }

  if (/\u8fd0\u52a8|\u953b\u70bc|\u7cbe\u795e|\u7761/.test(chinese)) {
    return {
      standard,
      idiomatic: "Working out leaves me feeling energized, and I sleep much better at night.",
      simple: "Exercise makes me feel good, and I sleep better at night.",
      natural: "After I exercise, I feel full of energy and sleep really well.",
    };
  }

  return {
    standard,
    idiomatic: standard,
    simple: standard,
    natural: standard,
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
    const authoritativeEnglish = cleanText(standardEnglish);

    if (!chineseText) {
      return NextResponse.json({ error: "NO_CHINESE" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
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
            'Create four English alternatives for a spoken English learner. Semantic authority is strict: use "authoritativeEnglish" when it is provided; otherwise use only the meaning of "chinese". "learnerTranscript" is an unreliable speech-recognition transcript of the learner\'s attempt. It may contain wrong words or extra facts. Never copy or preserve facts, nouns, reasons, places, events, or causal links from learnerTranscript unless they are clearly supported by chinese or authoritativeEnglish. If learnerTranscript conflicts with chinese or authoritativeEnglish, ignore learnerTranscript. Return only JSON with keys "standard", "idiomatic", "simple", and "natural". Keep each value one sentence. "standard" should be accurate and polished. "idiomatic" should sound more native. "simple" should be easy beginner English. "natural" should sound casual and everyday.',
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
