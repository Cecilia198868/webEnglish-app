"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_STORAGE_KEY = "speakflow_visitor_id";

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 14)}`;
}

function getVisitorId() {
  try {
    const storedVisitorId = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);
    if (storedVisitorId) return storedVisitorId;

    const visitorId = createVisitorId();
    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
    return visitorId;
  } catch {
    return createVisitorId();
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/api/")) return;

    const visitorId = getVisitorId();

    void fetch("/api/page-views", {
      body: JSON.stringify({ path: pathname, visitorId }),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      method: "POST",
    }).catch(() => {
      // Analytics must never interrupt learning.
    });
  }, [pathname]);

  return null;
}
