# Phase 2 REVISED: 3D Immersive Workspace
## Inspired by Bruno Simon + HeroForge + Little Workshop

---

## Core Concept: "Construction World Canvas"

**Full-screen 3D scene** with building model at center, interactive billboards for data, and minimal 2D UI overlays.

---

## Layout Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  React Three Fiber Canvas (100vw x 100vh)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    3D SCENE                               │ │
│  │                                                           │ │
│  │   [Billboard: Budget/Schedule]    [Building Model]       │ │
│  │                                        (.gltf)            │ │
│  │   [Billboard: Risks/EVM]          [Phase Indicator]      │ │
│  │                                                           │ │
│  │   [Billboard: Documents]          [Billboard: Timeline]  │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ 2D UI OVERLAYS ────────────────────────────────────────┐  │
│  │ Top-Left: Project Name + Phase Buttons                  │  │
│  │ Top-Right: User Menu (Clerk)                            │  │
│  │ Bottom: Dock (AICore center, icons left/right)          │  │
│  │ Slide-in Panel: AI Chat (when activated)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## From Bruno Simon (World Canvas):

✅ **3D World Navigation**
- Drag to orbit camera around building
- Scroll to zoom in/out
- No WASD keys (simpler)
- Smooth camera animations between phases

✅ **Billboards in 3D Space**
- HTML content rendered in 3D
- Float near building model
- Click to focus (camera zooms to billboard)
- Always face camera (sprite behavior)

✅ **Ground Plane**
- Simple grid or textured ground
- Construction site aesthetic
- Building sits on pedestal

---

## From HeroForge (Part Customization):

✅ **Left Sidebar: Model Parts**
```
┌─ Model Control ─────┐
│ 🏗️ Structure        │
│   ├─ Foundation     │
│   ├─ Framing        │
│   └─ Roof           │
│ 🎨 Materials        │
│   ├─ Exterior       │
│   ├─ Interior       │
│   └─ Finishes       │
│ 🪟 Windows/Doors    │
│ 📦 IKEA Items       │
└─────────────────────┘
```

- Collapsible categories
- Click to select part
- Right panel shows options
- Selected part highlights in 3D

✅ **Right Panel: Part Library**
```
┌─ Exterior Materials ─────────┐
│ [Wood] [Brick] [Stucco]      │
│ [Cement] [Stone] [Metal]     │
│                               │
│ Selected: Wood - Ash          │
│ Price: $4,500                 │
│ [Apply to Model]              │
└───────────────────────────────┘
```

- Grid of options (like face options in HeroForge)
- Click to preview on model
- Shows price/info
- Apply button confirms

✅ **Bottom Social Bar**
- Share button
- Save button
- Export button
- Like HeroForge's social icons

---

## From Little Workshop (Material Customization):

✅ **Material Swatches**
- Floating at bottom-center
- 3-4 circular material previews
- Click to apply to selected surface
- Physically-based materials (wood, metal, fabric)

✅ **Info Panel (Slide-in Right)**
- Project name + description
- Material specs
- Dimensions
- Like their "ABOUT" panel

✅ **Minimal UI**
- Top-left: Logo + project name
- Top-right: Help icon (?)
- No cluttered controls
- Clean, professional

✅ **Realistic Rendering**
- Good lighting (three-point setup)
- Soft shadows
- Reflections on floor
- Professional quality

---

## ProgramIQ v4 Implementation

### 1. Main 3D Scene
```tsx
// src/app/project/[id]/page.tsx
<Canvas camera={{ position: [15, 10, 15], fov: 45 }}>
  <OrbitControls
    enableDamping
    dampingFactor={0.05}
    minDistance={5}
    maxDistance={50}
  />
  
  <Environment preset="sunset" />
  <ambientLight intensity={0.3} />
  <directionalLight position={[10, 10, 5]} intensity={1} />
  
  {/* Ground */}
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
    <planeGeometry args={[100, 100]} />
    <meshStandardMaterial color="#8b8b8b" />
  </mesh>
  
  {/* Building Model */}
  <BuildingModel
    url={project.modelUrl}
    phase={currentPhase}
  />
  
  {/* Billboards */}
  <Billboard position={[-8, 3, 0]}>
    <BudgetCard budget={project.budget} variance={project.variance} />
  </Billboard>
  
  <Billboard position={[8, 3, 0]}>
    <RisksCard risks={project.risks} />
  </Billboard>
  
  <Billboard position={[0, 5, -8]}>
    <TimelineCard schedule={project.schedule} />
  </Billboard>
  
  <Billboard position={[0, 3, 8]}>
    <DocumentsCard docs={project.documents} />
  </Billboard>
</Canvas>
```

### 2. Billboard Component
```tsx
// src/components/project/Billboard.tsx
import { Html } from '@react-three/drei'

export function Billboard({ 
  position, 
  children 
}: { 
  position: [number, number, number]
  children: React.ReactNode 
}) {
  return (
    <Html
      position={position}
      center
      distanceFactor={10}
      transform
      sprite // Always face camera
    >
      <div className="glass-panel p-6 min-w-[300px] pointer-events-auto">
        {children}
      </div>
    </Html>
  )
}
```

### 3. Left Sidebar (Model Parts)
```tsx
// src/components/project/ModelPartsPanel.tsx
<div className="fixed left-4 top-20 w-64 glass-panel p-4">
  <h3 className="font-bold mb-4">MODEL PARTS</h3>
  
  <Accordion>
    <AccordionItem value="structure">
      <AccordionTrigger>🏗️ Structure</AccordionTrigger>
      <AccordionContent>
        <button onClick={() => selectPart('foundation')}>Foundation</button>
        <button onClick={() => selectPart('framing')}>Framing</button>
        <button onClick={() => selectPart('roof')}>Roof</button>
      </AccordionContent>
    </AccordionItem>
    
    <AccordionItem value="materials">
      <AccordionTrigger>🎨 Materials</AccordionTrigger>
      <AccordionContent>
        <button onClick={() => selectPart('exterior')}>Exterior</button>
        <button onClick={() => selectPart('interior')}>Interior</button>
      </AccordionContent>
    </AccordionItem>
    
    <AccordionItem value="ikea">
      <AccordionTrigger>📦 IKEA Items</AccordionTrigger>
      <AccordionContent>
        <button onClick={() => openIKEABrowser()}>Browse Furniture</button>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>
```

### 4. Right Panel (Part Options)
```tsx
// src/components/project/PartOptionsPanel.tsx
{selectedPart && (
  <div className="fixed right-4 top-20 w-80 glass-panel p-6">
    <h3 className="font-bold mb-4">{selectedPart.name}</h3>
    
    {/* Material Grid (like HeroForge faces) */}
    <div className="grid grid-cols-3 gap-3 mb-6">
      {materialOptions.map(material => (
        <button
          key={material.id}
          className={`aspect-square rounded-lg border-2 ${
            material.id === selectedMaterial 
              ? 'border-cyan-500' 
              : 'border-white/10'
          }`}
          onClick={() => previewMaterial(material)}
        >
          <div 
            className="w-full h-full rounded-lg"
            style={{ 
              background: material.preview,
              backgroundSize: 'cover'
            }}
          />
        </button>
      ))}
    </div>
    
    {/* Selected Material Info */}
    <div className="mb-4">
      <p className="text-sm text-muted-foreground">Selected:</p>
      <p className="font-bold">{selectedMaterialInfo.name}</p>
      <p className="text-cyan-500">${selectedMaterialInfo.price}</p>
    </div>
    
    <Button onClick={applyMaterial} className="w-full">
      Apply to Model
    </Button>
  </div>
)}
```

### 5. Bottom Material Swatches (Little Workshop style)
```tsx
// src/components/project/MaterialSwatches.tsx
<div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-4">
  {quickMaterials.map(material => (
    <button
      key={material.id}
      className={`w-16 h-16 rounded-full border-4 ${
        material.id === activeMaterial 
          ? 'border-white' 
          : 'border-white/20'
      }`}
      style={{
        background: material.preview,
        backgroundSize: 'cover'
      }}
      onClick={() => applyMaterial(material)}
    />
  ))}
</div>
```

### 6. Dock (Bottom, like HeroForge)
```tsx
// src/components/Dock.tsx (updated)
<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
  <div className="flex items-center gap-4 p-4 px-8 glass-dock">
    {/* Left Icons */}
    <DockIcon icon={MessageSquare} label="AI Chat" onClick={toggleChat} />
    <DockIcon icon={Camera} label="Screenshot" onClick={screenshot} />
    <DockIcon icon={Download} label="Export" onClick={exportModel} />
    
    {/* Center: AI Core */}
    <div className="mx-6">
      <AICore />
    </div>
    
    {/* Right Icons */}
    <DockIcon icon={Share2} label="Share" onClick={share} />
    <DockIcon icon={Save} label="Save" onClick={save} />
    <DockIcon icon={Settings} label="Settings" onClick={openSettings} />
  </div>
</div>
```

### 7. Top UI Overlay
```tsx
// src/components/project/TopBar.tsx
<div className="fixed top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
  {/* Left: Project Name + Phase Controls */}
  <div className="glass-panel px-6 py-3 pointer-events-auto">
    <h1 className="font-bold text-lg mb-2">{project.name}</h1>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(phase => (
        <button
          key={phase}
          className={`px-4 py-2 rounded-lg font-mono text-sm ${
            phase === currentPhase
              ? 'bg-cyan-500 text-black'
              : 'bg-white/10 hover:bg-white/20'
          }`}
          onClick={() => setPhase(phase)}
        >
          {phase}
        </button>
      ))}
    </div>
  </div>
  
  {/* Right: User Menu */}
  <div className="glass-panel p-2 pointer-events-auto">
    <UserButton />
  </div>
</div>
```

### 8. AI Chat (Slide-in Panel)
```tsx
// src/components/project/ChatPanel.tsx
<AnimatePresence>
  {isChatOpen && (
    <motion.div
      initial={{ x: -400 }}
      animate={{ x: 0 }}
      exit={{ x: -400 }}
      className="fixed left-0 top-0 bottom-0 w-[400px] glass-panel z-40"
    >
      <VoiceChat projectId={projectId} />
    </motion.div>
  )}
</AnimatePresence>
```

---

## Key Features Summary

### From Bruno Simon:
- ✅ Full 3D world canvas
- ✅ Drag/scroll navigation
- ✅ Billboards in 3D space
- ✅ Smooth camera transitions

### From HeroForge:
- ✅ Left sidebar (model parts tree)
- ✅ Right panel (part library grid)
- ✅ Part selection/preview
- ✅ Bottom social icons

### From Little Workshop:
- ✅ Material swatches (bottom-center)
- ✅ Realistic rendering
- ✅ Minimal UI overlay
- ✅ Info panel (slide-in)

### ProgramIQ Additions:
- ✅ Phase controls (top-left)
- ✅ AI chat (slide-in left)
- ✅ Voice integration (LiveKit)
- ✅ Dock with AICore

---

## Mobile Responsive

**Desktop:** Full 3D experience as described

**Tablet:** Hide sidebars, show as bottom sheets

**Mobile:**
- Single 3D view
- Bottom tabs: Model / Chat / Stats
- Swipe to switch
- Simplified controls

---

## Implementation Steps

### Week 1: 3D Foundation
1. Setup R3F Canvas with OrbitControls
2. Add ground plane + lighting
3. Load building model (.gltf)
4. Billboard component with HTML

### Week 2: UI Overlays
1. Top bar (project name + phases)
2. Dock (icons + AICore)
3. Left sidebar (model parts)
4. Right panel (part options)
5. Material swatches (bottom)

### Week 3: Interactions
1. Part selection (click to highlight)
2. Material preview/apply
3. Camera animations (phase transitions)
4. Billboard focus (click to zoom)

### Week 4: Chat + Voice
1. Slide-in chat panel
2. LiveKit integration
3. AI responses
4. Voice controls

---

## Dependencies

```bash
pnpm add @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm add three @types/three
pnpm add framer-motion
```

Already have: Tailwind, Radix UI, Lucide icons

---

## Success Criteria

- ✅ Immersive 3D experience (not "app UI")
- ✅ Smooth 60fps performance
- ✅ Professional rendering quality
- ✅ Intuitive navigation (drag/zoom)
- ✅ Part customization works
- ✅ All features accessible
- ✅ Mobile responsive

---

This is a **complete architectural pivot** - much better than traditional panels. Ready to rebuild Phase 2 with this approach?
