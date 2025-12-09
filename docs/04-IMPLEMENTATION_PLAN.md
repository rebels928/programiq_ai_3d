# ProgramIQ v4 - Implementation Plan by Phase

**Version:** 1.0  
**Date:** December 8, 2025  
**Total Timeline:** 16 weeks (Tier 1: 8 weeks, Tier 2: 4 weeks, Tier 3: 4+ weeks)

---

## Overview

This implementation plan breaks down the entire ProgramIQ v4 build into discrete phases. Each phase has clear objectives, deliverables, and success criteria.

---

## TIER 1: MVP (Weeks 1-8)

### Phase 1: Project Foundation
**Duration:** Week 1  
**Goal:** Initialize project with all core infrastructure

#### Objectives
1. Create Next.js 16 project with TypeScript
2. Configure authentication with Clerk
3. Set up Supabase database
4. Configure Cloudflare R2 storage
5. Establish project structure and conventions

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Initialize Next.js 16 with App Router | 1h | P0 |
| Configure TypeScript strict mode | 30m | P0 |
| Install and configure Tailwind v4 | 1h | P0 |
| Set up ESLint + Prettier | 30m | P1 |
| Install Clerk, configure middleware | 2h | P0 |
| Create Clerk webhook for user sync | 1h | P0 |
| Create Supabase project | 30m | P0 |
| Write and run database migrations | 2h | P0 |
| Seed cost database with 50+ items | 1h | P0 |
| Configure R2 buckets and client | 2h | P0 |
| Create base Zustand stores | 1h | P1 |
| Set up folder structure | 1h | P0 |

#### Deliverables
- [ ] Working Next.js app at localhost:3000
- [ ] Clerk sign-in/sign-up flow
- [ ] Database tables created with RLS
- [ ] R2 buckets accessible
- [ ] Project structure matching design doc

#### Success Criteria
- `pnpm build` passes without errors
- User can sign in and is redirected to /dashboard
- Database queries return seeded cost items
- File upload to R2 succeeds

---

### Phase 2: Core UI Components
**Duration:** Week 2  
**Goal:** Build reusable UI component library

#### Objectives
1. Create base UI components with Radix + Tailwind
2. Build layout components
3. Create landing page
4. Build dashboard with project grid

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Button component (variants, sizes) | 1h | P0 |
| Input, Textarea components | 1h | P0 |
| Select, Combobox components | 1h | P0 |
| Dialog, Sheet components | 1h | P0 |
| Accordion, Tabs components | 1h | P0 |
| Card, Badge components | 30m | P0 |
| Toast/notification system | 1h | P1 |
| Header component | 1h | P0 |
| Sidebar component | 1h | P0 |
| AppShell layout | 1h | P0 |
| Landing page (marketing) | 3h | P0 |
| Dashboard page | 2h | P0 |
| ProjectCard component | 1h | P0 |
| NewProjectCard component | 30m | P0 |

#### Deliverables
- [ ] 15+ reusable UI components
- [ ] Responsive landing page
- [ ] Dashboard with empty state
- [ ] Consistent design system

#### Success Criteria
- All components render without errors
- Landing page is responsive (mobile/tablet/desktop)
- Dashboard shows "No projects yet" state
- Dark mode toggle works (if implemented)

---

### Phase 3: Project CRUD
**Duration:** Week 3  
**Goal:** Full project lifecycle management

#### Objectives
1. Build new project wizard
2. Create project API routes
3. Implement project list and detail views
4. Add room and element forms

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| New project wizard (3 steps) | 4h | P0 |
| Step 1: Project info form | 1h | P0 |
| Step 2: Room definition form | 2h | P0 |
| Step 3: Element definition form | 2h | P0 |
| GET /api/projects route | 1h | P0 |
| POST /api/projects route | 2h | P0 |
| GET /api/projects/[id] route | 1h | P0 |
| PATCH /api/projects/[id] route | 1h | P0 |
| DELETE /api/projects/[id] route | 1h | P0 |
| File upload for .glb scan | 2h | P0 |
| File upload for floor plan | 1h | P0 |
| Project settings page | 2h | P1 |

#### Deliverables
- [ ] Multi-step project creation wizard
- [ ] Complete project CRUD API
- [ ] File upload working
- [ ] Projects appear in dashboard

#### Success Criteria
- Can create a project with rooms and elements
- Project appears in dashboard immediately
- Can upload .glb and floor plan files
- Can delete a project

---

### Phase 4: Babylon.js Integration
**Duration:** Week 4  
**Goal:** 3D viewport with scene management

#### Objectives
1. Set up Babylon.js 8 with imperative mounting
2. Create Configurator class architecture
3. Implement camera, lighting, and environment
4. Load and display base .glb model

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Install Babylon.js dependencies | 30m | P0 |
| Create Configurator.ts class | 3h | P0 |
| Create SceneManager.ts | 2h | P0 |
| Set up ArcRotateCamera | 1h | P0 |
| Configure lighting (ambient + directional) | 1h | P0 |
| Add shadow generator | 1h | P1 |
| Create ground plane with grid | 1h | P0 |
| Create AssetManager.ts | 2h | P0 |
| Implement .glb loader | 2h | P0 |
| Create SelectionManager.ts | 2h | P0 |
| Set up GizmoManager | 1h | P0 |
| Connect React UI to Configurator | 2h | P0 |
| Create /project/[id] page layout | 2h | P0 |

#### Deliverables
- [ ] Babylon.js canvas rendering
- [ ] .glb models load and display
- [ ] Camera controls working (orbit, zoom, pan)
- [ ] Selection with gizmos

#### Success Criteria
- 60fps render performance
- Models load within 5 seconds
- Gizmos appear on click
- No memory leaks on page navigation

---

### Phase 5: Element Tools
**Duration:** Week 5  
**Goal:** Tools for adding walls, doors, windows, furniture

#### Objectives
1. Create tool system architecture
2. Implement WallTool with click-to-draw
3. Implement DoorTool and WindowTool
4. Implement FurnitureTool with catalog

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Create BaseTool.ts abstract class | 1h | P0 |
| Create SelectTool.ts | 1h | P0 |
| Create WallTool.ts | 4h | P0 |
| Wall preview during draw | 1h | P1 |
| Snap to grid functionality | 1h | P1 |
| Create DoorTool.ts | 3h | P0 |
| Door placement on walls | 2h | P0 |
| Create WindowTool.ts | 2h | P0 |
| Create FurnitureTool.ts | 3h | P0 |
| Furniture catalog browser | 2h | P0 |
| Create DeleteTool.ts | 1h | P0 |
| Toolbar UI for tool selection | 2h | P0 |
| Keyboard shortcuts (W, D, F, Del) | 1h | P1 |

#### Deliverables
- [ ] 6 working tools
- [ ] Toolbar with tool switcher
- [ ] Furniture catalog panel
- [ ] Delete functionality

#### Success Criteria
- Can draw a wall by clicking two points
- Doors snap to walls
- Furniture loads from catalog
- Delete removes elements

---

### Phase 6: Phase System
**Duration:** Week 6  
**Goal:** 5-phase construction visualization

#### Objectives
1. Implement phase data model
2. Create PhaseManager for visibility control
3. Build phase UI controls
4. Add phase assignment to elements

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Define 5 phases with colors | 30m | P0 |
| Create PhaseManager.ts | 2h | P0 |
| Phase visibility toggle | 1h | P0 |
| Show "up to phase X" mode | 1h | P0 |
| Phase transition animation | 2h | P1 |
| Phase selector UI (buttons) | 1h | P0 |
| Phase timeline visualization | 2h | P1 |
| Element phase assignment | 1h | P0 |
| Phase color coding in 3D | 1h | P0 |
| Save phase state to database | 1h | P0 |

#### Deliverables
- [ ] 5 phases defined and working
- [ ] Phase toggle in UI
- [ ] Elements colored by phase
- [ ] Phase state persists

#### Success Criteria
- Clicking "Phase 3" hides phases 4-5
- New elements default to selected phase
- Phase colors visible in 3D
- Page reload maintains phase state

---

### Phase 7: PM Dashboard
**Duration:** Week 7  
**Goal:** Real-time cost, schedule, and scope tracking

#### Objectives
1. Build PM data aggregation engine
2. Create cost breakdown display
3. Create schedule visualization
4. Create scope summary

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Cost calculation on element add | 2h | P0 |
| Cost aggregation by category | 2h | P0 |
| CostBreakdown component | 2h | P0 |
| Schedule calculation engine | 2h | P0 |
| ScheduleCard component | 2h | P0 |
| Scope calculation engine | 1h | P0 |
| ScopeCard component | 1h | P0 |
| ResourcesCard component | 1h | P1 |
| RisksCard component | 1h | P1 |
| PM Dashboard layout | 2h | P0 |
| Real-time updates via store | 1h | P0 |
| PM data API routes | 2h | P0 |

#### Deliverables
- [ ] PM Dashboard panel
- [ ] Real-time cost totals
- [ ] Schedule by phase
- [ ] Scope summary

#### Success Criteria
- Adding a wall updates cost immediately
- Schedule updates with labor hours
- Costs match manual calculation
- Dashboard shows all metrics

---

### Phase 8: AI Commands + Export
**Duration:** Week 8  
**Goal:** Voice/text commands and document export

#### Objectives
1. Set up Python backend with LangGraph
2. Integrate LiveKit for voice
3. Build AI chat interface
4. Implement document export

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Create Python backend project | 1h | P0 |
| Install LangGraph, FastAPI | 30m | P0 |
| Create CommandOrchestrator | 3h | P0 |
| Create CommandParser | 2h | P0 |
| Set up LiveKit Cloud account | 30m | P0 |
| LiveKit token API route | 1h | P0 |
| LiveKit agent integration | 3h | P0 |
| AI Chat component | 2h | P0 |
| Voice button with indicator | 1h | P0 |
| PDF export (floor plan) | 2h | P0 |
| PDF export (cost summary) | 2h | P0 |
| PDF export (scope of work) | 2h | P0 |
| Export download UI | 1h | P0 |

#### Deliverables
- [ ] Working text commands
- [ ] Working voice commands
- [ ] 3 PDF exports
- [ ] AI chat panel

#### Success Criteria
- "Add a 10 foot wall" creates wall
- "What's the total cost?" returns number
- PDF downloads successfully
- Voice transcription accurate

---

## TIER 2: Enhanced (Weeks 9-12)

### Phase 9: Environment System
**Duration:** Week 9  
**Goal:** Time of day, weather, HDRI, Cesium

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Create EnvironmentManager.ts | 2h | P0 |
| Time of day slider | 2h | P0 |
| Sun position calculation | 1h | P0 |
| HDRI skybox loader | 2h | P0 |
| HDRI selection UI | 1h | P0 |
| Weather: Clear | 1h | P1 |
| Weather: Rain particles | 3h | P1 |
| Weather: Snow particles | 2h | P1 |
| Weather: Fog | 1h | P1 |
| Cesium Ion integration | 4h | P1 |
| Google 3D Tiles loading | 2h | P1 |
| Site context view | 2h | P1 |

#### Deliverables
- [ ] Time of day control
- [ ] 4 HDRI options
- [ ] 4 weather options
- [ ] Cesium site context

---

### Phase 10: Client Viewer
**Duration:** Week 10  
**Goal:** Read-only view with comments and options

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Create /view/[token] route | 1h | P0 |
| Share link generation | 1h | P0 |
| Read-only Configurator mode | 2h | P0 |
| Phase toggle in viewer | 1h | P0 |
| Comment system (Tier 2) | 4h | P1 |
| 3D comment markers | 2h | P1 |
| Comment panel UI | 2h | P1 |
| Finish options selection | 3h | P1 |
| Option comparison view | 2h | P1 |
| Approve/reject buttons | 1h | P1 |
| Email notification on publish | 2h | P1 |

#### Deliverables
- [ ] Shareable view link
- [ ] Comment system
- [ ] Finish options
- [ ] Email notifications

---

### Phase 11: Advanced Visualization
**Duration:** Week 11  
**Goal:** VR, first-person, animations

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| WebXR setup | 2h | P1 |
| VR camera rig | 2h | P1 |
| VR controller input | 2h | P1 |
| First-person camera mode | 2h | P1 |
| WASD movement controls | 1h | P1 |
| Phase transition animations | 3h | P1 |
| Element fade in/out | 2h | P1 |
| Camera path animation | 2h | P2 |
| Screenshot/recording | 2h | P2 |

#### Deliverables
- [ ] VR mode working
- [ ] First-person walkthrough
- [ ] Smooth phase transitions

---

### Phase 12: AI Enhancements
**Duration:** Week 12  
**Goal:** Smarter suggestions and risk detection

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Furniture placement suggestions | 4h | P1 |
| Room type → furniture mapping | 2h | P1 |
| Risk pattern database | 2h | P1 |
| Risk detection agent | 3h | P1 |
| Risk alert UI | 1h | P1 |
| What-if scenario tool | 3h | P1 |
| Material comparison | 2h | P1 |
| Design style presets | 2h | P2 |

#### Deliverables
- [ ] AI furniture suggestions
- [ ] Automatic risk detection
- [ ] What-if scenarios

---

## TIER 3: Enterprise (Weeks 13-16+)

### Phase 13: Multi-tenant
**Duration:** Week 13  
**Goal:** Organizations and permissions

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Organization data model | 1h | P2 |
| Org management UI | 3h | P2 |
| Invite team members | 2h | P2 |
| Role-based permissions | 3h | P2 |
| Org-specific asset libraries | 3h | P2 |
| Org billing (Stripe) | 4h | P2 |
| Usage tracking | 2h | P2 |

#### Deliverables
- [ ] Organization workspaces
- [ ] Team management
- [ ] Role permissions

---

### Phase 14: Integrations
**Duration:** Week 14  
**Goal:** External service connections

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Supplier pricing API research | 2h | P2 |
| Home Depot API integration | 4h | P2 |
| Real-time pricing updates | 2h | P2 |
| Permit document templates | 3h | P2 |
| Permit generation | 3h | P2 |
| Subcontractor database | 2h | P2 |
| Scheduling integration | 3h | P2 |

#### Deliverables
- [ ] Supplier pricing
- [ ] Permit documents
- [ ] Subcontractor scheduling

---

### Phase 15: Analytics & Learning
**Duration:** Week 15  
**Goal:** Project analytics and AI learning

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Analytics dashboard | 4h | P2 |
| Cost accuracy tracking | 3h | P2 |
| Project comparison | 2h | P2 |
| AI learning from past projects | 4h | P2 |
| Market-specific recommendations | 3h | P2 |
| Performance optimization | 2h | P2 |

#### Deliverables
- [ ] Analytics dashboard
- [ ] Cost accuracy metrics
- [ ] AI improvements

---

### Phase 16: Polish & Launch
**Duration:** Week 16  
**Goal:** Production readiness

#### Tasks

| Task | Time | Priority |
|------|------|----------|
| Performance audit | 2h | P0 |
| Security audit | 2h | P0 |
| Accessibility audit | 2h | P1 |
| Mobile responsiveness | 3h | P0 |
| Error handling | 2h | P0 |
| Loading states | 2h | P0 |
| Documentation | 4h | P1 |
| Beta testing | 4h | P0 |
| Bug fixes | 4h | P0 |
| Production deployment | 2h | P0 |

#### Deliverables
- [ ] Production-ready app
- [ ] Documentation
- [ ] Deployed to production

---

## Timeline Summary

```
TIER 1 - MVP (8 weeks)
├── Phase 1: Foundation          Week 1
├── Phase 2: Core UI             Week 2
├── Phase 3: Project CRUD        Week 3
├── Phase 4: Babylon.js          Week 4
├── Phase 5: Element Tools       Week 5
├── Phase 6: Phase System        Week 6
├── Phase 7: PM Dashboard        Week 7
└── Phase 8: AI + Export         Week 8

TIER 2 - Enhanced (4 weeks)
├── Phase 9: Environment         Week 9
├── Phase 10: Client Viewer      Week 10
├── Phase 11: Advanced Viz       Week 11
└── Phase 12: AI Enhancements    Week 12

TIER 3 - Enterprise (4+ weeks)
├── Phase 13: Multi-tenant       Week 13
├── Phase 14: Integrations       Week 14
├── Phase 15: Analytics          Week 15
└── Phase 16: Polish & Launch    Week 16
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Babylon.js performance | Profile early, use LOD, optimize models |
| LiveKit integration complexity | Start with text commands, add voice later |
| Scope creep | Strict phase deliverables, no additions mid-phase |
| Database performance | Index properly, use connection pooling |
| AI accuracy | Extensive prompt testing, fallback responses |

---

## Success Metrics

### Tier 1 (MVP)
- [ ] Create project in < 5 minutes
- [ ] Add 10 elements in < 2 minutes
- [ ] Cost accuracy within 15%
- [ ] 60fps 3D performance
- [ ] Voice command accuracy > 90%

### Tier 2 (Enhanced)
- [ ] Client views project without account
- [ ] Comments appear in real-time
- [ ] VR mode works on Quest 2
- [ ] Weather renders at 30fps

### Tier 3 (Enterprise)
- [ ] 100 users per organization
- [ ] Cost accuracy within 5%
- [ ] Permit documents accepted by city
