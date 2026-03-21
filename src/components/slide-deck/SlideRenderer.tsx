"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface SlideRendererProps {
  children: ReactNode;
  /** When true renders at thumbnail size (no resize listener needed) */
  thumbnail?: boolean;
  className?: string;
}

const NATIVE_W = 960;
const NATIVE_H = 540;

/**
 * Maintains a fixed 960×540 (16:9) native resolution and uses
 * transform: scale() to fit the available viewport space.
 * Scales up beyond 1× in fullscreen to fill the screen.
 */
export default function SlideRenderer({ children, thumbnail, className = "" }: SlideRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(thumbnail ? 0.1 : 1);

  useEffect(() => {
    if (thumbnail) return;
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const s = Math.min(width / NATIVE_W, height / NATIVE_H);
      setScale(s);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [thumbnail]);

  const renderedW = NATIVE_W * scale;
  const renderedH = NATIVE_H * scale;

  return (
    <div
      ref={containerRef}
      className={`${className} flex items-center justify-center`}
      style={thumbnail ? { width: 96, height: 54 } : { width: "100%", height: "100%" }}
    >
      <div
        style={{
          width: renderedW,
          height: renderedH,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: NATIVE_W,
            height: NATIVE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            className="w-full h-full overflow-hidden relative text-white"
            style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export { NATIVE_W, NATIVE_H };
