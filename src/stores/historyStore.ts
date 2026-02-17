import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface HistoryState {
  nodes: any[]
  edges: any[]
}

export interface HistoryStoreState {
  past: HistoryState[]
  future: HistoryState[]

  pushState: (state: HistoryState) => void
  undo: (currentState: HistoryState) => HistoryState | null
  redo: (currentState: HistoryState) => HistoryState | null
  canUndo: () => boolean
  canRedo: () => boolean
  clearHistory: () => void
}

const MAX_HISTORY_SIZE = 50

export const useHistoryStore = create<HistoryStoreState>()(
  devtools(
    (set, get) => ({
      past: [],
      future: [],

      pushState: (state) => {
        set(currentState => {
          const newPast = [...currentState.past, state]
          if (newPast.length > MAX_HISTORY_SIZE) {
            return { past: newPast.slice(-MAX_HISTORY_SIZE), future: [] }
          }
          return { past: newPast, future: [] }
        })
      },

      undo: (currentState) => {
        const { past, future } = get()
        
        if (past.length === 0) {
          return null
        }

        const previous = past[past.length - 1]
        const newPast = past.slice(0, -1)
        
        set({
          past: newPast,
          future: [currentState, ...future],
        })

        return previous
      },

      redo: (currentState) => {
        const { past, future } = get()
        
        if (future.length === 0) {
          return null
        }

        const next = future[0]
        const newFuture = future.slice(1)
        
        set({
          past: [...past, currentState],
          future: newFuture,
        })

        return next
      },

      canUndo: () => {
        return get().past.length > 0
      },

      canRedo: () => {
        return get().future.length > 0
      },

      clearHistory: () => {
        set({ past: [], future: [] })
      },
    }),
    { name: 'history-store' }
  )
)

export default useHistoryStore
