import { create } from 'zustand';
import { Project, Room } from '@/types/project';

interface ProjectState {
  project: Project | null;
  rooms: Room[];
  isLoading: boolean;
  loadProject: (id: string) => Promise<void>;
  updateProject: (data: Partial<Project>) => void;
  addRoom: (room: Room) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  rooms: [],
  isLoading: false,

  loadProject: async (id) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      set({ project: data.project, rooms: data.rooms, isLoading: false });
    } catch (error) {
      console.error('Failed to load project:', error);
      set({ isLoading: false });
    }
  },

  updateProject: (data) => {
    set((state) => ({
      project: state.project ? { ...state.project, ...data } : null,
    }));
  },

  addRoom: (room) => {
    set((state) => ({ rooms: [...state.rooms, room] }));
  },
}));
