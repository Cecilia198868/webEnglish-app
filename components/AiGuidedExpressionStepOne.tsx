"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GuestAiPracticeProgress from "@/components/GuestAiPracticeProgress";
import HomeMenuIcon from "@/components/HomeMenuIcon";
import SpeakFlowBrandMark from "@/components/SpeakFlowBrandMark";
import type { AiGuidedProgressSnapshot } from "@/lib/aiGuidedExpressionProgress";
import { FREE_PRACTICE_DAILY_LIMIT } from "@/lib/freePracticeLimit";

type SubscriptionStatus = "free" | "pro" | "cancels_at_period_end";

type AccountSubscriptionResponse = {
  cancelAtPeriodEnd?: boolean | null;
  subscriptionStatus?: SubscriptionStatus;
};

type AiGuidedExpressionStepOneProps = {
  showGuestProgress?: boolean;
};

const defaultProgress: AiGuidedProgressSnapshot = {
  challenge: {
    completed: 0,
    goal: 10,
    percent: 0,
  },
  dailyGoal: 10,
  level: 1,
  steps: {
    english: { id: "english", label: "待解锁", status: "locked" },
    follow: { id: "follow", label: "待解锁", status: "locked" },
    native: { id: "native", label: "开始练习", status: "active" },
    suggestions: { id: "suggestions", label: "待解锁", status: "locked" },
  },
  streakDays: 0,
  todayCompleted: 0,
  totalCompleted: 0,
};

const learningFlow = [
  {
    description: "说出你的想法",
    icon: "mic",
    title: "说中文",
    tone: "violet",
  },
  {
    description: "获得自然英文说法",
    icon: "robot",
    title: "AI 引导表达",
    tone: "blue",
  },
  {
    description: "跟读并提升发音",
    icon: "chat",
    title: "跟读练习",
    tone: "blue",
  },
  {
    description: "AI 引导继续对话",
    icon: "light",
    title: "继续下一句",
    tone: "blue",
  },
] as const;

function normalizeSubscriptionStatus(
  subscriptionStatus?: SubscriptionStatus | null,
  cancelAtPeriodEnd?: boolean | null
): SubscriptionStatus {
  if (cancelAtPeriodEnd === true) return "cancels_at_period_end";

  return subscriptionStatus === "pro" ||
    subscriptionStatus === "cancels_at_period_end"
    ? subscriptionStatus
    : "free";
}

function hasProAccess(subscriptionStatus: SubscriptionStatus) {
  return subscriptionStatus !== "free";
}

function MicGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 29a8 8 0 0 0 8-8v-8a8 8 0 0 0-16 0v8a8 8 0 0 0 8 8Z" />
      <path d="M11 22a13 13 0 0 0 26 0M24 35v8M18 43h12" />
    </svg>
  );
}

function FlameGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M25 44c8.2 0 14-5.7 14-13.2 0-7.8-5.2-12.2-9.1-16.4-1.2 5.1-4.1 7.4-6.5 9.4.7-6.3-1.7-12-6.9-16.8.3 8.6-7.5 12.3-7.5 23.2C9 38.3 15.9 44 25 44Z" />
    </svg>
  );
}

function RobotGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="10" y="14" width="28" height="23" rx="7" />
      <path d="M18 14v-4M30 14v-4M15 26h.1M33 26h.1M20 32c3 2 8 2 11 0" />
    </svg>
  );
}

function ChatGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M8 18c0-7 6-12 16-12s16 5 16 12-6 12-16 12c-1.7 0-3.4-.1-4.9-.5L10 36l2.4-8.2C9.6 25.8 8 23.2 8 18Z" />
      <path d="M17 19h.1M24 19h.1M31 19h.1" />
    </svg>
  );
}

function LightGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M15 21a9 9 0 1 1 18 0c0 4.8-3.4 7.2-5.2 10.5h-7.6C18.4 28.2 15 25.8 15 21Z" />
      <path d="M20 36h8M21 41h6" />
    </svg>
  );
}

function CheckCircleGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="17" />
      <path d="m16 24 6 6 11-13" />
    </svg>
  );
}

function RocketGlyph() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M42 7c-8.8 2.1-16 8.7-21.4 19.7L9 27l8.7 5.1L15 44l11.6-2.8L32 50l.3-11.6C43.3 33 49.9 25.8 52 17l5-10-15 0Z" />
      <path d="M38 18a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Z" />
      <path d="M14 42c-3.8 1.2-6.4 3.7-8 7.8 4.1-1.6 6.6-4.2 7.8-8" />
    </svg>
  );
}

function FlowIcon({ icon }: { icon: (typeof learningFlow)[number]["icon"] }) {
  if (icon === "robot") return <RobotGlyph />;
  if (icon === "chat") return <ChatGlyph />;
  if (icon === "light") return <LightGlyph />;
  return <MicGlyph />;
}

export default function AiGuidedExpressionStepOne({
  showGuestProgress = false,
}: AiGuidedExpressionStepOneProps) {
  const router = useRouter();
  const [progress, setProgress] =
    useState<AiGuidedProgressSnapshot>(defaultProgress);
  const [isAccountPro, setIsAccountPro] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPageData() {
      try {
        const [progressResponse, subscriptionResponse] = await Promise.all([
          fetch("/api/ai-guided-expression/progress", { cache: "no-store" }),
          fetch("/api/me/subscription", { cache: "no-store" }).catch(() => null),
        ]);
        const progressData =
          (await progressResponse.json()) as AiGuidedProgressSnapshot;
        const subscriptionData =
          subscriptionResponse?.ok
            ? ((await subscriptionResponse.json()) as AccountSubscriptionResponse)
            : null;

        if (!cancelled) {
          setProgress(progressData);
          setIsAccountPro(
            hasProAccess(
              normalizeSubscriptionStatus(
                subscriptionData?.subscriptionStatus,
                subscriptionData?.cancelAtPeriodEnd
              )
            )
          );
        }
      } catch {
        if (!cancelled) {
          setProgress(defaultProgress);
          setIsAccountPro(false);
        }
      }
    }

    void loadPageData();

    return () => {
      cancelled = true;
    };
  }, []);

  function openStepTwo() {
    router.push("/ai-guided-expression/step-2");
  }

  const dailyGoal = Math.max(progress.dailyGoal, 1);
  const todayCompleted = Math.max(progress.todayCompleted, 0);
  const freeUsed = Math.min(todayCompleted, FREE_PRACTICE_DAILY_LIMIT);
  const isGuestTrial = showGuestProgress || !isAccountPro;
  const trialCompleted = isGuestTrial ? freeUsed : todayCompleted;
  const trialGoal = isGuestTrial ? FREE_PRACTICE_DAILY_LIMIT : dailyGoal;
  const trialLabel = isGuestTrial ? "今日免费" : "今日练习";
  const trialSubLabel = isGuestTrial ? "AI 引导试用" : "AI 引导表达";
  const saveTitle = showGuestProgress ? "登录保存记录" : "已保存记录";
  const saveSubtitle = showGuestProgress ? "继续无限练" : "继续稳步练";
  const noteText = showGuestProgress
    ? `免费体验 ${FREE_PRACTICE_DAILY_LIMIT} 句，登录即可保存学习记录`
    : "学习记录已保存，继续跟着 AI 练习";
  const trialCountStyle = {
    "--ai-guided-trial-progress": `${Math.min(
      100,
      Math.round((trialCompleted / trialGoal) * 100)
    )}%`,
  } as CSSProperties;

  return (
    <main className="sf-ai-guided-step-one-page">
      <section
        className="sf-ai-guided-step-one-phone"
        aria-label="AI 引导表达学习第一页"
      >
        <div className="sf-ai-guided-step-one-frame">
          <div className="sf-ai-guided-step-one-scroll">
            <header className="sf-ai-guided-step-one-header">
              <button
                type="button"
                aria-label="回到首页"
                onClick={() => router.push("/start")}
                className="sf-ai-guided-step-one-menu is-home"
              >
                <HomeMenuIcon label={null} />
              </button>

              <div
                className="sf-ai-guided-step-one-brand"
                aria-label="SpeakFlow AI Voice Practice"
              >
                <span aria-hidden="true" className="sf-ai-guided-step-one-logo">
                  <SpeakFlowBrandMark className="sf-ai-guided-step-one-logo-mark" />
                </span>
                <span className="sf-ai-guided-step-one-brand-copy">
                  <span className="sf-ai-guided-step-one-brand-title">
                    SpeakFlow
                  </span>
                  <span className="sf-ai-guided-step-one-brand-subtitle">
                    AI VOICE PRACTICE
                  </span>
                </span>
              </div>

              <span aria-hidden="true" />
            </header>

            {showGuestProgress ? (
              <GuestAiPracticeProgress className="sf-ai-guided-step-one-guest-progress" />
            ) : null}

            <section className="sf-ai-guided-step-one-hero">
              <span
                aria-hidden="true"
                className="sf-ai-guided-step-one-diamond sf-ai-guided-step-one-diamond-left"
              />
              <span
                aria-hidden="true"
                className="sf-ai-guided-step-one-diamond sf-ai-guided-step-one-diamond-top"
              />
              <span aria-hidden="true" className="sf-ai-guided-rocket">
                <RocketGlyph />
              </span>
              <span aria-hidden="true" className="sf-ai-guided-rocket-trail" />

              <h1>
                先说中文，
                <span>再大胆说英语</span>
              </h1>
              <p>AI 会一步步帮你说得更自然、更地道。</p>
            </section>

            <section
              className="sf-ai-guided-trial-card"
              aria-label={`${trialLabel}${trialSubLabel} ${trialCompleted}/${trialGoal}`}
              style={trialCountStyle}
            >
              <div className="sf-ai-guided-trial-copy">
                <span aria-hidden="true" className="sf-ai-guided-trial-icon">
                  <FlameGlyph />
                </span>
                <span>
                  <strong>{trialLabel}</strong>
                  <small>{trialSubLabel}</small>
                </span>
              </div>

              <div className="sf-ai-guided-trial-count">
                <strong>{trialCompleted}</strong>
                <span>/{trialGoal}</span>
              </div>

              <div className="sf-ai-guided-trial-save">
                <strong>{saveTitle}</strong>
                <small>{saveSubtitle}</small>
              </div>
            </section>

            <section className="sf-ai-guided-flow-section" aria-label="学习流程">
              <h2>
                <span aria-hidden="true" />
                <strong>学习流程</strong>
                <span aria-hidden="true" />
              </h2>

              <div className="sf-ai-guided-flow-list">
                {learningFlow.map((item, index) => (
                  <div className="sf-ai-guided-flow-item" key={item.title}>
                    <span
                      aria-hidden="true"
                      className={`sf-ai-guided-flow-icon is-${item.tone}`}
                    >
                      <FlowIcon icon={item.icon} />
                    </span>
                    <span className="sf-ai-guided-flow-number">{index + 1}</span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="sf-ai-guided-step-one-bottom">
            <button
              type="button"
              aria-label="进入 AI 引导表达学习第二页"
              onClick={openStepTwo}
              className="sf-ai-guided-start-button"
            >
              <MicGlyph />
              <span>开始 AI 引导表达</span>
            </button>
            <p className="sf-ai-guided-trial-note">
              <CheckCircleGlyph />
              <span>{noteText}</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
