"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cx } from "@/utils/cx";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Scroll entrance reveal — translate only (no opacity:0 start) so nested
 * count-ups and media stay visible even if ScrollTrigger is delayed.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = MOTION_DURATION.reveal,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useHydratedReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduceMotion) return;

      gsap.fromTo(
        el,
        { y: 28 },
        {
          y: 0,
          delay,
          duration,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        },
      );
    },
    { dependencies: [delay, duration, reduceMotion] },
  );

  return (
    <div ref={ref} className={cx(className)} data-motion-ease={MOTION_EASE.join(",")}>
      {children}
    </div>
  );
}
