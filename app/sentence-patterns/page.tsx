import SentencePatternsWebPage from "@/components/SentencePatternsWebPage";
import { sentencePatternLevels } from "@/data/sentencePatterns";

export default function Page() {
  return <SentencePatternsWebPage levels={sentencePatternLevels} />;
}
