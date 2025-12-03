'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { SignInButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Sun, Moon } from 'lucide-react'
import { BuildingPreview } from '@/src/components/BuildingPreview'
import { useTheme } from '@/src/contexts/ThemeContext'

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="h-screen flex">
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 hover:bg-white/20 dark:hover:bg-black/30 transition-all"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-700" />
        )}
      </button>

      {/* Left: Marketing */}
      <div className="w-2/5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-12 flex flex-col justify-center">
        <h1 className="text-6xl font-bold mb-6 text-slate-900 dark:text-white">
          PROGRAMIQ
        </h1>

        <h2 className="text-3xl text-cyan-600 dark:text-cyan-500 mb-8">
          Pre-Construction Intelligence
        </h2>

        <p className="text-xl text-slate-700 dark:text-gray-300 mb-12 leading-relaxed">
          Transform chaos into clarity. AI-powered visualization
          for Bay Area construction projects. From LiDAR scan to
          interactive 4D schedule in 3 days.
        </p>

        {isSignedIn ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-cyan-500 hover:bg-cyan-400 text-white dark:text-black px-8 py-4 rounded-lg text-xl font-bold transition-all hover:scale-105"
          >
            ENTER WORKSPACE
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="bg-cyan-500 hover:bg-cyan-400 text-white dark:text-black px-8 py-4 rounded-lg text-xl font-bold transition-all hover:scale-105">
              GET STARTED
            </button>
          </SignInButton>
        )}

        {/* Social */}
        <div className="flex gap-4 mt-12">
          <a href="#" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
          <a href="#" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">LinkedIn</a>
        </div>
      </div>

      {/* Right: 3D Preview */}
      <div className="w-3/5 relative bg-slate-50 dark:bg-slate-950">
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
