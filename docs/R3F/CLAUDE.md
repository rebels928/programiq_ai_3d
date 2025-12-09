# CLAUDE.md

**Repository:** D:\AI\programiq_ai_3d  
**Branch per phase:** phase-1, phase-2, etc.

---

## Rules

1. **Never** create files, install packages, or commit without asking first
2. Use `pnpm` (frontend), `uv` (Python backend)
3. Windows PowerShell commands
4. Ask before modifying globals.css
5. LiveKit Cloud + Supabase Cloud (not local)

## Workflow Each Session

1. User pastes Phase X section below
2. Read docs listed in that phase
3. Ask which task first
4. Get approval before creating files
5. Test: `pnpm build && pnpm dev`
6. Ask before committing
7. User says "commit and push" → execute

## Git Per Phase

```bash
git checkout -b phase-X
# work...
git commit -m "feat: xyz"
# when done:
git checkout main
git merge phase-X
git push origin main
```
