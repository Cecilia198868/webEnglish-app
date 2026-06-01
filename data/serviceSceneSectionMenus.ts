import type { ClassicSceneCategoryIcon } from "./classicSceneCategoryMenus";

export type ServiceSceneSectionId =
  | "delivery-logistics"
  | "after-sale-return"
  | "home-appliance-repair"
  | "beauty-hair-service"
  | "electronics-repair"
  | "professional-services";

export type ServiceSceneLesson = {
  accent: string;
  description: string;
  icon: ClassicSceneCategoryIcon;
  id: string;
  number: number;
  tile: string;
  title: string;
};

export type ServiceSceneSectionMenu = {
  accent: string;
  id: ServiceSceneSectionId;
  lessons: ServiceSceneLesson[];
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
): ServiceSceneLesson {
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

export const serviceSceneSectionMenus: Record<
  ServiceSceneSectionId,
  ServiceSceneSectionMenu
> = {
  "delivery-logistics": {
    accent: "#ee7a14",
    id: "delivery-logistics",
    subtitle,
    title: "快递与物流服务",
    lessons: [
      lesson(
        1,
        "寄送包裹与填写快递单",
        "了解寄件流程，正确填写快递单信息",
        "delivery",
        "#ee7a14",
        "#fff4df"
      ),
      lesson(
        2,
        "接收快递与签收问题",
        "处理签收方式、代收及签收异常等问题",
        "clipboard",
        "#ee7a14",
        "#fff4df"
      ),
      lesson(
        3,
        "处理快递丢失或损坏投诉",
        "了解投诉流程，维护自身权益",
        "document",
        "#ee7a14",
        "#fff4df"
      ),
      lesson(
        4,
        "查询物流信息与延误处理",
        "查询物流状态，解决延误问题",
        "delivery",
        "#ee7a14",
        "#fff4df"
      ),
      lesson(
        5,
        "国际快递申报与费用咨询",
        "了解海关申报要求及运费计算",
        "plane",
        "#ee7a14",
        "#fff4df"
      ),
    ],
  },
  "after-sale-return": {
    accent: "#2d7bd1",
    id: "after-sale-return",
    subtitle,
    title: "售后服务与退换",
    lessons: [
      lesson(
        1,
        "联系客服申请售后服务",
        "了解如何联系客服，申请售后支持",
        "service",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        2,
        "处理商品质量问题投诉",
        "描述问题，提出投诉并寻求解决方案",
        "document",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        3,
        "申请退款或换货流程",
        "了解退款或换货的步骤和注意事项",
        "return",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        4,
        "延长保修服务咨询",
        "咨询延保服务，了解费用与条款",
        "shield",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        5,
        "处理售后服务拖延问题",
        "催促处理进度，解决拖延问题",
        "calendar",
        "#2d7bd1",
        "#edf6ff"
      ),
    ],
  },
  "home-appliance-repair": {
    accent: "#9a5ad1",
    id: "home-appliance-repair",
    subtitle,
    title: "家居与家电维修",
    lessons: [
      lesson(
        1,
        "报修水电、空调、管道故障",
        "描述故障现象，申请维修服务",
        "tools",
        "#9a5ad1",
        "#f7f0ff"
      ),
      lesson(
        2,
        "预约家具或家电安装服务",
        "预约安装时间，确认服务内容",
        "home",
        "#9a5ad1",
        "#f7f0ff"
      ),
      lesson(
        3,
        "处理房屋漏水或电路问题",
        "描述问题情况，寻求解决方案",
        "emergency",
        "#9a5ad1",
        "#f7f0ff"
      ),
      lesson(
        4,
        "联系物业或专业维修工人",
        "获取联系方式，安排上门维修",
        "service",
        "#9a5ad1",
        "#f7f0ff"
      ),
      lesson(
        5,
        "维修费用协商与报价",
        "了解费用明细，协商合理价格",
        "wallet",
        "#9a5ad1",
        "#f7f0ff"
      ),
    ],
  },
  "beauty-hair-service": {
    accent: "#e84e78",
    id: "beauty-hair-service",
    subtitle,
    title: "美容美发服务",
    lessons: [
      lesson(
        1,
        "预约理发或美发服务",
        "通过电话、网站或到店预约合适的时间",
        "calendar",
        "#e84e78",
        "#fff0f4"
      ),
      lesson(
        2,
        "与美发师沟通发型和颜色要求",
        "清楚表达期望，确认发型和颜色效果",
        "scissors",
        "#e84e78",
        "#fff0f4"
      ),
      lesson(
        3,
        "染发、烫发、护理咨询",
        "了解项目流程、效果、注意事项和护理建议",
        "service",
        "#e84e78",
        "#fff0f4"
      ),
      lesson(
        4,
        "美容院项目预约与沟通",
        "咨询项目详情、价格和时长，预约服务",
        "health",
        "#e84e78",
        "#fff0f4"
      ),
      lesson(
        5,
        "处理美发服务不满意投诉",
        "表达不满意原因，寻求解决方案或补救措施",
        "document",
        "#e84e78",
        "#fff0f4"
      ),
    ],
  },
  "electronics-repair": {
    accent: "#2d7bd1",
    id: "electronics-repair",
    subtitle,
    title: "电子产品与日常维修",
    lessons: [
      lesson(
        1,
        "手机、电脑维修咨询",
        "描述故障现象，咨询维修方案和费用",
        "repair",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        2,
        "购买维修服务与报价",
        "了解维修服务内容，比较价格并下单",
        "document",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        3,
        "处理维修延误或维修质量问题",
        "投诉延误或质量问题，寻求解决方案",
        "calendar",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        4,
        "眼镜、鞋子、包包维修",
        "咨询维修项目、费用和所需时间",
        "tools",
        "#2d7bd1",
        "#edf6ff"
      ),
      lesson(
        5,
        "自行车或小家电维修",
        "描述问题，咨询维修方法或上门服务",
        "repair",
        "#2d7bd1",
        "#edf6ff"
      ),
    ],
  },
  "professional-services": {
    accent: "#4b9a3e",
    id: "professional-services",
    subtitle,
    title: "其他专业服务",
    lessons: [
      lesson(
        1,
        "预约家政清洁服务",
        "预约清洁时间、选择服务项目和了解价格",
        "home",
        "#4b9a3e",
        "#f0f8ed"
      ),
      lesson(
        2,
        "搬家与运输服务咨询",
        "咨询搬家服务、费用、时间安排等问题",
        "delivery",
        "#4b9a3e",
        "#f0f8ed"
      ),
      lesson(
        3,
        "宠物美容与寄养服务",
        "预约美容或寄养服务，了解注意事项",
        "health",
        "#4b9a3e",
        "#f0f8ed"
      ),
      lesson(
        4,
        "翻译、中介或法律咨询服务",
        "咨询相关服务内容、费用和流程",
        "service",
        "#4b9a3e",
        "#f0f8ed"
      ),
      lesson(
        5,
        "处理服务纠纷与正式投诉",
        "描述问题，寻求解决方案或进行投诉",
        "document",
        "#4b9a3e",
        "#f0f8ed"
      ),
    ],
  },
};

export const serviceSceneSectionMenuIds = Object.keys(
  serviceSceneSectionMenus
) as ServiceSceneSectionId[];

export function getServiceSceneSectionMenu(sectionId: string) {
  return serviceSceneSectionMenus[sectionId as ServiceSceneSectionId];
}
