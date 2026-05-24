import { authOptions } from "@/auth";
import { findProfileByEmail } from "@/lib/userStore";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await findProfileByEmail(email);

  return NextResponse.json(
    {
      cancelAtPeriodEnd: profile?.cancelAtPeriodEnd ?? null,
      currentPeriodEnd: profile?.currentPeriodEnd || null,
      email,
      stripeCustomerId: profile?.stripeCustomerId || "",
      stripeSubscriptionId: profile?.stripeSubscriptionId || "",
      subscriptionStatus: profile?.subscriptionStatus || "free",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
