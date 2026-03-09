"use client";

import { useCursorGlow } from "@/hooks/useCursorGlow";

export default function CursorGlow() {
  const { glowRef, enabled } = useCursorGlow();

  if (!enabled) return null;

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
    />
  );
}
