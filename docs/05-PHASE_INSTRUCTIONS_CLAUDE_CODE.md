# ProgramIQ v4 - Phase Instructions for Claude Code

**Version:** 1.0  
**Date:** December 8, 2025  
**Purpose:** Step-by-step instructions for each development phase

---

## How to Use This Document

Each phase section below contains:
1. **Context** - What to read before starting
2. **Prerequisites** - What must be complete
3. **Tasks** - Ordered list of work items
4. **Commands** - Exact terminal commands
5. **Files** - Files to create/modify
6. **Validation** - How to verify completion

Copy the relevant phase section to your Claude Code session.

---

## PHASE 1: Foundation

### Context
Read these files first:
- `01-TECHNICAL_SPECIFICATION.md` - Architecture overview
- `02-BACKEND_DESIGN.md` - Database schema section

### Prerequisites
- Node.js 20+ installed
- pnpm installed globally
- Supabase account created
- Clerk account created
- Cloudflare account with R2 enabled

### Tasks

#### 1.1 Initialize Next.js Project
```bash
pnpm create next-app@latest programiq-v4 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd programiq-v4
```

#### 1.2 Install Core Dependencies
```bash
# Authentication
pnpm add @clerk/nextjs

# Database
pnpm add @supabase/supabase-js @supabase/ssr

# Storage
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# UI Components
pnpm add @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-slider @radix-ui/react-toast @radix-ui/react-tooltip

# State Management
pnpm add zustand

# Utilities
pnpm add clsx tailwind-merge class-variance-authority lucide-react zod

# Dev dependencies
pnpm add -D @types/node
```

#### 1.3 Configure Environment Variables
Create `.env.local`:
```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
```

#### 1.4 Create Clerk Middleware
Create `src/middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/view/(.*)',
  '/api/webhooks/(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### 1.5 Create Supabase Client
Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

#### 1.6 Run Database Migrations
In Supabase SQL Editor, run the schema from `02-BACKEND_DESIGN.md` Section 4.1.

#### 1.7 Seed Cost Database
In Supabase SQL Editor, run the seed data from `02-BACKEND_DESIGN.md` Section 4.2.

#### 1.8 Create Zustand Stores
Create `src/stores/project.ts`, `src/stores/scene.ts`, `src/stores/pm.ts` as shown in `02-FRONTEND_DESIGN.md` Section 6.

### Validation
```bash
pnpm build
pnpm dev
# Visit http://localhost:3000 - should see Next.js page
# Visit http://localhost:3000/dashboard - should redirect to sign-in
```

---

## PHASE 2: Core UI Components

### Context
Read: `02-FRONTEND_DESIGN.md` - Component Library section

### Prerequisites
- Phase 1 complete
- Tailwind configured

### Tasks

#### 2.1 Create Utility Function
Create `src/lib/utils/cn.ts`:
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### 2.2 Create Base UI Components
Create these files in `src/components/ui/`:

- `button.tsx` - With variants: default, destructive, outline, secondary, ghost, link
- `input.tsx` - Text input with label support
- `textarea.tsx` - Multi-line input
- `select.tsx` - Dropdown using Radix
- `dialog.tsx` - Modal dialog using Radix
- `accordion.tsx` - Collapsible sections
- `tabs.tsx` - Tab navigation
- `slider.tsx` - Range slider
- `card.tsx` - Content container
- `badge.tsx` - Status indicators

#### 2.3 Create Layout Components
Create `src/components/layout/`:
- `header.tsx` - Top navigation with user menu
- `sidebar.tsx` - Side navigation (if needed)
- `app-shell.tsx` - Main app layout wrapper

#### 2.4 Create Landing Page
Update `src/app/page.tsx`:
```typescript
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">ProgramIQ</h1>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </SignedIn>
      </header>
      
      <main className="container mx-auto py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Pre-Construction Intelligence
        </h2>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Transform your construction projects with AI-powered 3D visualization,
          real-time cost tracking, and intelligent scheduling.
        </p>
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="lg">Get Started</Button>
          </SignInButton>
        </SignedOut>
      </main>
    </div>
  );
}
```

#### 2.5 Create Dashboard Page
Create `src/app/(app)/dashboard/page.tsx`:
```typescript
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { ProjectCard } from '@/components/project/project-card';
import { NewProjectCard } from '@/components/project/new-project-card';

export default async function DashboardPage() {
  const { userId } = await auth();
  const supabase = createClient();
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NewProjectCard />
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

### Validation
- All components render without console errors
- Landing page displays correctly
- Dashboard shows empty state or projects
- Responsive at all breakpoints

---

## PHASE 3: Project CRUD

### Context
Read: `02-BACKEND_DESIGN.md` - API Routes section

### Prerequisites
- Phase 2 complete
- Database tables exist

### Tasks

#### 3.1 Create Project API Routes
Create `src/app/api/projects/route.ts` for GET (list) and POST (create).
Create `src/app/api/projects/[id]/route.ts` for GET, PATCH, DELETE.

#### 3.2 Create New Project Wizard
Create `src/app/(app)/project/new/page.tsx` with 3 steps:
1. Project info (name, type, address)
2. Room definitions (name, dimensions)
3. Element definitions (walls, doors, windows)

#### 3.3 Create File Upload
Create `src/app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSignedUploadUrl } from '@/lib/r2/client';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { filename, contentType, projectId } = await request.json();
  
  const key = `${userId}/${projectId}/${filename}`;
  const uploadUrl = await getSignedUploadUrl('programiq-projects', key, contentType);
  
  return NextResponse.json({ uploadUrl, key });
}
```

### Validation
- Can create a new project
- Project appears in dashboard
- Can upload .glb and .png files
- Can delete a project

---

## PHASE 4: Babylon.js Integration

### Context
Read: `02-FRONTEND_DESIGN.md` - Babylon.js Integration section

### Prerequisites
- Phase 3 complete
- Sample .glb file available

### Tasks

#### 4.1 Install Babylon.js
```bash
pnpm add @babylonjs/core @babylonjs/loaders @babylonjs/gui @babylonjs/materials
```

#### 4.2 Create Configurator Class
Create `src/lib/babylon/Configurator.ts` with:
- Engine and scene setup
- ArcRotateCamera configuration
- Lighting setup (ambient + directional)
- Ground plane with grid
- .glb loader
- GizmoManager setup

#### 4.3 Create Manager Classes
Create in `src/lib/babylon/managers/`:
- `SceneManager.ts` - Element tracking, phase management
- `AssetManager.ts` - Model loading and caching
- `SelectionManager.ts` - Pick and highlight
- `PhaseManager.ts` - Phase visibility

#### 4.4 Create Project Page
Create `src/app/(app)/project/[id]/page.tsx`:
```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Configurator } from '@/lib/babylon/Configurator';
import { useProjectStore } from '@/stores/project';

export default function ProjectPage() {
  const { id } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configuratorRef = useRef<Configurator | null>(null);
  const { project, loadProject } = useProjectStore();

  useEffect(() => {
    if (id) loadProject(id as string);
  }, [id, loadProject]);

  useEffect(() => {
    if (canvasRef.current && project && !configuratorRef.current) {
      configuratorRef.current = new Configurator(canvasRef.current, {
        projectId: project.id,
        baseModelUrl: project.baseModelUrl,
      });
    }
    return () => {
      configuratorRef.current?.dispose();
      configuratorRef.current = null;
    };
  }, [project]);

  return (
    <div className="h-screen flex">
      <aside className="w-64 border-r p-4">
        {/* Elements panel */}
      </aside>
      <main className="flex-1">
        <canvas ref={canvasRef} className="w-full h-full" />
      </main>
      <aside className="w-80 border-l p-4">
        {/* PM Dashboard */}
      </aside>
    </div>
  );
}
```

### Validation
- Canvas renders with ground plane
- .glb model loads and displays
- Camera orbit/zoom works
- Gizmos appear on selection

---

## PHASE 5: Element Tools

### Context
Read: `02-FRONTEND_DESIGN.md` - Wall Tool Example

### Prerequisites
- Phase 4 complete
- Configurator rendering

### Tasks

#### 5.1 Create Tool System
Create `src/lib/babylon/tools/BaseTool.ts`:
```typescript
import type { Configurator } from '../Configurator';
import type { Scene, ArcRotateCamera } from '@babylonjs/core';

export abstract class BaseTool {
  protected configurator: Configurator;
  protected scene: Scene;
  protected camera: ArcRotateCamera;
  protected isActive = false;

  constructor(configurator: Configurator) {
    this.configurator = configurator;
    this.scene = configurator.getScene();
    this.camera = configurator.getCamera();
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  abstract onPointerDown(evt: any, pickResult: any): void;
  abstract onPointerMove(evt: any): void;
  abstract onPointerUp(evt: any): void;
}
```

#### 5.2 Create Individual Tools
Create in `src/lib/babylon/tools/`:
- `SelectTool.ts` - Click to select, show gizmo
- `WallTool.ts` - Click two points to draw wall
- `DoorTool.ts` - Click wall to add door
- `WindowTool.ts` - Click wall to add window
- `FurnitureTool.ts` - Place from catalog
- `DeleteTool.ts` - Click to delete

#### 5.3 Create Toolbar UI
Create `src/components/configurator/toolbar.tsx`:
```typescript
'use client';

import { Button } from '@/components/ui/button';
import { MousePointer, Square, DoorOpen, Grid, Sofa, Trash2 } from 'lucide-react';

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
}

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'wall', icon: Square, label: 'Wall' },
    { id: 'door', icon: DoorOpen, label: 'Door' },
    { id: 'window', icon: Grid, label: 'Window' },
    { id: 'furniture', icon: Sofa, label: 'Furniture' },
    { id: 'delete', icon: Trash2, label: 'Delete' },
  ];

  return (
    <div className="flex gap-1 p-2 bg-background border rounded-lg">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={activeTool === tool.id ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
```

### Validation
- Tools switch correctly
- Wall draws between two clicks
- Door places on wall
- Furniture loads from catalog
- Delete removes elements

---

## PHASE 6: Phase System

### Context
Read: `01-TECHNICAL_SPECIFICATION.md` - Phase definitions

### Prerequisites
- Phase 5 complete
- Elements can be created

### Tasks

#### 6.1 Create PhaseManager
Create `src/lib/babylon/managers/PhaseManager.ts`:
```typescript
import * as BABYLON from '@babylonjs/core';

export interface Phase {
  id: number;
  name: string;
  color: string;
  visible: boolean;
}

export const DEFAULT_PHASES: Phase[] = [
  { id: 1, name: 'As-Built', color: '#808080', visible: true },
  { id: 2, name: 'Demolition', color: '#FF4444', visible: true },
  { id: 3, name: 'Rough-In', color: '#FFA500', visible: true },
  { id: 4, name: 'Finishes', color: '#4444FF', visible: false },
  { id: 5, name: 'Final', color: '#44FF44', visible: false },
];

export class PhaseManager {
  private scene: BABYLON.Scene;
  private phases: Phase[] = DEFAULT_PHASES;
  private activePhaseId = 3;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  setActivePhase(phaseId: number): void {
    this.activePhaseId = phaseId;
    this.updateVisibility();
  }

  showUpToPhase(phaseId: number): void {
    this.phases.forEach((phase) => {
      phase.visible = phase.id <= phaseId;
    });
    this.updateVisibility();
  }

  private updateVisibility(): void {
    this.scene.meshes.forEach((mesh) => {
      const elementPhase = mesh.metadata?.phaseId;
      if (elementPhase) {
        const phase = this.phases.find((p) => p.id === elementPhase);
        mesh.isVisible = phase?.visible ?? true;
      }
    });
  }
}
```

#### 6.2 Create Phase UI
Create `src/components/configurator/phases-panel.tsx`:
```typescript
'use client';

import { useSceneStore } from '@/stores/scene';
import { Button } from '@/components/ui/button';

export function PhasesPanel() {
  const { phases, activePhaseId, setActivePhase, togglePhaseVisibility } = useSceneStore();

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Phases</h3>
      <div className="flex gap-1">
        {phases.map((phase) => (
          <Button
            key={phase.id}
            variant={activePhaseId === phase.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePhase(phase.id)}
            style={{ borderColor: phase.color }}
          >
            {phase.id}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

### Validation
- Phase buttons work
- Elements hide/show by phase
- New elements use active phase
- Phase state persists

---

## PHASE 7: PM Dashboard

### Context
Read: `02-BACKEND_DESIGN.md` - Cost Calculation Engine

### Prerequisites
- Phase 6 complete
- Elements have costs

### Tasks

#### 7.1 Create Cost Calculator
Create `src/lib/costs/calculator.ts` with functions to calculate costs for walls, doors, windows, and furniture based on the cost database.

#### 7.2 Create PM Components
Create in `src/components/configurator/`:
- `pm-dashboard.tsx` - Main container
- `cost-card.tsx` - Cost breakdown
- `schedule-card.tsx` - Timeline by phase
- `scope-card.tsx` - Area and quantities
- `risks-card.tsx` - Risk list

#### 7.3 Wire Up Real-time Updates
In Configurator class, call PM recalculation on every element change:
```typescript
private recalculatePM(): void {
  const elements = this.sceneManager.getAllElements();
  const pmData = calculatePMData(elements);
  this.callbacks.onPMDataChanged?.(pmData);
}
```

### Validation
- Adding wall updates cost
- Schedule shows weeks by phase
- Scope shows area and counts
- All numbers accurate

---

## PHASE 8: AI Commands + Export

### Context
Read: `02-BACKEND_DESIGN.md` - AI Agent Layer

### Prerequisites
- Phase 7 complete
- LiveKit account created

### Tasks

#### 8.1 Create Python Backend
```bash
mkdir backend && cd backend
uv init
uv add fastapi uvicorn langchain langchain-anthropic langgraph livekit-agents livekit-plugins-deepgram livekit-plugins-openai
```

Create `backend/main.py` with FastAPI + LangGraph orchestrator.

#### 8.2 Create AI Chat Component
Create `src/components/ai/ai-chat.tsx` with:
- Message list
- Text input
- Voice button
- Processing indicator

#### 8.3 Create Export Functions
Create `src/lib/export/`:
- `pdf-floorplan.ts` - Generate floor plan PDF
- `pdf-costs.ts` - Generate cost summary PDF
- `pdf-sow.ts` - Generate scope of work PDF

### Validation
- Text commands work: "Add a 10 foot wall"
- Voice commands work (requires LiveKit)
- PDFs download successfully

---

## Post-Phase Checklist

After each phase, verify:
- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] No console errors in browser
- [ ] All deliverables complete
- [ ] Committed to git with descriptive message

---

## Troubleshooting

### Babylon.js Canvas Not Rendering
- Check canvas has explicit width/height or flex-1
- Verify engine.runRenderLoop is called
- Check browser console for WebGL errors

### Clerk Auth Not Working
- Verify environment variables set correctly
- Check middleware matcher patterns
- Ensure ClerkProvider wraps app

### Supabase Queries Failing
- Check RLS policies
- Verify service role key for admin operations
- Check table names match exactly

### R2 Upload Failing
- Verify CORS settings on bucket
- Check signed URL expiration
- Verify content-type matches
