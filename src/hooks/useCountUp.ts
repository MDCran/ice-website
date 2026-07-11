"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Ease-out cubic — fast start, settles on the final value. */
export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when the element (and ancestors) are effectively visible (not opacity:0). */
function isEffectivelyOpaque(el: Element | null): boolean {
  let node: Element | null = el;
  while (node && node instanceof HTMLElement) {
    const opacity = Number.parseFloat(getComputedStyle(node).opacity);
    if (!Number.isFinite(opacity) || opacity < 0.05) return false;
    if (getComputedStyle(node).visibility === "hidden") return false;
    node = node.parentElement;
  }
  return true;
}

/**
 * Count from 0 → target once `inView` is true AND the observed node is opaque.
 * Double-rAF paints "0" before the first eased frame. Reduced motion → final value.
 */
export function useCountUp(
  target: number,
  inView: boolean,
  options: {
    duration?: number;
    decimals?: number;
    /** Optional element to verify opacity before tweening. */
    elementRef?: RefObject<HTMLElement | null>;
  } = {},
) {
  const { duration = 1400, decimals = 0, elementRef } = options;
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView) {
      startedRef.current = false;
      setCount(0);
      return;
    }

    if (prefersReducedMotion() || target === 0) {
      setCount(target);
      startedRef.current = true;
      return;
    }

    if (startedRef.current) return;

    let cancelled = false;
    let raf = 0;
    let poll = 0;
    const factor = 10 ** decimals;

    const startTween = () => {
      if (cancelled || startedRef.current) return;
      startedRef.current = true;
      setCount(0);

      // Paint 0, then start the tween on the following frame.
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame((start) => {
          const tick = (now: number) => {
            if (cancelled) return;
            const t = Math.min(1, (now - start) / duration);
            const eased = easeOutCubic(t);
            const next = Math.floor(target * eased * factor) / factor;
            setCount(t >= 1 ? target : next);
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          tick(start);
        });
      });
    };

    const tryStart = () => {
      if (cancelled) return;
      const el = elementRef?.current ?? null;
      if (el && !isEffectivelyOpaque(el)) {
        poll = window.setTimeout(tryStart, 50);
        return;
      }
      startTween();
    };

    tryStart();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(poll);
    };
  }, [inView, target, duration, decimals, elementRef]);

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
