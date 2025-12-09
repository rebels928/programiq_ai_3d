# PHASE PROMPTS - 3D Immersive Architecture



---

## Phase 0: Project Setup ✅ (Already Complete)

Components extracted:
- OSWindow.tsx
- Dock.tsx
- SystemTicker.tsx
- DockIcon.tsx

**Status:** Done. Keep existing work.

---

## Phase 1: Landing Page + Dashboard

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Read PHASE_1_REVISED_LANDING_PAGE.md from docs/
3. Begin implementation
```

### Tasks:

**1. Landing Page (Option A: Little Workshop style)**
```
src/app/page.tsx:
- Left 40%: Marketing copy + Clerk auth
- Right 60%: R3F Canvas with BuildingPreview
- Responsive: Stack on mobile
```

**2. BuildingPreview Component**
```
src/components/BuildingPreview.tsx:
- Simple building (box + cone roof)
- Auto-rotate orbit
- Gentle floating animation
```

**3. Dashboard** (Keep existing work)
```
src/app/dashboard/page.tsx:
- Project grid
- Create new card
- SystemTicker
- Dock with AICore
```

**4. Routes:**
- `/` → Landing
- `/dashboard` → Grid (protected)
- Clerk handles `/sign-in`, `/sign-up`

**Packages needed:**
```bash
pnpm add @react-three/fiber @react-three/drei @react-three/postprocessing three @types/three
```

**Test:** Navigate `/` → click GET STARTED → Clerk modal → Dashboard

---

## Phase 2: 3D Workspace Foundation

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Read PHASE_2_REVISED_3D_IMMERSIVE.md from docs/
3. Begin implementation
```

### Tasks:

**1. Create Project Route**
```
src/app/project/[id]/page.tsx:
- Full-screen R3F Canvas
- OrbitControls (drag/zoom)
- Ground plane
- Empty pedestal (for model)
- Basic lighting
```

**2. Top Bar**
```
src/components/project/TopBar.tsx:
- Project name
- Phase buttons (1-5)
- User menu (top-right)
- Back to dashboard link
```

**3. Dock** (Updated)
```
src/components/Dock.tsx:
- Chat icon (left)
- Screenshot icon
- Export icon
- AICore (center)
- Share icon
- Save icon
- Settings (right)
```

**4. Basic Scene**
```tsx
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
  
  {/* Pedestal for building */}
  <mesh position={[0, 0, 0]}>
    <cylinderGeometry args={[3, 3, 0.5, 32]} />
    <meshStandardMaterial color="#ddd" />
  </mesh>
</Canvas>
```

**Test:** Click project → see 3D scene → drag/zoom works

---

## Phase 3: AI Chat Panel

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Read VoiceChat section from PHASE_2_REVISED_3D_IMMERSIVE.md
3. Begin implementation
```

### Tasks:

**1. Chat Panel (Slide-in)**
```
src/components/project/ChatPanel.tsx:
- Fixed left-0, full height
- Slide in from left (Framer Motion)
- Width: 400px
- Glass panel background
```

**2. VoiceChat Component** (Keep from original Phase 3)
```
src/components/project/VoiceChat.tsx:
- Text input
- Mic button
- Message history
- Voice state indicator
```

**3. Toggle from Dock**
```tsx
const [isChatOpen, setIsChatOpen] = useState(false)

// In Dock:
<DockIcon 
  icon={MessageSquare} 
  onClick={() => setIsChatOpen(!isChatOpen)}
/>

// ChatPanel:
<AnimatePresence>
  {isChatOpen && (
    <motion.div
      initial={{ x: -400 }}
      animate={{ x: 0 }}
      exit={{ x: -400 }}
    >
      <VoiceChat />
    </motion.div>
  )}
</AnimatePresence>
```

**Note:** LiveKit integration comes in Phase 9 (Python backend)

**Test:** Click chat icon → panel slides in → can type messages

---

## Phase 4: Model Generation & Loading

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Read "Model Loading Flow" section
3. Begin implementation
```

### Tasks:

**1. BuildingModel Component**
```
src/components/project/BuildingModel.tsx:
- Load .glb from URL (useGLTF)
- Handle loading state
- Handle errors
- Phase-based visibility
```

**2. Model Import UI**
```
src/components/project/ModelImport.tsx:
- File picker (.glb, .obj, .fbx)
- Upload to Supabase Storage
- Save URL to project record
- Trigger model load
```

**3. AI Generation Trigger**
```tsx
// When user submits chat:
"Generate modern farmhouse kitchen"
  ↓
// Show loading state on pedestal
<Suspense fallback={<LoadingCube />}>
  <BuildingModel url={generatedModelUrl} />
</Suspense>
```

**4. Supabase Storage Setup**
```sql
-- Storage bucket
create bucket models;

-- Project table
alter table projects add column model_url text;
alter table projects add column nano_banana_prompt text;
```

**Mock for now:** Use placeholder .glb until Python backend (Phase 9)

**Test:** Import .glb → loads in scene → orbits around it

---

## Phase 5: Part Selection (HeroForge Style)

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Read "HeroForge" section from PHASE_2_REVISED_3D_IMMERSIVE.md
3. Begin implementation
```

### Tasks:

**1. Left Sidebar (Model Parts Tree)**
```
src/components/project/ModelPartsPanel.tsx:
- Fixed left-4, top-20
- Collapsible categories:
  * 🏗️ Structure (Foundation, Framing, Roof)
  * 🎨 Materials (Exterior, Interior, Finishes)
  * 🪟 Windows/Doors
  * 📦 IKEA Items
- Click → select part in 3D
```

**2. Part Highlighting**
```
src/components/project/BuildingModel.tsx:
- Click mesh → highlight with outline
- Store selected part in state
- Show in right panel
```

**3. Right Panel (Part Library)**
```
src/components/project/PartOptionsPanel.tsx:
- Shows when part selected
- Grid of material options
- Preview button
- Apply button
- Price display
```

**4. Material Grid** (like HeroForge faces)
```tsx
<div className="grid grid-cols-3 gap-3">
  {materials.map(material => (
    <button
      className={`aspect-square ${
        selected ? 'border-cyan-500' : 'border-white/10'
      }`}
    >
      <div style={{ background: material.preview }} />
    </button>
  ))}
</div>
```

**Mock data:** Use texture URLs until IKEA integration

**Test:** Click "Exterior" → right panel shows materials → click material → previews on model

---

## Phase 6: Material Swatches (Little Workshop Style)

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Read "Little Workshop" section
3. Begin implementation
```

### Tasks:

**1. Bottom Swatches**
```
src/components/project/MaterialSwatches.tsx:
- Fixed bottom-24 center
- 4-5 circular material previews
- Click → apply to selected surface
- Instant visual feedback
```

**2. Quick Materials**
```tsx
const quickMaterials = [
  { id: 'wood-ash', preview: 'url(...)' },
  { id: 'brick-red', preview: 'url(...)' },
  { id: 'stucco-white', preview: 'url(...)' },
  { id: 'metal-grey', preview: 'url(...)' }
]
```

**3. Apply to Model**
```tsx
function applyMaterial(material) {
  if (selectedPart) {
    // Update mesh material
    selectedMesh.material = new THREE.MeshStandardMaterial({
      color: material.color,
      metalness: material.metalness,
      roughness: material.roughness
    })
  }
}
```

**Test:** Select part → click swatch → material applies instantly

---

## Phase 7: PM Billboards

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Read "PM Reports as 3D Billboards" section
3. Begin implementation
```

### Tasks:

**1. Billboard Component**
```
src/components/project/Billboard.tsx:
- Uses @react-three/drei Html
- Always faces camera (sprite)
- Click → expands
- Position in 3D space
```

**2. Budget Billboard**
```
src/components/project/BudgetCard.tsx:
- Shows: Budget, Variance, Progress
- Compact view (default)
- Expanded view (on click)
- Glass panel style
```

**3. Health Billboard**
```
src/components/project/HealthCard.tsx:
- Circular health gauge
- CPI, SPI metrics
- Concerns list
- Recommendations
```

**4. Timeline Billboard**
```
src/components/project/TimelineCard.tsx:
- Mini Gantt chart
- Critical path highlighted
- Click → full timeline view
```

**5. Documents Billboard**
```
src/components/project/DocumentsCard.tsx:
- 6 document icons
- Click → download menu
- Generate all button
```

**6. Position in Scene**
```tsx
<Billboard position={[-8, 3, 0]}>
  <BudgetCard />
</Billboard>

<Billboard position={[8, 3, 0]}>
  <HealthCard />
</Billboard>

<Billboard position={[0, 5, -8]}>
  <TimelineCard />
</Billboard>

<Billboard position={[0, 3, 8]}>
  <DocumentsCard />
</Billboard>
```

**Test:** See 4 billboards around building → click → expands → close → collapses

---

## Phase 8: Document Generation & Export

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Review document generation requirements
3. Begin implementation
```

### Tasks:

**1. Install Packages**
```bash
pnpm add jspdf jspdf-autotable papaparse docx
```

**2. Document Generators**
```
src/lib/documents/
├── generateSOW.ts          # Statement of Work
├── generateContract.ts     # Contract
├── generateTakeoff.ts      # Material CSV
├── generateSchedule.ts     # MS Project XML
├── generateRisks.ts        # Risk Register PDF
└── generateSitePlan.ts     # Google Earth overlay
```

**3. Export Button (Documents Billboard)**
```tsx
async function generateAll() {
  setGenerating(true)
  
  const docs = await Promise.all([
    generateSOW(project),
    generateContract(project),
    generateTakeoff(project),
    generateSchedule(project),
    generateRisks(project),
    generateSitePlan(project)
  ])
  
  // Zip all files
  const zip = new JSZip()
  docs.forEach(doc => zip.file(doc.name, doc.blob))
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  
  // Download
  saveAs(zipBlob, `${project.name}-documents.zip`)
  
  setGenerating(false)
}
```

**4. Individual Downloads**
```tsx
<Button onClick={() => downloadPDF(generateSOW(project))}>
  📄 SOW
</Button>
```

**5. Print View**
```tsx
// Modal overlay for print preview
function PrintPreview({ doc }) {
  return (
    <dialog open>
      <iframe src={doc.url} />
      <Button onClick={window.print}>Print</Button>
    </dialog>
  )
}
```

**Test:** Click "Generate All" → downloads ZIP with 6 files → open PDFs → formatted correctly

---

## Phase 9: Python Backend (LangGraph)

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Read ProgramIQ_v4_LiveKit_LangGraph_Integration.md from docs/
3. Read ProgramIQ_v4_Local_Development_Setup.md
4. Begin implementation
```

### Tasks:

**1. Setup Python Project**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
uv pip install livekit livekit-agents langgraph openai anthropic deepgram-sdk supabase
```

**2. Create Structure**
```
backend/
├── main.py                 # LiveKit agent entry
├── requirements.txt
├── .env
├── agents/
│   ├── model_router.py     # GPT-4o-mini/GPT-4o/Claude
│   ├── orchestrator.py     # LangGraph workflow
│   ├── design_agent.py     # Nano Banana + Meshy
│   ├── pm_agent.py         # EVM + What-If
│   └── scene_agent.py      # 3D control
└── tools/
    ├── scene_tools.py      # set_phase, set_camera
    ├── data_tools.py       # Supabase queries
    ├── analysis_tools.py   # calculate_evm
    ├── design_tools.py     # generate_nano_banana, meshy
    ├── ikea_tools.py       # search_ikea_products
    └── vision_tools.py     # GPT-4 Vision
```

**3. Model Router**
```python
# agents/model_router.py
def select_model(task_type, complexity):
    if task_type == "simple_chat":
        return "gpt-4o-mini"  # 94% cheaper
    elif task_type == "image_analysis":
        return "gpt-4o"  # Vision
    elif task_type == "orchestration":
        return "claude-sonnet-4"  # Best function calling
    else:
        return "gpt-4o"  # Complex reasoning
```

**4. LangGraph Workflow**
```python
# agents/orchestrator.py
from langgraph.graph import StateGraph

def create_agent_graph():
    graph = StateGraph(state_schema)
    
    graph.add_node("classify", classify_task)
    graph.add_node("design_agent", design_agent)
    graph.add_node("pm_agent", pm_agent)
    graph.add_node("scene_agent", scene_agent)
    graph.add_node("respond", generate_response)
    
    graph.add_edge("classify", route_to_agent)
    graph.add_edge("design_agent", "respond")
    graph.add_edge("pm_agent", "respond")
    graph.add_edge("scene_agent", "respond")
    
    return graph.compile()
```

**5. Design Tools**
```python
# tools/design_tools.py
async def generate_design(prompt: str) -> dict:
    # 1. Nano Banana
    description = await call_nano_banana(prompt)
    
    # 2. Meshy.ai
    model_url = await generate_3d_model(description)
    
    # 3. Upload to Supabase
    storage_url = await upload_to_supabase(model_url)
    
    return {
        "model_url": storage_url,
        "description": description
    }
```

**6. LiveKit Integration**
```python
# main.py
from livekit import agents

async def entrypoint(ctx: agents.JobContext):
    agent = VoiceAssistant(
        stt=agents.stt.Deepgram(),
        tts=agents.tts.OpenAI(voice="alloy"),
        llm_adapter=LangGraphAdapter(agent_graph)
    )
    
    await agent.start(ctx.room)
```

**7. Frontend Connection**
```
Frontend → LiveKit Cloud → Python Backend
         WebSocket          WebSocket
```

**Test:** 
- Run `python main.py`
- Frontend connects via LiveKit
- Say "Generate modern kitchen"
- Agent calls Nano Banana → Meshy → returns .glb URL
- Model loads in 3D scene

---

## Phase 10: Mobile Responsive

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Review mobile requirements
3. Begin implementation
```

### Tasks:

**1. Responsive Breakpoints**
```tsx
const isMobile = useMediaQuery('(max-width: 768px)')
const isTablet = useMediaQuery('(max-width: 1024px)')
```

**2. Mobile Layout**
```
Desktop: 3D + sidebars + billboards
Tablet: 3D + bottom sheets
Mobile: Single view + bottom tabs
```

**3. Bottom Tabs (Mobile)**
```
src/components/mobile/MobileTabBar.tsx:
- Model | Chat | Stats | Docs
- Swipe to switch
- Full-screen panels
```

**4. Touch Controls**
```tsx
<OrbitControls
  touches={{
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  }}
  enableDamping
/>
```

**5. Simplified UI**
```tsx
{isMobile && (
  <MobileWorkspace>
    {activeTab === 'model' && <Canvas>...</Canvas>}
    {activeTab === 'chat' && <VoiceChat />}
    {activeTab === 'stats' && <QuickStats />}
  </MobileWorkspace>
)}
```

**Test:** Resize to mobile → see tab bar → swipe between views → touch controls work

---

## Phase 11: Polish & Deploy

### Session Start:
```
1. Read CLAUDE_CONDENSED_3D_REVISED.md
2. Review deployment checklist
3. Begin implementation
```

### Tasks:

**1. Loading States**
```
- Skeleton screens
- Progress bars
- Spinner overlays
```

**2. Error Handling**
```
- Error boundaries
- Toast notifications
- Fallback UI
```

**3. Animations**
```
- Page transitions
- Billboard expand/collapse
- Camera movements (phase changes)
```

**4. Performance**
```
- Code splitting
- Lazy load R3F
- Optimize textures
- Memoize components
```

**5. Testing**
```bash
# Build
pnpm build

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# E2E
pnpm playwright test
```

**6. Deploy Frontend (Vercel)**
```bash
vercel --prod
```

**7. Deploy Backend (Railway)**
```bash
railway up
```

**8. Environment Variables**
```
Production:
- NEXT_PUBLIC_LIVEKIT_URL=wss://prod.livekit.cloud
- NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
- All API keys
```

**Test:** Full user flow end-to-end on production

---

## Phase 12: Cesium Integration (Later)

### Tasks:
- Google Earth satellite view
- Site context visualization
- Overlay design on real location
- Export site plan with context

---

## Phase 13: Deep Agents (Later)

### Tasks:
- Multi-room project decomposition
- Spawn specialized room agents
- File system for large LiDAR
- Automatic task planning

---

## Build Timeline

**Week 1:** Phase 0-2 (Landing, Dashboard, 3D workspace)
**Week 2:** Phase 3-4 (Chat, Model loading)
**Week 3:** Phase 5-6 (Part selection, Materials)
**Week 4:** Phase 7-8 (Billboards, Documents)
**Week 5:** Phase 9 (Python backend)
**Week 6:** Phase 10-11 (Mobile, Polish)
**Week 7-8:** Testing, deployment, beta users

**Total: 8 weeks to MVP**

---

## Success Criteria

- ✅ Immersive 3D experience
- ✅ 60fps performance
- ✅ Voice AI works
- ✅ Model generation works
- ✅ Part customization works
- ✅ PM billboards update
- ✅ Documents export
- ✅ Mobile responsive
- ✅ Production deployed

Ready to build! 🚀
