"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Hydration-safe reduced-motion flag for the ICE marketing site.
 *
 * Returns `false` on the server and during the first client paint so SSR markup
 * matches the animated initial state. After hydration, mirrors the OS
 * `prefers-reduced-motion` setting (and Motion's `useReducedMotion`).
 *
 * All brand motion (reveals, count-ups, marquees, ambient loops, hero video)
 * should gate on this hook — see `src/lib/motion.ts` for the shared budget.
 */
export function useHydratedReducedMotion(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? Boolean(prefersReducedMotion) : false;
}
