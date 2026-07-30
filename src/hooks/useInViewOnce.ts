"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reliable once-only in-view detection via IntersectionObserver.
 * More predictable than motion's useInView for count-up triggers.
 */
export function useInViewOnce<T extends Element>(
  options: { amount?: number; rootMargin?: string } = {},
) {
  const { amount = 0.25, rootMargin = "0px 0px -10% 0px" } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // Fallback: animate anyway so count-ups never stay stuck at 0.
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: amount, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, amount, rootMargin]);

  return { ref, inView };
}
