'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export function BuildingPreview() {
  const groupRef = useRef<Group>(null)

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Simple building placeholder (until you have .gltf) */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[3, 4, 3]} />
        <meshStandardMaterial color="#ddd" metalness={0.1} roughness={0.8} />
      </mesh>

      <mesh position={[0, 5, 0]}>
        <coneGeometry args={[2.5, 2, 4]} />
        <meshStandardMaterial color="#c44" metalness={0.2} roughness={0.7} />
      </mesh>
    </group>
  )
}
