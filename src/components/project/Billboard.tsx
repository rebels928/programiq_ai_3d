import { Html } from '@react-three/drei'
import { ReactNode } from 'react'

interface BillboardProps {
  position: [number, number, number]
  children: ReactNode
  distanceFactor?: number
}

export function Billboard({
  position,
  children,
  distanceFactor = 10
}: BillboardProps) {
  return (
    <Html
      position={position}
      center
      distanceFactor={distanceFactor}
      transform
      sprite // Always face camera
    >
      <div className="glass-panel p-6 min-w-[300px] pointer-events-auto">
        {children}
      </div>
    </Html>
  )
}
