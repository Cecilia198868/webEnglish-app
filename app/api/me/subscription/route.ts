import { authOptions } from "@/auth";
import {
  findUserByEmail,
  updateUserSubscriptionByEmail,
} from "@/lib/userStore";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SubscriptionStatus = "free" | "pro" | "cancels_at_period_end";

function normalizeStoredSubscriptionStatus(
  subscriptionStatus: unknown
): SubscriptionStatus {
  return subscriptionStatus === "pro" ||
    subscriptionStatus === "cancels_at_period_end"
    ? subscriptionStatus
    : "free";
}

function getStripeCustomerId(
  value: string | { id?: string } | null | undefined
) {
  if (!value) return "";
  return typeof value === "string" ? value : value.id || "";
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const subscriptionWithPeriodEnd = subscription as Stripe.Subscription & {
    current_period_end?: number | null;
  };
  const currentPeriodEnd =
    subscriptionWithPeriodEnd.current_period_end ||
    subscription.items.data[0]?.current_period_end;

  return currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000).toISOString()
    : null;
}

function getSubscriptionStatus(subscription: Stripe.Subscription) {
  if (
    (subscription.status === "active" ||
      subscription.status === "trialing") &&
    subscription.cancel_at_period_end === true
  ) {
    return "cancels_at_period_end";
  }

  if (subscription.status === "active" || subscription.status === "trialing") {
    return "pro";
  }

  return "free";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserByEmail(email);
  const stripeSubscriptionId = user?.stripeSubscriptionId?.trim() || "";

  if (!stripeSubscriptionId) {
    return NextResponse.json(
      {
        cancelAtPeriodEnd: null,
        currentPeriodEnd: user?.currentPeriodEnd || null,
        stripeCustomerId: user?.stripeCustomerId || "",
        stripeSubscriptionId: user?.stripeSubscriptionId || "",
        stripeStatus: null,
        subscriptionStatus: normalizeStoredSubscriptionStatus(
          user?.subscriptionStatus
        ),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const subscriptionStatus = getSubscriptionStatus(subscription);
  const currentPeriodEnd = getCurrentPeriodEnd(subscription);
  const stripeCustomerId =
    getStripeCustomerId(subscription.customer) ||
    user?.stripeCustomerId?.trim() ||
    "";

  try {
    await updateUserSubscriptionByEmail(email, {
      currentPeriodEnd: currentPeriodEnd || undefined,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus,
    });
  } catch (error) {
    console.error("Sync /api/me/subscription userStore failed:", error);
  }

  return NextResponse.json(
    {
      cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
      currentPeriodEnd,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      stripeStatus: subscription.status,
      subscriptionStatus,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
