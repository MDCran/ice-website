"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cx } from "@/utils/cx";

/**
 * LCP-optimized cinematic hero media.
 *
 * - Poster `next/image` with `priority` paints first.
 * - Muted inline video mounts shortly after first paint and retries autoplay.
 * - `respectReducedMotion` can opt specific placements into poster-only mode.
 */
export default function OptimizedHeroMedia({
  videoSrc = "/videos/data_center.mp4",
  posterSrc = "/videos/data_center_cover.jpg",
  posterAlt = "",
  className,
  respectReducedMotion = false,
  startDelayMs = 250,
}: {
  videoSrc?: string;
  posterSrc?: string;
  posterAlt?: string;
  className?: string;
  respectReducedMotion?: boolean;
  startDelayMs?: number;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const posterOnly = respectReducedMotion && reduceMotion;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    if (posterOnly) {
      setCanPlayVideo(false);
      setIsVideoReady(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setCanPlayVideo(true);
    }, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [posterOnly, startDelayMs]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canPlayVideo || posterOnly) return;

    el.muted = true;
    el.playsInline = true;
    el.load();

    const play = el.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        /* Autoplay blocked; the poster remains visible. */
      });
    }
  }, [canPlayVideo, posterOnly]);

  return (
    <div aria-hidden={posterAlt ? undefined : true} className={cx("absolute inset-0", className)}>
      <Image
        src={posterSrc}
        alt={posterAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {canPlayVideo && !posterOnly && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={posterSrc}
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
