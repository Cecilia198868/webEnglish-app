import FooterInfoPage, { type FooterInfoPageData } from "@/components/FooterInfoPage";

const helpPage: FooterInfoPageData = {
  tone: "violet",
  eyebrow: "支持",
  title: "帮助中心",
  lead:
    "这里整理了 SpeakFlow 的核心使用方式、学习路径和常见问题。无论你是第一次开口练习，还是想用 AI 生成课程，都可以从这里快速找到答案。",
  updated: "适用于 SpeakFlow 网页版",
  badges: ["自由学习", "AI 引导表达", "场景口语", "句型训练", "语感跟读"],
  visual: {
    src: "/images/home-free-study-card-bg.png",
    alt: "SpeakFlow 自由学习界面示意",
  },
  summary: {
    title: "最快开始方式",
    items: [
      "想说什么就说什么，选择自由学习。",
      "不知道怎么表达时，选择 AI 引导表达。",
      "准备银行、餐厅、交通等真实场景时，选择经典场景口语练习。",
      "想系统积累结构，选择 100 个口语句型。",
    ],
  },
  sections: [
    {
      eyebrow: "学习入口",
      title: "根据你的目标选择学习方式",
      text:
        "SpeakFlow 不是让你先背一堆语法，而是把真实想法变成可以开口练的英语。每个学习入口都对应一种明确场景。",
      items: [
        {
          title: "自由学习",
          text: "适合已经有想说的内容。直接输入中文或英文，AI 会帮你优化表达，并生成可练习句子。",
        },
        {
          title: "AI 引导表达",
          text: "适合卡住、不知道怎么说的时候。AI 会给你题目、追问和提示，一步一步帮你说完整。",
        },
        {
          title: "经典场景口语练习",
          text: "适合准备真实生活对话。覆盖银行、购物、餐厅、住房、交通等高频场景。",
        },
        {
          title: "100 个口语句型",
          text: "适合系统搭建表达框架。通过可替换句型反复练习，让表达越来越顺。",
        },
      ],
    },
    {
      eyebrow: "录音与反馈",
      title: "麦克风无法使用怎么办",
      text:
        "如果点击录音后没有反应，通常是浏览器或系统没有授予录音权限。请在浏览器地址栏权限设置中允许麦克风，并确认系统隐私设置允许当前浏览器录音。",
      items: [
        {
          title: "检查浏览器权限",
          text: "在地址栏左侧打开网站设置，确认 SpeakFlow 的麦克风权限为允许。",
        },
        {
          title: "检查系统权限",
          text: "在系统设置中打开麦克风访问权限，并允许 Chrome、Edge 或 Safari 使用麦克风。",
        },
      ],
    },
    {
      eyebrow: "学习记录",
      title: "如何保存表达和继续学习",
      text:
        "登录账号后，SpeakFlow 可以保存你的练习进度、表达库、单词和课程内容。你下次打开时可以从上次的位置继续。",
      items: [
        {
          title: "表达库",
          text: "学习中遇到的好表达可以收藏，后续按主题复习和跟读。",
        },
        {
          title: "课程内容",
          text: "上传材料生成的课程会保留结构、例句和练习任务，方便持续迭代。",
        },
      ],
    },
    {
      eyebrow: "效果建议",
      title: "怎样练得更快",
      text:
        "每天用 10 到 15 分钟做短练习，比一次性学很久更容易形成表达习惯。建议先说中文想法，再看 AI 优化后的英文，最后跟读并复述。",
      items: [
        {
          title: "先表达，再优化",
          text: "不要一开始追求完美，先把想法说出来，再让 AI 帮你调整成自然英语。",
        },
        {
          title: "重复真实场景",
          text: "围绕工作汇报、旅行、面试、日常沟通等真实场景反复练。",
        },
      ],
    },
  ],
};

export default function HelpPage() {
  return <FooterInfoPage data={helpPage} />;
}
