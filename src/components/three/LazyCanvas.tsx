"use client";

import React, { Suspense, lazy, useRef, useState, useEffect } from "react";

const sceneMap: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  particles: lazy(() => import("./ParticleField")),
  globe: lazy(() => import("./AnimatedGlobe")),
  network: lazy(() => import("./NetworkMesh")),
  shapes: lazy(() => import("./FloatingShapes")),
};

function GradientSkeleton() {
  return (
    <div className="absolute inset-0 shimmer-loading rounded-lg" />
  );
}

interface LazyCanvasProps {
  scene: keyof typeof sceneMap;
  className?: string;
}

export default function LazyCanvas({ scene, className = "" }: LazyCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setHasBeenVisible(true);
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const SceneComponent = sceneMap[scene];

  return (
    <div ref={ref} className={`relative w-full h-full ${className}`}>
      {hasBeenVisible && isVisible && SceneComponent && (
        <Suspense fallback={<GradientSkeleton />}>
          <SceneComponent />
        </Suspense>
      )}
      {hasBeenVisible && !isVisible && (
        <GradientSkeleton />
      )}
      {!hasBeenVisible && (
        <GradientSkeleton />
      )}
    </div>
  );
}
