import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import SubscriptionPageClient from "./SubscriptionPageClient";

type SubscriptionPageProps = {
  searchParams?: Promise<{ checkout?: string | string[] | undefined }>;
};

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = {
  title: "会员版 | SpeakFlow",
  description: "开通 SpeakFlow Pro，解锁完整 AI 英语口语练习体验。",
};

export default async function SubscriptionPage({
  searchParams,
}: SubscriptionPageProps) {
  const session = await getServerSession(authOptions);
  const params = searchParams ? await searchParams : {};

  return (
    <SubscriptionPageClient
      checkoutStatus={getStringParam(params.checkout) || ""}
      isSignedIn={Boolean(session?.user)}
      userEmail={session?.user?.email || ""}
    />
  );
}
