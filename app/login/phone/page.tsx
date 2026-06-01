import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import PhoneLoginPageClient from "@/components/PhoneLoginPageClient";
import { getSafeInternalCallbackUrl } from "@/lib/loginRedirect";

type PhoneLoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] | undefined }>;
};

export default async function PhoneLoginPage({
  searchParams,
}: PhoneLoginPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const callbackUrl = getSafeInternalCallbackUrl(params.callbackUrl);

  if (session?.user) {
    redirect(callbackUrl);
  }

  return <PhoneLoginPageClient />;
}
