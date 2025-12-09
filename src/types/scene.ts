export interface SceneElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'fixture' | 'furniture';
  phaseId: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  properties: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Phase {
  id: number;
  name: string;
  color: string;
  visible: boolean;
}
