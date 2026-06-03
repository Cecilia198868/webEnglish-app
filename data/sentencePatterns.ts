export type SentencePatternLevelId = "basic" | "intermediate" | "advanced";

export type SentencePatternTone = "green" | "purple" | "orange";

export type SentencePattern = {
  id: number;
  practices?: SentencePatternPractice[];
  text: string;
};

export type SentencePatternPractice = {
  chinese: string;
  id: number;
  idiomatic: string;
  natural: string;
  recommended: string;
  simple: string;
  targetEnglish: string;
};

export type SentencePatternSection = {
  englishTitle: string;
  id: string;
  range: string;
  title: string;
  patterns: SentencePattern[];
};

export type SentencePatternLevel = {
  id: SentencePatternLevelId;
  badge: string;
  benefit: string;
  cardTitle: string;
  exampleCount: number;
  heroTitle: string;
  icon: "sprout" | "rocket" | "trophy";
  menuTitle: string;
  sectionSubtitle: string;
  stats: [string, string, string];
  subtitle: string;
  suggestion: string;
  tone: SentencePatternTone;
  totalPatterns: number;
  sections: SentencePatternSection[];
};

const basicPatternOnePractices: SentencePatternPractice[] = [
  {
    chinese: "我想要的是和家人一起在家度过一个安静的周末。",
    id: 1,
    idiomatic: "What I’d really like is a quiet weekend at home with my family.",
    natural: "What I want is a peaceful weekend at home with my family.",
    recommended: "What I want is a quiet weekend at home with my family.",
    simple: "I want a quiet weekend at home with my family.",
    targetEnglish: "What I want is a quiet weekend at home with my family.",
  },
  {
    chinese: "我需要的是更多时间在截止日期前完成这个项目。",
    id: 2,
    idiomatic: "What I really need is extra time to wrap up this project before the deadline.",
    natural: "What I need is more time to get this project done before the deadline.",
    recommended: "What I need is more time to finish this project before the deadline.",
    simple: "I need more time to finish this project before the deadline.",
    targetEnglish: "What I need is more time to finish this project before the deadline.",
  },
  {
    chinese: "我想要的是一个真正理解我感受的人。",
    id: 3,
    idiomatic: "What I’m looking for is someone who truly gets how I feel.",
    natural: "What I want is someone who really understands my feelings.",
    recommended: "What I want is someone who truly understands my feelings.",
    simple: "I want someone who understands my feelings.",
    targetEnglish: "What I want is someone who truly understands my feelings.",
  },
  {
    chinese: "我需要的是一辆可靠的车，不会经常出故障。",
    id: 4,
    idiomatic: "What I need is a dependable car that won’t keep breaking down.",
    natural: "What I need is a reliable car that doesn’t break down all the time.",
    recommended: "What I need is a reliable car that doesn’t break down often.",
    simple: "I need a reliable car.",
    targetEnglish: "What I need is a reliable car that doesn’t break down often.",
  },
  {
    chinese: "我想要的是明年夏天去欧洲旅行。",
    id: 5,
    idiomatic: "What I’d love is to travel around Europe next summer.",
    natural: "What I want is to take a trip to Europe next summer.",
    recommended: "What I want is to travel to Europe next summer.",
    simple: "I want to travel to Europe next summer.",
    targetEnglish: "What I want is to travel to Europe next summer.",
  },
  {
    chinese: "我需要的是日常生活中更好的工作与生活平衡。",
    id: 6,
    idiomatic: "What I really need is a healthier work-life balance in my everyday routine.",
    natural: "What I need is better balance between work and life every day.",
    recommended: "What I need is better work-life balance in my daily routine.",
    simple: "I need better work-life balance.",
    targetEnglish: "What I need is better work-life balance in my daily routine.",
  },
  {
    chinese: "我想要的是一套离办公室更近的新公寓。",
    id: 7,
    idiomatic: "What I’d like is a new apartment that’s closer to my office.",
    natural: "What I want is a new place closer to work.",
    recommended: "What I want is a new apartment closer to my office.",
    simple: "I want a new apartment near my office.",
    targetEnglish: "What I want is a new apartment closer to my office.",
  },
  {
    chinese: "我需要的是对我的演讲给出诚实的反馈。",
    id: 8,
    idiomatic: "What I need is honest, useful feedback on my presentation.",
    natural: "What I need is some honest feedback about my presentation.",
    recommended: "What I need is honest feedback on my presentation.",
    simple: "I need honest feedback on my presentation.",
    targetEnglish: "What I need is honest feedback on my presentation.",
  },
  {
    chinese: "我想要的是学习如何做健康餐。",
    id: 9,
    idiomatic: "What I’d like is to learn how to make healthy meals.",
    natural: "What I want is to learn how to cook healthier food.",
    recommended: "What I want is to learn how to cook healthy meals.",
    simple: "I want to learn to cook healthy meals.",
    targetEnglish: "What I want is to learn how to cook healthy meals.",
  },
  {
    chinese: "我需要的是在这忙碌的一周后好好睡一觉。",
    id: 10,
    idiomatic: "What I really need is a solid night’s sleep after such a busy week.",
    natural: "What I need is a good night’s rest after this busy week.",
    recommended: "What I need is a good night’s sleep after this busy week.",
    simple: "I need a good night’s sleep.",
    targetEnglish: "What I need is a good night’s sleep after this busy week.",
  },
  {
    chinese: "我想要的是我的孩子们快乐又健康。",
    id: 11,
    idiomatic: "What I want most is for my children to be happy and healthy.",
    natural: "What I want is for my kids to stay happy and healthy.",
    recommended: "What I want is for my children to be happy and healthy.",
    simple: "I want my children to be happy and healthy.",
    targetEnglish: "What I want is for my children to be happy and healthy.",
  },
  {
    chinese: "我需要的是一个清晰的未来职业规划。",
    id: 12,
    idiomatic: "What I need is a clear roadmap for my future career.",
    natural: "What I need is a clear plan for where my career is going.",
    recommended: "What I need is a clear plan for my future career.",
    simple: "I need a clear career plan.",
    targetEnglish: "What I need is a clear plan for my future career.",
  },
  {
    chinese: "我想要的是和父母多一些高质量相处时间。",
    id: 13,
    idiomatic: "What I’d really like is to spend more meaningful time with my parents.",
    natural: "What I want is to have more quality time with my parents.",
    recommended: "What I want is to spend more quality time with my parents.",
    simple: "I want more time with my parents.",
    targetEnglish: "What I want is to spend more quality time with my parents.",
  },
  {
    chinese: "我需要的是在感到压力时得到一些鼓励。",
    id: 14,
    idiomatic: "What I need is a bit of encouragement when stress gets to me.",
    natural: "What I need is some support when I’m feeling stressed.",
    recommended: "What I need is some encouragement when I feel stressed.",
    simple: "I need encouragement when I feel stressed.",
    targetEnglish: "What I need is some encouragement when I feel stressed.",
  },
  {
    chinese: "我想要的是一个不用匆忙的平静早晨。",
    id: 15,
    idiomatic: "What I’d love is a calm morning without having to rush.",
    natural: "What I want is a peaceful morning where I don’t have to rush.",
    recommended: "What I want is a peaceful morning without rushing.",
    simple: "I want a peaceful morning.",
    targetEnglish: "What I want is a peaceful morning without rushing.",
  },
  {
    chinese: "我需要的是理财建议，帮助我更好地管理储蓄。",
    id: 16,
    idiomatic: "What I need is financial advice to help me manage my savings better.",
    natural: "What I need is some advice on managing my savings better.",
    recommended: "What I need is financial advice to manage my savings better.",
    simple: "I need financial advice.",
    targetEnglish: "What I need is financial advice to manage my savings better.",
  },
  {
    chinese: "我想要的是快速提升我的英语口语能力。",
    id: 17,
    idiomatic: "What I really want is to improve my spoken English as quickly as possible.",
    natural: "What I want is to get better at speaking English quickly.",
    recommended: "What I want is to improve my English speaking skills quickly.",
    simple: "I want to improve my English speaking quickly.",
    targetEnglish: "What I want is to improve my English speaking skills quickly.",
  },
  {
    chinese: "我需要的是远离社交媒体几天，休息一下。",
    id: 18,
    idiomatic: "What I need is a few days away from social media.",
    natural: "What I need is to take a short break from social media.",
    recommended: "What I need is a break from social media for a few days.",
    simple: "I need a break from social media.",
    targetEnglish: "What I need is a break from social media for a few days.",
  },
  {
    chinese: "我想要的是一个支持我梦想的伴侣。",
    id: 19,
    idiomatic: "What I want is a partner who truly supports my dreams.",
    natural: "What I want is someone who supports what I dream of doing.",
    recommended: "What I want is a partner who supports my dreams.",
    simple: "I want a supportive partner.",
    targetEnglish: "What I want is a partner who supports my dreams.",
  },
  {
    chinese: "我需要的是在日常对话中感觉更自信。",
    id: 20,
    idiomatic: "What I need is to feel more at ease in everyday conversations.",
    natural: "What I need is more confidence when I talk to people every day.",
    recommended: "What I need is to feel more confident in everyday conversations.",
    simple: "I need more confidence in everyday conversations.",
    targetEnglish: "What I need is to feel more confident in everyday conversations.",
  },
];

const basicSections: SentencePatternSection[] = [
  {
    englishTitle: "Needs & Wants",
    id: "needs-wants",
    range: "1-15",
    title: "表达需求与愿望",
    patterns: [
      {
        id: 1,
        practices: basicPatternOnePractices,
        text: "What I want/need is + 名词/从句.",
      },
      { id: 2, text: "I’d like to + 动词 + 细节." },
      { id: 3, text: "I have to + 动词 + because..." },
      { id: 4, text: "Can you help me + 动词?" },
      { id: 5, text: "I’m looking for + 名词/从句." },
      { id: 6, text: "It would be great if + 从句." },
      { id: 7, text: "All I need is + 名词/从句." },
      { id: 8, text: "I really want + 名词/动名词." },
      { id: 9, text: "Could you + 动词 for me?" },
      { id: 10, text: "I expect + 从句." },
      { id: 11, text: "What I’m trying to say is + 从句." },
      { id: 12, text: "I hope + 从句." },
      { id: 13, text: "I wish + 从句（虚拟）." },
      { id: 14, text: "I’m dying for + 名词." },
      { id: 15, text: "The most important thing for me is + 从句." },
    ],
  },
  {
    englishTitle: "Opinions & Thoughts",
    id: "opinions-thoughts",
    range: "16-30",
    title: "表达观点与想法",
    patterns: [
      { id: 16, text: "In my opinion, + 从句." },
      { id: 17, text: "I think / believe + 从句." },
      { id: 18, text: "From my point of view, + 从句." },
      { id: 19, text: "It seems to me that + 从句." },
      { id: 20, text: "I feel like + 从句/动名词." },
      { id: 21, text: "As far as I know, + 从句." },
      { id: 22, text: "The reason why + 从句 is that..." },
      { id: 23, text: "What I mean is + 从句." },
      { id: 24, text: "I’m not sure if + 从句." },
      { id: 25, text: "To be honest, + 从句." },
      { id: 26, text: "Personally, I prefer + A to B." },
      { id: 27, text: "It depends on + 名词/从句." },
      { id: 28, text: "I doubt whether + 从句." },
      { id: 29, text: "In fact, + 从句." },
      { id: 30, text: "My idea is that + 从句." },
    ],
  },
  {
    englishTitle: "Emotions & Feelings",
    id: "emotions-feelings",
    range: "31-45",
    title: "情感与感受",
    patterns: [
      { id: 31, text: "I’m + 情感 + about + 名词/从句." },
      { id: 32, text: "I feel + 情感 + when + 从句." },
      { id: 33, text: "It makes me + 情感 + to + 动词." },
      { id: 34, text: "I’m worried about + 名词/从句." },
      { id: 35, text: "I can’t stand + 名词/动名词." },
      { id: 36, text: "I’m excited / upset that + 从句." },
      { id: 37, text: "This is + 最高级 + I’ve ever + 过去分词." },
      { id: 38, text: "I’m sorry to + 动词." },
      { id: 39, text: "I’m happy for you that + 从句." },
      { id: 40, text: "It’s hard for me to + 动词." },
      { id: 41, text: "I’m tired of + 动名词." },
      { id: 42, text: "I appreciate it when + 从句." },
      { id: 43, text: "That really + 动词 + me." },
      { id: 44, text: "I’m fed up with + 名词." },
      { id: 45, text: "How I feel is + 从句." },
    ],
  },
  {
    englishTitle: "Past Experiences",
    id: "past-experiences",
    range: "46-60",
    title: "过去经历与回忆",
    patterns: [
      { id: 46, text: "I have + 过去分词 + before." },
      { id: 47, text: "Last time I + 过去式, + 从句." },
      { id: 48, text: "When I was + 年龄/时间, + 从句." },
      { id: 49, text: "I remember + 动名词/从句." },
      { id: 50, text: "It was the first time that + 从句." },
      { id: 51, text: "I used to + 动词原形." },
      { id: 52, text: "I’ve just + 过去分词." },
      { id: 53, text: "What happened was + 从句." },
      { id: 54, text: "I went through + 名词." },
      { id: 55, text: "Back then, + 从句." },
      { id: 56, text: "I’ve never + 过去分词 + before." },
      { id: 57, text: "After + 动名词, I + 过去式." },
      { id: 58, text: "That reminds me of + 名词/从句." },
      { id: 59, text: "I had a hard time + 动名词." },
      { id: 60, text: "One of the best things I’ve done is + 从句." },
    ],
  },
  {
    englishTitle: "Plans & Future",
    id: "plans-future",
    range: "61-75",
    title: "计划与未来",
    patterns: [
      { id: 61, text: "I’m going to + 动词." },
      { id: 62, text: "I plan to + 动词 + 细节." },
      { id: 63, text: "Next time, I will + 动词." },
      { id: 64, text: "I’m thinking of + 动名词." },
      { id: 65, text: "We should + 动词 + because..." },
      { id: 66, text: "If I have time, I will + 动词." },
      { id: 67, text: "I’m about to + 动词." },
      { id: 68, text: "Let’s + 动词原形 + together." },
      { id: 69, text: "I hope to + 动词 + soon." },
      { id: 70, text: "In the future, I want + 从句." },
      { id: 71, text: "I’m looking forward to + 动名词." },
      { id: 72, text: "How about we + 动词?" },
      { id: 73, text: "I’ll try my best to + 动词." },
      { id: 74, text: "As soon as + 从句, I will + 动词." },
      { id: 75, text: "My goal is to + 动词." },
    ],
  },
  {
    englishTitle: "Problems, Reasons & Advice",
    id: "problems-reasons-advice",
    range: "76-90",
    title: "问题、原因与建议",
    patterns: [
      { id: 76, text: "The problem is that + 从句." },
      { id: 77, text: "Why don’t you + 动词?" },
      { id: 78, text: "You should + 动词." },
      { id: 79, text: "Because + 从句, + 结果." },
      { id: 80, text: "How can I + 动词?" },
      { id: 81, text: "What if + 从句?" },
      { id: 82, text: "I suggest that + 从句." },
      { id: 83, text: "There is something wrong with + 名词." },
      { id: 84, text: "The main reason is + 从句." },
      { id: 85, text: "You’d better + 动词." },
      { id: 86, text: "Is there any way to + 动词?" },
      { id: 87, text: "I have no idea how + 从句." },
      { id: 88, text: "Let me explain why + 从句." },
      { id: 89, text: "It’s important to + 动词." },
      { id: 90, text: "How do you deal with + 名词?" },
    ],
  },
  {
    englishTitle: "Comparison, Agreement & Closing",
    id: "comparison-agreement-closing",
    range: "91-100",
    title: "比较、同意与结束",
    patterns: [
      { id: 91, text: "It’s better / worse than + 名词/从句." },
      { id: 92, text: "I totally agree that + 从句." },
      { id: 93, text: "I don’t think + 从句." },
      { id: 94, text: "Compared to + 名词, + 从句." },
      { id: 95, text: "Neither... nor..." },
      { id: 96, text: "Not only... but also..." },
      { id: 97, text: "The more + 形容词, the more + 形容词." },
      { id: 98, text: "It was nice + 动名词 with you." },
      { id: 99, text: "Let’s keep in touch by + 方式." },
      { id: 100, text: "Thank you for + 动名词, + 从句." },
    ],
  },
];

function createPlaceholderSection(
  range: string,
  title: string,
  englishTitle: string,
  start: number,
  samplePatterns: string[]
): SentencePatternSection {
  const samples = samplePatterns.map((text, index) => ({
    id: start + index,
    text,
  }));
  const rest = Array.from({ length: 15 - samples.length }, (_, index) => ({
    id: start + samples.length + index,
    text: `句型 ${start + samples.length + index} 将在下一步补充学习内容。`,
  })).filter((item) => item.id <= 100);

  return {
    englishTitle,
    id: englishTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    range,
    title,
    patterns: [...samples, ...rest],
  };
}

const intermediateSections: SentencePatternSection[] = [
  createPlaceholderSection("1-15", "高级需求与请求", "Advanced Needs & Requests", 1, [
    "What I’m really looking for is + 名词/从句.",
    "If it’s not too much trouble, could you + 动词?",
    "I would appreciate it if + 从句.",
    "I was wondering if you could + 动词.",
    "All I ask is that + 从句（虚拟）.",
  ]),
  createPlaceholderSection("16-30", "深度观点与说服", "Nuanced Opinions & Persuasion", 16, []),
  createPlaceholderSection("31-45", "复杂情感与反思", "Deep Emotions & Reflections", 31, []),
  createPlaceholderSection("46-60", "详细过去叙述", "Detailed Past Narratives", 46, []),
  createPlaceholderSection("61-75", "未来计划与假设", "Future Plans & Hypotheticals", 61, []),
  createPlaceholderSection("76-90", "问题解决与建议", "Problem-Solving & Advice", 76, []),
  createPlaceholderSection("91-100", "比较、社交与总结", "Comparison, Social & Closing", 91, []),
];

const advancedSections: SentencePatternSection[] = [
  createPlaceholderSection("1-15", "极致需求与委婉请求", "Sophisticated Needs & Polite Requests", 1, [
    "Were it not for the fact that + 从句, I would + 虚拟.",
    "I would be most grateful if you could possibly + 动词.",
    "Should the need arise for + 名词, I would + 虚拟.",
    "Little did I expect that + 从句 would + 虚拟.",
    "It is imperative that + 从句（虚拟语气）.",
  ]),
  createPlaceholderSection("16-30", "精妙观点与深度说服", "Nuanced Opinions & Persuasion", 16, []),
  createPlaceholderSection("31-45", "深刻情感与内心独白", "Profound Emotions & Introspection", 31, []),
  createPlaceholderSection("46-60", "复杂过去叙述与反思", "Complex Past Narratives & Reflections", 46, []),
  createPlaceholderSection("61-75", "高级未来计划与假设", "Advanced Future Plans & Hypotheticals", 61, []),
  createPlaceholderSection("76-90", "棘手问题解决与高阶建议", "Intricate Problem-Solving & Advice", 76, []),
  createPlaceholderSection("91-100", "顶级比较、社交与哲理总结", "Elite Comparison, Social & Closing", 91, []),
];

export const sentencePatternLevels: SentencePatternLevel[] = [
  {
    id: "basic",
    badge: "初级",
    benefit: "掌握日常开口必备句型",
    cardTitle: "日常开口100句型",
    exampleCount: 2000,
    heroTitle: "100 个口语常用句型",
    icon: "sprout",
    menuTitle: "日常开口100句型",
    sectionSubtitle: "表达需求与愿望",
    stats: ["100 个句型", "2000 个例句", "掌握日常开口必备句型"],
    subtitle: "最常用的英语开口句型，适合零基础和初学者",
    suggestion:
      "每天练习 5-10 个句型，大声替换真实内容，反复练习，让英语开口更自然！",
    tone: "green",
    totalPatterns: 100,
    sections: basicSections,
  },
  {
    id: "intermediate",
    badge: "中级",
    benefit: "提升表达深度",
    cardTitle: "自信表达100句型",
    exampleCount: 2000,
    heroTitle: "自信表达100句型",
    icon: "rocket",
    menuTitle: "自信表达100句型",
    sectionSubtitle: "高级需求与请求",
    stats: ["100 个句型", "2000 个例句", "提升表达深度"],
    subtitle: "表达观点和需求更自然，适合有基础的学习者",
    suggestion:
      "每天选 10 个模板，替换成更复杂的真实生活内容，大声练习并尝试连成段落。",
    tone: "purple",
    totalPatterns: 100,
    sections: intermediateSections,
  },
  {
    id: "advanced",
    badge: "高级",
    benefit: "接近母语表达",
    cardTitle: "地道高级100句型",
    exampleCount: 2000,
    heroTitle: "地道高级100句型",
    icon: "trophy",
    menuTitle: "地道高级100句型",
    sectionSubtitle: "极致需求与委婉请求",
    stats: ["100 个句型", "2000 个例句", "接近母语表达"],
    subtitle: "让英语更自然、更像母语者，适合中高级学习者",
    suggestion:
      "每天精选 5-10 个模板，用生活中最复杂的情境进行替换练习，大声朗读并扩展成完整段落。",
    tone: "orange",
    totalPatterns: 100,
    sections: advancedSections,
  },
];

export const sentencePatternLevelIds = sentencePatternLevels.map(
  (level) => level.id
);

export function getSentencePatternLevel(id: string) {
  return sentencePatternLevels.find((level) => level.id === id);
}

export function getSentencePattern(levelId: string, patternId: number) {
  const level = getSentencePatternLevel(levelId);
  if (!level) return null;

  for (const section of level.sections) {
    const pattern = section.patterns.find((item) => item.id === patternId);
    if (pattern) {
      return { level, pattern, section };
    }
  }

  return null;
}
