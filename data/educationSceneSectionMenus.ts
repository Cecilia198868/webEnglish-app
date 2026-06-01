import type { ClassicSceneCategoryIcon } from "./classicSceneCategoryMenus";

export type EducationSceneSectionId =
  | "school-campus"
  | "job-interview"
  | "workplace-communication"
  | "social-relationship"
  | "career-growth"
  | "community-integration";

export type EducationSceneLesson = {
  accent: string;
  description: string;
  icon: ClassicSceneCategoryIcon;
  id: string;
  number: number;
  tile: string;
  title: string;
};

export type EducationSceneSectionMenu = {
  accent: string;
  id: EducationSceneSectionId;
  lessons: EducationSceneLesson[];
  subtitle: string;
  title: string;
};

function lesson(
  number: number,
  title: string,
  description: string,
  icon: ClassicSceneCategoryIcon,
  accent: string,
  tile: string
): EducationSceneLesson {
  return {
    accent,
    description,
    icon,
    id: `${number}`,
    number,
    tile,
    title,
  };
}

const subtitle = "选择一个具体场景，开始你的口语练习之旅吧！";

export const educationSceneSectionMenus: Record<
  EducationSceneSectionId,
  EducationSceneSectionMenu
> = {
  "school-campus": {
    accent: "#7256c6",
    id: "school-campus",
    lessons: [
      lesson(
        1,
        "大学注册、选课与转专业",
        "了解注册流程，选择课程或申请转专业",
        "education",
        "#7256c6",
        "#f4f0ff"
      ),
      lesson(
        2,
        "课堂讨论与小组作业沟通",
        "参与课堂讨论，合作完成小组作业",
        "community",
        "#7256c6",
        "#f4f0ff"
      ),
      lesson(
        3,
        "申请奖学金、助学金或实习",
        "咨询申请条件、材料准备和申请流程",
        "document",
        "#7256c6",
        "#f4f0ff"
      ),
      lesson(
        4,
        "处理学业压力与求助老师",
        "表达压力和困扰，寻求建议和帮助",
        "service",
        "#7256c6",
        "#f4f0ff"
      ),
      lesson(
        5,
        "毕业手续与学位认证",
        "了解毕业要求，办理学位认证等手续",
        "graduation",
        "#7256c6",
        "#f4f0ff"
      ),
    ],
    subtitle,
    title: "学校教育与校园生活",
  },
  "job-interview": {
    accent: "#2d7bd1",
    id: "job-interview",
    lessons: [
      lesson(
        1,
        "撰写英文简历与求职信",
        "介绍经历、技能和优势，撰写求职信",
        "document",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        2,
        "参加电话/视频/现场面试",
        "回答常见问题，展示自我和经验",
        "service",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        3,
        "询问薪资、福利与工作内容",
        "询问工资范围、福利、职责和发展机会",
        "wallet",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        4,
        "处理面试失败与跟进",
        "感谢反馈，询问结果，礼貌跟进",
        "document",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        5,
        "接受或拒绝工作Offer",
        "确认入职细节，或礼貌拒绝并保持联系",
        "clipboard",
        "#2d7bd1",
        "#edf6ff"
      ),
    ],
    subtitle,
    title: "求职与面试准备",
  },
  "workplace-communication": {
    accent: "#e58417",
    id: "workplace-communication",
    lessons: [
      lesson(
        1,
        "第一天上班自我介绍",
        "介绍自己，表达期待，给同事留下好印象",
        "briefcase",
        "#e58417",
        "#fff5df"
      ),
      lesson(
        2,
        "与同事、主管的日常沟通",
        "日常交流、工作协调、建立良好关系",
        "community",
        "#e58417",
        "#fff5df"
      ),
      lesson(
        3,
        "请假、加班与工作反馈",
        "请假申请、加班安排、提供和接受反馈",
        "calendar",
        "#e58417",
        "#fff5df"
      ),
      lesson(
        4,
        "参加公司会议与汇报工作",
        "参与会议讨论，汇报进展，提出建议",
        "chart",
        "#e58417",
        "#fff5df"
      ),
      lesson(
        5,
        "处理职场冲突与误会",
        "表达观点，倾听理解，解决冲突与误会",
        "service",
        "#e58417",
        "#fff5df"
      ),
    ],
    subtitle,
    title: "职场沟通与日常工作",
  },
  "social-relationship": {
    accent: "#e84e78",
    id: "social-relationship",
    lessons: [
      lesson(
        1,
        "参加派对、聚会与社交活动",
        "参与各种社交场合，享受交流与互动",
        "community",
        "#e84e78",
        "#fff0f4"
      ),
      lesson(
        2,
        "结识新朋友与闲聊技巧",
        "打招呼、找话题，轻松开启对话",
        "service",
        "#e84e78",
        "#fff0f4"
      ),
      lesson(
        3,
        "加入兴趣社团或社区活动",
        "发现共同兴趣，积极参与社区活动",
        "education",
        "#e84e78",
        "#fff0f4"
      ),
      lesson(
        4,
        "处理文化差异与礼仪问题",
        "了解文化差异，遵守礼仪，避免误会",
        "map",
        "#e84e78",
        "#fff0f4"
      ),
      lesson(
        5,
        "建立朋友圈与人脉网络",
        "维护关系，拓展人脉，创造更多机会",
        "community",
        "#e84e78",
        "#fff0f4"
      ),
    ],
    subtitle,
    title: "社交活动与人际关系",
  },
  "career-growth": {
    accent: "#7364d8",
    id: "career-growth",
    lessons: [
      lesson(
        1,
        "申请升职、加薪或内部调动",
        "准备申请，表达理由，讨论机会与期望",
        "chart",
        "#7364d8",
        "#f3f0ff"
      ),
      lesson(
        2,
        "参加职业培训与技能提升",
        "询问课程，报名流程，分享学习目标",
        "education",
        "#7364d8",
        "#f3f0ff"
      ),
      lesson(
        3,
        "更换工作与离职沟通",
        "表达离职原因，交接工作，保持良好关系",
        "briefcase",
        "#7364d8",
        "#f3f0ff"
      ),
      lesson(
        4,
        "工作与生活平衡咨询",
        "讨论压力，时间管理，寻求建议与支持",
        "home",
        "#7364d8",
        "#f3f0ff"
      ),
      lesson(
        5,
        "长期职业规划与导师指导",
        "设定目标，规划路径，获得导师建议",
        "interview",
        "#7364d8",
        "#f3f0ff"
      ),
    ],
    subtitle,
    title: "职业发展与工作进阶",
  },
  "community-integration": {
    accent: "#3f9278",
    id: "community-integration",
    lessons: [
      lesson(
        1,
        "参加校园文化活动与节日庆典",
        "参与各类活动，体验校园文化与节日氛围",
        "community",
        "#3f9278",
        "#eef8f4"
      ),
      lesson(
        2,
        "室友沟通与合租生活管理",
        "建立良好沟通，管理日常生活与规则",
        "home",
        "#3f9278",
        "#eef8f4"
      ),
      lesson(
        3,
        "志愿者活动与社区服务",
        "参与志愿服务，贡献社区，结识新朋友",
        "health",
        "#3f9278",
        "#eef8f4"
      ),
      lesson(
        4,
        "心理咨询与适应压力",
        "应对压力与情绪，寻求帮助与自我调适",
        "service",
        "#3f9278",
        "#eef8f4"
      ),
      lesson(
        5,
        "毕业后生活过渡规划",
        "规划未来方向，顺利过渡到新生活阶段",
        "map",
        "#3f9278",
        "#eef8f4"
      ),
    ],
    subtitle,
    title: "校园与社区融合",
  },
};

export const educationSceneSectionMenuIds = Object.keys(
  educationSceneSectionMenus
) as EducationSceneSectionId[];

export function getEducationSceneSectionMenu(sectionId: string) {
  return educationSceneSectionMenus[sectionId as EducationSceneSectionId];
}
