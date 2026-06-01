import { notFound } from "next/navigation";

import ShoppingSceneSectionMenuPage from "@/components/ShoppingSceneSectionMenuPage";
import {
  educationSceneSectionMenuIds,
  getEducationSceneSectionMenu,
} from "@/data/educationSceneSectionMenus";

export function generateStaticParams() {
  return educationSceneSectionMenuIds.map((sectionId) => ({ sectionId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getEducationSceneSectionMenu(sectionId);

  if (!section) {
    notFound();
  }

  return (
    <ShoppingSceneSectionMenuPage
      backHref="/classic-scenes/education-work-social"
      backLabel="返回教育、工作与社交生活二级菜单"
      section={section}
    />
  );
}
