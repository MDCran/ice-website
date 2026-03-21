/**
 * Shared animation helpers for slide content.
 * - Content animates IN smoothly when active becomes true
 * - Going OUT snaps instantly (duration: 0) — no flicker with parent crossfade
 * - Initial state matches the hidden state — no flash on mount
 */

type Easing = [number, number, number, number];
const EASE: Easing = [0.25, 0.1, 0.25, 1];

/** Fade in + slide from a direction */
export function fadeIn(
  active: boolean,
  delay: number,
  { x = 0, y = 0, scale }: { x?: number; y?: number; scale?: number } = {},
) {
  const hidden: Record<string, number> = { opacity: 0 };
  const visible: Record<string, number> = { opacity: 1 };
  if (x) { hidden.x = x; visible.x = 0; }
  if (y) { hidden.y = y; visible.y = 0; }
  if (scale !== undefined) { hidden.scale = scale; visible.scale = 1; }

  return {
    initial: hidden,
    animate: active ? visible : hidden,
    transition: active
      ? { duration: 0.5, delay, ease: EASE }
      : { duration: 0 },
  };
}

/** Animate a numeric value (e.g. bar height) */
export function growTo(
  active: boolean,
  delay: number,
  prop: string,
  value: number,
) {
  return {
    initial: { [prop]: 0 },
    animate: active ? { [prop]: value } : { [prop]: 0 },
    transition: active
      ? { duration: 0.7, delay, ease: EASE }
      : { duration: 0 },
  };
}
