import ClassicSceneCategoryMenuPage from "@/components/ClassicSceneCategoryMenuPage";
import { getClassicSceneCategoryMenu } from "@/data/classicSceneCategoryMenus";

export default function Page() {
  const menu = getClassicSceneCategoryMenu("transportation-travel");

  return <ClassicSceneCategoryMenuPage menu={menu} />;
}
