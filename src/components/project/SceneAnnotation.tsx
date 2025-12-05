import { Html } from '@react-three/drei'
import { useState } from 'react'
import { Info, X, Lightbulb, Archive, Droplet, Flame, Square } from 'lucide-react'
import type { Annotation } from '@/utils/annotationExtractor'

interface SceneAnnotationProps {
  annotation: Annotation
  onClick?: () => void
}

const categoryIcons = {
  lighting: Lightbulb,
  storage: Archive,
  plumbing: Droplet,
  appliance: Flame,
  surface: Square,
  general: Info
}

const categoryColors = {
  lighting: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
  storage: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  plumbing: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200',
  appliance: 'bg-red-500/20 border-red-500/50 text-red-200',
  surface: 'bg-green-500/20 border-green-500/50 text-green-200',
  general: 'bg-white/20 border-white/50 text-white'
}

export function SceneAnnotation({ annotation, onClick }: SceneAnnotationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const Icon = categoryIcons[annotation.category as keyof typeof categoryIcons] || Info
  const colorClass = categoryColors[annotation.category as keyof typeof categoryColors] || categoryColors.general

  return (
    <Html
      position={annotation.position}
      center
      distanceFactor={5}
      sprite
    >
      <div className="pointer-events-auto">
        {/* Collapsed Icon */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 ${colorClass}`}
            title={annotation.title}
          >
            <Icon className="w-4 h-4" />
          </button>
        )}

        {/* Expanded Card */}
        {isExpanded && (
          <div className={`glass-panel p-4 min-w-[250px] max-w-[300px] border-2 ${colorClass}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <h3 className="font-bold text-sm">{annotation.title}</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {annotation.description && (
              <p className="text-xs text-white/80 mb-3">
                {annotation.description}
              </p>
            )}

            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Category:</span>
                <span className="font-medium capitalize">{annotation.category}</span>
              </div>

              {annotation.extras && Object.keys(annotation.extras).length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <span className="text-white/60 text-xs">Additional Info:</span>
                  {Object.entries(annotation.extras).map(([key, value]) => (
                    <div key={key} className="flex justify-between mt-1">
                      <span className="text-white/60 capitalize">{key}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Html>
  )
}

/**
 * Annotation Cluster - Groups nearby annotations
 */
export function AnnotationCluster({
  annotations,
  position
}: {
  annotations: Annotation[]
  position: [number, number, number]
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Html
      position={position}
      center
      distanceFactor={5}
      sprite
    >
      <div className="pointer-events-auto">
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 rounded-full bg-cyan-500/30 border-2 border-cyan-500 flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-all"
          >
            <span className="font-bold text-white">{annotations.length}</span>
          </button>
        )}

        {isExpanded && (
          <div className="glass-panel p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">{annotations.length} Items</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="hover:bg-white/20 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {annotations.map((anno, i) => {
                const Icon = categoryIcons[anno.category as keyof typeof categoryIcons] || Info
                return (
                  <button
                    key={i}
                    className="w-full text-left p-2 rounded hover:bg-white/10 flex items-center gap-2 text-xs transition-colors"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{anno.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Html>
  )
}
