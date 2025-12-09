# CLAUDE.md

**Repository:** ProgramIQ v4  
**Framework:** Next.js 16 + Babylon.js 8  
**Package Manager:** pnpm (frontend), uv (Python backend)

---

## Project Overview

ProgramIQ v4 is a 3D configurator platform for construction project management. It combines LiDAR scan visualization with AI-assisted design modifications, real-time cost tracking, and document generation.

**Key Principle:** AI amplifies human expertise - users provide room definitions and structural knowledge, AI handles calculations, documentation, and 3D updates.

---

## Essential Context (For New Chats)

### What ProgramIQ Does

- **Service Business:** LiDAR scanning for construction (Polycam/Realsee)
- **SaaS Platform:** 3D configurator where users overlay modifications onto scans
- **Target Users:** General Contractors, Architects, Designers in Bay Area
- **Client Output:** Interactive 3D visualization + cost/schedule documents

### Critical Architecture Decisions (Already Made)

1. **Babylon.js 8 vanilla** - NOT react-babylonjs (performance reasons)
2. **Imperative mounting** - React mounts Babylon via useEffect, communicates via callbacks
3. **LangGraph + LiveKit** - Python backend for AI voice/text commands
4. **5-Phase System:** As-Built → Demo → Rough-In → Finishes → Final
5. **AI limitations acknowledged:** AI cannot detect walls from .glb, users must define rooms/walls

### Tool Separation

| Tool                       | User             | Purpose                                           |
| -------------------------- | ---------------- | ------------------------------------------------- |
| **Babylon Editor**         | Admin (internal) | Prepare assets, scene templates, material library |
| **ProgramIQ Configurator** | Customers        | Configure projects with voice/click               |
| **Client Viewer**          | Homeowners       | View-only, comment, approve                       |

### Tech Stack

- **Frontend:** Next.js 16, Babylon.js 8, Zustand, Radix UI, Tailwind v4
- **Backend:** Next.js API Routes + Python (FastAPI, LangGraph, LiveKit)
- **Database:** Supabase (PostgreSQL + Realtime)
- **Storage:** Cloudflare R2
- **Auth:** Clerk

### Documentation Map

- `01-TECHNICAL_SPECIFICATION.md` - Architecture, data models, APIs
- `02-FRONTEND_DESIGN.md` - React + Babylon.js integration patterns
- `02-BACKEND_DESIGN.md` - API routes, LangGraph agents, database schema (NOTE: duplicate numbering, this is the backend doc)
- `03-IMPLEMENTATION_PLAN.md` - 16-week phased build plan
- `04-PHASE_INSTRUCTIONS_CLAUDE_CODE.md` - Copy-paste instructions per phase
- `06-ASSET_PIPELINE.md` - Babylon Editor workflow for asset prep

### What's NOT Built Yet

This is a greenfield project. Documentation is complete, implementation has not started.

---

## Rules

### General

1. **NEVER** create files, install packages, or commit without explicit approval
2. **ALWAYS** ask before modifying `globals.css`, `tailwind.config.ts`, or `next.config.ts`
3. **ALWAYS** use TypeScript strict mode
4. **ALWAYS** include proper error handling and loading states

### Frontend

1. Use `pnpm` for all package operations
2. Use App Router patterns (not Pages Router)
3. Prefer server components; use `'use client'` only when necessary
4. Use Zustand for client state (not Redux, not Context for global state)
5. Use Radix UI + Tailwind for components (not shadcn/ui CLI)

### Babylon.js

1. Use vanilla Babylon.js (NOT react-babylonjs)
2. Mount imperatively via useEffect with cleanup
3. Keep all 3D code in `src/lib/babylon/`
4. Communicate with React via callbacks, not stores directly

### Python Backend

1. Use `uv` for package management
2. Use FastAPI for HTTP endpoints
3. Use LangGraph for AI orchestration
4. Use async/await consistently

### Git

1. Create feature branch for each phase: `phase-1`, `phase-2`, etc.
2. Commit often with descriptive messages
3. Merge to main only when phase is complete
4. Never force push to main

---

## Workflow Per Session

### Starting a New Phase

```
1. User says: "Start Phase X"
2. Claude reads:
   - This CLAUDE.md file
   - 03-IMPLEMENTATION_PLAN.md (relevant phase section)
   - 04-PHASE_INSTRUCTIONS_CLAUDE_CODE.md (relevant phase section)
3. Claude asks: "Which task should we start with?"
4. User approves specific task
5. Claude implements with explicit file creation requests
```

### During Development

```
1. Ask before creating any file
2. Show file content before creation
3. After creation, provide verification steps
4. Ask: "Should I continue to the next task?"
```

### Ending a Session

```
1. Summarize what was completed
2. List any pending tasks
3. Ask: "Should I commit these changes?"
4. If yes, provide commit message for approval
```

---

## Commands Reference

### Frontend (Next.js)

-never run 'pnpm dev'. User will do it manually.

```bash
# Development
pnpm dev                 # Start dev server at localhost:3000
pnpm build              # Production build
pnpm start              # Start production server
pnpm lint               # Run ESLint
pnpm tsc --noEmit       # Type check without emit

# Package Management
pnpm add <package>      # Add dependency
pnpm add -D <package>   # Add dev dependency
pnpm remove <package>   # Remove dependency
```

### Backend (Python)

```bash
# Navigate to backend
cd backend

# Package Management
uv add <package>        # Add dependency
uv remove <package>     # Remove dependency
uv sync                 # Install all dependencies

# Development
uv run uvicorn main:app --reload    # Start FastAPI server
uv run python main.py               # Run LiveKit agent

# Environment
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

### Git

```bash
git checkout -b phase-X     # Create phase branch
git add .                   # Stage all changes
git commit -m "feat: ..."   # Commit with message
git checkout main           # Switch to main
git merge phase-X           # Merge phase branch
git push origin main        # Push to remote
```

### Database (Supabase)

```bash
# Migrations are run in Supabase Dashboard SQL Editor
# No local CLI required for this project
```

---

## File Naming Conventions

### Frontend

```
src/
├── app/
│   ├── (auth)/           # Route groups with parentheses
│   ├── api/              # API routes
│   └── page.tsx          # Page components
├── components/
│   ├── ui/               # Base components (lowercase)
│   │   └── button.tsx
│   └── project/          # Feature components (lowercase)
│       └── project-card.tsx
├── lib/
│   └── babylon/          # 3D code
│       └── Configurator.ts   # Classes use PascalCase
├── stores/               # Zustand stores
│   └── project.ts        # lowercase
├── hooks/                # Custom hooks
│   └── use-project.ts    # use- prefix
└── types/                # TypeScript types
    └── project.ts        # lowercase
```

### Backend

```
backend/
├── main.py               # Entry point
├── agents/
│   └── orchestrator.py   # snake_case
├── services/
│   └── cost_calculator.py
├── models/
│   └── commands.py
└── config/
    └── settings.py
```

---

## Component Patterns

### Server Component (Default)

```typescript
// app/(app)/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  const supabase = createClient();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId);

  return <div>{/* render data */}</div>;
}
```

### Client Component

```typescript
// components/configurator/toolbar.tsx
"use client";

import { useState } from "react";

export function Toolbar() {
  const [activeTool, setActiveTool] = useState("select");
  return <div>{/* interactive UI */}</div>;
}
```

### Zustand Store

```typescript
// stores/project.ts
import { create } from "zustand";

interface ProjectState {
  project: Project | null;
  setProject: (project: Project) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  setProject: (project) => set({ project }),
}));
```

### API Route

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... fetch data
  return NextResponse.json({ data });
}
```

### Babylon.js Imperative Mount

```typescript
// app/(app)/project/[id]/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { Configurator } from "@/lib/babylon/Configurator";

export default function ProjectPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configuratorRef = useRef<Configurator | null>(null);

  useEffect(() => {
    if (canvasRef.current && !configuratorRef.current) {
      configuratorRef.current = new Configurator(canvasRef.current, {
        // options
      });
    }
    return () => {
      configuratorRef.current?.dispose();
      configuratorRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
```

---

## Environment Variables

### Required for Development

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

### Required for AI Features

```env
# LiveKit
LIVEKIT_API_KEY=API...
LIVEKIT_API_SECRET=...
NEXT_PUBLIC_LIVEKIT_URL=wss://xxx.livekit.cloud

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

### Optional (Tier 2+)

```env
# Cesium
NEXT_PUBLIC_CESIUM_ION_TOKEN=eyJ...
```

---

## Testing Checklist

### Before Each Commit

- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Feature works as expected

### Before Phase Completion

- [ ] All deliverables complete
- [ ] Edge cases handled
- [ ] Error states implemented
- [ ] Loading states implemented
- [ ] Mobile responsive (if applicable)

---

## Common Issues & Solutions

### "Module not found" after install

```bash
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Clerk middleware not working

- Check `matcher` pattern in middleware.ts
- Ensure ClerkProvider wraps root layout

### Supabase RLS blocking queries

- Check policy exists for the operation
- Verify user_id matches auth.uid()

### Babylon.js canvas black

- Verify engine.runRenderLoop() is called
- Check canvas has dimensions (not 0x0)
- Look for WebGL errors in console

### R2 upload CORS error

- Add CORS policy to R2 bucket
- Verify signed URL hasn't expired

---

## Documentation References

- **Architecture:** `01-TECHNICAL_SPECIFICATION.md`
- **Frontend Details:** `02-FRONTEND_DESIGN.md`
- **Backend Details:** `03-BACKEND_DESIGN.md`
- **Implementation Plan:** `04-IMPLEMENTATION_PLAN.md`
- **Phase Instructions:** `05-PHASE_INSTRUCTIONS_CLAUDE_CODE.md`

---

## Quick Reference

### Creating a New Component

```
1. Ask: "Can I create src/components/[category]/[name].tsx?"
2. Show component code
3. After approval, create file
4. Verify: import in parent, renders correctly
```

### Adding a New API Route

```
1. Ask: "Can I create src/app/api/[path]/route.ts?"
2. Show route code with all methods
3. After approval, create file
4. Verify: test with curl or browser
```

### Modifying Database Schema

```
1. Show SQL migration
2. After approval, run in Supabase Dashboard
3. Update TypeScript types if needed
4. Verify: query works from app
```

---

## Phase Status Tracking

Update this section as phases complete:

- [ ] Phase 1: Foundation
- [ ] Phase 2: Core UI
- [ ] Phase 3: Project CRUD
- [ ] Phase 4: Babylon.js
- [ ] Phase 5: Element Tools
- [ ] Phase 6: Phase System
- [ ] Phase 7: PM Dashboard
- [ ] Phase 8: AI + Export
- [ ] Phase 9: Environment (Tier 2)
- [ ] Phase 10: Client Viewer (Tier 2)
- [ ] Phase 11: Advanced Viz (Tier 2)
- [ ] Phase 12: AI Enhancements (Tier 2)
- [ ] Phase 13: Multi-tenant (Tier 3)
- [ ] Phase 14: Integrations (Tier 3)
- [ ] Phase 15: Analytics (Tier 3)
- [ ] Phase 16: Polish & Launch (Tier 3)
