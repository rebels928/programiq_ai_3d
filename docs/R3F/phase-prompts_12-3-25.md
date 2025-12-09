# PHASES

## Phase 1: Landing + Dashboard

**Read:** docs/PHASE_1_REVISED_LANDING_PAGE.md, docs/ARCHITECTURE_OVERVIEW_3D.md

**Build:**

1. `src/app/page.tsx` - Split screen (marketing left, 3D right)
2. `src/components/BuildingPreview.tsx` - Simple 3D building
3. `src/app/dashboard/page.tsx` - Project grid

**Install:** `pnpm add @react-three/fiber @react-three/drei three @types/three`

---

## Phase 2: 3D Workspace

**Read:** docs/PHASE_2_REVISED_3D_IMMERSIVE.md

**Build:**

1. `src/app/project/[id]/page.tsx` - Full R3F Canvas
2. `src/components/project/TopBar.tsx` - Project name + phases
3. Update Dock with workspace icons
4. Ground plane + pedestal

---

## Phase 3: AI Chat

**Read:** docs/PHASE_2_REVISED_3D_IMMERSIVE.md (VoiceChat section)

**Build:**

1. `src/components/project/ChatPanel.tsx` - Slide-in panel
2. `src/components/project/VoiceChat.tsx` - Text input + messages
3. Toggle from dock icon

---

## Phase 4: Model Loading

**Read:** docs/ARCHITECTURE_OVERVIEW_3D.md (Data Flow section)

**Build:**

1. `src/components/project/BuildingModel.tsx` - useGLTF loader
2. `src/components/project/ModelImport.tsx` - File picker
3. Supabase Storage setup

---

## Phase 5: Part Selection

**Read:** docs/PHASE_2_REVISED_3D_IMMERSIVE.md (HeroForge section)

**Build:**

1. `src/components/project/ModelPartsPanel.tsx` - Left sidebar tree
2. Part highlighting in BuildingModel
3. `src/components/project/PartOptionsPanel.tsx` - Right material grid

---

## Phase 6: Material Swatches

**Read:** docs/PHASE_2_REVISED_3D_IMMERSIVE.md (Little Workshop section)

**Build:**

1. `src/components/project/MaterialSwatches.tsx` - Bottom swatches
2. Apply material to selected mesh

---

## Phase 7: PM Billboards

**Read:** docs/PHASE_2_REVISED_3D_IMMERSIVE.md (Billboard section)

**Build:**

1. `src/components/project/Billboard.tsx` - HTML in 3D
2. BudgetCard, HealthCard, TimelineCard, DocumentsCard
3. Position around building

---

## Phase 8: Document Export

**Read:** docs/ARCHITECTURE_OVERVIEW_3D.md

**Build:**

1. Install: `pnpm add jspdf jspdf-autotable papaparse docx jszip file-saver`
2. `src/lib/documents/` - 6 generators (SOW, Contract, etc.)
3. Export button → ZIP download

---

## Phase 9: Python Backend

**Read:** docs/ProgramIQ_v4_LiveKit_LangGraph_Integration.md, docs/ProgramIQ_v4_Local_Development_Setup.md

**Build:**

1. `backend/` - Python venv + uv install
2. `backend/agents/` - LangGraph orchestrator
3. `backend/tools/` - Nano Banana, Meshy, IKEA
4. LiveKit agent integration

---

## Phase 10: Mobile

**Build:**

1. Responsive breakpoints
2. Bottom tabs (mobile)
3. Touch controls

---

## Phase 11: Polish

**Build:**

1. Loading states, error handling
2. Test: build + lint
3. Deploy: Vercel + Railway

---

## Phase 12-13: Later

- Phase 12: Cesium (Google Earth)
- Phase 13: Deep Agents (multi-room)

---

**Timeline:** 6 weeks to MVP
