"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

/**
 * Public-site scroll conductor.
 *
 * Lenis only smooths wheel input; touch remains native. The instance is
 * destroyed as soon as the OS reduced-motion preference is enabled.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const reduceMotion = useHydratedReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (
      reduceMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: false,
      autoToggle: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.095,
      wheelMultiplier: 0.88,
      anchors: {
        offset: -84,
        duration: 1,
      },
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;
    const updateScrollTriggers = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", updateScrollTriggers);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", updateScrollTriggers);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      lenisRef.current?.resize();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
