import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface ClipboardItem {
  shapes: any[]
  offsetX: number
  offsetY: number
}

export interface ClipboardState {
  clipboard: ClipboardItem | null
  pasteCount: number

  copy: (shapes: any[]) => void
  cut: (shapes: any[], deleteCallback: (ids: string[]) => void) => void
  paste: () => ClipboardItem | null
  clear: () => void
  resetPasteCount: () => void
  hasItems: () => boolean
}

const useClipboardStore = create<ClipboardState>()(
  devtools(
    (set, get) => ({
      clipboard: null,
      pasteCount: 0,

      copy: (shapes) => {
        if (!shapes || shapes.length === 0) return

        const clonedShapes = JSON.parse(JSON.stringify(shapes))

        let minX = Infinity, minY = Infinity
        clonedShapes.forEach((shape: any) => {
          minX = Math.min(minX, shape.x)
          minY = Math.min(minY, shape.y)
        })

        set({
          clipboard: {
            shapes: clonedShapes,
            offsetX: minX,
            offsetY: minY,
          },
          pasteCount: 0,
        })
      },

      cut: (shapes, deleteCallback) => {
        if (!shapes || shapes.length === 0) return

        get().copy(shapes)

        const ids = shapes.map((s) => s.id)
        deleteCallback(ids)
      },

      paste: () => {
        const { clipboard, pasteCount } = get()
        if (!clipboard) return null

        const newShapes = JSON.parse(JSON.stringify(clipboard.shapes)).map((shape: any) => ({
          ...shape,
          x: shape.x + (pasteCount + 1) * 20,
          y: shape.y + (pasteCount + 1) * 20,
        }))

        set({ pasteCount: pasteCount + 1 })

        return {
          shapes: newShapes,
          offsetX: clipboard.offsetX + (pasteCount + 1) * 20,
          offsetY: clipboard.offsetY + (pasteCount + 1) * 20,
        }
      },

      clear: () => {
        set({ clipboard: null, pasteCount: 0 })
      },

      resetPasteCount: () => {
        set({ pasteCount: 0 })
      },

      hasItems: () => {
        const { clipboard } = get()
        return clipboard !== null && clipboard.shapes.length > 0
      },
    }),
    { name: 'clipboard-store' }
  )
)

export default useClipboardStore
