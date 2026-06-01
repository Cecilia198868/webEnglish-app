import { notFound } from "next/navigation";
import ShoppingSceneSectionMenuPage from "@/components/ShoppingSceneSectionMenuPage";
import {
  getHousingSceneSectionMenu,
  housingSceneSectionMenuIds,
} from "@/data/housingSceneSectionMenus";

export function generateStaticParams() {
  return housingSceneSectionMenuIds.map((sectionId) => ({ sectionId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getHousingSceneSectionMenu(sectionId);

  if (!section) {
    notFound();
  }

  return (
    <ShoppingSceneSectionMenuPage
      backHref="/classic-scenes/housing-home"
      backLabel="返回住宿与家居二级菜单"
      section={section}
    />
  );
}
