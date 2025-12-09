# Leva Debug Panel & Model Import System

## Overview

Added comprehensive debugging controls and flexible model import system to the 3D workspace.

---

## 1. Leva Debug Panel

**Location:** `src/app/project/[id]/page.tsx`

### Features

#### Lighting Controls
- **Ambient Intensity:** 0-2 (step 0.1)
- **Directional Intensity:** 0-5 (step 0.1)
- **Directional Color:** Color picker
- **Light Position:** [x, y, z] vector
- **Shadows:** On/Off toggle

#### Camera Controls
- **FOV:** 20-120° (step 1)
- **Near Plane:** 0.01-1 (step 0.01)
- **Far Plane:** 100-5000 (step 100)
- **Auto Rotate:** On/Off toggle
- **Auto Rotate Speed:** 0-10 (step 0.1)

#### Model Controls
- **Scale:** 0.1-5 (step 0.1)
- **Rotation X/Y/Z:** -π to π (step 0.01)
- **Wireframe Mode:** On/Off toggle

#### Environment Presets
Dropdown selector with options:
- sunset, dawn, night, warehouse
- forest, apartment, studio, city
- park, lobby

### Usage

The Leva panel appears in the top-right corner when viewing `/project/[id]`. All controls update in real-time.

```tsx
// Example: Access Leva controls
const lighting = useControls('Lighting', {
  ambientIntensity: { value: 0.3, min: 0, max: 2, step: 0.1 },
  // ...
})
```

---

## 2. Model Import System

**Component:** `src/components/project/ModelImport.tsx`

### Import Methods

#### A. File Upload
- **Supported formats:** `.gltf`, `.glb`
- **Max size:** 100MB
- **Storage:** Supabase Storage
- **Cost:** Standard Supabase storage rates

#### B. External URL
- **Supported sources:** Google Drive, Dropbox, any public URL
- **Formats:** `.gltf`, `.glb`
- **Storage:** No storage (loads directly)
- **Cost:** $0 (no storage fees)

### Database Schema

**Table:** `projects`

New columns:
```sql
model_source TEXT CHECK (model_source IN ('upload', 'url'))
model_url TEXT
```

**Migration file:** `docs/database/projects_table_migration.sql`

### API Routes

#### POST `/api/upload-model`
Handles file uploads to Supabase Storage.

**Request:**
```
FormData {
  file: File (.gltf or .glb)
  projectId: string
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://supabase.co/storage/.../model.gltf",
  "message": "Model uploaded successfully"
}
```

#### POST `/api/save-model-url`
Saves external URL to database.

**Request:**
```json
{
  "projectId": "uuid",
  "modelUrl": "https://example.com/model.gltf",
  "source": "url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Model URL saved successfully"
}
```

---

## 3. Implementation Details

### Supabase Setup Required

The API routes contain placeholder code. To enable full functionality:

1. **Install Supabase client:**
   ```bash
   pnpm add @supabase/supabase-js
   ```

2. **Set environment variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   ```

3. **Run database migration:**
   - Go to Supabase SQL Editor
   - Execute `docs/database/projects_table_migration.sql`

4. **Create storage bucket:**
   - Go to Supabase Storage
   - Create bucket named `models`
   - Set to public or private as needed

5. **Uncomment Supabase code in API routes:**
   - `src/app/api/upload-model/route.ts`
   - `src/app/api/save-model-url/route.ts`

### External URL Tips

For Google Drive:
1. Upload file to Drive
2. Right-click → Get link
3. Set to "Anyone with the link"
4. Use direct download URL format:
   ```
   https://drive.google.com/uc?export=download&id=FILE_ID
   ```

For Dropbox:
- Change `?dl=0` to `?dl=1` in share link

---

## 4. Usage Example

### Using ModelImport Component

```tsx
import { ModelImport } from '@/components/project/ModelImport'

function MyPage() {
  const handleModelUploaded = (url: string, source: 'upload' | 'url') => {
    console.log(`Model loaded from ${source}: ${url}`)
    // Update project with new model URL
  }

  return (
    <ModelImport
      projectId="project-uuid"
      onModelUploaded={handleModelUploaded}
    />
  )
}
```

---

## 5. Testing

### Test Leva Panel
```bash
pnpm dev
```
Navigate to `/project/1` and interact with Leva controls in top-right.

### Test Model Import
1. Go to project settings/import page
2. Try file upload with a .gltf file
3. Try external URL with a public model URL

---

## 6. Future Enhancements

- [ ] Model thumbnail generation
- [ ] Progress bar for large uploads
- [ ] Model validation (vertex count, file integrity)
- [ ] Multiple models per project (component library)
- [ ] Model versioning (history of uploads)
- [ ] Batch import from ZIP files
- [ ] IKEA API integration for furniture models

---

## Files Created/Modified

### Created:
- `src/components/project/ModelImport.tsx` - Import component
- `src/app/api/upload-model/route.ts` - Upload API
- `src/app/api/save-model-url/route.ts` - URL save API
- `docs/database/projects_table_migration.sql` - DB schema
- `docs/LEVA_AND_MODEL_IMPORT.md` - This file

### Modified:
- `src/app/project/[id]/page.tsx` - Added Leva controls
- `package.json` - Added leva dependency

---

## Build Status

✅ Build successful
✅ TypeScript checks passed
✅ All routes created
✅ Database schema documented
