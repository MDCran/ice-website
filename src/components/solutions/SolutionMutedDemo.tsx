"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cx } from "@/utils/cx";

/**
 * Sound-optional product demo (#56) — muted autoplay loop for solution pages.
 * Reduced motion shows the poster only.
 */
export default function SolutionMutedDemo({
  videoSrc,
  posterSrc,
  caption = "Product walkthrough (muted)",
  className,
}: {
  videoSrc: string;
  posterSrc?: string;
  caption?: string;
  className?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 2200 });
    } else {
      timeoutId = setTimeout(enable, 700);
    }
    return () => {
      cancelled = true;
      if (idleId != null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [reduceMotion]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready || reduceMotion) return;
    const play = el.play();
    if (play && typeof play.catch === "function") play.catch(() => undefined);
  }, [ready, reduceMotion]);

  return (
    <figure
      className={cx(
        "overflow-hidden rounded-xl bg-secondary shadow-xs ring-1 ring-secondary",
        className,
      )}
    >
      <div className="relative aspect-video w-full bg-primary">
        {posterSrc && (
          <Image
            src={posterSrc}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        )}
        {!reduceMotion && ready && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label={caption}
          />
        )}
      </div>
      <figcaption className="border-t border-secondary px-4 py-2 text-xs text-tertiary">
        {caption}
        {reduceMotion ? " · static preview (reduced motion)" : " · autoplays muted"}
      </figcaption>
    </figure>
  );
}
