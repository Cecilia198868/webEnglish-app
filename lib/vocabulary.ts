export type ExpressionLearningStatus =
  | "new"
  | "learning"
  | "familiar"
  | "mastered";

export type VocabularyWord = {
  id: string;
  text: string;
  word: string;
  meaningZh: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleZh: string;
  createdAt: string;
  sourceSentence?: string;
  status: ExpressionLearningStatus;
  playCount: number;
  shadowCount: number;
  firstStudiedAt: string | null;
  lastStudiedAt: string | null;
  studiedDates: string[];
  streakDays: number;
  nextReviewAt: string | null;
  manuallyMastered: boolean;
  masteredCount: number;
  wrongCount: number;
  correctCount: number;
};

export type VocabularyGroupMastery = Record<string, number>;

export const VOCABULARY_WORDS_KEY = "vocabulary_words";
export const VOCABULARY_GROUP_MASTERY_KEY = "vocabulary_group_mastery";
export const VOCABULARY_GROUP_SIZE = 30;
let vocabularyCloudSyncTimer: number | null = null;
let vocabularyCloudSyncInFlight: Promise<VocabularyWord[]> | null = null;
let vocabularyCloudSyncRequested = false;
export const PLACEHOLDER_MEANING = "释义待补充";

const GENERIC_MEANINGS = new Set([
  PLACEHOLDER_MEANING,
  "📘 收藏这个单词",
  "✨ 值得学习的表达",
  "值得学习的表达",
]);

const BUILT_IN_DICTIONARY: Record<string, string> = {
  apple: "苹果",
  boat: "船",
  friend: "朋友",
  fish: "鱼",
  fishing: "钓鱼",
  house: "房子",
  room: "房间",
  drugs: "药物",
  advice: "建议",
  right: "正确的",
  mother: "母亲",
  valium: "安眠药",
  hello: "你好",
  deal: "处理",
  figure: "想办法",
  storming: "冲出去",
  without: "没有，不靠",
  because: "因为",
  afraid: "害怕的",
  vodka: "伏特加酒",
  school: "学校",
  work: "工作",
  food: "食物",
  time: "时间",
  travel: "旅行",
  psychic: "有通灵能力的；灵媒的",
};

export const FALLBACK_MEANINGS = [
  "苹果",
  "房子",
  "时间",
  "工作",
  "学校",
  "朋友",
  "食物",
  "旅行",
  "家庭",
  "音乐",
  "电影",
  "天气",
  "衣服",
  "汽车",
  "城市",
  "动物",
  "颜色",
  "身体",
  "电脑",
  "手机",
  "书",
  "水",
  "钱",
  "花",
  "树",
  "道路",
  "商店",
  "医生",
  "老师",
  "学生",
];

export type VocabularyDefinition = {
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleZh: string;
};

type StoredVocabularyWord = Partial<VocabularyWord> & {
  word?: unknown;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function normalizeVocabularyWord(rawWord: string) {
  return rawWord
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/gi, "")
    .trim();
}

export function hasUsableMeaning(meaning: unknown) {
  const normalizedMeaning = typeof meaning === "string" ? meaning.trim() : "";

  return (
    normalizedMeaning !== "" && !GENERIC_MEANINGS.has(normalizedMeaning)
  );
}

export function tokenizeEnglishSentence(sentence: string) {
  const tokens: Array<
    | { type: "word"; value: string; normalized: string }
    | { type: "separator"; value: string }
  > = [];
  const pattern = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
  let lastIndex = 0;

  for (const match of sentence.matchAll(pattern)) {
    const index = match.index ?? 0;
    const word = match[0];

    if (index > lastIndex) {
      tokens.push({
        type: "separator",
        value: sentence.slice(lastIndex, index),
      });
    }

    tokens.push({
      type: "word",
      value: word,
      normalized: normalizeVocabularyWord(word),
    });

    lastIndex = index + word.length;
  }

  if (lastIndex < sentence.length) {
    tokens.push({
      type: "separator",
      value: sentence.slice(lastIndex),
    });
  }

  return tokens;
}

export function getMeaningForWord(word: string) {
  return BUILT_IN_DICTIONARY[normalizeVocabularyWord(word)] || PLACEHOLDER_MEANING;
}

export function normalizeVocabularyDefinition(
  definition?: Partial<VocabularyDefinition> | null
) {
  return {
    meaning: hasUsableMeaning(definition?.meaning)
      ? definition!.meaning!.trim()
      : PLACEHOLDER_MEANING,
    partOfSpeech:
      typeof definition?.partOfSpeech === "string"
        ? definition.partOfSpeech.trim()
        : "",
    example:
      typeof definition?.example === "string" ? definition.example.trim() : "",
    exampleZh:
      typeof definition?.exampleZh === "string"
        ? definition.exampleZh.trim()
        : "",
  } satisfies VocabularyDefinition;
}

function isExpressionLearningStatus(
  status: unknown
): status is ExpressionLearningStatus {
  return (
    status === "new" ||
    status === "learning" ||
    status === "familiar" ||
    status === "mastered"
  );
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getDateKey(date);
}

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isIsoDateLike(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

function normalizeStudiedDates(dates: unknown) {
  if (!Array.isArray(dates)) return [] as string[];

  return Array.from(
    new Set(
      dates.filter(
        (date): date is string => isDateKey(date)
      )
    )
  ).sort();
}

export function calculateExpressionStreakDays(
  studiedDates: string[],
  todayKey = getDateKey()
) {
  const studiedDateSet = new Set(normalizeStudiedDates(studiedDates));
  let cursor = todayKey;

  if (!studiedDateSet.has(cursor)) {
    const yesterdayKey = addDaysToDateKey(todayKey, -1);
    if (!studiedDateSet.has(yesterdayKey)) return 0;
    cursor = yesterdayKey;
  }

  let streakDays = 0;
  while (studiedDateSet.has(cursor)) {
    streakDays += 1;
    cursor = addDaysToDateKey(cursor, -1);
  }

  return streakDays;
}

function getNextReviewDate(status: ExpressionLearningStatus, todayKey = getDateKey()) {
  if (status === "new") return null;
  if (status === "learning") return addDaysToDateKey(todayKey, 1);
  if (status === "familiar") return addDaysToDateKey(todayKey, 3);
  return addDaysToDateKey(todayKey, 7);
}

type ExpressionStudyProgressInput = Partial<
  Pick<
    VocabularyWord,
    | "correctCount"
    | "firstStudiedAt"
    | "lastStudiedAt"
    | "manuallyMastered"
    | "masteredCount"
    | "nextReviewAt"
    | "playCount"
    | "shadowCount"
    | "status"
    | "streakDays"
    | "studiedDates"
  >
>;

function hasExpressionStudyRecord(expression: ExpressionStudyProgressInput) {
  return Boolean(
    expression.firstStudiedAt ||
      expression.lastStudiedAt ||
      expression.manuallyMastered ||
      (expression.playCount || 0) > 0 ||
      (expression.shadowCount || 0) > 0 ||
      (expression.masteredCount || 0) > 0 ||
      (expression.correctCount || 0) > 0 ||
      normalizeStudiedDates(expression.studiedDates).length > 0
  );
}

export function updateExpressionStatus(
  expression: ExpressionStudyProgressInput
): ExpressionLearningStatus {
  const studiedDates = normalizeStudiedDates(expression.studiedDates);
  const playCount = Math.max(0, Math.floor(expression.playCount || 0));
  const shadowCount = Math.max(0, Math.floor(expression.shadowCount || 0));

  if (
    expression.manuallyMastered ||
    (expression.masteredCount || 0) > 0 ||
    (expression.correctCount || 0) > 0 ||
    (shadowCount >= 5 && studiedDates.length >= 3)
  ) {
    return "mastered";
  }

  if (
    shadowCount >= 3 ||
    playCount >= 3 ||
    studiedDates.length >= 2
  ) {
    return "familiar";
  }

  return hasExpressionStudyRecord(expression) ? "learning" : "new";
}

export function normalizeExpressionStudyProgress(
  expression: ExpressionStudyProgressInput
) {
  const studiedDates = normalizeStudiedDates(expression.studiedDates);
  const playCount = Math.max(0, Math.floor(expression.playCount || 0));
  const shadowCount = Math.max(0, Math.floor(expression.shadowCount || 0));
  const manuallyMastered = Boolean(expression.manuallyMastered);
  const savedNextReviewAt = isDateKey(expression.nextReviewAt)
    ? expression.nextReviewAt
    : null;
  const status = updateExpressionStatus({
    ...expression,
    manuallyMastered,
    playCount,
    shadowCount,
    studiedDates,
  });

  return {
    firstStudiedAt: expression.firstStudiedAt || null,
    lastStudiedAt: expression.lastStudiedAt || null,
    manuallyMastered,
    nextReviewAt:
      status === "new"
        ? null
        : savedNextReviewAt || getNextReviewDate(status),
    playCount,
    shadowCount,
    status,
    streakDays: calculateExpressionStreakDays(studiedDates),
    studiedDates,
  } satisfies Pick<
    VocabularyWord,
    | "firstStudiedAt"
    | "lastStudiedAt"
    | "manuallyMastered"
    | "nextReviewAt"
    | "playCount"
    | "shadowCount"
    | "status"
    | "streakDays"
    | "studiedDates"
  >;
}

export function applyExpressionStudyAction(
  expression: VocabularyWord,
  action: "view" | "play" | "shadow" | "mastered"
) {
  const now = new Date().toISOString();
  const todayKey = getDateKey();
  const studiedDates = normalizeStudiedDates([
    ...expression.studiedDates,
    todayKey,
  ]);
  const nextExpression: VocabularyWord = {
    ...expression,
    firstStudiedAt: expression.firstStudiedAt || now,
    lastStudiedAt: now,
    manuallyMastered:
      action === "mastered" ? true : expression.manuallyMastered,
    masteredCount:
      action === "mastered"
        ? Math.max(1, expression.masteredCount)
        : expression.masteredCount,
    playCount:
      action === "play" ? expression.playCount + 1 : expression.playCount,
    shadowCount:
      action === "shadow"
        ? expression.shadowCount + 1
        : expression.shadowCount,
    studiedDates,
  };

  const normalizedProgress = normalizeExpressionStudyProgress(nextExpression);

  return {
    ...nextExpression,
    ...normalizedProgress,
    nextReviewAt: getNextReviewDate(normalizedProgress.status),
  };
}

function getEarliestDateValue(...values: Array<string | null | undefined>) {
  const validValues = values.filter(isIsoDateLike);
  if (!validValues.length) return null;

  return validValues.reduce((earliest, value) =>
    new Date(value).getTime() < new Date(earliest).getTime()
      ? value
      : earliest
  );
}

function getLatestDateValue(...values: Array<string | null | undefined>) {
  const validValues = values.filter(isIsoDateLike);
  if (!validValues.length) return null;

  return validValues.reduce((latest, value) =>
    new Date(value).getTime() > new Date(latest).getTime() ? value : latest
  );
}

function getEarliestReviewDate(...values: Array<string | null | undefined>) {
  const validValues = values.filter(isDateKey);
  if (!validValues.length) return null;

  return validValues.reduce((earliest, value) =>
    value < earliest ? value : earliest
  );
}

function normalizeStoredVocabularyWord(
  item: StoredVocabularyWord | null
): VocabularyWord | null {
  const normalizedWord =
    typeof item?.word === "string"
      ? normalizeVocabularyWord(item.word)
      : typeof item?.text === "string"
        ? normalizeVocabularyWord(item.text)
        : "";

  if (!normalizedWord) return null;

  const normalizedDefinition = normalizeVocabularyDefinition(item);
  const firstStudiedAt = item?.firstStudiedAt;
  const lastStudiedAt = item?.lastStudiedAt;
  const nextReviewAt = item?.nextReviewAt;
  const learningBase = {
    correctCount: typeof item?.correctCount === "number" ? item.correctCount : 0,
    firstStudiedAt: isIsoDateLike(firstStudiedAt) ? firstStudiedAt : null,
    lastStudiedAt: isIsoDateLike(lastStudiedAt) ? lastStudiedAt : null,
    manuallyMastered:
      typeof item?.manuallyMastered === "boolean"
        ? item.manuallyMastered
        : false,
    masteredCount:
      typeof item?.masteredCount === "number" ? item.masteredCount : 0,
    nextReviewAt: isDateKey(nextReviewAt) ? nextReviewAt : null,
    playCount: typeof item?.playCount === "number" ? item.playCount : 0,
    shadowCount: typeof item?.shadowCount === "number" ? item.shadowCount : 0,
    status: isExpressionLearningStatus(item?.status)
      ? item.status
      : undefined,
    studiedDates: Array.isArray(item?.studiedDates)
      ? item.studiedDates.filter(
          (date): date is string => isDateKey(date)
        )
      : [],
  };
  const normalizedMeaning = hasUsableMeaning(normalizedDefinition.meaning)
    ? normalizedDefinition.meaning
    : getMeaningForWord(normalizedWord);
  const studyProgress = normalizeExpressionStudyProgress({
    ...learningBase,
  });

  return {
    id:
      typeof item?.id === "string" && item.id.trim()
        ? item.id.trim()
        : normalizedWord,
    text:
      typeof item?.text === "string" && item.text.trim()
        ? item.text.trim()
        : normalizedWord,
    word: normalizedWord,
    meaning: normalizedMeaning,
    meaningZh:
      typeof item?.meaningZh === "string" && item.meaningZh.trim()
        ? item.meaningZh.trim()
        : normalizedMeaning,
    partOfSpeech: normalizedDefinition.partOfSpeech,
    example: normalizedDefinition.example,
    exampleZh: normalizedDefinition.exampleZh,
    createdAt:
      typeof item?.createdAt === "string" && item.createdAt.trim()
        ? item.createdAt
        : new Date().toISOString(),
    sourceSentence:
      typeof item?.sourceSentence === "string" && item.sourceSentence.trim()
        ? item.sourceSentence.trim()
        : undefined,
    ...studyProgress,
    masteredCount:
      typeof item?.masteredCount === "number" ? item.masteredCount : 0,
    wrongCount: typeof item?.wrongCount === "number" ? item.wrongCount : 0,
    correctCount:
      typeof item?.correctCount === "number" ? item.correctCount : 0,
  } satisfies VocabularyWord;
}

export function loadVocabularyWords(): VocabularyWord[] {
  if (!canUseStorage()) return [] as VocabularyWord[];

  const parsed = safeJsonParse<StoredVocabularyWord[]>(
    localStorage.getItem(VOCABULARY_WORDS_KEY),
    []
  );

  const normalizedWords: Array<VocabularyWord | null> = parsed.map((item) =>
    normalizeStoredVocabularyWord(item)
  );

  return normalizedWords
    .filter(
      (item): item is VocabularyWord =>
        item !== null &&
        typeof item === "object" &&
        typeof item.word === "string" &&
        item.word.trim().length > 0
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

function getValidTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}

function mergeVocabularyWord(
  currentWord: VocabularyWord,
  incomingWord: VocabularyWord
): VocabularyWord {
  const currentMeaningUsable = hasUsableMeaning(currentWord.meaning);
  const incomingMeaningUsable = hasUsableMeaning(incomingWord.meaning);
  const currentCreatedTime = getValidTime(currentWord.createdAt);
  const incomingCreatedTime = getValidTime(incomingWord.createdAt);
  const meaning =
    incomingMeaningUsable && !currentMeaningUsable
      ? incomingWord.meaning
      : currentWord.meaning || incomingWord.meaning;
  const meaningZh =
    hasUsableMeaning(incomingWord.meaningZh) && !hasUsableMeaning(currentWord.meaningZh)
      ? incomingWord.meaningZh
      : currentWord.meaningZh || incomingWord.meaningZh || meaning;
  const studiedDates = normalizeStudiedDates([
    ...currentWord.studiedDates,
    ...incomingWord.studiedDates,
  ]);
  const mergedWord: VocabularyWord = {
    id: currentWord.id || incomingWord.id || currentWord.word,
    text: currentWord.text || incomingWord.text || currentWord.word,
    word: currentWord.word,
    meaning,
    meaningZh,
    partOfSpeech: currentWord.partOfSpeech || incomingWord.partOfSpeech,
    example: currentWord.example || incomingWord.example,
    exampleZh: currentWord.exampleZh || incomingWord.exampleZh,
    createdAt:
      incomingCreatedTime < currentCreatedTime
        ? incomingWord.createdAt
        : currentWord.createdAt,
    sourceSentence: currentWord.sourceSentence || incomingWord.sourceSentence,
    masteredCount: Math.max(currentWord.masteredCount, incomingWord.masteredCount),
    wrongCount: Math.max(currentWord.wrongCount, incomingWord.wrongCount),
    correctCount: Math.max(currentWord.correctCount, incomingWord.correctCount),
    firstStudiedAt: getEarliestDateValue(
      currentWord.firstStudiedAt,
      incomingWord.firstStudiedAt
    ),
    lastStudiedAt: getLatestDateValue(
      currentWord.lastStudiedAt,
      incomingWord.lastStudiedAt
    ),
    manuallyMastered:
      currentWord.manuallyMastered || incomingWord.manuallyMastered,
    nextReviewAt: getEarliestReviewDate(
      currentWord.nextReviewAt,
      incomingWord.nextReviewAt
    ),
    playCount: Math.max(currentWord.playCount, incomingWord.playCount),
    shadowCount: Math.max(currentWord.shadowCount, incomingWord.shadowCount),
    status: "new",
    streakDays: 0,
    studiedDates,
  };

  return {
    ...mergedWord,
    ...normalizeExpressionStudyProgress(mergedWord),
  };
}

export function mergeVocabularyWords(
  ...wordLists: Array<readonly StoredVocabularyWord[]>
) {
  const mergedWords = new Map<string, VocabularyWord>();

  wordLists.forEach((wordList) => {
    wordList.forEach((word) => {
      const normalizedWord = normalizeStoredVocabularyWord(word);
      if (!normalizedWord) return;

      const existingWord = mergedWords.get(normalizedWord.word);
      mergedWords.set(
        normalizedWord.word,
        existingWord
          ? mergeVocabularyWord(existingWord, normalizedWord)
          : normalizedWord
      );
    });
  });

  return Array.from(mergedWords.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function saveVocabularyWords(
  words: VocabularyWord[],
  options: { sync?: boolean | "immediate" } = {}
) {
  if (!canUseStorage()) return;
  localStorage.setItem(VOCABULARY_WORDS_KEY, JSON.stringify(words));

  if (options.sync === false) return;

  if (options.sync === "immediate") {
    if (vocabularyCloudSyncTimer !== null) {
      window.clearTimeout(vocabularyCloudSyncTimer);
      vocabularyCloudSyncTimer = null;
    }

    void syncVocabularyWordsWithCloud();
    scheduleVocabularyCloudSync();
    return;
  }

  scheduleVocabularyCloudSync();
}

function parseCloudVocabularyResponse(raw: string) {
  const parsed = safeJsonParse<{ words?: StoredVocabularyWord[] }>(raw, {});
  return Array.isArray(parsed.words)
    ? mergeVocabularyWords(parsed.words)
    : ([] as VocabularyWord[]);
}

async function requestCloudVocabulary(
  method: "GET" | "POST",
  words?: VocabularyWord[],
  options: { keepalive?: boolean } = {}
) {
  if (!canUseStorage()) return null;

  const response = await fetch(`/api/vocabulary/sync?t=${Date.now()}`, {
    method,
    cache: "no-store",
    credentials: "same-origin",
    headers:
      method === "POST"
        ? {
            "Content-Type": "application/json",
          }
        : undefined,
    body: method === "POST" ? JSON.stringify({ words: words || [] }) : undefined,
    keepalive: method === "POST" ? options.keepalive : undefined,
  });

  if (response.status === 401) return null;

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || "Vocabulary cloud sync failed");
  }

  return parseCloudVocabularyResponse(text);
}

async function syncVocabularyWordsWithCloudOnce(
  options: { keepalive?: boolean } = {}
) {
  const localWords = loadVocabularyWords();

  try {
    const cloudWords = await requestCloudVocabulary("POST", localWords, options);
    if (!cloudWords) return localWords;

    const mergedWords = mergeVocabularyWords(localWords, cloudWords);
    saveVocabularyWords(mergedWords, { sync: false });
    return mergedWords;
  } catch {
    return localWords;
  }
}

export async function syncVocabularyWordsWithCloud(
  options: { keepalive?: boolean } = {}
) {
  if (vocabularyCloudSyncInFlight) {
    vocabularyCloudSyncRequested = true;
    return vocabularyCloudSyncInFlight;
  }

  vocabularyCloudSyncInFlight = (async () => {
    let syncedWords = await syncVocabularyWordsWithCloudOnce(options);

    while (vocabularyCloudSyncRequested) {
      vocabularyCloudSyncRequested = false;
      syncedWords = await syncVocabularyWordsWithCloudOnce(options);
    }

    return syncedWords;
  })();

  try {
    return await vocabularyCloudSyncInFlight;
  } finally {
    vocabularyCloudSyncInFlight = null;
  }
}

export async function loadVocabularyWordsFromCloud() {
  const localWords = loadVocabularyWords();

  try {
    const cloudWords = await requestCloudVocabulary("GET");
    if (!cloudWords) return localWords;

    const mergedWords = mergeVocabularyWords(localWords, cloudWords);
    saveVocabularyWords(mergedWords, { sync: false });
    return mergedWords;
  } catch {
    return localWords;
  }
}

export async function deleteVocabularyWordFromCloud(word: string) {
  const normalizedWord = normalizeVocabularyWord(word);
  if (!normalizedWord || !canUseStorage()) return;

  try {
    await fetch(
      `/api/vocabulary/sync?word=${encodeURIComponent(normalizedWord)}`,
      {
        cache: "no-store",
        credentials: "same-origin",
        method: "DELETE",
      }
    );
  } catch {
    // Local deletion should still work if cloud sync is temporarily unavailable.
  }
}

export function scheduleVocabularyCloudSync() {
  if (!canUseStorage() || vocabularyCloudSyncTimer !== null) return;

  vocabularyCloudSyncTimer = window.setTimeout(() => {
    vocabularyCloudSyncTimer = null;
    void syncVocabularyWordsWithCloud();
  }, 800);
}

export function flushVocabularyCloudSync() {
  if (!canUseStorage()) return Promise.resolve(loadVocabularyWords());

  if (vocabularyCloudSyncTimer !== null) {
    window.clearTimeout(vocabularyCloudSyncTimer);
    vocabularyCloudSyncTimer = null;
  }

  return syncVocabularyWordsWithCloud({ keepalive: true });
}

export function addVocabularyWord(word: string, sourceSentence?: string) {
  const normalizedWord = normalizeVocabularyWord(word);
  if (!normalizedWord) {
    return {
      ok: false as const,
      reason: "INVALID_WORD" as const,
      message: "请输入单词",
    };
  }

  const currentWords = loadVocabularyWords();
  const exists = currentWords.some((item) => item.word === normalizedWord);

  if (exists) {
    return {
      ok: false as const,
      reason: "DUPLICATE" as const,
      message: "这个单词已经在单词本里了",
    };
  }

  const nextWord: VocabularyWord = {
    id: normalizedWord,
    text: normalizedWord,
    word: normalizedWord,
    meaning: getMeaningForWord(normalizedWord),
    meaningZh: getMeaningForWord(normalizedWord),
    partOfSpeech: "",
    example: "",
    exampleZh: "",
    createdAt: new Date().toISOString(),
    sourceSentence: sourceSentence?.trim() || undefined,
    firstStudiedAt: null,
    lastStudiedAt: null,
    manuallyMastered: false,
    nextReviewAt: null,
    playCount: 0,
    shadowCount: 0,
    status: "new",
    streakDays: 0,
    studiedDates: [],
    masteredCount: 0,
    wrongCount: 0,
    correctCount: 0,
  };

  saveVocabularyWords([...currentWords, nextWord], { sync: "immediate" });

  return {
    ok: true as const,
    word: nextWord,
    message: `已加入单词本：${normalizedWord}`,
  };
}

export function updateVocabularyWord(
  word: string,
  updates: Partial<Omit<VocabularyWord, "word" | "createdAt">>
) {
  const normalizedWord = normalizeVocabularyWord(word);
  const currentWords = loadVocabularyWords();
  let didUpdate = false;

  const nextWords = currentWords.map((item) => {
    if (item.word !== normalizedWord) return item;
    didUpdate = true;
    const mergedItem = {
      ...item,
      ...updates,
      id: updates.id || item.id || item.word,
      text: updates.text || item.text || item.word,
      meaningZh:
        updates.meaningZh ||
        (typeof updates.meaning === "string" ? updates.meaning : item.meaningZh) ||
        item.meaning,
      word: item.word,
      createdAt: item.createdAt,
    };

    return {
      ...mergedItem,
      ...normalizeExpressionStudyProgress(mergedItem),
    };
  });

  if (!didUpdate) return null;

  saveVocabularyWords(nextWords, { sync: "immediate" });
  return nextWords.find((item) => item.word === normalizedWord) || null;
}

export function recordVocabularyAnswer(word: string, isCorrect: boolean) {
  const normalizedWord = normalizeVocabularyWord(word);
  const currentWords = loadVocabularyWords();

  const nextWords = currentWords.map((item) => {
    if (item.word !== normalizedWord) return item;

    if (isCorrect) {
      const nextItem = {
        ...item,
        correctCount: item.correctCount + 1,
      };

      return {
        ...nextItem,
        ...normalizeExpressionStudyProgress(nextItem),
      };
    }

    return {
      ...item,
      wrongCount: item.wrongCount + 1,
    };
  });

  saveVocabularyWords(nextWords);
  return nextWords;
}

export function recordWrongBookReview(word: string, isCorrect: boolean) {
  const normalizedWord = normalizeVocabularyWord(word);
  const currentWords = loadVocabularyWords();

  const nextWords = currentWords.map((item) => {
    if (item.word !== normalizedWord) return item;

    if (isCorrect) {
      const nextItem = {
        ...item,
        correctCount: item.correctCount + 1,
        wrongCount: Math.max(0, item.wrongCount - 1),
      };

      return {
        ...nextItem,
        ...normalizeExpressionStudyProgress(nextItem),
      };
    }

    return {
      ...item,
      wrongCount: item.wrongCount + 1,
    };
  });

  saveVocabularyWords(nextWords);
  return nextWords;
}

export function loadVocabularyGroupMastery() {
  if (!canUseStorage()) return {} as VocabularyGroupMastery;
  return safeJsonParse<VocabularyGroupMastery>(
    localStorage.getItem(VOCABULARY_GROUP_MASTERY_KEY),
    {}
  );
}

export function saveVocabularyGroupMastery(mastery: VocabularyGroupMastery) {
  if (!canUseStorage()) return;
  localStorage.setItem(VOCABULARY_GROUP_MASTERY_KEY, JSON.stringify(mastery));
}

export function incrementVocabularyGroupMastery(groupIndex: number) {
  const current = loadVocabularyGroupMastery();
  const key = `group-${groupIndex}`;
  const next = {
    ...current,
    [key]: (current[key] || 0) + 1,
  };
  saveVocabularyGroupMastery(next);
  return next;
}

export function incrementVocabularyWordsMasteredCount(words: VocabularyWord[]) {
  const currentWords = loadVocabularyWords();
  const targetWords = new Set(words.map((item) => item.word));

  const nextWords = currentWords.map((item) =>
    targetWords.has(item.word)
      ? applyExpressionStudyAction(
          {
            ...item,
            masteredCount: item.masteredCount + 1,
          },
          "mastered"
        )
      : item
  );

  saveVocabularyWords(nextWords);
  return nextWords;
}

export function groupVocabularyWords(words: VocabularyWord[]) {
  const groups: VocabularyWord[][] = [];

  for (let index = 0; index < words.length; index += VOCABULARY_GROUP_SIZE) {
    groups.push(words.slice(index, index + VOCABULARY_GROUP_SIZE));
  }

  return groups;
}

export async function generateVocabularyDefinition(word: string) {
  const response = await fetch("/api/vocabulary/define", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ word }),
  });

  const text = await response.text();
  const parsed = safeJsonParse<
    Partial<VocabularyDefinition> & { error?: string; message?: string }
  >(text, {});

  if (!response.ok) {
    throw new Error(parsed.error || parsed.message || text || "释义生成失败");
  }

  return normalizeVocabularyDefinition(parsed);
}
