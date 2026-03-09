"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface GradientMeshBlobProps {
  className?: string;
}

export default function GradientMeshBlob({ className }: GradientMeshBlobProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const blobs = el.querySelectorAll<HTMLDivElement>(".mesh-blob");

      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          x: () => gsap.utils.random(-60, 60),
          y: () => gsap.utils.random(-40, 40),
          scale: () => gsap.utils.random(0.8, 1.2),
          opacity: () => gsap.utils.random(0.06, 0.15),
          duration: gsap.utils.random(8, 14),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 2,
        });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true">
      <div className="mesh-blob absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[100px]" />
      <div className="mesh-blob absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="mesh-blob absolute top-2/3 left-1/2 w-[350px] h-[350px] rounded-full bg-teal-500/8 blur-[100px]" />
    </div>
  );
}
