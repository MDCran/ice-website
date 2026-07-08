"use client";

/* ══════════════════════════════════════════════════════════════════════════
   AMBIENT MOTION — a small set of GPU-friendly, continuously-looping
   decorative motion primitives so graphics stay gently alive as the user
   looks at a page (not just on-scroll reveals).

   Design rules honored by every export here:
   • transform / opacity only (no layout thrash) + will-change hints
   • pointer-events-none on all decorative layers
   • useReducedMotion → render static (no loop) or nothing
   • cheap: a handful of loops per viewport, long slow easings

   Uses `motion/react` (already the animation library across the site) and
   `cx` from `@/utils/cx` per the project design-system conventions.
   ══════════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";

/** Shared slow ease used across ambient loops. */
const AMBIENT_EASE = "easeInOut" as const;

/* ── FloatY ─────────────────────────────────────────────────────────────────
   Wraps children in a slow vertical bob so a hero graphic / illustration
   stays gently alive. Reduced motion → renders children unchanged. */
export function FloatY({
  children,
  className,
  distance = 8,
  duration = 7,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Peak upward travel in px. Keep small (6–12). */
  distance?: number;
  /** Full loop length in seconds (6–8 is the sweet spot). */
  duration?: number;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ willChange: "transform" }}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: AMBIENT_EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── PulseGlow ───────────────────────────────────────────────────────────────
   A single soft brand-blue radial glow blob that breathes (opacity + scale).
   Absolutely positioned by the caller via `className`; sits behind content.
   Reduced motion → static (rendered dimly) so the composition still reads. */
export function PulseGlow({
  className,
  duration = 8,
  delay = 0,
  from = 0.35,
  to = 0.7,
}: {
  className?: string;
  duration?: number;
  delay?: number;
  /** Low / high opacity bounds of the breath. */
  from?: number;
  to?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute rounded-full bg-brand-solid/20 blur-3xl",
        className,
      )}
      style={{ willChange: "transform, opacity" }}
      animate={
        reduceMotion ? undefined : { opacity: [from, to, from], scale: [1, 1.12, 1] }
      }
      transition={{ duration, delay, repeat: Infinity, ease: AMBIENT_EASE }}
    />
  );
}

/* ── Drift ───────────────────────────────────────────────────────────────────
   Very slow horizontal drift + subtle opacity sway for a background accent
   (e.g. a blurred blob or a gradient sheen). Longer + gentler than PulseGlow. */
export function Drift({
  children,
  className,
  distance = 24,
  duration = 16,
  delay = 0,
}: {
  children?: ReactNode;
  className?: string;
  /** Peak horizontal travel in px. */
  distance?: number;
  duration?: number;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div aria-hidden="true" className={cx("pointer-events-none", className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className={cx("pointer-events-none", className)}
      style={{ willChange: "transform, opacity" }}
      animate={{ x: [0, distance, 0], opacity: [0.6, 0.9, 0.6] }}
      transition={{ duration, delay, repeat: Infinity, ease: AMBIENT_EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── PulseAccent ─────────────────────────────────────────────────────────────
   Small brand dot emitting a slow sonar ping — a per-card / per-affordance
   accent that is always subtly alive. Inline element. */
export function PulseAccent({
  className,
  delay = 0,
  duration = 4,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <span aria-hidden="true" className={cx("relative inline-flex size-2 shrink-0", className)}>
      {!reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full bg-brand-solid"
          style={{ willChange: "transform, opacity" }}
          animate={{ scale: [1, 2.4], opacity: [0.45, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="relative inline-flex size-2 rounded-full bg-brand-solid/80" />
    </span>
  );
}

/* ── BrandOrbs ───────────────────────────────────────────────────────────────
   Decorative backdrop layer of 2–3 absolutely-positioned blurred brand-blue
   radial blobs that slowly drift + breathe behind a section's content.
   Drop it as the first child of a `relative isolate overflow-hidden` section.

   `variant` tunes tint for light section backgrounds ("subtle") vs. dark
   brand bands ("onBrand"). Total looping elements kept to 3. */
export function BrandOrbs({
  variant = "subtle",
  className,
}: {
  variant?: "subtle" | "onBrand";
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const tint =
    variant === "onBrand"
      ? { a: "bg-brand-400/40", b: "bg-brand-600/40", c: "bg-brand-solid/25" }
      : { a: "bg-brand-solid/15", b: "bg-brand-solid/10", c: "bg-brand-solid/[0.07]" };

  // Static fallback: render the orbs dimly so the section keeps its depth,
  // but with no loop running.
  const orbBase = "pointer-events-none absolute rounded-full blur-3xl";

  if (reduceMotion) {
    return (
      <div aria-hidden="true" className={cx("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
        <div className={cx(orbBase, tint.a, "-top-24 -left-16 size-72 opacity-50")} />
        <div className={cx(orbBase, tint.b, "top-1/3 -right-20 size-80 opacity-40")} />
        <div className={cx(orbBase, tint.c, "-bottom-28 left-1/3 size-72 opacity-40")} />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={cx("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <motion.div
        className={cx(orbBase, tint.a, "-top-24 -left-16 size-72")}
        style={{ willChange: "transform, opacity" }}
        animate={{ x: [0, 26, 0], y: [0, 16, 0], opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: AMBIENT_EASE }}
      />
      <motion.div
        className={cx(orbBase, tint.b, "top-1/3 -right-20 size-80")}
        style={{ willChange: "transform, opacity" }}
        animate={{ x: [0, -22, 0], y: [0, -18, 0], opacity: [0.55, 0.3, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, delay: 1.5, repeat: Infinity, ease: AMBIENT_EASE }}
      />
      <motion.div
        className={cx(orbBase, tint.c, "-bottom-28 left-1/3 size-72")}
        style={{ willChange: "transform, opacity" }}
        animate={{ x: [0, 18, 0], y: [0, -14, 0], opacity: [0.35, 0.6, 0.35], scale: [1, 1.12, 1] }}
        transition={{ duration: 26, delay: 3, repeat: Infinity, ease: AMBIENT_EASE }}
      />
    </div>
  );
}
