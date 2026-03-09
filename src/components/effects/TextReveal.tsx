"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: ReactNode;
  stagger?: number;
  className?: string;
}

export default function TextReveal({
  children,
  stagger = 0.05,
  className,
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const words = el.querySelectorAll<HTMLSpanElement>(".tr-word");
      if (!words.length) return;

      gsap.fromTo(
        words,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  const text = typeof children === "string" ? children : "";

  if (!text) {
    return (
      <span ref={containerRef} className={className}>
        {children}
      </span>
    );
  }

  const words = text.split(/\s+/);

  return (
    <span ref={containerRef} className={cn("inline", className)}>
      {words.map((word, i) => (
        <span key={i} className="tr-word inline-block opacity-0" style={{ marginRight: "0.3em" }}>
          {word}
        </span>
      ))}
    </span>
  );
}
