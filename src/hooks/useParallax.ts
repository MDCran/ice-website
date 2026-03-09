"use client";

import { useState, useEffect, useCallback } from "react";

export function useParallax(speed: number = 0.1) {
  const [offsetY, setOffsetY] = useState(0);

  const handleScroll = useCallback(() => {
    requestAnimationFrame(() => {
      setOffsetY(window.scrollY * speed);
    });
  }, [speed]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return offsetY;
}
