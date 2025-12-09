import { create } from 'zustand';
import { CostBreakdown, Schedule, Scope, Risk, PMData } from '@/types/pm';

interface PMState {
  costBreakdown: CostBreakdown;
  schedule: Schedule;
  scope: Scope;
  risks: Risk[];

  setPMData: (data: PMData) => void;
  addRisk: (risk: Risk) => void;
}

export const usePMStore = create<PMState>((set) => ({
  costBreakdown: {
    demo: 0,
    framing: 0,
    finishes: 0,
    contingency: 0,
    total: 0
  },
  schedule: {
    phases: [],
    totalWeeks: 0
  },
  scope: {
    totalArea: 0,
    newWalls: 0,
    demoWalls: 0
  },
  risks: [],

  setPMData: (data) => set(data),

  addRisk: (risk) => set((state) => ({
    risks: [...state.risks, risk]
  })),
}));
