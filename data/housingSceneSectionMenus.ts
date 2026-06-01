import type { ClassicSceneCategoryIcon } from "./classicSceneCategoryMenus";

export type HousingSceneSectionId =
  | "hotel-stay"
  | "rent-viewing"
  | "daily-home-life"
  | "housing-problems"
  | "home-supplies-shopping"
  | "long-term-housing";

export type HousingSceneLesson = {
  accent: string;
  icon: ClassicSceneCategoryIcon;
  id: string;
  number: number;
  tile: string;
  title: string;
};

export type HousingSceneSectionMenu = {
  accent: string;
  id: HousingSceneSectionId;
  lessons: HousingSceneLesson[];
  subtitle: string;
  title: string;
};

function lesson(
  number: number,
  title: string,
  icon: ClassicSceneCategoryIcon,
  accent: string,
  tile: string
): HousingSceneLesson {
  return {
    id: `${number}-${title}`,
    number,
    title,
    icon,
    accent,
    tile,
  };
}

export const housingSceneSectionMenus: Record<
  HousingSceneSectionId,
  HousingSceneSectionMenu
> = {
  "hotel-stay": {
    id: "hotel-stay",
    title: "酒店住宿场景",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#c96d00",
    lessons: [
      lesson(1, "酒店预订与在线入住", "hotel", "#c96d00", "#fff4df"),
      lesson(2, "酒店前台登记与沟通", "service", "#c96d00", "#fff4df"),
      lesson(3, "处理酒店房间设施问题", "tools", "#c96d00", "#fff4df"),
      lesson(4, "延长住宿与退房手续", "calendar", "#c96d00", "#fff4df"),
      lesson(5, "酒店费用支付与发票索取", "wallet", "#c96d00", "#fff4df"),
    ],
  },
  "rent-viewing": {
    id: "rent-viewing",
    title: "租房与看房",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#2f8a43",
    lessons: [
      lesson(1, "寻找和预约看房", "home", "#2f8a43", "#eef8ee"),
      lesson(2, "实地看房与提问", "community", "#2f8a43", "#eef8ee"),
      lesson(3, "签订租房合同", "clipboard", "#2f8a43", "#eef8ee"),
      lesson(4, "缴纳押金与首月租金", "wallet", "#2f8a43", "#eef8ee"),
      lesson(5, "了解租房规则与权利", "shield", "#2f8a43", "#eef8ee"),
    ],
  },
  "daily-home-life": {
    id: "daily-home-life",
    title: "日常家居生活",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#6c54bd",
    lessons: [
      lesson(1, "缴纳水电费、网费和垃圾费", "bill", "#6c54bd", "#f5f1ff"),
      lesson(2, "房屋维修与报修沟通", "tools", "#6c54bd", "#f5f1ff"),
      lesson(3, "垃圾分类与丢垃圾规则", "store", "#6c54bd", "#f5f1ff"),
      lesson(4, "冬季/夏季家居准备", "home", "#6c54bd", "#f5f1ff"),
      lesson(5, "社区活动与邻里沟通", "community", "#6c54bd", "#f5f1ff"),
    ],
  },
  "housing-problems": {
    id: "housing-problems",
    title: "住房问题处理",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#2b67b8",
    lessons: [
      lesson(1, "处理漏水、停电等紧急维修", "tools", "#2b67b8", "#eef6ff"),
      lesson(2, "与房东或物业投诉沟通", "community", "#2b67b8", "#eef6ff"),
      lesson(3, "申请租金减免或退还押金", "wallet", "#2b67b8", "#eef6ff"),
      lesson(4, "搬家与地址变更手续", "map", "#2b67b8", "#eef6ff"),
      lesson(5, "安全问题与求助", "shield", "#2b67b8", "#eef6ff"),
    ],
  },
  "home-supplies-shopping": {
    id: "home-supplies-shopping",
    title: "家居用品采购",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#e6673f",
    lessons: [
      lesson(1, "购买家具和家居用品", "cart", "#e6673f", "#fff1e8"),
      lesson(2, "在家居店（如IKEA）购物", "store", "#e6673f", "#fff1e8"),
      lesson(3, "购买床上用品和厨房用品", "home", "#e6673f", "#fff1e8"),
      lesson(4, "购买家电与安装服务", "tools", "#e6673f", "#fff1e8"),
      lesson(5, "网购家居用品与收货", "delivery", "#e6673f", "#fff1e8"),
    ],
  },
  "long-term-housing": {
    id: "long-term-housing",
    title: "长期住房规划",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#e6673f",
    lessons: [
      lesson(1, "申请公共住房或租金补贴", "document", "#e6673f", "#fff1e8"),
      lesson(2, "寻找室友与合租沟通", "community", "#e6673f", "#fff1e8"),
      lesson(3, "续租或提前终止租约", "calendar", "#e6673f", "#fff1e8"),
      lesson(4, "购买第一套房子咨询", "home", "#e6673f", "#fff1e8"),
      lesson(5, "了解租房者保险与权益", "shield", "#e6673f", "#fff1e8"),
    ],
  },
};

export const housingSceneSectionMenuIds = Object.keys(
  housingSceneSectionMenus
) as HousingSceneSectionId[];

export function getHousingSceneSectionMenu(sectionId: string) {
  return housingSceneSectionMenus[sectionId as HousingSceneSectionId];
}
