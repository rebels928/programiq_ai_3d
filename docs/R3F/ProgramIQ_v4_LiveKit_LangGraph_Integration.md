# ProgramIQ v4 - LiveKit + LangGraph Integration
## Adding Enterprise Voice AI to the AEC Design Copilot

---

## Architecture Overview

### Current v4 Stack (What We Have)
```
Frontend:
- Next.js 16 + React
- MacOS-style UI (glass morphism)
- React Three Fiber (3D viewer)
- Nano Banana (text → image)
- Meshy.ai (image → 3D)

Backend:
- Supabase (database)
- Clerk (auth)
- Claude API (document generation, health checks)
```

### NEW: LiveKit + LangGraph Layer

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  ┌────────────────┐         ┌──────────────────────────┐   │
│  │  AI Chat UI    │────────▶│  LiveKit Client          │   │
│  │  (Text + Voice)│         │  - Voice Activity        │   │
│  │                │◀────────│  - Audio Streaming       │   │
│  └────────────────┘         └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      │ WebSocket
                                      │
┌─────────────────────────────────────▼─────────────────────────┐
│                  LIVEKIT CLOUD (SaaS)                         │
│  - Handles WebRTC connections                                 │
│  - Audio routing and mixing                                   │
│  - Automatic STT (Speech-to-Text)                            │
│  - Automatic TTS (Text-to-Speech)                            │
└─────────────────────────────────────┬─────────────────────────┘
                                      │
                                      │ Agent Protocol
                                      │
┌─────────────────────────────────────▼─────────────────────────┐
│              PYTHON AGENT SERVER (Railway/Render)             │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              LangGraph Agent Orchestrator           │     │
│  │                                                      │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │     │
│  │  │ Design Agent │  │  PM Agent    │  │ 3D Agent │ │     │
│  │  │              │  │              │  │          │ │     │
│  │  │ - Nano Banana│  │ - Cost calc  │  │ - Scene  │ │     │
│  │  │ - Meshy API  │  │ - Schedule   │  │   tools  │ │     │
│  │  │ - IKEA search│  │ - EVM        │  │ - Camera │ │     │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │     │
│  │                                                      │     │
│  │  All agents use Claude API (Anthropic)              │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                   Agent Tools                        │     │
│  │  - scene_tools: Modify 3D scene, change phase       │     │
│  │  - data_tools: Query Supabase, get project data     │     │
│  │  - analysis_tools: Calculate EVM, run what-if       │     │
│  │  - export_tools: Generate docs, create reports      │     │
│  │  - ikea_tools: Search products, add to phase        │     │
│  └─────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
                                      │
                                      │ API Calls
                                      │
┌─────────────────────────────────────▼─────────────────────────┐
│                     SUPABASE (Database)                        │
│  - Projects, Phases, Costs, Tasks                             │
│  - Conversation history                                        │
│  - Health check results                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## Why LiveKit + LangGraph?

### Problems with Simple Voice (Web Speech API)

❌ **Limited capabilities:**
- Browser-only (no server-side processing)
- No conversation context
- Can't use tools
- No interruption handling
- Limited to simple commands

❌ **Not scalable:**
- Can't share conversation across devices
- No conversation memory
- Can't integrate with project data

### Benefits of LiveKit + LangGraph

✅ **Enterprise-grade voice:**
- Professional STT (Deepgram quality)
- Natural TTS (ElevenLabs quality)
- Low latency (<500ms)
- Interruption handling
- Cross-device sync

✅ **Agentic capabilities:**
- Conversation context maintained
- Can use tools (modify 3D scene, query data)
- Multi-step reasoning
- Proactive suggestions

✅ **Scalability:**
- Handles 1000+ concurrent users
- Cloud infrastructure (no server management)
- Usage-based pricing

---

## LiveKit Architecture

### Components

**1. LiveKit Cloud (SaaS)**
- Managed infrastructure
- WebRTC media routing
- Automatic transcription (STT)
- Speech synthesis (TTS)
- No server setup required

**2. LiveKit Agents (Python)**
- Runs on Railway/Render/Fly.io
- Connects to LiveKit Cloud
- Processes voice → runs LangGraph → responds

**3. LiveKit Client SDK (Frontend)**
- React hooks
- Voice activity detection
- Audio visualization
- Connection management

---

## LangGraph Agent Design

### Agent Graph Structure

```python
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic

# State definition
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    project_id: str
    current_phase: int
    context: dict
    next_action: Optional[str]

# Initialize Claude
llm = ChatAnthropic(
    model="claude-sonnet-4-20250514",
    temperature=0.7
)

# Define the graph
workflow = StateGraph(AgentState)

# Nodes
workflow.add_node("understand", understand_intent)
workflow.add_node("design_agent", design_agent)
workflow.add_node("pm_agent", pm_agent)
workflow.add_node("scene_agent", scene_agent)
workflow.add_node("respond", generate_response)

# Edges (routing logic)
workflow.add_conditional_edges(
    "understand",
    route_to_specialist,
    {
        "design": "design_agent",
        "project_management": "pm_agent",
        "3d_scene": "scene_agent",
        "general": "respond"
    }
)

workflow.add_edge("design_agent", "respond")
workflow.add_edge("pm_agent", "respond")
workflow.add_edge("scene_agent", "respond")
workflow.add_edge("respond", END)

# Set entry point
workflow.set_entry_point("understand")

# Compile
app = workflow.compile()
```

### Agent Specializations

**1. Design Agent**
- Handles: "Generate a kitchen design", "Show me rustic style"
- Tools:
  - `generate_nano_banana(prompt)` → Creates image
  - `convert_to_3d(image_url)` → Meshy API
  - `search_ikea(query)` → Find furniture
  - `add_to_project(design_id)` → Save to Supabase

**2. PM Agent**
- Handles: "What's my budget?", "Are we on schedule?"
- Tools:
  - `calculate_evm(project_id)` → CPI, SPI, EAC
  - `get_critical_path()` → Schedule analysis
  - `run_what_if(scenario)` → Scenario simulation
  - `generate_health_check()` → AI Doctor analysis

**3. Scene Agent**
- Handles: "Show me Phase 3", "Rotate the model", "Zoom into the kitchen"
- Tools:
  - `set_phase(phase_number)` → Change active phase
  - `set_camera_position(x, y, z)` → Move camera
  - `toggle_visibility(element_ids)` → Show/hide elements
  - `get_element_info(element_id)` → Query 3D object data

**4. General Agent**
- Handles: Questions, clarifications, general chat
- No tools - just conversation

---

## Frontend Integration

### 1. LiveKit Client Setup

```typescript
// lib/livekit.ts
import { 
  Room, 
  RoomEvent, 
  Track,
  LiveKitRoom,
  useVoiceAssistant,
  VoiceAssistantState
} from '@livekit/components-react'
import '@livekit/components-styles'

export function useLiveKitVoice(projectId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<Message[]>([])

  const { state, audioTrack } = useVoiceAssistant()

  // Generate LiveKit token
  async function connect() {
    const response = await fetch('/api/livekit/token', {
      method: 'POST',
      body: JSON.stringify({ projectId })
    })
    
    const { token } = await response.json()
    return token
  }

  return {
    connect,
    disconnect,
    isConnected,
    isSpeaking,
    transcript,
    state
  }
}
```

### 2. Voice-Enabled Chat Component

```typescript
// components/chat/VoiceChat.tsx
'use client'

import { useLiveKitVoice } from '@/lib/livekit'
import { LiveKitRoom } from '@livekit/components-react'

export function VoiceChat({ projectId }: { projectId: string }) {
  const [token, setToken] = useState<string>()
  const [messages, setMessages] = useState<Message[]>([])
  const [isVoiceActive, setIsVoiceActive] = useState(false)

  // Get LiveKit token
  useEffect(() => {
    async function getToken() {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({ projectId })
      })
      const { token } = await response.json()
      setToken(token)
    }
    getToken()
  }, [projectId])

  if (!token) return <Loader2 className="animate-spin" />

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={isVoiceActive}
      audio={true}
      video={false}
      onConnected={() => console.log('Connected to LiveKit')}
      onDisconnected={() => setIsVoiceActive(false)}
    >
      <div className="flex flex-col h-full">
        {/* Messages (shows both text and voice) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => (
            <ChatMessage 
              key={msg.id}
              message={msg}
              showMode={true} // Shows 🎤 for voice, ⌨️ for text
            />
          ))}
          
          {/* Voice Activity Indicator */}
          <VoiceActivityIndicator />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex gap-2">
            <Input
              placeholder="Type or speak..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSend()}
              disabled={isVoiceActive}
              className="flex-1"
            />

            {/* Voice Toggle */}
            <Button
              size="icon"
              variant={isVoiceActive ? "destructive" : "default"}
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className="gap-2"
            >
              {isVoiceActive ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>

            {/* Send (text only) */}
            <Button 
              onClick={handleTextSend}
              disabled={!textInput.trim() || isVoiceActive}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </LiveKitRoom>
  )
}
```

### 3. Voice Activity Indicator

```typescript
// components/chat/VoiceActivityIndicator.tsx
import { useVoiceAssistant } from '@livekit/components-react'

export function VoiceActivityIndicator() {
  const { state, audioTrack } = useVoiceAssistant()

  return (
    <AnimatePresence>
      {state === 'listening' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30"
        >
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-500 animate-ping" />
          </div>
          <span className="text-sm font-medium text-cyan-500">
            Listening...
          </span>
        </motion.div>
      )}

      {state === 'thinking' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
        >
          <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
          <span className="text-sm font-medium text-yellow-500">
            Thinking...
          </span>
        </motion.div>
      )}

      {state === 'speaking' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
        >
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="w-1 bg-green-500 rounded-full"
                animate={{ height: [4, 16, 4] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-green-500">
            Speaking...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Backend: Python Agent Server

### Project Structure

```
agent-server/
├── main.py                    # FastAPI server + LiveKit agent
├── agents/
│   ├── __init__.py
│   ├── design_agent.py        # Design generation
│   ├── pm_agent.py            # Project management
│   ├── scene_agent.py         # 3D scene control
│   └── orchestrator.py        # LangGraph workflow
├── tools/
│   ├── __init__.py
│   ├── scene_tools.py         # 3D manipulation
│   ├── data_tools.py          # Supabase queries
│   ├── analysis_tools.py      # EVM, what-if
│   ├── design_tools.py        # Nano Banana, Meshy
│   └── ikea_tools.py          # IKEA catalog
├── requirements.txt
└── railway.toml               # Deployment config
```

### Main Agent Server

```python
# main.py
import asyncio
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, elevenlabs, openai
from agents.orchestrator import create_agent_graph

# Initialize LLM (Claude via LangChain)
from langchain_anthropic import ChatAnthropic

claude = ChatAnthropic(
    model="claude-sonnet-4-20250514",
    anthropic_api_key=os.getenv("ANTHROPIC_API_KEY")
)

async def entrypoint(ctx: JobContext):
    """Main entry point for LiveKit agent"""
    
    # Get project context from metadata
    metadata = ctx.job.room.metadata
    project_id = metadata.get('project_id')
    
    # Create LangGraph workflow
    agent_graph = create_agent_graph(project_id)
    
    # Initialize voice assistant
    assistant = VoiceAssistant(
        vad=rtc.VAD.from_options(
            # Voice Activity Detection
            min_silence_duration=0.5,
        ),
        stt=deepgram.STT(),  # Speech-to-Text
        llm=create_llm_adapter(agent_graph),  # Our LangGraph
        tts=elevenlabs.TTS(),  # Text-to-Speech
    )
    
    # Start assistant
    assistant.start(ctx.room)
    
    # Initial greeting
    await assistant.say(
        f"Hi! I'm your AI assistant for this project. "
        f"I can help you generate designs, manage costs, "
        f"or control the 3D view. What would you like to do?"
    )
    
    # Keep connection alive
    await asyncio.sleep(float('inf'))

def create_llm_adapter(agent_graph):
    """Wrap LangGraph in LiveKit LLM interface"""
    
    class LangGraphLLM(llm.LLM):
        def __init__(self, graph):
            self.graph = graph
            self.conversation_id = str(uuid.uuid4())
        
        async def chat(
            self,
            history: list[llm.ChatMessage],
            **kwargs
        ) -> llm.ChatChunk:
            # Convert LiveKit messages to LangGraph format
            messages = [
                {"role": msg.role, "content": msg.content}
                for msg in history
            ]
            
            # Run LangGraph
            result = await self.graph.ainvoke({
                "messages": messages,
                "conversation_id": self.conversation_id
            })
            
            # Return response
            response_text = result["messages"][-1]["content"]
            return llm.ChatChunk(
                choices=[
                    llm.Choice(
                        delta=llm.ChoiceDelta(
                            content=response_text,
                            role="assistant"
                        )
                    )
                ]
            )
    
    return LangGraphLLM(agent_graph)

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
```

### LangGraph Orchestrator

```python
# agents/orchestrator.py
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Annotated, Optional
from langchain_core.messages import add_messages
from agents.design_agent import DesignAgent
from agents.pm_agent import PMAgent
from agents.scene_agent import SceneAgent

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    project_id: str
    current_phase: int
    conversation_id: str
    next_action: Optional[str]
    context: dict

def create_agent_graph(project_id: str):
    """Create the LangGraph workflow"""
    
    # Initialize agents
    design_agent = DesignAgent()
    pm_agent = PMAgent()
    scene_agent = SceneAgent()
    
    # Create graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("understand", understand_intent)
    workflow.add_node("design", design_agent.run)
    workflow.add_node("pm", pm_agent.run)
    workflow.add_node("scene", scene_agent.run)
    workflow.add_node("respond", generate_response)
    
    # Routing logic
    def route_to_specialist(state: AgentState) -> str:
        last_message = state["messages"][-1]["content"]
        
        # Use Claude to classify intent
        from langchain_anthropic import ChatAnthropic
        
        classifier = ChatAnthropic(model="claude-sonnet-4-20250514")
        
        result = classifier.invoke([
            {
                "role": "system",
                "content": """Classify user intent into one of:
                - design: Generate designs, styles, concepts, IKEA furniture
                - pm: Budget, schedule, costs, risks, what-if scenarios
                - scene: 3D view, camera, phase switching, visibility
                - general: Questions, clarifications, chat
                
                Respond with only the category name."""
            },
            {
                "role": "user",
                "content": last_message
            }
        ])
        
        intent = result.content.strip().lower()
        
        # Map to node names
        return {
            "design": "design",
            "pm": "pm",
            "scene": "scene",
            "general": "respond"
        }.get(intent, "respond")
    
    # Add conditional edges
    workflow.add_conditional_edges(
        "understand",
        route_to_specialist,
        {
            "design": "design",
            "pm": "pm",
            "scene": "scene",
            "general": "respond"
        }
    )
    
    # All specialist nodes go to respond
    workflow.add_edge("design", "respond")
    workflow.add_edge("pm", "respond")
    workflow.add_edge("scene", "respond")
    workflow.add_edge("respond", END)
    
    # Set entry point
    workflow.set_entry_point("understand")
    
    # Add memory
    memory = MemorySaver()
    
    # Compile and return
    return workflow.compile(checkpointer=memory)

async def understand_intent(state: AgentState) -> AgentState:
    """Extract context from user message"""
    # Add project_id if not present
    if "project_id" not in state:
        state["project_id"] = "default"
    
    return state

async def generate_response(state: AgentState) -> AgentState:
    """Generate final response using Claude"""
    from langchain_anthropic import ChatAnthropic
    
    llm = ChatAnthropic(model="claude-sonnet-4-20250514")
    
    # Get conversation history
    messages = state["messages"]
    
    # Add system context
    system_msg = {
        "role": "system",
        "content": f"""You are an AI assistant for an AEC project management platform.
        
Project ID: {state.get('project_id')}
Current Phase: {state.get('current_phase', 1)}

You help with:
- Design generation (Nano Banana + Meshy)
- Project management (budget, schedule, risks)
- 3D scene control (camera, phases, visibility)

Be concise and helpful. If you've used tools, explain what was done."""
    }
    
    # Generate response
    response = llm.invoke([system_msg] + messages)
    
    # Add to messages
    state["messages"].append({
        "role": "assistant",
        "content": response.content
    })
    
    return state
```

### Design Agent with Tools

```python
# agents/design_agent.py
from langchain_core.tools import tool
from tools.design_tools import generate_nano_banana, convert_to_3d
from tools.ikea_tools import search_ikea_products

class DesignAgent:
    def __init__(self):
        self.tools = [
            generate_design_tool,
            search_furniture_tool,
            add_to_project_tool
        ]
    
    async def run(self, state: AgentState) -> AgentState:
        """Run design generation workflow"""
        from langchain_anthropic import ChatAnthropic
        
        llm = ChatAnthropic(
            model="claude-sonnet-4-20250514"
        ).bind_tools(self.tools)
        
        # Get user message
        user_message = state["messages"][-1]["content"]
        
        # Invoke with tools
        response = llm.invoke([
            {
                "role": "system",
                "content": """You are a design specialist. Use your tools to:
                1. Generate design concepts with Nano Banana + Meshy
                2. Search IKEA for matching furniture
                3. Add designs to the project
                
                Always explain what you're doing."""
            },
            {
                "role": "user",
                "content": user_message
            }
        ])
        
        # Execute tool calls if present
        if response.tool_calls:
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                
                # Execute tool
                if tool_name == "generate_design":
                    result = await generate_design_tool.ainvoke(tool_args)
                elif tool_name == "search_furniture":
                    result = await search_furniture_tool.ainvoke(tool_args)
                elif tool_name == "add_to_project":
                    result = await add_to_project_tool.ainvoke(tool_args)
                
                # Add result to context
                state["context"][tool_name] = result
        
        # Add assistant response
        state["messages"].append({
            "role": "assistant",
            "content": response.content
        })
        
        return state

@tool
async def generate_design_tool(prompt: str, style: str) -> dict:
    """Generate a design concept using Nano Banana and Meshy
    
    Args:
        prompt: Description of the design (e.g., "Modern kitchen with island")
        style: Style preference (e.g., "modern", "rustic", "industrial")
    
    Returns:
        dict with image_url, model_url, thumbnail
    """
    # Step 1: Generate image with Nano Banana
    image_url = await generate_nano_banana(f"{prompt}, {style} style")
    
    # Step 2: Convert to 3D with Meshy
    model_data = await convert_to_3d(image_url)
    
    return {
        "image_url": image_url,
        "model_url": model_data["glbUrl"],
        "thumbnail": model_data["thumbnailUrl"],
        "prompt": prompt,
        "style": style
    }

@tool
async def search_furniture_tool(query: str, category: str, max_price: int) -> list:
    """Search IKEA catalog for furniture
    
    Args:
        query: Search query (e.g., "white cabinets")
        category: Product category (e.g., "cabinets", "countertops")
        max_price: Maximum price in USD
    
    Returns:
        list of matching products
    """
    products = await search_ikea_products(query, category, max_price)
    return products

@tool
async def add_to_project_tool(project_id: str, design_id: str, phase: int) -> dict:
    """Add a design to the project
    
    Args:
        project_id: Project ID
        design_id: Design concept ID
        phase: Which phase to add to (1-5)
    
    Returns:
        Success message
    """
    from tools.data_tools import add_design_to_project
    
    result = await add_design_to_project(project_id, design_id, phase)
    return result
```

### PM Agent with Tools

```python
# agents/pm_agent.py
from langchain_core.tools import tool
from tools.analysis_tools import calculate_evm, run_what_if_scenario

class PMAgent:
    def __init__(self):
        self.tools = [
            get_budget_tool,
            calculate_evm_tool,
            run_scenario_tool,
            get_critical_path_tool
        ]
    
    async def run(self, state: AgentState) -> AgentState:
        """Run PM analysis"""
        # Similar structure to DesignAgent
        # but with PM-focused tools
        pass

@tool
async def calculate_evm_tool(project_id: str) -> dict:
    """Calculate Earned Value Management metrics
    
    Args:
        project_id: Project ID
    
    Returns:
        dict with CPI, SPI, EAC, VAC
    """
    evm = await calculate_evm(project_id)
    return {
        "cpi": evm.cpi,
        "spi": evm.spi,
        "eac": evm.eac,
        "vac": evm.vac,
        "status": "on_track" if evm.cpi >= 1 and evm.spi >= 1 else "at_risk"
    }

@tool
async def run_scenario_tool(
    project_id: str,
    scenario_name: str,
    delay_days: int,
    additional_cost: float
) -> dict:
    """Run a what-if scenario
    
    Args:
        project_id: Project ID
        scenario_name: Name for this scenario
        delay_days: Number of days delayed
        additional_cost: Extra cost incurred
    
    Returns:
        Scenario analysis with new EVM metrics
    """
    result = await run_what_if_scenario(
        project_id,
        scenario_name,
        delay_days,
        additional_cost
    )
    return result
```

### Scene Agent with Tools

```python
# agents/scene_agent.py
from langchain_core.tools import tool

class SceneAgent:
    def __init__(self):
        self.tools = [
            set_phase_tool,
            set_camera_tool,
            toggle_visibility_tool
        ]
    
    async def run(self, state: AgentState) -> AgentState:
        """Control 3D scene"""
        pass

@tool
async def set_phase_tool(project_id: str, phase: int) -> dict:
    """Switch to a different construction phase
    
    Args:
        project_id: Project ID
        phase: Phase number (1-5)
    
    Returns:
        Confirmation message
    """
    # Emit event to frontend via WebSocket
    await emit_scene_event(project_id, {
        "type": "set_phase",
        "phase": phase
    })
    
    return {
        "success": True,
        "message": f"Switched to Phase {phase}",
        "phase": phase
    }

@tool
async def set_camera_tool(
    project_id: str,
    x: float,
    y: float,
    z: float
) -> dict:
    """Move the 3D camera
    
    Args:
        project_id: Project ID
        x, y, z: Camera position coordinates
    
    Returns:
        Confirmation
    """
    await emit_scene_event(project_id, {
        "type": "set_camera",
        "position": [x, y, z]
    })
    
    return {
        "success": True,
        "message": f"Camera moved to ({x}, {y}, {z})"
    }
```

---

## API Routes (Next.js)

### Generate LiveKit Token

```typescript
// app/api/livekit/token/route.ts
import { AccessToken } from 'livekit-server-sdk'

export async function POST(req: Request) {
  const { projectId, userId } = await req.json()

  // Create access token
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: userId,
      metadata: JSON.stringify({ projectId })
    }
  )

  // Grant permissions
  at.addGrant({
    room: `project-${projectId}`,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true
  })

  // Return token
  return Response.json({
    token: at.toJwt()
  })
}
```

### Scene Event Handler

```typescript
// app/api/scene-events/route.ts
import { NextRequest } from 'next/server'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!
})

export async function POST(req: NextRequest) {
  const { projectId, event } = await req.json()

  // Broadcast to frontend
  await pusher.trigger(
    `project-${projectId}`,
    'scene-update',
    event
  )

  return Response.json({ success: true })
}
```

### Listen for Scene Events (Frontend)

```typescript
// hooks/useSceneEvents.ts
import { useEffect } from 'react'
import Pusher from 'pusher-js'

export function useSceneEvents(
  projectId: string,
  onEvent: (event: any) => void
) {
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.PUSHER_CLUSTER!
    })

    const channel = pusher.subscribe(`project-${projectId}`)
    
    channel.bind('scene-update', (event: any) => {
      onEvent(event)
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [projectId, onEvent])
}
```

---

## Deployment

### Python Agent Server (Railway)

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python main.py"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "livekit-agent"
```

### Environment Variables

```bash
# LiveKit
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# STT/TTS providers
DEEPGRAM_API_KEY=your_deepgram_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Pusher (for scene events)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=us2

# Design tools
GOOGLE_API_KEY=your_google_key  # Nano Banana
MESHY_API_KEY=your_meshy_key
```

---

## Pricing & Cost Analysis

### LiveKit Cloud Pricing

**Free Tier:**
- 10,000 participant minutes/month
- Good for ~166 hours of usage

**Standard Plan ($99/month):**
- 200,000 participant minutes
- ~3,333 hours of usage
- Egress: 500GB included

**Cost per user:**
- Average session: 15 minutes
- 200,000 mins ÷ 15 = ~13,333 sessions/month
- Cost per session: $99 ÷ 13,333 = $0.0074

### Voice Provider Costs

**Deepgram STT:**
- $0.0043/minute (Nova-2 model)
- 15 min session = $0.065

**ElevenLabs TTS:**
- $0.18/1000 characters
- ~150 words/min spoken = ~750 chars
- 15 min × 750 = 11,250 chars
- Cost: $2.03 per session

**Total Voice Cost per 15-min session:**
- LiveKit: $0.01
- Deepgram STT: $0.07
- ElevenLabs TTS: $2.03
- **Total: ~$2.11**

### Claude API Costs

**Per session (15 min, ~10 exchanges):**
- Input: ~5K tokens × 10 = 50K tokens
- Output: ~500 tokens × 10 = 5K tokens
- Cost: (50K × $3/M) + (5K × $15/M) = $0.15 + $0.08 = **$0.23**

### Total Cost per Session

- Voice (LiveKit + STT + TTS): $2.11
- Claude API: $0.23
- **Total: ~$2.34 per 15-min voice session**

### With Your Pricing

**Tier 3 ($2,999)** includes voice AI:
- Assume 10 voice sessions during project (2.5 hours total)
- Cost: 10 × $2.34 = $23.40
- Plus Nano Banana/Meshy: ~$5
- **Total cost: ~$28.40**
- **Margin: 99%** ($2,999 - $28.40 = $2,970.60)

---

## Updated 8-Week Build Plan with LiveKit

### Week 1-2: Core + 3D + LiveKit Setup
```
✅ Nano Banana + Meshy (existing)
✅ R3F viewer (existing)
✅ Phase animation (existing)
✅ LiveKit Cloud account setup
✅ Python agent server skeleton
✅ Basic LangGraph workflow
✅ Test voice connection
```

### Week 3: LangGraph Agents + Tools
```
✅ Design Agent (Nano Banana, Meshy, IKEA tools)
✅ PM Agent (EVM, what-if, health check tools)
✅ Scene Agent (phase, camera, visibility tools)
✅ Agent routing logic
✅ Tool execution
```

### Week 4: Frontend Voice Integration
```
✅ LiveKit client hooks
✅ Voice-enabled chat UI
✅ Voice activity indicators
✅ Text + Voice unified interface
✅ Scene event listener (Pusher)
```

### Week 5: What-If + IKEA + Daily Updates
```
✅ What-If scenario builder (existing)
✅ IKEA integration (existing)
✅ Daily updates (now voice works via LiveKit!)
✅ Photo uploads
```

### Week 6: Document Generation
```
✅ SOW, Contract, Takeoff, Schedule, Risks (existing)
✅ Google Earth integration (existing)
```

### Week 7: AI Health Checks + Scene Control
```
✅ Nightly health check cron (existing)
✅ Voice-controlled scene manipulation
✅ Test: "Show me Phase 3" → scene changes
✅ Test: "What's my budget variance?" → PM agent responds
```

### Week 8: Polish + Deploy
```
✅ Deploy Python agent to Railway
✅ Test end-to-end voice flow
✅ Mobile responsive
✅ Beta test with 3 clients
```

---

## Example Voice Interactions

### Design Flow
```
User: "Generate a modern farmhouse kitchen with an island"
AI: "I'll create that for you. Generating a modern farmhouse kitchen concept..."
    [calls generate_design_tool]
AI: "Here's your design! I've generated 5 variations. Would you like me to search IKEA for matching white cabinets?"
User: "Yes, find cabinets under $500"
AI: [calls search_furniture_tool]
    "I found 8 IKEA cabinet options. The SEKTION series fits your budget. Should I add these to Phase 5?"
```

### PM Flow
```
User: "What's my current budget status?"
AI: [calls calculate_evm_tool]
    "Your project is slightly over budget. CPI is 0.94, meaning you're spending $1.06 for every dollar of work. You've spent $47,800 of your $45,000 budget. Would you like me to run a what-if scenario to see the impact of finishing on time?"
User: "Yes, what if we're delayed 5 days?"
AI: [calls run_scenario_tool]
    "With a 5-day delay, your total cost increases to $51,200, putting you 14% over budget. The completion date moves to October 28th. I recommend reviewing Phase 3 to identify cost savings."
```

### Scene Control Flow
```
User: "Show me what Phase 3 looks like"
AI: [calls set_phase_tool with phase=3]
    "Switching to Phase 3: Mechanical Rough-In. You can see the electrical wiring and plumbing being installed. Would you like me to zoom in on any specific area?"
User: "Zoom into the kitchen island area"
AI: [calls set_camera_tool]
    "Zooming in on the kitchen island. You can see the electrical outlets and plumbing connections for the sink."
```

---

## Summary: What LiveKit + LangGraph Adds

### Before (Simple Voice)
❌ Browser-only transcription  
❌ No context retention  
❌ Can't use tools  
❌ No agentic behavior  
❌ Text and voice separate  

### After (LiveKit + LangGraph)
✅ Professional STT/TTS (Deepgram + ElevenLabs)  
✅ Full conversation context  
✅ Agentic tool use (design generation, PM analysis, scene control)  
✅ Unified text + voice interface  
✅ Cross-device sync  
✅ Scalable to 1000+ users  

### Competitive Advantage
- **Procore/Buildertrend:** No voice AI at all
- **Generic AI tools:** Can't control 3D scene or generate designs
- **You:** Voice-controlled design generation + PM + 3D manipulation

---

This is the complete LiveKit + LangGraph integration for ProgramIQ v4!
