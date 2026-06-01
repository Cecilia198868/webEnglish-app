import type { ClassicSceneCategoryIcon } from "./classicSceneCategoryMenus";

export type ShoppingSceneSectionId =
  | "basic-shopping"
  | "payment-checkout"
  | "returns-after-sale"
  | "bargain-promotion"
  | "special-shopping"
  | "daily-bill-management";

export type ShoppingSceneLesson = {
  accent: string;
  icon: ClassicSceneCategoryIcon;
  id: string;
  number: number;
  tile: string;
  title: string;
};

export type ShoppingSceneSectionMenu = {
  accent: string;
  id: ShoppingSceneSectionId;
  lessons: ShoppingSceneLesson[];
  subtitle: string;
  title: string;
};

function lesson(
  number: number,
  title: string,
  icon: ClassicSceneCategoryIcon,
  accent: string,
  tile: string
): ShoppingSceneLesson {
  return {
    id: `${number}-${title}`,
    number,
    title,
    icon,
    accent,
    tile,
  };
}

export const shoppingSceneSectionMenus: Record<
  ShoppingSceneSectionId,
  ShoppingSceneSectionMenu
> = {
  "basic-shopping": {
    id: "basic-shopping",
    title: "基础购物场景",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#2f6a39",
    lessons: [
      lesson(1, "在超市购物", "cart", "#6aa14e", "#eef8e9"),
      lesson(2, "在商场购买衣服和日用品", "bag", "#6aa14e", "#eef8e9"),
      lesson(3, "在药店购买药品和个人护理品", "medicine", "#6aa14e", "#eef8e9"),
      lesson(4, "购买电子产品", "repair", "#6aa14e", "#eef8e9"),
      lesson(5, "在线购物平台下单", "cart", "#6aa14e", "#eef8e9"),
    ],
  },
  "payment-checkout": {
    id: "payment-checkout",
    title: "支付与结账",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#f5821f",
    lessons: [
      lesson(1, "超市结账与支付方式", "cart", "#f5821f", "#fff2df"),
      lesson(2, "使用信用卡或借记卡付款", "wallet", "#f5821f", "#fff2df"),
      lesson(3, "使用移动支付（Apple Pay / Google Pay）", "repair", "#f5821f", "#fff2df"),
      lesson(4, "处理收银员找零问题", "wallet", "#f5821f", "#fff2df"),
      lesson(5, "分期付款咨询", "calendar", "#f5821f", "#fff2df"),
    ],
  },
  "returns-after-sale": {
    id: "returns-after-sale",
    title: "退换货与售后",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#7851c8",
    lessons: [
      lesson(1, "退货和退款流程", "return", "#7851c8", "#f5efff"),
      lesson(2, "换货原因说明", "document", "#7851c8", "#f5efff"),
      lesson(3, "处理有缺陷商品", "return", "#7851c8", "#f5efff"),
      lesson(4, "申请退款时与客服沟通", "service", "#7851c8", "#f5efff"),
      lesson(5, "延长保修服务咨询", "shield", "#7851c8", "#f5efff"),
    ],
  },
  "bargain-promotion": {
    id: "bargain-promotion",
    title: "讨价还价与促销",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#f0527c",
    lessons: [
      lesson(1, "在跳蚤市场或二手店讨价还价", "sale", "#f0527c", "#fff0f5"),
      lesson(2, "申请优惠券和折扣", "bill", "#f0527c", "#fff0f5"),
      lesson(3, "黑色星期五与促销季购物", "bag", "#f0527c", "#fff0f5"),
      lesson(4, "比较不同商店价格", "chart", "#f0527c", "#fff0f5"),
      lesson(5, "会员卡办理与使用", "document", "#f0527c", "#fff0f5"),
    ],
  },
  "special-shopping": {
    id: "special-shopping",
    title: "特殊消费场景",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#48ad9d",
    lessons: [
      lesson(1, "购买家具和家居用品", "home", "#48ad9d", "#ecf9f6"),
      lesson(2, "在加油站加油与支付", "service", "#48ad9d", "#ecf9f6"),
      lesson(3, "购买二手车或租车", "car", "#48ad9d", "#ecf9f6"),
      lesson(4, "订阅服务（Netflix、Gym等）取消", "document", "#48ad9d", "#ecf9f6"),
      lesson(5, "处理账单纠纷", "bill", "#48ad9d", "#ecf9f6"),
    ],
  },
  "daily-bill-management": {
    id: "daily-bill-management",
    title: "日常消费与账单管理",
    subtitle: "选择一个具体场景，开始你的口语练习之旅吧！",
    accent: "#3f7cdd",
    lessons: [
      lesson(1, "处理水电费、网费等账单支付", "bill", "#3f7cdd", "#eef6ff"),
      lesson(2, "质疑或纠正错误账单", "document", "#3f7cdd", "#eef6ff"),
      lesson(3, "取消重复订阅服务", "wallet", "#3f7cdd", "#eef6ff"),
      lesson(4, "申请账单分期付款", "calendar", "#3f7cdd", "#eef6ff"),
      lesson(5, "比较不同运营商的价格和服务", "chart", "#3f7cdd", "#eef6ff"),
    ],
  },
};

export const shoppingSceneSectionMenuIds = Object.keys(
  shoppingSceneSectionMenus
) as ShoppingSceneSectionId[];

export function getShoppingSceneSectionMenu(sectionId: string) {
  return shoppingSceneSectionMenus[sectionId as ShoppingSceneSectionId];
}
