# ProgramIQ v4 - System Architecture Overview

**Pre-Construction Intelligence Platform**  
**3D Immersive Workspace**

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 16 on Vercel)                            │
│                                                              │
│  Landing Page (/):                                          │
│  ├─ Left: Marketing copy + Clerk auth                       │
│  └─ Right: R3F Canvas (building preview)                    │
│                                                              │
│  Dashboard (/dashboard):                                    │
│  ├─ Project grid (traditional cards)                        │
│  ├─ Create new project                                      │
│  └─ SystemTicker + Dock + AICore                            │
│                                                              │
│  3D Workspace (/project/[id]):                              │
│  ├─ Full-screen R3F Canvas                                  │
│  │  ├─ Building model (.gltf)                               │
│  │  ├─ Billboard: Budget/Schedule                           │
│  │  ├─ Billboard: Health Dashboard                          │
│  │  ├─ Billboard: Timeline                                  │
│  │  └─ Billboard: Documents                                 │
│  ├─ Top Bar: Project name + Phases + User menu              │
│  ├─ Dock: Navigation + AICore                               │
│  ├─ Left Slide-in: AI Chat (VoiceChat)                      │
│  ├─ Left Sidebar: Model Parts (HeroForge style)             │
│  ├─ Right Panel: Part Library (Material grid)               │
│  └─ Bottom: Material Swatches (Little Workshop)             │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ WebSocket
                   ↓
┌──────────────────────────────────────────────────────────────┐
│  LIVEKIT CLOUD (SaaS)                                        │
│  ├─ WebRTC Media Router                                      │
│  ├─ STT: Deepgram (voice → text)                            │
│  └─ TTS: OpenAI tts-1 (text → voice)                        │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ WebSocket
                   ↓
┌──────────────────────────────────────────────────────────────┐
│  PYTHON BACKEND (Railway/Render)                             │
│                                                              │
│  LangGraph Orchestrator:                                     │
│  ├─ Model Router (GPT-4o-mini/GPT-4o/Claude)                │
│  ├─ Design Agent                                             │
│  │  ├─ Tool: generate_nano_banana()                         │
│  │  ├─ Tool: convert_to_3d_meshy()                          │
│  │  └─ Tool: search_ikea_products()                         │
│  ├─ PM Agent                                                 │
│  │  ├─ Tool: calculate_evm()                                │
│  │  ├─ Tool: run_what_if_scenario()                         │
│  │  └─ Tool: generate_health_report()                       │
│  └─ Scene Agent                                              │
│     ├─ Tool: set_phase()                                    │
│     ├─ Tool: set_camera()                                   │
│     └─ Tool: toggle_visibility()                            │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ REST/HTTP
                   ↓
┌──────────────────────────────────────────────────────────────┐
│  EXTERNAL APIS                                               │
│  ├─ Google Nano Banana (text → 3D description)              │
│  ├─ Meshy.ai (description → .glb model)                      │
│  ├─ IKEA API (product search)                               │
│  ├─ OpenAI (GPT-4o-mini, GPT-4o, GPT-4 Vision)              │
│  ├─ Anthropic (Claude Sonnet 4)                             │
│  └─ Deepgram (STT)                                           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  STORAGE                                                     │
│                                                              │
│  Supabase Cloud:                                             │
│  ├─ PostgreSQL Database                                      │
│  │  ├─ projects (name, model_url, phase, owner_id)          │
│  │  ├─ customizations (part_id, material_id)                │
│  │  ├─ documents (type, url, generated_at)                  │
│  │  └─ health_checks (cpi, spi, eac, concerns)              │
│  └─ Storage Bucket: models/                                  │
│     └─ {project_id}/{model_name}.glb                         │
│                                                              │
│  Clerk (Auth):                                               │
│  ├─ Users                                                    │
│  └─ Sessions                                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### 1. User Generates Design

```
User (voice): "Generate modern farmhouse kitchen"
  ↓
Frontend → LiveKit Cloud (STT)
  ↓
"Generate modern farmhouse kitchen" (text)
  ↓
Python Backend → LangGraph Orchestrator
  ↓
classify_task() → "design_generation"
  ↓
Design Agent
  ↓
generate_nano_banana("modern farmhouse kitchen")
  ↓
Google Nano Banana API
  ↓
Returns: "A spacious kitchen with white shaker cabinets, 
         butcher block counters, farmhouse sink..."
  ↓
convert_to_3d_meshy(description)
  ↓
Meshy.ai API
  ↓
Returns: kitchen.glb file URL
  ↓
Upload to Supabase Storage
  ↓
Returns: https://xxx.supabase.co/storage/v1/models/abc123/kitchen.glb
  ↓
Save to projects.model_url
  ↓
Python Backend → LiveKit Cloud (TTS)
  ↓
"I've generated your modern farmhouse kitchen. Loading now..."
  ↓
Frontend receives model_url
  ↓
BuildingModel component loads .glb
  ↓
User sees 3D model in scene
```

### 2. User Customizes Materials

```
User clicks: Left sidebar → "Exterior Wall"
  ↓
Frontend highlights wall in 3D (outline)
  ↓
Right panel shows material grid
  ↓
User clicks: "Brick - Red"
  ↓
Frontend applies texture to mesh
  ↓
Save to Supabase:
customizations table:
{
  project_id: "abc123",
  part: "exterior_wall",
  material: "brick_red",
  price: 4500
}
  ↓
Update budget billboard in real-time
```

### 3. User Exports Documents

```
User clicks: Documents billboard → "Generate All"
  ↓
Frontend calls document generators:
  - generateSOW(project)
  - generateContract(project)
  - generateTakeoff(project)
  - generateSchedule(project)
  - generateRisks(project)
  - generateSitePlan(project)
  ↓
Each generator:
  - Fetches project data from Supabase
  - Generates PDF/CSV/XML
  - Returns blob
  ↓
Zip all files
  ↓
Download: project-name-documents.zip
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **3D:** React Three Fiber + Drei + Postprocessing
- **UI:** Tailwind v4 + Radix UI + Framer Motion
- **Auth:** Clerk
- **State:** Zustand
- **Icons:** Lucide React

### Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI (for API routes)
- **AI:** LangGraph (orchestration)
- **LLMs:** OpenAI (GPT-4o-mini, GPT-4o), Anthropic (Claude Sonnet 4)
- **Voice:** LiveKit Agents SDK
- **Package Manager:** uv

### Services
- **Voice:** LiveKit Cloud
- **Database:** Supabase (PostgreSQL + Storage)
- **Auth:** Clerk
- **Hosting:** Vercel (frontend), Railway/Render (backend)
- **APIs:** Google Nano Banana, Meshy.ai, IKEA, Deepgram

---

## Cost Structure (Per 15-min Session)

### Voice Pipeline:
- **STT (Deepgram):** $0.07
- **TTS (OpenAI tts-1):** $0.17 (vs ElevenLabs $2.03)
- **LiveKit Cloud:** $0.01

### AI Models (Smart Router):
- **Simple chat (GPT-4o-mini):** $0.001 per message
- **Complex reasoning (GPT-4o):** $0.01 per message
- **Vision analysis (GPT-4o):** $0.02 per image
- **Orchestration (Claude):** $0.03 per workflow

### 3D Generation:
- **Nano Banana:** $0.10 per concept
- **Meshy.ai:** $0.50 per model

**Total per session: ~$0.54** (77% cheaper than original $2.34)

**Service pricing:**
- Tier 1 ($4,999): 99% margin
- Tier 2 ($12,999): 99% margin
- Tier 3 ($24,999): 99% margin

---

## Security

### Authentication:
- Clerk handles all auth
- Server-side checks in API routes
- JWTs for sessions

### Data Access:
- Supabase RLS policies
- Users only see their projects
- Service role key in backend only

### API Keys:
- Environment variables (never committed)
- Separate keys for dev/prod
- Rotate regularly

---

## Scalability

### Phase 1 (0-100 customers):
- Frontend: Vercel (unlimited)
- Backend: Railway Hobby ($5/mo)
- Database: Supabase Free tier
- **Cost: ~$50/mo**

### Phase 2 (100-500 customers):
- Frontend: Vercel Pro ($20/mo)
- Backend: Railway Pro ($20/mo)
- Database: Supabase Pro ($25/mo)
- **Cost: ~$200/mo**

### Phase 3 (500+ customers):
- Frontend: Vercel Enterprise
- Backend: Multiple Railway instances (load balanced)
- Database: Supabase Team ($599/mo)
- **Cost: ~$1,000/mo**

---

## Development Workflow

### Local Development:
```bash
# Frontend
pnpm dev              # http://localhost:3000

# Backend (separate terminal)
cd backend
.venv\Scripts\activate
python main.py        # LiveKit agent server
```

### Deployment:
```bash
# Frontend (auto-deploy on git push)
git push origin main
→ Vercel builds and deploys

# Backend
railway up
→ Railway builds and deploys
```

### Testing:
```bash
# Frontend
pnpm build           # Check build passes
pnpm tsc --noEmit    # Type check
pnpm lint            # Lint check

# Backend
pytest               # Unit tests
```

---

## Monitoring

### Frontend (Vercel):
- Analytics dashboard
- Real-time errors
- Performance metrics

### Backend (Railway):
- Logs viewer
- CPU/memory usage
- Request metrics

### LangGraph (LangSmith):
- Trace all agent calls
- Debug workflows
- Evaluate responses

---

## Future Phases

### Phase 12: Cesium Integration
- Google Earth satellite view
- Site context overlay
- Export with location

### Phase 13: Deep Agents
- Multi-room decomposition
- Specialized room agents
- Large file handling

### Phase 14: LiDAR Processing
- Point cloud import (.las, .laz)
- Mesh generation
- As-built documentation

### Phase 15: Marketplace
- Connect GCs with homeowners
- Take 10% commission
- Platform business model

---

## Success Metrics

### Technical:
- 60fps 3D performance
- <200ms voice latency
- 99.9% uptime
- <2s page load

### Business:
- 100 customers Year 1
- $1M revenue Year 1
- 95%+ profit margin
- 5-star reviews

Ready to build! 🚀
