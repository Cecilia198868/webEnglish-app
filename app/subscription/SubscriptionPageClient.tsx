"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createLoginUrl } from "@/lib/loginRedirect";
import styles from "./SubscriptionPage.module.css";

type PlanId = "monthly" | "yearly";
type BusyAction = "" | "portal" | "restore" | `checkout-${PlanId}`;
type SubscriptionStatus = "free" | "pro" | "cancels_at_period_end";

type AccountSubscriptionResponse = {
  bonusProUntil?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  entitlementSource?: "bonus" | "free" | "stripe";
  subscriptionStatus?: SubscriptionStatus;
};

type SubscriptionPageClientProps = {
  checkoutStatus: string;
  isSignedIn: boolean;
  userEmail: string;
};

const plans: Array<{
  badge?: string;
  description: string;
  id: PlanId;
  name: string;
  price: string;
  summary: string;
  suffix: string;
}> = [
  {
    description: "适合短期集中练习，按月灵活续订。",
    id: "monthly",
    name: "月付套餐",
    price: "$4.99",
    suffix: "/ 月",
    summary: "随时开始，随时取消",
  },
  {
    badge: "推荐",
    description: "适合长期学习，平均约 $3.33 / 月。",
    id: "yearly",
    name: "年付套餐",
    price: "$39.99",
    suffix: "/ 年",
    summary: "长期练习更划算",
  },
];

const proBenefits = [
  {
    title: "无限练习",
    text: "解除免费次数限制，自由学习、AI 引导表达和场景练习可以持续进行。",
  },
  {
    title: "完整课程开放",
    text: "经典场景、100 个口语句型、地道语感和创建课程等学习内容完整开放。",
  },
  {
    title: "表达与记录保存",
    text: "收藏表达、保存学习记录和课程进度，让练习不再从零开始。",
  },
  {
    title: "更连续的 AI 学习",
    text: "更适合每天稳定使用，把真实想法持续练成自然英语表达。",
  },
];

const practiceFlow = [
  "想到什么就说什么",
  "AI 优化自然表达",
  "跟读、复述、收藏",
  "持续积累表达库",
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 4.2 4.2L19 6.8" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.8 14.4 9l5.4 2.2-5.4 2.2L12 18.6l-2.4-5.2-5.4-2.2L9.6 9 12 3.8Z" />
    </svg>
  );
}

function formatChineseDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function getStatusCopy(subscription?: AccountSubscriptionResponse | null) {
  if (subscription === undefined) {
    return {
      badge: "同步中",
      title: "正在读取订阅状态",
      text: "我们正在检查当前账号是否已经拥有 Pro 权限。",
    };
  }

  const status = subscription?.subscriptionStatus || "free";
  const endDate = formatChineseDate(
    subscription?.currentPeriodEnd || subscription?.bonusProUntil
  );

  if (status === "pro" || status === "cancels_at_period_end") {
    return {
      badge: "已订阅",
      title: "你的 SpeakFlow Pro 已开启",
      text:
        status === "cancels_at_period_end" && endDate
          ? `当前权益可使用到 ${endDate}，到期后停止续订。`
          : endDate
            ? `当前权益可使用到 ${endDate}。`
            : "当前账号已经拥有完整 Pro 学习权益。",
    };
  }

  return {
    badge: "未订阅",
    title: "开通后立即解锁完整学习体验",
    text: "选择适合你的套餐，进入 Stripe 安全支付页面完成订阅。",
  };
}

export default function SubscriptionPageClient({
  checkoutStatus,
  isSignedIn,
  userEmail,
}: SubscriptionPageClientProps) {
  const [subscription, setSubscription] =
    useState<AccountSubscriptionResponse | null | undefined>(
      isSignedIn ? undefined : null
    );
  const [busyAction, setBusyAction] = useState<BusyAction>("");
  const [message, setMessage] = useState("");

  const isProSubscription =
    subscription?.subscriptionStatus === "pro" ||
    subscription?.subscriptionStatus === "cancels_at_period_end";
  const statusCopy = useMemo(() => getStatusCopy(subscription), [subscription]);
  const loginHref = createLoginUrl("/subscription");

  useEffect(() => {
    if (!isSignedIn) return;

    let ignore = false;

    async function loadSubscription() {
      try {
        const response = await fetch(`/api/me/subscription?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => ({}))) as
          | AccountSubscriptionResponse
          | { error?: string };

        if (ignore) return;

        if (!response.ok || ("error" in data && data.error)) {
          setSubscription(null);
          return;
        }

        setSubscription(data as AccountSubscriptionResponse);
      } catch {
        if (!ignore) setSubscription(null);
      }
    }

    void loadSubscription();

    return () => {
      ignore = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (checkoutStatus === "success") {
      setMessage("订阅已提交成功，正在同步你的 Pro 状态。");
    } else if (checkoutStatus === "cancel") {
      setMessage("你已取消本次支付，可以随时重新选择套餐。");
    }
  }, [checkoutStatus]);

  function requireLogin() {
    window.location.href = loginHref;
  }

  async function createStripeCheckout(plan: PlanId) {
    if (!isSignedIn) {
      requireLogin();
      return;
    }

    setMessage("");
    setBusyAction(`checkout-${plan}`);

    try {
      const response = await fetch("/api/stripe/checkout", {
        body: JSON.stringify({ plan, returnPath: "/subscription" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };

      if (response.status === 401) {
        requireLogin();
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error || "暂时无法创建订阅页面。");
      }

      window.location.href = data.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "暂时无法创建订阅页面。");
    } finally {
      setBusyAction("");
    }
  }

  async function openBillingPortal() {
    if (!isSignedIn) {
      requireLogin();
      return;
    }

    setMessage("");
    setBusyAction("portal");

    try {
      const response = await fetch("/api/stripe/portal", {
        body: JSON.stringify({ returnPath: "/subscription" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };

      if (response.status === 401) {
        requireLogin();
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error || "暂时无法打开订阅管理。");
      }

      window.location.href = data.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "暂时无法打开订阅管理。");
    } finally {
      setBusyAction("");
    }
  }

  async function restorePurchase() {
    if (!isSignedIn) {
      requireLogin();
      return;
    }

    setMessage("");
    setBusyAction("restore");

    try {
      const response = await fetch("/api/stripe/restore", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as
        | AccountSubscriptionResponse
        | { error?: string };

      if (response.status === 401) {
        requireLogin();
        return;
      }

      if (!response.ok || ("error" in data && data.error)) {
        throw new Error(("error" in data && data.error) || "没有找到可恢复的订阅。");
      }

      setSubscription(data as AccountSubscriptionResponse);
      setMessage("已刷新当前账号的 Pro 状态。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "恢复购买失败。");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="返回 SpeakFlow 首页">
          <span className={styles.brandIcon}>
            <SparkIcon />
          </span>
          <span>SpeakFlow</span>
        </Link>
        <nav className={styles.topnav} aria-label="订阅页面导航">
          <Link href="/help">帮助中心</Link>
          <Link href="/contact">联系我们</Link>
          <Link href="/privacy">隐私政策</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>SpeakFlow Pro</p>
          <h1>让英语练习不再被次数打断</h1>
          <p>
            开通会员版后，解锁完整 AI 口语练习、课程内容、表达收藏和学习记录。
            适合想每天稳定练习、把真实想法持续说成自然英语的学习者。
          </p>
          <div className={styles.heroActions}>
            <a href="#plans">查看套餐</a>
            {isSignedIn ? (
              <button
                disabled={busyAction === "restore"}
                onClick={() => void restorePurchase()}
                type="button"
              >
                {busyAction === "restore" ? "正在恢复..." : "恢复购买"}
              </button>
            ) : (
              <Link href={loginHref}>登录后开通</Link>
            )}
          </div>
        </div>

        <aside className={styles.statusPanel} aria-label="订阅状态">
          <span className={styles.statusBadge}>{statusCopy.badge}</span>
          <h2>{statusCopy.title}</h2>
          <p>{statusCopy.text}</p>
          {userEmail ? <small>当前账号：{userEmail}</small> : null}
          {message ? <div className={styles.message}>{message}</div> : null}
          {isProSubscription ? (
            <button
              disabled={busyAction === "portal"}
              onClick={() => void openBillingPortal()}
              type="button"
            >
              {busyAction === "portal" ? "正在打开..." : "管理订阅"}
              <ArrowIcon />
            </button>
          ) : null}
        </aside>
      </section>

      <section className={styles.valueGrid} aria-label="会员权益">
        <div className={styles.valueIntro}>
          <SparkIcon />
          <h2>Pro 会员包含什么</h2>
          <p>把开口练习、AI 辅助、课程和复习连接起来，让学习形成连续闭环。</p>
        </div>
        {proBenefits.map((benefit) => (
          <article className={styles.valueCard} key={benefit.title}>
            <span>
              <CheckIcon />
            </span>
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </article>
        ))}
      </section>

      <section className={styles.plansSection} id="plans" aria-label="会员套餐">
        <div className={styles.plansHeader}>
          <p>选择套餐</p>
          <h2>选择适合你的练习节奏</h2>
          <span>支付、发票、取消订阅和付款方式均由 Stripe 安全处理。</span>
        </div>

        <div className={styles.planGrid}>
          {plans.map((plan) => (
            <button
              className={styles.planCard}
              data-featured={plan.id === "yearly"}
              disabled={busyAction === `checkout-${plan.id}` || isProSubscription}
              key={plan.id}
              onClick={() => void createStripeCheckout(plan.id)}
              type="button"
            >
              <span className={styles.planTop}>
                <strong>{plan.name}</strong>
                {plan.badge ? <em>{plan.badge}</em> : null}
              </span>
              <span className={styles.planSummary}>{plan.summary}</span>
              <span className={styles.planPrice}>
                {plan.price}
                <small>{plan.suffix}</small>
              </span>
              <span className={styles.planDescription}>{plan.description}</span>
              <span className={styles.planAction}>
                {isProSubscription
                  ? "当前已开通"
                  : busyAction === `checkout-${plan.id}`
                    ? "正在打开..."
                    : isSignedIn
                      ? `开通${plan.name}`
                      : "登录后开通"}
                <ArrowIcon />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.workflow} aria-label="Pro 学习流程">
        <div>
          <p>会员学习方式</p>
          <h2>从一次开口，变成长期表达能力</h2>
        </div>
        <ol>
          {practiceFlow.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
