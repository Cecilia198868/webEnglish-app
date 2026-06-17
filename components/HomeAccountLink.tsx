"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./WebHomePageClient.module.css";

type SessionResponse = {
  user?: {
    email?: string | null;
    image?: string | null;
    name?: string | null;
  } | null;
};

const accountAvatarStoragePrefix = "speakflow-account-avatar";

function getAccountAvatarStorageKey(identifier: string) {
  return `${accountAvatarStoragePrefix}:${identifier || "local-user"}`;
}

function getDisplayName(name: string, email: string) {
  const trimmedName = name.trim();
  if (trimmedName) return trimmedName;

  const emailName = email.split("@")[0]?.trim();
  if (emailName) return emailName;

  return "English learner";
}

export default function HomeAccountLink() {
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountImage, setAccountImage] = useState("");
  const [accountImageFailed, setAccountImageFailed] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const session = (await response.json()) as SessionResponse;
        if (cancelled) return;

        if (!session.user) {
          setIsSignedIn(false);
          setAccountName("");
          setAccountEmail("");
          setAccountImage("");
          setAccountImageFailed(false);
          return;
        }

        const nextName = session.user?.name || "";
        const nextEmail = session.user?.email || "";
        const savedAvatar = window.localStorage.getItem(
          getAccountAvatarStorageKey(nextEmail || nextName)
        );

        setIsSignedIn(Boolean(session.user));
        setAccountName(nextName);
        setAccountEmail(nextEmail);
        setAccountImage(savedAvatar || session.user?.image || "");
        setAccountImageFailed(false);
      } catch {
        if (!cancelled) {
          setIsSignedIn(false);
          setAccountName("");
          setAccountEmail("");
          setAccountImage("");
        }
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = isSignedIn ? getDisplayName(accountName, accountEmail) : "登录 / 账户";
  const initials = useMemo(
    () =>
      isSignedIn
        ? displayName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "EL"
        : "账",
    [displayName, isSignedIn]
  );
  return (
    <Link className={styles.accountLink} href="/account" aria-label="打开账户界面">
      <span className={styles.accountAvatar} aria-hidden="true">
        {accountImage && !accountImageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.accountAvatarImage}
            src={accountImage}
            alt=""
            draggable={false}
            onError={() => setAccountImageFailed(true)}
          />
        ) : (
          <span className={styles.accountInitials}>{initials}</span>
        )}
      </span>
      <span className={styles.accountName}>{displayName}</span>
    </Link>
  );
}
