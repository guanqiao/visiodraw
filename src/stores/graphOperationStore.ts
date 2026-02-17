import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import useGraphDataStore from './graphDataStore'

export interface GraphOperationState {
  // Alignment operations
  alignNodes: (ids: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  distributeNodes: (ids: string[], direction: 'horizontal' | 'vertical') => void

  // Layer operations
  bringToFront: (ids: string[]) => void
  sendToBack: (ids: string[]) => void
  bringForward: (ids: string[]) => void
  sendBackward: (ids: string[]) => void

  // Group operations
  groupNodes: (ids: string[]) => void
  ungroupNodes: (groupId: string) => void
}

export const useGraphOperationStore = create<GraphOperationState>()(
  devtools(
    (set, get) => ({
      alignNodes: (ids, alignment) => {
        const { nodes, updateNode } = useGraphDataStore.getState()
        const selectedNodes = nodes.filter((n) => ids.includes(n.id))

        if (selectedNodes.length < 2) return

        switch (alignment) {
          case 'left': {
            const minX = Math.min(...selectedNodes.map((n) => n.x))
            selectedNodes.forEach((node) => {
              updateNode(node.id, { x: minX })
            })
            break
          }
          case 'center': {
            const centerX =
              selectedNodes.reduce((sum, n) => sum + n.x + n.width / 2, 0) /
              selectedNodes.length
            selectedNodes.forEach((node) => {
              updateNode(node.id, { x: centerX - node.width / 2 })
            })
            break
          }
          case 'right': {
            const maxRight = Math.max(...selectedNodes.map((n) => n.x + n.width))
            selectedNodes.forEach((node) => {
              updateNode(node.id, { x: maxRight - node.width })
            })
            break
          }
          case 'top': {
            const minY = Math.min(...selectedNodes.map((n) => n.y))
            selectedNodes.forEach((node) => {
              updateNode(node.id, { y: minY })
            })
            break
          }
          case 'middle': {
            const centerY =
              selectedNodes.reduce((sum, n) => sum + n.y + n.height / 2, 0) /
              selectedNodes.length
            selectedNodes.forEach((node) => {
              updateNode(node.id, { y: centerY - node.height / 2 })
            })
            break
          }
          case 'bottom': {
            const maxBottom = Math.max(...selectedNodes.map((n) => n.y + n.height))
            selectedNodes.forEach((node) => {
              updateNode(node.id, { y: maxBottom - node.height })
            })
            break
          }
        }
      },

      distributeNodes: (ids, direction) => {
        const { nodes, updateNode } = useGraphDataStore.getState()
        const selectedNodes = nodes.filter((n) => ids.includes(n.id))

        if (selectedNodes.length < 3) return

        if (direction === 'horizontal') {
          const sortedNodes = [...selectedNodes].sort((a, b) => a.x - b.x)
          const minX = sortedNodes[0].x
          const maxX = sortedNodes[sortedNodes.length - 1].x
          const totalWidth = maxX - minX
          const step = totalWidth / (sortedNodes.length - 1)

          sortedNodes.forEach((node, index) => {
            updateNode(node.id, { x: minX + step * index })
          })
        } else {
          const sortedNodes = [...selectedNodes].sort((a, b) => a.y - b.y)
          const minY = sortedNodes[0].y
          const maxY = sortedNodes[sortedNodes.length - 1].y
          const totalHeight = maxY - minY
          const step = totalHeight / (sortedNodes.length - 1)

          sortedNodes.forEach((node, index) => {
            updateNode(node.id, { y: minY + step * index })
          })
        }
      },

      bringToFront: (ids) => {
        const { nodes, updateNode } = useGraphDataStore.getState()
        const maxZIndex = Math.max(...nodes.map((n) => n.zIndex || 0), 0)
        ids.forEach((id, index) => {
          updateNode(id, { zIndex: maxZIndex + index + 1 })
        })
      },

      sendToBack: (ids) => {
        const { nodes, updateNode } = useGraphDataStore.getState()
        const minZIndex = Math.min(...nodes.map((n) => n.zIndex || 0), 0)
        ids.forEach((id, index) => {
          updateNode(id, { zIndex: minZIndex - ids.length + index })
        })
      },

      bringForward: (ids) => {
        const { updateNode } = useGraphDataStore.getState()
        ids.forEach((id) => {
          const node = useGraphDataStore.getState().getNodeById(id)
          if (node) {
            updateNode(id, { zIndex: (node.zIndex || 0) + 1 })
          }
        })
      },

      sendBackward: (ids) => {
        const { updateNode } = useGraphDataStore.getState()
        ids.forEach((id) => {
          const node = useGraphDataStore.getState().getNodeById(id)
          if (node) {
            updateNode(id, { zIndex: (node.zIndex || 0) - 1 })
          }
        })
      },

      groupNodes: (ids) => {
        // TODO: Implement group functionality
        console.log('Group nodes:', ids)
      },

      ungroupNodes: (groupId) => {
        // TODO: Implement ungroup functionality
        console.log('Ungroup nodes:', groupId)
      },
    }),
    { name: 'graph-operation-store' }
  )
)

export default useGraphOperationStore
