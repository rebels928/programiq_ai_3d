# ProgramIQ v4 - Technical Specification

**Version:** 1.0  
**Date:** December 8, 2025  
**Product:** Pre-Construction Intelligence Platform - 3D Configurator

---

## Executive Summary

ProgramIQ v4 is a SaaS platform that combines 3D LiDAR scanning services with an AI-assisted configurator for construction project management. The platform enables users to import processed scans, overlay modifications (walls, doors, windows, furniture), visualize construction phases, and generate real-time cost/schedule estimates.

**Key Differentiator:** AI handles tedious work (calculations, documentation, 3D updates) while humans provide expertise (room definitions, structural knowledge, design decisions). Result: 10x faster workflow than traditional methods.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tier Definitions](#2-tier-definitions)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Data Models](#5-data-models)
6. [API Specifications](#6-api-specifications)
7. [Integration Points](#7-integration-points)
8. [Security Requirements](#8-security-requirements)
9. [Performance Requirements](#9-performance-requirements)

---

## 1. System Overview

### 1.1 Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 16 + Babylon.js 8)                          │
│  • Landing Page, Dashboard, 3D Configurator, Client Viewer     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND SERVICES                                               │
│  ├── Next.js API Routes (Auth, Projects, Assets)               │
│  ├── Python Backend (LangGraph + LiveKit Agent)                │
│  └── Supabase (PostgreSQL + Realtime)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                              │
│  ├── Clerk (Authentication)                                     │
│  ├── Cloudflare R2 (3D Asset Storage)                          │
│  ├── LiveKit Cloud (Voice AI)                                   │
│  └── Cesium Ion (Geospatial - Tier 2+)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend Framework | Next.js | 16.x | App Router, SSR, API Routes |
| 3D Engine | Babylon.js | 8.x | WebGL rendering, gizmos, physics |
| UI Components | Radix UI + Tailwind | 4.x | Accessible components |
| State Management | Zustand | 5.x | Client-side state |
| Authentication | Clerk | Latest | Multi-tenant auth |
| Database | Supabase (PostgreSQL) | Latest | Data persistence |
| File Storage | Cloudflare R2 | N/A | 3D models, exports |
| AI Orchestration | LangGraph | Latest | Agent workflows |
| Voice AI | LiveKit + Deepgram | Latest | STT/TTS pipeline |
| Backend Runtime | Python | 3.11+ | AI agent server |

### 1.3 Supported File Formats

| Format | Import | Export | Notes |
|--------|--------|--------|-------|
| .glb | ✅ | ✅ | Primary 3D format |
| .gltf | ✅ | ✅ | Alternative 3D format |
| .png | ✅ | ✅ | Floor plans, textures |
| .jpg | ✅ | ✅ | Floor plans, textures |
| .pdf | ✅ | ✅ | Floor plans, reports |
| .csv | ❌ | ✅ | Takeoffs, schedules |
| .json | ✅ | ✅ | Scene data, configs |

---

## 2. Tier Definitions

### 2.1 Tier 1: MVP (Minimum Viable Product)

**Timeline:** 8 weeks  
**Goal:** Core configurator with AI command interface

#### Features

| Category | Feature | Priority |
|----------|---------|----------|
| **Import** | Upload .glb scan as base model | P0 |
| **Import** | Upload 2D floor plan image | P0 |
| **Data Entry** | Structured form for rooms | P0 |
| **Data Entry** | Structured form for walls | P0 |
| **Data Entry** | Structured form for doors/windows | P0 |
| **Configurator** | Add/modify/delete walls | P0 |
| **Configurator** | Add/modify/delete doors | P0 |
| **Configurator** | Add/modify/delete windows | P0 |
| **Configurator** | Add furniture from catalog | P0 |
| **Configurator** | Apply materials to surfaces | P0 |
| **Configurator** | Gizmo controls (move/rotate/scale) | P0 |
| **Phases** | Define 5 construction phases | P0 |
| **Phases** | Toggle phase visibility | P0 |
| **Phases** | Assign elements to phases | P0 |
| **Environment** | Time of day slider | P0 |
| **Environment** | HDRI skybox selection | P0 |
| **PM** | Cost lookup from database | P0 |
| **PM** | Real-time cost totals | P0 |
| **PM** | Schedule generation | P0 |
| **AI** | Text command interface | P0 |
| **AI** | Voice command interface (LiveKit) | P0 |
| **Export** | PDF floor plan | P0 |
| **Export** | Cost summary report | P0 |
| **Export** | Scope of work document | P0 |
| **Publish** | Generate client view link | P0 |
| **Client View** | Read-only 3D viewer | P0 |
| **Client View** | Phase toggle controls | P0 |

### 2.2 Tier 2: Enhanced (Version 1.1)

**Timeline:** 4 weeks after Tier 1  
**Goal:** Advanced visualization and client interaction

#### Features

| Category | Feature | Priority |
|----------|---------|----------|
| **AI** | Furniture placement suggestions | P1 |
| **AI** | Risk identification from patterns | P1 |
| **Environment** | Weather simulation (rain, snow, fog) | P1 |
| **Environment** | Cesium integration (site context) | P1 |
| **Environment** | Sun path visualization | P1 |
| **Client View** | Leave comments on elements | P1 |
| **Client View** | Select from finish options | P1 |
| **Client View** | Approve/reject designs | P1 |
| **Visualization** | VR walkthrough (WebXR) | P1 |
| **Visualization** | First-person camera mode | P1 |
| **Visualization** | Animated phase transitions | P1 |
| **Export** | GLTF model export | P1 |
| **Export** | Material takeoff (CSV) | P1 |
| **Notifications** | Email on publish | P1 |
| **Notifications** | Email on client comment | P1 |

### 2.3 Tier 3: Enterprise (Version 2.0+)

**Timeline:** Ongoing after Tier 2  
**Goal:** Platform intelligence and integrations

#### Features

| Category | Feature | Priority |
|----------|---------|----------|
| **AI** | Learn from past projects | P2 |
| **AI** | Market-specific recommendations | P2 |
| **Integrations** | Supplier pricing APIs | P2 |
| **Integrations** | Subcontractor scheduling | P2 |
| **Integrations** | Permit document generation | P2 |
| **Visualization** | AR placement (mobile) | P2 |
| **Visualization** | High-quality renders | P2 |
| **Analytics** | Project analytics dashboard | P2 |
| **Analytics** | Cost accuracy tracking | P2 |
| **Multi-tenant** | Organization workspaces | P2 |
| **Multi-tenant** | Role-based permissions | P2 |
| **Multi-tenant** | Org-specific asset libraries | P2 |

---

## 3. Functional Requirements

### 3.1 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Super Admin** | Platform owner (you) | Full system access, all orgs |
| **Org Admin** | Enterprise customer lead | Manage org users, upload org assets |
| **Creator** | GC, Architect, Designer | Create/edit projects, publish |
| **Viewer** | Homeowner, Client | View shared projects, comment |

### 3.2 Core Workflows

#### 3.2.1 Project Creation Workflow

```
1. User clicks "New Project"
2. Fills project form:
   - Name, type, address
   - Upload .glb scan
   - Upload floor plan image (optional)
3. Defines existing conditions:
   - Rooms (name, dimensions)
   - Walls (location, type, load-bearing status)
   - Doors and windows
4. System creates project in database
5. User enters configurator
```

#### 3.2.2 Configuration Workflow

```
1. Base scan displayed in 3D viewport
2. User can:
   - Voice/text: "Add a 10 foot wall from corner to window"
   - Click: Select tool, click to place
3. AI translates command to structured operation
4. Element added to scene
5. Cost/schedule automatically updated
6. User reviews and adjusts
7. Repeat until satisfied
```

#### 3.2.3 Publishing Workflow

```
1. User reviews final configuration
2. Clicks "Publish"
3. System generates:
   - Unique share URL
   - PDF exports
   - Client notification (Tier 2+)
4. Client accesses view-only interface
5. Client can:
   - Explore 3D model
   - Toggle phases
   - Leave comments (Tier 2+)
   - Select options (Tier 2+)
```

### 3.3 AI Command Specifications

#### 3.3.1 Supported Commands (Tier 1)

```typescript
interface AICommand {
  category: 'walls' | 'doors' | 'windows' | 'furniture' | 'materials' | 'phases' | 'camera' | 'query';
  action: string;
  parameters: Record<string, any>;
}

// Examples:
{ category: 'walls', action: 'add', parameters: { length: 3.048, height: 2.743, from: 'corner', to: 'window' } }
{ category: 'doors', action: 'add', parameters: { wallId: 'wall-1', width: 0.9, type: 'single' } }
{ category: 'query', action: 'cost', parameters: { scope: 'total' } }
{ category: 'phases', action: 'show', parameters: { phaseId: 3 } }
```

#### 3.3.2 Natural Language Mapping

| User Says | AI Interprets |
|-----------|---------------|
| "Add a 10 foot wall" | `{ action: 'add_wall', length: 3.048 }` |
| "Put a door in that wall" | `{ action: 'add_door', wallId: selectedWall }` |
| "What's the total cost?" | `{ action: 'query_cost', scope: 'total' }` |
| "Show me phase 3" | `{ action: 'set_phase', phaseId: 3 }` |
| "Make it sunset" | `{ action: 'set_time', hour: 18.5 }` |

### 3.4 Cost Database Structure

```typescript
interface CostItem {
  id: string;
  category: string;        // 'demo', 'framing', 'electrical', etc.
  item: string;            // 'interior_wall_lf', 'exterior_door', etc.
  unit: string;            // 'LF', 'SF', 'EA', 'HR'
  unitCost: number;        // Cost per unit
  laborHours: number;      // Labor hours per unit
  region: string;          // Geographic region
  updatedAt: Date;
}

// Example entries:
{ category: 'demo', item: 'interior_wall_lf', unit: 'LF', unitCost: 15, laborHours: 0.25, region: 'bay_area' }
{ category: 'framing', item: 'interior_wall_lf', unit: 'LF', unitCost: 45, laborHours: 0.5, region: 'bay_area' }
{ category: 'doors', item: 'interior_single', unit: 'EA', unitCost: 450, laborHours: 2, region: 'bay_area' }
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial page load | < 3 seconds | Time to interactive |
| 3D scene load | < 5 seconds | Time to first render |
| AI command response | < 2 seconds | Voice to action |
| Cost calculation | < 500ms | After element change |
| Frame rate | 60 FPS | During normal interaction |
| Frame rate (complex) | 30 FPS | During phase animation |

### 4.2 Scalability

| Phase | Users | Infrastructure | Cost |
|-------|-------|----------------|------|
| Launch | 0-50 | Vercel Hobby, Supabase Free | ~$50/mo |
| Growth | 50-200 | Vercel Pro, Supabase Pro | ~$200/mo |
| Scale | 200-1000 | Vercel Enterprise, Supabase Team | ~$1,000/mo |

### 4.3 Availability

- **Target uptime:** 99.5%
- **Planned maintenance:** Sunday 2-4 AM PT
- **Backup frequency:** Daily automated backups
- **Recovery time objective:** < 4 hours

### 4.4 Browser Support

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | Latest 2 | Full |
| Firefox | Latest 2 | Full |
| Safari | Latest 2 | Full |
| Edge | Latest 2 | Full |
| Mobile Chrome | Latest | Full |
| Mobile Safari | Latest | Full |

---

## 5. Data Models

### 5.1 Core Entities

```typescript
// Project
interface Project {
  id: string;
  userId: string;
  orgId: string | null;
  name: string;
  projectType: 'kitchen_remodel' | 'bathroom_remodel' | 'adu' | 'ti' | 'addition' | 'other';
  status: 'draft' | 'published' | 'approved' | 'archived';
  location: {
    address: string;
    lat: number;
    lon: number;
  };
  metadata: {
    totalArea: number;
    roomCount: number;
    yearBuilt: number | null;
    constructionType: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Scene
interface Scene {
  projectId: string;
  baseModelUrl: string;
  floorPlanUrl: string | null;
  elements: SceneElement[];
  phases: Phase[];
  environment: EnvironmentSettings;
  cameraPresets: CameraPreset[];
}

// Scene Element
interface SceneElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'furniture' | 'fixture';
  phaseId: number;
  status: 'existing' | 'demo' | 'new';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  properties: ElementProperties;
  materialId: string | null;
  cost: number;
  laborHours: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Room
interface Room {
  id: string;
  projectId: string;
  name: string;
  roomType: string;
  width: number;      // meters
  depth: number;      // meters
  area: number;       // calculated SF
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

// Phase
interface Phase {
  id: number;
  name: string;
  description: string;
  color: string;
  order: number;
  startWeek: number;
  durationWeeks: number;
  visible: boolean;
}

// PM Data
interface PMData {
  projectId: string;
  costBreakdown: CostBreakdown;
  schedule: Schedule;
  resources: Resources;
  risks: Risk[];
  takeoff: TakeoffItem[];
  updatedAt: Date;
}
```

### 5.2 Database Schema (PostgreSQL)

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (synced from Clerk)
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Clerk user ID
  org_id UUID REFERENCES organizations(id),
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'creator', 'viewer')),
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  location JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenes
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  base_model_url TEXT,
  floor_plan_url TEXT,
  environment JSONB DEFAULT '{}',
  camera_presets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scene Elements
CREATE TABLE scene_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  phase_id INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'new',
  position JSONB NOT NULL,
  rotation JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}',
  scale JSONB NOT NULL DEFAULT '{"x":1,"y":1,"z":1}',
  properties JSONB NOT NULL,
  material_id TEXT,
  cost DECIMAL(10,2) DEFAULT 0,
  labor_hours DECIMAL(6,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  width DECIMAL(6,2) NOT NULL,
  depth DECIMAL(6,2) NOT NULL,
  area DECIMAL(8,2) GENERATED ALWAYS AS (width * depth * 10.764) STORED,
  bounds JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PM Data
CREATE TABLE pm_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  cost_breakdown JSONB NOT NULL DEFAULT '{}',
  schedule JSONB NOT NULL DEFAULT '{}',
  resources JSONB NOT NULL DEFAULT '{}',
  risks JSONB NOT NULL DEFAULT '[]',
  takeoff JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Cost Database
CREATE TABLE cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  labor_hours DECIMAL(6,2) NOT NULL,
  region TEXT NOT NULL DEFAULT 'bay_area',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, item, region)
);

-- Project Shares
CREATE TABLE project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  permissions TEXT NOT NULL DEFAULT 'view',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments (Tier 2)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  position JSONB,  -- {x, y, z} in 3D space
  element_id UUID REFERENCES scene_elements(id),
  text TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Catalog
CREATE TABLE asset_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),  -- NULL = global
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  model_url TEXT NOT NULL,
  thumbnail_url TEXT,
  dimensions JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_data ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id = auth.uid() OR org_id IN (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));
```

---

## 6. API Specifications

### 6.1 REST API Endpoints

#### Projects

```
GET    /api/projects                    List user's projects
POST   /api/projects                    Create new project
GET    /api/projects/:id                Get project details
PATCH  /api/projects/:id                Update project
DELETE /api/projects/:id                Delete project
POST   /api/projects/:id/publish        Publish project
GET    /api/projects/:id/share          Get share link
```

#### Scenes

```
GET    /api/projects/:id/scene          Get scene data
PATCH  /api/projects/:id/scene          Update scene
POST   /api/projects/:id/scene/elements Add element
PATCH  /api/projects/:id/scene/elements/:elementId  Update element
DELETE /api/projects/:id/scene/elements/:elementId  Delete element
```

#### Assets

```
GET    /api/assets                      List asset catalog
GET    /api/assets/:category            List assets by category
POST   /api/assets/upload               Upload new asset (Admin)
```

#### AI Commands

```
POST   /api/ai/command                  Execute AI command
POST   /api/ai/query                    Query project data
GET    /api/livekit/token               Get LiveKit connection token
```

#### Exports

```
POST   /api/projects/:id/export/pdf     Generate PDF floor plan
POST   /api/projects/:id/export/gltf    Export 3D model
POST   /api/projects/:id/export/takeoff Export material takeoff
POST   /api/projects/:id/export/sow     Generate scope of work
```

### 6.2 WebSocket Events (Realtime)

```typescript
// Scene updates (Supabase Realtime)
interface SceneUpdateEvent {
  type: 'element_added' | 'element_updated' | 'element_deleted' | 'phase_changed';
  payload: SceneElement | Phase;
  timestamp: Date;
}

// PM updates
interface PMUpdateEvent {
  type: 'cost_updated' | 'schedule_updated' | 'risk_added';
  payload: PMData;
  timestamp: Date;
}

// AI events (LiveKit Data Channel)
interface AIEvent {
  type: 'command_received' | 'command_executed' | 'error';
  command?: AICommand;
  result?: any;
  error?: string;
}
```

---

## 7. Integration Points

### 7.1 Clerk (Authentication)

```typescript
// Webhook events to sync users
const clerkWebhookEvents = [
  'user.created',
  'user.updated',
  'user.deleted',
  'organization.created',
  'organization.updated',
  'organizationMembership.created',
];
```

### 7.2 Cloudflare R2 (Storage)

```typescript
interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  buckets: {
    assets: 'programiq-assets';      // Global assets
    projects: 'programiq-projects';  // User project files
    exports: 'programiq-exports';    // Generated exports
  };
}

// Folder structure
// /assets/furniture/{category}/{item}.glb
// /assets/materials/{category}/{material}.json
// /assets/templates/{template}.babylon
// /projects/{userId}/{projectId}/scene.json
// /projects/{userId}/{projectId}/base-model.glb
// /exports/{projectId}/{timestamp}/{filename}
```

### 7.3 LiveKit (Voice AI)

```typescript
interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
  wsUrl: string;
  sttProvider: 'deepgram';
  ttsProvider: 'openai';
}

// Room naming convention
// project-{projectId}-{userId}
```

### 7.4 Cesium Ion (Tier 2+)

```typescript
interface CesiumConfig {
  accessToken: string;
  assets: {
    googlePhotorealistic: 2275207;  // Google 3D Tiles
    terrain: 1;                      // Cesium World Terrain
  };
}
```

---

## 8. Security Requirements

### 8.1 Authentication

- All API routes require Clerk authentication
- JWT tokens with 1-hour expiry
- Refresh tokens for mobile apps
- MFA optional for org admins

### 8.2 Authorization

- Row-level security on all database tables
- Users can only access their own projects
- Org members can access org projects based on role
- Share tokens for public view access

### 8.3 Data Protection

- All data encrypted at rest (Supabase)
- All traffic over HTTPS
- File uploads scanned for malware
- PII minimization (no unnecessary data collection)

### 8.4 API Security

- Rate limiting: 100 requests/minute per user
- CORS restricted to allowed origins
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

---

## 9. Performance Requirements

### 9.1 3D Scene Performance

| Metric | Target | Max Acceptable |
|--------|--------|----------------|
| Vertices | 500K | 2M |
| Draw calls | 50 | 200 |
| Texture memory | 256MB | 512MB |
| Scene file size | 10MB | 50MB |

### 9.2 Optimization Strategies

- Level of detail (LOD) for furniture models
- Texture compression (KTX2)
- Instanced rendering for repeated elements
- Frustum culling enabled by default
- Progressive loading for large scenes

### 9.3 Caching Strategy

| Asset Type | Cache Duration | Location |
|------------|----------------|----------|
| Static assets | 1 year | CDN |
| 3D models | 7 days | Browser + R2 |
| Scene data | No cache | Real-time |
| Cost database | 1 hour | Memory |
| AI responses | No cache | N/A |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **As-Built** | Existing conditions captured by scan |
| **Phase** | Construction stage (Demo, Rough-In, Finish, etc.) |
| **Element** | Any object in the scene (wall, door, furniture) |
| **PM** | Project Management (cost, schedule, risks) |
| **Takeoff** | Material quantity list |
| **Gizmo** | 3D manipulation handle (move, rotate, scale) |
| **HDRI** | High Dynamic Range Image (lighting) |
| **LF** | Linear Feet |
| **SF** | Square Feet |
| **EA** | Each (unit count) |

---

## Appendix B: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-08 | Tech | Initial specification |
