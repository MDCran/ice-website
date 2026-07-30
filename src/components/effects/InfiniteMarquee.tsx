"use client";

import { useState, type ReactNode } from "react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { AMBIENT_CYCLE_SECONDS } from "@/lib/motion";
import { cx } from "@/utils/cx";

/**
 * Seamless infinite horizontal marquee.
 * Uses CSS `@keyframes ice-marquee` (translateX -50%) with two identical tracks.
 * Always animates (decorative); pauses only on hover/focus when enabled.
 */
export default function InfiniteMarquee({
  renderTrack,
  className,
  /** CSS duration for one full loop (two tracks → -50%). */
  durationSec = AMBIENT_CYCLE_SECONDS * 2,
  pauseOnHover = true,
}: {
  renderTrack: () => ReactNode;
  className?: string;
  durationSec?: number;
  pauseOnHover?: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const reduceMotion = useHydratedReducedMotion();

  return (
    <div
      className={cx(
        "overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className,
      )}
      onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
      onFocusCapture={pauseOnHover ? () => setPaused(true) : undefined}
      onBlurCapture={
        pauseOnHover
          ? (e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setPaused(false);
              }
            }
          : undefined
      }
    >
      <div
        className="animate-ice-marquee flex w-max items-center"
        style={{
          animationDuration: `${durationSec}s`,
          animationPlayState: reduceMotion || paused ? "paused" : "running",
          transform: reduceMotion ? "translateX(0)" : undefined,
          willChange: reduceMotion ? "auto" : "transform",
        }}
      >
        <div className="flex shrink-0 items-center">{renderTrack()}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {renderTrack()}
        </div>
      </div>
    </div>
  );
}
