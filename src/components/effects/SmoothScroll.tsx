"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Public-site scroll conductor.
 *
 * Lenis smooths wheel input across desktop browsers; touch remains native.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      autoToggle: false,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.08,
      wheelMultiplier: 0.82,
      anchors: {
        offset: -84,
        duration: 1,
      },
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;
    document.documentElement.dataset.smoothScroll = "lenis";
    const updateScrollTriggers = () => {
      ScrollTrigger.update();
      window.dispatchEvent(
        new CustomEvent("ice:scroll", {
          detail: { scroll: lenis.scroll },
        }),
      );
    };
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
      delete document.documentElement.dataset.smoothScroll;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      lenisRef.current?.resize();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
