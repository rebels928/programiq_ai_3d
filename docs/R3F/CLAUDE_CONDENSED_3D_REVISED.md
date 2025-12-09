# CLAUDE.md - Essential Rules (3D Architecture)

**⚠️ READ THIS FIRST**

---

## 🚫 NEVER DO WITHOUT PERMISSION

1. **Creating files** → ASK FIRST
2. **Installing packages** → ASK FIRST (use `pnpm`)
3. **Git commits** → ASK, wait for test, USER says "commit and push", THEN execute
4. **Modifying globals.css** → NEVER change theme variables
5. **Using local services** → We use LiveKit Cloud + Supabase Cloud

---



---

## ✅ Session Workflow

1. User pastes phase prompt
2. Read docs listed in phase
3. Ask: "Which task first?"
4. Plan → get approval
5. Before creating files → ASK
6. Build → test: `pnpm build`, `pnpm dev`
7. Report completion → ASK about commit
8. User: "commit and push" → EXECUTE git commands

---

## 🎨 3D Architecture Rules

**Core Pattern:**
- Landing: Split-screen (marketing + 3D preview)
- Dashboard: Traditional grid
- Project workspace: Full 3D immersive

**3D Scene Structure:**
```tsx
<Canvas>
  <OrbitControls />
  <BuildingModel url={project.modelUrl} />
  <Billboard position={[-8, 3, 0]}>
    <BudgetCard />
  </Billboard>
  {/* More billboards */}
</Canvas>
```

**UI Overlays:**
- Top-left: Project name + phase controls
- Top-right: User menu
- Bottom: Dock with AICore
- Left slide-in: AI Chat
- Right slide-in: Part customization

**Never:**
- ❌ Traditional panel layouts
- ❌ Complex resize systems
- ❌ Floating windows

---

## 💾 Cloud Services

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://programiq-xxx.livekit.cloud
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
```

---

## 🎯 Code Standards

**TypeScript:** Always, strict types, no `any`  
**Styling:** Tailwind + `glass-panel`/`glass-dock` utilities  
**Animations:** Framer Motion  
**3D:** React Three Fiber + Drei  
**Imports:** Use `@/` alias  

```tsx
// ✅ Good
interface Props {
  title: string
  onClick: () => void
}

export function Component({ title, onClick }: Props) {
  return <div className="glass-panel">{title}</div>
}
```

---

## 🏗️ Architecture Layers

1. **Landing** → Marketing + 3D preview
2. **Dashboard** → Project grid (traditional UI)
3. **3D Workspace** → Full immersive
   - Building model (center)
   - Billboards (PM data)
   - Dock (navigation)
   - Chat panel (slide-in)
   - Part library (slide-in)

4. **Voice Pipeline:** STT → LangGraph → TTS (LiveKit)
5. **Model Generation:** Nano Banana → Meshy.ai → .glb
6. **Storage:** Supabase (metadata + .glb URLs)

---



---

## 🆘 When Stuck

```markdown
"⚠️ Stuck on [ISSUE]
Tried: [attempts]
Need: [specific help]"
```

---

## 📚 Reference Docs

- Full CLAUDE.md (detailed rules)
- Phase prompts (step-by-step)
- Design docs in `docs\`

**Last Updated:** December 2, 2025  
**Architecture:** 3D Immersive Workspace
