import { notFound } from "next/navigation";
import { SentencePatternLevelMenuPage } from "@/components/SentencePatternPages";
import {
  getSentencePatternLevel,
  sentencePatternLevelIds,
} from "@/data/sentencePatterns";

export function generateStaticParams() {
  return sentencePatternLevelIds.map((levelId) => ({ levelId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = getSentencePatternLevel(levelId);

  if (!level) {
    notFound();
  }

  return <SentencePatternLevelMenuPage level={level} />;
}
