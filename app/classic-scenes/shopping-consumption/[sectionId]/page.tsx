import { notFound } from "next/navigation";
import ShoppingSceneSectionMenuPage from "@/components/ShoppingSceneSectionMenuPage";
import {
  getShoppingSceneSectionMenu,
  shoppingSceneSectionMenuIds,
} from "@/data/shoppingSceneSectionMenus";

export function generateStaticParams() {
  return shoppingSceneSectionMenuIds.map((sectionId) => ({ sectionId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getShoppingSceneSectionMenu(sectionId);

  if (!section) {
    notFound();
  }

  return <ShoppingSceneSectionMenuPage section={section} />;
}
