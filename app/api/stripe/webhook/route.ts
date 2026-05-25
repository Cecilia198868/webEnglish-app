import {
  findProfileByEmail,
  findProfileByStripeCustomerId,
  upsertProfileSubscriptionByEmail,
} from "@/lib/userStore";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type EntitlementStatus = "pro" | "free" | "cancels_at_period_end";
type StripeSubscriptionStatus = Stripe.Subscription.Status | "deleted";

type SubscriptionPersistencePayload = {
  currentPeriodEnd: string | null;
  email?: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionStatus: EntitlementStatus;
  cancelAtPeriodEnd: boolean;
};

type SubscriptionPersistenceResult = {
  email: string;
  nextSubscriptionStatus: EntitlementStatus;
  previousSubscriptionStatus?: EntitlementStatus;
};

function getStripeId(value: string | { id?: string } | null | undefined) {
  if (!value) return "";
  return typeof value === "string" ? value : value.id || "";
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  return currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000).toISOString()
    : null;
}

function getEntitlementStatus(
  subscription: Stripe.Subscription,
  forcedStatus?: StripeSubscriptionStatus
) {
  const status = forcedStatus || subscription.status;

  if (status === "active" || status === "trialing") {
    return subscription.cancel_at_period_end
      ? "cancels_at_period_end"
      : "pro";
  }

  if (
    status === "canceled" ||
    status === "deleted" ||
    status === "past_due" ||
    status === "unpaid"
  ) {
    return "free";
  }

  return "free";
}

async function saveSubscriptionState(payload: SubscriptionPersistencePayload) {
  const subscriptionData = {
    currentPeriodEnd: payload.currentPeriodEnd || undefined,
    cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
    stripeCustomerId: payload.stripeCustomerId,
    stripeSubscriptionId: payload.stripeSubscriptionId,
    subscriptionStatus: payload.subscriptionStatus,
  };

  if (payload.email) {
    const previousProfile = await findProfileByEmail(payload.email).catch(
      () => null
    );
    const updatedProfile = await upsertProfileSubscriptionByEmail(
      payload.email,
      subscriptionData
    );

    if (updatedProfile) {
      return {
        email: updatedProfile.email,
        nextSubscriptionStatus: payload.subscriptionStatus,
        previousSubscriptionStatus: previousProfile?.subscriptionStatus,
      } satisfies SubscriptionPersistenceResult;
    }
  }

  const profile = await findProfileByStripeCustomerId(payload.stripeCustomerId);

  if (!profile) {
    return null;
  }

  const updatedProfile = await upsertProfileSubscriptionByEmail(
    profile.email,
    subscriptionData
  );

  return {
    email: updatedProfile.email,
    nextSubscriptionStatus: payload.subscriptionStatus,
    previousSubscriptionStatus: profile.subscriptionStatus,
  } satisfies SubscriptionPersistenceResult;
}

async function persistSubscription(
  subscription: Stripe.Subscription,
  options: {
    email?: string;
    forcedStatus?: StripeSubscriptionStatus;
    stripeCustomerId?: string;
  } = {}
) {
  const subscriptionStatus = getEntitlementStatus(
    subscription,
    options.forcedStatus
  );

  const stripeCustomerId =
    options.stripeCustomerId || getStripeId(subscription.customer);
  const stripeSubscriptionId = subscription.id;

  if (!stripeCustomerId || !stripeSubscriptionId) {
    return null;
  }

  return saveSubscriptionState({
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    currentPeriodEnd: getCurrentPeriodEnd(subscription),
    email: options.email,
    stripeCustomerId,
    stripeSubscriptionId,
    subscriptionStatus,
  });
}

async function createNotificationSafely(
  userEmail: string,
  title: string,
  message: string
) {
  try {
    await createNotification(userEmail, title, message, "subscription");
  } catch (error) {
    console.error("Create subscription notification failed", error);
  }
}

function getCheckoutSessionEmail(session: Stripe.Checkout.Session) {
  return (
    session.metadata?.email?.trim().toLowerCase() ||
    session.client_reference_id?.trim().toLowerCase() ||
    session.customer_details?.email?.trim().toLowerCase() ||
    session.customer_email?.trim().toLowerCase() ||
    ""
  );
}

async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const subscriptionId = getStripeId(session.subscription);
  const stripeCustomerId = getStripeId(session.customer);
  const email = getCheckoutSessionEmail(session);

  if (!email) {
    console.error("Missing email in checkout session");
    return;
  }

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const resolvedStripeCustomerId =
    stripeCustomerId || getStripeId(subscription.customer);
  const currentPeriodEnd = getCurrentPeriodEnd(subscription);
  const previousProfile = await findProfileByEmail(email).catch(() => null);

  if (resolvedStripeCustomerId) {
    const updatedProfile = await upsertProfileSubscriptionByEmail(email, {
      cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
      currentPeriodEnd: currentPeriodEnd || undefined,
      stripeCustomerId: resolvedStripeCustomerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: getEntitlementStatus(subscription),
    });

    if (updatedProfile) {
      if (previousProfile?.subscriptionStatus !== "pro") {
        await createNotificationSafely(
          updatedProfile.email,
          "SpeakFlow Pro \u5df2\u5f00\u901a",
          "\u4f60\u5df2\u6210\u529f\u8ba2\u9605 SpeakFlow Pro\u3002\u73b0\u5728\u53ef\u4ee5\u4f7f\u7528\u5168\u90e8 Pro \u529f\u80fd\u3002"
        );
      }
      return;
    }
  }

  const result = await persistSubscription(subscription, {
    email,
    stripeCustomerId: resolvedStripeCustomerId,
  });

  if (result?.email) {
    if (result.previousSubscriptionStatus !== "pro") {
      await createNotificationSafely(
        result.email,
        "SpeakFlow Pro \u5df2\u5f00\u901a",
        "\u4f60\u5df2\u6210\u529f\u8ba2\u9605 SpeakFlow Pro\u3002\u73b0\u5728\u53ef\u4ee5\u4f7f\u7528\u5168\u90e8 Pro \u529f\u80fd\u3002"
      );
    }
  }
}

async function handleStripeEvent(stripe: Stripe, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        stripe,
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      {
        const result = await persistSubscription(
          event.data.object as Stripe.Subscription
        );
        if (
          result?.email &&
          result.nextSubscriptionStatus === "cancels_at_period_end" &&
          result.previousSubscriptionStatus !== "cancels_at_period_end"
        ) {
          await createNotificationSafely(
            result.email,
            "\u8ba2\u9605\u5df2\u53d6\u6d88",
            "\u4f60\u7684\u8ba2\u9605\u5df2\u53d6\u6d88\u3002Pro \u6743\u76ca\u4ecd\u53ef\u4f7f\u7528\u5230\u5f53\u524d\u8ba2\u9605\u5468\u671f\u7ed3\u675f\u3002"
          );
        }
      }
      break;
    case "customer.subscription.deleted":
      await persistSubscription(event.data.object as Stripe.Subscription, {
        forcedStatus: "deleted",
      });
      break;
    default:
      break;
  }
}

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Stripe webhook signature",
      },
      { status: 400 }
    );
  }

  try {
    await handleStripeEvent(stripe, event);
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Handle Stripe webhook failed",
      },
      { status: 500 }
    );
  }
}
