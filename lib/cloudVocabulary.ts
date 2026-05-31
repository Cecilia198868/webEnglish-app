import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  mergeVocabularyWords,
  normalizeExpressionStudyProgress,
  normalizeVocabularyDefinition,
  normalizeVocabularyWord,
  type VocabularyWord,
} from "@/lib/vocabulary";

type UserVocabularyRow = {
  correct_count: number | null;
  created_at: string | null;
  example: string | null;
  example_zh: string | null;
  mastered_count: number | null;
  meaning: string | null;
  part_of_speech: string | null;
  source_sentence: string | null;
  user_email: string;
  word: string;
  wrong_count: number | null;
};

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function cleanCreatedAt(value: unknown) {
  if (typeof value !== "string") return new Date().toISOString();

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? value : new Date().toISOString();
}

function rowToVocabularyWord(row: UserVocabularyRow): VocabularyWord | null {
  const word = normalizeVocabularyWord(row.word);
  if (!word) return null;

  const definition = normalizeVocabularyDefinition({
    example: row.example || "",
    exampleZh: row.example_zh || "",
    meaning: row.meaning || "",
    partOfSpeech: row.part_of_speech || "",
  });
  const masteredCount = cleanCount(row.mastered_count);
  const correctCount = cleanCount(row.correct_count);
  const studyProgress = normalizeExpressionStudyProgress({
    correctCount,
    masteredCount,
  });

  return {
    correctCount,
    createdAt: cleanCreatedAt(row.created_at),
    example: definition.example,
    exampleZh: definition.exampleZh,
    id: word,
    manuallyMastered: studyProgress.manuallyMastered,
    masteredCount,
    meaning: definition.meaning,
    meaningZh: definition.meaning,
    nextReviewAt: studyProgress.nextReviewAt,
    partOfSpeech: definition.partOfSpeech,
    playCount: studyProgress.playCount,
    shadowCount: studyProgress.shadowCount,
    sourceSentence: row.source_sentence || undefined,
    status: studyProgress.status,
    streakDays: studyProgress.streakDays,
    studiedDates: studyProgress.studiedDates,
    text: word,
    firstStudiedAt: studyProgress.firstStudiedAt,
    lastStudiedAt: studyProgress.lastStudiedAt,
    word,
    wrongCount: cleanCount(row.wrong_count),
  };
}

function normalizeIncomingVocabularyWords(words: unknown) {
  if (!Array.isArray(words)) return [] as VocabularyWord[];

  const normalizedWords = words
    .map((item): VocabularyWord | null => {
      if (!item || typeof item !== "object") return null;

      const record = item as Partial<VocabularyWord>;
      const word = normalizeVocabularyWord(cleanText(record.word));
      if (!word) return null;

      const definition = normalizeVocabularyDefinition(record);
      const studyProgress = normalizeExpressionStudyProgress(record);

      return {
        correctCount: cleanCount(record.correctCount),
        createdAt: cleanCreatedAt(record.createdAt),
        example: definition.example,
        exampleZh: definition.exampleZh,
        firstStudiedAt: studyProgress.firstStudiedAt,
        id: cleanText(record.id) || word,
        lastStudiedAt: studyProgress.lastStudiedAt,
        manuallyMastered: studyProgress.manuallyMastered,
        masteredCount: cleanCount(record.masteredCount),
        meaning: definition.meaning,
        meaningZh: cleanText(record.meaningZh) || definition.meaning,
        nextReviewAt: studyProgress.nextReviewAt,
        partOfSpeech: definition.partOfSpeech,
        playCount: studyProgress.playCount,
        shadowCount: studyProgress.shadowCount,
        sourceSentence: cleanText(record.sourceSentence) || undefined,
        status: studyProgress.status,
        streakDays: studyProgress.streakDays,
        studiedDates: studyProgress.studiedDates,
        text: cleanText(record.text) || word,
        word,
        wrongCount: cleanCount(record.wrongCount),
      };
    })
    .filter((word): word is VocabularyWord => Boolean(word));

  return mergeVocabularyWords(normalizedWords);
}

export async function listCloudVocabularyWords(email: string) {
  const normalizedEmail = cleanEmail(email);
  if (!normalizedEmail) return [] as VocabularyWord[];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(
      "user_email, word, meaning, part_of_speech, example, example_zh, source_sentence, mastered_count, wrong_count, correct_count, created_at"
    )
    .eq("user_email", normalizedEmail)
    .order("created_at", { ascending: true })
    .returns<UserVocabularyRow[]>();

  if (error) {
    throw error;
  }

  return mergeVocabularyWords(
    (data || [])
      .map(rowToVocabularyWord)
      .filter((word): word is VocabularyWord => Boolean(word))
  );
}

export async function mergeCloudVocabularyWords(
  email: string,
  rawWords: unknown
) {
  const normalizedEmail = cleanEmail(email);
  if (!normalizedEmail) return [] as VocabularyWord[];

  const incomingWords = normalizeIncomingVocabularyWords(rawWords);
  const existingWords = await listCloudVocabularyWords(normalizedEmail);
  const mergedWords = mergeVocabularyWords(existingWords, incomingWords);

  if (!mergedWords.length) return mergedWords;

  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("user_vocabulary").upsert(
    mergedWords.map((word) => ({
      correct_count: word.correctCount,
      created_at: word.createdAt,
      example: word.example,
      example_zh: word.exampleZh,
      mastered_count: word.masteredCount,
      meaning: word.meaning,
      part_of_speech: word.partOfSpeech,
      source_sentence: word.sourceSentence || null,
      updated_at: now,
      user_email: normalizedEmail,
      word: word.word,
      wrong_count: word.wrongCount,
    })),
    { onConflict: "user_email,word" }
  );

  if (error) {
    throw error;
  }

  return listCloudVocabularyWords(normalizedEmail);
}

export async function deleteCloudVocabularyWord(email: string, word: string) {
  const normalizedEmail = cleanEmail(email);
  const normalizedWord = normalizeVocabularyWord(word);
  if (!normalizedEmail || !normalizedWord) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("user_vocabulary")
    .delete()
    .eq("user_email", normalizedEmail)
    .eq("word", normalizedWord);

  if (error) {
    throw error;
  }
}
