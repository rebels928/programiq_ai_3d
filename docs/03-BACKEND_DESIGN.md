# ProgramIQ v4 - Backend Design Document

**Version:** 1.0  
**Date:** December 8, 2025  
**Stack:** Next.js API Routes + Python (LangGraph + LiveKit)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Layer (Next.js)](#2-api-layer-nextjs)
3. [AI Agent Layer (Python)](#3-ai-agent-layer-python)
4. [Database Design](#4-database-design)
5. [Storage Architecture](#5-storage-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Real-time Features](#7-real-time-features)
8. [Cost Calculation Engine](#8-cost-calculation-engine)

---

## 1. Architecture Overview

### 1.1 Backend Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       NEXT.JS API ROUTES                             │   │
│  │                       (Vercel Edge/Serverless)                       │   │
│  │                                                                       │   │
│  │  /api/projects/*        CRUD for projects                           │   │
│  │  /api/scenes/*          Scene data management                        │   │
│  │  /api/assets/*          Asset catalog                                │   │
│  │  /api/costs/*           Cost database queries                        │   │
│  │  /api/export/*          PDF/GLTF generation                         │   │
│  │  /api/ai/command        AI command proxy                            │   │
│  │  /api/livekit/token     LiveKit authentication                      │   │
│  │  /api/webhooks/*        Clerk, Stripe webhooks                      │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    │ HTTP/WebSocket                          │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       PYTHON AI BACKEND                              │   │
│  │                       (Railway/Render)                               │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                  LIVEKIT AGENT SERVER                        │   │   │
│  │  │                                                              │   │   │
│  │  │  • Voice activity detection                                  │   │   │
│  │  │  • Deepgram STT (Speech-to-Text)                            │   │   │
│  │  │  • OpenAI TTS (Text-to-Speech)                              │   │   │
│  │  │  • WebRTC media handling                                     │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                       │   │
│  │                              ▼                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                  LANGGRAPH ORCHESTRATOR                      │   │   │
│  │  │                                                              │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │   │   │
│  │  │  │   Command   │  │    Cost     │  │   Scene     │        │   │   │
│  │  │  │   Parser    │  │  Calculator │  │  Modifier   │        │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘        │   │   │
│  │  │                                                              │   │   │
│  │  │  Tools: parse_command, lookup_cost, add_wall, add_door,    │   │   │
│  │  │         calculate_total, generate_response                   │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER                                    │   │
│  │                                                                       │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │   │
│  │  │    SUPABASE      │  │   CLOUDFLARE R2  │  │  LIVEKIT CLOUD  │   │   │
│  │  │    PostgreSQL    │  │   Object Storage │  │  Voice/Video    │   │   │
│  │  │                  │  │                  │  │                 │   │   │
│  │  │  • Projects      │  │  • 3D Models     │  │  • Rooms        │   │   │
│  │  │  • Scenes        │  │  • Textures      │  │  • Participants │   │   │
│  │  │  • Elements      │  │  • Floor Plans   │  │  • Tracks       │   │   │
│  │  │  • Costs         │  │  • Exports       │  │                 │   │   │
│  │  │  • Users         │  │                  │  │                 │   │   │
│  │  └──────────────────┘  └──────────────────┘  └─────────────────┘   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Request Flow

```
USER ACTION                                    BACKEND FLOW
───────────────────────────────────────────────────────────────────────────────

Text Command:                                  
"Add a 10 foot wall"                          
        │                                      
        ▼                                      
┌─────────────────┐                           
│  Next.js API    │  POST /api/ai/command     
│  /api/ai/command│  { text: "Add a 10 foot wall", projectId: "abc" }
└────────┬────────┘                           
         │                                     
         ▼                                     
┌─────────────────┐                           
│  Python Backend │  Parse natural language   
│  LangGraph      │  → { action: "add_wall", length: 3.048 }
└────────┬────────┘                           
         │                                     
         ▼                                     
┌─────────────────┐                           
│  Cost Lookup    │  Query cost database      
│                 │  → wall_cost = $45/LF × 10 = $450
└────────┬────────┘                           
         │                                     
         ▼                                     
┌─────────────────┐                           
│  Return Command │  JSON command for Babylon.js
│                 │  + PM data update
└────────┬────────┘                           
         │                                     
         ▼                                     
┌─────────────────┐                           
│  Frontend       │  Execute in Babylon.js    
│  Babylon.js     │  Update Zustand stores
└─────────────────┘                           


Voice Command:                                 
🎤 "Add a 10 foot wall"                       
        │                                      
        ▼                                      
┌─────────────────┐                           
│  LiveKit Cloud  │  WebRTC audio stream      
│                 │  → Deepgram STT           
└────────┬────────┘                           
         │ "Add a 10 foot wall"                
         ▼                                     
┌─────────────────┐                           
│  Python Agent   │  Same LangGraph flow      
│  LiveKit Agent  │  + TTS response           
└────────┬────────┘                           
         │                                     
         ├──────────────────────┐              
         ▼                      ▼              
┌─────────────────┐   ┌─────────────────┐     
│  JSON Command   │   │  Voice Response │     
│  via Data Chan  │   │  via LiveKit    │     
└─────────────────┘   └─────────────────┘     
```

---

## 2. API Layer (Next.js)

### 2.1 API Route Structure

```
app/api/
├── projects/
│   ├── route.ts                 # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts             # GET, PATCH, DELETE
│       ├── scene/
│       │   ├── route.ts         # GET, PATCH scene
│       │   └── elements/
│       │       ├── route.ts     # POST (add element)
│       │       └── [elementId]/
│       │           └── route.ts # PATCH, DELETE element
│       ├── publish/
│       │   └── route.ts         # POST (publish)
│       ├── share/
│       │   └── route.ts         # GET, POST (share link)
│       └── export/
│           ├── pdf/
│           │   └── route.ts     # POST (generate PDF)
│           ├── gltf/
│           │   └── route.ts     # POST (export GLTF)
│           └── takeoff/
│               └── route.ts     # POST (material takeoff)
├── assets/
│   ├── route.ts                 # GET catalog
│   ├── [category]/
│   │   └── route.ts             # GET by category
│   └── upload/
│       └── route.ts             # POST (admin upload)
├── costs/
│   ├── route.ts                 # GET cost items
│   └── calculate/
│       └── route.ts             # POST (calculate project costs)
├── ai/
│   ├── command/
│   │   └── route.ts             # POST (execute command)
│   └── query/
│       └── route.ts             # POST (query project data)
├── livekit/
│   └── token/
│       └── route.ts             # POST (get connection token)
└── webhooks/
    ├── clerk/
    │   └── route.ts             # POST (user sync)
    └── stripe/
        └── route.ts             # POST (billing events)
```

### 2.2 API Route Implementations

```typescript
// app/api/projects/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  projectType: z.enum(['kitchen_remodel', 'bathroom_remodel', 'adu', 'ti', 'addition', 'other']),
  location: z.object({
    address: z.string(),
    lat: z.number().optional(),
    lon: z.number().optional(),
  }).optional(),
  metadata: z.object({
    totalArea: z.number().optional(),
    yearBuilt: z.number().optional(),
    constructionType: z.string().optional(),
  }).optional(),
});

// GET /api/projects - List user's projects
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ projects: data });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const supabase = createClient();
    
    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: validated.name,
        project_type: validated.projectType,
        status: 'draft',
        location: validated.location,
        metadata: validated.metadata || {},
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create initial scene
    const { error: sceneError } = await supabase
      .from('scenes')
      .insert({
        project_id: project.id,
        environment: {
          timeOfDay: 14,
          weather: 'clear',
          hdri: 'interior_warm',
        },
        camera_presets: [
          { name: 'Overview', type: 'orbit', position: { x: 15, y: 12, z: 15 } },
          { name: 'Top Down', type: 'ortho', position: { x: 0, y: 20, z: 0 } },
        ],
      });

    if (sceneError) throw sceneError;

    // Create initial PM data
    const { error: pmError } = await supabase
      .from('pm_data')
      .insert({
        project_id: project.id,
        cost_breakdown: {},
        schedule: { phases: [], totalWeeks: 0 },
        resources: { laborHours: 0, trades: [], equipment: [] },
        risks: [],
        takeoff: [],
      });

    if (pmError) throw pmError;

    return NextResponse.json({ id: project.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/projects/[id]/scene/elements/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { calculateElementCost } from '@/lib/costs/calculator';
import { z } from 'zod';

const addElementSchema = z.object({
  type: z.enum(['wall', 'door', 'window', 'furniture', 'fixture']),
  phaseId: z.number().int().min(1).max(5),
  status: z.enum(['existing', 'demo', 'new']).default('new'),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  rotation: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
  scale: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
  properties: z.record(z.any()),
  materialId: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/projects/[id]/scene/elements - Add element
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = addElementSchema.parse(body);

    const supabase = createClient();

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', params.id)
      .single();

    if (!project || project.user_id !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Get scene
    const { data: scene } = await supabase
      .from('scenes')
      .select('id')
      .eq('project_id', params.id)
      .single();

    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    // Calculate cost
    const { cost, laborHours } = await calculateElementCost(
      validated.type,
      validated.properties,
      validated.status
    );

    // Insert element
    const { data: element, error } = await supabase
      .from('scene_elements')
      .insert({
        scene_id: scene.id,
        type: validated.type,
        phase_id: validated.phaseId,
        status: validated.status,
        position: validated.position,
        rotation: validated.rotation || { x: 0, y: 0, z: 0 },
        scale: validated.scale || { x: 1, y: 1, z: 1 },
        properties: validated.properties,
        material_id: validated.materialId,
        cost,
        labor_hours: laborHours,
        notes: validated.notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Recalculate PM data
    await recalculatePMData(params.id, supabase);

    return NextResponse.json({ element }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error adding element:', error);
    return NextResponse.json(
      { error: 'Failed to add element' },
      { status: 500 }
    );
  }
}

async function recalculatePMData(projectId: string, supabase: any) {
  // Get all elements
  const { data: elements } = await supabase
    .from('scene_elements')
    .select('*')
    .eq('scene_id', (
      await supabase.from('scenes').select('id').eq('project_id', projectId).single()
    ).data.id);

  // Calculate costs
  const costBreakdown = calculateCostBreakdown(elements);
  
  // Calculate schedule
  const schedule = calculateSchedule(elements);
  
  // Calculate scope
  const scope = calculateScope(elements);

  // Update PM data
  await supabase
    .from('pm_data')
    .update({
      cost_breakdown: costBreakdown,
      schedule,
      scope,
      updated_at: new Date(),
    })
    .eq('project_id', projectId);
}
```

```typescript
// app/api/ai/command/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const commandSchema = z.object({
  projectId: z.string().uuid(),
  text: z.string().min(1).max(500),
});

// POST /api/ai/command - Execute AI command
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, text } = commandSchema.parse(body);

    // Call Python backend
    const response = await fetch(`${process.env.PYTHON_BACKEND_URL}/api/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({ projectId, text }),
    });

    if (!response.ok) {
      throw new Error('AI backend error');
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error executing command:', error);
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/livekit/token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccessToken } from 'livekit-server-sdk';
import { z } from 'zod';

const tokenSchema = z.object({
  projectId: z.string().uuid(),
});

// POST /api/livekit/token - Get LiveKit connection token
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = tokenSchema.parse(body);

    // Create access token
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: userId,
        metadata: JSON.stringify({ projectId }),
      }
    );

    // Grant permissions
    at.addGrant({
      room: `project-${projectId}`,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: process.env.LIVEKIT_URL,
      room: `project-${projectId}`,
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
```

---

## 3. AI Agent Layer (Python)

### 3.1 Project Structure

```
backend/
├── main.py                      # FastAPI + LiveKit entry point
├── requirements.txt             # Python dependencies
├── pyproject.toml              # uv project config
├── agents/
│   ├── __init__.py
│   ├── orchestrator.py         # LangGraph workflow
│   └── tools.py                # Agent tools
├── services/
│   ├── __init__.py
│   ├── command_parser.py       # NLP command parsing
│   ├── cost_calculator.py      # Cost calculation
│   └── scene_modifier.py       # Scene modification
├── models/
│   ├── __init__.py
│   ├── commands.py             # Command types
│   └── scene.py                # Scene types
└── config/
    ├── __init__.py
    └── settings.py             # Environment config
```

### 3.2 Main Entry Point

```python
# backend/main.py

import asyncio
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from livekit import rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai

from agents.orchestrator import CommandOrchestrator
from config.settings import settings

# FastAPI app for HTTP endpoints
app = FastAPI(title="ProgramIQ AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class CommandRequest(BaseModel):
    projectId: str
    text: str

class CommandResponse(BaseModel):
    success: bool
    command: dict | None
    message: str
    pmUpdate: dict | None

# Initialize orchestrator
orchestrator = CommandOrchestrator()

@app.post("/api/command", response_model=CommandResponse)
async def execute_command(request: CommandRequest):
    """Execute a text command"""
    try:
        result = await orchestrator.execute(
            project_id=request.projectId,
            user_input=request.text
        )
        return CommandResponse(
            success=True,
            command=result.get("command"),
            message=result.get("message", "Command executed"),
            pmUpdate=result.get("pm_update")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# LiveKit Agent
async def entrypoint(ctx: JobContext):
    """LiveKit agent entry point"""
    
    # Get project context from room metadata
    metadata = ctx.room.metadata
    project_id = metadata.get("project_id") if metadata else None
    
    # Create LLM adapter for LangGraph
    class LangGraphLLM:
        def __init__(self):
            self.orchestrator = CommandOrchestrator()
            self.project_id = project_id
        
        async def chat(self, messages):
            user_message = messages[-1].content if messages else ""
            
            result = await self.orchestrator.execute(
                project_id=self.project_id,
                user_input=user_message
            )
            
            # Send command to frontend via data channel
            if result.get("command"):
                await ctx.room.local_participant.publish_data(
                    json.dumps(result["command"]).encode(),
                    reliable=True
                )
            
            return result.get("message", "Done!")
    
    # Initialize voice assistant
    assistant = VoiceAssistant(
        vad=rtc.VAD.from_options(
            min_silence_duration=0.5,
        ),
        stt=deepgram.STT(
            model="nova-2",
            language="en-US",
        ),
        llm=LangGraphLLM(),
        tts=openai.TTS(
            voice="nova",
        ),
    )
    
    # Start assistant
    assistant.start(ctx.room)
    
    # Initial greeting
    await assistant.say(
        "Hi! I'm your building assistant. "
        "Tell me what you'd like to add or change in your project."
    )
    
    # Keep alive
    await asyncio.sleep(float("inf"))


if __name__ == "__main__":
    import uvicorn
    
    # Run both FastAPI and LiveKit agent
    if os.getenv("LIVEKIT_AGENT_MODE"):
        # LiveKit agent mode
        cli.run_app(
            WorkerOptions(
                entrypoint_fnc=entrypoint,
            )
        )
    else:
        # FastAPI server mode
        uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3.3 LangGraph Orchestrator

```python
# backend/agents/orchestrator.py

from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage

from services.command_parser import CommandParser
from services.cost_calculator import CostCalculator
from services.scene_modifier import SceneModifier
from models.commands import ParsedCommand


class AgentState(TypedDict):
    project_id: str
    user_input: str
    parsed_command: ParsedCommand | None
    cost_impact: dict | None
    scene_command: dict | None
    pm_update: dict | None
    response_message: str
    error: str | None


class CommandOrchestrator:
    def __init__(self):
        self.llm = ChatAnthropic(
            model="claude-sonnet-4-20250514",
            temperature=0.3,
        )
        self.parser = CommandParser(self.llm)
        self.calculator = CostCalculator()
        self.modifier = SceneModifier()
        
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("parse", self._parse_command)
        workflow.add_node("calculate", self._calculate_costs)
        workflow.add_node("generate", self._generate_scene_command)
        workflow.add_node("respond", self._generate_response)
        
        # Define edges
        workflow.set_entry_point("parse")
        
        workflow.add_conditional_edges(
            "parse",
            self._route_after_parse,
            {
                "calculate": "calculate",
                "respond": "respond",  # For queries, go straight to response
            }
        )
        
        workflow.add_edge("calculate", "generate")
        workflow.add_edge("generate", "respond")
        workflow.add_edge("respond", END)
        
        return workflow.compile()
    
    def _route_after_parse(self, state: AgentState) -> str:
        if state.get("error"):
            return "respond"
        
        cmd = state.get("parsed_command")
        if not cmd:
            return "respond"
        
        # Queries don't need cost calculation
        if cmd.category == "query":
            return "respond"
        
        return "calculate"
    
    async def _parse_command(self, state: AgentState) -> AgentState:
        """Parse natural language into structured command"""
        try:
            parsed = await self.parser.parse(state["user_input"])
            return {**state, "parsed_command": parsed}
        except Exception as e:
            return {**state, "error": f"Could not understand: {str(e)}"}
    
    async def _calculate_costs(self, state: AgentState) -> AgentState:
        """Calculate cost impact of command"""
        try:
            cmd = state["parsed_command"]
            if not cmd:
                return state
            
            cost_impact = await self.calculator.calculate(cmd)
            return {**state, "cost_impact": cost_impact}
        except Exception as e:
            return {**state, "error": f"Cost calculation error: {str(e)}"}
    
    async def _generate_scene_command(self, state: AgentState) -> AgentState:
        """Generate Babylon.js command and PM update"""
        try:
            cmd = state["parsed_command"]
            cost = state["cost_impact"]
            
            if not cmd:
                return state
            
            scene_command = self.modifier.to_scene_command(cmd)
            pm_update = self.modifier.to_pm_update(cmd, cost)
            
            return {
                **state,
                "scene_command": scene_command,
                "pm_update": pm_update,
            }
        except Exception as e:
            return {**state, "error": f"Scene command error: {str(e)}"}
    
    async def _generate_response(self, state: AgentState) -> AgentState:
        """Generate natural language response"""
        if state.get("error"):
            return {**state, "response_message": state["error"]}
        
        cmd = state.get("parsed_command")
        cost = state.get("cost_impact")
        
        if not cmd:
            return {**state, "response_message": "I'm not sure what you want me to do. Try saying something like 'add a 10 foot wall' or 'what's the total cost?'"}
        
        # Generate contextual response
        if cmd.category == "query":
            message = await self._handle_query(cmd, state["project_id"])
        else:
            message = self._build_action_response(cmd, cost)
        
        return {**state, "response_message": message}
    
    def _build_action_response(self, cmd: ParsedCommand, cost: dict | None) -> str:
        """Build response for action commands"""
        messages = []
        
        if cmd.action == "add_wall":
            length_ft = cmd.parameters.get("length", 0) * 3.28084
            messages.append(f"Adding a {length_ft:.1f} foot wall.")
        elif cmd.action == "add_door":
            messages.append(f"Adding a {cmd.parameters.get('type', 'single')} door.")
        elif cmd.action == "add_furniture":
            messages.append(f"Placing {cmd.parameters.get('item', 'furniture')}.")
        elif cmd.action == "delete":
            messages.append("Element deleted.")
        elif cmd.action == "set_phase":
            messages.append(f"Showing phase {cmd.parameters.get('phaseId')}.")
        elif cmd.action == "set_time":
            hour = cmd.parameters.get("hour", 12)
            messages.append(f"Setting time to {hour}:00.")
        
        if cost:
            messages.append(f"Cost impact: ${cost.get('total', 0):,.0f}")
        
        return " ".join(messages)
    
    async def _handle_query(self, cmd: ParsedCommand, project_id: str) -> str:
        """Handle query commands"""
        # Fetch PM data from database
        pm_data = await self._get_pm_data(project_id)
        
        if cmd.action == "query_cost":
            total = pm_data.get("cost_breakdown", {}).get("total", 0)
            return f"Your current total cost is ${total:,.0f}."
        elif cmd.action == "query_schedule":
            weeks = pm_data.get("schedule", {}).get("totalWeeks", 0)
            return f"The estimated timeline is {weeks} weeks."
        elif cmd.action == "query_scope":
            area = pm_data.get("scope", {}).get("totalArea", 0)
            return f"Total project area is {area:,.0f} square feet."
        
        return "I couldn't find that information."
    
    async def execute(self, project_id: str, user_input: str) -> dict:
        """Execute a command and return result"""
        initial_state: AgentState = {
            "project_id": project_id,
            "user_input": user_input,
            "parsed_command": None,
            "cost_impact": None,
            "scene_command": None,
            "pm_update": None,
            "response_message": "",
            "error": None,
        }
        
        result = await self.graph.ainvoke(initial_state)
        
        return {
            "success": not result.get("error"),
            "command": result.get("scene_command"),
            "message": result.get("response_message"),
            "pm_update": result.get("pm_update"),
        }
```

### 3.4 Command Parser

```python
# backend/services/command_parser.py

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel
import json

from models.commands import ParsedCommand


PARSER_SYSTEM_PROMPT = """You are a command parser for a construction project configurator.
Parse user commands into structured JSON format.

Categories:
- walls: add_wall, delete_wall, modify_wall
- doors: add_door, delete_door, modify_door
- windows: add_window, delete_window, modify_window
- furniture: add_furniture, delete_furniture, move_furniture
- materials: set_material
- phases: set_phase, show_phase
- environment: set_time, set_weather
- query: query_cost, query_schedule, query_scope

For measurements, convert to meters:
- 10 feet = 3.048 meters
- 10 ft = 3.048 meters
- 10' = 3.048 meters

Examples:
User: "Add a 10 foot wall"
Output: {"category": "walls", "action": "add_wall", "parameters": {"length": 3.048, "height": 2.8}}

User: "What's the total cost?"
Output: {"category": "query", "action": "query_cost", "parameters": {}}

User: "Put a door in the kitchen wall"
Output: {"category": "doors", "action": "add_door", "parameters": {"type": "single", "width": 0.9}}

User: "Show me phase 3"
Output: {"category": "phases", "action": "set_phase", "parameters": {"phaseId": 3}}

User: "Make it sunset"
Output: {"category": "environment", "action": "set_time", "parameters": {"hour": 18.5}}

Always respond with ONLY valid JSON, no markdown or explanation."""


class CommandParser:
    def __init__(self, llm: ChatAnthropic):
        self.llm = llm
    
    async def parse(self, user_input: str) -> ParsedCommand:
        """Parse natural language into structured command"""
        
        messages = [
            SystemMessage(content=PARSER_SYSTEM_PROMPT),
            HumanMessage(content=user_input),
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # Parse JSON response
        try:
            data = json.loads(response.content)
            return ParsedCommand(
                category=data.get("category", "unknown"),
                action=data.get("action", "unknown"),
                parameters=data.get("parameters", {}),
            )
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return ParsedCommand(
                    category=data.get("category", "unknown"),
                    action=data.get("action", "unknown"),
                    parameters=data.get("parameters", {}),
                )
            raise ValueError(f"Could not parse response: {response.content}")
```

### 3.5 Cost Calculator

```python
# backend/services/cost_calculator.py

from typing import Optional
import httpx
from config.settings import settings
from models.commands import ParsedCommand


# Cost database (would normally fetch from Supabase)
COST_DATABASE = {
    "bay_area": {
        "demo": {
            "wall_lf": 15,
            "door_ea": 75,
            "window_ea": 100,
        },
        "framing": {
            "interior_wall_lf": 45,
            "exterior_wall_lf": 65,
            "header_ea": 350,
        },
        "doors": {
            "interior_single": 450,
            "interior_double": 750,
            "exterior_single": 850,
            "exterior_double": 1500,
            "sliding": 1200,
            "pocket": 650,
        },
        "windows": {
            "single_hung": 450,
            "double_hung": 550,
            "casement": 650,
            "sliding": 400,
            "fixed": 350,
        },
        "finishes": {
            "drywall_sf": 3.50,
            "paint_sf": 2.00,
            "trim_lf": 8,
        },
    }
}


class CostCalculator:
    def __init__(self, region: str = "bay_area"):
        self.region = region
        self.costs = COST_DATABASE.get(region, COST_DATABASE["bay_area"])
    
    async def calculate(self, cmd: ParsedCommand) -> dict:
        """Calculate cost impact of a command"""
        
        if cmd.action == "add_wall":
            return self._calculate_wall_cost(cmd.parameters)
        elif cmd.action == "add_door":
            return self._calculate_door_cost(cmd.parameters)
        elif cmd.action == "add_window":
            return self._calculate_window_cost(cmd.parameters)
        elif cmd.action == "add_furniture":
            return self._calculate_furniture_cost(cmd.parameters)
        elif cmd.action.startswith("delete"):
            return {"total": 0, "breakdown": {}}
        
        return {"total": 0, "breakdown": {}}
    
    def _calculate_wall_cost(self, params: dict) -> dict:
        """Calculate wall cost"""
        length_m = params.get("length", 0)
        height_m = params.get("height", 2.8)
        
        length_ft = length_m * 3.28084
        height_ft = height_m * 3.28084
        area_sf = length_ft * height_ft * 2  # Both sides
        
        framing = length_ft * self.costs["framing"]["interior_wall_lf"]
        drywall = area_sf * self.costs["finishes"]["drywall_sf"]
        paint = area_sf * self.costs["finishes"]["paint_sf"]
        
        total = framing + drywall + paint
        
        return {
            "total": total,
            "breakdown": {
                "framing": framing,
                "drywall": drywall,
                "paint": paint,
            },
            "labor_hours": length_ft * 0.75,  # 0.75 hours per LF
        }
    
    def _calculate_door_cost(self, params: dict) -> dict:
        """Calculate door cost"""
        door_type = params.get("type", "interior_single")
        
        base_cost = self.costs["doors"].get(door_type, 450)
        framing = self.costs["framing"].get("header_ea", 350)
        
        total = base_cost + framing
        
        return {
            "total": total,
            "breakdown": {
                "door": base_cost,
                "framing": framing,
            },
            "labor_hours": 4,  # 4 hours per door
        }
    
    def _calculate_window_cost(self, params: dict) -> dict:
        """Calculate window cost"""
        window_type = params.get("type", "double_hung")
        
        base_cost = self.costs["windows"].get(window_type, 550)
        framing = 200  # Header/sill framing
        
        total = base_cost + framing
        
        return {
            "total": total,
            "breakdown": {
                "window": base_cost,
                "framing": framing,
            },
            "labor_hours": 3,  # 3 hours per window
        }
    
    def _calculate_furniture_cost(self, params: dict) -> dict:
        """Calculate furniture cost (from catalog)"""
        # Would fetch from catalog database
        item_type = params.get("item", "")
        
        # Placeholder costs
        furniture_costs = {
            "bed_queen": 800,
            "bed_king": 1200,
            "sofa_3seat": 1500,
            "dining_table": 600,
            "desk": 400,
            "chair": 150,
        }
        
        cost = furniture_costs.get(item_type, 500)
        
        return {
            "total": cost,
            "breakdown": {"furniture": cost},
            "labor_hours": 0.5,  # Delivery/placement
        }
```

---

## 4. Database Design

### 4.1 Supabase Setup

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Organizations (for multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (synced from Clerk)
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Clerk user ID
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('super_admin', 'org_admin', 'creator', 'viewer')),
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'approved', 'archived')),
  location JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenes
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  base_model_url TEXT,
  floor_plan_url TEXT,
  environment JSONB DEFAULT '{"timeOfDay": 14, "weather": "clear"}',
  camera_presets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Scene Elements
CREATE TABLE scene_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('wall', 'door', 'window', 'furniture', 'fixture')),
  phase_id INTEGER NOT NULL DEFAULT 3 CHECK (phase_id BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('existing', 'demo', 'new')),
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  rotation JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  scale JSONB NOT NULL DEFAULT '{"x": 1, "y": 1, "z": 1}',
  properties JSONB NOT NULL DEFAULT '{}',
  material_id TEXT,
  cost DECIMAL(10,2) DEFAULT 0,
  labor_hours DECIMAL(6,2) DEFAULT 0,
  notes TEXT,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  width_m DECIMAL(6,2) NOT NULL,
  depth_m DECIMAL(6,2) NOT NULL,
  area_sf DECIMAL(8,2) GENERATED ALWAYS AS (width_m * depth_m * 10.764) STORED,
  bounds JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PM Data
CREATE TABLE pm_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  cost_breakdown JSONB NOT NULL DEFAULT '{}',
  schedule JSONB NOT NULL DEFAULT '{"phases": [], "totalWeeks": 0}',
  scope JSONB NOT NULL DEFAULT '{}',
  resources JSONB NOT NULL DEFAULT '{"laborHours": 0, "trades": [], "equipment": []}',
  risks JSONB NOT NULL DEFAULT '[]',
  takeoff JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Cost Items (for cost database)
CREATE TABLE cost_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  labor_hours DECIMAL(6,2) NOT NULL DEFAULT 0,
  region TEXT NOT NULL DEFAULT 'bay_area',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, item, region)
);

-- Project Shares
CREATE TABLE project_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  permissions TEXT NOT NULL DEFAULT 'view' CHECK (permissions IN ('view', 'comment', 'edit')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments (Tier 2)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  element_id UUID REFERENCES scene_elements(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  position JSONB,  -- {x, y, z} in 3D space
  text TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Catalog
CREATE TABLE asset_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id),  -- NULL = global
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  model_url TEXT NOT NULL,
  thumbnail_url TEXT,
  dimensions JSONB,  -- {width, height, depth}
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_scene_elements_scene_id ON scene_elements(scene_id);
CREATE INDEX idx_scene_elements_type ON scene_elements(type);
CREATE INDEX idx_scene_elements_phase_id ON scene_elements(phase_id);
CREATE INDEX idx_rooms_project_id ON rooms(project_id);
CREATE INDEX idx_cost_items_category ON cost_items(category);
CREATE INDEX idx_cost_items_region ON cost_items(region);
CREATE INDEX idx_asset_catalog_category ON asset_catalog(category);
CREATE INDEX idx_project_shares_token ON project_shares(share_token);

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example - would need auth.uid() function from Clerk)
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scenes_updated_at
  BEFORE UPDATE ON scenes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scene_elements_updated_at
  BEFORE UPDATE ON scene_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pm_data_updated_at
  BEFORE UPDATE ON pm_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4.2 Seed Data

```sql
-- Insert cost items for Bay Area
INSERT INTO cost_items (category, item, description, unit, unit_cost, labor_hours, region) VALUES
-- Demo
('demo', 'interior_wall_lf', 'Remove interior wall', 'LF', 15.00, 0.25, 'bay_area'),
('demo', 'exterior_wall_lf', 'Remove exterior wall', 'LF', 25.00, 0.40, 'bay_area'),
('demo', 'door_ea', 'Remove door and frame', 'EA', 75.00, 0.50, 'bay_area'),
('demo', 'window_ea', 'Remove window', 'EA', 100.00, 0.75, 'bay_area'),
('demo', 'flooring_sf', 'Remove flooring', 'SF', 2.50, 0.05, 'bay_area'),
('demo', 'cabinet_lf', 'Remove base cabinet', 'LF', 35.00, 0.25, 'bay_area'),

-- Framing
('framing', 'interior_wall_lf', 'Frame interior wall (2x4)', 'LF', 45.00, 0.50, 'bay_area'),
('framing', 'exterior_wall_lf', 'Frame exterior wall (2x6)', 'LF', 65.00, 0.75, 'bay_area'),
('framing', 'header_6ft', 'Door/window header 6ft', 'EA', 350.00, 2.00, 'bay_area'),
('framing', 'header_8ft', 'Door/window header 8ft', 'EA', 450.00, 2.50, 'bay_area'),
('framing', 'beam_lf', 'LVL beam installed', 'LF', 125.00, 1.00, 'bay_area'),

-- Doors
('doors', 'interior_single', 'Interior door 32-36in', 'EA', 450.00, 4.00, 'bay_area'),
('doors', 'interior_double', 'Interior double door', 'EA', 750.00, 6.00, 'bay_area'),
('doors', 'exterior_single', 'Exterior door', 'EA', 850.00, 5.00, 'bay_area'),
('doors', 'sliding', 'Sliding door 6ft', 'EA', 1200.00, 6.00, 'bay_area'),
('doors', 'pocket', 'Pocket door', 'EA', 650.00, 5.00, 'bay_area'),
('doors', 'barn', 'Barn door', 'EA', 550.00, 3.00, 'bay_area'),

-- Windows
('windows', 'single_hung', 'Single hung window', 'EA', 450.00, 3.00, 'bay_area'),
('windows', 'double_hung', 'Double hung window', 'EA', 550.00, 3.50, 'bay_area'),
('windows', 'casement', 'Casement window', 'EA', 650.00, 3.50, 'bay_area'),
('windows', 'sliding', 'Sliding window', 'EA', 400.00, 3.00, 'bay_area'),
('windows', 'fixed', 'Fixed window', 'EA', 350.00, 2.50, 'bay_area'),
('windows', 'picture', 'Picture window large', 'EA', 1200.00, 5.00, 'bay_area'),

-- Finishes
('finishes', 'drywall_sf', 'Drywall installed and finished', 'SF', 3.50, 0.04, 'bay_area'),
('finishes', 'paint_sf', 'Paint (2 coats)', 'SF', 2.00, 0.02, 'bay_area'),
('finishes', 'trim_lf', 'Base/crown trim', 'LF', 8.00, 0.10, 'bay_area'),
('finishes', 'hardwood_sf', 'Hardwood flooring', 'SF', 12.00, 0.08, 'bay_area'),
('finishes', 'tile_sf', 'Ceramic tile', 'SF', 15.00, 0.12, 'bay_area'),
('finishes', 'carpet_sf', 'Carpet installed', 'SF', 6.00, 0.04, 'bay_area'),

-- Electrical
('electrical', 'outlet_ea', 'Standard outlet', 'EA', 150.00, 1.00, 'bay_area'),
('electrical', 'switch_ea', 'Light switch', 'EA', 125.00, 0.75, 'bay_area'),
('electrical', 'light_fixture_ea', 'Light fixture (allowance)', 'EA', 350.00, 1.50, 'bay_area'),
('electrical', 'recessed_light_ea', 'Recessed can light', 'EA', 175.00, 1.00, 'bay_area'),
('electrical', 'panel_upgrade', '200A panel upgrade', 'EA', 2800.00, 12.00, 'bay_area'),

-- Plumbing
('plumbing', 'sink_ea', 'Sink with faucet', 'EA', 650.00, 4.00, 'bay_area'),
('plumbing', 'toilet_ea', 'Toilet installed', 'EA', 450.00, 3.00, 'bay_area'),
('plumbing', 'shower_ea', 'Shower/tub (allowance)', 'EA', 2500.00, 8.00, 'bay_area'),
('plumbing', 'rough_point', 'Plumbing rough-in point', 'EA', 750.00, 4.00, 'bay_area'),
('plumbing', 'water_heater', 'Water heater 50gal', 'EA', 1800.00, 6.00, 'bay_area');
```

---

## 5. Storage Architecture

### 5.1 Cloudflare R2 Structure

```
programiq-assets/                    # Global assets bucket
├── furniture/
│   ├── catalog.json                # Furniture catalog metadata
│   ├── bedroom/
│   │   ├── bed-queen.glb
│   │   ├── bed-queen-thumb.jpg
│   │   ├── nightstand.glb
│   │   └── ...
│   ├── living/
│   │   ├── sofa-3seat.glb
│   │   ├── armchair.glb
│   │   └── ...
│   ├── kitchen/
│   │   ├── island.glb
│   │   ├── stool.glb
│   │   └── ...
│   └── office/
│       ├── desk.glb
│       └── ...
├── doors/
│   ├── door-single.glb
│   ├── door-double.glb
│   ├── door-sliding.glb
│   └── ...
├── windows/
│   ├── window-double-hung.glb
│   ├── window-casement.glb
│   └── ...
├── materials/
│   ├── catalog.json
│   ├── wood/
│   │   ├── oak.json               # PBR material definition
│   │   ├── oak-diffuse.jpg
│   │   ├── oak-normal.jpg
│   │   └── oak-roughness.jpg
│   ├── paint/
│   │   └── ...
│   └── tile/
│       └── ...
├── hdri/
│   ├── interior-warm.hdr
│   ├── interior-cool.hdr
│   ├── suburban.hdr
│   └── studio.hdr
└── templates/
    ├── empty.babylon
    ├── studio.babylon
    └── 1br.babylon

programiq-projects/                  # User projects bucket
├── {user_id}/
│   └── {project_id}/
│       ├── scene.json             # Scene state
│       ├── base-model.glb         # Imported scan
│       ├── floor-plan.png         # Reference image
│       └── custom/                # User-uploaded assets
│           └── ...

programiq-exports/                   # Generated exports bucket
├── {project_id}/
│   └── {timestamp}/
│       ├── floor-plan.pdf
│       ├── model.glb
│       ├── takeoff.csv
│       └── sow.pdf
```

### 5.2 R2 Client

```typescript
// lib/r2/client.ts

import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKETS = {
  assets: 'programiq-assets',
  projects: 'programiq-projects',
  exports: 'programiq-exports',
} as const;

export async function getSignedDownloadUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(r2Client, command, { expiresIn });
}

export async function getSignedUploadUrl(bucket: string, key: string, contentType: string, expiresIn = 3600): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

export async function uploadFile(bucket: string, key: string, body: Buffer, contentType: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await r2Client.send(command);
}

export async function deleteFile(bucket: string, key: string): Promise<void> {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await r2Client.send(command);
}
```

---

## 6. Authentication & Authorization

### 6.1 Clerk Integration

```typescript
// lib/auth/clerk.ts

import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function getAuthenticatedUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }
  
  const user = await currentUser();
  
  return {
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress,
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : undefined,
  };
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export async function getUserRole(userId: string): Promise<string> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  
  return data?.role || 'creator';
}

export async function requireRole(userId: string, requiredRoles: string[]) {
  const role = await getUserRole(userId);
  
  if (!requiredRoles.includes(role)) {
    throw new Error('Forbidden');
  }
  
  return role;
}
```

### 6.2 Clerk Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts

import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { createClient } from '@/lib/supabase/admin';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createClient();

  switch (evt.type) {
    case 'user.created':
      await supabase.from('users').insert({
        id: evt.data.id,
        email: evt.data.email_addresses[0]?.email_address,
        name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
        role: 'creator',
      });
      break;

    case 'user.updated':
      await supabase.from('users').update({
        email: evt.data.email_addresses[0]?.email_address,
        name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
        updated_at: new Date(),
      }).eq('id', evt.data.id);
      break;

    case 'user.deleted':
      await supabase.from('users').delete().eq('id', evt.data.id);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

---

## 7. Real-time Features

### 7.1 Supabase Realtime

```typescript
// lib/supabase/realtime.ts

import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function subscribeToProject(
  projectId: string,
  callbacks: {
    onElementChange?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onPMDataChange?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onCommentChange?: (payload: RealtimePostgresChangesPayload<any>) => void;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`project:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scene_elements',
        filter: `scene_id=eq.${projectId}`,
      },
      callbacks.onElementChange
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pm_data',
        filter: `project_id=eq.${projectId}`,
      },
      callbacks.onPMDataChange
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `project_id=eq.${projectId}`,
      },
      callbacks.onCommentChange
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromProject(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}
```

### 7.2 React Hook for Realtime

```typescript
// hooks/use-realtime.ts

import { useEffect, useRef } from 'react';
import { subscribeToProject, unsubscribeFromProject } from '@/lib/supabase/realtime';
import { useSceneStore } from '@/stores/scene';
import { usePMStore } from '@/stores/pm';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeProject(projectId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { updateElement, deleteElement, addElement } = useSceneStore();
  const { setPMData } = usePMStore();

  useEffect(() => {
    if (!projectId) return;

    channelRef.current = subscribeToProject(projectId, {
      onElementChange: (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            addElement(payload.new as any);
            break;
          case 'UPDATE':
            updateElement(payload.new as any);
            break;
          case 'DELETE':
            deleteElement(payload.old.id);
            break;
        }
      },
      onPMDataChange: (payload) => {
        if (payload.eventType === 'UPDATE') {
          setPMData(payload.new as any);
        }
      },
    });

    return () => {
      if (channelRef.current) {
        unsubscribeFromProject(channelRef.current);
      }
    };
  }, [projectId, updateElement, deleteElement, addElement, setPMData]);
}
```

---

## 8. Cost Calculation Engine

### 8.1 Cost Calculator Service

```typescript
// lib/costs/calculator.ts

import { createClient } from '@/lib/supabase/server';

interface ElementCost {
  cost: number;
  laborHours: number;
  breakdown: Record<string, number>;
}

export async function calculateElementCost(
  type: string,
  properties: Record<string, any>,
  status: string,
  region: string = 'bay_area'
): Promise<ElementCost> {
  const supabase = createClient();
  
  // Get cost items from database
  const { data: costItems } = await supabase
    .from('cost_items')
    .select('*')
    .eq('region', region);
  
  const costs = costItems?.reduce((acc, item) => {
    acc[`${item.category}_${item.item}`] = {
      unitCost: item.unit_cost,
      laborHours: item.labor_hours,
    };
    return acc;
  }, {} as Record<string, { unitCost: number; laborHours: number }>);

  if (!costs) {
    return { cost: 0, laborHours: 0, breakdown: {} };
  }

  switch (type) {
    case 'wall':
      return calculateWallCost(properties, status, costs);
    case 'door':
      return calculateDoorCost(properties, status, costs);
    case 'window':
      return calculateWindowCost(properties, status, costs);
    case 'furniture':
      return calculateFurnitureCost(properties, costs);
    default:
      return { cost: 0, laborHours: 0, breakdown: {} };
  }
}

function calculateWallCost(
  properties: Record<string, any>,
  status: string,
  costs: Record<string, { unitCost: number; laborHours: number }>
): ElementCost {
  const lengthM = properties.length || 0;
  const heightM = properties.height || 2.8;
  const lengthFt = lengthM * 3.28084;
  const areaSf = lengthFt * (heightM * 3.28084) * 2;
  
  const breakdown: Record<string, number> = {};
  let totalCost = 0;
  let totalLabor = 0;

  if (status === 'demo') {
    const demoCost = costs['demo_interior_wall_lf'];
    if (demoCost) {
      breakdown.demo = lengthFt * demoCost.unitCost;
      totalCost += breakdown.demo;
      totalLabor += lengthFt * demoCost.laborHours;
    }
  } else if (status === 'new') {
    // Framing
    const framingCost = costs['framing_interior_wall_lf'];
    if (framingCost) {
      breakdown.framing = lengthFt * framingCost.unitCost;
      totalCost += breakdown.framing;
      totalLabor += lengthFt * framingCost.laborHours;
    }
    
    // Drywall
    const drywallCost = costs['finishes_drywall_sf'];
    if (drywallCost) {
      breakdown.drywall = areaSf * drywallCost.unitCost;
      totalCost += breakdown.drywall;
      totalLabor += areaSf * drywallCost.laborHours;
    }
    
    // Paint
    const paintCost = costs['finishes_paint_sf'];
    if (paintCost) {
      breakdown.paint = areaSf * paintCost.unitCost;
      totalCost += breakdown.paint;
      totalLabor += areaSf * paintCost.laborHours;
    }
  }

  return {
    cost: Math.round(totalCost * 100) / 100,
    laborHours: Math.round(totalLabor * 100) / 100,
    breakdown,
  };
}

function calculateDoorCost(
  properties: Record<string, any>,
  status: string,
  costs: Record<string, { unitCost: number; laborHours: number }>
): ElementCost {
  const doorType = properties.type || 'interior_single';
  const breakdown: Record<string, number> = {};
  let totalCost = 0;
  let totalLabor = 0;

  if (status === 'demo') {
    const demoCost = costs['demo_door_ea'];
    if (demoCost) {
      breakdown.demo = demoCost.unitCost;
      totalCost += breakdown.demo;
      totalLabor += demoCost.laborHours;
    }
  } else if (status === 'new') {
    // Door
    const doorCost = costs[`doors_${doorType}`];
    if (doorCost) {
      breakdown.door = doorCost.unitCost;
      totalCost += breakdown.door;
      totalLabor += doorCost.laborHours;
    }
    
    // Header
    const headerCost = costs['framing_header_6ft'];
    if (headerCost) {
      breakdown.framing = headerCost.unitCost;
      totalCost += breakdown.framing;
      totalLabor += headerCost.laborHours;
    }
  }

  return {
    cost: Math.round(totalCost * 100) / 100,
    laborHours: Math.round(totalLabor * 100) / 100,
    breakdown,
  };
}

// ... similar functions for windows, furniture
```

### 8.2 PM Data Aggregation

```typescript
// lib/costs/aggregator.ts

import { createClient } from '@/lib/supabase/server';

export interface PMSummary {
  costBreakdown: {
    demo: number;
    framing: number;
    electrical: number;
    plumbing: number;
    hvac: number;
    finishes: number;
    fixtures: number;
    furniture: number;
    contingency: number;
    total: number;
  };
  schedule: {
    phases: Array<{
      id: number;
      name: string;
      startWeek: number;
      durationWeeks: number;
    }>;
    totalWeeks: number;
    criticalPath: string[];
  };
  scope: {
    totalArea: number;
    newWalls: number;
    demoWalls: number;
    doors: { new: number; existing: number };
    windows: { new: number; existing: number };
  };
  resources: {
    laborHours: number;
    trades: string[];
  };
}

export async function aggregatePMData(projectId: string): Promise<PMSummary> {
  const supabase = createClient();
  
  // Get scene ID
  const { data: scene } = await supabase
    .from('scenes')
    .select('id')
    .eq('project_id', projectId)
    .single();
  
  if (!scene) {
    throw new Error('Scene not found');
  }
  
  // Get all elements
  const { data: elements } = await supabase
    .from('scene_elements')
    .select('*')
    .eq('scene_id', scene.id);
  
  if (!elements) {
    return getEmptyPMSummary();
  }
  
  // Get rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('project_id', projectId);
  
  // Aggregate costs
  const costBreakdown = aggregateCosts(elements);
  
  // Calculate schedule
  const schedule = calculateSchedule(elements);
  
  // Calculate scope
  const scope = calculateScope(elements, rooms || []);
  
  // Calculate resources
  const resources = calculateResources(elements);
  
  return {
    costBreakdown,
    schedule,
    scope,
    resources,
  };
}

function aggregateCosts(elements: any[]): PMSummary['costBreakdown'] {
  const breakdown = {
    demo: 0,
    framing: 0,
    electrical: 0,
    plumbing: 0,
    hvac: 0,
    finishes: 0,
    fixtures: 0,
    furniture: 0,
    contingency: 0,
    total: 0,
  };
  
  for (const el of elements) {
    const cost = el.cost || 0;
    
    if (el.status === 'demo') {
      breakdown.demo += cost;
    } else if (el.type === 'wall') {
      breakdown.framing += cost * 0.4;
      breakdown.finishes += cost * 0.6;
    } else if (el.type === 'door' || el.type === 'window') {
      breakdown.framing += cost * 0.3;
      breakdown.finishes += cost * 0.7;
    } else if (el.type === 'furniture') {
      breakdown.furniture += cost;
    } else if (el.type === 'fixture') {
      breakdown.fixtures += cost;
    }
  }
  
  // Calculate subtotal
  const subtotal = Object.values(breakdown).reduce((a, b) => a + b, 0);
  
  // Add contingency (10%)
  breakdown.contingency = subtotal * 0.10;
  breakdown.total = subtotal + breakdown.contingency;
  
  return breakdown;
}

function calculateSchedule(elements: any[]): PMSummary['schedule'] {
  const phases = [
    { id: 1, name: 'As-Built', startWeek: 0, durationWeeks: 0 },
    { id: 2, name: 'Demolition', startWeek: 1, durationWeeks: 0 },
    { id: 3, name: 'Rough-In', startWeek: 0, durationWeeks: 0 },
    { id: 4, name: 'Finishes', startWeek: 0, durationWeeks: 0 },
    { id: 5, name: 'Final', startWeek: 0, durationWeeks: 0 },
  ];
  
  // Calculate labor hours per phase
  const laborByPhase: Record<number, number> = {};
  for (const el of elements) {
    const phase = el.phase_id;
    laborByPhase[phase] = (laborByPhase[phase] || 0) + (el.labor_hours || 0);
  }
  
  // Convert labor hours to weeks (assume 40 hours/week, 2 workers)
  let currentWeek = 1;
  for (const phase of phases) {
    if (phase.id === 1) continue; // As-Built has no duration
    
    const labor = laborByPhase[phase.id] || 0;
    const weeks = Math.ceil(labor / 80) || 0; // 80 hours = 2 workers × 40 hours
    
    phase.startWeek = currentWeek;
    phase.durationWeeks = weeks;
    currentWeek += weeks;
  }
  
  return {
    phases,
    totalWeeks: currentWeek - 1,
    criticalPath: ['Demolition', 'Rough-In', 'Finishes'],
  };
}

function calculateScope(elements: any[], rooms: any[]): PMSummary['scope'] {
  let newWalls = 0;
  let demoWalls = 0;
  let newDoors = 0;
  let existingDoors = 0;
  let newWindows = 0;
  let existingWindows = 0;
  
  for (const el of elements) {
    if (el.type === 'wall') {
      const length = el.properties?.length || 0;
      if (el.status === 'demo') {
        demoWalls += length * 3.28084; // Convert to feet
      } else if (el.status === 'new') {
        newWalls += length * 3.28084;
      }
    } else if (el.type === 'door') {
      if (el.status === 'existing') existingDoors++;
      else newDoors++;
    } else if (el.type === 'window') {
      if (el.status === 'existing') existingWindows++;
      else newWindows++;
    }
  }
  
  const totalArea = rooms.reduce((sum, room) => sum + (room.area_sf || 0), 0);
  
  return {
    totalArea: Math.round(totalArea),
    newWalls: Math.round(newWalls),
    demoWalls: Math.round(demoWalls),
    doors: { new: newDoors, existing: existingDoors },
    windows: { new: newWindows, existing: existingWindows },
  };
}

function calculateResources(elements: any[]): PMSummary['resources'] {
  let totalLabor = 0;
  const tradesSet = new Set<string>();
  
  for (const el of elements) {
    totalLabor += el.labor_hours || 0;
    
    // Determine trades based on element type
    if (el.type === 'wall' || el.type === 'door' || el.type === 'window') {
      tradesSet.add('Framer');
      tradesSet.add('Drywaller');
      tradesSet.add('Painter');
    }
    if (el.type === 'fixture' && el.properties?.category === 'electrical') {
      tradesSet.add('Electrician');
    }
    if (el.type === 'fixture' && el.properties?.category === 'plumbing') {
      tradesSet.add('Plumber');
    }
  }
  
  return {
    laborHours: Math.round(totalLabor),
    trades: Array.from(tradesSet),
  };
}

function getEmptyPMSummary(): PMSummary {
  return {
    costBreakdown: {
      demo: 0, framing: 0, electrical: 0, plumbing: 0, hvac: 0,
      finishes: 0, fixtures: 0, furniture: 0, contingency: 0, total: 0,
    },
    schedule: { phases: [], totalWeeks: 0, criticalPath: [] },
    scope: {
      totalArea: 0, newWalls: 0, demoWalls: 0,
      doors: { new: 0, existing: 0 },
      windows: { new: 0, existing: 0 },
    },
    resources: { laborHours: 0, trades: [] },
  };
}
```

---

## Appendix: Environment Variables

```bash
# .env.local

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...

# LiveKit
LIVEKIT_API_KEY=API...
LIVEKIT_API_SECRET=...
NEXT_PUBLIC_LIVEKIT_URL=wss://xxx.livekit.cloud

# Python Backend
PYTHON_BACKEND_URL=https://programiq-backend.railway.app

# Anthropic (for AI)
ANTHROPIC_API_KEY=sk-ant-...

# Cesium (Tier 2)
NEXT_PUBLIC_CESIUM_ION_TOKEN=eyJ...
```
