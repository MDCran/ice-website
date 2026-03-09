"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Shape definitions                                                         */
/* -------------------------------------------------------------------------- */

interface ShapeConfig {
  geometry: "icosahedron" | "torus" | "octahedron" | "dodecahedron";
  position: [number, number, number];
  color: string;
  opacity: number;
  rotationSpeeds: [number, number, number]; // x, y, z rotation speeds
  scale: number;
}

const SHAPES: ShapeConfig[] = [
  {
    geometry: "icosahedron",
    position: [-2.5, 1.5, -1],
    color: "#049bfb",
    opacity: 0.12,
    rotationSpeeds: [0.15, 0.25, 0.05],
    scale: 1.2,
  },
  {
    geometry: "torus",
    position: [2.8, -1.2, -2],
    color: "#0474bc",
    opacity: 0.1,
    rotationSpeeds: [0.2, 0.1, 0.3],
    scale: 1.0,
  },
  {
    geometry: "octahedron",
    position: [-1.5, -2.0, 0.5],
    color: "#0474bc",
    opacity: 0.15,
    rotationSpeeds: [0.1, 0.3, 0.15],
    scale: 0.9,
  },
  {
    geometry: "dodecahedron",
    position: [1.8, 2.2, -1.5],
    color: "#049bfb",
    opacity: 0.1,
    rotationSpeeds: [0.25, 0.15, 0.2],
    scale: 0.8,
  },
];

/* -------------------------------------------------------------------------- */
/*  FloatingShape - a single animated wireframe shape                         */
/* -------------------------------------------------------------------------- */

interface FloatingShapeProps {
  config: ShapeConfig;
  index: number;
}

const FloatingShape = React.memo(function FloatingShape({
  config,
  index,
}: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phaseOffset = index * 1.7;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    meshRef.current.rotation.x = t * config.rotationSpeeds[0];
    meshRef.current.rotation.y = t * config.rotationSpeeds[1];
    meshRef.current.rotation.z = t * config.rotationSpeeds[2];

    // Gentle floating motion
    meshRef.current.position.y =
      config.position[1] + Math.sin(t * 0.4 + phaseOffset) * 0.3;
    meshRef.current.position.x =
      config.position[0] + Math.cos(t * 0.3 + phaseOffset) * 0.15;
  });

  const renderGeometry = () => {
    switch (config.geometry) {
      case "icosahedron":
        return <icosahedronGeometry args={[config.scale, 1]} />;
      case "torus":
        return (
          <torusGeometry
            args={[config.scale, config.scale * 0.3, 8, 16]}
          />
        );
      case "octahedron":
        return <octahedronGeometry args={[config.scale, 0]} />;
      case "dodecahedron":
        return <dodecahedronGeometry args={[config.scale, 0]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={config.position}>
      {renderGeometry()}
      <meshBasicMaterial
        color={config.color}
        wireframe
        transparent
        opacity={config.opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
});

/* -------------------------------------------------------------------------- */
/*  ShapesScene - all floating shapes together                                */
/* -------------------------------------------------------------------------- */

const ShapesScene = React.memo(function ShapesScene() {
  return (
    <group>
      {SHAPES.map((shape, i) => (
        <FloatingShape key={i} config={shape} index={i} />
      ))}
    </group>
  );
});

/* -------------------------------------------------------------------------- */
/*  FloatingShapes - Canvas wrapper (default export)                          */
/* -------------------------------------------------------------------------- */

export default function FloatingShapes() {
  return (
    <div className="w-full h-full">
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <ShapesScene />
      </Canvas>
    </div>
  );
}
