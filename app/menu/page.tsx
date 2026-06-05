import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import GuestMenuPage, { type GuestMenuPanel } from "@/components/GuestMenuPage";

type MenuPageProps = {
  searchParams?: Promise<{ panel?: string | string[] | undefined }>;
};

function getGuestMenuPanel(panel: string | string[] | undefined): GuestMenuPanel | null {
  const value = Array.isArray(panel) ? panel[0] : panel;
  return value === "help" || value === "about" ? value : null;
}

export default async function Page({ searchParams }: MenuPageProps) {
  const session = await getServerSession(authOptions);
  const params = searchParams ? await searchParams : {};

  if (session?.user) {
    redirect("/start");
  }

  return <GuestMenuPage activePanel={getGuestMenuPanel(params.panel)} />;
}
