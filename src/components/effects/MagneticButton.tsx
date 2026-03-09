"use client";

import { useMagneticButton } from "@/hooks/useMagneticButton";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function MagneticButton({ children, className = "" }: MagneticButtonProps) {
  const { ref, style, onMouseMove, onMouseLeave } = useMagneticButton();

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  );
}
