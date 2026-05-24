import { authOptions } from "@/auth";
import {
  findProfileByEmail,
  upsertProfileSubscriptionByEmail,
} from "@/lib/userStore";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SubscriptionStatus = "free" | "pro" | "cancels_at_period_end";
type SelectedStripeSubscription = {
  subscription: Stripe.Subscription;
  stripeCustomerId: string;
};

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

function getCurrentPeriodEndTimestamp(subscription: Stripe.Subscription) {
  const subscriptionWithPeriodEnd = subscription as Stripe.Subscription & {
    current_period_end?: number | null;
  };

  return (
    subscriptionWithPeriodEnd.current_period_end ||
    subscription.items.data[0]?.current_period_end ||
    null
  );
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

async function retrieveSubscriptionById(
  stripe: Stripe,
  stripeSubscriptionId: string,
  fallbackStripeCustomerId = ""
): Promise<SelectedStripeSubscription | null> {
  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const stripeCustomerId =
    getStripeCustomerId(subscription.customer) || fallbackStripeCustomerId;

  return {
    stripeCustomerId,
    subscription,
  };
}

async function findLatestSubscriptionForCustomer(
  stripe: Stripe,
  stripeCustomerId: string
) {
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    limit: 10,
    status: "all",
  });
  const sortedSubscriptions = subscriptions.data.sort(
    (left, right) => right.created - left.created
  );

  return (
    sortedSubscriptions.find(
      (subscription) =>
        subscription.status === "active" || subscription.status === "trialing"
    ) ||
    sortedSubscriptions[0] ||
    null
  );
}

async function findSubscriptionByEmail(
  stripe: Stripe,
  email: string,
  storedStripeCustomerId = ""
): Promise<SelectedStripeSubscription | null> {
  const stripeCustomerIds = new Set<string>();

  if (storedStripeCustomerId.trim()) {
    stripeCustomerIds.add(storedStripeCustomerId.trim());
  }

  const customers = await stripe.customers.list({
    email,
    limit: 10,
  });

  customers.data.forEach((customer) => {
    stripeCustomerIds.add(customer.id);
  });

  let latestActiveSubscription: SelectedStripeSubscription | null = null;
  let latestFallbackSubscription: SelectedStripeSubscription | null = null;

  for (const stripeCustomerId of stripeCustomerIds) {
    const subscription = await findLatestSubscriptionForCustomer(
      stripe,
      stripeCustomerId
    );

    if (!subscription) continue;

    const selectedSubscription = {
      stripeCustomerId,
      subscription,
    };

    if (
      subscription.status === "active" ||
      subscription.status === "trialing"
    ) {
      if (
        !latestActiveSubscription ||
        subscription.created > latestActiveSubscription.subscription.created
      ) {
        latestActiveSubscription = selectedSubscription;
      }
      continue;
    }

    if (
      !latestFallbackSubscription ||
      subscription.created > latestFallbackSubscription.subscription.created
    ) {
      latestFallbackSubscription = selectedSubscription;
    }
  }

  return latestActiveSubscription || latestFallbackSubscription;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await findProfileByEmail(email);
  const stripeSubscriptionId = profile?.stripeSubscriptionId?.trim() || "";
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const selectedStripeSubscription = stripeSubscriptionId
    ? await retrieveSubscriptionById(
        stripe,
        stripeSubscriptionId,
        profile?.stripeCustomerId?.trim() || ""
      )
    : await findSubscriptionByEmail(
        stripe,
        email,
        profile?.stripeCustomerId?.trim() || ""
      );

  if (!selectedStripeSubscription) {
    return NextResponse.json(
      {
        cancelAtPeriodEnd: profile?.cancelAtPeriodEnd ?? null,
        currentPeriodEnd: profile?.currentPeriodEnd || null,
        stripeCurrentPeriodEnd: null,
        stripeCustomerId: profile?.stripeCustomerId || "",
        stripeStatus: null,
        stripeSubscriptionId: profile?.stripeSubscriptionId || "",
        subscriptionStatus: normalizeStoredSubscriptionStatus(
          profile?.subscriptionStatus
        ),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const { subscription, stripeCustomerId } = selectedStripeSubscription;
  const subscriptionStatus = getSubscriptionStatus(subscription);
  const currentPeriodEnd = getCurrentPeriodEnd(subscription);
  const cancelAtPeriodEnd = subscription.cancel_at_period_end === true;
  const stripeCurrentPeriodEnd = getCurrentPeriodEndTimestamp(subscription);

  try {
    await upsertProfileSubscriptionByEmail(email, {
      cancelAtPeriodEnd,
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
      cancelAtPeriodEnd,
      currentPeriodEnd,
      stripeCurrentPeriodEnd,
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
