import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Graph, Node, Edge, Shape } from '@antv/x6'
import type { ConnectionPoint, Connector } from '../types/connection'
import { renderShape } from '../utils/shapeRenderers'
import useCanvasHistoryStore from './canvasHistoryStore'
import dayjs from 'dayjs'

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
  zIndex?: number
  visible?: boolean
  locked?: boolean
}

export type GridType = 'dot' | 'line' | 'none'

export interface X6GraphState {
  graph: Graph | null
  nodes: ShapeData[]
  edges: Connector[]
  selectedNodeIds: string[]
  selectedEdgeId: string | null
  zoom: number
  gridEnabled: boolean
  gridType: GridType
  gridSize: number
  canvasBgColor: string
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
  setGridType: (type: GridType) => void
  setGridSize: (size: number) => void
  setCanvasBgColor: (color: string) => void

  // Edge operations
  addEdge: (edge: Connector) => void
  updateEdge: (id: string, updates: Partial<Connector>) => void
  deleteEdge: (id: string) => void
  selectEdge: (id: string | null) => void

  // Alignment and distribution
  alignNodes: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  distributeNodes: (direction: 'horizontal' | 'vertical') => void

  // Layer operations
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void

  // Connection points
  updateNodeConnectionPoints: (id: string, connectionPoints: ConnectionPoint[]) => void
  addConnectionPoint: (nodeId: string, connectionPoint: ConnectionPoint) => void
  removeConnectionPoint: (nodeId: string, connectionPointId: string) => void
  updateConnectionPoint: (nodeId: string, connectionPointId: string, updates: Partial<ConnectionPoint>) => void

  // History
  undo: () => void
  redo: () => void
  saveHistory: () => void

  // File operations
  newGraph: () => void
  exportToPng: () => Promise<string>
  exportToSvg: (options?: { transparent?: boolean; padding?: number }) => Promise<string>
  exportToJson: () => string
  importFromJson: (json: string) => void

  // Auto save
  autoSaveEnabled: boolean
  lastAutoSaveTime: number
  toggleAutoSave: () => void
  autoSaveToHistory: () => void
}

// Auto save interval in milliseconds (5 minutes)
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000

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
      gridType: 'dot',
      gridSize: 10,
      canvasBgColor: '#f0f2f5',
      snapToGrid: false,
      currentTool: 'select',
      isModified: false,
      autoSaveEnabled: true,
      lastAutoSaveTime: 0,

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

        if (newZoom === currentZoom) return

        if (graph) {
          const actualZoom = graph.zoom()
          if (Math.abs(actualZoom - newZoom) > 0.001) {
            graph.zoomTo(newZoom)
          }
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

      setGridType: (type) => {
        const { graph, canvasBgColor } = get()
        set({ gridType: type })
        if (graph) {
          // Update grid visualization based on type
          graph.clearGrid()
          if (type !== 'none') {
            // 根据画布背景色判断当前主题
            const isDarkTheme = canvasBgColor === '#1e1e1e' || canvasBgColor === '#2c2c2c'
            const gridColor = isDarkTheme
              ? (type === 'line' ? '#3a3a3a' : '#404040')
              : (type === 'line' ? '#e0e0e0' : '#d0d0d0')
            graph.drawGrid({
              type: type === 'line' ? 'mesh' : 'dot',
              args: {
                color: gridColor,
                thickness: 1,
              },
            })
          }
        }
      },

      setGridSize: (size) => {
        const { graph } = get()
        set({ gridSize: size })
        if (graph) {
          graph.setGridSize(size)
        }
      },

      setCanvasBgColor: (color) => {
        set({ canvasBgColor: color })
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

      bringToFront: (id) => {
        const { graph, nodes } = get()
        if (graph) {
          const cell = graph.getCellById(id)
          if (cell) {
            cell.toFront()
          }
        }
        // Update z-index in store
        const maxZ = Math.max(...nodes.map(n => n.zIndex || 0), 0)
        const newNodes = nodes.map(n => n.id === id ? { ...n, zIndex: maxZ + 1 } : n)
        set({ nodes: newNodes })
      },

      sendToBack: (id) => {
        const { graph, nodes } = get()
        if (graph) {
          const cell = graph.getCellById(id)
          if (cell) {
            cell.toBack()
          }
        }
        // Update z-index in store
        const minZ = Math.min(...nodes.map(n => n.zIndex || 0), 0)
        const newNodes = nodes.map(n => n.id === id ? { ...n, zIndex: minZ - 1 } : n)
        set({ nodes: newNodes })
      },

      bringForward: (id) => {
        const { graph, nodes } = get()
        const node = nodes.find(n => n.id === id)
        if (!node) return

        if (graph) {
          const cell = graph.getCellById(id)
          if (cell) {
            cell.toFront()
          }
        }
        const newNodes = nodes.map(n => n.id === id ? { ...n, zIndex: (n.zIndex || 0) + 1 } : n)
        set({ nodes: newNodes })
      },

      sendBackward: (id) => {
        const { graph, nodes } = get()
        const node = nodes.find(n => n.id === id)
        if (!node) return

        if (graph) {
          const cell = graph.getCellById(id)
          if (cell) {
            cell.toBack()
          }
        }
        const newNodes = nodes.map(n => n.id === id ? { ...n, zIndex: (n.zIndex || 0) - 1 } : n)
        set({ nodes: newNodes })
      },

      updateNodeConnectionPoints: (id, connectionPoints) => {
        const { nodes } = get()
        const newNodes = nodes.map((node) =>
          node.id === id ? { ...node, connectionPoints } : node
        )
        set({ nodes: newNodes, isModified: true })
      },

      addConnectionPoint: (nodeId, connectionPoint) => {
        const { nodes } = get()
        const newNodes = nodes.map((node) => {
          if (node.id === nodeId) {
            const existingPoints = node.connectionPoints || []
            return {
              ...node,
              connectionPoints: [...existingPoints, connectionPoint],
            }
          }
          return node
        })
        set({ nodes: newNodes, isModified: true })
      },

      removeConnectionPoint: (nodeId, connectionPointId) => {
        const { nodes } = get()
        const newNodes = nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              connectionPoints: (node.connectionPoints || []).filter(
                (cp) => cp.id !== connectionPointId
              ),
            }
          }
          return node
        })
        set({ nodes: newNodes, isModified: true })
      },

      updateConnectionPoint: (nodeId, connectionPointId, updates) => {
        const { nodes } = get()
        const newNodes = nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              connectionPoints: (node.connectionPoints || []).map((cp) =>
                cp.id === connectionPointId ? { ...cp, ...updates } : cp
              ),
            }
          }
          return node
        })
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
        return (graph as any).toPNG()
      },

      exportToSvg: async (options?: { transparent?: boolean; padding?: number }) => {
        const { graph } = get()
        if (!graph) {
          throw new Error('Graph not initialized')
        }

        const { transparent = false, padding = 10 } = options || {}

        // Get graph content bounds
        const cells = graph.getCells()
        if (cells.length === 0) {
          throw new Error('No content to export')
        }

        // Calculate bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        cells.forEach((cell: any) => {
          if (cell.isNode()) {
            const pos = cell.position()
            const size = cell.size()
            minX = Math.min(minX, pos.x)
            minY = Math.min(minY, pos.y)
            maxX = Math.max(maxX, pos.x + size.width)
            maxY = Math.max(maxY, pos.y + size.height)
          } else if (cell.isEdge()) {
            const bbox = cell.getBBox()
            if (bbox) {
              minX = Math.min(minX, bbox.x)
              minY = Math.min(minY, bbox.y)
              maxX = Math.max(maxX, bbox.x + bbox.width)
              maxY = Math.max(maxY, bbox.y + bbox.height)
            }
          }
        })

        // Add padding
        minX -= padding
        minY -= padding
        maxX += padding
        maxY += padding

        const width = maxX - minX
        const height = maxY - minY

        // Get SVG content from graph
        const svgContent = (graph as any).toSVG()
        if (!svgContent) {
          throw new Error('Failed to generate SVG')
        }

        // Parse and modify SVG
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
        const svgElement = svgDoc.querySelector('svg')

        if (!svgElement) {
          throw new Error('Invalid SVG content')
        }

        // Set viewBox and dimensions
        svgElement.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`)
        svgElement.setAttribute('width', `${width}`)
        svgElement.setAttribute('height', `${height}`)

        // Handle background
        if (!transparent) {
          const { canvasBgColor } = get()
          const existingRect = svgElement.querySelector('rect[data-bg="true"]')
          if (!existingRect) {
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            bgRect.setAttribute('x', `${minX}`)
            bgRect.setAttribute('y', `${minY}`)
            bgRect.setAttribute('width', `${width}`)
            bgRect.setAttribute('height', `${height}`)
            bgRect.setAttribute('fill', canvasBgColor)
            bgRect.setAttribute('data-bg', 'true')
            svgElement.insertBefore(bgRect, svgElement.firstChild)
          }
        }

        // Serialize back to string
        const serializer = new XMLSerializer()
        const svgString = serializer.serializeToString(svgElement)

        return svgString
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
                lineStyle: 'solid',
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

      toggleAutoSave: () => {
        const { autoSaveEnabled } = get()
        set({ autoSaveEnabled: !autoSaveEnabled })
      },

      autoSaveToHistory: () => {
        const { graph, autoSaveEnabled, lastAutoSaveTime, nodes, edges } = get()
        
        // Check if auto save is enabled
        if (!autoSaveEnabled) return
        
        // Check if there's anything to save
        if (nodes.length === 0 && edges.length === 0) return
        
        // Check if enough time has passed since last auto save
        const now = Date.now()
        if (now - lastAutoSaveTime < AUTO_SAVE_INTERVAL) return
        
        if (!graph) return
        
        try {
          const data = JSON.stringify(graph.toJSON())
          const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
          
          // Add to history without thumbnail for auto save
          useCanvasHistoryStore.getState().addToHistory(
            `自动保存 ${timestamp}`,
            data
          )
          
          set({ lastAutoSaveTime: now })
          console.log('Auto saved to history at', timestamp)
        } catch (error) {
          console.error('Auto save failed:', error)
        }
      },
    }),
    { name: 'x6-graph-store' }
  )
)

// Helper function to create X6 node
function createX6Node(node: ShapeData): Node {
  return renderShape(node.type, {
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    fill: node.fill,
    stroke: node.stroke,
    strokeWidth: node.strokeWidth,
    text: node.text,
    rx: node.rx,
    ry: node.ry,
  })
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
