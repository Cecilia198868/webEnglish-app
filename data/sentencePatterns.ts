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

type BasicPracticeDraft = {
  chinese: string;
  targetEnglish: string;
};

type BasicPracticeTopic = {
  action: string;
  apologyAction: string;
  benefit: string;
  clause: string;
  difficultNoun: string;
  emotion: string;
  gerund: string;
  idiomatic: string;
  method: string;
  moreFirst: string;
  moreSecond: string;
  noun: string;
  optionA: string;
  optionB: string;
  pastParticiple: string;
  pastSimple: string;
  problem: string;
  reason: string;
  result: string;
  simple: string;
  timePoint: string;
  whenClause: string;
  zhAction: string;
  zhApologyAction: string;
  zhBenefit: string;
  zhClause: string;
  zhDifficultNoun: string;
  zhEmotion: string;
  zhGerund: string;
  zhMethod: string;
  zhMoreFirst: string;
  zhMoreSecond: string;
  zhNoun: string;
  zhOptionA: string;
  zhOptionB: string;
  zhPastParticiple: string;
  zhPastSimple: string;
  zhProblem: string;
  zhReason: string;
  zhResult: string;
  zhTimePoint: string;
  zhWhenClause: string;
};

const basicPracticeTopics: BasicPracticeTopic[] = [
  {
    action: "finish this project before Friday",
    apologyAction: "keep you waiting for the update",
    benefit: "gives the whole team peace of mind",
    clause: "we can finish this project before Friday",
    difficultNoun: "a stressful deadline at work",
    emotion: "nervous",
    gerund: "finishing this project before Friday",
    idiomatic: "I need a little more breathing room on this project.",
    method: "sending a short message every Friday",
    moreFirst: "I plan ahead",
    moreSecond: "relaxed I feel",
    noun: "more time for this project",
    optionA: "planning ahead",
    optionB: "rushing at the last minute",
    pastParticiple: "finished a project under pressure",
    pastSimple: "stayed late to finish a report",
    problem: "the deadline is too close",
    reason: "the deadline is getting close",
    result: "we can avoid extra stress",
    simple: "I need more time for this project.",
    timePoint: "a new employee",
    whenClause: "my deadline gets close",
    zhAction: "在周五前完成这个项目",
    zhApologyAction: "让你一直等更新",
    zhBenefit: "让整个团队更安心",
    zhClause: "我们能在周五前完成这个项目",
    zhDifficultNoun: "一个压力很大的工作截止日期",
    zhEmotion: "紧张",
    zhGerund: "在周五前完成这个项目",
    zhMethod: "每周五发一条简短消息",
    zhMoreFirst: "我提前计划",
    zhMoreSecond: "我越放松",
    zhNoun: "这个项目更多的时间",
    zhOptionA: "提前计划",
    zhOptionB: "最后一刻匆忙完成",
    zhPastParticiple: "在压力下完成过一个项目",
    zhPastSimple: "加班完成了一份报告",
    zhProblem: "截止日期太近了",
    zhReason: "截止日期越来越近",
    zhResult: "我们可以避免额外压力",
    zhTimePoint: "刚入职的时候",
    zhWhenClause: "截止日期临近时",
  },
  {
    action: "get honest feedback on my presentation",
    apologyAction: "send the slides so late",
    benefit: "helps me speak more clearly next time",
    clause: "I can improve my presentation before the meeting",
    difficultNoun: "a presentation in front of senior managers",
    emotion: "anxious",
    gerund: "getting honest feedback on my presentation",
    idiomatic: "I could really use some honest feedback on my presentation.",
    method: "sharing comments in the document",
    moreFirst: "I practice my presentation",
    moreSecond: "confident I become",
    noun: "honest feedback on my presentation",
    optionA: "clear feedback",
    optionB: "polite silence",
    pastParticiple: "given a presentation in English",
    pastSimple: "presented my idea to the team",
    problem: "my presentation is not clear enough",
    reason: "I want to make my message easier to understand",
    result: "I can make the slides stronger",
    simple: "I need feedback on my presentation.",
    timePoint: "in my first month at work",
    whenClause: "people ask questions after my presentation",
    zhAction: "得到关于我演讲的诚实反馈",
    zhApologyAction: "这么晚才发幻灯片",
    zhBenefit: "帮助我下次说得更清楚",
    zhClause: "我可以在会议前改进我的演讲",
    zhDifficultNoun: "在高层经理面前做演讲",
    zhEmotion: "焦虑",
    zhGerund: "得到关于我演讲的诚实反馈",
    zhMethod: "在文档里分享评论",
    zhMoreFirst: "我越练习演讲",
    zhMoreSecond: "我越自信",
    zhNoun: "关于我演讲的诚实反馈",
    zhOptionA: "清楚的反馈",
    zhOptionB: "礼貌地沉默",
    zhPastParticiple: "用英语做过演讲",
    zhPastSimple: "向团队展示了我的想法",
    zhProblem: "我的演讲还不够清楚",
    zhReason: "我想让信息更容易理解",
    zhResult: "我可以把幻灯片做得更好",
    zhTimePoint: "入职第一个月的时候",
    zhWhenClause: "演讲后有人提问时",
  },
  {
    action: "find a new apartment closer to my office",
    apologyAction: "cancel the apartment visit",
    benefit: "saves me a lot of commuting time",
    clause: "I can move closer to my office this summer",
    difficultNoun: "a long commute every morning",
    emotion: "frustrated",
    gerund: "finding a new apartment closer to my office",
    idiomatic: "I am trying to find a place closer to work.",
    method: "checking apartment listings online",
    moreFirst: "I compare different apartments",
    moreSecond: "sure I feel about the choice",
    noun: "a new apartment closer to my office",
    optionA: "living near work",
    optionB: "spending hours commuting",
    pastParticiple: "moved to a new apartment before",
    pastSimple: "visited three apartments in one afternoon",
    problem: "my current apartment is too far from work",
    reason: "my commute takes too much time",
    result: "I can have more time after work",
    simple: "I want an apartment near my office.",
    timePoint: "when I lived far from work",
    whenClause: "traffic is heavy in the morning",
    zhAction: "找到一套离办公室更近的新公寓",
    zhApologyAction: "取消看房",
    zhBenefit: "节省我很多通勤时间",
    zhClause: "我今年夏天可以搬到离办公室更近的地方",
    zhDifficultNoun: "每天早上的长时间通勤",
    zhEmotion: "沮丧",
    zhGerund: "找到一套离办公室更近的新公寓",
    zhMethod: "在网上查看公寓信息",
    zhMoreFirst: "我比较的公寓越多",
    zhMoreSecond: "我对选择越确定",
    zhNoun: "一套离办公室更近的新公寓",
    zhOptionA: "住在公司附近",
    zhOptionB: "花几个小时通勤",
    zhPastParticiple: "以前搬过新公寓",
    zhPastSimple: "一个下午看了三套公寓",
    zhProblem: "我现在的公寓离公司太远",
    zhReason: "我的通勤花太多时间",
    zhResult: "我下班后能有更多时间",
    zhTimePoint: "我住得离公司很远的时候",
    zhWhenClause: "早上交通拥堵时",
  },
  {
    action: "learn how to cook healthy meals",
    apologyAction: "make dinner so late",
    benefit: "makes my daily routine healthier",
    clause: "I can cook healthier meals at home",
    difficultNoun: "eating takeout every day",
    emotion: "motivated",
    gerund: "learning how to cook healthy meals",
    idiomatic: "I want to get better at making healthy food at home.",
    method: "sharing simple recipes with each other",
    moreFirst: "I cook at home",
    moreSecond: "healthier I feel",
    noun: "a simple healthy meal plan",
    optionA: "cooking at home",
    optionB: "ordering takeout every night",
    pastParticiple: "cooked a healthy dinner before",
    pastSimple: "made a healthy lunch for myself",
    problem: "I eat too much takeout",
    reason: "I want to take better care of my health",
    result: "I can feel better every day",
    simple: "I want to cook healthy meals.",
    timePoint: "when I first lived alone",
    whenClause: "I have time after work",
    zhAction: "学习如何做健康餐",
    zhApologyAction: "这么晚才做晚饭",
    zhBenefit: "让我的日常生活更健康",
    zhClause: "我可以在家做更健康的饭",
    zhDifficultNoun: "每天吃外卖",
    zhEmotion: "有动力",
    zhGerund: "学习如何做健康餐",
    zhMethod: "互相分享简单食谱",
    zhMoreFirst: "我在家做饭越多",
    zhMoreSecond: "我感觉越健康",
    zhNoun: "一个简单的健康饮食计划",
    zhOptionA: "在家做饭",
    zhOptionB: "每天晚上点外卖",
    zhPastParticiple: "以前做过健康晚餐",
    zhPastSimple: "给自己做了一份健康午餐",
    zhProblem: "我吃太多外卖",
    zhReason: "我想更好地照顾自己的健康",
    zhResult: "我每天都能感觉更好",
    zhTimePoint: "我第一次独居的时候",
    zhWhenClause: "下班后有时间时",
  },
  {
    action: "get a good night’s sleep",
    apologyAction: "miss your call last night",
    benefit: "helps me focus the next day",
    clause: "I can sleep earlier tonight",
    difficultNoun: "a week with very little sleep",
    emotion: "exhausted",
    gerund: "getting a good night’s sleep",
    idiomatic: "I really need a solid night of sleep.",
    method: "turning off my phone before bed",
    moreFirst: "I sleep earlier",
    moreSecond: "focused I am the next day",
    noun: "a good night’s sleep",
    optionA: "sleeping early",
    optionB: "staying up late",
    pastParticiple: "slept well after a busy week",
    pastSimple: "went to bed before ten",
    problem: "I have not been sleeping enough",
    reason: "I have been tired all week",
    result: "I can focus better tomorrow",
    simple: "I need a good night’s sleep.",
    timePoint: "during a busy week",
    whenClause: "I stay up too late",
    zhAction: "好好睡一觉",
    zhApologyAction: "昨晚没接到你的电话",
    zhBenefit: "帮助我第二天集中注意力",
    zhClause: "我今晚可以早点睡",
    zhDifficultNoun: "睡眠很少的一周",
    zhEmotion: "疲惫",
    zhGerund: "好好睡一觉",
    zhMethod: "睡前关掉手机",
    zhMoreFirst: "我睡得越早",
    zhMoreSecond: "第二天越专注",
    zhNoun: "一晚好觉",
    zhOptionA: "早点睡觉",
    zhOptionB: "熬夜",
    zhPastParticiple: "忙碌一周后睡过好觉",
    zhPastSimple: "十点前上床睡觉",
    zhProblem: "我最近睡得不够",
    zhReason: "我这一周都很累",
    zhResult: "我明天能更专注",
    zhTimePoint: "忙碌的一周里",
    zhWhenClause: "我熬夜太晚时",
  },
  {
    action: "improve my English speaking skills",
    apologyAction: "speak too fast in English",
    benefit: "makes daily conversations easier",
    clause: "I can speak English more confidently",
    difficultNoun: "speaking English in a real conversation",
    emotion: "hopeful",
    gerund: "improving my English speaking skills",
    idiomatic: "I want to get more comfortable speaking English.",
    method: "practicing voice messages every day",
    moreFirst: "I practice speaking",
    moreSecond: "natural my English sounds",
    noun: "better English speaking skills",
    optionA: "daily speaking practice",
    optionB: "only memorizing words",
    pastParticiple: "spoken English with a stranger before",
    pastSimple: "joined an English conversation group",
    problem: "I feel shy when I speak English",
    reason: "I want to communicate more naturally",
    result: "I can join more conversations",
    simple: "I want to speak English better.",
    timePoint: "when I started learning English",
    whenClause: "someone asks me a question in English",
    zhAction: "提高我的英语口语能力",
    zhApologyAction: "英语说得太快",
    zhBenefit: "让日常对话更轻松",
    zhClause: "我可以更自信地说英语",
    zhDifficultNoun: "在真实对话中说英语",
    zhEmotion: "有希望",
    zhGerund: "提高我的英语口语能力",
    zhMethod: "每天练习语音消息",
    zhMoreFirst: "我练口语越多",
    zhMoreSecond: "我的英语听起来越自然",
    zhNoun: "更好的英语口语能力",
    zhOptionA: "每天练口语",
    zhOptionB: "只背单词",
    zhPastParticiple: "以前和陌生人说过英语",
    zhPastSimple: "加入了一个英语对话小组",
    zhProblem: "我说英语时会害羞",
    zhReason: "我想更自然地交流",
    zhResult: "我可以参与更多对话",
    zhTimePoint: "刚开始学英语的时候",
    zhWhenClause: "有人用英语问我问题时",
  },
  {
    action: "spend more quality time with my parents",
    apologyAction: "forget our family dinner",
    benefit: "brings my family closer",
    clause: "I can spend more quality time with my parents",
    difficultNoun: "being away from my family for months",
    emotion: "grateful",
    gerund: "spending more quality time with my parents",
    idiomatic: "I want to make more real time for my family.",
    method: "having a video call every Sunday",
    moreFirst: "I talk with my parents",
    moreSecond: "connected I feel",
    noun: "more quality time with my parents",
    optionA: "family time",
    optionB: "being busy all weekend",
    pastParticiple: "visited my parents for a weekend before",
    pastSimple: "called my parents after dinner",
    problem: "I do not see my parents often enough",
    reason: "family time matters to me",
    result: "we can feel closer",
    simple: "I want more time with my parents.",
    timePoint: "when I moved away from home",
    whenClause: "my parents need help",
    zhAction: "和父母多一些高质量相处时间",
    zhApologyAction: "忘了家庭聚餐",
    zhBenefit: "让我的家人更亲近",
    zhClause: "我可以和父母多一些高质量相处时间",
    zhDifficultNoun: "几个月不能陪伴家人",
    zhEmotion: "感激",
    zhGerund: "和父母多一些高质量相处时间",
    zhMethod: "每周日视频通话",
    zhMoreFirst: "我和父母交流越多",
    zhMoreSecond: "我越有连接感",
    zhNoun: "和父母更多的高质量时间",
    zhOptionA: "家庭时间",
    zhOptionB: "整个周末都很忙",
    zhPastParticiple: "以前周末回去看过父母",
    zhPastSimple: "晚饭后给父母打了电话",
    zhProblem: "我见父母不够频繁",
    zhReason: "家庭时间对我很重要",
    zhResult: "我们会感觉更亲近",
    zhTimePoint: "我离家生活的时候",
    zhWhenClause: "父母需要帮助时",
  },
  {
    action: "get financial advice about my savings",
    apologyAction: "forget to bring the bank documents",
    benefit: "helps me manage my money better",
    clause: "I can manage my savings more wisely",
    difficultNoun: "making a big financial decision alone",
    emotion: "careful",
    gerund: "getting financial advice about my savings",
    idiomatic: "I need some guidance on how to handle my savings.",
    method: "checking my budget once a week",
    moreFirst: "I track my spending",
    moreSecond: "control I have over my money",
    noun: "financial advice about my savings",
    optionA: "saving regularly",
    optionB: "spending without a plan",
    pastParticiple: "opened a savings account before",
    pastSimple: "made a monthly budget",
    problem: "I do not have a clear savings plan",
    reason: "I want to manage my money better",
    result: "I can save more each month",
    simple: "I need financial advice.",
    timePoint: "when I got my first salary",
    whenClause: "I have to make a money decision",
    zhAction: "得到关于储蓄的理财建议",
    zhApologyAction: "忘了带银行文件",
    zhBenefit: "帮助我更好地管理钱",
    zhClause: "我可以更明智地管理储蓄",
    zhDifficultNoun: "独自做一个重大的财务决定",
    zhEmotion: "谨慎",
    zhGerund: "得到关于储蓄的理财建议",
    zhMethod: "每周检查一次预算",
    zhMoreFirst: "我记录开支越多",
    zhMoreSecond: "我对钱越有掌控感",
    zhNoun: "关于储蓄的理财建议",
    zhOptionA: "定期储蓄",
    zhOptionB: "没有计划地花钱",
    zhPastParticiple: "以前开过储蓄账户",
    zhPastSimple: "做了一个月度预算",
    zhProblem: "我没有清晰的储蓄计划",
    zhReason: "我想更好地管理钱",
    zhResult: "我每个月能存更多钱",
    zhTimePoint: "我拿到第一份工资的时候",
    zhWhenClause: "我必须做金钱决定时",
  },
  {
    action: "buy a reliable car",
    apologyAction: "arrive late because of my car",
    benefit: "makes my commute safer",
    clause: "I can buy a reliable car this year",
    difficultNoun: "a car that breaks down often",
    emotion: "worried",
    gerund: "buying a reliable car",
    idiomatic: "I need a car I can actually count on.",
    method: "reading real owner reviews",
    moreFirst: "I compare car reviews",
    moreSecond: "confident I feel about buying",
    noun: "a reliable car",
    optionA: "a reliable used car",
    optionB: "a cheap car with problems",
    pastParticiple: "driven an old car before",
    pastSimple: "took my car to the repair shop",
    problem: "my car breaks down too often",
    reason: "I need a safe way to commute",
    result: "I can get to work on time",
    simple: "I need a reliable car.",
    timePoint: "when I first bought a car",
    whenClause: "my car makes a strange noise",
    zhAction: "买一辆可靠的车",
    zhApologyAction: "因为车的问题迟到",
    zhBenefit: "让我的通勤更安全",
    zhClause: "我今年可以买一辆可靠的车",
    zhDifficultNoun: "一辆经常出故障的车",
    zhEmotion: "担心",
    zhGerund: "买一辆可靠的车",
    zhMethod: "阅读真实车主评价",
    zhMoreFirst: "我比较车评越多",
    zhMoreSecond: "我买车时越有信心",
    zhNoun: "一辆可靠的车",
    zhOptionA: "一辆可靠的二手车",
    zhOptionB: "一辆便宜但问题很多的车",
    zhPastParticiple: "以前开过旧车",
    zhPastSimple: "把车送去了修理店",
    zhProblem: "我的车太经常出故障",
    zhReason: "我需要安全的通勤方式",
    zhResult: "我可以准时上班",
    zhTimePoint: "我第一次买车的时候",
    zhWhenClause: "我的车发出奇怪声音时",
  },
  {
    action: "take a short break from social media",
    apologyAction: "reply to your message so late",
    benefit: "helps me clear my mind",
    clause: "I can take a short break from social media",
    difficultNoun: "too much time on social media",
    emotion: "overwhelmed",
    gerund: "taking a short break from social media",
    idiomatic: "I need to step away from social media for a bit.",
    method: "checking messages only twice a day",
    moreFirst: "I spend less time online",
    moreSecond: "peaceful my mind feels",
    noun: "a short break from social media",
    optionA: "offline time",
    optionB: "scrolling all night",
    pastParticiple: "deleted social apps for a week before",
    pastSimple: "turned off my notifications",
    problem: "social media takes too much of my attention",
    reason: "I need to clear my mind",
    result: "I can focus on real life",
    simple: "I need a break from social media.",
    timePoint: "during a stressful month",
    whenClause: "I scroll for too long",
    zhAction: "短暂远离社交媒体",
    zhApologyAction: "这么晚才回复你的消息",
    zhBenefit: "帮助我清理思绪",
    zhClause: "我可以短暂远离社交媒体",
    zhDifficultNoun: "在社交媒体上花太多时间",
    zhEmotion: "不堪重负",
    zhGerund: "短暂远离社交媒体",
    zhMethod: "每天只查看两次消息",
    zhMoreFirst: "我上网时间越少",
    zhMoreSecond: "我的心越平静",
    zhNoun: "短暂远离社交媒体",
    zhOptionA: "离线时间",
    zhOptionB: "整晚刷手机",
    zhPastParticiple: "以前删除过社交软件一周",
    zhPastSimple: "关掉了通知",
    zhProblem: "社交媒体占用了我太多注意力",
    zhReason: "我需要清理思绪",
    zhResult: "我可以专注于真实生活",
    zhTimePoint: "压力很大的一个月里",
    zhWhenClause: "我刷手机太久时",
  },
  {
    action: "find a partner who supports my dreams",
    apologyAction: "hide my feelings from you",
    benefit: "makes me feel understood",
    clause: "I can be with someone who supports my dreams",
    difficultNoun: "a relationship without real support",
    emotion: "hopeful",
    gerund: "finding a partner who supports my dreams",
    idiomatic: "I want someone who is truly on my side.",
    method: "talking honestly about our goals",
    moreFirst: "we talk honestly",
    moreSecond: "secure I feel",
    noun: "a partner who supports my dreams",
    optionA: "honest support",
    optionB: "empty promises",
    pastParticiple: "shared my dream with someone before",
    pastSimple: "talked about my future plans",
    problem: "I do not feel fully supported",
    reason: "support matters in a relationship",
    result: "I can be more confident about my dreams",
    simple: "I want a supportive partner.",
    timePoint: "when I started a serious relationship",
    whenClause: "I talk about my dreams",
    zhAction: "找到一个支持我梦想的伴侣",
    zhApologyAction: "对你隐藏我的感受",
    zhBenefit: "让我感觉被理解",
    zhClause: "我可以和支持我梦想的人在一起",
    zhDifficultNoun: "一段没有真正支持的关系",
    zhEmotion: "有希望",
    zhGerund: "找到一个支持我梦想的伴侣",
    zhMethod: "诚实地谈论我们的目标",
    zhMoreFirst: "我们越诚实交流",
    zhMoreSecond: "我越有安全感",
    zhNoun: "一个支持我梦想的伴侣",
    zhOptionA: "真诚的支持",
    zhOptionB: "空洞的承诺",
    zhPastParticiple: "以前和别人分享过我的梦想",
    zhPastSimple: "谈过我的未来计划",
    zhProblem: "我感觉没有被完全支持",
    zhReason: "支持在关系里很重要",
    zhResult: "我可以对自己的梦想更有信心",
    zhTimePoint: "我开始一段认真关系的时候",
    zhWhenClause: "我谈论梦想时",
  },
  {
    action: "make a clear plan for my future career",
    apologyAction: "change my career plan again",
    benefit: "keeps me moving in the right direction",
    clause: "I can make a clear plan for my future career",
    difficultNoun: "choosing a career path",
    emotion: "uncertain",
    gerund: "making a clear plan for my future career",
    idiomatic: "I need a clearer roadmap for my career.",
    method: "reviewing my goals every month",
    moreFirst: "I understand my goals",
    moreSecond: "clear my next step becomes",
    noun: "a clear plan for my future career",
    optionA: "a clear career plan",
    optionB: "waiting without direction",
    pastParticiple: "changed my career direction before",
    pastSimple: "asked a mentor for career advice",
    problem: "my career direction is not clear",
    reason: "I want to grow with purpose",
    result: "I can choose my next step more wisely",
    simple: "I need a clear career plan.",
    timePoint: "after graduation",
    whenClause: "I think about my future",
    zhAction: "为未来职业做一个清晰计划",
    zhApologyAction: "又改变职业计划",
    zhBenefit: "让我朝正确方向前进",
    zhClause: "我可以为未来职业做一个清晰计划",
    zhDifficultNoun: "选择职业道路",
    zhEmotion: "不确定",
    zhGerund: "为未来职业做一个清晰计划",
    zhMethod: "每个月回顾我的目标",
    zhMoreFirst: "我越了解自己的目标",
    zhMoreSecond: "下一步越清楚",
    zhNoun: "未来职业的清晰计划",
    zhOptionA: "清晰的职业计划",
    zhOptionB: "没有方向地等待",
    zhPastParticiple: "以前改变过职业方向",
    zhPastSimple: "向导师请教了职业建议",
    zhProblem: "我的职业方向不清楚",
    zhReason: "我想有目标地成长",
    zhResult: "我可以更明智地选择下一步",
    zhTimePoint: "毕业之后",
    zhWhenClause: "我思考未来时",
  },
  {
    action: "solve this customer issue quickly",
    apologyAction: "make the customer wait",
    benefit: "protects the customer’s trust",
    clause: "we can solve this customer issue quickly",
    difficultNoun: "an unhappy customer on the phone",
    emotion: "responsible",
    gerund: "solving this customer issue quickly",
    idiomatic: "We need to get this customer issue sorted out quickly.",
    method: "following up by email after the call",
    moreFirst: "we listen carefully",
    moreSecond: "trust the customer feels",
    noun: "a quick solution for this customer issue",
    optionA: "a quick follow-up",
    optionB: "ignoring the complaint",
    pastParticiple: "handled a customer complaint before",
    pastSimple: "called the customer back right away",
    problem: "the customer has not received an answer",
    reason: "the customer needs help now",
    result: "we can keep the customer’s trust",
    simple: "We need to help the customer quickly.",
    timePoint: "during my first customer service shift",
    whenClause: "a customer sounds upset",
    zhAction: "快速解决这个客户问题",
    zhApologyAction: "让客户等待",
    zhBenefit: "保护客户的信任",
    zhClause: "我们可以快速解决这个客户问题",
    zhDifficultNoun: "电话里一位不满意的客户",
    zhEmotion: "有责任感",
    zhGerund: "快速解决这个客户问题",
    zhMethod: "通话后用邮件跟进",
    zhMoreFirst: "我们听得越认真",
    zhMoreSecond: "客户越信任我们",
    zhNoun: "这个客户问题的快速解决方案",
    zhOptionA: "快速跟进",
    zhOptionB: "忽视投诉",
    zhPastParticiple: "以前处理过客户投诉",
    zhPastSimple: "马上给客户回了电话",
    zhProblem: "客户还没有得到答复",
    zhReason: "客户现在需要帮助",
    zhResult: "我们可以保持客户的信任",
    zhTimePoint: "我第一次做客服班的时候",
    zhWhenClause: "客户听起来很不满时",
  },
  {
    action: "make a doctor’s appointment this week",
    apologyAction: "miss my appointment",
    benefit: "helps me take care of my health early",
    clause: "I can make a doctor’s appointment this week",
    difficultNoun: "waiting too long to see a doctor",
    emotion: "concerned",
    gerund: "making a doctor’s appointment this week",
    idiomatic: "I should get this checked by a doctor this week.",
    method: "booking the appointment online",
    moreFirst: "I take care of small symptoms early",
    moreSecond: "safe I feel",
    noun: "a doctor’s appointment this week",
    optionA: "seeing a doctor early",
    optionB: "ignoring the symptoms",
    pastParticiple: "visited a clinic before",
    pastSimple: "booked a doctor’s appointment online",
    problem: "my cough has not gone away",
    reason: "I do not want the symptom to get worse",
    result: "I can get proper advice early",
    simple: "I need a doctor’s appointment.",
    timePoint: "when I felt sick last winter",
    whenClause: "my symptoms last for several days",
    zhAction: "这周预约医生",
    zhApologyAction: "错过我的预约",
    zhBenefit: "帮助我及早照顾健康",
    zhClause: "我这周可以预约医生",
    zhDifficultNoun: "拖太久才去看医生",
    zhEmotion: "担忧",
    zhGerund: "这周预约医生",
    zhMethod: "在线预约",
    zhMoreFirst: "我越早处理小症状",
    zhMoreSecond: "我越安心",
    zhNoun: "这周的医生预约",
    zhOptionA: "早点看医生",
    zhOptionB: "忽视症状",
    zhPastParticiple: "以前去过诊所",
    zhPastSimple: "在线预约了医生",
    zhProblem: "我的咳嗽还没有好",
    zhReason: "我不想让症状变严重",
    zhResult: "我可以早点得到合适的建议",
    zhTimePoint: "去年冬天我生病的时候",
    zhWhenClause: "症状持续好几天时",
  },
  {
    action: "plan a trip to Europe next summer",
    apologyAction: "change our travel plan",
    benefit: "makes the trip less stressful",
    clause: "we can plan a trip to Europe next summer",
    difficultNoun: "planning a long trip on a tight budget",
    emotion: "excited",
    gerund: "planning a trip to Europe next summer",
    idiomatic: "I’d love to plan a Europe trip for next summer.",
    method: "creating a shared travel document",
    moreFirst: "we plan the trip early",
    moreSecond: "fun the trip becomes",
    noun: "a trip to Europe next summer",
    optionA: "planning early",
    optionB: "booking everything at the last minute",
    pastParticiple: "traveled abroad before",
    pastSimple: "planned a weekend trip with friends",
    problem: "we have not booked anything yet",
    reason: "good tickets sell out quickly",
    result: "we can save money on the trip",
    simple: "I want to travel to Europe next summer.",
    timePoint: "when I first traveled alone",
    whenClause: "I think about next summer",
    zhAction: "计划明年夏天去欧洲旅行",
    zhApologyAction: "改变我们的旅行计划",
    zhBenefit: "让旅行压力更小",
    zhClause: "我们可以计划明年夏天去欧洲旅行",
    zhDifficultNoun: "预算紧张时计划长途旅行",
    zhEmotion: "兴奋",
    zhGerund: "计划明年夏天去欧洲旅行",
    zhMethod: "创建共享旅行文档",
    zhMoreFirst: "我们越早计划旅行",
    zhMoreSecond: "旅行越有趣",
    zhNoun: "明年夏天去欧洲的旅行",
    zhOptionA: "提前计划",
    zhOptionB: "最后一刻预订所有东西",
    zhPastParticiple: "以前出国旅行过",
    zhPastSimple: "和朋友计划了一次周末旅行",
    zhProblem: "我们还没有预订任何东西",
    zhReason: "好票很快会卖完",
    zhResult: "我们可以节省旅行费用",
    zhTimePoint: "我第一次独自旅行的时候",
    zhWhenClause: "我想到明年夏天时",
  },
  {
    action: "talk to my neighbor about the noise",
    apologyAction: "raise my voice about the noise",
    benefit: "keeps the conversation respectful",
    clause: "I can talk to my neighbor about the noise calmly",
    difficultNoun: "a noisy neighbor upstairs",
    emotion: "annoyed",
    gerund: "talking to my neighbor about the noise",
    idiomatic: "I need to have a calm word with my neighbor about the noise.",
    method: "leaving a polite note first",
    moreFirst: "I stay calm",
    moreSecond: "easier the conversation becomes",
    noun: "a calm conversation with my neighbor",
    optionA: "a polite conversation",
    optionB: "an angry argument",
    pastParticiple: "talked to a neighbor about noise before",
    pastSimple: "left a polite note on the door",
    problem: "the noise upstairs is too loud at night",
    reason: "I cannot sleep well with the noise",
    result: "we can solve the problem peacefully",
    simple: "I need to talk to my neighbor.",
    timePoint: "when I lived in an apartment",
    whenClause: "the noise continues after midnight",
    zhAction: "和邻居谈谈噪音问题",
    zhApologyAction: "因为噪音问题提高了声音",
    zhBenefit: "让对话保持尊重",
    zhClause: "我可以冷静地和邻居谈噪音问题",
    zhDifficultNoun: "楼上很吵的邻居",
    zhEmotion: "恼火",
    zhGerund: "和邻居谈谈噪音问题",
    zhMethod: "先留一张礼貌的便条",
    zhMoreFirst: "我越保持冷静",
    zhMoreSecond: "对话越容易",
    zhNoun: "和邻居的一次冷静对话",
    zhOptionA: "礼貌的对话",
    zhOptionB: "生气的争论",
    zhPastParticiple: "以前和邻居谈过噪音",
    zhPastSimple: "在门上留了一张礼貌便条",
    zhProblem: "楼上的噪音晚上太大",
    zhReason: "有噪音时我睡不好",
    zhResult: "我们可以和平解决问题",
    zhTimePoint: "我住公寓的时候",
    zhWhenClause: "噪音持续到午夜以后时",
  },
  {
    action: "resolve the conflict with my teammate",
    apologyAction: "ignore your side of the story",
    benefit: "helps the team work together again",
    clause: "we can resolve the conflict with my teammate",
    difficultNoun: "a conflict with a teammate",
    emotion: "uncomfortable",
    gerund: "resolving the conflict with my teammate",
    idiomatic: "We need to clear the air with my teammate.",
    method: "having a short honest meeting",
    moreFirst: "we listen to each other",
    moreSecond: "respectful the discussion becomes",
    noun: "a fair conversation with my teammate",
    optionA: "talking directly",
    optionB: "avoiding the problem",
    pastParticiple: "resolved a team conflict before",
    pastSimple: "apologized to a teammate",
    problem: "my teammate and I are not communicating well",
    reason: "we misunderstood each other",
    result: "we can work together again",
    simple: "We need to solve the team conflict.",
    timePoint: "during a difficult team project",
    whenClause: "my teammate disagrees with me",
    zhAction: "解决我和队友之间的冲突",
    zhApologyAction: "忽视了你的说法",
    zhBenefit: "帮助团队重新合作",
    zhClause: "我们可以解决我和队友之间的冲突",
    zhDifficultNoun: "和队友之间的冲突",
    zhEmotion: "不舒服",
    zhGerund: "解决我和队友之间的冲突",
    zhMethod: "开一次简短而诚实的会",
    zhMoreFirst: "我们越互相倾听",
    zhMoreSecond: "讨论越尊重彼此",
    zhNoun: "和队友的一次公平对话",
    zhOptionA: "直接沟通",
    zhOptionB: "回避问题",
    zhPastParticiple: "以前解决过团队冲突",
    zhPastSimple: "向队友道歉了",
    zhProblem: "我和队友沟通得不好",
    zhReason: "我们误解了彼此",
    zhResult: "我们可以再次合作",
    zhTimePoint: "一个困难的团队项目中",
    zhWhenClause: "队友不同意我时",
  },
  {
    action: "build a calmer morning routine",
    apologyAction: "rush out without saying goodbye",
    benefit: "starts my day with less stress",
    clause: "I can build a calmer morning routine",
    difficultNoun: "a rushed morning before work",
    emotion: "peaceful",
    gerund: "building a calmer morning routine",
    idiomatic: "I want my mornings to feel less rushed.",
    method: "preparing my bag the night before",
    moreFirst: "I prepare the night before",
    moreSecond: "calmer my morning feels",
    noun: "a calmer morning routine",
    optionA: "preparing the night before",
    optionB: "rushing every morning",
    pastParticiple: "started my day calmly before",
    pastSimple: "woke up thirty minutes earlier",
    problem: "my mornings always feel rushed",
    reason: "I start the day too late",
    result: "I can leave home calmly",
    simple: "I want a calmer morning.",
    timePoint: "when my schedule was very busy",
    whenClause: "I wake up late",
    zhAction: "建立更从容的早晨习惯",
    zhApologyAction: "匆忙出门没有道别",
    zhBenefit: "让我以更少压力开始一天",
    zhClause: "我可以建立更从容的早晨习惯",
    zhDifficultNoun: "上班前匆忙的早晨",
    zhEmotion: "平静",
    zhGerund: "建立更从容的早晨习惯",
    zhMethod: "前一天晚上准备好包",
    zhMoreFirst: "我前一晚准备得越好",
    zhMoreSecond: "早晨越从容",
    zhNoun: "更从容的早晨习惯",
    zhOptionA: "前一晚准备",
    zhOptionB: "每天早上匆忙",
    zhPastParticiple: "以前从容地开始过一天",
    zhPastSimple: "早起了三十分钟",
    zhProblem: "我的早晨总是很匆忙",
    zhReason: "我开始一天太晚",
    zhResult: "我可以从容出门",
    zhTimePoint: "我的日程很忙的时候",
    zhWhenClause: "我起晚时",
  },
  {
    action: "save money for an emergency fund",
    apologyAction: "spend more than I planned",
    benefit: "makes unexpected costs easier to handle",
    clause: "I can save money for an emergency fund",
    difficultNoun: "an unexpected expense",
    emotion: "secure",
    gerund: "saving money for an emergency fund",
    idiomatic: "I want to build up a safety cushion.",
    method: "moving money to savings every payday",
    moreFirst: "I save a little each month",
    moreSecond: "secure I feel",
    noun: "an emergency fund",
    optionA: "saving a little every month",
    optionB: "spending everything right away",
    pastParticiple: "saved money for an emergency before",
    pastSimple: "put part of my salary into savings",
    problem: "I do not have enough emergency savings",
    reason: "unexpected costs can happen anytime",
    result: "I can handle emergencies better",
    simple: "I need an emergency fund.",
    timePoint: "when I had my first full-time job",
    whenClause: "an unexpected bill arrives",
    zhAction: "为应急基金存钱",
    zhApologyAction: "花得比计划多",
    zhBenefit: "让意外开支更容易处理",
    zhClause: "我可以为应急基金存钱",
    zhDifficultNoun: "一笔意外开支",
    zhEmotion: "有安全感",
    zhGerund: "为应急基金存钱",
    zhMethod: "每次发薪日把钱转入储蓄",
    zhMoreFirst: "我每月存一点越久",
    zhMoreSecond: "我越有安全感",
    zhNoun: "应急基金",
    zhOptionA: "每月存一点",
    zhOptionB: "马上花光所有钱",
    zhPastParticiple: "以前为应急情况存过钱",
    zhPastSimple: "把一部分工资存了起来",
    zhProblem: "我的应急储蓄不够",
    zhReason: "意外开支随时可能发生",
    zhResult: "我可以更好地应对紧急情况",
    zhTimePoint: "我有第一份全职工作的时候",
    zhWhenClause: "意外账单出现时",
  },
  {
    action: "join a language exchange group",
    apologyAction: "forget our language exchange meeting",
    benefit: "gives me more real speaking practice",
    clause: "I can join a language exchange group",
    difficultNoun: "speaking with native speakers for the first time",
    emotion: "curious",
    gerund: "joining a language exchange group",
    idiomatic: "I want to get more real conversation practice.",
    method: "meeting online twice a week",
    moreFirst: "I speak with real people",
    moreSecond: "comfortable I feel",
    noun: "a friendly language exchange group",
    optionA: "real conversation practice",
    optionB: "studying alone all the time",
    pastParticiple: "joined an online class before",
    pastSimple: "met a language partner online",
    problem: "I do not have enough real speaking practice",
    reason: "real conversations help me improve faster",
    result: "I can speak more naturally",
    simple: "I want more speaking practice.",
    timePoint: "when I began practicing English seriously",
    whenClause: "I meet a new language partner",
    zhAction: "加入一个语言交换小组",
    zhApologyAction: "忘了我们的语言交换会议",
    zhBenefit: "给我更多真实口语练习",
    zhClause: "我可以加入一个语言交换小组",
    zhDifficultNoun: "第一次和母语者交流",
    zhEmotion: "好奇",
    zhGerund: "加入一个语言交换小组",
    zhMethod: "每周在线见面两次",
    zhMoreFirst: "我和真人交流越多",
    zhMoreSecond: "我越自在",
    zhNoun: "一个友好的语言交换小组",
    zhOptionA: "真实对话练习",
    zhOptionB: "一直独自学习",
    zhPastParticiple: "以前参加过在线课程",
    zhPastSimple: "在网上认识了一个语言伙伴",
    zhProblem: "我没有足够的真实口语练习",
    zhReason: "真实对话帮助我更快进步",
    zhResult: "我可以说得更自然",
    zhTimePoint: "我认真练英语的时候",
    zhWhenClause: "我见到新的语言伙伴时",
  },
];

function makeDraft(chinese: string, targetEnglish: string): BasicPracticeDraft {
  return { chinese, targetEnglish };
}

function renderBasicPracticeDraft(
  patternId: number,
  topic: BasicPracticeTopic
): BasicPracticeDraft {
  switch (patternId) {
    case 2:
      return makeDraft(`我想${topic.zhAction}。`, `I’d like to ${topic.action}.`);
    case 3:
      return makeDraft(
        `我必须${topic.zhAction}，因为${topic.zhReason}。`,
        `I have to ${topic.action} because ${topic.reason}.`
      );
    case 4:
      return makeDraft(`你能帮我${topic.zhAction}吗？`, `Can you help me ${topic.action}?`);
    case 5:
      return makeDraft(`我正在找${topic.zhNoun}。`, `I’m looking for ${topic.noun}.`);
    case 6:
      return makeDraft(`如果${topic.zhClause}，那就太好了。`, `It would be great if ${topic.clause}.`);
    case 7:
      return makeDraft(`我需要的只是${topic.zhNoun}。`, `All I need is ${topic.noun}.`);
    case 8:
      return makeDraft(`我真的想${topic.zhAction}。`, `I really want to ${topic.action}.`);
    case 9:
      return makeDraft(`你能帮我${topic.zhAction}吗？`, `Could you ${topic.action} for me?`);
    case 10:
      return makeDraft(`我期待${topic.zhClause}。`, `I expect ${topic.clause}.`);
    case 11:
      return makeDraft(`我想说的是，${topic.zhClause}。`, `What I’m trying to say is ${topic.clause}.`);
    case 12:
      return makeDraft(`我希望${topic.zhClause}。`, `I hope ${topic.clause}.`);
    case 13:
      return makeDraft(`我真希望我能${topic.zhAction}。`, `I wish I could ${topic.action}.`);
    case 14:
      return makeDraft(`我特别想要${topic.zhNoun}。`, `I’m dying for ${topic.noun}.`);
    case 15:
      return makeDraft(
        `对我来说最重要的是${topic.zhClause}。`,
        `The most important thing for me is that ${topic.clause}.`
      );
    case 16:
      return makeDraft(`在我看来，${topic.zhClause}。`, `In my opinion, ${topic.clause}.`);
    case 17:
      return makeDraft(`我认为${topic.zhClause}。`, `I think ${topic.clause}.`);
    case 18:
      return makeDraft(`从我的角度看，${topic.zhClause}。`, `From my point of view, ${topic.clause}.`);
    case 19:
      return makeDraft(`在我看来，${topic.zhClause}。`, `It seems to me that ${topic.clause}.`);
    case 20:
      return makeDraft(`我感觉${topic.zhClause}。`, `I feel like ${topic.clause}.`);
    case 21:
      return makeDraft(`据我所知，${topic.zhClause}。`, `As far as I know, ${topic.clause}.`);
    case 22:
      return makeDraft(
        `${topic.zhProblem}的原因是${topic.zhReason}。`,
        `The reason why ${topic.problem} is that ${topic.reason}.`
      );
    case 23:
      return makeDraft(`我的意思是，${topic.zhClause}。`, `What I mean is ${topic.clause}.`);
    case 24:
      return makeDraft(`我不确定是否${topic.zhClause}。`, `I’m not sure if ${topic.clause}.`);
    case 25:
      return makeDraft(`老实说，${topic.zhClause}。`, `To be honest, ${topic.clause}.`);
    case 26:
      return makeDraft(
        `就我个人而言，比起${topic.zhOptionB}，我更喜欢${topic.zhOptionA}。`,
        `Personally, I prefer ${topic.optionA} to ${topic.optionB}.`
      );
    case 27:
      return makeDraft(`这取决于${topic.zhNoun}。`, `It depends on ${topic.noun}.`);
    case 28:
      return makeDraft(`我怀疑是否${topic.zhClause}。`, `I doubt whether ${topic.clause}.`);
    case 29:
      return makeDraft(`事实上，${topic.zhClause}。`, `In fact, ${topic.clause}.`);
    case 30:
      return makeDraft(`我的想法是，${topic.zhClause}。`, `My idea is that ${topic.clause}.`);
    case 31:
      return makeDraft(`我对${topic.zhNoun}感到${topic.zhEmotion}。`, `I’m ${topic.emotion} about ${topic.noun}.`);
    case 32:
      return makeDraft(`当${topic.zhWhenClause}，我会感到${topic.zhEmotion}。`, `I feel ${topic.emotion} when ${topic.whenClause}.`);
    case 33:
      return makeDraft(`去${topic.zhAction}让我感到${topic.zhEmotion}。`, `It makes me ${topic.emotion} to ${topic.action}.`);
    case 34:
      return makeDraft(`我担心${topic.zhNoun}。`, `I’m worried about ${topic.noun}.`);
    case 35:
      return makeDraft(`我受不了${topic.zhGerund}。`, `I can’t stand ${topic.gerund}.`);
    case 36:
      return makeDraft(`我很兴奋，因为${topic.zhClause}。`, `I’m excited that ${topic.clause}.`);
    case 37:
      return makeDraft(
        `${topic.zhDifficultNoun}是我经历过的最有挑战的事情。`,
        `This is the most challenging ${topic.difficultNoun} I’ve ever dealt with.`
      );
    case 38:
      return makeDraft(`很抱歉${topic.zhApologyAction}。`, `I’m sorry to ${topic.apologyAction}.`);
    case 39:
      return makeDraft(`我为你感到高兴，因为你可以${topic.zhAction}。`, `I’m happy for you that you can ${topic.action}.`);
    case 40:
      return makeDraft(`对我来说，${topic.zhAction}很难。`, `It’s hard for me to ${topic.action}.`);
    case 41:
      return makeDraft(`我厌倦了${topic.zhGerund}。`, `I’m tired of ${topic.gerund}.`);
    case 42:
      return makeDraft(`当你帮我${topic.zhAction}时，我很感激。`, `I appreciate it when you help me ${topic.action}.`);
    case 43:
      return makeDraft(`那真的让我感到${topic.zhEmotion}。`, `That really makes me feel ${topic.emotion}.`);
    case 44:
      return makeDraft(`我受够了${topic.zhDifficultNoun}。`, `I’m fed up with ${topic.difficultNoun}.`);
    case 45:
      return makeDraft(`我的感受是我很${topic.zhEmotion}。`, `How I feel is that I’m ${topic.emotion}.`);
    case 46:
      return makeDraft(`我以前${topic.zhPastParticiple}。`, `I have ${topic.pastParticiple} before.`);
    case 47:
      return makeDraft(`上次我${topic.zhPastSimple}，我明白了${topic.zhResult}。`, `Last time I ${topic.pastSimple}, I learned that ${topic.result}.`);
    case 48:
      return makeDraft(`当我是${topic.zhTimePoint}时，${topic.zhPastSimple}。`, `When I was ${topic.timePoint}, I ${topic.pastSimple}.`);
    case 49:
      return makeDraft(`我记得${topic.zhGerund}。`, `I remember ${topic.gerund}.`);
    case 50:
      return makeDraft(`那是我第一次${topic.zhPastParticiple}。`, `It was the first time that I had ${topic.pastParticiple}.`);
    case 51:
      return makeDraft(`我过去常常${topic.zhGerund}。`, `I used to ${topic.action}.`);
    case 52:
      return makeDraft(`我刚刚${topic.zhPastParticiple}。`, `I’ve just ${topic.pastParticiple}.`);
    case 53:
      return makeDraft(`发生的事情是${topic.zhProblem}。`, `What happened was ${topic.problem}.`);
    case 54:
      return makeDraft(`我经历过${topic.zhDifficultNoun}。`, `I went through ${topic.difficultNoun}.`);
    case 55:
      return makeDraft(`那时候，我${topic.zhPastSimple}。`, `Back then, I ${topic.pastSimple}.`);
    case 56:
      return makeDraft(`我以前从来没有${topic.zhPastParticiple}。`, `I’ve never ${topic.pastParticiple} before.`);
    case 57:
      return makeDraft(`在${topic.zhGerund}之后，我明白了${topic.zhResult}。`, `After ${topic.gerund}, I learned that ${topic.result}.`);
    case 58:
      return makeDraft(`那让我想起了${topic.zhNoun}。`, `That reminds me of ${topic.noun}.`);
    case 59:
      return makeDraft(`我在${topic.zhGerund}这件事上很吃力。`, `I had a hard time ${topic.gerund}.`);
    case 60:
      return makeDraft(`我做过的最好的事之一是${topic.zhGerund}。`, `One of the best things I’ve done is ${topic.gerund}.`);
    case 61:
      return makeDraft(`我打算${topic.zhAction}。`, `I’m going to ${topic.action}.`);
    case 62:
      return makeDraft(`我计划这周${topic.zhAction}。`, `I plan to ${topic.action} this week.`);
    case 63:
      return makeDraft(`下次，我会${topic.zhAction}。`, `Next time, I will ${topic.action}.`);
    case 64:
      return makeDraft(`我正在考虑${topic.zhGerund}。`, `I’m thinking of ${topic.gerund}.`);
    case 65:
      return makeDraft(`我们应该${topic.zhAction}，因为${topic.zhReason}。`, `We should ${topic.action} because ${topic.reason}.`);
    case 66:
      return makeDraft(`如果我有时间，我会${topic.zhAction}。`, `If I have time, I will ${topic.action}.`);
    case 67:
      return makeDraft(`我马上要${topic.zhAction}。`, `I’m about to ${topic.action}.`);
    case 68:
      return makeDraft(`我们一起${topic.zhAction}吧。`, `Let’s ${topic.action} together.`);
    case 69:
      return makeDraft(`我希望很快${topic.zhAction}。`, `I hope to ${topic.action} soon.`);
    case 70:
      return makeDraft(`未来，我想${topic.zhAction}。`, `In the future, I want to ${topic.action}.`);
    case 71:
      return makeDraft(`我期待${topic.zhGerund}。`, `I’m looking forward to ${topic.gerund}.`);
    case 72:
      return makeDraft(`我们${topic.zhAction}怎么样？`, `How about we ${topic.action}?`);
    case 73:
      return makeDraft(`我会尽最大努力${topic.zhAction}。`, `I’ll try my best to ${topic.action}.`);
    case 74:
      return makeDraft(`一旦${topic.zhWhenClause}，我就会${topic.zhAction}。`, `As soon as ${topic.whenClause}, I will ${topic.action}.`);
    case 75:
      return makeDraft(`我的目标是${topic.zhAction}。`, `My goal is to ${topic.action}.`);
    case 76:
      return makeDraft(`问题是${topic.zhProblem}。`, `The problem is that ${topic.problem}.`);
    case 77:
      return makeDraft(`你为什么不${topic.zhAction}呢？`, `Why don’t you ${topic.action}?`);
    case 78:
      return makeDraft(`你应该${topic.zhAction}。`, `You should ${topic.action}.`);
    case 79:
      return makeDraft(`因为${topic.zhReason}，${topic.zhResult}。`, `Because ${topic.reason}, ${topic.result}.`);
    case 80:
      return makeDraft(`我怎样才能${topic.zhAction}？`, `How can I ${topic.action}?`);
    case 81:
      return makeDraft(`如果${topic.zhProblem}怎么办？`, `What if ${topic.problem}?`);
    case 82:
      return makeDraft(`我建议你${topic.zhAction}。`, `I suggest that you ${topic.action}.`);
    case 83:
      return makeDraft(`${topic.zhNoun}出了点问题。`, `There is something wrong with ${topic.noun}.`);
    case 84:
      return makeDraft(`主要原因是${topic.zhReason}。`, `The main reason is ${topic.reason}.`);
    case 85:
      return makeDraft(`你最好${topic.zhAction}。`, `You’d better ${topic.action}.`);
    case 86:
      return makeDraft(`有没有办法${topic.zhAction}？`, `Is there any way to ${topic.action}?`);
    case 87:
      return makeDraft(`我不知道怎样才能${topic.zhAction}。`, `I have no idea how I can ${topic.action}.`);
    case 88:
      return makeDraft(`让我解释为什么${topic.zhProblem}。`, `Let me explain why ${topic.problem}.`);
    case 89:
      return makeDraft(`${topic.zhAction}很重要。`, `It’s important to ${topic.action}.`);
    case 90:
      return makeDraft(`你怎么处理${topic.zhDifficultNoun}？`, `How do you deal with ${topic.difficultNoun}?`);
    case 91:
      return makeDraft(`${topic.zhOptionA}比${topic.zhOptionB}更好。`, `It’s better than ${topic.optionB}.`);
    case 92:
      return makeDraft(`我完全同意${topic.zhClause}。`, `I totally agree that ${topic.clause}.`);
    case 93:
      return makeDraft(`我不认为${topic.zhOptionB}有帮助。`, `I don’t think ${topic.optionB} helps.`);
    case 94:
      return makeDraft(
        `和${topic.zhOptionB}相比，${topic.zhOptionA}更适合我。`,
        `Compared to ${topic.optionB}, ${topic.optionA} works better for me.`
      );
    case 95:
      return makeDraft(
        `${topic.zhOptionA}和${topic.zhOptionB}都不能单独解决问题。`,
        `Neither ${topic.optionA} nor ${topic.optionB} can solve the problem alone.`
      );
    case 96:
      return makeDraft(
        `${topic.zhGerund}不仅有帮助，还${topic.zhBenefit}。`,
        `Not only does ${topic.gerund} help, but it also ${topic.benefit}.`
      );
    case 97:
      return makeDraft(
        `${topic.zhMoreFirst}，${topic.zhMoreSecond}。`,
        `The more ${topic.moreFirst}, the more ${topic.moreSecond}.`
      );
    case 98:
      return makeDraft(`很高兴和你一起${topic.zhGerund}。`, `It was nice ${topic.gerund} with you.`);
    case 99:
      return makeDraft(`我们通过${topic.zhMethod}保持联系吧。`, `Let’s keep in touch by ${topic.method}.`);
    case 100:
      return makeDraft(
        `谢谢你${topic.zhGerund}，这真的${topic.zhBenefit}。`,
        `Thank you for ${topic.gerund}, it really ${topic.benefit}.`
      );
    default:
      return makeDraft(`请表达：${topic.zhClause}。`, topic.simple);
  }
}

function createBasicPracticeCourse(patternId: number): SentencePatternPractice[] {
  return basicPracticeTopics.map((topic, index) => {
    const draft = renderBasicPracticeDraft(patternId, topic);

    return {
      chinese: draft.chinese,
      id: index + 1,
      idiomatic: topic.idiomatic,
      natural: draft.targetEnglish,
      recommended: draft.targetEnglish,
      simple: topic.simple,
      targetEnglish: draft.targetEnglish,
    };
  });
}

const basicSectionsWithPracticeCourses: SentencePatternSection[] = basicSections.map((section) => ({
  ...section,
  patterns: section.patterns.map((pattern) => ({
    ...pattern,
    practices:
      pattern.practices?.length === basicPracticeTopics.length
        ? pattern.practices
        : createBasicPracticeCourse(pattern.id),
  })),
}));

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
    sections: basicSectionsWithPracticeCourses,
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
