import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Graph, Node, Edge, Shape } from '@antv/x6'
import type { ConnectionPoint, Connector } from '../types/connection'

export interface ShapeData {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  text?: string
  angle?: number
  connectionPoints?: ConnectionPoint[]
  opacity?: number
  rx?: number
  ry?: number
  fontSize?: number
  fontColor?: string
  textAlign?: 'left' | 'center' | 'right'
}

export interface X6GraphState {
  graph: Graph | null
  nodes: ShapeData[]
  edges: Connector[]
  selectedNodeIds: string[]
  selectedEdgeId: string | null
  zoom: number
  gridEnabled: boolean
  snapToGrid: boolean
  currentTool: string
  isModified: boolean

  // Actions
  setGraph: (graph: Graph) => void
  addNode: (node: ShapeData) => void
  addNodes: (nodes: ShapeData[]) => void
  updateNode: (id: string, updates: Partial<ShapeData>) => void
  deleteNode: (id: string) => void
  deleteNodes: (ids: string[]) => void
  selectNode: (id: string | null) => void
  selectNodes: (ids: string[]) => void
  toggleNodeSelection: (id: string) => void
  clearSelection: () => void
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void
  setTool: (tool: string) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void

  // Edge operations
  addEdge: (edge: Connector) => void
  updateEdge: (id: string, updates: Partial<Connector>) => void
  deleteEdge: (id: string) => void
  selectEdge: (id: string | null) => void

  // Alignment and distribution
  alignNodes: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  distributeNodes: (direction: 'horizontal' | 'vertical') => void

  // Connection points
  updateNodeConnectionPoints: (id: string, connectionPoints: ConnectionPoint[]) => void

  // History
  undo: () => void
  redo: () => void
  saveHistory: () => void

  // File operations
  newGraph: () => void
  exportToPng: () => Promise<string>
  exportToJson: () => string
  importFromJson: (json: string) => void
}

const useX6GraphStore = create<X6GraphState>()(
  devtools(
    (set, get) => ({
      graph: null,
      nodes: [],
      edges: [],
      selectedNodeIds: [],
      selectedEdgeId: null,
      zoom: 1,
      gridEnabled: true,
      snapToGrid: false,
      currentTool: 'select',
      isModified: false,

      setGraph: (graph) => {
        set({ graph })
      },

      addNode: (node) => {
        const { nodes, graph } = get()
        const newNodes = [...nodes, node]
        set({ nodes: newNodes, isModified: true })
        
        if (graph) {
          const x6Node = createX6Node(node)
          graph.addNode(x6Node)
        }
      },

      addNodes: (newNodes) => {
        const { nodes, graph } = get()
        const updatedNodes = [...nodes, ...newNodes]
        set({ nodes: updatedNodes, isModified: true })
        
        if (graph) {
          newNodes.forEach(node => {
            const x6Node = createX6Node(node)
            graph.addNode(x6Node)
          })
        }
      },

      updateNode: (id, updates) => {
        const { nodes, graph } = get()
        const node = nodes.find(n => n.id === id)
        if (!node) return

        const newNodes = nodes.map((n) =>
          n.id === id ? { ...n, ...updates } : n
        )
        set({ nodes: newNodes, isModified: true })

        if (graph) {
          const x6Node = graph.getCellById(id) as Node
          if (x6Node) {
            const attrs: Record<string, any> = {}
            if (updates.x !== undefined || updates.y !== undefined) {
              x6Node.position(updates.x ?? node.x, updates.y ?? node.y)
            }
            if (updates.width !== undefined || updates.height !== undefined) {
              x6Node.size(updates.width ?? node.width, updates.height ?? node.height)
            }
            if (updates.fill !== undefined) {
              attrs.body = { fill: updates.fill }
            }
            if (updates.stroke !== undefined) {
              attrs.body = { ...attrs.body, stroke: updates.stroke }
            }
            if (updates.text !== undefined) {
              attrs.label = { text: updates.text }
            }
            if (Object.keys(attrs).length > 0) {
              x6Node.attr(attrs)
            }
          }
        }
      },

      deleteNode: (id) => {
        const { nodes, edges, graph, selectedNodeIds } = get()
        const newNodes = nodes.filter((n) => n.id !== id)
        
        // 删除相关的连接线
        const newEdges = edges.filter(e => e.sourceShapeId !== id && e.targetShapeId !== id)
        
        set({
          nodes: newNodes,
          edges: newEdges,
          selectedNodeIds: selectedNodeIds.filter(sid => sid !== id),
          isModified: true,
        })

        if (graph) {
          const cell = graph.getCellById(id)
          if (cell) {
            graph.removeCell(cell)
          }
          // 删除相关边
          newEdges.forEach(edge => {
            const edgeCell = graph.getCellById(edge.id)
            if (edgeCell) {
              graph.removeCell(edgeCell)
            }
          })
        }
      },

      deleteNodes: (ids) => {
        const { nodes, edges, graph, selectedNodeIds } = get()
        const idSet = new Set(ids)
        const newNodes = nodes.filter((n) => !idSet.has(n.id))
        const newEdges = edges.filter(e => !idSet.has(e.sourceShapeId) && !idSet.has(e.targetShapeId))
        
        set({
          nodes: newNodes,
          edges: newEdges,
          selectedNodeIds: selectedNodeIds.filter(sid => !idSet.has(sid)),
          isModified: true,
        })

        if (graph) {
          ids.forEach(id => {
            const cell = graph.getCellById(id)
            if (cell) {
              graph.removeCell(cell)
            }
          })
        }
      },

      selectNode: (id) => {
        const { graph } = get()
        set({
          selectedNodeIds: id ? [id] : [],
          selectedEdgeId: null,
        })
        
        if (graph && id) {
          const node = graph.getCellById(id)
          if (node) {
            graph.select(node)
          }
        }
      },

      selectNodes: (ids) => {
        const { graph } = get()
        set({
          selectedNodeIds: ids,
          selectedEdgeId: null,
        })

        if (graph) {
          const cells = ids.map(id => graph.getCellById(id)).filter(Boolean)
          graph.select(cells)
        }
      },

      toggleNodeSelection: (id) => {
        const { selectedNodeIds, graph } = get()
        const index = selectedNodeIds.indexOf(id)
        let newSelectedIds: string[]

        if (index === -1) {
          newSelectedIds = [...selectedNodeIds, id]
        } else {
          newSelectedIds = selectedNodeIds.filter((_, i) => i !== index)
        }

        set({
          selectedNodeIds: newSelectedIds,
          selectedEdgeId: null,
        })

        if (graph) {
          const cells = newSelectedIds.map(sid => graph.getCellById(sid)).filter(Boolean)
          graph.select(cells)
        }
      },

      clearSelection: () => {
        const { graph } = get()
        set({
          selectedNodeIds: [],
          selectedEdgeId: null,
        })

        if (graph) {
          graph.cleanSelection()
        }
      },

      setZoom: (zoomOrFn) => {
        const { graph, zoom: currentZoom } = get()
        const newZoom = typeof zoomOrFn === 'function' ? zoomOrFn(currentZoom) : zoomOrFn
        
        if (graph) {
          graph.zoom(newZoom)
        }
        set({ zoom: newZoom })
      },

      setTool: (tool) => {
        set({ currentTool: tool })
      },

      toggleGrid: () => {
        const { graph } = get()
        set((state) => {
          const newGridEnabled = !state.gridEnabled
          if (graph) {
            if (newGridEnabled) {
              graph.drawGrid()
            } else {
              graph.clearGrid()
            }
          }
          return { gridEnabled: newGridEnabled }
        })
      },

      toggleSnapToGrid: () => {
        set((state) => ({ snapToGrid: !state.snapToGrid }))
      },

      addEdge: (edge) => {
        const { edges, graph } = get()
        const newEdges = [...edges, edge]
        set({ edges: newEdges, isModified: true })

        if (graph) {
          const x6Edge = createX6Edge(edge)
          graph.addEdge(x6Edge)
        }
      },

      updateEdge: (id, updates) => {
        const { edges, graph } = get()
        const newEdges = edges.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        )
        set({ edges: newEdges, isModified: true })

        if (graph) {
          const x6Edge = graph.getCellById(id) as Edge
          if (x6Edge) {
            if (updates.stroke !== undefined) {
              x6Edge.attr('line/stroke', updates.stroke)
            }
            if (updates.strokeWidth !== undefined) {
              x6Edge.attr('line/strokeWidth', updates.strokeWidth)
            }
          }
        }
      },

      deleteEdge: (id) => {
        const { edges, graph, selectedEdgeId } = get()
        const newEdges = edges.filter((e) => e.id !== id)
        set({
          edges: newEdges,
          selectedEdgeId: selectedEdgeId === id ? null : selectedEdgeId,
          isModified: true,
        })

        if (graph) {
          const cell = graph.getCellById(id)
          if (cell) {
            graph.removeCell(cell)
          }
        }
      },

      selectEdge: (id) => {
        const { graph } = get()
        set({
          selectedEdgeId: id,
          selectedNodeIds: [],
        })

        if (graph && id) {
          const edge = graph.getCellById(id)
          if (edge) {
            graph.select(edge)
          }
        }
      },

      alignNodes: (alignment) => {
        const { selectedNodeIds, nodes, updateNode } = get()
        if (selectedNodeIds.length < 2) return

        const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id))
        if (selectedNodes.length < 2) return

        const minX = Math.min(...selectedNodes.map((n) => n.x))
        const maxX = Math.max(...selectedNodes.map((n) => n.x + n.width))
        const minY = Math.min(...selectedNodes.map((n) => n.y))
        const maxY = Math.max(...selectedNodes.map((n) => n.y + n.height))
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        selectedNodes.forEach((node) => {
          let newX = node.x
          let newY = node.y

          switch (alignment) {
            case 'left':
              newX = minX
              break
            case 'center':
              newX = centerX - node.width / 2
              break
            case 'right':
              newX = maxX - node.width
              break
            case 'top':
              newY = minY
              break
            case 'middle':
              newY = centerY - node.height / 2
              break
            case 'bottom':
              newY = maxY - node.height
              break
          }

          if (newX !== node.x || newY !== node.y) {
            updateNode(node.id, { x: newX, y: newY })
          }
        })
      },

      distributeNodes: (direction) => {
        const { selectedNodeIds, nodes, updateNode } = get()
        if (selectedNodeIds.length < 3) return

        const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id))
        if (selectedNodes.length < 3) return

        if (direction === 'horizontal') {
          const sorted = [...selectedNodes].sort((a, b) => a.x - b.x)
          const minX = sorted[0].x
          const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width
          const totalWidth = maxX - minX
          const totalNodesWidth = sorted.reduce((sum, n) => sum + n.width, 0)
          const gap = (totalWidth - totalNodesWidth) / (sorted.length - 1)

          let currentX = minX
          sorted.forEach((node, index) => {
            if (index > 0) {
              updateNode(node.id, { x: currentX })
            }
            currentX += node.width + gap
          })
        } else {
          const sorted = [...selectedNodes].sort((a, b) => a.y - b.y)
          const minY = sorted[0].y
          const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height
          const totalHeight = maxY - minY
          const totalNodesHeight = sorted.reduce((sum, n) => sum + n.height, 0)
          const gap = (totalHeight - totalNodesHeight) / (sorted.length - 1)

          let currentY = minY
          sorted.forEach((node, index) => {
            if (index > 0) {
              updateNode(node.id, { y: currentY })
            }
            currentY += node.height + gap
          })
        }
      },

      updateNodeConnectionPoints: (id, connectionPoints) => {
        const { nodes } = get()
        const newNodes = nodes.map((node) =>
          node.id === id ? { ...node, connectionPoints } : node
        )
        set({ nodes: newNodes, isModified: true })
      },

      undo: () => {
        // TODO: Implement undo with X6 history plugin
        console.log('Undo not yet implemented')
      },

      redo: () => {
        // TODO: Implement redo with X6 history plugin
        console.log('Redo not yet implemented')
      },

      saveHistory: () => {
        // TODO: Implement history with X6 history plugin
      },

      newGraph: () => {
        const { graph } = get()
        if (graph) {
          graph.clearCells()
        }
        set({
          nodes: [],
          edges: [],
          selectedNodeIds: [],
          selectedEdgeId: null,
          isModified: false,
        })
      },

      exportToPng: async () => {
        const { graph } = get()
        if (!graph) {
          throw new Error('Graph not initialized')
        }
        return graph.toPNG()
      },

      exportToJson: () => {
        const { graph } = get()
        if (!graph) {
          return '{}'
        }
        return JSON.stringify(graph.toJSON())
      },

      importFromJson: (json) => {
        const { graph } = get()
        if (!graph) {
          return
        }
        try {
          const data = JSON.parse(json)
          graph.fromJSON(data)
          
          // 同步 store 状态
          const nodes: ShapeData[] = []
          const edges: Connector[] = []
          
          data.cells?.forEach((cell: any) => {
            if (cell.shape) {
              nodes.push({
                id: cell.id,
                type: cell.shape,
                x: cell.position?.x || 0,
                y: cell.position?.y || 0,
                width: cell.size?.width || 100,
                height: cell.size?.height || 60,
                fill: cell.attrs?.body?.fill || '#ffffff',
                stroke: cell.attrs?.body?.stroke || '#333333',
                strokeWidth: cell.attrs?.body?.strokeWidth || 2,
                text: cell.attrs?.label?.text,
              })
            } else if (cell.shape === 'edge') {
              edges.push({
                id: cell.id,
                sourceShapeId: cell.source?.cell,
                sourcePointId: cell.source?.port || 'default',
                targetShapeId: cell.target?.cell,
                targetPointId: cell.target?.port || 'default',
                style: cell.router?.name === 'manhattan' ? 'orthogonal' : 'straight',
                startStyle: 'none',
                endStyle: cell.attrs?.line?.targetMarker ? 'arrow' : 'none',
                stroke: cell.attrs?.line?.stroke || '#333333',
                strokeWidth: cell.attrs?.line?.strokeWidth || 2,
              })
            }
          })
          
          set({ nodes, edges, isModified: true })
        } catch (error) {
          console.error('Failed to import JSON:', error)
        }
      },
    }),
    { name: 'x6-graph-store' }
  )
)

// Helper function to create X6 node
function createX6Node(node: ShapeData): Node {
  const baseConfig = {
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    attrs: {
      body: {
        fill: node.fill || '#ffffff',
        stroke: node.stroke || '#333333',
        strokeWidth: node.strokeWidth || 2,
      },
      label: {
        text: node.text || '',
        fontSize: node.fontSize || 14,
        fill: node.fontColor || '#333333',
      },
    },
    ports: {
      groups: {
        top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#1890ff', fill: '#fff' } } },
        bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#1890ff', fill: '#fff' } } },
        left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#1890ff', fill: '#fff' } } },
        right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#1890ff', fill: '#fff' } } },
      },
      items: [
        { id: 'top', group: 'top' },
        { id: 'bottom', group: 'bottom' },
        { id: 'left', group: 'left' },
        { id: 'right', group: 'right' },
      ],
    },
  }

  switch (node.type) {
    case 'circle':
    case 'start-end':
      return new Shape.Circle(baseConfig)
    case 'ellipse':
      return new Shape.Ellipse(baseConfig)
    case 'triangle':
    case 'decision':
      return new Shape.Polygon({
        ...baseConfig,
        points: '0,100 50,0 100,100',
      })
    case 'diamond':
      return new Shape.Polygon({
        ...baseConfig,
        points: '50,0 100,50 50,100 0,50',
      })
    case 'rounded-rectangle':
      return new Shape.Rect({
        ...baseConfig,
        attrs: {
          ...baseConfig.attrs,
          body: {
            ...baseConfig.attrs.body,
            rx: node.rx || 10,
            ry: node.ry || 10,
          },
        },
      })
    case 'rectangle':
    case 'process':
    default:
      return new Shape.Rect(baseConfig)
  }
}

// Helper function to create X6 edge
function createX6Edge(edge: Connector): Edge {
  const router = edge.style === 'orthogonal' ? 'manhattan' : 
                 edge.style === 'curved' ? 'er' : 'normal'
  
  return new Shape.Edge({
    id: edge.id,
    source: { cell: edge.sourceShapeId, port: edge.sourcePointId },
    target: { cell: edge.targetShapeId, port: edge.targetPointId },
    router: { name: router },
    connector: { name: 'rounded' },
    attrs: {
      line: {
        stroke: edge.stroke || '#333333',
        strokeWidth: edge.strokeWidth || 2,
        targetMarker: edge.endStyle === 'arrow' ? {
          name: 'classic',
          size: 10,
        } : null,
        sourceMarker: edge.startStyle === 'arrow' ? {
          name: 'classic',
          size: 10,
        } : null,
      },
    },
  })
}

export default useX6GraphStore
