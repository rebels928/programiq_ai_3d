# ProgramIQ v4 - Asset Pipeline & Babylon Editor Workflow

**Version:** 1.0  
**Date:** December 8, 2025  
**Purpose:** Internal asset preparation using Babylon Editor

---

## Overview

Babylon Editor is used **internally by platform administrators** to prepare assets before they appear in the customer-facing ProgramIQ Configurator. Customers never interact with Babylon Editor directly.

### User Role Separation

| Tool | User | Purpose |
|------|------|---------|
| **Babylon Editor** | Platform Admin (You) | Asset prep, scene templates, material library |
| **ProgramIQ Configurator** | GCs, Architects, Designers | Configure projects with pre-built assets |
| **Client Viewer** | Homeowners, Clients | View-only, comment, approve |

---

## Asset Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ASSET PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STAGE 1: Source Assets                                                     │
│  ─────────────────────                                                      │
│  • IKEA 3D models (.glb from IKEA website)                                 │
│  • SketchFab downloads                                                      │
│  • Custom modeled assets                                                    │
│  • Door/window manufacturer models                                          │
│                                                                             │
│                              ▼                                              │
│                                                                             │
│  STAGE 2: Babylon Editor (Your Workstation)                                │
│  ──────────────────────────────────────────                                │
│  • Import raw .glb/.fbx/.obj                                               │
│  • Optimize geometry (reduce polygons if needed)                           │
│  • Set up PBR materials                                                     │
│  • Configure LOD (Level of Detail)                                         │
│  • Add collision/bounding boxes                                            │
│  • Attach metadata (cost, dimensions, category)                            │
│  • Test rendering quality                                                   │
│  • Export optimized .glb                                                    │
│                                                                             │
│                              ▼                                              │
│                                                                             │
│  STAGE 3: R2 Storage (Cloud)                                               │
│  ───────────────────────────                                               │
│  • Upload to Cloudflare R2 bucket                                          │
│  • Organize in folder structure                                            │
│  • Update catalog.json manifest                                            │
│                                                                             │
│                              ▼                                              │
│                                                                             │
│  STAGE 4: ProgramIQ Configurator (Customer-Facing)                         │
│  ─────────────────────────────────────────────────                         │
│  • Assets appear in catalog browser                                        │
│  • Customers place assets via click or voice                               │
│  • Costs auto-calculate from metadata                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Babylon Editor Setup

### Installation

```bash
# Option 1: Desktop App (Recommended)
# Download from: https://editor.babylonjs.com/

# Option 2: Run from source
git clone https://github.com/BabylonJS/Editor.git
cd Editor
npm install
npm run start
```

### Project Configuration

Create a Babylon Editor project for ProgramIQ asset management:

```
babylon-editor-workspace/
├── assets/
│   ├── raw/                    # Unprocessed source files
│   │   ├── furniture/
│   │   ├── doors/
│   │   └── windows/
│   └── processed/              # Ready for export
│       ├── furniture/
│       ├── doors/
│       └── windows/
├── materials/
│   ├── wood/
│   ├── paint/
│   ├── tile/
│   └── metal/
├── templates/
│   ├── empty-room.babylon
│   ├── studio-apartment.babylon
│   └── office-space.babylon
└── project.editorproject        # Babylon Editor project file
```

---

## Asset Preparation Workflow

### Step 1: Import Raw Asset

1. Open Babylon Editor
2. File → Import Mesh
3. Select source file (.glb, .fbx, .obj)
4. Asset appears in scene

### Step 2: Geometry Optimization

**Target Performance:**
- Furniture: < 10,000 triangles
- Doors/Windows: < 5,000 triangles
- Simple fixtures: < 2,000 triangles

**In Babylon Editor:**
1. Select mesh
2. Inspector → Geometry
3. Apply decimation if needed
4. Remove unnecessary internal geometry

### Step 3: Material Setup

**PBR Material Configuration:**

```
Material Properties:
├── Albedo (Base Color)
│   └── Use texture or solid color
├── Metallic
│   └── 0.0 for wood/fabric, 0.8+ for metal
├── Roughness
│   └── 0.3 for polished, 0.8 for matte
├── Normal Map (optional)
│   └── Adds surface detail
└── Ambient Occlusion (optional)
    └── Adds depth in crevices
```

**In Babylon Editor:**
1. Select mesh
2. Inspector → Material
3. Create new PBR Material
4. Configure properties
5. Assign textures from `/materials/` folder

### Step 4: Metadata Attachment

Add custom metadata for the configurator:

```json
{
  "programiq": {
    "category": "furniture",
    "subcategory": "seating",
    "name": "IKEA POÄNG Armchair",
    "sku": "ikea-poang-001",
    "cost": 149,
    "labor_hours": 0.25,
    "dimensions": {
      "width": 0.68,
      "depth": 0.82,
      "height": 1.0
    },
    "placement": {
      "floor_mounted": true,
      "wall_mounted": false,
      "clearance_front": 0.5,
      "clearance_sides": 0.1
    },
    "phases": [4, 5],
    "tags": ["living-room", "bedroom", "office", "accent-chair"]
  }
}
```

**In Babylon Editor:**
1. Select mesh
2. Inspector → Metadata
3. Add JSON metadata
4. Save

### Step 5: LOD Configuration (Optional)

For complex assets, set up Level of Detail:

```
LOD Levels:
├── LOD0: Full detail (< 5m distance)
├── LOD1: 50% triangles (5-15m distance)
└── LOD2: 25% triangles (> 15m distance)
```

### Step 6: Export

1. Select processed mesh
2. File → Export → glTF/GLB
3. Settings:
   - Format: GLB (binary)
   - Include: Geometry, Materials, Metadata
   - Compression: Draco (if supported)
4. Export to `processed/[category]/[name].glb`

---

## R2 Storage Structure

### Bucket: `programiq-assets`

```
programiq-assets/
├── catalog.json                    # Master catalog manifest
├── furniture/
│   ├── catalog.json               # Category manifest
│   ├── seating/
│   │   ├── ikea-poang-armchair.glb
│   │   ├── ikea-poang-armchair-thumb.jpg
│   │   ├── ikea-ektorp-sofa.glb
│   │   └── ikea-ektorp-sofa-thumb.jpg
│   ├── tables/
│   ├── storage/
│   ├── beds/
│   └── office/
├── doors/
│   ├── catalog.json
│   ├── interior/
│   │   ├── single-panel.glb
│   │   ├── double-panel.glb
│   │   └── pocket-door.glb
│   └── exterior/
│       ├── entry-single.glb
│       └── sliding-glass.glb
├── windows/
│   ├── catalog.json
│   ├── double-hung.glb
│   ├── casement.glb
│   └── sliding.glb
├── materials/
│   ├── catalog.json
│   ├── wood/
│   │   ├── oak.json
│   │   ├── oak-diffuse.jpg
│   │   ├── oak-normal.jpg
│   │   └── oak-roughness.jpg
│   ├── paint/
│   └── tile/
├── hdri/
│   ├── interior-warm.hdr
│   ├── interior-cool.hdr
│   └── suburban.hdr
└── templates/
    ├── empty-room.glb
    ├── studio-apartment.glb
    └── lighting-preset-day.json
```

### Catalog Manifest Format

**Root catalog.json:**
```json
{
  "version": "1.0",
  "updated_at": "2025-12-08T00:00:00Z",
  "categories": [
    {
      "id": "furniture",
      "name": "Furniture",
      "icon": "sofa",
      "subcategories": ["seating", "tables", "storage", "beds", "office"]
    },
    {
      "id": "doors",
      "name": "Doors",
      "icon": "door-open",
      "subcategories": ["interior", "exterior"]
    },
    {
      "id": "windows",
      "name": "Windows",
      "icon": "grid",
      "subcategories": []
    }
  ]
}
```

**Category catalog.json (furniture/catalog.json):**
```json
{
  "category": "furniture",
  "items": [
    {
      "id": "ikea-poang-armchair",
      "name": "IKEA POÄNG Armchair",
      "subcategory": "seating",
      "model_url": "furniture/seating/ikea-poang-armchair.glb",
      "thumbnail_url": "furniture/seating/ikea-poang-armchair-thumb.jpg",
      "cost": 149,
      "dimensions": { "width": 0.68, "depth": 0.82, "height": 1.0 },
      "tags": ["living-room", "bedroom", "accent-chair"],
      "phases": [4, 5]
    }
  ]
}
```

---

## Scene Templates

### Purpose

Pre-configured scenes that customers can start from, with:
- Default lighting setup
- Ground plane
- Camera presets
- Environment settings

### Creating a Template in Babylon Editor

1. **New Scene**
   - File → New Project

2. **Set Up Lighting**
   ```
   Lights:
   ├── HemisphericLight (ambient)
   │   └── Intensity: 0.3
   ├── DirectionalLight (sun)
   │   └── Intensity: 1.0
   │   └── Position: (10, 20, 10)
   │   └── Shadows: Enabled
   └── PointLight (fill, optional)
       └── Intensity: 0.2
   ```

3. **Set Up Camera Presets**
   ```json
   {
     "camera_presets": [
       {
         "name": "Overview",
         "type": "arc_rotate",
         "alpha": 0.785,
         "beta": 1.047,
         "radius": 15,
         "target": [0, 1, 0]
       },
       {
         "name": "Top Down",
         "type": "arc_rotate",
         "alpha": 0,
         "beta": 0,
         "radius": 20,
         "target": [0, 0, 0]
       },
       {
         "name": "Eye Level",
         "type": "arc_rotate",
         "alpha": 0.785,
         "beta": 1.57,
         "radius": 8,
         "target": [0, 1.6, 0]
       }
     ]
   }
   ```

4. **Set Up Environment**
   - Add HDRI skybox
   - Configure fog (optional)
   - Set default time of day

5. **Export as Template**
   - File → Export → Babylon Scene
   - Save to `templates/[name].babylon`

---

## Material Library

### Pre-Built Material Categories

| Category | Examples | Use Cases |
|----------|----------|-----------|
| Wood | Oak, Walnut, Pine, Bamboo | Flooring, furniture, trim |
| Paint | Whites, Grays, Colors | Walls, ceilings |
| Tile | Ceramic, Porcelain, Stone | Bathrooms, kitchens |
| Metal | Brushed Steel, Chrome, Brass | Fixtures, hardware |
| Fabric | Cotton, Velvet, Leather | Furniture upholstery |
| Stone | Marble, Granite, Concrete | Countertops, floors |

### Material Definition Format

**materials/wood/oak.json:**
```json
{
  "id": "wood-oak",
  "name": "Oak Wood",
  "category": "wood",
  "pbr": {
    "albedo_texture": "wood/oak-diffuse.jpg",
    "normal_texture": "wood/oak-normal.jpg",
    "roughness_texture": "wood/oak-roughness.jpg",
    "metallic": 0.0,
    "roughness": 0.6
  },
  "tiling": {
    "u": 2,
    "v": 2
  },
  "cost_per_sf": 8.50,
  "tags": ["flooring", "furniture", "natural"]
}
```

### Creating Materials in Babylon Editor

1. **Gather Textures**
   - Diffuse/Albedo map
   - Normal map
   - Roughness map (or metallic-roughness combined)

2. **Create PBR Material**
   - Materials panel → Add PBR Material
   - Assign textures
   - Adjust metallic/roughness values
   - Set UV tiling

3. **Test on Sample Geometry**
   - Apply to cube/plane
   - Check lighting response
   - Verify at different distances

4. **Export Material Definition**
   - Save material as JSON
   - Export textures to R2

---

## Quality Checklist

### Before Uploading Any Asset

- [ ] **Geometry**
  - [ ] Triangle count within limits
  - [ ] No inverted normals
  - [ ] Clean topology (no overlapping vertices)
  - [ ] Proper UV mapping

- [ ] **Materials**
  - [ ] PBR configured correctly
  - [ ] Textures optimized (max 2048x2048)
  - [ ] No missing textures

- [ ] **Metadata**
  - [ ] Cost assigned
  - [ ] Dimensions accurate (in meters)
  - [ ] Category/subcategory set
  - [ ] Tags added
  - [ ] Phases assigned

- [ ] **Performance**
  - [ ] Renders at 60fps with 10 instances
  - [ ] LOD configured for complex assets
  - [ ] File size < 5MB

- [ ] **Visual Quality**
  - [ ] Looks good at expected viewing distance
  - [ ] Materials respond correctly to lighting
  - [ ] No Z-fighting or artifacts

---

## Automation Scripts

### Bulk Thumbnail Generator

```python
# scripts/generate_thumbnails.py
import bpy
import os

def generate_thumbnail(glb_path, output_path):
    """Generate thumbnail for a GLB asset"""
    # Clear scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Setup camera
    bpy.ops.object.camera_add(location=(2, -2, 1.5))
    camera = bpy.context.active_object
    camera.rotation_euler = (1.1, 0, 0.8)
    bpy.context.scene.camera = camera
    
    # Setup lighting
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
    
    # Render settings
    bpy.context.scene.render.resolution_x = 256
    bpy.context.scene.render.resolution_y = 256
    bpy.context.scene.render.filepath = output_path
    
    # Render
    bpy.ops.render.render(write_still=True)

# Usage
for glb_file in os.listdir('processed/furniture/'):
    if glb_file.endswith('.glb'):
        generate_thumbnail(
            f'processed/furniture/{glb_file}',
            f'thumbnails/{glb_file.replace(".glb", ".jpg")}'
        )
```

### Catalog Updater

```python
# scripts/update_catalog.py
import json
import os
from pathlib import Path

def update_catalog(assets_dir: str):
    """Scan assets directory and update catalog.json"""
    catalog = {
        "version": "1.0",
        "updated_at": datetime.now().isoformat(),
        "items": []
    }
    
    for glb_file in Path(assets_dir).glob("**/*.glb"):
        # Read metadata from GLB (would need gltf library)
        metadata = extract_metadata(glb_file)
        
        catalog["items"].append({
            "id": glb_file.stem,
            "name": metadata.get("name", glb_file.stem),
            "model_url": str(glb_file.relative_to(assets_dir)),
            "thumbnail_url": str(glb_file.with_suffix(".jpg").relative_to(assets_dir)),
            **metadata
        })
    
    with open(f"{assets_dir}/catalog.json", "w") as f:
        json.dump(catalog, f, indent=2)

# Usage
update_catalog("programiq-assets/furniture")
```

---

## Troubleshooting

### Asset Not Appearing in Configurator

1. Check R2 upload completed
2. Verify catalog.json updated
3. Check file path in catalog matches actual path
4. Clear browser cache

### Material Looks Wrong

1. Check texture paths are correct
2. Verify PBR values (metallic should be 0 for non-metals)
3. Check UV mapping
4. Test in Babylon Editor first

### Performance Issues

1. Check triangle count
2. Verify texture sizes (max 2048x2048)
3. Enable LOD for complex assets
4. Use Draco compression

### Metadata Not Loading

1. Verify JSON syntax
2. Check metadata is embedded in GLB (not external)
3. Re-export from Babylon Editor with metadata included

---

## Summary

Babylon Editor is your internal tool for:

1. **Asset Preparation** - Import, optimize, configure, export
2. **Material Library** - Build reusable PBR materials
3. **Scene Templates** - Create starting points for customers
4. **Quality Control** - Test before deploying

Customers never see Babylon Editor. They experience a polished catalog of ready-to-use assets in the ProgramIQ Configurator.
