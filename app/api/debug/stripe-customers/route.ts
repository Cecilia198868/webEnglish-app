import { authOptions } from "@/auth";
import { findProfileByEmail } from "@/lib/userStore";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const profile = await findProfileByEmail(email);
  const customerIds = new Set<string>();

  if (profile?.stripeCustomerId?.trim()) {
    customerIds.add(profile.stripeCustomerId.trim());
  }

  const customers = await stripe.customers.list({
    email,
    limit: 100,
  });

  customers.data.forEach((customer) => {
    customerIds.add(customer.id);
  });

  const rows = [];

  for (const customerId of customerIds) {
    const customer =
      customers.data.find((item) => item.id === customerId) ||
      (await stripe.customers.retrieve(customerId));
    const customerEmail =
      "email" in customer && typeof customer.email === "string"
        ? customer.email
        : email;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
      status: "all",
    });

    if (!subscriptions.data.length) {
      rows.push({
        cancelAtPeriodEnd: null,
        created:
          "created" in customer && typeof customer.created === "number"
            ? new Date(customer.created * 1000).toISOString()
            : null,
        currentPeriodEnd: null,
        customerId,
        email: customerEmail || email,
        status: "none",
        subscriptionId: "",
      });
      continue;
    }

    subscriptions.data.forEach((subscription) => {
      rows.push({
        cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
        created: new Date(subscription.created * 1000).toISOString(),
        currentPeriodEnd: getCurrentPeriodEnd(subscription),
        customerId,
        email: customerEmail || email,
        status: subscription.status,
        subscriptionId: subscription.id,
      });
    });
  }

  rows.sort((left, right) =>
    String(right.created || "").localeCompare(String(left.created || ""))
  );

  return NextResponse.json(
    {
      customers: rows,
      email,
      profileStripeCustomerId: profile?.stripeCustomerId || "",
      profileStripeSubscriptionId: profile?.stripeSubscriptionId || "",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
