import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ShapeData } from './x6GraphStore'
import type { Connector } from '../types/connection'

export interface GraphDataState {
  nodes: ShapeData[]
  edges: Connector[]
  isModified: boolean

  // Node operations
  addNode: (node: ShapeData) => void
  addNodes: (nodes: ShapeData[]) => void
  updateNode: (id: string, updates: Partial<ShapeData>) => void
  deleteNode: (id: string) => void
  deleteNodes: (ids: string[]) => void
  getNodeById: (id: string) => ShapeData | undefined

  // Edge operations
  addEdge: (edge: Connector) => void
  updateEdge: (id: string, updates: Partial<Connector>) => void
  deleteEdge: (id: string) => void
  deleteEdgesByNodeId: (nodeId: string) => void
  getEdgeById: (id: string) => Connector | undefined

  // Batch operations
  setNodes: (nodes: ShapeData[]) => void
  setEdges: (edges: Connector[]) => void
  clearGraph: () => void

  // Computed
  getNodesCount: () => number
  getEdgesCount: () => number
}

export const useGraphDataStore = create<GraphDataState>()(
  devtools(
    (set, get) => ({
      nodes: [],
      edges: [],
      isModified: false,

      addNode: (node) => {
        set((state) => ({
          nodes: [...state.nodes, node],
          isModified: true,
        }))
      },

      addNodes: (newNodes) => {
        set((state) => ({
          nodes: [...state.nodes, ...newNodes],
          isModified: true,
        }))
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
          isModified: true,
        }))
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter(
            (e) => e.sourceShapeId !== id && e.targetShapeId !== id
          ),
          isModified: true,
        }))
      },

      deleteNodes: (ids) => {
        const idSet = new Set(ids)
        set((state) => ({
          nodes: state.nodes.filter((n) => !idSet.has(n.id)),
          edges: state.edges.filter(
            (e) => !idSet.has(e.sourceShapeId) && !idSet.has(e.targetShapeId)
          ),
          isModified: true,
        }))
      },

      getNodeById: (id) => {
        return get().nodes.find((n) => n.id === id)
      },

      addEdge: (edge) => {
        set((state) => ({
          edges: [...state.edges, edge],
          isModified: true,
        }))
      },

      updateEdge: (id, updates) => {
        set((state) => ({
          edges: state.edges.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
          isModified: true,
        }))
      },

      deleteEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== id),
          isModified: true,
        }))
      },

      deleteEdgesByNodeId: (nodeId) => {
        set((state) => ({
          edges: state.edges.filter(
            (e) => e.sourceShapeId !== nodeId && e.targetShapeId !== nodeId
          ),
          isModified: true,
        }))
      },

      getEdgeById: (id) => {
        return get().edges.find((e) => e.id === id)
      },

      setNodes: (nodes) => {
        set({ nodes, isModified: true })
      },

      setEdges: (edges) => {
        set({ edges, isModified: true })
      },

      clearGraph: () => {
        set({ nodes: [], edges: [], isModified: false })
      },

      getNodesCount: () => get().nodes.length,

      getEdgesCount: () => get().edges.length,
    }),
    { name: 'graph-data-store' }
  )
)

export default useGraphDataStore
