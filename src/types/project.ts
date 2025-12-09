export interface Project {
  id: string;
  user_id: string;
  name: string;
  address: string;
  client_name?: string;
  client_email?: string;
  scan_file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  project_id: string;
  name: string;
  polygon: number[][]; // Array of [x, z] coordinates
  floor_height: number;
  ceiling_height: number;
  created_at: string;
}
