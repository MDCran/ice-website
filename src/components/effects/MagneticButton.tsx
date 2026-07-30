"use client";

import { useMagneticButton } from "@/hooks/useMagneticButton";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function MagneticButton({ children, className = "" }: MagneticButtonProps) {
  const { ref } = useMagneticButton();

  return (
    <div
      ref={ref}
      className={`ice-interactive ice-magnetic inline-block ${className}`}
    >
      {children}
    </div>
  );
}
