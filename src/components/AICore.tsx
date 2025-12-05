"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function WireframeCrystal() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  // CYBERPUNK SPECTRUM
  const colors = useMemo(
    () => [
      new THREE.Color("#22c55e"), // Green
      new THREE.Color("#eab308"), // Yellow
      new THREE.Color("#f97316"), // Orange
      new THREE.Color("#ef4444"), // Red
      new THREE.Color("#a855f7"), // Purple
      new THREE.Color("#3b82f6"), // Blue
    ],
    []
  );

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. SLOW SPIN (Mechanical)
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;

    // 2. PULSE (Heartbeat)
    // Base scale 5.5, pulses gently
    const pulse = 1 + Math.sin(t * 2) * 0.05;
    meshRef.current.scale.setScalar(5.5 * pulse);

    // 3. COLOR CYCLING (Slow Morph)
    const speed = 0.3;
    const timeIndex = t * speed;
    const indexA = Math.floor(timeIndex) % colors.length;
    const indexB = (indexA + 1) % colors.length;
    const alpha = timeIndex % 1;

    const currentColor = colors[indexA].clone().lerp(colors[indexB], alpha);

    // Apply to Wireframe
    materialRef.current.color = currentColor;
    materialRef.current.emissive = currentColor;
    // Breathing glow intensity
    materialRef.current.emissiveIntensity = 2.0 + Math.sin(t * 4) * 1.0;
  });

  return (
    <Sphere args={[1, 24, 24]} ref={meshRef}>
      <meshStandardMaterial
        ref={materialRef}
        wireframe={true}
        transparent={true}
        opacity={0.9}
        roughness={0.5}
        metalness={1}
      />
    </Sphere>
  );
}

export default function AICore() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <WireframeCrystal />

        {/* Strong Bloom for Neon look */}
        <EffectComposer>
          <Bloom luminanceThreshold={0} intensity={2.5} radius={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
