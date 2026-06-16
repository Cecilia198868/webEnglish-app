import ClassicScenePracticeClient, {
  type ClassicScenePracticeLesson,
  type ClassicScenePracticeMenuCategory,
  type ClassicScenePracticeVariant,
} from "@/components/ClassicScenePracticeClient";
import { educationSceneSectionMenus } from "@/data/educationSceneSectionMenus";
import {
  getFeaturedLessonById,
  type FeaturedLessonRecord,
} from "@/data/featuredCourses";
import { financeGovernmentSections } from "@/data/financeGovernmentSections";
import { healthSceneSectionMenus } from "@/data/healthSceneSectionMenus";
import { housingSceneSectionMenus } from "@/data/housingSceneSectionMenus";
import { getPrebuiltClassicExpressionSet } from "@/data/prebuiltClassicExpressions";
import { restaurantSceneSectionMenus } from "@/data/restaurantSceneSectionMenus";
import { serviceSceneSectionMenus } from "@/data/serviceSceneSectionMenus";
import { shoppingSceneSectionMenus } from "@/data/shoppingSceneSectionMenus";
import { transportationSceneSectionMenus } from "@/data/transportationSceneSectionMenus";
import { parseTrainingContent } from "@/lib/training";

const DEFAULT_LESSON_ID = "bank_open_new_account_zh";
const DEFAULT_SENTENCE_INDEX = 3;

const fallbackVariantLabels: Array<{
  key: ClassicScenePracticeVariant["key"];
  label: string;
}> = [
  { key: "standard", label: "\u63a8\u8350\u8868\u8fbe" },
  { key: "idiomatic", label: "\u66f4\u5730\u9053" },
  { key: "simple", label: "\u66f4\u7b80\u5355" },
  { key: "natural", label: "\u66f4\u81ea\u7136" },
];

type SourceLesson = {
  id?: string;
  number?: number;
  title: string;
};

type SourceSection = {
  id: string;
  lessons: readonly SourceLesson[];
  title: string;
};

const financeSectionTitleOverrides: Record<string, string> = {
  "bank-finance": "\u94f6\u884c\u4e0e\u91d1\u878d\u4ea4\u6613",
  "identity-immigration": "\u8eab\u4efd\u4e0e\u79fb\u6c11\u76f8\u5173",
  "public-services": "\u653f\u5e9c\u798f\u5229\u4e0e\u516c\u5171\u670d\u52a1",
  "driver-vehicle": "\u9a7e\u7167\u4e0e\u8f66\u8f86\u7ba1\u7406",
  "insurance-consulting": "\u4fdd\u9669\u54a8\u8be2",
  "insurance-traffic-safety": "\u4ea4\u901a\u5b89\u5168",
  "tax-government-forms": "\u7a0e\u52a1\u4e0e\u653f\u5e9c\u8868\u683c",
  "all-finance": "\u91d1\u878d\u4e0e\u884c\u653f\u5168\u90e8\u8bfe\u7a0b",
};

const sectionTitleOverrides: Record<string, string> = {
  ...financeSectionTitleOverrides,
  "basic-shopping": "\u57fa\u7840\u8d2d\u7269\u573a\u666f",
  "payment-checkout": "\u652f\u4ed8\u4e0e\u7ed3\u8d26",
  "returns-after-sale": "\u9000\u6362\u8d27\u4e0e\u552e\u540e",
  "bargain-promotion": "\u8ba8\u4ef7\u8fd8\u4ef7\u4e0e\u4fc3\u9500",
  "special-shopping": "\u7279\u6b8a\u6d88\u8d39\u573a\u666f",
  "daily-bill-management": "\u65e5\u5e38\u6d88\u8d39\u4e0e\u8d26\u5355\u7ba1\u7406",
  "basic-ordering": "\u57fa\u7840\u70b9\u9910\u573a\u666f",
  "restaurant-dining": "\u9910\u5385\u5c31\u9910\u6c9f\u901a",
  "takeout-delivery": "\u5916\u5356\u76f8\u5173\u573a\u666f",
  "special-dining": "\u7279\u6b8a\u9910\u996e\u573a\u666f",
  "restaurant-payment-after-sale": "\u9910\u996e\u652f\u4ed8\u4e0e\u552e\u540e",
  "restaurant-reservation-group": "\u9910\u996e\u9884\u7ea6\u4e0e\u56e2\u4f53\u7528\u9910",
  "airport-scenes": "\u673a\u573a\u76f8\u5173\u573a\u666f",
  "public-transport": "\u516c\u5171\u4ea4\u901a\u51fa\u884c",
  "taxi-rideshare": "\u6253\u8f66\u4e0e\u7f51\u7ea6\u8f66",
  "directions-navigation": "\u95ee\u8def\u4e0e\u5bfc\u822a",
  "car-rental-self-driving": "\u79df\u8f66\u4e0e\u81ea\u9a7e\u51fa\u884c",
  "travel-emergency": "\u4ea4\u901a\u95ee\u9898\u4e0e\u5e94\u6025",
  "hotel-stay": "\u9152\u5e97\u4f4f\u5bbf\u573a\u666f",
  "rent-viewing": "\u79df\u623f\u4e0e\u770b\u623f",
  "daily-home-life": "\u65e5\u5e38\u5bb6\u5c45\u751f\u6d3b",
  "housing-problems": "\u4f4f\u623f\u95ee\u9898\u5904\u7406",
  "home-supplies-shopping": "\u5bb6\u5c45\u7528\u54c1\u91c7\u8d2d",
  "long-term-housing": "\u957f\u671f\u4f4f\u623f\u89c4\u5212",
  "first-visit": "\u9996\u6b21\u5c31\u533b",
  "pharmacy-medicine": "\u836f\u5e97\u4e0e\u7528\u836f",
  "checkup-prevention": "\u4f53\u68c0\u4e0e\u9884\u9632",
  "medical-insurance": "\u533b\u7597\u4fdd\u9669",
  "medical-emergency": "\u533b\u7597\u6025\u75c7",
  "health-followup": "\u590d\u8bca\u4e0e\u5065\u5eb7\u7ba1\u7406",
  "delivery-logistics": "\u5feb\u9012\u4e0e\u7269\u6d41",
  "after-sale-return": "\u552e\u540e\u4e0e\u9000\u6362",
  "home-appliance-repair": "\u5bb6\u7535\u4e0e\u5c45\u5bb6\u7ef4\u4fee",
  "beauty-hair-service": "\u7f8e\u5bb9\u7f8e\u53d1\u670d\u52a1",
  "electronics-repair": "\u7535\u5b50\u4ea7\u54c1\u7ef4\u4fee",
  "professional-services": "\u4e13\u4e1a\u670d\u52a1",
  "school-campus": "\u5b66\u6821\u4e0e\u6821\u56ed\u751f\u6d3b",
  "job-interview": "\u6c42\u804c\u4e0e\u9762\u8bd5",
  "workplace-communication": "\u5de5\u4f5c\u6c9f\u901a",
  "social-relationship": "\u793e\u4ea4\u4e0e\u4eba\u9645\u5173\u7cfb",
  "career-growth": "\u804c\u573a\u6210\u957f",
  "community-integration": "\u793e\u533a\u878d\u5165",
};

const menuSources: Array<{
  description: string;
  id: string;
  sections: Record<string, SourceSection>;
  title: string;
}> = [
  {
    id: "finance-government",
    title: "\u91d1\u878d\u4e0e\u884c\u653f\u4e8b\u52a1",
    description: "\u94f6\u884c\u3001\u652f\u4ed8\u3001\u7a0e\u52a1\u3001\u7b7e\u8bc1\u7b49\u573a\u666f",
    sections: financeGovernmentSections,
  },
  {
    id: "shopping-consumption",
    title: "\u8d2d\u7269\u4e0e\u6d88\u8d39",
    description: "\u8d2d\u7269\u3001\u9000\u6362\u3001\u652f\u4ed8\u3001\u8ba8\u4ef7\u8fd8\u4ef7",
    sections: shoppingSceneSectionMenus,
  },
  {
    id: "restaurant-takeout",
    title: "\u9910\u996e\u4e0e\u5916\u5356",
    description: "\u70b9\u9910\u3001\u5916\u5356\u3001\u5496\u5561\u3001\u9910\u5385\u6c9f\u901a",
    sections: restaurantSceneSectionMenus,
  },
  {
    id: "transportation-travel",
    title: "\u4ea4\u901a\u4e0e\u51fa\u884c",
    description: "\u673a\u573a\u3001\u5730\u94c1\u3001\u6253\u8f66\u3001\u95ee\u8def",
    sections: transportationSceneSectionMenus,
  },
  {
    id: "housing-home",
    title: "\u4f4f\u5bbf\u4e0e\u5bb6\u5c45",
    description: "\u9152\u5e97\u5165\u4f4f\u3001\u79df\u623f\u3001\u5bb6\u5c45\u751f\u6d3b",
    sections: housingSceneSectionMenus,
  },
  {
    id: "health-medical",
    title: "\u5065\u5eb7\u4e0e\u533b\u7597",
    description: "\u770b\u75c5\u3001\u4e70\u836f\u3001\u4f53\u68c0\u3001\u5065\u5eb7\u54a8\u8be2",
    sections: healthSceneSectionMenus,
  },
  {
    id: "service-repair",
    title: "\u670d\u52a1\u4e0e\u7ef4\u4fee",
    description: "\u5feb\u9012\u3001\u552e\u540e\u3001\u7ef4\u4fee\u3001\u7f8e\u5bb9\u7f8e\u53d1",
    sections: serviceSceneSectionMenus,
  },
  {
    id: "education-work-social",
    title: "\u6559\u80b2\u3001\u5de5\u4f5c\u4e0e\u793e\u4ea4\u751f\u6d3b",
    description: "\u5de5\u4f5c\u6c9f\u901a\u3001\u9762\u8bd5\u3001\u793e\u4ea4\u3001\u5b66\u6821\u751f\u6d3b",
    sections: educationSceneSectionMenus,
  },
];

function createFallbackVariants(english: string): ClassicScenePracticeVariant[] {
  return fallbackVariantLabels.map(({ key, label }) => ({
    key,
    label,
    text: english,
  }));
}

function createLessonData(lesson: FeaturedLessonRecord): ClassicScenePracticeLesson {
  const sentencePairs = parseTrainingContent(lesson.txt_content || "");
  const turns = sentencePairs.map((pair, sentenceIndex) => {
    const prebuiltSet = getPrebuiltClassicExpressionSet(
      lesson.id,
      sentenceIndex
    );
    const standardEnglish =
      prebuiltSet?.standardEnglish || pair.english || "";

    return {
      chinese: pair.chinese,
      standardEnglish,
      variants: prebuiltSet?.variants.length
        ? prebuiltSet.variants
        : createFallbackVariants(standardEnglish),
    };
  });

  return {
    id: lesson.id,
    continueHref: `/study/${lesson.id}`,
    initialIndex: Math.min(DEFAULT_SENTENCE_INDEX, Math.max(turns.length - 1, 0)),
    sectionTitle: "\u91d1\u878d\u4e0e\u884c\u653f\u4e8b\u52a1 > \u94f6\u884c\u4e0e\u91d1\u878d\u4ea4\u6613",
    title: lesson.title,
    turns,
  };
}

function getLessonTitle(lesson: SourceLesson) {
  if (!lesson.id) return lesson.title;
  return getFeaturedLessonById(lesson.id)?.title || lesson.title;
}

function getLessonSentenceCount(lessonId?: string) {
  if (!lessonId) return 0;

  const lesson = getFeaturedLessonById(lessonId);
  if (!lesson) return 0;

  return parseTrainingContent(lesson.txt_content || "").length;
}

function createMenuCategories(): ClassicScenePracticeMenuCategory[] {
  return menuSources.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    sections: Object.values(category.sections).map((section) => ({
      id: section.id,
      title: sectionTitleOverrides[section.id] || section.title,
      lessons: section.lessons
        .filter((lesson) => Boolean(lesson.id))
        .map((lesson, index) => ({
          href: `/study/${lesson.id}`,
          id: lesson.id || `${section.id}-${index}`,
          number: lesson.number || index + 1,
          sentenceCount: getLessonSentenceCount(lesson.id),
          title: getLessonTitle(lesson),
        })),
    })),
  }));
}

export default function ClassicScenePracticeWebPage() {
  const defaultLesson = getFeaturedLessonById(DEFAULT_LESSON_ID);

  if (!defaultLesson) {
    throw new Error(`Missing classic scene lesson: ${DEFAULT_LESSON_ID}`);
  }

  return (
    <ClassicScenePracticeClient
      lesson={createLessonData(defaultLesson)}
      menuCategories={createMenuCategories()}
    />
  );
}
