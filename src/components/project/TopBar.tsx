'use client'

import { UserButton } from '@clerk/nextjs'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TopBarProps {
  projectName: string
  currentPhase?: number
  onPhaseChange?: (phase: number) => void
}

export function TopBar({
  projectName,
  currentPhase = 1,
  onPhaseChange
}: TopBarProps) {
  const [phase, setPhase] = useState(currentPhase)

  const handlePhaseClick = (newPhase: number) => {
    setPhase(newPhase)
    onPhaseChange?.(newPhase)
  }

  return (
    <div className="fixed top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-50">
      {/* Left: Back Link + Project Name + Phase Controls */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="glass-panel p-3 pointer-events-auto hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="glass-panel px-6 py-3 pointer-events-auto">
          <h1 className="font-bold text-lg mb-2">{projectName}</h1>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((phaseNum) => (
              <button
                key={phaseNum}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                  phaseNum === phase
                    ? 'bg-cyan-500 text-black'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => handlePhaseClick(phaseNum)}
              >
                {phaseNum}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="glass-panel p-2 pointer-events-auto">
        <UserButton />
      </div>
    </div>
  )
}
