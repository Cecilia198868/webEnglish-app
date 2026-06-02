"use client";

import { useEffect, useRef } from "react";
import HomeMenuIcon from "@/components/HomeMenuIcon";

type FreeStudyHeaderProps = {
  accountLabel?: string;
  avatarAlt?: string;
  avatarSrc?: string;
  menuIcon?: "menu" | "home";
  menuLabel?: string;
  onAccountClick: () => void;
  onAvatarError?: () => void;
  onMenuClick: () => void;
};

export default function FreeStudyHeader({
  accountLabel = "Open account menu",
  avatarAlt = "user",
  avatarSrc = "",
  menuIcon = "menu",
  menuLabel = "Open menu",
  onAccountClick,
  onAvatarError,
  onMenuClick,
}: FreeStudyHeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const headerElement = header;

    const shell = headerElement.closest(".sf-speak-phone") as HTMLElement | null;
    if (!shell) return;
    const phoneShell = shell;

    function syncHeaderHeight() {
      phoneShell.style.setProperty(
        "--free-study-header-height",
        `${headerElement.getBoundingClientRect().height}px`
      );
    }

    syncHeaderHeight();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(syncHeaderHeight);

    resizeObserver?.observe(headerElement);
    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
      phoneShell.style.removeProperty("--free-study-header-height");
    };
  }, []);

  return (
    <header ref={headerRef} className="sf-free-study-header">
      <div className="sf-free-study-header-card">
        <button
          type="button"
          aria-label={menuLabel}
          onClick={onMenuClick}
          className={`sf-free-study-header-menu-button ${
            menuIcon === "home" ? "is-home" : ""
          }`}
        >
          {menuIcon === "home" ? (
            <HomeMenuIcon label={null} showHint={false} />
          ) : (
            <>
              <span aria-hidden="true" className="sf-free-study-header-menu-line" />
              <span aria-hidden="true" className="sf-free-study-header-menu-line" />
              <span aria-hidden="true" className="sf-free-study-header-menu-line" />
            </>
          )}
        </button>

        <div className="sf-free-study-header-brand" aria-hidden="true">
          <span className="sf-free-study-header-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/logo.png"
              alt=""
              className="sf-free-study-header-logo-image"
              draggable={false}
            />
          </span>
          <span className="sf-free-study-header-brand-copy">
            <span className="sf-free-study-header-title">SpeakFlow</span>
            <span className="sf-free-study-header-subtitle">VOICE PRACTICE</span>
          </span>
        </div>

        <button
          type="button"
          aria-label={accountLabel}
          onClick={onAccountClick}
          className="sf-free-study-header-avatar-button"
          title={avatarAlt}
        >
          <span aria-hidden="true" className="sf-free-study-header-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc || "/default-avatar.png"}
              alt=""
              className="sf-free-study-header-avatar-image"
              onError={onAvatarError}
            />
          </span>
        </button>
      </div>
    </header>
  );
}
