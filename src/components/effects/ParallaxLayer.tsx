"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cx } from "@/utils/cx";

/**
 * A tiny scroll-linked drift for decorative atmosphere only.
 * Keep content outside this component so reading position stays locked.
 */
export default function ParallaxLayer({
  children,
  className,
  distance = 10,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  /** Total travel from one edge of the viewport to the other, in pixels. */
  distance?: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useHydratedReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const halfDistance = distance / 2;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reverse ? [halfDistance, -halfDistance] : [-halfDistance, halfDistance],
  );

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={cx("pointer-events-none", className)}
      style={{ y: reduceMotion ? 0 : y, willChange: reduceMotion ? undefined : "transform" }}
    >
      {children}
    </motion.div>
  );
}
