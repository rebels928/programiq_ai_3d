# Setup Instructions - programiq_ai_3d

## Initial Repository Setup

```powershell
# Create new repo
cd D:\AI
mkdir programiq_ai_3d
cd programiq_ai_3d



# Initialize git
git init
git branch -M main

# Create GitHub repo (via GitHub.com or gh cli)
gh repo create programiq_ai_3d --private

# Initial commit
git add .
git commit -m "chore: initial Next.js setup"
git push -u origin main
```

## Copy Phase 0 Components

```powershell
# From old repo (D:\AI\programiq-v4)
Copy-Item D:\AI\programiq-v4\src\components\OSWindow.tsx .\src\components\
Copy-Item D:\AI\programiq-v4\src\components\Dock.tsx .\src\components\
Copy-Item D:\AI\programiq-v4\src\components\SystemTicker.tsx .\src\components\
Copy-Item D:\AI\programiq-v4\src\components\DockIcon.tsx .\src\components\
Copy-Item D:\AI\programiq-v4\src\components\AICore.tsx .\src\components\

# Copy docs
mkdir docs
Copy-Item D:\AI\programiq-v4\docs\* .\docs\
```

## Install Dependencies

```powershell
# Core
pnpm install

# 3D
pnpm add @react-three/fiber @react-three/drei @react-three/postprocessing three @types/three

# UI
pnpm add @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-tabs
pnpm add framer-motion
pnpm add lucide-react

# Auth
pnpm add @clerk/nextjs

# Database
pnpm add @supabase/supabase-js

# Utils
pnpm add zustand
pnpm add date-fns
```

## Environment Variables

```env
# .env.local

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# LiveKit (Phase 3+)
NEXT_PUBLIC_LIVEKIT_URL=wss://programiq-xxx.livekit.cloud
LIVEKIT_API_KEY=xxx
LIVEKIT_API_SECRET=xxx

# OpenAI (Phase 9+)
OPENAI_API_KEY=sk-xxx

# Anthropic (Phase 9+)
ANTHROPIC_API_KEY=sk-ant-xxx

# Google (Phase 9+)
GOOGLE_API_KEY=xxx

# Meshy (Phase 9+)
MESHY_API_KEY=xxx
```

## Git Branch Strategy

### Starting Each Phase

```powershell
# Phase 1
git checkout -b phase-1

# Work on landing page...
git add .
git commit -m "feat: add landing page"
git commit -m "feat: add dashboard grid"

# Test thoroughly
pnpm build
pnpm dev

# When complete, merge to main
git checkout main
git merge phase-1
git push origin main

# Keep phase-1 branch (for rollback)
git push origin phase-1
```

### If Phase Goes Wrong

```powershell
# Rollback to main
git checkout main

# Start phase over
git branch -D phase-2
git checkout -b phase-2
```

### Branch Naming

- `phase-1` - Landing + Dashboard
- `phase-2` - 3D Workspace
- `phase-3` - AI Chat
- `phase-4` - Model Generation
- `phase-5` - Part Selection
- `phase-6` - Materials
- `phase-7` - PM Billboards
- `phase-8` - Documents
- `phase-9` - Python Backend
- `phase-10` - Mobile
- `phase-11` - Polish

### Viewing Branch History

```powershell
# List all branches
git branch -a

# See branch commit history
git log --oneline --graph --all

# Compare branches
git diff main..phase-2
```

## Rollback Strategy

### If Current Phase Broken

```powershell
# Option 1: Revert last commit
git revert HEAD

# Option 2: Reset to previous commit
git reset --hard HEAD~1

# Option 3: Abandon phase, start over
git checkout main
git branch -D phase-X
git checkout -b phase-X
```

### If Need Previous Phase

```powershell
# Go back to Phase 1
git checkout phase-1

# Create new branch from there
git checkout -b phase-2-retry
```

## Documentation Location

```
D:\AI\programiq_ai_3d\
├── docs\
│   ├── CLAUDE_CONDENSED_3D_REVISED.md
│   ├── PHASE_PROMPTS_3D_COMPLETE.md
│   ├── ARCHITECTURE_OVERVIEW_3D.md
│   ├── PHASE_1_REVISED_LANDING_PAGE.md
│   └── PHASE_2_REVISED_3D_IMMERSIVE.md
```

## Claude Code Workflow (Each Session)

```
1. Checkout phase branch: git checkout -b phase-X
2. Paste CLAUDE_CONDENSED_3D_REVISED.md
3. Paste Phase X section from PHASE_PROMPTS_3D_COMPLETE.md
4. Build features
5. Test: pnpm build && pnpm dev
6. Commit: git commit -m "feat: xxx"
7. When phase done: merge to main, keep branch
```

## Testing Checklist (Before Merge)

```powershell
# Build passes
pnpm build

# Types check
pnpm tsc --noEmit

# Lint passes
pnpm lint

# Dev server works
pnpm dev
# Navigate through all routes
# Test all features added in phase

# If all pass → merge to main
```

## Backup Strategy

**GitHub:** All branches pushed (automatic backup)

**Local branches:** Keep all phase branches indefinitely

**Never delete branches** - they're your rollback points

---

Ready to start Phase 1!

```powershell
cd D:\AI\programiq_ai_3d
git checkout -b phase-1
code .
# Start Claude Code, paste Phase 1 instructions
```
