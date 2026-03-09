"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

interface ParticleBackgroundProps {
  className?: string;
}

export default function ParticleBackground({ className }: ParticleBackgroundProps) {
  const [ready, setReady] = useState(false);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    const target = document.getElementById("particle-bg-sentinel");
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      particles: {
        number: { value: 40, density: { enable: true } },
        color: { value: ["#049bfb", "#0474bc", "#ffffff"] },
        opacity: { value: { min: 0.1, max: 0.4 } },
        size: { value: { min: 1, max: 2 } },
        links: {
          enable: true,
          color: "#049bfb",
          distance: 120,
          opacity: 0.1,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: "none" as const,
          outModes: { default: "bounce" as const },
        },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <>
      <div id="particle-bg-sentinel" className={className} style={{ position: "absolute", inset: 0 }} />
      {ready && engineReady && (
        <Particles
          id="tsparticles-bg"
          options={options}
          className={className}
          style={{ position: "absolute", inset: 0 }}
        />
      )}
    </>
  );
}
