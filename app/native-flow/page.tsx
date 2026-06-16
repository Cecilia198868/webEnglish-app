import { NativeFlowWebPage } from "@/components/NativeFlowWebPage";
import {
  getNativeFlowSentence,
  nativeFlowLevels,
  nativeFlowProgressRows,
} from "@/data/nativeFlow/courseData";

export default function Page() {
  const initial = getNativeFlowSentence("everyday", 15) || getNativeFlowSentence("everyday", 1);

  if (!initial) return null;

  return (
    <NativeFlowWebPage
      initialLevel={initial.level}
      initialSentence={initial.sentence}
      levels={nativeFlowLevels}
      progressRows={nativeFlowProgressRows}
    />
  );
}
