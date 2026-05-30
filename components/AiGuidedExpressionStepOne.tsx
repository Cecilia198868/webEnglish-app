"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionResponse = {
  user?: {
    avatarUrl?: string | null;
    image?: string | null;
    photoURL?: string | null;
    photoUrl?: string | null;
    picture?: string | null;
  } | null;
};

const guidedSteps = [
  {
    step: "1",
    title: "说中文",
    description: "点击麦克风，说出你的想法",
    state: "已完成",
    tone: "done",
    icon: "mic",
  },
  {
    step: "2",
    title: "尝试英文表达",
    description: "试着用英语表达这句话",
    state: "开始练习",
    tone: "active",
    icon: "mic",
  },
  {
    step: "3",
    title: "AI 给出优化建议",
    description: "多种更地道的表达对比",
    state: "待解锁",
    tone: "locked",
    icon: "ai",
  },
  {
    step: "4",
    title: "跟读并掌握表达",
    description: "跟读练习，巩固地道表达",
    state: "待解锁",
    tone: "locked",
    icon: "star",
  },
] as const;

function getAvatarSrc(user?: SessionResponse["user"]) {
  return (
    user?.avatarUrl ||
    user?.image ||
    user?.photoURL ||
    user?.photoUrl ||
    user?.picture ||
    "/default-avatar.png"
  );
}

function MenuGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

function ArrowLeftGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M15 5 8 12l7 7M9 12h11" />
    </svg>
  );
}

function ChevronGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M6 11h12v9H6z" />
    </svg>
  );
}

function MicGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 29a8 8 0 0 0 8-8v-8a8 8 0 0 0-16 0v8a8 8 0 0 0 8 8Z" />
      <path d="M11 22a13 13 0 0 0 26 0M24 35v8M18 43h12" />
    </svg>
  );
}

function SparkleGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="m25 5 4.6 11.4L41 21l-11.4 4.6L25 37l-4.6-11.4L9 21l11.4-4.6L25 5Z" />
      <path d="m10 31 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5ZM38 4l1.4 3.6L43 9l-3.6 1.4L38 14l-1.4-3.6L33 9l3.6-1.4L38 4Z" />
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

function ShieldStarGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 5 40 12v11c0 10.2-6.4 16.4-16 20-9.6-3.6-16-9.8-16-20V12L24 5Z" />
      <path d="m24 15 2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.7-5 2.7.9-5.5-4-3.9 5.6-.8L24 15Z" />
    </svg>
  );
}

function TargetGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 43a19 19 0 1 0-19-19 19 19 0 0 0 19 19Z" />
      <path d="M24 35a11 11 0 1 0-11-11 11 11 0 0 0 11 11Z" />
      <path d="M24 28a4 4 0 1 0-4-4 4 4 0 0 0 4 4ZM30 18l9-9M39 9v7M39 9h-7" />
    </svg>
  );
}

function WaveGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M13 20v8M20 15v18M27 11v26M34 17v14" />
    </svg>
  );
}

function AiGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M13 36h22a5 5 0 0 0 5-5V17a5 5 0 0 0-5-5H13a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5Z" />
      <path d="M16 29 21 18h2l5 11M18 25h8M33 29V18" />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="m24 5 5.7 11.5 12.7 1.9-9.2 9 2.2 12.6L24 34l-11.4 6 2.2-12.6-9.2-9 12.7-1.9L24 5Z" />
    </svg>
  );
}

function StepIcon({ icon }: { icon: (typeof guidedSteps)[number]["icon"] }) {
  if (icon === "ai") return <AiGlyph />;
  if (icon === "star") return <StarGlyph />;
  return <MicGlyph />;
}

export default function AiGuidedExpressionStepOne() {
  const router = useRouter();
  const [avatarSrc, setAvatarSrc] = useState("/default-avatar.png");

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const session = (await response.json()) as SessionResponse;

        if (!cancelled) {
          setAvatarSrc(getAvatarSrc(session.user));
        }
      } catch {
        if (!cancelled) {
          setAvatarSrc("/default-avatar.png");
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  function openStepTwo() {
    router.push("/ai-guided-expression/step-2");
  }

  return (
    <main className="sf-ai-guided-step-one-page">
      <section className="sf-ai-guided-step-one-phone" aria-label="AI引导表达学习第一页">
        <div className="sf-ai-guided-step-one-frame">
          <header className="sf-ai-guided-step-one-header">
            <button
              type="button"
              aria-label="返回主菜单"
              onClick={() => router.push("/menu")}
              className="sf-ai-guided-step-one-menu"
            >
              <MenuGlyph />
            </button>

            <div className="sf-ai-guided-step-one-brand" aria-label="SpeakFlow AI Voice Practice">
              <span aria-hidden="true" className="sf-ai-guided-step-one-logo">
                <WaveGlyph />
              </span>
              <span className="sf-ai-guided-step-one-brand-copy">
                <span className="sf-ai-guided-step-one-brand-title">SpeakFlow</span>
                <span className="sf-ai-guided-step-one-brand-subtitle">AI VOICE PRACTICE</span>
              </span>
            </div>

            <button
              type="button"
              aria-label="打开账户界面"
              onClick={() => router.push("/account")}
              className="sf-ai-guided-step-one-avatar-button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt=""
                className="sf-ai-guided-step-one-avatar-image"
                onError={() => setAvatarSrc("/default-avatar.png")}
              />
            </button>
          </header>

          <div className="sf-ai-guided-step-one-toolbar">
            <button
              type="button"
              aria-label="返回主菜单"
              onClick={() => router.push("/menu")}
              className="sf-ai-guided-step-one-back"
            >
              <ArrowLeftGlyph />
              <span>返回</span>
            </button>

            <div className="sf-ai-guided-step-one-mode" aria-label="AI引导表达">
              <SparkleGlyph />
              <span>AI引导表达</span>
            </div>
          </div>

          <section className="sf-ai-guided-step-one-hero">
            <span aria-hidden="true" className="sf-ai-guided-orb sf-ai-guided-orb-one" />
            <span aria-hidden="true" className="sf-ai-guided-orb sf-ai-guided-orb-two" />
            <span aria-hidden="true" className="sf-ai-guided-star sf-ai-guided-star-one" />
            <span aria-hidden="true" className="sf-ai-guided-star sf-ai-guided-star-two" />
            <span aria-hidden="true" className="sf-ai-guided-rocket">
              <svg viewBox="0 0 64 64" focusable="false">
                <path d="M42 7c-8.8 2.1-16 8.7-21.4 19.7L9 27l8.7 5.1L15 44l11.6-2.8L32 50l.3-11.6C43.3 33 49.9 25.8 52 17l5-10-15 0Z" />
                <path d="M38 18a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Z" />
                <path d="M14 42c-3.8 1.2-6.4 3.7-8 7.8 4.1-1.6 6.6-4.2 7.8-8" />
              </svg>
            </span>

            <h1>
              先说中文，
              <span>再大胆说英语</span>
            </h1>
            <p>AI 会一步步帮你说得更自然、更地道。</p>
          </section>

          <section className="sf-ai-guided-stats" aria-label="学习进度">
            <div className="sf-ai-guided-stat sf-ai-guided-stat-left">
              <span aria-hidden="true" className="sf-ai-guided-stat-icon">
                <FlameGlyph />
              </span>
              <span>
                <span>连续练习</span>
                <strong>5 天</strong>
              </span>
            </div>

            <div className="sf-ai-guided-progress" aria-label="今日练习 3/10">
              <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                <circle cx="60" cy="60" r="48" />
                <circle cx="60" cy="60" r="48" />
              </svg>
              <strong>
                3<span>/10</span>
              </strong>
              <small>今日练习</small>
            </div>

            <div className="sf-ai-guided-stat sf-ai-guided-stat-right">
              <span aria-hidden="true" className="sf-ai-guided-stat-icon">
                <ShieldStarGlyph />
              </span>
              <span>
                <span>表达提升</span>
                <strong>Lv.2</strong>
              </span>
            </div>
          </section>

          <section className="sf-ai-guided-step-section" aria-label="练习步骤">
            <h2>
              练习步骤 <span>STEP BY STEP</span>
            </h2>

            <div className="sf-ai-guided-step-list">
              {guidedSteps.map((item) => {
                const isActive = item.tone === "active";
                const isLocked = item.tone === "locked";

                return (
                  <div
                    key={item.step}
                    className={`sf-ai-guided-step-card sf-ai-guided-step-card-${item.tone}`}
                  >
                    <span className="sf-ai-guided-step-number">{item.step}</span>
                    <span aria-hidden="true" className="sf-ai-guided-step-icon">
                      <StepIcon icon={item.icon} />
                    </span>
                    <span className="sf-ai-guided-step-copy">
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>
                    {isActive ? (
                      <button
                        type="button"
                        onClick={openStepTwo}
                        className="sf-ai-guided-step-action"
                        aria-label="开始第二步练习"
                      >
                        <span>{item.state}</span>
                        <ChevronGlyph />
                      </button>
                    ) : (
                      <span className="sf-ai-guided-step-state">
                        {isLocked ? <LockGlyph /> : <CheckGlyph />}
                        <span>{item.state}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="sf-ai-guided-challenge" aria-label="今日挑战">
            <span aria-hidden="true" className="sf-ai-guided-challenge-icon">
              <TargetGlyph />
            </span>
            <span className="sf-ai-guided-challenge-copy">
              <strong>今日挑战</strong>
              <span>完成 10 句表达练习，解锁专属勋章！</span>
            </span>
            <span className="sf-ai-guided-challenge-progress" aria-label="3/10">
              <span />
              <strong>3/10</strong>
            </span>
          </section>

          <section className="sf-ai-guided-record" aria-label="开始练习">
            <span aria-hidden="true" className="sf-ai-guided-record-wave sf-ai-guided-record-wave-left" />
            <button
              type="button"
              aria-label="开始AI引导表达第二页录音"
              onClick={openStepTwo}
              className="sf-ai-guided-record-button"
            >
              <span className="sf-ai-guided-record-ring" />
              <span className="sf-ai-guided-record-core">
                <MicGlyph />
              </span>
            </button>
            <span aria-hidden="true" className="sf-ai-guided-record-wave sf-ai-guided-record-wave-right" />
            <p>
              <LockGlyph />
              <span>点击麦克风开始练习</span>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
