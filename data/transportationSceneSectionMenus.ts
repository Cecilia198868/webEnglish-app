import type { ClassicSceneCategoryIcon } from "./classicSceneCategoryMenus";

export type TransportationSceneSectionId =
  | "airport-scenes"
  | "public-transport"
  | "taxi-rideshare"
  | "directions-navigation"
  | "car-rental-self-driving"
  | "travel-emergency";

export type TransportationSceneLesson = {
  accent: string;
  icon: ClassicSceneCategoryIcon;
  id: string;
  number: number;
  tile: string;
  title: string;
};

export type TransportationSceneSectionMenu = {
  accent: string;
  id: TransportationSceneSectionId;
  lessons: TransportationSceneLesson[];
  subtitle: string;
  title: string;
};

function lesson(
  number: number,
  title: string,
  icon: ClassicSceneCategoryIcon,
  accent: string,
  tile: string
): TransportationSceneLesson {
  return {
    id: `${number}-${title}`,
    number,
    title,
    icon,
    accent,
    tile,
  };
}

export const transportationSceneSectionMenus: Record<
  TransportationSceneSectionId,
  TransportationSceneSectionMenu
> = {
  "airport-scenes": {
    id: "airport-scenes",
    title: "机场相关场景",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#2a7bd7",
    lessons: [
      lesson(1, "机场导航与值机办理", "airport", "#2a7bd7", "#edf6ff"),
      lesson(2, "机场安检与行李托运", "shield", "#2a7bd7", "#edf6ff"),
      lesson(3, "航班延误或取消处理", "document", "#2a7bd7", "#edf6ff"),
      lesson(4, "机场接机与送机沟通", "car", "#2a7bd7", "#edf6ff"),
      lesson(5, "入境通关与海关问答", "document", "#2a7bd7", "#edf6ff"),
    ],
  },
  "public-transport": {
    id: "public-transport",
    title: "公共交通出行",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#2f8a43",
    lessons: [
      lesson(1, "乘坐地铁与公交", "bus", "#2f8a43", "#eef8ef"),
      lesson(2, "购买交通卡与充值", "wallet", "#2f8a43", "#eef8ef"),
      lesson(3, "地铁转车与路线规划", "map", "#2f8a43", "#eef8ef"),
      lesson(4, "公交车上车与下车沟通", "bus", "#2f8a43", "#eef8ef"),
      lesson(5, "长途巴士与火车购票", "bus", "#2f8a43", "#eef8ef"),
    ],
  },
  "taxi-rideshare": {
    id: "taxi-rideshare",
    title: "打车与网约车",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#f08a12",
    lessons: [
      lesson(1, "使用 Uber/Lyft 叫车", "taxi", "#f08a12", "#fff6df"),
      lesson(2, "与司机沟通目的地和路线", "map", "#f08a12", "#fff6df"),
      lesson(3, "处理打车费用与支付问题", "wallet", "#f08a12", "#fff6df"),
      lesson(4, "取消或修改网约车订单", "clipboard", "#f08a12", "#fff6df"),
      lesson(5, "机场/火车站打车", "airport", "#f08a12", "#fff6df"),
    ],
  },
  "directions-navigation": {
    id: "directions-navigation",
    title: "问路与导航",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#7a5bc8",
    lessons: [
      lesson(1, "在街上向路人问路", "community", "#7a5bc8", "#f5f1ff"),
      lesson(2, "使用手机导航 App 问路", "map", "#7a5bc8", "#f5f1ff"),
      lesson(3, "在商场或公共场所问路", "service", "#7a5bc8", "#f5f1ff"),
      lesson(4, "询问公交 / 地铁线路", "bus", "#7a5bc8", "#f5f1ff"),
      lesson(5, "迷路后的求助沟通", "emergency", "#7a5bc8", "#f5f1ff"),
    ],
  },
  "car-rental-self-driving": {
    id: "car-rental-self-driving",
    title: "租车与自驾出行",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#22999a",
    lessons: [
      lesson(1, "租车公司办理手续", "car", "#22999a", "#ecf9f9"),
      lesson(2, "加油站加油与支付", "service", "#22999a", "#ecf9f9"),
      lesson(3, "停车场停车与缴费", "car", "#22999a", "#ecf9f9"),
      lesson(4, "高速公路行驶与收费站", "wallet", "#22999a", "#ecf9f9"),
      lesson(5, "车辆故障与救援求助", "emergency", "#22999a", "#ecf9f9"),
    ],
  },
  "travel-emergency": {
    id: "travel-emergency",
    title: "交通问题与应急",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#ee4d4d",
    lessons: [
      lesson(1, "处理交通罚单与违规", "emergency", "#ee4d4d", "#fff0ef"),
      lesson(2, "交通事故现场沟通", "car", "#ee4d4d", "#fff0ef"),
      lesson(3, "丢失交通卡或车票处理", "wallet", "#ee4d4d", "#fff0ef"),
      lesson(4, "恶劣天气下的出行安排", "bus", "#ee4d4d", "#fff0ef"),
      lesson(5, "公共交通延误投诉", "service", "#ee4d4d", "#fff0ef"),
    ],
  },
};

export const transportationSceneSectionMenuIds = Object.keys(
  transportationSceneSectionMenus
) as TransportationSceneSectionId[];

export function getTransportationSceneSectionMenu(sectionId: string) {
  return transportationSceneSectionMenus[
    sectionId as TransportationSceneSectionId
  ];
}
