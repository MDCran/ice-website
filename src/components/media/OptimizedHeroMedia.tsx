"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { useDeferredAutoplay } from "@/hooks/useDeferredAutoplay";
import { canOptimizeImageSource } from "@/lib/imageSources";
import { cx } from "@/utils/cx";

/**
 * LCP-optimized cinematic hero media.
 *
 * - Poster `next/image` with `priority` paints first.
 * - Muted inline video waits until the hero is visible and the browser is idle.
 * - The poster remains the fast, responsive fallback on mobile and slow links.
 */
export default function OptimizedHeroMedia({
  videoSrc = "/videos/data_center.mp4",
  posterSrc = "/videos/data_center_cover.webp",
  posterAlt = "",
  className,
  startDelayMs = 1800,
}: {
  videoSrc?: string;
  posterSrc?: string | null;
  posterAlt?: string;
  className?: string;
  startDelayMs?: number;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const posterOnly = reduceMotion;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canPlayVideo = useDeferredAutoplay(containerRef, {
    disabled: posterOnly,
    delayMs: startDelayMs,
  });
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canPlayVideo || posterOnly) return;

    el.muted = true;
    el.playsInline = true;
    const play = el.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        /* Autoplay blocked; the poster remains visible. */
      });
    }
  }, [canPlayVideo, posterOnly]);

  return (
    <div ref={containerRef} aria-hidden={posterAlt ? undefined : true} className={cx("absolute inset-0", className)}>
      {posterSrc && (
        <Image
          src={posterSrc}
          alt={posterAlt}
          fill
          unoptimized={!canOptimizeImageSource(posterSrc)}
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      {videoSrc && canPlayVideo && !posterOnly && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={posterSrc ?? undefined}
          onCanPlay={() => setIsVideoReady(true)}
          onPlaying={() => setIsVideoReady(true)}
          className={cx(
            "absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700",
            isVideoReady && "opacity-100",
          )}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
