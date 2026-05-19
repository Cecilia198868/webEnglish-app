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

export async function POST(req: Request) {
  try {
    const { chinese, userEnglish, standardEnglish } = (await req.json()) as {
      chinese?: unknown;
      userEnglish?: unknown;
      standardEnglish?: unknown;
    };

    if (typeof chinese !== "string" || !chinese.trim()) {
      return NextResponse.json({ error: "NO_CHINESE" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Create four English alternatives for a spoken English learner. Return only JSON with keys "standard", "idiomatic", "simple", and "natural". Keep each value one sentence. "standard" should be accurate and polished. "idiomatic" should sound more native. "simple" should be easy beginner English. "natural" should sound casual and everyday.',
        },
        {
          role: "user",
          content: JSON.stringify({
            chinese: chinese.trim(),
            userEnglish:
              typeof userEnglish === "string" ? userEnglish.trim() : "",
            standardEnglish:
              typeof standardEnglish === "string" ? standardEnglish.trim() : "",
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
