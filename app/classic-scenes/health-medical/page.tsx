import ClassicSceneCategoryMenuPage from "@/components/ClassicSceneCategoryMenuPage";
import { getClassicSceneCategoryMenu } from "@/data/classicSceneCategoryMenus";

export default function Page() {
  const menu = getClassicSceneCategoryMenu("health-medical");

  return <ClassicSceneCategoryMenuPage menu={menu} />;
}
