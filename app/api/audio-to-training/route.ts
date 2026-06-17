import OpenAI from "openai";
import {
  createFallbackTrainingItemsFromText,
  normalizeToShortTrainingItems,
} from "@/lib/training";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_AUDIO_SIZE_BYTES = 24 * 1024 * 1024;

type AudioTrainingPair = {
  chinese: string;
  english: string;
  startTime: number;
  endTime: number;
};

type WhisperSegment = {
  start?: number;
  end?: number;
  text?: string;
};

function titleFromFormValue(title: FormDataEntryValue | null, audio?: File) {
  if (typeof title === "string" && title.trim()) return title.trim();
  return audio?.name?.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "音频课程";
}

function fallbackPairsFromText(text: string, segments: WhisperSegment[] = []) {
  const items = createFallbackTrainingItemsFromText(text);

  return items.map((item, index) => {
    const segment = segments[index];

    return {
      chinese: item.zh,
      english: item.en,
      startTime: typeof segment?.start === "number" ? segment.start : 0,
      endTime: typeof segment?.end === "number" ? segment.end : 0,
    };
  });
}

function fallbackAudioResponse(title: string, transcript = "", segments: WhisperSegment[] = []) {
  const fallbackSource =
    transcript.trim() ||
    title.trim() ||
    "请练习复述这段音频内容。";
  const pairs = fallbackPairsFromText(fallbackSource, segments);

  return Response.json({
    title,
    transcript,
    segments,
    pairs:
      pairs.length > 0
        ? pairs
        : [
            {
              chinese: "请练习复述这段音频内容。",
              english: "",
              startTime: 0,
              endTime: 0,
            },
          ],
  });
}

export async function POST(req: Request) {
  let fallbackTitle = "音频课程";
  let fallbackTranscript = "";
  let fallbackSegments: WhisperSegment[] = [];

  try {
    const formData = await req.formData();
    const audio = formData.get("audio");
    const title = formData.get("title");

    if (!(audio instanceof File)) {
      return Response.json(
        {
          error: "NO_AUDIO",
          message: "未收到音频文件，请使用字段名 audio 上传。",
        },
        { status: 400 }
      );
    }

    fallbackTitle = titleFromFormValue(title, audio);

    if (audio.size > MAX_AUDIO_SIZE_BYTES) {
      return Response.json(
        {
          error:
            "音频文件太大，请先上传 1-10 分钟的短音频测试，或以后做分段转写功能。",
        },
        { status: 413 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return fallbackAudioResponse(fallbackTitle);
    }

    const transcriptResult = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const transcript = transcriptResult.text?.trim() || "";
    fallbackTranscript = transcript;
    const segments = Array.isArray(transcriptResult.segments)
      ? transcriptResult.segments
          .map((segment) => ({
            start:
              typeof segment.start === "number" ? Number(segment.start) : undefined,
            end: typeof segment.end === "number" ? Number(segment.end) : undefined,
            text: typeof segment.text === "string" ? segment.text.trim() : "",
          }))
          .filter(
            (segment) =>
              typeof segment.start === "number" &&
              typeof segment.end === "number" &&
              typeof segment.text === "string" &&
              segment.text
          )
      : [];
    fallbackSegments = segments;

    if (!transcript) {
      return fallbackAudioResponse(fallbackTitle);
    }

    let raw = "";

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `请把下面带时间戳的英文转写 segments 整理成英语学习训练句。
要求：
1. 只保留有学习价值的日常口语句子，删除无意义重复、背景噪音、嗯啊、破碎词
2. 只要输出某一句，就必须保留原始 segment 对应的 startTime 和 endTime
3. english 必须尽量保持原始 segment 文本，不要大幅改写；可以清理多余空格，可以去掉明显口误
4. 为每句英文提供准确、自然的简体中文翻译
5. 只从提供的 segments 中挑选，不要编造时间
6. 输出严格 JSON：
{
  "pairs": [
    {
      "chinese": "...",
      "english": "...",
      "startTime": 12.3,
      "endTime": 15.8
    }
  ]
}
不要输出 Markdown，不要解释。`,
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                title: fallbackTitle,
                transcript,
                segments,
              },
              null,
              2
            ),
          },
        ],
      });

      raw = completion.choices[0]?.message?.content ?? "";
    } catch (error) {
      console.error("audio training format fallback:", error);
      return fallbackAudioResponse(fallbackTitle, transcript, segments);
    }

    let parsed: { pairs?: AudioTrainingPair[] };

    try {
      parsed = JSON.parse(raw) as { pairs?: AudioTrainingPair[] };
    } catch {
      return fallbackAudioResponse(fallbackTitle, transcript, segments);
    }

    const pairs = Array.isArray(parsed.pairs)
      ? normalizeToShortTrainingItems(
          parsed.pairs.filter(
          (item) =>
            item &&
            typeof item.chinese === "string" &&
            typeof item.english === "string" &&
            typeof item.startTime === "number" &&
            typeof item.endTime === "number" &&
            (item.chinese.trim() || item.english.trim())
          ).map((item) => ({
            zh: item.chinese.trim(),
            en: item.english.trim(),
            startTime: item.startTime,
            endTime: item.endTime,
          }))
        ).map((item) => ({
          chinese: item.zh,
          english: item.en,
          startTime: item.startTime ?? 0,
          endTime: item.endTime ?? 0,
        }))
      : [];

    if (pairs.length === 0) {
      return fallbackAudioResponse(fallbackTitle, transcript, segments);
    }

    return Response.json({
      title: fallbackTitle,
      transcript,
      segments: segments as WhisperSegment[],
      pairs,
    });
  } catch (error) {
    console.error("audio-to-training error:", error);

    return fallbackAudioResponse(
      fallbackTitle,
      fallbackTranscript,
      fallbackSegments
    );
  }
}
