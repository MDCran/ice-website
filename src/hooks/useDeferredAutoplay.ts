"use client";

import { useEffect, useState, type RefObject } from "react";

/** Delay decorative video until it is useful, and skip it on constrained devices. */
export function useDeferredAutoplay(
  targetRef: RefObject<Element | null>,
  { disabled = false, delayMs = 1600 }: { disabled?: boolean; delayMs?: number } = {},
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || disabled || typeof window === "undefined") return;

    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const slowConnection = ["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches ||
      connection?.saveData ||
      slowConnection
    ) {
      return;
    }

    let timerId: number | undefined;
    let idleId: number | undefined;
    let cancelled = false;
    const schedule = () => {
      const enable = () => {
        timerId = window.setTimeout(() => {
          if (!cancelled) setReady(true);
        }, delayMs);
      };

      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(enable, { timeout: 3500 });
      } else {
        enable();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        schedule();
      },
      { rootMargin: "160px", threshold: 0.01 },
    );
    observer.observe(target);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (idleId != null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId != null) window.clearTimeout(timerId);
    };
  }, [delayMs, disabled, targetRef]);

  return ready;
}
