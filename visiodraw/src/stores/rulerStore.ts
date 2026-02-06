import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// 参考线接口
export interface GuideLine {
  id: string
  // 方向：horizontal（水平）或 vertical（垂直）
  orientation: 'horizontal' | 'vertical'
  // 位置（像素）
  position: number
  // 是否锁定
  locked: boolean
}

// 标尺状态接口
export interface RulerState {
  // 是否显示标尺
  showRulers: boolean
  // 是否显示参考线
  showGuideLines: boolean
  // 参考线列表
  guideLines: GuideLine[]
  // 标尺单位（像素）
  rulerUnit: number
  // 标尺刻度间隔
  rulerInterval: number

  // Actions
  // 显示/隐藏标尺
  toggleRulers: () => void
  // 显示/隐藏参考线
  toggleGuideLines: () => void
  // 添加参考线
  addGuideLine: (orientation: 'horizontal' | 'vertical', position: number) => string
  // 删除参考线
  removeGuideLine: (id: string) => void
  // 更新参考线位置
  updateGuideLinePosition: (id: string, position: number) => void
  // 锁定/解锁参考线
  toggleGuideLineLock: (id: string) => void
  // 清除所有参考线
  clearAllGuideLines: () => void
  // 设置标尺单位
  setRulerUnit: (unit: number) => void
  // 设置标尺刻度间隔
  setRulerInterval: (interval: number) => void
}

const useRulerStore = create<RulerState>()(
  devtools(
    persist(
      (set) => ({
        // 初始状态
        showRulers: true,
        showGuideLines: true,
        guideLines: [],
        rulerUnit: 1,
        rulerInterval: 50,

        // 显示/隐藏标尺
        toggleRulers: () => {
          set((state) => ({ showRulers: !state.showRulers }))
        },

        // 显示/隐藏参考线
        toggleGuideLines: () => {
          set((state) => ({ showGuideLines: !state.showGuideLines }))
        },

        // 添加参考线
        addGuideLine: (orientation, position) => {
          const id = `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const newGuide: GuideLine = {
            id,
            orientation,
            position,
            locked: false,
          }
          set((state) => ({
            guideLines: [...state.guideLines, newGuide],
          }))
          return id
        },

        // 删除参考线
        removeGuideLine: (id) => {
          set((state) => ({
            guideLines: state.guideLines.filter((g) => g.id !== id),
          }))
        },

        // 更新参考线位置
        updateGuideLinePosition: (id, position) => {
          set((state) => ({
            guideLines: state.guideLines.map((g) =>
              g.id === id ? { ...g, position } : g
            ),
          }))
        },

        // 锁定/解锁参考线
        toggleGuideLineLock: (id) => {
          set((state) => ({
            guideLines: state.guideLines.map((g) =>
              g.id === id ? { ...g, locked: !g.locked } : g
            ),
          }))
        },

        // 清除所有参考线
        clearAllGuideLines: () => {
          set({ guideLines: [] })
        },

        // 设置标尺单位
        setRulerUnit: (unit) => {
          set({ rulerUnit: unit })
        },

        // 设置标尺刻度间隔
        setRulerInterval: (interval) => {
          set({ rulerInterval: interval })
        },
      }),
      {
        name: 'RulerStore',
        partialize: (state) => ({
          showRulers: state.showRulers,
          showGuideLines: state.showGuideLines,
          guideLines: state.guideLines,
          rulerUnit: state.rulerUnit,
          rulerInterval: state.rulerInterval,
        }),
      }
    ),
    { name: 'RulerStore' }
  )
)

export default useRulerStore
