"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from "@/lib/motion";

const ROUTE_DRIFT_DURATION = MOTION_DURATION.fast + MOTION_STAGGER;

/**
 * Soft route transition. Avoid opacity:0 on enter — that blocks count-ups and
 * scroll reveals that wait for ancestors to become opaque.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useHydratedReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ y: 6 }}
          animate={{ y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: ROUTE_DRIFT_DURATION, ease: MOTION_EASE }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`route-scrim:${pathname}`}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[10000] bg-brand-50/80 will-change-[opacity] dark:bg-brand-950/80"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 38%, rgb(4 155 251 / 0.24), transparent 68%)",
          }}
          initial={{ opacity: 0.72 }}
          animate={{
            opacity: 0,
            transition: { delay: MOTION_STAGGER, duration: MOTION_DURATION.fast, ease: MOTION_EASE },
          }}
          exit={{
            opacity: 0.72,
            transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE },
          }}
        />
      </AnimatePresence>
    </>
  );
}
