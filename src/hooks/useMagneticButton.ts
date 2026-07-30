"use client";

import { useEffect, useRef } from "react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

/**
 * Adds a clamped, pointer-only magnetic drift without re-rendering on every
 * pointer move. CSS variables keep the root transform composable with press.
 */
export function useMagneticButton<T extends HTMLElement = HTMLDivElement>(
  maxOffset = 3,
  enabled = true,
) {
  const ref = useRef<T>(null);
  const reduceMotion = useHydratedReducedMotion();

  useEffect(() => {
    const element = ref.current;
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!element || !enabled || reduceMotion || !hoverQuery.matches) return;

    let frame = 0;

    const reset = () => {
      window.cancelAnimationFrame(frame);
      element.dataset.magneticActive = "false";
      element.style.setProperty("--ice-magnetic-x", "0px");
      element.style.setProperty("--ice-magnetic-y", "0px");
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const normalizedX =
          (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const normalizedY =
          (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        const x = Math.max(-1, Math.min(1, normalizedX)) * maxOffset;
        const y = Math.max(-1, Math.min(1, normalizedY)) * maxOffset;

        element.dataset.magneticActive = "true";
        element.style.setProperty("--ice-magnetic-x", `${x.toFixed(2)}px`);
        element.style.setProperty("--ice-magnetic-y", `${y.toFixed(2)}px`);
      });
    };
    const leave = (event: PointerEvent) => {
      if (!element.contains(event.relatedTarget as Node | null)) reset();
    };
    const resetWhenOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !element.contains(event.target)) reset();
    };

    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", reset);
    element.addEventListener("pointerout", leave);
    element.addEventListener("lostpointercapture", reset);
    element.addEventListener("blur", reset, true);
    window.addEventListener("pointermove", resetWhenOutside, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      element.removeEventListener("pointerout", leave);
      element.removeEventListener("lostpointercapture", reset);
      element.removeEventListener("blur", reset, true);
      window.removeEventListener("pointermove", resetWhenOutside);
      reset();
    };
  }, [enabled, maxOffset, reduceMotion]);

  return { ref };
}
