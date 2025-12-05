import * as THREE from 'three'

export interface Annotation {
  id: string
  name: string
  position: [number, number, number]
  title?: string
  description?: string
  category?: string
  userData?: any
  extras?: any
}

/**
 * Extract annotations from GLTF model
 * Looks for:
 * - Node names containing keywords (spotlight, annotation, marker, info)
 * - userData fields
 * - extras properties
 */
export function extractAnnotations(gltf: any): Annotation[] {
  const annotations: Annotation[] = []
  let idCounter = 0

  // Keywords to search for in node names
  const keywords = [
    'spotlight',
    'annotation',
    'marker',
    'info',
    'point',
    'note',
    'tag',
    'label'
  ]

  gltf.scene.traverse((node: any) => {
    const nameLower = (node.name || '').toLowerCase()

    // Check if node name contains any keywords
    const hasKeyword = keywords.some(keyword => nameLower.includes(keyword))

    // Check if node has userData or extras
    const hasUserData = node.userData && Object.keys(node.userData).length > 0
    const hasExtras = (node as any).userData?.gltfExtensions?.extras

    if (hasKeyword || hasUserData || hasExtras) {
      // Get world position
      const worldPosition = new THREE.Vector3()
      node.getWorldPosition(worldPosition)

      // Extract metadata
      const extras = hasExtras || {}
      const userData = node.userData || {}

      // Build annotation object
      const annotation: Annotation = {
        id: `anno-${idCounter++}`,
        name: node.name,
        position: worldPosition.toArray() as [number, number, number],
        title: extras.title || userData.title || formatNodeName(node.name),
        description: extras.description || userData.description || undefined,
        category: extras.category || userData.category || detectCategory(node.name),
        userData,
        extras
      }

      annotations.push(annotation)

      console.log('📍 Annotation found:', {
        name: node.name,
        position: annotation.position,
        hasUserData,
        hasExtras
      })
    }
  })

  return annotations
}

/**
 * Format node name to readable title
 * "Spotlights_Light_0" -> "Spotlights Light"
 */
function formatNodeName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\.\d+$/g, '') // Remove trailing .001, .002
    .replace(/\s+\d+$/g, '') // Remove trailing numbers
    .trim()
}

/**
 * Detect category from node name
 */
function detectCategory(name: string): string {
  const nameLower = name.toLowerCase()

  if (nameLower.includes('light') || nameLower.includes('spotlight')) {
    return 'lighting'
  }
  if (nameLower.includes('cabinet') || nameLower.includes('closet')) {
    return 'storage'
  }
  if (nameLower.includes('sink') || nameLower.includes('faucet')) {
    return 'plumbing'
  }
  if (nameLower.includes('stove') || nameLower.includes('oven') || nameLower.includes('appliance')) {
    return 'appliance'
  }
  if (nameLower.includes('counter') || nameLower.includes('surface')) {
    return 'surface'
  }

  return 'general'
}

/**
 * Load external annotation data from JSON
 */
export async function loadAnnotationData(projectId: string): Promise<Annotation[]> {
  try {
    const response = await fetch(`/api/annotations/${projectId}`)
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.error('Failed to load annotation data:', error)
    return []
  }
}

/**
 * Merge extracted annotations with external data
 */
export function mergeAnnotations(
  extracted: Annotation[],
  external: Annotation[]
): Annotation[] {
  const merged = [...extracted]

  // Add external annotations that don't match extracted ones
  external.forEach(ext => {
    const exists = extracted.some(
      ann => ann.name === ext.name ||
      (Math.abs(ann.position[0] - ext.position[0]) < 0.1 &&
       Math.abs(ann.position[1] - ext.position[1]) < 0.1 &&
       Math.abs(ann.position[2] - ext.position[2]) < 0.1)
    )

    if (!exists) {
      merged.push(ext)
    }
  })

  return merged
}
