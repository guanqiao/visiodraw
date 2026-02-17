import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type GridType = 'dot' | 'line' | 'none'

export interface CanvasConfigState {
  zoom: number
  gridEnabled: boolean
  gridType: GridType
  gridSize: number
  canvasBgColor: string
  snapToGrid: boolean

  setZoom: (zoom: number | ((prevZoom: number) => number)) => void
  toggleGrid: () => void
  setGridType: (type: GridType) => void
  setGridSize: (size: number) => void
  setCanvasBgColor: (color: string) => void
  toggleSnapToGrid: () => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
}

const MIN_ZOOM = 0.1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.1

export const useCanvasConfigStore = create<CanvasConfigState>()(
  devtools(
    (set, get) => ({
      zoom: 1,
      gridEnabled: true,
      gridType: 'dot',
      gridSize: 10,
      canvasBgColor: '#f0f2f5',
      snapToGrid: false,

      setZoom: (zoom) => {
        const newZoom = typeof zoom === 'function' ? zoom(get().zoom) : zoom
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))
        set({ zoom: clampedZoom })
      },

      toggleGrid: () => {
        set(state => ({ gridEnabled: !state.gridEnabled }))
      },

      setGridType: (type) => {
        set({ gridType: type })
      },

      setGridSize: (size) => {
        set({ gridSize: size })
      },

      setCanvasBgColor: (color) => {
        set({ canvasBgColor: color })
      },

      toggleSnapToGrid: () => {
        set(state => ({ snapToGrid: !state.snapToGrid }))
      },

      zoomIn: () => {
        const { zoom } = get()
        const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP)
        set({ zoom: newZoom })
      },

      zoomOut: () => {
        const { zoom } = get()
        const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP)
        set({ zoom: newZoom })
      },

      resetZoom: () => {
        set({ zoom: 1 })
      },
    }),
    { name: 'canvas-config-store' }
  )
)

export default useCanvasConfigStore
