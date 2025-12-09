export interface CostBreakdown {
  demo: number;
  framing: number;
  finishes: number;
  contingency: number;
  total: number;
}

export interface Schedule {
  phases: SchedulePhase[];
  totalWeeks: number;
}

export interface SchedulePhase {
  id: number;
  name: string;
  weeks: number;
  startWeek: number;
}

export interface Scope {
  totalArea: number;
  newWalls: number;
  demoWalls: number;
}

export interface Risk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface PMData {
  costBreakdown?: CostBreakdown;
  schedule?: Schedule;
  scope?: Scope;
  risks?: Risk[];
}
