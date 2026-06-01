import { notFound } from "next/navigation";
import ShoppingSceneSectionMenuPage from "@/components/ShoppingSceneSectionMenuPage";
import {
  getRestaurantSceneSectionMenu,
  restaurantSceneSectionMenuIds,
} from "@/data/restaurantSceneSectionMenus";

export function generateStaticParams() {
  return restaurantSceneSectionMenuIds.map((sectionId) => ({ sectionId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getRestaurantSceneSectionMenu(sectionId);

  if (!section) {
    notFound();
  }

  return (
    <ShoppingSceneSectionMenuPage
      backHref="/classic-scenes/restaurant-takeout"
      backLabel="返回餐饮与外卖二级菜单"
      section={section}
    />
  );
}
