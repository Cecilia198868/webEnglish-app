import Stripe from "stripe";
import {
  findProfileByEmail,
  upsertProfileSubscriptionByEmail,
  type StoredUser,
} from "@/lib/userStore";

export type AccountSubscriptionState = {
  cancelAtPeriodEnd: boolean | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionStatus: "free" | "pro" | "cancels_at_period_end";
};

type SelectedStripeSubscription = {
  customerId: string;
  subscription: Stripe.Subscription;
};

function getStripeId(value: string | { id?: string } | null | undefined) {
  if (!value) return "";
  return typeof value === "string" ? value : value.id || "";
}

function toAccountSubscriptionState(
  user: StoredUser | null | undefined
): AccountSubscriptionState {
  return {
    cancelAtPeriodEnd:
      user?.cancelAtPeriodEnd ??
      (user?.subscriptionStatus === "cancels_at_period_end"
        ? true
        : null),
    currentPeriodEnd: user?.currentPeriodEnd || null,
    stripeCustomerId: user?.stripeCustomerId || "",
    stripeSubscriptionId: user?.stripeSubscriptionId || "",
    subscriptionStatus:
      user?.subscriptionStatus === "pro" ||
      user?.subscriptionStatus === "cancels_at_period_end"
        ? user.subscriptionStatus
        : "free",
  };
}

function toStripeSubscriptionState(
  customerId: string,
  subscription: Stripe.Subscription
): AccountSubscriptionState {
  logStripeSubscriptionState(subscription);

  return {
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    currentPeriodEnd: getCurrentPeriodEnd(subscription),
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: getEntitlementStatus(subscription),
  };
}

function logStripeSubscriptionState(subscription: Stripe.Subscription) {
  const subscriptionWithPeriodEnd = subscription as Stripe.Subscription & {
    current_period_end?: number | null;
  };

  console.log("Stripe subscription status:", subscription.status);
  console.log(
    "Stripe subscription cancel_at_period_end:",
    subscription.cancel_at_period_end
  );
  console.log(
    "Stripe subscription current_period_end:",
    subscriptionWithPeriodEnd.current_period_end ??
      subscription.items.data[0]?.current_period_end ??
      null
  );
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

function getEntitlementStatus(subscription: Stripe.Subscription) {
  if (
    subscription.status === "active" ||
    subscription.status === "trialing"
  ) {
    return subscription.cancel_at_period_end
      ? "cancels_at_period_end"
      : "pro";
  }

  return "free";
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

async function findSubscriptionByEmail(
  stripe: Stripe,
  email: string,
  storedStripeCustomerId?: string
): Promise<SelectedStripeSubscription | null> {
  const customerIds = new Set<string>();

  if (storedStripeCustomerId?.trim()) {
    customerIds.add(storedStripeCustomerId.trim());
  }

  const customers = await stripe.customers.list({
    email,
    limit: 10,
  });

  customers.data.forEach((customer) => {
    customerIds.add(customer.id);
  });

  let latestActiveSubscription: SelectedStripeSubscription | null = null;
  let latestFallbackSubscription: SelectedStripeSubscription | null = null;

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
      if (
        !latestActiveSubscription ||
        subscription.created > latestActiveSubscription.subscription.created
      ) {
        latestActiveSubscription = { customerId, subscription };
      }
      continue;
    }

    if (
      !latestFallbackSubscription ||
      subscription.created > latestFallbackSubscription.subscription.created
    ) {
      latestFallbackSubscription = { customerId, subscription };
    }
  }

  return latestActiveSubscription || latestFallbackSubscription;
}

async function retrieveStoredSubscription(
  stripe: Stripe,
  user: StoredUser | null
): Promise<SelectedStripeSubscription | null> {
  const stripeSubscriptionId = user?.stripeSubscriptionId?.trim();

  if (!stripeSubscriptionId) {
    return null;
  }

  try {
    const subscription =
      await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const customerId =
      getStripeId(subscription.customer) || user?.stripeCustomerId?.trim() || "";

    if (!customerId) {
      return null;
    }

    return {
      customerId,
      subscription,
    };
  } catch (error) {
    console.error("Retrieve stored Stripe subscription failed:", error);
    return null;
  }
}

export async function restoreSubscriptionForEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findProfileByEmail(normalizedEmail);
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  const stripe = new Stripe(stripeSecretKey);
  const selectedSubscription =
    (await retrieveStoredSubscription(stripe, user)) ||
    (await findSubscriptionByEmail(
      stripe,
      normalizedEmail,
      user?.stripeCustomerId
    ));

  if (!selectedSubscription) {
    return toAccountSubscriptionState(user);
  }

  const { customerId, subscription } = selectedSubscription;
  const restoredSubscription = toStripeSubscriptionState(
    customerId,
    subscription
  );

  try {
    await upsertProfileSubscriptionByEmail(normalizedEmail, {
      cancelAtPeriodEnd: restoredSubscription.cancelAtPeriodEnd === true,
      currentPeriodEnd: restoredSubscription.currentPeriodEnd || undefined,
      stripeCustomerId: restoredSubscription.stripeCustomerId,
      stripeSubscriptionId: restoredSubscription.stripeSubscriptionId,
      subscriptionStatus: restoredSubscription.subscriptionStatus,
    });
  } catch (error) {
    console.error("Persist restored Stripe subscription failed:", error);
  }

  return restoredSubscription;
}

export async function getAccountSubscriptionForEmail(email: string) {
  const user = await findProfileByEmail(email);
  const storedSubscription = toAccountSubscriptionState(user);

  if (!process.env.STRIPE_SECRET_KEY) {
    return storedSubscription;
  }

  try {
    return await restoreSubscriptionForEmail(email);
  } catch {
    return storedSubscription;
  }
}
