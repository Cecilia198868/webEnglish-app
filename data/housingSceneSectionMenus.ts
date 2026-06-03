import type { ClassicSceneCategoryIcon } from "./classicSceneCategoryMenus";
import { housingSceneCourseSections } from "./housingSceneCourses";

export type HousingSceneSectionId =
  | "hotel-stay"
  | "rent-viewing"
  | "daily-home-life"
  | "housing-problems"
  | "home-supplies-shopping"
  | "long-term-housing";

export type HousingSceneLesson = {
  accent: string;
  description?: string;
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

function courseSectionMenu(
  section: (typeof housingSceneCourseSections)[keyof typeof housingSceneCourseSections]
): HousingSceneSectionMenu {
  return {
    accent: section.accent,
    id: section.id,
    lessons: section.lessons.map(
      ({ accent, description, icon, id, number, tile, title }) => ({
        accent,
        description,
        icon,
        id,
        number,
        tile,
        title,
      })
    ),
    subtitle: section.subtitle,
    title: section.title,
  };
}

export const housingSceneSectionMenus: Record<
  HousingSceneSectionId,
  HousingSceneSectionMenu
> = {
  "hotel-stay": {
    ...courseSectionMenu(housingSceneCourseSections["hotel-stay"]),
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
    ...courseSectionMenu(housingSceneCourseSections["daily-home-life"]),
  },
  "housing-problems": {
    ...courseSectionMenu(housingSceneCourseSections["housing-problems"]),
  },
  "home-supplies-shopping": {
    ...courseSectionMenu(housingSceneCourseSections["home-supplies-shopping"]),
  },
  "long-term-housing": {
    ...courseSectionMenu(housingSceneCourseSections["long-term-housing"]),
  },
};

export const housingSceneSectionMenuIds = Object.keys(
  housingSceneSectionMenus
) as HousingSceneSectionId[];

export function getHousingSceneSectionMenu(sectionId: string) {
  return housingSceneSectionMenus[sectionId as HousingSceneSectionId];
}
