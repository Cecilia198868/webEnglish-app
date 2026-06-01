import { notFound } from "next/navigation";
import ShoppingSceneSectionMenuPage from "@/components/ShoppingSceneSectionMenuPage";
import {
  getTransportationSceneSectionMenu,
  transportationSceneSectionMenuIds,
} from "@/data/transportationSceneSectionMenus";

export function generateStaticParams() {
  return transportationSceneSectionMenuIds.map((sectionId) => ({ sectionId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getTransportationSceneSectionMenu(sectionId);

  if (!section) {
    notFound();
  }

  return (
    <ShoppingSceneSectionMenuPage
      backHref="/classic-scenes/transportation-travel"
      backLabel="返回交通与出行二级菜单"
      section={section}
    />
  );
}
