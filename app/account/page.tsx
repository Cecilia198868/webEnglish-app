import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import AccountPageClient from "@/components/AccountPageClient";
import { DEFAULT_ADMIN_EMAIL, normalizeUserEmail } from "@/lib/userRoles";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const userEmail = session.user.email || "";
  const isAdmin = normalizeUserEmail(userEmail) === DEFAULT_ADMIN_EMAIL;

  return (
    <AccountPageClient
      isAdmin={isAdmin}
      userEmail={userEmail}
      userImage={session.user.image || ""}
      userName={session.user.name || ""}
    />
  );
}
