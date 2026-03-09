"use client";

import { useRef, useCallback, useEffect, useState, type CSSProperties } from "react";

export function useMagneticButton(strength = 3) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canHover || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      setStyle({
        transform: `translate(${x / (rect.width / strength)}px, ${y / (rect.height / strength)}px)`,
        transition: "transform 0.15s ease-out",
      });
    },
    [canHover, strength]
  );

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: "translate(0px, 0px)",
      transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    });
  }, []);

  return { ref, style, onMouseMove, onMouseLeave };
}
