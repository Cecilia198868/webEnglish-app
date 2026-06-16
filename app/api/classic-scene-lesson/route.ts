import { getFeaturedLessonById } from "@/data/featuredCourses";
import { getPrebuiltClassicExpressionSet } from "@/data/prebuiltClassicExpressions";
import { parseTrainingContent } from "@/lib/training";

const fallbackVariantLabels = [
  { key: "standard", label: "\u63a8\u8350\u8868\u8fbe" },
  { key: "idiomatic", label: "\u66f4\u5730\u9053" },
  { key: "simple", label: "\u66f4\u7b80\u5355" },
  { key: "natural", label: "\u66f4\u81ea\u7136" },
] as const;

function createFallbackVariants(english: string) {
  return fallbackVariantLabels.map(({ key, label }) => ({
    key,
    label,
    text: english,
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId")?.trim();

  if (!lessonId) {
    return Response.json(
      { error: "Missing classic scene lesson id." },
      { status: 400 }
    );
  }

  const lesson = getFeaturedLessonById(lessonId);

  if (!lesson) {
    return Response.json(
      { error: "Classic scene lesson was not found." },
      { status: 404 }
    );
  }

  const turns = parseTrainingContent(lesson.txt_content || "").map(
    (pair, sentenceIndex) => {
      const prebuiltSet = getPrebuiltClassicExpressionSet(
        lesson.id,
        sentenceIndex
      );
      const standardEnglish =
        prebuiltSet?.standardEnglish || pair.english || "";

      return {
        chinese: pair.chinese,
        standardEnglish,
        variants: prebuiltSet?.variants.length
          ? prebuiltSet.variants
          : createFallbackVariants(standardEnglish),
      };
    }
  );

  return Response.json({
    lesson: {
      continueHref: `/study/${lesson.id}`,
      id: lesson.id,
      initialIndex: 0,
      sectionTitle: "",
      title: lesson.title,
      turns,
    },
  });
}
