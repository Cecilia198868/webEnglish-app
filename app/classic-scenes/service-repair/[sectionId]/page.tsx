import { notFound } from "next/navigation";
import ShoppingSceneSectionMenuPage from "@/components/ShoppingSceneSectionMenuPage";
import {
  getServiceSceneSectionMenu,
  serviceSceneSectionMenuIds,
} from "@/data/serviceSceneSectionMenus";

export function generateStaticParams() {
  return serviceSceneSectionMenuIds.map((sectionId) => ({ sectionId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getServiceSceneSectionMenu(sectionId);

  if (!section) {
    notFound();
  }

  return (
    <ShoppingSceneSectionMenuPage
      backHref="/classic-scenes/service-repair"
      backLabel="返回服务与维修二级菜单"
      section={section}
    />
  );
}
