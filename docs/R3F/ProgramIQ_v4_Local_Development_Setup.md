# ProgramIQ v4 - Local Development Setup
## LiveKit + LangGraph with Cost-Optimized Models

---

## Local Testing Strategy

### Architecture for Local Development

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (localhost:3000)                   │
│  Next.js dev server with LiveKit client                     │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  │ WebSocket (local network)
                                  │
┌─────────────────────────────────▼───────────────────────────┐
│              LIVEKIT SERVER (localhost:7880)                 │
│  Docker container - handles WebRTC locally                   │
│  - STT: Deepgram (cloud API)                                │
│  - TTS: OpenAI TTS (cheap alternative to ElevenLabs)        │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  │ Agent Protocol (local)
                                  │
┌─────────────────────────────────▼───────────────────────────┐
│           PYTHON AGENT (localhost:8080)                      │
│  Running locally via `python main.py`                        │
│                                                               │
│  LangGraph with Model Router:                               │
│  ┌─────────────────────────────────────────────────┐       │
│  │  🔀 Smart Model Selection                       │       │
│  │                                                  │       │
│  │  GPT-4o-mini    → Simple text (chat, Q&A)      │       │
│  │  GPT-4o         → Complex reasoning (PM, EVM)  │       │
│  │  GPT-4-Vision   → Image analysis (designs)     │       │
│  │  Claude Sonnet  → Tool orchestration           │       │
│  └─────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────┘
                                  │
                                  │ API Calls
                                  │
┌─────────────────────────────────▼───────────────────────────┐
│              SUPABASE (local via Docker)                     │
│  postgresql://localhost:54322                                │
└───────────────────────────────────────────────────────────────┘
```

---

## Step 1: Local LiveKit Server Setup

### Install LiveKit Server (Docker)

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.9'

services:
  livekit:
    image: livekit/livekit-server:latest
    command: --config /etc/livekit.yaml
    ports:
      - "7880:7880"   # HTTP
      - "7881:7881"   # TURN/UDP
      - "7882:7882/tcp"  # TURN/TCP
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml
    environment:
      - LIVEKIT_KEYS=devkey: devsecret
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  supabase-db:
    image: supabase/postgres:15.1.0.117
    ports:
      - "54322:5432"
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
EOF
```

### LiveKit Configuration

```yaml
# livekit.yaml
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: false

keys:
  devkey: devsecret

redis:
  address: redis:6379

room:
  auto_create: true
  empty_timeout: 300
  max_participants: 100

logging:
  level: info
```

### Start Local Stack

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f livekit

# Verify LiveKit is running
curl http://localhost:7880
```

---

## Step 2: Cost-Optimized Model Selection

### Model Routing Strategy

```python
# agents/model_router.py
from enum import Enum
from typing import Literal

class ModelTier(Enum):
    """Model selection based on task complexity"""
    FAST = "gpt-4o-mini"           # $0.15/1M in, $0.60/1M out
    SMART = "gpt-4o"                # $2.50/1M in, $10/1M out
    VISION = "gpt-4o"               # Same as smart, with vision
    ORCHESTRATOR = "claude-sonnet-4" # $3/1M in, $15/1M out

class TaskType(Enum):
    """Task categories"""
    SIMPLE_CHAT = "simple_chat"           # Greetings, simple Q&A
    COMPLEX_REASONING = "complex"         # EVM, what-if, analysis
    IMAGE_ANALYSIS = "vision"             # Design review, photo analysis
    TOOL_ORCHESTRATION = "orchestration"  # Multi-step workflows

def select_model(task_type: TaskType) -> tuple[str, dict]:
    """
    Select the most cost-effective model for the task
    
    Returns:
        tuple of (model_name, model_kwargs)
    """
    
    if task_type == TaskType.SIMPLE_CHAT:
        # Use GPT-4o-mini for simple conversations
        # 16x cheaper than GPT-4o
        return "gpt-4o-mini", {
            "temperature": 0.7,
            "max_tokens": 500
        }
    
    elif task_type == TaskType.COMPLEX_REASONING:
        # Use GPT-4o for PM calculations, EVM, scenarios
        # Better at math and structured thinking
        return "gpt-4o", {
            "temperature": 0.3,
            "max_tokens": 2000
        }
    
    elif task_type == TaskType.IMAGE_ANALYSIS:
        # Use GPT-4o with vision for design review
        return "gpt-4o", {
            "temperature": 0.5,
            "max_tokens": 1500
        }
    
    elif task_type == TaskType.TOOL_ORCHESTRATION:
        # Use Claude for complex multi-tool workflows
        # Best at function calling and reasoning
        return "claude-sonnet-4-20250514", {
            "temperature": 0.5,
            "max_tokens": 4000
        }
    
    # Default to mini for safety
    return "gpt-4o-mini", {"temperature": 0.7}

def classify_task(message: str, has_images: bool = False) -> TaskType:
    """
    Classify user message into task type
    Uses GPT-4o-mini for classification (cheap)
    """
    from openai import OpenAI
    
    client = OpenAI()
    
    if has_images:
        return TaskType.IMAGE_ANALYSIS
    
    # Use mini to classify
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """Classify this message into ONE category:
                - simple_chat: Greetings, simple questions, casual conversation
                - complex: Math, analysis, calculations, what-if scenarios, PM metrics
                - orchestration: Multi-step requests requiring multiple tools
                
                Respond with ONLY the category name."""
            },
            {
                "role": "user",
                "content": message
            }
        ],
        temperature=0,
        max_tokens=20
    )
    
    category = response.choices[0].message.content.strip().lower()
    
    return {
        "simple_chat": TaskType.SIMPLE_CHAT,
        "complex": TaskType.COMPLEX_REASONING,
        "orchestration": TaskType.TOOL_ORCHESTRATION
    }.get(category, TaskType.SIMPLE_CHAT)
```

### Model Cost Comparison

```python
# Cost analysis per 1000 messages

# Scenario 1: Simple chat (avg 100 tokens in, 150 out)
# GPT-4o-mini: (0.1 × $0.15) + (0.15 × $0.60) = $0.105 per 1K msgs
# GPT-4o:      (0.1 × $2.50) + (0.15 × $10.0) = $1.75 per 1K msgs
# Savings: 94% cheaper with mini

# Scenario 2: Complex reasoning (avg 500 tokens in, 1000 out)
# GPT-4o-mini: (0.5 × $0.15) + (1.0 × $0.60) = $0.675 per 1K msgs
# GPT-4o:      (0.5 × $2.50) + (1.0 × $10.0) = $11.25 per 1K msgs
# BUT: GPT-4o gives MUCH better reasoning, worth the cost

# Scenario 3: Tool orchestration (avg 1000 tokens in, 2000 out)
# Claude:      (1.0 × $3.00) + (2.0 × $15.0) = $33.00 per 1K msgs
# Best at function calling, worth the premium for complex workflows

# Monthly cost estimate (100 projects, 10 sessions each = 1000 sessions)
# Assuming 60% simple, 30% complex, 10% orchestration:
# - Simple (600 sessions × 20 msgs × $0.105/1K): $1.26
# - Complex (300 sessions × 20 msgs × $11.25/1K): $67.50
# - Orchestration (100 sessions × 20 msgs × $33/1K): $66.00
# TOTAL: ~$135/month for AI
```

---

## Step 3: Python Agent Server (Local Development)

### Project Structure

```
agent-server/
├── main.py                      # Entry point
├── requirements.txt
├── .env.local
├── agents/
│   ├── __init__.py
│   ├── model_router.py          # NEW: Smart model selection
│   ├── orchestrator.py          # LangGraph workflow
│   ├── design_agent.py
│   ├── pm_agent.py
│   └── scene_agent.py
├── tools/
│   ├── __init__.py
│   ├── scene_tools.py
│   ├── data_tools.py
│   ├── analysis_tools.py
│   ├── design_tools.py
│   ├── ikea_tools.py
│   └── vision_tools.py          # NEW: GPT-4 Vision integration
└── tests/
    ├── test_model_router.py
    └── test_agents.py
```

### Requirements

```txt
# requirements.txt
# LiveKit
livekit==0.11.0
livekit-agents==0.8.0
livekit-plugins-deepgram==0.6.0
livekit-plugins-openai==0.7.0

# LangGraph
langgraph==0.2.0
langchain==0.3.0
langchain-openai==0.2.0
langchain-anthropic==0.2.0
langchain-community==0.3.0

# OpenAI (for GPT-4o, GPT-4o-mini, GPT-4-Vision, TTS)
openai==1.52.0

# Database
supabase==2.9.0
psycopg2-binary==2.9.9

# Utilities
python-dotenv==1.0.0
httpx==0.27.0
pillow==10.4.0  # For image processing
```

### Environment Variables

```bash
# .env.local

# LiveKit (local)
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret

# OpenAI (for GPT-4o, GPT-4o-mini, Vision, TTS)
OPENAI_API_KEY=sk-your-key-here

# Anthropic (for Claude orchestration)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deepgram (for STT)
DEEPGRAM_API_KEY=your-deepgram-key

# Supabase (local)
SUPABASE_URL=http://localhost:54322
SUPABASE_ANON_KEY=your-local-anon-key

# Design APIs
GOOGLE_API_KEY=your-google-key  # Nano Banana
MESHY_API_KEY=your-meshy-key

# Debug
LOG_LEVEL=DEBUG
```

### Main Entry Point with Model Router

```python
# main.py
import asyncio
import os
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai as lk_openai

from agents.orchestrator import create_agent_graph
from agents.model_router import select_model, classify_task, TaskType

load_dotenv('.env.local')

async def entrypoint(ctx: JobContext):
    """Main entry point for LiveKit agent"""
    
    print(f"🚀 Agent starting for room: {ctx.room.name}")
    
    # Get project context
    metadata = ctx.job.metadata or {}
    project_id = metadata.get('project_id', 'default')
    
    print(f"📁 Project ID: {project_id}")
    
    # Create LangGraph workflow with model router
    agent_graph = create_agent_graph(project_id)
    
    # Initialize voice assistant with CHEAP TTS
    assistant = VoiceAssistant(
        vad=rtc.VAD.from_options(
            min_silence_duration=0.5,  # 500ms of silence to detect end
        ),
        stt=deepgram.STT(
            model="nova-2",  # Best accuracy
        ),
        llm=LangGraphAdapter(agent_graph),
        tts=lk_openai.TTS(
            model="tts-1",  # OpenAI TTS - $15/1M chars (vs ElevenLabs $120/1M)
            voice="alloy"   # Natural voice
        ),
    )
    
    # Start assistant
    print("🎤 Voice assistant starting...")
    assistant.start(ctx.room)
    
    # Initial greeting
    await assistant.say(
        "Hi! I'm your AI assistant for this project. "
        "I can help you generate designs, manage costs, or control the 3D view. "
        "What would you like to do?"
    )
    
    print("✅ Assistant ready!")
    
    # Keep alive
    await asyncio.sleep(float('inf'))


class LangGraphAdapter(llm.LLM):
    """Adapter to use LangGraph with LiveKit"""
    
    def __init__(self, graph):
        self.graph = graph
        self.conversation_id = None
    
    async def chat(
        self,
        history: list[llm.ChatMessage],
        **kwargs
    ) -> llm.ChatChunk:
        """Process message through LangGraph with smart model selection"""
        
        # Get latest user message
        user_message = next(
            (msg for msg in reversed(history) if msg.role == "user"),
            None
        )
        
        if not user_message:
            return self._create_chunk("I didn't catch that. Could you repeat?")
        
        # Check for images (GPT-4 Vision)
        has_images = any(
            isinstance(content, dict) and content.get("type") == "image_url"
            for msg in history
            for content in (msg.content if isinstance(msg.content, list) else [])
        )
        
        # Classify task to select model
        task_type = classify_task(user_message.content, has_images)
        
        print(f"🔍 Task classified as: {task_type.value}")
        
        # Convert to LangGraph format
        messages = [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in history
        ]
        
        # Run through LangGraph with selected model
        result = await self.graph.ainvoke({
            "messages": messages,
            "conversation_id": self.conversation_id or str(uuid.uuid4()),
            "task_type": task_type
        })
        
        # Extract response
        response_text = result["messages"][-1]["content"]
        
        print(f"💬 Response ({len(response_text)} chars): {response_text[:100]}...")
        
        return self._create_chunk(response_text)
    
    def _create_chunk(self, text: str) -> llm.ChatChunk:
        """Helper to create response chunk"""
        return llm.ChatChunk(
            choices=[
                llm.Choice(
                    delta=llm.ChoiceDelta(
                        content=text,
                        role="assistant"
                    )
                )
            ]
        )


if __name__ == "__main__":
    print("🎬 Starting LiveKit Agent Server (Local Dev)")
    print(f"📡 LiveKit URL: {os.getenv('LIVEKIT_URL')}")
    print(f"🔑 API Key: {os.getenv('LIVEKIT_API_KEY')}")
    
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
```

### Updated Orchestrator with Model Router

```python
# agents/orchestrator.py
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Annotated, Optional
from langchain_core.messages import add_messages
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

from agents.model_router import select_model, TaskType
from agents.design_agent import DesignAgent
from agents.pm_agent import PMAgent
from agents.scene_agent import SceneAgent

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    project_id: str
    current_phase: int
    conversation_id: str
    task_type: TaskType
    next_action: Optional[str]
    context: dict

def create_agent_graph(project_id: str):
    """Create LangGraph workflow with smart model selection"""
    
    # Initialize specialized agents
    design_agent = DesignAgent()
    pm_agent = PMAgent()
    scene_agent = SceneAgent()
    
    # Create graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("classify", classify_and_route)
    workflow.add_node("simple_response", handle_simple_chat)
    workflow.add_node("design", design_agent.run)
    workflow.add_node("pm", pm_agent.run)
    workflow.add_node("scene", scene_agent.run)
    workflow.add_node("respond", generate_response)
    
    # Routing logic
    def route_after_classify(state: AgentState) -> str:
        intent = state.get("next_action", "simple")
        
        if intent == "design":
            return "design"
        elif intent == "pm":
            return "pm"
        elif intent == "scene":
            return "scene"
        else:
            return "simple_response"
    
    # Add edges
    workflow.add_conditional_edges(
        "classify",
        route_after_classify,
        {
            "design": "design",
            "pm": "pm",
            "scene": "scene",
            "simple_response": "simple_response"
        }
    )
    
    workflow.add_edge("design", "respond")
    workflow.add_edge("pm", "respond")
    workflow.add_edge("scene", "respond")
    workflow.add_edge("simple_response", "respond")
    workflow.add_edge("respond", END)
    
    workflow.set_entry_point("classify")
    
    # Compile with memory
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)


async def classify_and_route(state: AgentState) -> AgentState:
    """Classify intent using GPT-4o-mini (cheap and fast)"""
    
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI()
    
    last_message = state["messages"][-1]["content"]
    
    # Use mini for classification (super cheap)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """Classify user intent into ONE category:
                - design: Generate designs, search IKEA, create concepts
                - pm: Budget, schedule, costs, risks, EVM, what-if scenarios
                - scene: 3D view, camera, phase switching, visibility
                - simple: Greetings, questions, general conversation
                
                Respond with ONLY the category name."""
            },
            {
                "role": "user",
                "content": last_message
            }
        ],
        temperature=0,
        max_tokens=10
    )
    
    intent = response.choices[0].message.content.strip().lower()
    state["next_action"] = intent
    
    print(f"🎯 Intent classified as: {intent}")
    
    return state


async def handle_simple_chat(state: AgentState) -> AgentState:
    """Handle simple conversations with GPT-4o-mini (cheapest)"""
    
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI()
    
    # Use mini for simple chat (94% cheaper than GPT-4o)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": f"""You are a helpful AI assistant for an AEC project.
                
Project ID: {state.get('project_id')}
Current Phase: {state.get('current_phase', 1)}

Be friendly and concise. You help with design, project management, and 3D visualization."""
            }
        ] + state["messages"],
        temperature=0.7,
        max_tokens=300
    )
    
    # Add response to messages
    state["messages"].append({
        "role": "assistant",
        "content": response.choices[0].message.content
    })
    
    return state


async def generate_response(state: AgentState) -> AgentState:
    """
    Generate final response
    Uses the appropriate model based on task complexity
    """
    
    # If already responded by specialist agent, just return
    if state["messages"][-1]["role"] == "assistant":
        return state
    
    # Otherwise, use model router to select appropriate model
    task_type = state.get("task_type", TaskType.SIMPLE_CHAT)
    model_name, model_kwargs = select_model(task_type)
    
    print(f"🤖 Using {model_name} for final response")
    
    if "gpt" in model_name:
        from openai import AsyncOpenAI
        client = AsyncOpenAI()
        
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": f"""You are an AI assistant for AEC projects.
                    
Project: {state.get('project_id')}
Phase: {state.get('current_phase', 1)}

Provide clear, helpful responses."""
                }
            ] + state["messages"],
            **model_kwargs
        )
        
        response_text = response.choices[0].message.content
    
    else:  # Claude
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic()
        
        response = await client.messages.create(
            model=model_name,
            messages=state["messages"],
            **model_kwargs
        )
        
        response_text = response.content[0].text
    
    state["messages"].append({
        "role": "assistant",
        "content": response_text
    })
    
    return state
```

### Vision Tools (GPT-4 Vision)

```python
# tools/vision_tools.py
from langchain_core.tools import tool
from openai import AsyncOpenAI
import base64
from typing import Optional

@tool
async def analyze_design_image(
    image_url: str,
    prompt: str = "Analyze this architectural design"
) -> dict:
    """
    Analyze a design image using GPT-4 Vision
    
    Args:
        image_url: URL or base64 image
        prompt: What to analyze
    
    Returns:
        Analysis results
    """
    client = AsyncOpenAI()
    
    response = await client.chat.completions.create(
        model="gpt-4o",  # Has vision capabilities
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        }
                    }
                ]
            }
        ],
        max_tokens=1000
    )
    
    analysis = response.choices[0].message.content
    
    return {
        "analysis": analysis,
        "image_url": image_url
    }

@tool
async def compare_design_concepts(
    image_url_1: str,
    image_url_2: str,
    comparison_criteria: str = "style, cost, functionality"
) -> dict:
    """
    Compare two design concepts using GPT-4 Vision
    
    Args:
        image_url_1: First design
        image_url_2: Second design
        comparison_criteria: What to compare
    
    Returns:
        Comparison results
    """
    client = AsyncOpenAI()
    
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Compare these two architectural designs based on: {comparison_criteria}"
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url_1}
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url_2}
                    }
                ]
            }
        ],
        max_tokens=1500
    )
    
    comparison = response.choices[0].message.content
    
    return {
        "comparison": comparison,
        "designs": [image_url_1, image_url_2]
    }

@tool
async def extract_materials_from_image(image_url: str) -> dict:
    """
    Extract materials and finishes from a design image
    
    Args:
        image_url: Design image
    
    Returns:
        Detected materials
    """
    client = AsyncOpenAI()
    
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Analyze this design and list:
                        1. Materials (cabinets, countertops, floors)
                        2. Colors and finishes
                        3. Approximate quantities
                        
                        Format as JSON."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }
        ],
        max_tokens=800
    )
    
    materials = response.choices[0].message.content
    
    return {
        "materials": materials,
        "image_url": image_url
    }
```

---

## Step 4: Local Frontend Setup

### Install Dependencies

```bash
cd your-nextjs-app

# LiveKit client
pnpm add @livekit/components-react livekit-client

# Pusher (for scene events)
pnpm add pusher-js
```

### Environment Variables (Frontend)

```bash
# .env.local

# LiveKit (local)
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880

# Pusher (optional for local, can use WebSocket instead)
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Supabase (local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54322
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-key
```

### API Route for LiveKit Token

```typescript
// app/api/livekit/token/route.ts
import { AccessToken } from 'livekit-server-sdk'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { projectId, userId } = await req.json()

  // LOCAL DEV: Use simple credentials
  const apiKey = 'devkey'
  const apiSecret = 'devsecret'

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId || 'user-' + Math.random().toString(36).substring(7),
    metadata: JSON.stringify({ projectId })
  })

  at.addGrant({
    room: `project-${projectId}`,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true
  })

  const token = at.toJwt()

  console.log('🎫 Generated LiveKit token for project:', projectId)

  return Response.json({ token })
}
```

---

## Step 5: Running the Full Stack Locally

### Terminal 1: Start Docker Services

```bash
# Start LiveKit + Supabase
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Terminal 2: Start Python Agent

```bash
cd agent-server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run agent
python main.py

# You should see:
# 🎬 Starting LiveKit Agent Server (Local Dev)
# 📡 LiveKit URL: ws://localhost:7880
# 🔑 API Key: devkey
# ✅ Worker ready!
```

### Terminal 3: Start Next.js Frontend

```bash
cd your-nextjs-app

# Start dev server
pnpm dev

# Open http://localhost:3000
```

---

## Step 6: Testing Voice Interactions

### Test Script

```python
# tests/test_voice_flow.py
import asyncio
from livekit import api, rtc

async def test_voice_connection():
    """Test basic voice connection"""
    
    # Generate token
    token = AccessToken('devkey', 'devsecret', {
        'identity': 'test-user'
    })
    token.add_grant({
        'room': 'test-room',
        'roomJoin': True
    })
    
    # Connect
    room = rtc.Room()
    
    await room.connect('ws://localhost:7880', token.to_jwt())
    
    print("✅ Connected to LiveKit!")
    
    # Disconnect
    await room.disconnect()

if __name__ == "__main__":
    asyncio.run(test_voice_connection())
```

### Manual Testing Checklist

```bash
# 1. Test simple chat (GPT-4o-mini)
User: "Hello!"
Expected: Quick response, cheap model

# 2. Test design generation (GPT-4o + tools)
User: "Generate a modern kitchen design"
Expected: Calls Nano Banana, Meshy, shows 3D model

# 3. Test PM analysis (GPT-4o)
User: "What's my budget variance?"
Expected: Calculates EVM, detailed analysis

# 4. Test scene control (Claude + tools)
User: "Show me Phase 3"
Expected: Changes 3D view, explains what's visible

# 5. Test vision analysis (GPT-4 Vision)
User: [uploads image] "Analyze this kitchen design"
Expected: Detailed material/style analysis
```

---

## Cost Comparison: Local vs Cloud

### Local Development
```
✅ FREE during development
✅ No LiveKit Cloud fees
✅ No egress charges
✅ Only pay for API calls (OpenAI, Anthropic)
✅ Faster iteration (no deploy delays)
```

### Cloud Production
```
💰 LiveKit Cloud: $99/month
💰 Railway/Render: $20/month
💰 API usage same as local
🚀 Global CDN
🚀 99.9% uptime
🚀 Auto-scaling
```

---

## TTS Cost Comparison

### OpenAI TTS (Recommended for MVP)
```
Model: tts-1
Cost: $15 per 1M characters
Quality: Good (natural, clear)
Latency: ~200ms
Languages: 57

Example:
- 15 min session × 150 words/min = 2,250 words
- ~11,250 characters
- Cost: $0.17 per session
```

### ElevenLabs (Premium - Defer to Production)
```
Pro Plan: $22/month for 100K chars
Cost: ~$220 per 1M characters (14x more expensive)
Quality: Excellent (very natural)
Latency: ~300ms
Languages: 29

Example:
- Same 11,250 characters
- Cost: $2.48 per session
```

**Recommendation:** Use OpenAI TTS for MVP, upgrade to ElevenLabs if customers demand it.

---

## Debugging Tips

### Check LiveKit Connection

```bash
# From agent server logs
grep "Connected to LiveKit" logs.txt

# From frontend console
localStorage.setItem('livekit-debug', '*')
```

### Monitor Model Selection

```python
# In agents/model_router.py, add logging:

@functools.wraps(select_model)
def logged_select_model(*args, **kwargs):
    result = select_model(*args, **kwargs)
    print(f"📊 Model selected: {result[0]} for task: {args[0]}")
    return result
```

### Test Individual Components

```bash
# Test Deepgram STT
python tests/test_deepgram.py

# Test OpenAI TTS
python tests/test_openai_tts.py

# Test Nano Banana
python tests/test_nano_banana.py

# Test LangGraph routing
python tests/test_orchestrator.py
```

---

## Next Steps After Local Testing

1. ✅ **Verify all features work locally**
2. ✅ **Measure actual model usage costs**
3. ✅ **Optimize model selection thresholds**
4. ✅ **Test with real voice (not just text)**
5. → **Deploy to Railway (agent) + Vercel (frontend)**
6. → **Switch to LiveKit Cloud**
7. → **Monitor production costs**
8. → **Optimize based on usage patterns**

---

## Summary: Cost-Optimized Local Stack

**Models:**
- GPT-4o-mini: Simple chat (94% cheaper)
- GPT-4o: Complex reasoning + Vision
- Claude Sonnet: Tool orchestration

**Voice:**
- STT: Deepgram ($0.0043/min)
- TTS: OpenAI tts-1 ($15/1M chars)
- Infrastructure: FREE locally (Docker)

**Estimated costs per session (15 min):**
- Models: $0.30 (with smart routing)
- STT: $0.07
- TTS: $0.17
- **Total: ~$0.54 per session** (vs $2.34 with ElevenLabs)

You can now test everything locally before spending a penny on cloud infrastructure!
