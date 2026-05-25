import { createNotificationIfMissing } from "@/lib/notifications";

export type SubscriptionNotificationStatus =
  | "free"
  | "pro"
  | "cancels_at_period_end";

export type SubscriptionNotificationState = {
  currentPeriodEnd: string | null;
  subscriptionStatus: SubscriptionNotificationStatus;
};

export type SubscriptionNotificationMessage = {
  message: string;
  title: string;
};

function formatPeriodEnd(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("zh-CN", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
}

export function getSubscriptionNotificationMessages(
  state: SubscriptionNotificationState
): SubscriptionNotificationMessage[] {
  if (
    state.subscriptionStatus !== "pro" &&
    state.subscriptionStatus !== "cancels_at_period_end"
  ) {
    return [];
  }

  const messages: SubscriptionNotificationMessage[] = [
    {
      message: "你已成功订阅 SpeakFlow Pro。现在可以使用全部 Pro 功能。",
      title: "SpeakFlow Pro 已开通",
    },
  ];

  if (state.subscriptionStatus === "cancels_at_period_end") {
    const periodEndLabel = formatPeriodEnd(state.currentPeriodEnd);

    messages.push({
      message: periodEndLabel
        ? `你的订阅已取消。Pro 权益仍可使用到 ${periodEndLabel}。`
        : "你的订阅已取消。Pro 权益仍可使用到当前订阅周期结束。",
      title: "订阅已取消",
    });
  }

  return messages;
}

async function ensureSubscriptionNotification(
  userEmail: string,
  title: string,
  message: string
) {
  try {
    await createNotificationIfMissing(userEmail, title, message, "subscription");
  } catch (error) {
    console.error("Create subscription notification failed", error);
  }
}

export async function ensureSubscriptionNotificationsForState(
  userEmail: string,
  state: SubscriptionNotificationState
) {
  await Promise.all(
    getSubscriptionNotificationMessages(state).map((notification) =>
      ensureSubscriptionNotification(
        userEmail,
        notification.title,
        notification.message
      )
    )
  );
}
