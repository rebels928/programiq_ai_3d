# .GLTF File Metadata Analysis
## Model: Modern Kitchen (skfb-modernKitchen)

---

## File Overview

**Location:** `public/models/skfb-modernKitchen/scene.gltf`
**Size:** ~297KB
**Format:** GLTF 2.0
**Generator:** Sketchfab-16.65.0

---

## Asset Metadata (Line 9889)

```json
"extras": {
  "author": "Visthétique (https://sketchfab.com/visthetique)",
  "license": "CC-BY-4.0",
  "source": "https://sketchfab.com/3d-models/modern-kitchen-...",
  "title": "Modern Kitchen"
}
```

**Found in:** Asset-level only (not on individual nodes)

---

## Node Structure

### Total Nodes: ~189 nodes
### Root Structure:
- Sketchfab_model (root)
  - 2aca6747011741fc8bb8d24172fc7ec1.fbx
    - RootNode
      - [~189 child nodes]

---

## Spotlight/Annotation Candidates

### 1. **"Spotlights" Node** (Line 14872)

**Node ID:** 118
**Type:** Parent node with 4 children
**Position Matrix:**
```
[100.0, 0.0, 0.0, 0.0,
 0.0, -1.629e-05, -99.999..., 0.0,
 0.0, 99.999..., -1.629e-05, 0.0,
 156.856, 427.100, -382.132, 1.0]
```

**Translation extracted:** `[156.856, 427.100, -382.132]`

**Children (meshes):**
- Spotlights_Light_0 (mesh 89)
- Spotlights_FrontColor.003_0 (mesh 90)
- Spotlights_Glass_0 (mesh 91)
- Spotlights_White.001_0 (mesh 92)

**Materials used:**
- Light (material 36)
- FrontColor.003 (material 28)
- Glass (material 12)
- White.001 (material 55)

---

## Search Results

### userData Fields
**Status:** ❌ Not found
**Notes:** No nodes contain "userData" property

### extras Properties
**Status:** ⚠️ Found only at asset level
**Location:** Asset metadata only
**Notes:** Individual nodes do not have "extras" properties

### Custom Node Names
**Status:** ✅ Found
**Candidates:**
- "Spotlights" - Lighting fixture at position [156.856, 427.100, -382.132]
- No nodes with "annotation" in name

---

## Metadata Mapping Strategy

Since this .gltf file **does not contain** custom userData or extras on nodes, we have these options:

### Option 1: **Name-Based Detection**
Extract nodes by name pattern matching:
```typescript
if (node.name.toLowerCase().includes('spotlight') ||
    node.name.toLowerCase().includes('annotation')) {
  // Extract position from matrix
  // Render annotation
}
```

### Option 2: **Position-Based Annotations**
Manually define annotation positions based on known locations:
```typescript
const annotations = [
  {
    position: [1.568, 4.271, -3.821], // Spotlight position (divided by 100)
    title: "Kitchen Lighting",
    description: "Recessed LED spotlights"
  },
  // Add more...
]
```

### Option 3: **Add Custom Metadata**
Modify the .gltf file to add extras:
```json
{
  "name": "Spotlights",
  "extras": {
    "annotation": {
      "title": "Kitchen Spotlights",
      "description": "Energy-efficient LED downlights",
      "category": "lighting"
    }
  }
}
```

---

## Recommended Approach

### Phase 1: Extract from Node Names
1. Traverse scene graph
2. Find nodes with "spotlight", "light", or specific keywords
3. Extract position from transformation matrix
4. Render Html annotation at that position

### Phase 2: Add Custom Metadata
1. Create a separate JSON file mapping node names to annotation data
2. Or modify .gltf to include extras (requires re-export)

---

## Implementation Plan

```typescript
// 1. Extract spotlights during model load
function extractAnnotations(gltf) {
  const annotations = []

  gltf.scene.traverse((node) => {
    const nameLower = node.name.toLowerCase()

    // Check for spotlight/annotation keywords
    if (nameLower.includes('spotlight') ||
        nameLower.includes('annotation') ||
        nameLower.includes('marker')) {

      // Get world position
      const position = new THREE.Vector3()
      node.getWorldPosition(position)

      annotations.push({
        name: node.name,
        position: position.toArray(),
        userData: node.userData || {},
        extras: node.userData?.gltfExtensions?.extras || {}
      })
    }
  })

  return annotations
}

// 2. Render annotations
{annotations.map((anno, i) => (
  <Html key={i} position={anno.position}>
    <div className="glass-panel p-2">
      {anno.userData.title || anno.name}
    </div>
  </Html>
))}
```

---

## Example Annotation Data Structure

```json
{
  "annotations": [
    {
      "nodeName": "Spotlights",
      "position": [1.568, 4.271, -3.821],
      "title": "Kitchen Lighting",
      "description": "Recessed LED spotlights with dimming capability",
      "category": "lighting",
      "specs": {
        "wattage": "6W per light",
        "lumens": "500",
        "colorTemp": "3000K warm white"
      }
    }
  ]
}
```

---

## Next Steps

1. ✅ Create annotation extraction utility
2. ⬜ Create external annotation data file
3. ⬜ Build Html annotation components
4. ⬜ Add click-to-focus functionality
5. ⬜ Add annotation editor UI for adding custom annotations
