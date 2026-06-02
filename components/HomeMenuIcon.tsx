"use client";

import { useEffect, useState } from "react";

type HomeMenuIconProps = {
  className?: string;
  label?: string | null;
  showHint?: boolean;
};

const HOME_RETURN_HINT_STORAGE_KEY = "speakflow-home-return-hint-seen-v1";

export default function HomeMenuIcon({
  className = "",
  label = "首页",
  showHint = true,
}: HomeMenuIconProps) {
  const classNames = ["sf-home-menu-icon", className].filter(Boolean).join(" ");
  const shouldShowHint = showHint && label === null;
  const [isHintVisible, setIsHintVisible] = useState(false);

  useEffect(() => {
    if (!shouldShowHint) return;

    try {
      if (window.localStorage.getItem(HOME_RETURN_HINT_STORAGE_KEY)) return;
      window.localStorage.setItem(HOME_RETURN_HINT_STORAGE_KEY, "1");
    } catch {
      // If storage is unavailable, still show the hint once for this mount.
    }

    const showTimer = window.setTimeout(() => {
      setIsHintVisible(true);
    }, 0);
    const hideTimer = window.setTimeout(() => {
      setIsHintVisible(false);
    }, 5200);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [shouldShowHint]);

  return (
    <>
      <span aria-hidden="true" className={classNames}>
        <svg viewBox="0 0 32 32" focusable="false">
          <path d="M6.5 15.2 16 7.6l9.5 7.6v9.6a2.4 2.4 0 0 1-2.4 2.4h-4.7v-7.1h-4.8v7.1H8.9a2.4 2.4 0 0 1-2.4-2.4v-9.6Z" />
        </svg>
        {label ? <span>{label}</span> : null}
      </span>
      {isHintVisible ? (
        <span className="sf-home-return-hint" role="tooltip">
          点击左上角返回首页
        </span>
      ) : null}
    </>
  );
}
