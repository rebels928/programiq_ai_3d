# Phase 1 REVISED: Immersive Landing Page + Dashboard

---

## Two Landing Page Options

### Option A: Little Workshop Style (Recommended)
**Split screen: Left text, Right 3D preview**

```
┌─────────────────────────────────────────────────┐
│ PROGRAMIQ                    [3D Scene Preview] │
│                                                  │
│ Pre-Construction             Live building      │
│ Intelligence                 model rotating     │
│                                                  │
│ Transform chaos into         Shows phase        │
│ clarity. AI-powered          transition         │
│ visualization for Bay        animation          │
│ Area construction.                              │
│                                                  │
│ [GET STARTED]                                   │
│                                                  │
│ Twitter LinkedIn                                │
└─────────────────────────────────────────────────┘
```

**Features:**
- Left 40%: Marketing copy + CTA
- Right 60%: Live R3F scene (building model)
- Clerk auth in top-right
- Smooth fade-in animation
- Professional, clean

### Option B: Bruno Simon Style
**Full-screen 3D with center START button**

```
┌─────────────────────────────────────────────────┐
│              [Full 3D Scene]                     │
│                                                  │
│         Construction site world                 │
│         with buildings, billboards              │
│                                                  │
│              ┌─────────┐                        │
│              │  START  │                        │
│              └─────────┘                        │
│                                                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Features:**
- 100% 3D immersive
- Drag to explore before login
- Click START → Clerk sign-in
- More impressive, less conventional

---

## Recommended: Option A (Little Workshop)

**Why:**
- Clear value proposition upfront
- Easier to understand (service business)
- Better SEO (text content)
- Faster initial load
- More professional for GCs

**When users click "GET STARTED":**
1. If logged in → Dashboard
2. If not → Clerk sign-in modal

---

## Implementation

### Landing Page
```tsx
// src/app/page.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { SignInButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { BuildingPreview } from '@/components/BuildingPreview'

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  return (
    <div className="h-screen flex">
      {/* Left: Marketing */}
      <div className="w-2/5 bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex flex-col justify-center">
        <h1 className="text-6xl font-bold mb-6">
          PROGRAMIQ
        </h1>
        
        <h2 className="text-3xl text-cyan-500 mb-8">
          Pre-Construction Intelligence
        </h2>
        
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          Transform chaos into clarity. AI-powered visualization 
          for Bay Area construction projects. From LiDAR scan to 
          interactive 4D schedule in 3 days.
        </p>
        
        {isSignedIn ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 rounded-lg text-xl font-bold transition-all hover:scale-105"
          >
            ENTER WORKSPACE
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 rounded-lg text-xl font-bold transition-all hover:scale-105">
              GET STARTED
            </button>
          </SignInButton>
        )}
        
        {/* Social */}
        <div className="flex gap-4 mt-12">
          <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
          <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
        </div>
      </div>
      
      {/* Right: 3D Preview */}
      <div className="w-3/5 relative">
        <Canvas camera={{ position: [10, 8, 10], fov: 45 }}>
          <OrbitControls
            enableDamping
            autoRotate
            autoRotateSpeed={0.5}
            enableZoom={false}
          />
          
          <Environment preset="sunset" />
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <BuildingPreview />
        </Canvas>
      </div>
    </div>
  )
}
```

### Building Preview Component
```tsx
// src/components/BuildingPreview.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

export function BuildingPreview() {
  const groupRef = useRef()
  
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
```

---

## Dashboard (Keep Phase 1 Work)

Dashboard stays same as current Phase 1:
- Project grid
- Create new card
- SystemTicker
- Dock with AICore

---

## Routes Structure

```
/                    → Landing page (public)
/dashboard           → Project grid (protected)
/project/[id]        → 3D workspace (Phase 2)
/sign-in/*           → Clerk handles
/sign-up/*           → Clerk handles
```

---

## Mobile Responsive

**Desktop:** Split screen as shown

**Tablet:** Stack vertically (marketing top, 3D bottom)

**Mobile:**
- Marketing only
- Small 3D thumbnail
- CTA prominent

---

## Next Steps

1. Keep existing Phase 1 dashboard
2. Replace root `page.tsx` with landing page
3. Test Clerk flow
4. Then start Phase 2 (3D workspace)

Ready to implement?
