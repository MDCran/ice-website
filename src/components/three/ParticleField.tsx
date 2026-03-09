"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const PARTICLE_COUNT = 150;
const SPREAD = 12;
const CONNECTION_DISTANCE = 2.4;
const WAVE_SPEED = 0.15;
const WAVE_AMPLITUDE = 0.3;
const DRIFT_SPEED = 0.02;
const MOUSE_INFLUENCE = 0.3;

const CYAN = new THREE.Color("#049bfb");
const BLUE = new THREE.Color("#0474bc");

/* -------------------------------------------------------------------------- */
/*  Particles (points + connecting lines)                                     */
/* -------------------------------------------------------------------------- */

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  /* ---- Generate initial random positions & per-particle data ------------- */
  const { positions, colors, basePositions, speeds, phases, particleColors } =
    useMemo(() => {
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      const basePositions = new Float32Array(PARTICLE_COUNT * 3);
      const speeds = new Float32Array(PARTICLE_COUNT);
      const phases = new Float32Array(PARTICLE_COUNT);
      const particleColors: THREE.Color[] = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = (Math.random() - 0.5) * SPREAD;
        const y = (Math.random() - 0.5) * SPREAD;
        const z = (Math.random() - 0.5) * SPREAD;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        basePositions[i * 3] = x;
        basePositions[i * 3 + 1] = y;
        basePositions[i * 3 + 2] = z;

        speeds[i] = 0.5 + Math.random() * 1.0;
        phases[i] = Math.random() * Math.PI * 2;

        // Blend between cyan and blue
        const t = Math.random();
        const color = CYAN.clone().lerp(BLUE, t);
        particleColors.push(color);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      return { positions, colors, basePositions, speeds, phases, particleColors };
    }, []);

  /* ---- Pre-allocate line geometry (worst-case buffer) -------------------- */
  const maxLines = PARTICLE_COUNT * 6; // heuristic upper bound
  const { linePositions, lineColors } = useMemo(() => {
    const linePositions = new Float32Array(maxLines * 6); // 2 verts * 3 components
    const lineColors = new Float32Array(maxLines * 6);
    return { linePositions, lineColors };
  }, [maxLines]);

  /* ---- Animation loop ---------------------------------------------------- */
  useFrame(({ clock, pointer }) => {
    const time = clock.getElapsedTime();

    const pts = pointsRef.current;
    const lines = linesRef.current;
    if (!pts || !lines) return;

    const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    // --- Animate each particle with wave + drift -------------------------
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];
      const speed = speeds[i];
      const phase = phases[i];

      posArr[i * 3] =
        bx +
        Math.sin(time * WAVE_SPEED * speed + phase) * WAVE_AMPLITUDE +
        Math.sin(time * DRIFT_SPEED + phase) * 0.5;
      posArr[i * 3 + 1] =
        by +
        Math.cos(time * WAVE_SPEED * speed + phase * 1.3) * WAVE_AMPLITUDE +
        Math.cos(time * DRIFT_SPEED * 0.8 + phase) * 0.4;
      posArr[i * 3 + 2] =
        bz +
        Math.sin(time * WAVE_SPEED * speed * 0.7 + phase * 0.9) *
          WAVE_AMPLITUDE *
          0.6;
    }
    posAttr.needsUpdate = true;

    // --- Build connection lines between nearby particles -----------------
    const linePosAttr = lines.geometry.attributes.position as THREE.BufferAttribute;
    const lineColAttr = lines.geometry.attributes.color as THREE.BufferAttribute;
    const lp = linePosAttr.array as Float32Array;
    const lc = lineColAttr.array as Float32Array;

    let lineIndex = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = posArr[i * 3] - posArr[j * 3];
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
        const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DISTANCE) {
          if (lineIndex >= maxLines) break;

          const alpha = 1 - dist / CONNECTION_DISTANCE;

          // vertex A
          lp[lineIndex * 6] = posArr[i * 3];
          lp[lineIndex * 6 + 1] = posArr[i * 3 + 1];
          lp[lineIndex * 6 + 2] = posArr[i * 3 + 2];
          // vertex B
          lp[lineIndex * 6 + 3] = posArr[j * 3];
          lp[lineIndex * 6 + 4] = posArr[j * 3 + 1];
          lp[lineIndex * 6 + 5] = posArr[j * 3 + 2];

          const ci = particleColors[i];
          const cj = particleColors[j];

          lc[lineIndex * 6] = ci.r * alpha;
          lc[lineIndex * 6 + 1] = ci.g * alpha;
          lc[lineIndex * 6 + 2] = ci.b * alpha;
          lc[lineIndex * 6 + 3] = cj.r * alpha;
          lc[lineIndex * 6 + 4] = cj.g * alpha;
          lc[lineIndex * 6 + 5] = cj.b * alpha;

          lineIndex++;
        }
      }
      if (lineIndex >= maxLines) break;
    }

    // Zero-out remaining line verts so they collapse to invisible degenerate segments
    for (let k = lineIndex * 6; k < lp.length; k++) {
      lp[k] = 0;
      lc[k] = 0;
    }

    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
    lines.geometry.setDrawRange(0, lineIndex * 2);

    // --- Subtle camera-like group rotation following mouse ----------------
    if (pts.parent) {
      const group = pts.parent;
      group.rotation.y = THREE.MathUtils.lerp(
        group.rotation.y,
        pointer.x * MOUSE_INFLUENCE,
        0.02,
      );
      group.rotation.x = THREE.MathUtils.lerp(
        group.rotation.x,
        -pointer.y * MOUSE_INFLUENCE,
        0.02,
      );
    }
  });

  return (
    <group>
      {/* Particle points */}
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
          size={0.06}
          vertexColors
          transparent
          opacity={0.85}
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
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  HeroScene - public wrapper                                                */
/* -------------------------------------------------------------------------- */

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <Particles />
      </Canvas>
    </div>
  );
}

export default HeroScene;
