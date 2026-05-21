import { NextResponse } from "next/server";
import OpenAI from "openai";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supportedImageExtensions = [".png", ".jpg", ".jpeg", ".webp"];
const maxImageSizeBytes = 12 * 1024 * 1024;

function normalizeExtractedText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function getImageMimeType(file: File, lowerName: string) {
  if (file.type && file.type.startsWith("image/")) return file.type;
  if (lowerName.endsWith(".png")) return "image/png";
  if (lowerName.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function isSupportedImage(file: File, lowerName: string) {
  return (
    file.type.startsWith("image/") ||
    supportedImageExtensions.some((extension) => lowerName.endsWith(extension))
  );
}

async function extractTextFromImage(file: File, lowerName: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("缺少 OPENAI_API_KEY，暂时无法识别图片文字。");
  }

  if (file.size > maxImageSizeBytes) {
    throw new Error("图片文件过大，请换一张更清晰、体积更小的图片。");
  }

  if (
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif") ||
    file.type.includes("heic") ||
    file.type.includes("heif")
  ) {
    throw new Error("当前图片格式暂不支持，请使用 JPG、PNG 或 WebP 图片。");
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = getImageMimeType(file, lowerName);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an OCR engine. Extract all visible text from the image in reading order. Preserve line breaks when useful. Return only the extracted text. Do not describe the image.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "请识别图片中的所有可见文字。保留中英文内容和合理换行，只输出识别出的文字，不要解释。",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
  });

  return completion.choices[0]?.message?.content || "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "没有收到文件" },
        { status: 400 }
      );
    }

    const lowerName = file.name.toLowerCase();
    const isImage = isSupportedImage(file, lowerName);

    if (lowerName.endsWith(".doc")) {
      return NextResponse.json(
        { error: "当前 .doc 文件暂不支持直接解析，建议保存为 docx 后上传。" },
        { status: 400 }
      );
    }

    if (
      !isImage &&
      !lowerName.endsWith(".txt") &&
      !lowerName.endsWith(".text") &&
      !lowerName.endsWith(".srt") &&
      !lowerName.endsWith(".docx") &&
      !lowerName.endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "当前文件无法读取，请尝试 txt、docx 或可复制文本的 PDF。" },
        { status: 400 }
      );
    }

    let extractedText = "";

    if (isImage) {
      extractedText = await extractTextFromImage(file, lowerName);
    } else if (
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".text") ||
      lowerName.endsWith(".srt")
    ) {
      extractedText = await file.text();
    } else if (lowerName.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(arrayBuffer),
      });
      extractedText = result.value || "";
    } else if (lowerName.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const parser = new PDFParse({ data: Buffer.from(arrayBuffer) });
      try {
        const result = await parser.getText();
        extractedText = result.text || "";
      } finally {
        await parser.destroy();
      }
    }

    const normalizedText = normalizeExtractedText(extractedText);

    if (!normalizedText) {
      return NextResponse.json(
        {
          error: isImage
            ? "暂时无法识别这张图片的文字，请换一张更清晰的图片。"
            : "当前文件无法读取，请尝试 txt、docx 或可复制文本的 PDF。",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: normalizedText,
      fileName: file.name,
    });
  } catch (error) {
    console.error("extract-text error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "当前文件无法读取，请尝试 txt、docx、PDF 或清晰图片。",
      },
      { status: 500 }
    );
  }
}
