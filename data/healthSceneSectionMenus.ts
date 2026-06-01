import type { ClassicSceneCategoryIcon } from "./classicSceneCategoryMenus";

export type HealthSceneSectionId =
  | "first-visit"
  | "pharmacy-medicine"
  | "checkup-prevention"
  | "medical-insurance"
  | "medical-emergency"
  | "health-followup";

export type HealthSceneLesson = {
  accent: string;
  icon: ClassicSceneCategoryIcon;
  id: string;
  number: number;
  tile: string;
  title: string;
};

export type HealthSceneSectionMenu = {
  accent: string;
  id: HealthSceneSectionId;
  lessons: HealthSceneLesson[];
  subtitle: string;
  title: string;
};

function lesson(
  number: number,
  title: string,
  icon: ClassicSceneCategoryIcon,
  accent: string,
  tile: string
): HealthSceneLesson {
  return {
    id: `${number}-${title}`,
    number,
    title,
    icon,
    accent,
    tile,
  };
}

const subtitle = "选择一个具体场景，开始你的口语练习之旅吧！";

export const healthSceneSectionMenus: Record<
  HealthSceneSectionId,
  HealthSceneSectionMenu
> = {
  "first-visit": {
    id: "first-visit",
    title: "初诊与看病流程",
    subtitle,
    accent: "#2f7d41",
    lessons: [
      lesson(1, "预约初级保健医生（PCP）", "calendar", "#2f7d41", "#eef8ec"),
      lesson(2, "第一次看医生沟通", "health", "#2f7d41", "#eef8ec"),
      lesson(3, "描述症状与病史", "clipboard", "#2f7d41", "#eef8ec"),
      lesson(4, "转诊专科医生", "document", "#2f7d41", "#eef8ec"),
      lesson(5, "急诊就医沟通", "emergency", "#2f7d41", "#eef8ec"),
    ],
  },
  "pharmacy-medicine": {
    id: "pharmacy-medicine",
    title: "买药与药店场景",
    subtitle,
    accent: "#f26a21",
    lessons: [
      lesson(1, "在药店购买非处方药", "medicine", "#f26a21", "#fff3e3"),
      lesson(2, "购买处方药与取药", "document", "#f26a21", "#fff3e3"),
      lesson(3, "询问药物用法和副作用", "service", "#f26a21", "#fff3e3"),
      lesson(4, "处理保险处方问题", "shield", "#f26a21", "#fff3e3"),
      lesson(5, "购买维生素和保健品", "health", "#f26a21", "#fff3e3"),
    ],
  },
  "checkup-prevention": {
    id: "checkup-prevention",
    title: "体检与预防保健",
    subtitle,
    accent: "#2d74d9",
    lessons: [
      lesson(1, "年度体检与常规检查", "clipboard", "#2d74d9", "#eef5ff"),
      lesson(2, "疫苗接种咨询", "medicine", "#2d74d9", "#eef5ff"),
      lesson(3, "办理健康证明文件", "document", "#2d74d9", "#eef5ff"),
      lesson(4, "妇科/男科检查沟通", "health", "#2d74d9", "#eef5ff"),
      lesson(5, "血液检查与化验结果咨询", "document", "#2d74d9", "#eef5ff"),
    ],
  },
  "medical-insurance": {
    id: "medical-insurance",
    title: "医疗保险相关",
    subtitle,
    accent: "#8158d0",
    lessons: [
      lesson(1, "了解保险覆盖范围", "shield", "#8158d0", "#f5f0ff"),
      lesson(2, "处理保险拒赔或预授权", "document", "#8158d0", "#f5f0ff"),
      lesson(3, "选择合适的医疗保险计划", "chart", "#8158d0", "#f5f0ff"),
      lesson(4, "申请医疗补助或低收入保险", "document", "#8158d0", "#f5f0ff"),
      lesson(5, "保险理赔申请沟通", "clipboard", "#8158d0", "#f5f0ff"),
    ],
  },
  "medical-emergency": {
    id: "medical-emergency",
    title: "紧急医疗与求助",
    subtitle,
    accent: "#f04e5d",
    lessons: [
      lesson(1, "拨打911紧急求助", "emergency", "#f04e5d", "#fff0f1"),
      lesson(2, "处理突发疾病或受伤", "health", "#f04e5d", "#fff0f1"),
      lesson(3, "医院急诊就医流程", "emergency", "#f04e5d", "#fff0f1"),
      lesson(4, "药店或诊所紧急咨询", "medicine", "#f04e5d", "#fff0f1"),
      lesson(5, "医疗费用援助申请", "wallet", "#f04e5d", "#fff0f1"),
    ],
  },
  "health-followup": {
    id: "health-followup",
    title: "健康管理与后续",
    subtitle,
    accent: "#168f88",
    lessons: [
      lesson(1, "复诊与跟进治疗", "calendar", "#168f88", "#edf9f7"),
      lesson(2, "管理慢性病（如高血压、糖尿病）", "health", "#168f88", "#edf9f7"),
      lesson(3, "心理咨询与预约", "community", "#168f88", "#edf9f7"),
      lesson(4, "购买医疗器械（如眼镜、血压计）", "medicine", "#168f88", "#edf9f7"),
      lesson(5, "健康生活方式咨询", "health", "#168f88", "#edf9f7"),
    ],
  },
};

export const healthSceneSectionMenuIds = Object.keys(
  healthSceneSectionMenus
) as HealthSceneSectionId[];

export function getHealthSceneSectionMenu(sectionId: string) {
  return healthSceneSectionMenus[sectionId as HealthSceneSectionId];
}
