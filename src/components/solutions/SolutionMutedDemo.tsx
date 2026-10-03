"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { useDeferredAutoplay } from "@/hooks/useDeferredAutoplay";
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
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const ready = useDeferredAutoplay(videoContainerRef, { disabled: reduceMotion, delayMs: 900 });

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
      <div ref={videoContainerRef} className="relative aspect-video w-full bg-primary">
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
            preload="none"
            aria-label={caption}
          />
        )}
      </div>
      <figcaption className="border-t border-secondary px-4 py-2 text-xs text-tertiary">
        {caption}
      </figcaption>
    </figure>
  );
}
