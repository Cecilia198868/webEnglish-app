import type { ClassicSceneCategoryIcon } from "./classicSceneCategoryMenus";

export type RestaurantSceneSectionId =
  | "basic-ordering"
  | "restaurant-dining"
  | "takeout-delivery"
  | "special-dining"
  | "restaurant-payment-after-sale"
  | "restaurant-reservation-group";

export type RestaurantSceneLesson = {
  accent: string;
  icon: ClassicSceneCategoryIcon;
  id: string;
  number: number;
  tile: string;
  title: string;
};

export type RestaurantSceneSectionMenu = {
  accent: string;
  id: RestaurantSceneSectionId;
  lessons: RestaurantSceneLesson[];
  subtitle: string;
  title: string;
};

function lesson(
  number: number,
  title: string,
  icon: ClassicSceneCategoryIcon,
  accent: string,
  tile: string
): RestaurantSceneLesson {
  return {
    id: `${number}-${title}`,
    number,
    title,
    icon,
    accent,
    tile,
  };
}

export const restaurantSceneSectionMenus: Record<
  RestaurantSceneSectionId,
  RestaurantSceneSectionMenu
> = {
  "basic-ordering": {
    id: "basic-ordering",
    title: "基础点餐场景",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#f05b22",
    lessons: [
      lesson(1, "在快餐店点餐", "food", "#f05b22", "#fff1e8"),
      lesson(2, "在咖啡店点饮品和甜点", "food", "#f05b22", "#fff1e8"),
      lesson(3, "在中餐厅点菜", "menu", "#f05b22", "#fff1e8"),
      lesson(4, "在西餐厅点餐", "food", "#f05b22", "#fff1e8"),
      lesson(5, "点外卖（手机App订餐）", "delivery", "#f05b22", "#fff1e8"),
    ],
  },
  "restaurant-dining": {
    id: "restaurant-dining",
    title: "餐厅就餐沟通",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#368f43",
    lessons: [
      lesson(1, "餐厅订位与等位", "calendar", "#368f43", "#eff8ec"),
      lesson(2, "与服务员沟通菜单和特殊要求", "menu", "#368f43", "#eff8ec"),
      lesson(3, "处理点错菜或上错菜", "food", "#368f43", "#eff8ec"),
      lesson(4, "询问餐厅政策（如打包、加水）", "service", "#368f43", "#eff8ec"),
      lesson(5, "在自助餐厅用餐沟通", "food", "#368f43", "#eff8ec"),
    ],
  },
  "takeout-delivery": {
    id: "takeout-delivery",
    title: "外卖相关场景",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#2b76c8",
    lessons: [
      lesson(1, "使用外卖App下单", "delivery", "#2b76c8", "#eef7ff"),
      lesson(2, "外卖到达后的沟通", "delivery", "#2b76c8", "#eef7ff"),
      lesson(3, "处理外卖漏送或错误订单", "emergency", "#2b76c8", "#eef7ff"),
      lesson(4, "取消或修改外卖订单", "clipboard", "#2b76c8", "#eef7ff"),
      lesson(5, "给外卖骑手评价和留言", "community", "#2b76c8", "#eef7ff"),
    ],
  },
  "special-dining": {
    id: "special-dining",
    title: "特殊餐饮场景",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#8158d0",
    lessons: [
      lesson(1, "参加朋友聚餐点餐", "community", "#8158d0", "#f7f0ff"),
      lesson(2, "在酒吧或咖啡馆点单", "wallet", "#8158d0", "#f7f0ff"),
      lesson(3, "点早餐和健康餐", "health", "#8158d0", "#f7f0ff"),
      lesson(4, "素食/过敏饮食特殊要求", "shield", "#8158d0", "#f7f0ff"),
      lesson(5, "庆祝场合点餐（生日、节日）", "calendar", "#8158d0", "#f7f0ff"),
    ],
  },
  "restaurant-payment-after-sale": {
    id: "restaurant-payment-after-sale",
    title: "餐饮支付与售后",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#f08a12",
    lessons: [
      lesson(1, "餐厅结账与支付方式", "wallet", "#f08a12", "#fff5e2"),
      lesson(2, "处理账单错误", "bill", "#f08a12", "#fff5e2"),
      lesson(3, "申请打包和剩菜处理", "food", "#f08a12", "#fff5e2"),
      lesson(4, "餐厅投诉与反馈", "document", "#f08a12", "#fff5e2"),
      lesson(5, "使用优惠券和餐厅优惠", "sale", "#f08a12", "#fff5e2"),
    ],
  },
  "restaurant-reservation-group": {
    id: "restaurant-reservation-group",
    title: "餐饮预约与团体用餐",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#e74676",
    lessons: [
      lesson(1, "餐厅订位与确认预约", "calendar", "#e74676", "#fff0f4"),
      lesson(2, "大型聚餐点餐沟通", "community", "#e74676", "#fff0f4"),
      lesson(3, "生日聚会或庆祝活动点餐", "calendar", "#e74676", "#fff0f4"),
      lesson(4, "处理团体账单分摊", "wallet", "#e74676", "#fff0f4"),
      lesson(5, "取消或修改餐厅预约", "calendar", "#e74676", "#fff0f4"),
    ],
  },
};

export const restaurantSceneSectionMenuIds = Object.keys(
  restaurantSceneSectionMenus
) as RestaurantSceneSectionId[];

export function getRestaurantSceneSectionMenu(sectionId: string) {
  return restaurantSceneSectionMenus[sectionId as RestaurantSceneSectionId];
}
