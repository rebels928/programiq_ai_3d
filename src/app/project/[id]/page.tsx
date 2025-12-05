'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, TransformControls } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'
import { TopBar } from '@/components/project/TopBar'
import { Dock } from '@/components/Dock'
import { useControls, Leva } from 'leva'
import * as THREE from 'three'
import { extractAnnotations, type Annotation } from '@/utils/annotationExtractor'
import { SceneAnnotation } from '@/components/project/SceneAnnotation'

// Building Model Component
function BuildingModel({
  url,
  scale,
  rotationX,
  rotationY,
  rotationZ,
  wireframe,
  onAnnotationsExtracted
}: {
  url: string
  scale: number
  rotationX: number
  rotationY: number
  rotationZ: number
  wireframe: boolean
  onAnnotationsExtracted?: (annotations: Annotation[]) => void
}) {
  const gltf = useGLTF(url)
  const { scene } = gltf

  // Extract annotations once when model loads
  useEffect(() => {
    if (onAnnotationsExtracted) {
      const annotations = extractAnnotations(gltf)
      onAnnotationsExtracted(annotations)
    }
  }, [gltf, onAnnotationsExtracted])

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if ('wireframe' in mat) {
                (mat as any).wireframe = wireframe
              }
            })
          } else {
            if ('wireframe' in mesh.material) {
              (mesh.material as any).wireframe = wireframe
            }
          }
        }
      }
    })
  }, [scene, wireframe])

  return (
    <primitive
      object={scene}
      scale={scale}
      rotation={[rotationX, rotationY, rotationZ]}
      position={[0, 0, 0]}
    />
  )
}

// Custom Environment Component
function CustomEnvironment({ preset }: { preset: string }) {
  const { scene } = useThree()

  useEffect(() => {
    if (preset === 'dark') {
      scene.background = new THREE.Color('#0f1419')
    } else if (preset === 'light') {
      scene.background = new THREE.Color('#fffef0')
    } else {
      scene.background = null
    }
  }, [preset, scene])

  // Only render HDRI environments for preset options
  if (preset === 'dark' || preset === 'light') {
    return null
  }

  return <Environment preset={preset as any} background />
}

// Camera controller for FOV changes
function CameraController({ fov, near, far }: { fov: number; near: number; far: number }) {
  const { camera } = useThree()

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov
      camera.near = near
      camera.far = far
      camera.updateProjectionMatrix()
    }
  }, [camera, fov, near, far])

  return null
}

// Ground Plane with Grid
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        color="#8b8b8b"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

// Loading Fallback
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#00ffff" wireframe />
    </mesh>
  )
}

// Main Project Page
export default function ProjectPage({ params }: { params: { id: string } }) {
  const [currentPhase, setCurrentPhase] = useState(1)
  const [annotations, setAnnotations] = useState<Annotation[]>([])

  // For now, using the modernKitchen model as placeholder
  // Later this will be dynamic based on project
  const modelUrl = '/models/skfb-modernKitchen/scene.gltf'

  // Handle annotations extraction
  const handleAnnotationsExtracted = (extractedAnnotations: Annotation[]) => {
    setAnnotations(extractedAnnotations)
    console.log('📍 Total annotations extracted:', extractedAnnotations.length)
  }

  // Leva Controls
  const lighting = useControls('Lighting', {
    ambientIntensity: { value: 0.3, min: 0, max: 2, step: 0.1 },
    directionalIntensity: { value: 1, min: 0, max: 5, step: 0.1 },
    directionalColor: '#ffffff',
    lightPosition: { value: [10, 10, 5], step: 1 },
    shadows: true
  })

  const camera = useControls('Camera', {
    fov: { value: 45, min: 20, max: 120, step: 1 },
    near: { value: 0.1, min: 0.01, max: 1, step: 0.01 },
    far: { value: 1000, min: 100, max: 5000, step: 100 },
    autoRotate: false,
    autoRotateSpeed: { value: 0.5, min: 0, max: 10, step: 0.1 }
  })

  const model = useControls('Model', {
    scale: { value: 1, min: 0.1, max: 5, step: 0.1 },
    rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    wireframe: false,
    enableTransform: false
  })

  const transform = useControls('Transform', {
    mode: {
      value: 'translate',
      options: ['translate', 'rotate', 'scale']
    }
  })

  const environment = useControls('Environment', {
    preset: {
      value: 'sunset',
      options: ['dark', 'light', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby']
    }
  })

  const annotationControls = useControls('Annotations', {
    showAnnotations: true,
    autoExtract: true
  })

  // Placeholder handlers for dock actions
  const handleAICoreClick = () => console.log('AI Core clicked')
  const handleChatToggle = () => console.log('Chat toggled')
  const handleScreenshot = () => console.log('Screenshot taken')
  const handleExport = () => console.log('Export initiated')
  const handleShare = () => console.log('Share initiated')
  const handleSave = () => console.log('Save initiated')
  const handleSettings = () => console.log('Settings opened')

  // Ref for TransformControls
  const modelRef = useRef<THREE.Group>(null)
  const orbitRef = useRef<any>(null)

  return (
    <div className="w-screen h-screen">
      {/* Leva Debug Panel with Title */}
      <Leva
        titleBar={{ title: 'Visual Controls' }}
        theme={{
          sizes: {
            titleBarHeight: '32px'
          },
          colors: {
            highlight1: '#22c55e',
            highlight2: '#16a34a'
          },
          fonts: {
            mono: 'monospace',
            sans: '"Inter", sans-serif'
          }
        }}
      />

      {/* Custom CSS for Leva title */}
      <style jsx global>{`
        .leva-c-kWgxhW {
          font-weight: 700 !important;
          color: #22c55e !important;
          font-size: 14px !important;
        }
      `}</style>

      {/* TopBar UI Overlay */}
      <TopBar
        projectName="Modern Kitchen Project"
        currentPhase={currentPhase}
        onPhaseChange={setCurrentPhase}
      />

      {/* Dock UI Overlay */}
      <Dock
        mode="3d-workspace"
        onAICoreClick={handleAICoreClick}
        onChatToggle={handleChatToggle}
        onScreenshot={handleScreenshot}
        onExport={handleExport}
        onShare={handleShare}
        onSave={handleSave}
        onSettings={handleSettings}
      />

      <Canvas
        camera={{
          position: [15, 10, 15],
          fov: camera.fov
        }}
        shadows={lighting.shadows}
      >
        {/* Camera Controller */}
        <CameraController fov={camera.fov} near={camera.near} far={camera.far} />

        {/* Controls */}
        <OrbitControls
          ref={orbitRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
          autoRotate={camera.autoRotate}
          autoRotateSpeed={camera.autoRotateSpeed}
          makeDefault
        />

        {/* Lighting & Environment */}
        <Suspense fallback={null}>
          <CustomEnvironment preset={environment.preset} />
        </Suspense>
        <ambientLight intensity={lighting.ambientIntensity} />
        <directionalLight
          position={lighting.lightPosition as [number, number, number]}
          intensity={lighting.directionalIntensity}
          color={lighting.directionalColor}
          castShadow={lighting.shadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Scene */}
        <Ground />

        <Suspense fallback={<Loader />}>
          <group ref={modelRef}>
            <BuildingModel
              url={modelUrl}
              scale={model.scale}
              rotationX={model.rotationX}
              rotationY={model.rotationY}
              rotationZ={model.rotationZ}
              wireframe={model.wireframe}
              onAnnotationsExtracted={annotationControls.autoExtract ? handleAnnotationsExtracted : undefined}
            />
          </group>

          {/* Transform Controls */}
          {model.enableTransform && modelRef.current && (
            <TransformControls
              object={modelRef.current}
              mode={transform.mode as 'translate' | 'rotate' | 'scale'}
              onMouseDown={() => {
                if (orbitRef.current) orbitRef.current.enabled = false
              }}
              onMouseUp={() => {
                if (orbitRef.current) orbitRef.current.enabled = true
              }}
            />
          )}

          {/* Scene Annotations */}
          {annotationControls.showAnnotations && annotations.map((annotation) => (
            <SceneAnnotation
              key={annotation.id}
              annotation={annotation}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}
