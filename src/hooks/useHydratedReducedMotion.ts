"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? Boolean(prefersReducedMotion) : false;
}
