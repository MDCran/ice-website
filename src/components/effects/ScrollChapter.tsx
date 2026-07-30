"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

/**
 * Scroll-driven chapter (#2) — pins lightly and fades/slides content in via GSAP.
 * Reduced motion → static block, no ScrollTrigger.
 */
export default function ScrollChapter({
  children,
  className,
  pin = false,
}: {
  children: ReactNode;
  className?: string;
  /** Soft pin while the chapter is in view (desktop only). */
  pin?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useHydratedReducedMotion();

  useEffect(() => {
    if (reduceMotion || !ref.current) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");
      if (cancelled || !ref.current) return;

      ctx = gsap.context(() => {
        const el = ref.current!;
        gsap.fromTo(
          el,
          { opacity: 0.35, y: 48 },
          {
            opacity: 1,
            y: 0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: pin ? "+=40%" : "top 40%",
              scrub: pin ? 0.6 : false,
              pin: pin && typeof window !== "undefined" && window.innerWidth >= 1024,
              pinSpacing: pin,
              once: !pin,
            },
          },
        );
      }, ref);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduceMotion, pin]);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
