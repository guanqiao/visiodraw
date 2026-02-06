import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { deepClone } from '@utils/performanceUtils'
import type { Shape } from './canvasStore'

export interface ClipboardItem {
  shapes: Shape[]
  offsetX: number
  offsetY: number
}

export interface ClipboardState {
  // 剪贴板内容
  clipboard: ClipboardItem | null
  pasteCount: number

  // Actions
  copy: (shapes: Shape[]) => void
  cut: (shapes: Shape[], deleteCallback: (ids: string[]) => void) => void
  paste: () => ClipboardItem | null
  clear: () => void
  resetPasteCount: () => void
  hasItems: () => boolean
}

const useClipboardStore = create<ClipboardState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      clipboard: null,
      pasteCount: 0,

      // 复制
      copy: (shapes) => {
        if (!shapes || shapes.length === 0) return

        // 深克隆图形数据
        const clonedShapes = deepClone(shapes)

        // 计算中心点偏移
        let minX = Infinity, minY = Infinity
        clonedShapes.forEach((shape) => {
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

      // 剪切
      cut: (shapes, deleteCallback) => {
        if (!shapes || shapes.length === 0) return

        // 先复制
        get().copy(shapes)

        // 删除原图形
        const ids = shapes.map((s) => s.id)
        deleteCallback(ids)
      },

      // 粘贴
      paste: () => {
        const { clipboard, pasteCount } = get()
        if (!clipboard) return null

        // 深克隆并添加偏移
        const newShapes = deepClone(clipboard.shapes).map((shape) => ({
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

      // 清空剪贴板
      clear: () => {
        set({ clipboard: null, pasteCount: 0 })
      },

      // 重置粘贴计数
      resetPasteCount: () => {
        set({ pasteCount: 0 })
      },

      // 检查剪贴板是否有内容
      hasItems: () => {
        const { clipboard } = get()
        return clipboard !== null && clipboard.shapes.length > 0
      },
    }),
    { name: 'clipboard-store' }
  )
)

export default useClipboardStore
