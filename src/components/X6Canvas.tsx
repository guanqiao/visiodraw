import React, { useEffect, useRef, useCallback } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Transform } from '@antv/x6-plugin-transform'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { History } from '@antv/x6-plugin-history'
import { Selection } from '@antv/x6-plugin-selection'
import useX6GraphStore from '@stores/x6GraphStore'
import useClipboardStore from '@stores/clipboardStore'
import { v4 as uuidv4 } from 'uuid'
import type { DragData, DropPosition } from '../types/dragDrop'
import { parseDragData } from '../types/dragDrop'
import { generateDefaultConnectionPoints } from '@utils/connectionPoints'

const X6Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)

  // Store selectors
  const setGraph = useX6GraphStore((state) => state.setGraph)
  const addNode = useX6GraphStore((state) => state.addNode)
  const addNodes = useX6GraphStore((state) => state.addNodes)
  const updateNode = useX6GraphStore((state) => state.updateNode)
  const deleteNode = useX6GraphStore((state) => state.deleteNode)
  const deleteNodes = useX6GraphStore((state) => state.deleteNodes)
  const selectNode = useX6GraphStore((state) => state.selectNode)
  const selectNodes = useX6GraphStore((state) => state.selectNodes)
  const clearSelection = useX6GraphStore((state) => state.clearSelection)
  const addEdge = useX6GraphStore((state) => state.addEdge)
  const deleteEdge = useX6GraphStore((state) => state.deleteEdge)
  const selectEdge = useX6GraphStore((state) => state.selectEdge)
  const nodes = useX6GraphStore((state) => state.nodes)
  const edges = useX6GraphStore((state) => state.edges)
  const selectedNodeIds = useX6GraphStore((state) => state.selectedNodeIds)
  const selectedEdgeId = useX6GraphStore((state) => state.selectedEdgeId)
  const currentTool = useX6GraphStore((state) => state.currentTool)
  const setTool = useX6GraphStore((state) => state.setTool)
  const gridEnabled = useX6GraphStore((state) => state.gridEnabled)
  const zoom = useX6GraphStore((state) => state.zoom)
  const setZoom = useX6GraphStore((state) => state.setZoom)

  const copy = useClipboardStore((state) => state.copy)
  const cut = useClipboardStore((state) => state.cut)
  const paste = useClipboardStore((state) => state.paste)

  // Initialize X6 Graph
  useEffect(() => {
    if (!containerRef.current) return

    const graph = new Graph({
      container: containerRef.current,
      width: 1200,
      height: 800,
      background: {
        color: '#ffffff',
      },
      grid: {
        visible: gridEnabled,
        size: 10,
        type: 'dot',
      },
      panning: {
        enabled: true,
        eventTypes: ['leftMouseDown', 'mouseWheel'],
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        minScale: 0.1,
        maxScale: 3,
      },
      connecting: {
        enabled: true,
        allowBlank: false,
        allowMulti: true,
        allowLoop: false,
        allowNode: false,
        allowEdge: false,
        highlight: true,
        snap: {
          radius: 20,
        },
        createEdge() {
          return graph.createEdge({
            attrs: {
              line: {
                stroke: '#333333',
                strokeWidth: 2,
                targetMarker: {
                  name: 'classic',
                  size: 10,
                },
              },
            },
            router: {
              name: 'manhattan',
            },
            connector: {
              name: 'rounded',
            },
          })
        },
        validateConnection({ sourceCell, targetCell }) {
          return sourceCell !== targetCell
        },
      },
      selecting: {
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true,
      },
      keyboard: {
        enabled: true,
        global: true,
      },
      clipboard: {
        enabled: true,
      },
      history: {
        enabled: true,
      },
    })

    // Add plugins
    graph.use(
      new Snapline({
        enabled: true,
        sharp: true,
      })
    )

    graph.use(
      new Transform({
        resizing: true,
        rotating: true,
      })
    )

    graph.use(
      new Keyboard({
        enabled: true,
      })
    )

    graph.use(
      new Clipboard({
        enabled: true,
      })
    )

    graph.use(
      new History({
        enabled: true,
      })
    )

    graph.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true,
      })
    )

    // Event handlers
    graph.on('node:added', ({ node }) => {
      const data = node.getData() as any
      if (data?.fromStore) return

      const nodeData = {
        id: node.id,
        type: node.shape || 'rect',
        x: node.position().x,
        y: node.position().y,
        width: node.size().width,
        height: node.size().height,
        fill: node.attr('body/fill') || '#ffffff',
        stroke: node.attr('body/stroke') || '#333333',
        strokeWidth: node.attr('body/strokeWidth') || 2,
        text: node.attr('label/text') || '',
        connectionPoints: generateDefaultConnectionPoints(node.shape || 'rect'),
      }
      node.setData({ fromStore: true })
      addNode(nodeData)
    })

    graph.on('node:moved', ({ node }) => {
      updateNode(node.id, {
        x: node.position().x,
        y: node.position().y,
      })
    })

    graph.on('node:resized', ({ node }) => {
      updateNode(node.id, {
        width: node.size().width,
        height: node.size().height,
      })
    })

    graph.on('node:selected', ({ node }) => {
      selectNode(node.id)
    })

    graph.on('node:unselected', () => {
      clearSelection()
    })

    graph.on('edge:added', ({ edge }) => {
      const data = edge.getData() as any
      if (data?.fromStore) return

      const source = edge.getSource()
      const target = edge.getTarget()

      if (source && target) {
        const edgeData = {
          id: edge.id,
          sourceShapeId: (source as any).cell,
          sourcePointId: (source as any).port || 'default',
          targetShapeId: (target as any).cell,
          targetPointId: (target as any).port || 'default',
          style: 'orthogonal' as const,
          startStyle: 'none' as const,
          endStyle: 'arrow' as const,
          stroke: edge.attr('line/stroke') || '#333333',
          strokeWidth: edge.attr('line/strokeWidth') || 2,
        }
        edge.setData({ fromStore: true })
        addEdge(edgeData)
      }
    })

    graph.on('edge:connected', ({ edge }) => {
      const source = edge.getSource()
      const target = edge.getTarget()

      if (source && target) {
        const edgeData = {
          id: edge.id,
          sourceShapeId: (source as any).cell,
          sourcePointId: (source as any).port || 'default',
          targetShapeId: (target as any).cell,
          targetPointId: (target as any).port || 'default',
          style: 'orthogonal' as const,
          startStyle: 'none' as const,
          endStyle: 'arrow' as const,
          stroke: '#333333',
          strokeWidth: 2,
        }
        addEdge(edgeData)
      }
    })

    graph.on('edge:selected', ({ edge }) => {
      selectEdge(edge.id)
    })

    graph.on('edge:unselected', () => {
      clearSelection()
    })

    graph.on('blank:click', () => {
      clearSelection()
    })

    graph.on('scale', ({ sx }) => {
      setZoom(sx)
    })

    // Keyboard shortcuts
    graph.bindKey(['delete', 'backspace'], () => {
      const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode())
      const selectedEdges = graph.getSelectedCells().filter(cell => cell.isEdge())
      
      selectedNodes.forEach(node => {
        deleteNode(node.id)
        graph.removeCell(node.id)
      })
      
      selectedEdges.forEach(edge => {
        deleteEdge(edge.id)
        graph.removeCell(edge.id)
      })
    })

    graph.bindKey(['ctrl+c', 'meta+c'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length > 0) {
        graph.copy(selectedCells)
        const selectedNodes = selectedCells
          .filter(cell => cell.isNode())
          .map(cell => nodes.find(n => n.id === cell.id))
          .filter(Boolean)
        copy(selectedNodes as any[])
      }
    })

    graph.bindKey(['ctrl+x', 'meta+x'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length > 0) {
        graph.cut(selectedCells)
        const selectedNodeIds = selectedCells
          .filter(cell => cell.isNode())
          .map(cell => cell.id)
        deleteNodes(selectedNodeIds)
      }
    })

    graph.bindKey(['ctrl+v', 'meta+v'], () => {
      const result = paste()
      if (result && result.shapes.length > 0) {
        const newNodes = result.shapes.map((shape) => ({
          ...shape,
          id: uuidv4(),
          x: shape.x + 20,
          y: shape.y + 20,
        }))
        addNodes(newNodes)
      } else {
        // Use X6 clipboard
        graph.paste({ offset: 20 })
      }
    })

    graph.bindKey(['ctrl+z', 'meta+z'], () => {
      graph.undo()
    })

    graph.bindKey(['ctrl+y', 'meta+y', 'ctrl+shift+z', 'meta+shift+z'], () => {
      graph.redo()
    })

    graph.bindKey(['ctrl+a', 'meta+a'], () => {
      graph.select(graph.getCells())
    })

    graphRef.current = graph
    setGraph(graph)

    return () => {
      graph.dispose()
      graphRef.current = null
    }
  }, [])

  // Sync nodes to graph when nodes change
  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    // Get current node IDs in graph
    const currentNodeIds = new Set(graph.getNodes().map(n => n.id))
    const storeNodeIds = new Set(nodes.map(n => n.id))

    // Remove nodes that are no longer in store
    currentNodeIds.forEach(id => {
      if (!storeNodeIds.has(id)) {
        const cell = graph.getCellById(id)
        if (cell) {
          graph.removeCell(cell)
        }
      }
    })

    // Add or update nodes from store
    nodes.forEach(node => {
      const existingNode = graph.getCellById(node.id) as Node
      if (!existingNode) {
        // Node doesn't exist in graph, create it
        const x6Node = createX6NodeFromData(node)
        graph.addNode(x6Node)
      } else {
        // Update existing node
        existingNode.position(node.x, node.y)
        existingNode.size(node.width, node.height)
        existingNode.attr({
          body: {
            fill: node.fill,
            stroke: node.stroke,
            strokeWidth: node.strokeWidth,
          },
          label: {
            text: node.text || '',
          },
        })
      }
    })
  }, [nodes])

  // Sync edges to graph
  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    const currentEdgeIds = new Set(graph.getEdges().map(e => e.id))
    const storeEdgeIds = new Set(edges.map(e => e.id))

    // Remove edges that are no longer in store
    currentEdgeIds.forEach(id => {
      if (!storeEdgeIds.has(id)) {
        const cell = graph.getCellById(id)
        if (cell) {
          graph.removeCell(cell)
        }
      }
    })

    // Add edges from store
    edges.forEach(edge => {
      const existingEdge = graph.getCellById(edge.id) as Edge
      if (!existingEdge) {
        const x6Edge = createX6EdgeFromData(edge)
        graph.addEdge(x6Edge)
      }
    })
  }, [edges])

  // Handle tool changes
  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    // Reset interaction mode
    graph.enablePanning()
    graph.disableRubberband()

    switch (currentTool) {
      case 'select':
        graph.enableRubberband()
        break
      case 'connector':
        // Enable connecting mode
        break
      case 'rectangle':
      case 'circle':
      case 'triangle':
        // Drawing mode - handled by click events
        break
    }
  }, [currentTool])

  // Handle drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    const dragData = parseDragData(e.dataTransfer)
    if (!dragData) return

    const graph = graphRef.current
    if (!graph) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert to local coordinates
    const localPoint = graph.pageToLocal(x, y)

    const id = uuidv4()
    const shapeType = dragData.shapeType || 'rectangle'
    const width = dragData.width || 100
    const height = dragData.height || 60
    const defaultProps = dragData.defaultProps || {}

    const nodeData = {
      id,
      type: shapeType,
      x: localPoint.x - width / 2,
      y: localPoint.y - height / 2,
      width,
      height,
      fill: (defaultProps.fill as string) || '#e6f7ff',
      stroke: (defaultProps.stroke as string) || '#1890ff',
      strokeWidth: (defaultProps.strokeWidth as number) || 2,
      text: dragData.name,
      connectionPoints: generateDefaultConnectionPoints(shapeType),
    }

    addNode(nodeData)
  }, [addNode])

  // Handle canvas click for drawing shapes
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (currentTool === 'select' || currentTool === 'connector') return

    const graph = graphRef.current
    if (!graph) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const localPoint = graph.pageToLocal(x, y)

    const id = uuidv4()
    const width = 100
    const height = 60

    const nodeData = {
      id,
      type: currentTool,
      x: localPoint.x - width / 2,
      y: localPoint.y - height / 2,
      width,
      height,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
      connectionPoints: generateDefaultConnectionPoints(currentTool),
    }

    addNode(nodeData)

    // Auto-switch back to select tool
    setTool('select')
  }, [currentTool, addNode, setTool])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#f0f2f5',
        cursor: currentTool === 'select' ? 'default' : 'crosshair',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    />
  )
}

// Helper function to create X6 node from data
function createX6NodeFromData(node: any): Node {
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
        fontSize: 14,
        fill: '#333333',
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
    data: { fromStore: true },
  }

  switch (node.type) {
    case 'circle':
    case 'start-end':
      return new Node({
        ...baseConfig,
        shape: 'circle',
      })
    case 'ellipse':
      return new Node({
        ...baseConfig,
        shape: 'ellipse',
      })
    case 'triangle':
    case 'decision':
      return new Node({
        ...baseConfig,
        shape: 'polygon',
        attrs: {
          ...baseConfig.attrs,
          body: {
            ...baseConfig.attrs.body,
            refPoints: '0,100 50,0 100,100',
          },
        },
      })
    case 'diamond':
      return new Node({
        ...baseConfig,
        shape: 'polygon',
        attrs: {
          ...baseConfig.attrs,
          body: {
            ...baseConfig.attrs.body,
            refPoints: '50,0 100,50 50,100 0,50',
          },
        },
      })
    case 'rounded-rectangle':
      return new Node({
        ...baseConfig,
        shape: 'rect',
        attrs: {
          ...baseConfig.attrs,
          body: {
            ...baseConfig.attrs.body,
            rx: 10,
            ry: 10,
          },
        },
      })
    case 'rectangle':
    case 'process':
    default:
      return new Node({
        ...baseConfig,
        shape: 'rect',
      })
  }
}

// Helper function to create X6 edge from data
function createX6EdgeFromData(edge: any): Edge {
  return new Edge({
    id: edge.id,
    source: { cell: edge.sourceShapeId, port: edge.sourcePointId },
    target: { cell: edge.targetShapeId, port: edge.targetPointId },
    router: { name: edge.style === 'orthogonal' ? 'manhattan' : 'normal' },
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
    data: { fromStore: true },
  })
}

export default X6Canvas
