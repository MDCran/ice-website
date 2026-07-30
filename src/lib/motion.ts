/**
 * ICE motion budget — single source of truth for durations, easings, and
 * motion-intensity rules used across the public marketing site.
 *
 * Design rules:
 * - Prefer opacity + transform only (no layout thrash).
 * - Keep ambient loops slow (16–96s) and sparse (≤3 looping elements / viewport).
 * - Entrance reveals: ~0.45–0.7s with the shared premium ease.
 * - Always honor `prefers-reduced-motion` via `useHydratedReducedMotion`.
 */

/** Premium ease used for entrance / exit reveals. */
export const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Named durations (seconds) for motion/react and CSS. */
export const MOTION_DURATION = {
  instant: 0.1,
  fast: 0.16,
  base: 0.45,
  reveal: 0.6,
  slow: 0.8,
  ambientShort: 7,
  ambient: 12,
  ambientLong: 32,
} as const;

/** Stagger step between sibling entrance items. */
export const MOTION_STAGGER = 0.07;

/** Shared wallpaper rhythm. Longer effects use whole multiples of this beat. */
export const AMBIENT_CYCLE_SECONDS = 32;

/** Max simultaneous ambient loops recommended per viewport. */
export const MOTION_AMBIENT_BUDGET = 3;

/** Default viewport for whileInView reveals. */
export const MOTION_VIEWPORT = { once: true, margin: "-80px" as const };

/** Factory for below-the-fold reveal props. */
export function revealProps(reduceMotion: boolean, delay = 0) {
  if (reduceMotion) {
    return {
      initial: false as const,
      whileInView: { opacity: 1, y: 0 },
      viewport: MOTION_VIEWPORT,
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: MOTION_VIEWPORT,
    transition: { duration: MOTION_DURATION.reveal, delay, ease: MOTION_EASE },
  };
}

/** Factory for above-the-fold hero mount reveals. */
export function heroRevealProps(reduceMotion: boolean, delay = 0) {
  if (reduceMotion) {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: MOTION_DURATION.reveal, delay, ease: MOTION_EASE },
  };
}
