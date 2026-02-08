import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface NodeStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  fontSize?: number
  fontColor?: string
}

export interface EdgeStyle {
  stroke?: string
  strokeWidth?: number
  lineStyle?: 'solid' | 'dashed' | 'dotted'
  sourceMarker?: string
  targetMarker?: string
  router?: string
}

export interface FormatPainterState {
  // 复制的节点样式
  copiedNodeStyle: NodeStyle | null
  // 复制的连接线样式
  copiedEdgeStyle: EdgeStyle | null
  // 是否处于格式刷模式（连续粘贴）
  isPersistentMode: boolean

  // 复制节点样式
  copyNodeStyle: (style: NodeStyle) => void
  // 复制连接线样式
  copyEdgeStyle: (style: EdgeStyle) => void
  // 粘贴样式到节点
  pasteNodeStyle: () => NodeStyle | null
  // 粘贴样式到连接线
  pasteEdgeStyle: () => EdgeStyle | null
  // 设置持续模式
  setPersistentMode: (enabled: boolean) => void
  // 清除复制的样式
  clear: () => void
  // 是否有复制的样式
  hasNodeStyle: () => boolean
  hasEdgeStyle: () => boolean
}

const useFormatPainterStore = create<FormatPainterState>()(
  devtools(
    (set, get) => ({
      copiedNodeStyle: null,
      copiedEdgeStyle: null,
      isPersistentMode: false,

      copyNodeStyle: (style) => {
        set({ copiedNodeStyle: { ...style } })
      },

      copyEdgeStyle: (style) => {
        set({ copiedEdgeStyle: { ...style } })
      },

      pasteNodeStyle: () => {
        const { copiedNodeStyle, isPersistentMode } = get()
        if (!copiedNodeStyle) return null

        // 如果不是持续模式，粘贴后清除
        if (!isPersistentMode) {
          set({ copiedNodeStyle: null })
        }

        return { ...copiedNodeStyle }
      },

      pasteEdgeStyle: () => {
        const { copiedEdgeStyle, isPersistentMode } = get()
        if (!copiedEdgeStyle) return null

        // 如果是持续模式，不清除样式
        return { ...copiedEdgeStyle }
      },

      setPersistentMode: (enabled) => {
        set({ isPersistentMode: enabled })
      },

      clear: () => {
        set({
          copiedNodeStyle: null,
          copiedEdgeStyle: null,
          isPersistentMode: false,
        })
      },

      hasNodeStyle: () => {
        return get().copiedNodeStyle !== null
      },

      hasEdgeStyle: () => {
        return get().copiedEdgeStyle !== null
      },
    }),
    { name: 'format-painter-store' }
  )
)

export default useFormatPainterStore
