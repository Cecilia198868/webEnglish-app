"use client";

import { useEffect, useState } from "react";
import FreeStudyHelpModal from "@/components/FreeStudyHelpModal";
import { FREE_PRACTICE_DAILY_LIMIT } from "@/lib/freePracticeLimit";

type FreeStudyProgressStepId =
  | "native"
  | "english"
  | "suggestions"
  | "follow";

type FreeStudyProgressStepStatus = "active" | "completed" | "locked";

type FreeStudyProgressSnapshot = {
  challenge?: {
    completed?: number;
    goal?: number;
    percent?: number;
  };
  dailyGoal?: number;
  steps?: Partial<
    Record<
      FreeStudyProgressStepId,
      {
        id?: FreeStudyProgressStepId;
        label?: string;
        status?: FreeStudyProgressStepStatus;
      }
    >
  >;
  streakDays?: number;
  todayCompleted?: number;
  totalCompleted?: number;
};

type FreeStudyBottomNavProps = {
  hasProEntitlement?: boolean;
  menuLabel?: string;
  onAccountClick?: () => void;
  onMenuClick?: () => void;
};

const progressStepOrder: Array<{
  id: FreeStudyProgressStepId;
  fallbackLabel: string;
}> = [
  { id: "native", fallbackLabel: "\u8bf4\u4e2d\u6587" },
  { id: "english", fallbackLabel: "\u8bd5\u7740\u8bf4\u82f1\u6587" },
  { id: "suggestions", fallbackLabel: "AI \u7ed9\u4f60\u8868\u8fbe" },
  { id: "follow", fallbackLabel: "\u7ee7\u7eed\u4e0b\u4e00\u53e5" },
];

const progressStatusCopy: Record<FreeStudyProgressStepStatus, string> = {
  active: "\u8fdb\u884c\u4e2d",
  completed: "\u5df2\u5b8c\u6210",
  locked: "\u5f85\u7ec3\u4e60",
};

function BottomHomeIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient
          id="sf-free-bottom-home-gradient"
          x1="9"
          x2="39"
          y1="39"
          y2="8"
        >
          <stop offset="0" stopColor="#5e79ff" />
          <stop offset="1" stopColor="#914cff" />
        </linearGradient>
      </defs>
      <path
        d="M8 21.6 24 8l16 13.6v16.2a4 4 0 0 1-4 4h-7.7V29.3h-8.6v12.5H12a4 4 0 0 1-4-4V21.6Z"
        fill="url(#sf-free-bottom-home-gradient)"
      />
    </svg>
  );
}

function BottomProgressIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M12 34V21" />
      <path d="M20 34V12" />
      <path d="M28 34V17" />
      <path d="M36 34V9" />
    </svg>
  );
}

function BottomHelpIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 7.5c-9.4 0-17 6.4-17 14.3 0 4.7 2.7 8.9 6.9 11.5l-1.5 7.2 7.2-4.8c1.4.3 2.9.5 4.4.5 9.4 0 17-6.4 17-14.4S33.4 7.5 24 7.5Z" />
      <path d="M19.2 18.8a5.1 5.1 0 0 1 9.8 2.1c0 3.8-5 4.1-5 7.2" />
      <path d="M24 34.2h.1" />
    </svg>
  );
}

function BottomAccountIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="15.2" r="7.1" />
      <path d="M11.8 40c1.5-8 6-12 12.2-12s10.7 4 12.2 12" />
    </svg>
  );
}

export default function FreeStudyBottomNav({
  hasProEntitlement = false,
  menuLabel = "\u56de\u5230\u5b66\u4e60\u9996\u9875",
  onAccountClick,
  onMenuClick,
}: FreeStudyBottomNavProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressSnapshot, setProgressSnapshot] =
    useState<FreeStudyProgressSnapshot | null>(null);

  useEffect(() => {
    if (!isProgressOpen) return;

    let isActive = true;

    async function loadProgress() {
      setIsProgressLoading(true);
      setProgressError("");

      try {
        const response = await fetch("/api/ai-guided-expression/progress", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Progress request failed");
        }

        const snapshot = (await response.json()) as FreeStudyProgressSnapshot;
        if (isActive) {
          setProgressSnapshot(snapshot);
        }
      } catch {
        if (isActive) {
          setProgressError("\u5b66\u4e60\u8fdb\u5ea6\u6682\u65f6\u6ca1\u6709\u540c\u6b65\u6210\u529f\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002");
        }
      } finally {
        if (isActive) {
          setIsProgressLoading(false);
        }
      }
    }

    void loadProgress();

    return () => {
      isActive = false;
    };
  }, [isProgressOpen]);

  useEffect(() => {
    if (!isProgressOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsProgressOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isProgressOpen]);

  function openProgress() {
    setIsProgressLoading(true);
    setIsProgressOpen(true);
  }

  const todayCompleted = progressSnapshot?.todayCompleted ?? 0;
  const dailyGoal = progressSnapshot?.dailyGoal ?? FREE_PRACTICE_DAILY_LIMIT;
  const streakDays = progressSnapshot?.streakDays ?? 0;
  const totalCompleted = progressSnapshot?.totalCompleted ?? 0;
  const challengeCompleted = progressSnapshot?.challenge?.completed ?? 0;
  const challengeGoal = progressSnapshot?.challenge?.goal ?? dailyGoal;
  const challengePercent = Math.max(
    0,
    Math.min(100, Math.round(progressSnapshot?.challenge?.percent ?? 0))
  );

  return (
    <>
      <style>{`
        .sf-free-bottom-nav {
          position: fixed;
          z-index: 156;
          left: 50%;
          bottom: max(0.7rem, env(safe-area-inset-bottom, 0px));
          width: min(calc(100% - 1.55rem), 398px);
          min-height: clamp(3.95rem, 17vw, 4.7rem);
          padding: clamp(0.38rem, 1.7vw, 0.52rem) clamp(0.82rem, 4.2vw, 1.18rem);
          border: 1px solid rgba(220, 227, 247, 0.92);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: center;
          gap: clamp(0.18rem, 1vw, 0.42rem);
          box-shadow:
            0 1.05rem 2.4rem rgba(94, 112, 172, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          transform: translateX(-50%);
          backdrop-filter: blur(18px);
        }

        .sf-free-bottom-button {
          position: relative;
          width: 100%;
          height: clamp(2.55rem, 11.5vw, 3.12rem);
          border: 0;
          border-radius: 999px;
          padding: 0;
          display: grid;
          place-items: center;
          color: #8b8eaf;
          background: transparent;
          appearance: none;
          cursor: pointer;
          transition: color 160ms ease, transform 160ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .sf-free-bottom-button:active {
          transform: scale(0.97);
        }

        .sf-free-bottom-button:focus-visible,
        .sf-free-bottom-progress-close:focus-visible {
          outline: 3px solid rgba(132, 103, 255, 0.34);
          outline-offset: 3px;
        }

        .sf-free-bottom-button svg {
          width: clamp(1.62rem, 7.2vw, 2.05rem);
          height: clamp(1.62rem, 7.2vw, 2.05rem);
          fill: none;
          stroke: currentColor;
          stroke-width: 3.1;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }

        .sf-free-bottom-button.is-active svg {
          width: clamp(1.72rem, 7.8vw, 2.16rem);
          height: clamp(1.72rem, 7.8vw, 2.16rem);
          stroke: none;
        }

        .sf-free-bottom-pro {
          position: absolute;
          right: clamp(0.34rem, 1.8vw, 0.52rem);
          bottom: clamp(0.18rem, 0.9vw, 0.28rem);
          padding: 0.06rem 0.18rem 0.05rem;
          border-radius: 0.26rem;
          background: rgba(9, 14, 54, 0.9);
          color: #ffffff;
          font-size: 0.44rem;
          font-weight: 950;
          line-height: 1;
          letter-spacing: 0;
          box-shadow: 0 0.18rem 0.36rem rgba(9, 14, 54, 0.16);
        }

        .sf-free-bottom-progress-backdrop {
          position: fixed;
          inset: 0;
          z-index: 180;
          padding: max(1rem, env(safe-area-inset-top, 0px)) 1rem max(1rem, env(safe-area-inset-bottom, 0px));
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 19, 46, 0.28);
          backdrop-filter: blur(14px);
        }

        .sf-free-bottom-progress-modal {
          width: min(100%, 24rem);
          max-height: min(84dvh, 40rem);
          overflow-y: auto;
          border: 1px solid rgba(220, 228, 250, 0.94);
          border-radius: 1.45rem;
          background:
            radial-gradient(circle at 88% 6%, rgba(222, 207, 255, 0.62), transparent 8rem),
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 252, 255, 0.97));
          padding: 1.08rem;
          box-shadow:
            0 1.8rem 4.2rem rgba(25, 32, 74, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        .sf-free-bottom-progress-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .sf-free-bottom-progress-kicker {
          margin: 0 0 0.26rem;
          color: #765cff;
          font-size: 0.78rem;
          font-weight: 900;
          line-height: 1;
        }

        .sf-free-bottom-progress-head h2 {
          margin: 0;
          color: #07103d;
          font-size: 1.42rem;
          font-weight: 950;
          line-height: 1.14;
        }

        .sf-free-bottom-progress-close {
          width: 2.35rem;
          height: 2.35rem;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          color: #12183e;
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(211, 221, 244, 0.9);
          cursor: pointer;
        }

        .sf-free-bottom-progress-close svg {
          width: 1.06rem;
          height: 1.06rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.7;
          stroke-linecap: round;
        }

        .sf-free-bottom-progress-loading,
        .sf-free-bottom-progress-error {
          margin-top: 1rem;
          min-height: 7rem;
          border-radius: 1rem;
          display: grid;
          place-items: center;
          color: #687197;
          background: rgba(255, 255, 255, 0.72);
          font-size: 0.9rem;
          font-weight: 820;
          text-align: center;
        }

        .sf-free-bottom-progress-error {
          color: #9b3351;
          background: rgba(255, 242, 247, 0.82);
        }

        .sf-free-bottom-progress-grid {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .sf-free-bottom-progress-stat,
        .sf-free-bottom-progress-card,
        .sf-free-bottom-progress-step {
          border: 1px solid rgba(222, 228, 247, 0.9);
          background: rgba(255, 255, 255, 0.76);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.94);
        }

        .sf-free-bottom-progress-stat {
          min-height: 4.35rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.18rem;
          text-align: center;
        }

        .sf-free-bottom-progress-stat span {
          color: #07103d;
          font-size: 1.46rem;
          font-weight: 1000;
          line-height: 1;
        }

        .sf-free-bottom-progress-stat small {
          color: #6a7197;
          font-size: 0.66rem;
          font-weight: 780;
          line-height: 1.16;
        }

        .sf-free-bottom-progress-card {
          margin-top: 0.7rem;
          border-radius: 1.06rem;
          padding: 0.88rem;
        }

        .sf-free-bottom-progress-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          color: #07103d;
          font-size: 0.9rem;
          font-weight: 900;
        }

        .sf-free-bottom-progress-card-head strong {
          color: #765cff;
          font-size: 1rem;
        }

        .sf-free-bottom-progress-track {
          margin-top: 0.65rem;
          height: 0.6rem;
          border-radius: 999px;
          background: rgba(230, 225, 255, 0.95);
          overflow: hidden;
        }

        .sf-free-bottom-progress-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #845cff, #3f82ff);
        }

        .sf-free-bottom-progress-card p {
          margin: 0.42rem 0 0;
          color: #6a7197;
          font-size: 0.72rem;
          font-weight: 760;
        }

        .sf-free-bottom-progress-steps {
          margin-top: 0.75rem;
          display: grid;
          gap: 0.48rem;
        }

        .sf-free-bottom-progress-step {
          min-height: 3.55rem;
          border-radius: 0.95rem;
          padding: 0.62rem 0.72rem;
          display: grid;
          grid-template-columns: 2rem minmax(0, 1fr);
          align-items: center;
          gap: 0.64rem;
        }

        .sf-free-bottom-progress-step-index {
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #ffffff;
          background: #a8abc4;
          font-size: 0.86rem;
          font-weight: 950;
        }

        .sf-free-bottom-progress-step.is-completed .sf-free-bottom-progress-step-index {
          background: linear-gradient(135deg, #6b76ff, #8d5cff);
        }

        .sf-free-bottom-progress-step.is-active .sf-free-bottom-progress-step-index {
          background: linear-gradient(135deg, #3f8cff, #7b63ff);
        }

        .sf-free-bottom-progress-step-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.16rem;
        }

        .sf-free-bottom-progress-step-copy strong {
          color: #07103d;
          font-size: 0.9rem;
          font-weight: 900;
          line-height: 1.18;
        }

        .sf-free-bottom-progress-step-copy small {
          color: #6d7398;
          font-size: 0.72rem;
          font-weight: 780;
        }
      `}</style>

      <nav className="sf-free-bottom-nav" aria-label="\u5b66\u4e60\u5bfc\u822a">
        <button
          type="button"
          className="sf-free-bottom-button is-active"
          onClick={onMenuClick}
          aria-label={menuLabel}
        >
          <BottomHomeIcon />
        </button>
        <button
          type="button"
          className="sf-free-bottom-button"
          onClick={openProgress}
          aria-label="\u67e5\u770b\u5b66\u4e60\u8fdb\u5ea6"
          aria-haspopup="dialog"
          aria-expanded={isProgressOpen}
        >
          <BottomProgressIcon />
        </button>
        <button
          type="button"
          className="sf-free-bottom-button"
          onClick={() => setIsHelpOpen(true)}
          aria-label="\u6253\u5f00\u81ea\u7531\u5b66\u4e60\u5e2e\u52a9"
          aria-haspopup="dialog"
          aria-expanded={isHelpOpen}
        >
          <BottomHelpIcon />
        </button>
        <button
          type="button"
          className="sf-free-bottom-button"
          onClick={onAccountClick}
          aria-label="\u6253\u5f00\u8d26\u6237"
        >
          <BottomAccountIcon />
          {hasProEntitlement ? <span className="sf-free-bottom-pro">PRO</span> : null}
        </button>
      </nav>

      {isHelpOpen ? (
        <FreeStudyHelpModal
          onClose={() => setIsHelpOpen(false)}
          onMenuClick={onMenuClick}
        />
      ) : null}

      {isProgressOpen ? (
        <div
          className="sf-free-bottom-progress-backdrop"
          role="presentation"
          onClick={() => setIsProgressOpen(false)}
        >
          <section
            className="sf-free-bottom-progress-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sf-free-bottom-progress-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sf-free-bottom-progress-head">
              <div>
                <p className="sf-free-bottom-progress-kicker">
                  {"\u5b66\u4e60\u8fdb\u5ea6"}
                </p>
                <h2 id="sf-free-bottom-progress-title">
                  {"\u81ea\u7531\u5b66\u4e60"}
                </h2>
              </div>
              <button
                type="button"
                className="sf-free-bottom-progress-close"
                onClick={() => setIsProgressOpen(false)}
                aria-label="\u5173\u95ed\u5b66\u4e60\u8fdb\u5ea6"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {progressError ? (
              <div className="sf-free-bottom-progress-error">{progressError}</div>
            ) : isProgressLoading || !progressSnapshot ? (
              <div className="sf-free-bottom-progress-loading">
                {"\u6b63\u5728\u540c\u6b65\u5b66\u4e60\u8fdb\u5ea6..."}
              </div>
            ) : (
              <>
                <div className="sf-free-bottom-progress-grid">
                  <div className="sf-free-bottom-progress-stat">
                    <span>{todayCompleted}</span>
                    <small>
                      {"\u4eca\u65e5\u5b8c\u6210 / "}
                      {dailyGoal}
                    </small>
                  </div>
                  <div className="sf-free-bottom-progress-stat">
                    <span>{streakDays}</span>
                    <small>{"\u8fde\u7eed\u5929\u6570"}</small>
                  </div>
                  <div className="sf-free-bottom-progress-stat">
                    <span>{totalCompleted}</span>
                    <small>{"\u7d2f\u8ba1\u5b8c\u6210"}</small>
                  </div>
                </div>

                <div className="sf-free-bottom-progress-card">
                  <div className="sf-free-bottom-progress-card-head">
                    <span>{"\u4eca\u65e5\u6311\u6218"}</span>
                    <strong>
                      {challengeCompleted}/{challengeGoal}
                    </strong>
                  </div>
                  <div className="sf-free-bottom-progress-track">
                    <span style={{ width: `${challengePercent}%` }} />
                  </div>
                  <p>
                    {challengePercent}
                    {"% \u5df2\u5b8c\u6210"}
                  </p>
                </div>

                <div className="sf-free-bottom-progress-steps">
                  {progressStepOrder.map((item, index) => {
                    const step = progressSnapshot?.steps?.[item.id];
                    const status = step?.status ?? "locked";

                    return (
                      <div
                        className={`sf-free-bottom-progress-step is-${status}`}
                        key={item.id}
                      >
                        <span className="sf-free-bottom-progress-step-index">
                          {index + 1}
                        </span>
                        <span className="sf-free-bottom-progress-step-copy">
                          <strong>{step?.label ?? item.fallbackLabel}</strong>
                          <small>{progressStatusCopy[status]}</small>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
