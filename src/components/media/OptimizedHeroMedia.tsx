"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cx } from "@/utils/cx";

/**
 * LCP-optimized cinematic hero media.
 *
 * - Poster `next/image` with `priority` paints first (LCP candidate).
 * - Video mounts after idle / load and only when motion is allowed.
 * - Reduced motion → static poster only (no autoplay).
 */
export default function OptimizedHeroMedia({
  videoSrc = "/videos/data_center.mp4",
  posterSrc = "/videos/data_center_cover.jpg",
  posterAlt = "",
  className,
}: {
  videoSrc?: string;
  posterSrc?: string;
  posterAlt?: string;
  className?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setCanPlayVideo(false);
      return;
    }

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setCanPlayVideo(true);
    };

    // Defer video decode until after first paint / LCP.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 1800 });
    } else {
      timeoutId = setTimeout(enable, 600);
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
    if (!el || !canPlayVideo || reduceMotion) return;
    const play = el.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        /* Autoplay blocked — poster remains visible. */
      });
    }
  }, [canPlayVideo, reduceMotion]);

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
      {canPlayVideo && !reduceMotion && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={posterSrc}
          className="absolute inset-0 size-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
