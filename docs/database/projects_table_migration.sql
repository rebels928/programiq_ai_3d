-- Projects Table Migration
-- Add model storage fields

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  phase TEXT DEFAULT 'Foundation',
  budget NUMERIC,
  completion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add model storage columns
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS model_source TEXT CHECK (model_source IN ('upload', 'url')),
ADD COLUMN IF NOT EXISTS model_url TEXT;

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Comments
COMMENT ON COLUMN projects.model_source IS 'Source of the 3D model: upload (Supabase Storage) or url (external link)';
COMMENT ON COLUMN projects.model_url IS 'Supabase Storage URL or external URL to the .gltf/.glb file';

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid()::text = user_id);
