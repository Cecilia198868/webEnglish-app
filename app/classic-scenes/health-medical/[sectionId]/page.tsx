import { notFound } from "next/navigation";
import ShoppingSceneSectionMenuPage from "@/components/ShoppingSceneSectionMenuPage";
import {
  getHealthSceneSectionMenu,
  healthSceneSectionMenuIds,
} from "@/data/healthSceneSectionMenus";

export function generateStaticParams() {
  return healthSceneSectionMenuIds.map((sectionId) => ({ sectionId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getHealthSceneSectionMenu(sectionId);

  if (!section) {
    notFound();
  }

  return (
    <ShoppingSceneSectionMenuPage
      backHref="/classic-scenes/health-medical"
      backLabel="返回健康与医疗二级菜单"
      section={section}
    />
  );
}
