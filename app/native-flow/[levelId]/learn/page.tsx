import { notFound } from "next/navigation";
import { NativeFlowWebPage } from "@/components/NativeFlowWebPage";
import {
  getNativeFlowSentence,
  nativeFlowLevelIds,
  nativeFlowLevels,
  nativeFlowProgressRows,
} from "@/data/nativeFlow/courseData";

export function generateStaticParams() {
  return nativeFlowLevelIds.map((levelId) => ({ levelId }));
}

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ levelId: string }>;
  searchParams?: Promise<{ sentence?: string | string[] }>;
}) {
  const { levelId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const sentenceParam = Number(getStringParam(resolvedSearchParams.sentence) || "1");
  const result = getNativeFlowSentence(levelId, sentenceParam);

  if (!result) {
    notFound();
  }

  return (
    <NativeFlowWebPage
      initialLevel={result.level}
      initialSentence={result.sentence}
      levels={nativeFlowLevels}
      progressRows={nativeFlowProgressRows}
    />
  );
}
