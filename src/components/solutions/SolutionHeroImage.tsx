"use client";

interface SolutionHeroImageProps {
  src: string;
  alt: string;
}

export default function SolutionHeroImage({ src, alt }: SolutionHeroImageProps) {
  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-secondary bg-secondary shadow-2xl dark:shadow-[0_24px_90px_rgb(4_155_251/0.18)]">
      <div className="relative aspect-[16/10]">
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10"
      />
    </div>
  );
}
