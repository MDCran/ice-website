"use client";
import React, { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const GLOBE_RADIUS = 2;
const GLOBE_SEGMENTS = 24;
const ROTATION_SPEED = 0.15;
const PULSE_SPEED = 2.5;

const CYAN = new THREE.Color("#049bfb");
const BLUE = new THREE.Color("#0474bc");

/** Predefined data-center locations on the sphere surface (spherical coords). */
const DATA_CENTER_COORDS: [number, number][] = [
  [0.4, 0.8],   // North America
  [0.6, 1.9],   // Europe
  [0.8, 2.5],   // Middle East
  [1.1, 1.7],   // Africa
  [0.5, 2.8],   // India
  [0.4, 3.3],   // East Asia
  [1.3, 3.6],   // Australia
  [0.9, -0.6],  // South America
  [0.3, -1.8],  // Pacific
  [0.7, 0.2],   // Atlantic
];

/* -------------------------------------------------------------------------- */
/*  DataCenterPoint - a single glowing dot on the globe                       */
/* -------------------------------------------------------------------------- */

interface DataCenterPointProps {
  position: [number, number, number];
  color: THREE.Color;
  phaseOffset: number;
}

const DataCenterPoint = React.memo(function DataCenterPoint({
  position,
  color,
  phaseOffset,
}: DataCenterPointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.6 + Math.sin(t * PULSE_SPEED + phaseOffset) * 0.4;

    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * PULSE_SPEED + phaseOffset) * 0.3);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Core point */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
});

/* -------------------------------------------------------------------------- */
/*  GlobeScene - the wireframe sphere + data center points                    */
/* -------------------------------------------------------------------------- */

interface GlobeSceneProps {
  isVisible: boolean;
}

const GlobeScene = React.memo(function GlobeScene({ isVisible }: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  const dataCenters = useMemo(() => {
    return DATA_CENTER_COORDS.map(([theta, phi], i) => {
      const x = GLOBE_RADIUS * Math.sin(theta) * Math.cos(phi);
      const y = GLOBE_RADIUS * Math.cos(theta);
      const z = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);

      const t = i / DATA_CENTER_COORDS.length;
      const color = CYAN.clone().lerp(BLUE, t);

      return {
        position: [x, y, z] as [number, number, number],
        color,
        phaseOffset: (i / DATA_CENTER_COORDS.length) * Math.PI * 2,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !isVisible) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * ROTATION_SPEED;
    groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Wireframe globe */}
      <mesh>
        <icosahedronGeometry args={[GLOBE_RADIUS, 2]} />
        <meshBasicMaterial
          color="#049bfb"
          wireframe
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      {/* Second wireframe layer for depth */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.98, GLOBE_SEGMENTS, GLOBE_SEGMENTS]} />
        <meshBasicMaterial
          color="#0474bc"
          wireframe
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Data center points */}
      {dataCenters.map((dc, i) => (
        <DataCenterPoint
          key={i}
          position={dc.position}
          color={dc.color}
          phaseOffset={dc.phaseOffset}
        />
      ))}
    </group>
  );
});

/* -------------------------------------------------------------------------- */
/*  AnimatedGlobe - Canvas wrapper (default export)                           */
/* -------------------------------------------------------------------------- */

export default function AnimatedGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      setIsVisible(entry.isIntersecting);
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [handleIntersection]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <GlobeScene isVisible={isVisible} />
      </Canvas>
    </div>
  );
}
