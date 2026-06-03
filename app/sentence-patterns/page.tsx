import { SentencePatternOverviewPage } from "@/components/SentencePatternPages";
import { sentencePatternLevels } from "@/data/sentencePatterns";

export default function Page() {
  return <SentencePatternOverviewPage levels={sentencePatternLevels} />;
}
