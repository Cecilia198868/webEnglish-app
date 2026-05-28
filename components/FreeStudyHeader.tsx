"use client";

import { useEffect, useRef } from "react";

type FreeStudyHeaderProps = {
  accountLabel?: string;
  avatarAlt?: string;
  avatarSrc?: string;
  menuLabel?: string;
  onAccountClick: () => void;
  onAvatarError?: () => void;
  onMenuClick: () => void;
};

export default function FreeStudyHeader({
  accountLabel = "Open account menu",
  avatarAlt = "user",
  avatarSrc = "",
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
      <div className="sf-free-study-header-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/free-study-header.jpg"
          alt=""
          aria-hidden="true"
          className="sf-free-study-header-image"
          draggable={false}
        />

        {avatarSrc ? (
          <span aria-hidden="true" className="sf-free-study-header-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt=""
              className="sf-free-study-header-avatar-image"
              onError={onAvatarError}
            />
          </span>
        ) : null}

        <button
          type="button"
          aria-label={menuLabel}
          onClick={onMenuClick}
          className="sf-free-study-header-menu-hit"
        />

        <button
          type="button"
          aria-label={accountLabel}
          onClick={onAccountClick}
          className="sf-free-study-header-avatar-button"
          title={avatarAlt}
        />
      </div>
    </header>
  );
}
