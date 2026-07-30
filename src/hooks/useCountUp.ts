"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Ease-out cubic — fast start, settles on the final value. */
export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * Count from 0 → target once `inView` is true.
 * Always tweens (By The Numbers / metrics are expected to animate).
 * Strict Mode safe via run-id cancellation.
 */
export function useCountUp(
  target: number,
  inView: boolean,
  options: {
    duration?: number;
    decimals?: number;
    elementRef?: RefObject<HTMLElement | null>;
    delayMs?: number;
  } = {},
) {
  const { duration = 1800, decimals = 0, delayMs = 120 } = options;
  const [count, setCount] = useState(0);
  const finishedRef = useRef(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    if (!inView) {
      finishedRef.current = false;
      setCount(0);
      return;
    }

    if (!Number.isFinite(target) || target === 0) {
      finishedRef.current = true;
      setCount(target || 0);
      return;
    }

    if (finishedRef.current) {
      setCount(target);
      return;
    }

    const runId = ++runIdRef.current;
    let raf = 0;
    const factor = 10 ** decimals;

    setCount(0);

    const delayTimer = window.setTimeout(() => {
      if (runId !== runIdRef.current) return;

      const start = performance.now();

      const tick = (now: number) => {
        if (runId !== runIdRef.current) return;
        const t = Math.min(1, (now - start) / duration);
        const eased = easeOutCubic(t);
        const next = Math.floor(target * eased * factor) / factor;
        setCount(t >= 1 ? target : next);
        if (t >= 1) {
          finishedRef.current = true;
          return;
        }
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      runIdRef.current += 1; // invalidate in-flight tween
      window.clearTimeout(delayTimer);
      cancelAnimationFrame(raf);
    };
  }, [inView, target, duration, decimals, delayMs]);

  return count;
}

export function formatCountValue(count: number, decimals: number, grouped: boolean) {
  if (grouped) {
    return count.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString("en-US");
}
