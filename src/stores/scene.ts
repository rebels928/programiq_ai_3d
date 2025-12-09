import { create } from 'zustand';
import { SceneElement, Phase } from '@/types/scene';

interface SceneState {
  elements: SceneElement[];
  selectedId: string | null;
  activePhaseId: number;
  phases: Phase[];

  addElement: (element: SceneElement) => void;
  updateElement: (element: SceneElement) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setActivePhase: (phaseId: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  elements: [],
  selectedId: null,
  activePhaseId: 3,
  phases: [
    { id: 1, name: 'As-Built', color: '#808080', visible: true },
    { id: 2, name: 'Demolition', color: '#FF4444', visible: true },
    { id: 3, name: 'Rough-In', color: '#FFA500', visible: true },
    { id: 4, name: 'Finishes', color: '#4444FF', visible: false },
    { id: 5, name: 'Final', color: '#44FF44', visible: false },
  ],

  addElement: (element) => set((state) => ({
    elements: [...state.elements, element],
  })),

  updateElement: (element) => set((state) => ({
    elements: state.elements.map((e) => e.id === element.id ? element : e),
  })),

  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter((e) => e.id !== id),
  })),

  selectElement: (id) => set({ selectedId: id }),

  setActivePhase: (phaseId) => set({ activePhaseId: phaseId }),
}));
