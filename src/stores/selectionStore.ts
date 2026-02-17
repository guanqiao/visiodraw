import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface SelectionState {
  selectedNodeIds: string[]
  selectedEdgeId: string | null

  selectNode: (id: string | null) => void
  selectNodes: (ids: string[]) => void
  toggleNodeSelection: (id: string) => void
  selectEdge: (id: string | null) => void
  clearSelection: () => void
  hasSelection: () => boolean
  selectedCount: () => number
}

export const useSelectionStore = create<SelectionState>()(
  devtools(
    (set, get) => ({
      selectedNodeIds: [],
      selectedEdgeId: null,

      selectNode: (id) => {
        if (id === null) {
          set({ selectedNodeIds: [] })
        } else {
          set({ selectedNodeIds: [id], selectedEdgeId: null })
        }
      },

      selectNodes: (ids) => {
        set({ selectedNodeIds: ids, selectedEdgeId: null })
      },

      toggleNodeSelection: (id) => {
        const { selectedNodeIds } = get()
        const isSelected = selectedNodeIds.includes(id)
        
        if (isSelected) {
          set({ selectedNodeIds: selectedNodeIds.filter(nodeId => nodeId !== id) })
        } else {
          set({ selectedNodeIds: [...selectedNodeIds, id] })
        }
      },

      selectEdge: (id) => {
        if (id === null) {
          set({ selectedEdgeId: null })
        } else {
          set({ selectedEdgeId: id, selectedNodeIds: [] })
        }
      },

      clearSelection: () => {
        set({ selectedNodeIds: [], selectedEdgeId: null })
      },

      hasSelection: () => {
        const { selectedNodeIds, selectedEdgeId } = get()
        return selectedNodeIds.length > 0 || selectedEdgeId !== null
      },

      selectedCount: () => {
        const { selectedNodeIds, selectedEdgeId } = get()
        return selectedNodeIds.length + (selectedEdgeId ? 1 : 0)
      },
    }),
    { name: 'selection-store' }
  )
)

export default useSelectionStore
