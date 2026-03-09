"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const CONNECTION_DISTANCE = 2.8;
const SPREAD = 8;

/* -------------------------------------------------------------------------- */
/*  NetworkScene - particles with connecting lines                            */
/* -------------------------------------------------------------------------- */

interface NetworkSceneProps {
  density: number;
  speed: number;
  color: string;
}

const NetworkScene = React.memo(function NetworkScene({
  density,
  speed,
  color,
}: NetworkSceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const themeColor = useMemo(() => new THREE.Color(color), [color]);

  /* Generate initial particle positions and per-particle data */
  const { positions, basePositions, speeds, phases, colors } = useMemo(() => {
    const positions = new Float32Array(density * 3);
    const basePositions = new Float32Array(density * 3);
    const speeds = new Float32Array(density);
    const phases = new Float32Array(density);
    const colors = new Float32Array(density * 3);

    for (let i = 0; i < density; i++) {
      const x = (Math.random() - 0.5) * SPREAD;
      const y = (Math.random() - 0.5) * SPREAD;
      const z = (Math.random() - 0.5) * (SPREAD * 0.5);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      speeds[i] = 0.3 + Math.random() * 0.7;
      phases[i] = Math.random() * Math.PI * 2;

      // Slight color variation around the theme color
      const variation = 0.1;
      colors[i * 3] = themeColor.r + (Math.random() - 0.5) * variation;
      colors[i * 3 + 1] = themeColor.g + (Math.random() - 0.5) * variation;
      colors[i * 3 + 2] = themeColor.b + (Math.random() - 0.5) * variation;
    }

    return { positions, basePositions, speeds, phases, colors };
  }, [density, themeColor]);

  /* Pre-allocate line buffers */
  const maxLines = density * 4;
  const { linePositions, lineColors } = useMemo(() => {
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    return { linePositions, lineColors };
  }, [maxLines]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const pts = pointsRef.current;
    const lines = linesRef.current;
    if (!pts || !lines) return;

    const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    /* Animate particles: slow drift */
    for (let i = 0; i < density; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];
      const s = speeds[i];
      const p = phases[i];

      posArr[i * 3] = bx + Math.sin(time * speed * s + p) * 0.4;
      posArr[i * 3 + 1] = by + Math.cos(time * speed * s * 0.8 + p * 1.3) * 0.4;
      posArr[i * 3 + 2] = bz + Math.sin(time * speed * s * 0.5 + p * 0.7) * 0.2;
    }
    posAttr.needsUpdate = true;

    /* Build connection lines */
    const linePosAttr = lines.geometry.attributes.position as THREE.BufferAttribute;
    const lineColAttr = lines.geometry.attributes.color as THREE.BufferAttribute;
    const lp = linePosAttr.array as Float32Array;
    const lc = lineColAttr.array as Float32Array;

    let lineIndex = 0;

    for (let i = 0; i < density && lineIndex < maxLines; i++) {
      for (let j = i + 1; j < density && lineIndex < maxLines; j++) {
        const dx = posArr[i * 3] - posArr[j * 3];
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
        const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DISTANCE) {
          const alpha = 1 - dist / CONNECTION_DISTANCE;
          const offset = lineIndex * 6;

          lp[offset] = posArr[i * 3];
          lp[offset + 1] = posArr[i * 3 + 1];
          lp[offset + 2] = posArr[i * 3 + 2];
          lp[offset + 3] = posArr[j * 3];
          lp[offset + 4] = posArr[j * 3 + 1];
          lp[offset + 5] = posArr[j * 3 + 2];

          const r = themeColor.r * alpha;
          const g = themeColor.g * alpha;
          const b = themeColor.b * alpha;

          lc[offset] = r;
          lc[offset + 1] = g;
          lc[offset + 2] = b;
          lc[offset + 3] = r;
          lc[offset + 4] = g;
          lc[offset + 5] = b;

          lineIndex++;
        }
      }
    }

    /* Zero out remaining line verts */
    for (let k = lineIndex * 6; k < lp.length; k++) {
      lp[k] = 0;
      lc[k] = 0;
    }

    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
    lines.geometry.setDrawRange(0, lineIndex * 2);
  });

  return (
    <group>
      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
});

/* -------------------------------------------------------------------------- */
/*  NetworkMesh - Canvas wrapper (default export)                             */
/* -------------------------------------------------------------------------- */

interface NetworkMeshProps {
  density?: number;
  speed?: number;
  color?: string;
}

export default function NetworkMesh({
  density = 40,
  speed = 0.3,
  color = "#049bfb",
}: NetworkMeshProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 6], fov: 55 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <NetworkScene density={density} speed={speed} color={color} />
      </Canvas>
    </div>
  );
}
