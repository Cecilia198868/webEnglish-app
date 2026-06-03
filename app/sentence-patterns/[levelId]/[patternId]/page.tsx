import { notFound } from "next/navigation";
import { SentencePatternStudyPage } from "@/components/SentencePatternPages";
import {
  getSentencePattern,
  sentencePatternLevels,
} from "@/data/sentencePatterns";

export function generateStaticParams() {
  return sentencePatternLevels.flatMap((level) =>
    level.sections
      .flatMap((section) => section.patterns)
      .map((pattern) => ({
        levelId: level.id,
        patternId: String(pattern.id),
      }))
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ levelId: string; patternId: string }>;
}) {
  const { levelId, patternId } = await params;
  const patternNumber = Number(patternId);
  const result = Number.isFinite(patternNumber)
    ? getSentencePattern(levelId, patternNumber)
    : null;

  if (!result) {
    notFound();
  }

  return (
    <SentencePatternStudyPage
      level={result.level}
      patternId={patternNumber}
      section={result.section}
    />
  );
}
