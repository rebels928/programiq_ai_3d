# ProgramIQ v4 - Frontend Design Document

**Version:** 1.0  
**Date:** December 8, 2025  
**Framework:** Next.js 16 + Babylon.js 8

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Decisions](#2-technology-decisions)
3. [Project Structure](#3-project-structure)
4. [Component Library](#4-component-library)
5. [Babylon.js Integration](#5-babylonjs-integration)
6. [State Management](#6-state-management)
7. [Routing & Pages](#7-routing--pages)
8. [UI/UX Design System](#8-uiux-design-system)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS 16 APPLICATION                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         APP ROUTER                                   │   │
│  │                                                                      │   │
│  │  /                    → Marketing landing page                      │   │
│  │  /sign-in             → Clerk authentication                        │   │
│  │  /sign-up             → Clerk registration                          │   │
│  │  /dashboard           → Project list                                │   │
│  │  /project/new         → New project wizard                          │   │
│  │  /project/[id]        → 3D Configurator (Babylon.js)               │   │
│  │  /view/[token]        → Client viewer (read-only)                   │   │
│  │  /admin               → Admin panel (Super Admin only)              │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         COMPONENT LAYERS                             │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  UI Components (Radix + Tailwind)                           │   │   │
│  │  │  Button, Input, Dialog, Select, Accordion, Tabs, etc.       │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Feature Components                                          │   │   │
│  │  │  ProjectCard, RoomForm, ElementPanel, PMDashboard, etc.     │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Babylon.js Layer (Vanilla TypeScript)                       │   │   │
│  │  │  Configurator class, Tools, Managers - mounted imperatively  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         STATE MANAGEMENT                             │   │
│  │                                                                      │   │
│  │  Zustand Stores:                                                    │   │
│  │  • useProjectStore - Current project data                           │   │
│  │  • useSceneStore - 3D scene state                                   │   │
│  │  • useUIStore - UI state (panels, modals)                          │   │
│  │  • usePMStore - PM data (costs, schedule, risks)                   │   │
│  │  • useAIStore - AI command state                                    │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| 3D Library | Babylon.js (vanilla) | Built-in gizmos, WebXR, better for configurators |
| React Integration | Imperative mount | No react-babylonjs; cleaner separation |
| State | Zustand | Simple, no boilerplate, works with Babylon |
| Styling | Tailwind v4 | Utility-first, good DX |
| Components | Radix UI | Accessible, unstyled primitives |
| Forms | React Hook Form | Performance, validation |
| Icons | Lucide React | Tree-shakeable, consistent |

---

## 2. Technology Decisions

### 2.1 Why Vanilla Babylon.js (NOT react-babylonjs)

```
❌ react-babylonjs issues:
• Adds React reconciler overhead to 60fps render loop
• State changes cause unnecessary re-renders
• Harder to optimize performance
• Version compatibility issues

✅ Vanilla Babylon.js benefits:
• Direct control over render loop
• No React overhead in 3D code
• Easier to follow Babylon.js docs/examples
• Better TypeScript support
• Clear separation: React handles UI, Babylon handles 3D
```

### 2.2 Integration Pattern

```typescript
// React component mounts Babylon.js imperatively
'use client';

import { useEffect, useRef } from 'react';
import { Configurator } from '@/lib/babylon/Configurator';

export default function ProjectPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configuratorRef = useRef<Configurator | null>(null);

  useEffect(() => {
    if (canvasRef.current && !configuratorRef.current) {
      configuratorRef.current = new Configurator(canvasRef.current, {
        onElementChanged: (element) => {
          // Update Zustand store
          useSceneStore.getState().updateElement(element);
        },
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

## 3. Project Structure

```
programiq-v4/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth routes (Clerk)
│   │   ├── sign-in/[[...sign-in]]/
│   │   └── sign-up/[[...sign-up]]/
│   ├── (marketing)/                  # Public pages
│   │   ├── page.tsx                  # Landing page
│   │   └── pricing/page.tsx
│   ├── (app)/                        # Protected app routes
│   │   ├── layout.tsx                # App shell with nav
│   │   ├── dashboard/page.tsx        # Project list
│   │   ├── project/
│   │   │   ├── new/page.tsx          # New project wizard
│   │   │   └── [id]/page.tsx         # 3D Configurator
│   │   └── admin/page.tsx            # Admin panel
│   ├── view/[token]/page.tsx         # Client viewer (public)
│   ├── api/                          # API routes
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
│
├── components/                       # React components
│   ├── ui/                           # Base UI (Radix + Tailwind)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                       # Layout components
│   │   ├── header.tsx
│   │   └── app-shell.tsx
│   ├── project/                      # Project components
│   │   ├── project-card.tsx
│   │   └── project-form.tsx
│   ├── configurator/                 # Configurator UI
│   │   ├── toolbar.tsx
│   │   ├── elements-panel.tsx
│   │   ├── properties-panel.tsx
│   │   └── pm-dashboard.tsx
│   └── ai/                           # AI interface
│       ├── ai-chat.tsx
│       └── voice-button.tsx
│
├── lib/                              # Library code
│   ├── babylon/                      # Babylon.js (vanilla TS)
│   │   ├── Configurator.ts           # Main class
│   │   ├── tools/                    # Interaction tools
│   │   │   ├── SelectTool.ts
│   │   │   ├── WallTool.ts
│   │   │   └── ...
│   │   ├── managers/                 # Subsystem managers
│   │   │   ├── SceneManager.ts
│   │   │   ├── PhaseManager.ts
│   │   │   └── ...
│   │   └── elements/                 # Element creation
│   │       ├── WallElement.ts
│   │       └── ...
│   ├── supabase/                     # Supabase client
│   ├── r2/                           # R2 storage client
│   └── utils/                        # Utilities
│
├── stores/                           # Zustand stores
│   ├── project.ts
│   ├── scene.ts
│   ├── ui.ts
│   └── pm.ts
│
├── hooks/                            # Custom React hooks
│   ├── use-project.ts
│   └── use-configurator.ts
│
└── types/                            # TypeScript types
    ├── project.ts
    ├── scene.ts
    └── pm.ts
```

---

## 4. Component Library

### 4.1 Base UI Components

All base components use Radix UI primitives styled with Tailwind:

```typescript
// components/ui/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
```

### 4.2 Component List

| Component | Library | Purpose |
|-----------|---------|---------|
| Button | Radix Slot + CVA | Actions |
| Input | Native + Tailwind | Text input |
| Select | Radix Select | Dropdowns |
| Dialog | Radix Dialog | Modals |
| Accordion | Radix Accordion | Collapsible sections |
| Tabs | Radix Tabs | Tab navigation |
| Slider | Radix Slider | Range input |
| Toast | Radix Toast | Notifications |
| Tooltip | Radix Tooltip | Help text |
| Card | Native + Tailwind | Content container |

---

## 5. Babylon.js Integration

### 5.1 Configurator Class

```typescript
// lib/babylon/Configurator.ts

import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

export interface ConfiguratorOptions {
  projectId: string;
  baseModelUrl?: string;
  onElementChanged?: (element: SceneElement) => void;
  onElementSelected?: (id: string | null) => void;
  onPMDataChanged?: (pmData: PMData) => void;
  onSceneReady?: () => void;
}

export class Configurator {
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  
  private sceneManager: SceneManager;
  private assetManager: AssetManager;
  private selectionManager: SelectionManager;
  private phaseManager: PhaseManager;
  
  private tools: Map<string, BaseTool> = new Map();
  private activeTool: string = 'select';
  
  private callbacks: ConfiguratorOptions;
  
  constructor(canvas: HTMLCanvasElement, options: ConfiguratorOptions) {
    this.callbacks = options;
    
    // Initialize engine
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    
    // Setup camera
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 4,
      Math.PI / 3,
      20,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    
    // Initialize managers
    this.sceneManager = new SceneManager(this.scene);
    this.assetManager = new AssetManager(this.scene);
    this.selectionManager = new SelectionManager(this.scene);
    this.phaseManager = new PhaseManager(this.scene);
    
    // Initialize tools
    this.tools.set('select', new SelectTool(this));
    this.tools.set('wall', new WallTool(this));
    this.tools.set('door', new DoorTool(this));
    this.tools.set('furniture', new FurnitureTool(this));
    
    // Setup scene
    this.setupScene();
    
    // Load base model
    if (options.baseModelUrl) {
      this.loadBaseModel(options.baseModelUrl);
    }
    
    // Start render loop
    this.engine.runRenderLoop(() => this.scene.render());
    
    // Handle resize
    window.addEventListener('resize', () => this.engine.resize());
  }
  
  private setupScene(): void {
    // Lighting
    new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), this.scene);
    const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-1, -2, -1), this.scene);
    
    // Shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, sun);
    shadowGenerator.useBlurExponentialShadowMap = true;
    
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, this.scene);
    ground.receiveShadows = true;
    
    // Gizmos
    const gizmoManager = new BABYLON.GizmoManager(this.scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    
    this.callbacks.onSceneReady?.();
  }
  
  // Public API
  setTool(toolName: string): void { /* ... */ }
  addWall(params: WallParams): string { /* ... */ }
  addDoor(params: DoorParams): string { /* ... */ }
  selectElement(id: string): void { /* ... */ }
  deleteElement(id: string): void { /* ... */ }
  setPhase(phaseId: number): void { /* ... */ }
  setTimeOfDay(hour: number): void { /* ... */ }
  
  dispose(): void {
    this.engine.dispose();
  }
}
```

### 5.2 Tool Pattern

```typescript
// lib/babylon/tools/BaseTool.ts

export abstract class BaseTool {
  protected configurator: Configurator;
  protected scene: BABYLON.Scene;
  protected isActive = false;

  constructor(configurator: Configurator) {
    this.configurator = configurator;
    this.scene = configurator.getScene();
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

---

## 6. State Management

### 6.1 Zustand Stores

```typescript
// stores/project.ts
import { create } from 'zustand';

interface ProjectState {
  project: Project | null;
  rooms: Room[];
  isLoading: boolean;
  loadProject: (id: string) => Promise<void>;
  updateProject: (data: Partial<Project>) => void;
  addRoom: (room: Room) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  rooms: [],
  isLoading: false,
  
  loadProject: async (id) => {
    set({ isLoading: true });
    const response = await fetch(`/api/projects/${id}`);
    const data = await response.json();
    set({ project: data.project, rooms: data.rooms, isLoading: false });
  },
  
  updateProject: (data) => {
    set((state) => ({
      project: state.project ? { ...state.project, ...data } : null,
    }));
  },
  
  addRoom: (room) => {
    set((state) => ({ rooms: [...state.rooms, room] }));
  },
}));
```

```typescript
// stores/scene.ts
import { create } from 'zustand';

interface SceneState {
  elements: SceneElement[];
  selectedId: string | null;
  activePhaseId: number;
  phases: Phase[];
  
  addElement: (element: SceneElement) => void;
  updateElement: (element: SceneElement) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setActivePhase: (phaseId: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  elements: [],
  selectedId: null,
  activePhaseId: 3,
  phases: [
    { id: 1, name: 'As-Built', color: '#808080', visible: true },
    { id: 2, name: 'Demolition', color: '#FF4444', visible: true },
    { id: 3, name: 'Rough-In', color: '#FFA500', visible: true },
    { id: 4, name: 'Finishes', color: '#4444FF', visible: false },
    { id: 5, name: 'Final', color: '#44FF44', visible: false },
  ],
  
  addElement: (element) => set((state) => ({
    elements: [...state.elements, element],
  })),
  
  updateElement: (element) => set((state) => ({
    elements: state.elements.map((e) => e.id === element.id ? element : e),
  })),
  
  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter((e) => e.id !== id),
  })),
  
  selectElement: (id) => set({ selectedId: id }),
  
  setActivePhase: (phaseId) => set({ activePhaseId: phaseId }),
}));
```

```typescript
// stores/pm.ts
import { create } from 'zustand';

interface PMState {
  costBreakdown: CostBreakdown;
  schedule: Schedule;
  scope: Scope;
  risks: Risk[];
  
  setPMData: (data: PMData) => void;
  addRisk: (risk: Risk) => void;
}

export const usePMStore = create<PMState>((set) => ({
  costBreakdown: { demo: 0, framing: 0, finishes: 0, contingency: 0, total: 0 },
  schedule: { phases: [], totalWeeks: 0 },
  scope: { totalArea: 0, newWalls: 0, demoWalls: 0 },
  risks: [],
  
  setPMData: (data) => set(data),
  addRisk: (risk) => set((state) => ({ risks: [...state.risks, risk] })),
}));
```

---

## 7. Routing & Pages

### 7.1 Route Structure

| Route | Component | Protection | Purpose |
|-------|-----------|------------|---------|
| `/` | Landing | Public | Marketing |
| `/sign-in` | Clerk | Public | Authentication |
| `/sign-up` | Clerk | Public | Registration |
| `/dashboard` | Dashboard | Protected | Project list |
| `/project/new` | NewProject | Protected | Create wizard |
| `/project/[id]` | Configurator | Protected | 3D editor |
| `/view/[token]` | Viewer | Public | Client view |
| `/admin` | Admin | Super Admin | Management |

### 7.2 Layout Structure

```typescript
// app/layout.tsx - Root layout
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

// app/(app)/layout.tsx - Protected layout
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
```

---

## 8. UI/UX Design System

### 8.1 Color Palette

```css
:root {
  /* Base */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Primary - Blue */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  /* Secondary - Gray */
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  /* Destructive - Red */
  --destructive: 0 84.2% 60.2%;
  
  /* Phase Colors */
  --phase-1: 0 0% 50%;      /* As-Built - Gray */
  --phase-2: 0 70% 50%;     /* Demo - Red */
  --phase-3: 30 100% 50%;   /* Rough-In - Orange */
  --phase-4: 220 70% 50%;   /* Finishes - Blue */
  --phase-5: 120 70% 50%;   /* Final - Green */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### 8.2 Typography

```css
/* Font Stack */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### 8.3 Spacing

```css
/* Based on 4px grid */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### 8.4 Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### 8.5 Layout Patterns

```
┌─────────────────────────────────────────────────────────────┐
│  Header (64px)                                               │
├──────────┬────────────────────────────────────┬─────────────┤
│          │                                    │             │
│  Left    │         Canvas (flex-1)            │   Right     │
│  Panel   │                                    │   Panel     │
│  (256px) │                                    │   (320px)   │
│          │                                    │             │
│          │                                    │             │
├──────────┴────────────────────────────────────┴─────────────┤
│  AI Chat / Toolbar (collapsible)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix: Key Component Examples

### Elements Panel

```typescript
// components/configurator/elements-panel.tsx
'use client';

import { useSceneStore } from '@/stores/scene';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export function ElementsPanel() {
  const { elements, selectedId, selectElement, deleteElement } = useSceneStore();
  const grouped = groupBy(elements, 'type');

  return (
    <div className="w-64 border-r p-4 overflow-y-auto">
      <h2 className="font-semibold mb-4">Elements</h2>
      <Accordion type="multiple">
        {Object.entries(grouped).map(([type, items]) => (
          <AccordionItem key={type} value={type}>
            <AccordionTrigger>{type}s ({items.length})</AccordionTrigger>
            <AccordionContent>
              {items.map((el) => (
                <ElementRow
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={() => selectElement(el.id)}
                  onDelete={() => deleteElement(el.id)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
```

### PM Dashboard

```typescript
// components/configurator/pm-dashboard.tsx
'use client';

import { usePMStore } from '@/stores/pm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, Ruler, AlertTriangle } from 'lucide-react';

export function PMDashboard() {
  const { costBreakdown, schedule, scope, risks } = usePMStore();

  return (
    <div className="w-80 border-l p-4 overflow-y-auto space-y-4">
      <h2 className="font-semibold">Project Metrics</h2>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${costBreakdown.total.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{schedule.totalWeeks} weeks</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ruler className="h-4 w-4" /> Scope
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scope.totalArea.toLocaleString()} SF</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Risks ({risks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {risks.map((risk) => (
            <div key={risk.id} className="text-sm py-1">{risk.title}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```
