"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { MOTION_EASE } from "@/lib/motion";
import { cx } from "@/utils/cx";

/**
 * A restrained radial brand wash that wakes up when its section reaches the
 * lower 20% of the viewport, then settles into the background.
 */
export default function SectionBloom({
  className,
  align = "center",
}: {
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useHydratedReducedMotion();
  const inView = useInView(ref, {
    once: true,
    margin: "0px 0px -20% 0px",
  });
  const x = align === "left" ? "-66%" : align === "right" ? "-34%" : "-50%";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      <motion.div
        className={cx(
          "absolute top-1/2 left-1/2 h-[34rem] w-[min(84rem,130vw)] rounded-full",
          className,
        )}
        initial={false}
        animate={
          reduceMotion
            ? { opacity: 0.16, scale: 1 }
            : inView
              ? { opacity: [0, 0.34, 0.2], scale: [0.86, 1.035, 1] }
              : { opacity: 0, scale: 0.86 }
        }
        transition={{ duration: 1.45, times: [0, 0.5, 1], ease: MOTION_EASE }}
        style={{
          x,
          y: "-50%",
          background:
            "radial-gradient(ellipse at center, rgb(4 155 251 / 0.28) 0%, rgb(4 116 188 / 0.1) 38%, transparent 72%)",
          filter: "blur(18px)",
          willChange: reduceMotion ? undefined : "transform, opacity",
        }}
      />
    </div>
  );
}
