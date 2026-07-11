"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "ice_pv_session";

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "anon";
  }
}

function sendBeacon(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/pageview", blob);
    return;
  }
  void fetch("/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/**
 * Logs a first-party pageview and (when available) LCP for the admin dashboard.
 * Mount only on public routes — skips /admin, /portal, /api.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);
  const lcpSent = useRef(false);

  useEffect(() => {
    if (!pathname) return;
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/portal") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/login")
    ) {
      return;
    }

    const search = searchParams?.toString();
    const path = search ? `${pathname}?${search}` : pathname;
    // Dedupe rapid remounts for the same path
    if (lastPath.current === path) return;
    lastPath.current = path;
    lcpSent.current = false;

    const sessionId = getSessionId();
    const base = {
      path: pathname,
      title: typeof document !== "undefined" ? document.title : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      session_id: sessionId,
    };

    sendBeacon(base);

    // Capture LCP once per navigation and send a follow-up sample
    if (typeof PerformanceObserver === "undefined") return;

    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry & { startTime?: number };
        if (!last || lcpSent.current) return;
        lcpSent.current = true;
        sendBeacon({ ...base, lcp_ms: last.startTime });
        observer?.disconnect();
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // Unsupported browser — pageview already sent
    }

    return () => {
      observer?.disconnect();
    };
  }, [pathname, searchParams]);

  return null;
}
