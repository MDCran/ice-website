"use client";

import Image from "next/image";
import { cx } from "@/utils/cx";

interface SolutionHeroImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

/**
 * LCP-friendly solution hero media — uses next/image with priority + sizes.
 */
export default function SolutionHeroImage({
  src,
  alt,
  priority = true,
  className,
}: SolutionHeroImageProps) {
  return (
    <div
      className={cx(
        "relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-secondary bg-secondary shadow-2xl dark:shadow-[0_24px_90px_rgb(4_155_251/0.18)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 560px"
          className="object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10"
      />
    </div>
  );
}
