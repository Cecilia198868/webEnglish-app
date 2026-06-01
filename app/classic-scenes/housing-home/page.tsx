import ClassicSceneCategoryMenuPage from "@/components/ClassicSceneCategoryMenuPage";
import { getClassicSceneCategoryMenu } from "@/data/classicSceneCategoryMenus";

export default function Page() {
  const menu = getClassicSceneCategoryMenu("housing-home");

  return <ClassicSceneCategoryMenuPage menu={menu} />;
}
