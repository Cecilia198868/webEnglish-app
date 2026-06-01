import { notFound } from "next/navigation";
import ClassicSceneCategoryMenuPage from "@/components/ClassicSceneCategoryMenuPage";
import {
  classicSceneCategoryMenuIds,
  getClassicSceneCategoryMenu,
} from "@/data/classicSceneCategoryMenus";

export function generateStaticParams() {
  return classicSceneCategoryMenuIds
    .filter(
      (categoryId) =>
        categoryId !== "shopping-consumption" &&
        categoryId !== "restaurant-takeout" &&
        categoryId !== "transportation-travel" &&
        categoryId !== "housing-home" &&
        categoryId !== "health-medical" &&
        categoryId !== "service-repair" &&
        categoryId !== "education-work-social"
    )
    .map((categoryId) => ({ categoryId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const menu = getClassicSceneCategoryMenu(categoryId);

  if (!menu) {
    notFound();
  }

  return <ClassicSceneCategoryMenuPage menu={menu} />;
}
