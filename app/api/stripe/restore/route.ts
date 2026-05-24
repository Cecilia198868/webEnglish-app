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

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  return currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000).toISOString()
    : null;
}

function getEntitlementStatus(status: Stripe.Subscription.Status) {
  return status === "active" || status === "trialing" ? "pro" : "free";
}

async function findLatestSubscriptionForCustomer(
  stripe: Stripe,
  customerId: string
) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
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

export async function POST() {
  try {
    const authSession = await getServerSession(authOptions);
    const email = authSession?.user?.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    const stripe = new Stripe(stripeSecretKey);
    const user = await findUserByEmail(email);
    const customerIds = new Set<string>();

    if (user?.stripeCustomerId?.trim()) {
      customerIds.add(user.stripeCustomerId.trim());
    }

    const customers = await stripe.customers.list({
      email,
      limit: 10,
    });

    customers.data.forEach((customer) => {
      customerIds.add(customer.id);
    });

    let selectedSubscription:
      | { customerId: string; subscription: Stripe.Subscription }
      | null = null;
    let latestFallbackSubscription:
      | { customerId: string; subscription: Stripe.Subscription }
      | null = null;

    for (const customerId of customerIds) {
      const subscription = await findLatestSubscriptionForCustomer(
        stripe,
        customerId
      );

      if (!subscription) {
        continue;
      }

      if (
        subscription.status === "active" ||
        subscription.status === "trialing"
      ) {
        selectedSubscription = { customerId, subscription };
        break;
      }

      if (
        !latestFallbackSubscription ||
        subscription.created > latestFallbackSubscription.subscription.created
      ) {
        latestFallbackSubscription = { customerId, subscription };
      }
    }

    selectedSubscription =
      selectedSubscription || latestFallbackSubscription;

    if (selectedSubscription) {
      const { customerId, subscription } = selectedSubscription;
      const subscriptionStatus = getEntitlementStatus(subscription.status);
      const currentPeriodEnd = getCurrentPeriodEnd(subscription);
      const updatedUser = await updateUserSubscriptionByEmail(email, {
        currentPeriodEnd: currentPeriodEnd || undefined,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus,
      });

      return NextResponse.json(
        {
          currentPeriodEnd: updatedUser.currentPeriodEnd || null,
          stripeCustomerId: updatedUser.stripeCustomerId || "",
          stripeSubscriptionId: updatedUser.stripeSubscriptionId || "",
          subscriptionStatus: updatedUser.subscriptionStatus || "free",
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        currentPeriodEnd: user?.currentPeriodEnd || null,
        stripeCustomerId: user?.stripeCustomerId || "",
        stripeSubscriptionId: user?.stripeSubscriptionId || "",
        subscriptionStatus: user?.subscriptionStatus === "pro" ? "pro" : "free",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Restore Stripe subscription failed",
      },
      { status: 500 }
    );
  }
}
