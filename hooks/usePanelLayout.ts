import { useState } from 'react'

export type WindowId = '3d' | 'documents' | 'timeline' | 'whatif' | 'ikea' | 'health'
export type PanelId = 'chat' | 'stats' | 'modelParts' | 'library'

export interface WindowState {
  isOpen: boolean
  position: 'center' | 'floating'
  zIndex: number
}

export interface PanelState {
  isVisible: boolean
}

export interface LayoutState {
  windows: Record<WindowId, WindowState>
  panels: Record<PanelId, PanelState>
}

export function usePanelLayout() {
  const [layout, setLayout] = useState<LayoutState>({
    windows: {
      '3d': { isOpen: false, position: 'center', zIndex: 1 },
      documents: { isOpen: false, position: 'center', zIndex: 1 },
      timeline: { isOpen: false, position: 'center', zIndex: 1 },
      whatif: { isOpen: false, position: 'center', zIndex: 1 },
      ikea: { isOpen: false, position: 'center', zIndex: 1 },
      health: { isOpen: false, position: 'center', zIndex: 1 },
    },
    panels: {
      chat: { isVisible: false },
      stats: { isVisible: false },
      modelParts: { isVisible: false },
      library: { isVisible: false },
    },
  })

  const openWindow = (windowId: WindowId, position: 'center' | 'floating' = 'center') => {
    setLayout((prev) => ({
      ...prev,
      windows: {
        ...prev.windows,
        [windowId]: {
          isOpen: true,
          position,
          zIndex: Math.max(...Object.values(prev.windows).map((w) => w.zIndex)) + 1,
        },
      },
    }))
  }

  const closeWindow = (windowId: WindowId) => {
    setLayout((prev) => ({
      ...prev,
      windows: {
        ...prev.windows,
        [windowId]: { ...prev.windows[windowId], isOpen: false },
      },
    }))
  }

  const togglePanel = (panelId: PanelId) => {
    setLayout((prev) => ({
      ...prev,
      panels: {
        ...prev.panels,
        [panelId]: { isVisible: !prev.panels[panelId].isVisible },
      },
    }))
  }

  return {
    layout,
    openWindow,
    closeWindow,
    togglePanel,
  }
}
