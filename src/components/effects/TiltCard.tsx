"use client";

import { useTiltEffect } from "@/hooks/useTiltEffect";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}

export default function TiltCard({ children, className = "", maxTilt = 8, scale = 1.02 }: TiltCardProps) {
  const { ref, onMouseMove, onMouseLeave } = useTiltEffect({ maxTilt, scale });

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
