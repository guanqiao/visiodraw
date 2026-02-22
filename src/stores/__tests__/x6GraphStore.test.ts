// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useX6GraphStore from '../x6GraphStore'
import type { ShapeData, Connector } from '../../types/connection'

vi.mock('@antv/x6', () => ({
  Graph: vi.fn(() => ({
    addNode: vi.fn(),
    addEdge: vi.fn(),
    removeCell: vi.fn(),
    getCellById: vi.fn(),
    select: vi.fn(),
    cleanSelection: vi.fn(),
    zoom: vi.fn(() => 1),
    zoomTo: vi.fn(),
    drawGrid: vi.fn(),
    clearGrid: vi.fn(),
    setGridSize: vi.fn(),
    getCells: vi.fn(() => []),
    toJSON: vi.fn(() => ({ cells: [] })),
    fromJSON: vi.fn(),
    clearCells: vi.fn(),
  })),
  Node: vi.fn(),
  Edge: vi.fn(),
  Shape: {
    Edge: vi.fn((config) => config),
  },
}))

vi.mock('../canvasHistoryStore', () => ({
  default: {
    getState: vi.fn(() => ({
      addToHistory: vi.fn(),
    })),
  },
}))

describe('X6GraphStore', () => {
  beforeEach(() => {
    const state = useX6GraphStore.getState()
    useX6GraphStore.setState({
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
    })
  })

  describe('初始状态', () => {
    it('应该有正确的初始值', () => {
      const state = useX6GraphStore.getState()

      expect(state.nodes).toEqual([])
      expect(state.edges).toEqual([])
      expect(state.selectedNodeIds).toEqual([])
      expect(state.selectedEdgeId).toBeNull()
      expect(state.zoom).toBe(1)
      expect(state.gridEnabled).toBe(true)
      expect(state.gridType).toBe('dot')
      expect(state.currentTool).toBe('select')
      expect(state.isModified).toBe(false)
    })
  })

  describe('节点操作', () => {
    it('应该添加节点', () => {
      const node: ShapeData = {
        id: 'node-1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 100,
        height: 60,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useX6GraphStore.getState().addNode(node)
      const state = useX6GraphStore.getState()

      expect(state.nodes.length).toBe(1)
      expect(state.nodes[0]).toEqual(node)
      expect(state.isModified).toBe(true)
    })

    it('应该批量添加节点', () => {
      const nodes: ShapeData[] = [
        { id: 'node-1', type: 'rect', x: 100, y: 100, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
        { id: 'node-2', type: 'rect', x: 200, y: 200, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
      ]

      useX6GraphStore.getState().addNodes(nodes)
      const state = useX6GraphStore.getState()

      expect(state.nodes.length).toBe(2)
    })

    it('应该更新节点', () => {
      const node: ShapeData = {
        id: 'node-1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 100,
        height: 60,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useX6GraphStore.getState().addNode(node)
      useX6GraphStore.getState().updateNode('node-1', { x: 200, y: 200 })
      const state = useX6GraphStore.getState()

      expect(state.nodes[0].x).toBe(200)
      expect(state.nodes[0].y).toBe(200)
    })

    it('应该删除节点', () => {
      const node: ShapeData = {
        id: 'node-1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 100,
        height: 60,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useX6GraphStore.getState().addNode(node)
      useX6GraphStore.getState().deleteNode('node-1')
      const state = useX6GraphStore.getState()

      expect(state.nodes.length).toBe(0)
    })

    it('应该批量删除节点', () => {
      const nodes: ShapeData[] = [
        { id: 'node-1', type: 'rect', x: 100, y: 100, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
        { id: 'node-2', type: 'rect', x: 200, y: 200, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
        { id: 'node-3', type: 'rect', x: 300, y: 300, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
      ]

      useX6GraphStore.getState().addNodes(nodes)
      useX6GraphStore.getState().deleteNodes(['node-1', 'node-2'])
      const state = useX6GraphStore.getState()

      expect(state.nodes.length).toBe(1)
      expect(state.nodes[0].id).toBe('node-3')
    })
  })

  describe('选择操作', () => {
    beforeEach(() => {
      const nodes: ShapeData[] = [
        { id: 'node-1', type: 'rect', x: 100, y: 100, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
        { id: 'node-2', type: 'rect', x: 200, y: 200, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
      ]
      useX6GraphStore.getState().addNodes(nodes)
    })

    it('应该选择单个节点', () => {
      useX6GraphStore.getState().selectNode('node-1')
      const state = useX6GraphStore.getState()

      expect(state.selectedNodeIds).toEqual(['node-1'])
      expect(state.selectedEdgeId).toBeNull()
    })

    it('应该选择多个节点', () => {
      useX6GraphStore.getState().selectNodes(['node-1', 'node-2'])
      const state = useX6GraphStore.getState()

      expect(state.selectedNodeIds).toEqual(['node-1', 'node-2'])
    })

    it('应该切换节点选择', () => {
      useX6GraphStore.getState().selectNode('node-1')
      useX6GraphStore.getState().toggleNodeSelection('node-2')
      let state = useX6GraphStore.getState()

      expect(state.selectedNodeIds.length).toBe(2)

      useX6GraphStore.getState().toggleNodeSelection('node-1')
      state = useX6GraphStore.getState()

      expect(state.selectedNodeIds).toEqual(['node-2'])
    })

    it('应该清除选择', () => {
      useX6GraphStore.getState().selectNodes(['node-1', 'node-2'])
      useX6GraphStore.getState().clearSelection()
      const state = useX6GraphStore.getState()

      expect(state.selectedNodeIds).toEqual([])
    })
  })

  describe('边操作', () => {
    it('应该添加边', () => {
      const edge: Connector = {
        id: 'edge-1',
        sourceShapeId: 'node-1',
        sourcePointId: 'right',
        targetShapeId: 'node-2',
        targetPointId: 'left',
        style: 'orthogonal',
        lineStyle: 'solid',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useX6GraphStore.getState().addEdge(edge)
      const state = useX6GraphStore.getState()

      expect(state.edges.length).toBe(1)
      expect(state.isModified).toBe(true)
    })

    it('应该更新边', () => {
      const edge: Connector = {
        id: 'edge-1',
        sourceShapeId: 'node-1',
        sourcePointId: 'right',
        targetShapeId: 'node-2',
        targetPointId: 'left',
        style: 'orthogonal',
        lineStyle: 'solid',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useX6GraphStore.getState().addEdge(edge)
      useX6GraphStore.getState().updateEdge('edge-1', { stroke: '#ff0000' })
      const state = useX6GraphStore.getState()

      expect(state.edges[0].stroke).toBe('#ff0000')
    })

    it('应该删除边', () => {
      const edge: Connector = {
        id: 'edge-1',
        sourceShapeId: 'node-1',
        sourcePointId: 'right',
        targetShapeId: 'node-2',
        targetPointId: 'left',
        style: 'orthogonal',
        lineStyle: 'solid',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useX6GraphStore.getState().addEdge(edge)
      useX6GraphStore.getState().deleteEdge('edge-1')
      const state = useX6GraphStore.getState()

      expect(state.edges.length).toBe(0)
    })

    it('应该选择边', () => {
      const edge: Connector = {
        id: 'edge-1',
        sourceShapeId: 'node-1',
        sourcePointId: 'right',
        targetShapeId: 'node-2',
        targetPointId: 'left',
        style: 'orthogonal',
        lineStyle: 'solid',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useX6GraphStore.getState().addEdge(edge)
      useX6GraphStore.getState().selectEdge('edge-1')
      const state = useX6GraphStore.getState()

      expect(state.selectedEdgeId).toBe('edge-1')
      expect(state.selectedNodeIds).toEqual([])
    })
  })

  describe('缩放操作', () => {
    it('应该设置缩放值', () => {
      useX6GraphStore.getState().setZoom(1.5)
      const state = useX6GraphStore.getState()

      expect(state.zoom).toBe(1.5)
    })

    it('应该支持函数式缩放更新', () => {
      useX6GraphStore.getState().setZoom(1)
      useX6GraphStore.getState().setZoom(prev => prev + 0.5)
      const state = useX6GraphStore.getState()

      expect(state.zoom).toBe(1.5)
    })
  })

  describe('网格操作', () => {
    it('应该切换网格显示', () => {
      useX6GraphStore.getState().toggleGrid()
      let state = useX6GraphStore.getState()
      expect(state.gridEnabled).toBe(false)

      useX6GraphStore.getState().toggleGrid()
      state = useX6GraphStore.getState()
      expect(state.gridEnabled).toBe(true)
    })

    it('应该设置网格类型', () => {
      useX6GraphStore.getState().setGridType('line')
      const state = useX6GraphStore.getState()

      expect(state.gridType).toBe('line')
    })

    it('应该设置网格大小', () => {
      useX6GraphStore.getState().setGridSize(20)
      const state = useX6GraphStore.getState()

      expect(state.gridSize).toBe(20)
    })

    it('应该切换对齐网格', () => {
      useX6GraphStore.getState().toggleSnapToGrid()
      const state = useX6GraphStore.getState()

      expect(state.snapToGrid).toBe(true)
    })
  })

  describe('工具操作', () => {
    it('应该设置当前工具', () => {
      useX6GraphStore.getState().setTool('rect')
      const state = useX6GraphStore.getState()

      expect(state.currentTool).toBe('rect')
    })
  })

  describe('画布背景', () => {
    it('应该设置画布背景颜色', () => {
      useX6GraphStore.getState().setCanvasBgColor('#1e1e1e')
      const state = useX6GraphStore.getState()

      expect(state.canvasBgColor).toBe('#1e1e1e')
    })
  })

  describe('对齐和分布', () => {
    beforeEach(() => {
      const nodes: ShapeData[] = [
        { id: 'node-1', type: 'rect', x: 100, y: 100, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
        { id: 'node-2', type: 'rect', x: 300, y: 200, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
        { id: 'node-3', type: 'rect', x: 500, y: 300, width: 100, height: 60, fill: '#fff', stroke: '#333', strokeWidth: 2 },
      ]
      useX6GraphStore.getState().addNodes(nodes)
      useX6GraphStore.getState().selectNodes(['node-1', 'node-2', 'node-3'])
    })

    it('应该左对齐节点', () => {
      useX6GraphStore.getState().alignNodes('left')
      const state = useX6GraphStore.getState()

      expect(state.nodes[0].x).toBe(100)
      expect(state.nodes[1].x).toBe(100)
      expect(state.nodes[2].x).toBe(100)
    })

    it('应该水平居中对齐节点', () => {
      useX6GraphStore.getState().alignNodes('center')
      const state = useX6GraphStore.getState()

      const minX = 100
      const maxX = 500 + 100
      const centerX = (minX + maxX) / 2
      expect(state.nodes[0].x).toBe(centerX - 50)
      expect(state.nodes[1].x).toBe(centerX - 50)
      expect(state.nodes[2].x).toBe(centerX - 50)
    })

    it('应该顶部对齐节点', () => {
      useX6GraphStore.getState().alignNodes('top')
      const state = useX6GraphStore.getState()

      expect(state.nodes[0].y).toBe(100)
      expect(state.nodes[1].y).toBe(100)
      expect(state.nodes[2].y).toBe(100)
    })
  })

  describe('新建画布', () => {
    it('应该清空画布', () => {
      const node: ShapeData = {
        id: 'node-1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 100,
        height: 60,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useX6GraphStore.getState().addNode(node)
      useX6GraphStore.getState().selectNode('node-1')
      useX6GraphStore.getState().newGraph()
      const state = useX6GraphStore.getState()

      expect(state.nodes.length).toBe(0)
      expect(state.edges.length).toBe(0)
      expect(state.selectedNodeIds).toEqual([])
      expect(state.selectedEdgeId).toBeNull()
      expect(state.isModified).toBe(false)
    })
  })

  describe('自动保存', () => {
    it('应该切换自动保存', () => {
      useX6GraphStore.getState().toggleAutoSave()
      let state = useX6GraphStore.getState()
      expect(state.autoSaveEnabled).toBe(false)

      useX6GraphStore.getState().toggleAutoSave()
      state = useX6GraphStore.getState()
      expect(state.autoSaveEnabled).toBe(true)
    })
  })

  describe('连接点操作', () => {
    beforeEach(() => {
      const node: ShapeData = {
        id: 'node-1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 100,
        height: 60,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 2,
      }
      useX6GraphStore.getState().addNode(node)
    })

    it('应该添加连接点', () => {
      useX6GraphStore.getState().addConnectionPoint('node-1', {
        id: 'cp-1',
        x: 150,
        y: 100,
        direction: 'top',
      })
      const state = useX6GraphStore.getState()

      expect(state.nodes[0].connectionPoints?.length).toBe(1)
    })

    it('应该删除连接点', () => {
      useX6GraphStore.getState().addConnectionPoint('node-1', {
        id: 'cp-1',
        x: 150,
        y: 100,
        direction: 'top',
      })
      useX6GraphStore.getState().removeConnectionPoint('node-1', 'cp-1')
      const state = useX6GraphStore.getState()

      expect(state.nodes[0].connectionPoints?.length).toBe(0)
    })

    it('应该更新连接点', () => {
      useX6GraphStore.getState().addConnectionPoint('node-1', {
        id: 'cp-1',
        x: 150,
        y: 100,
        direction: 'top',
      })
      useX6GraphStore.getState().updateConnectionPoint('node-1', 'cp-1', { direction: 'bottom' })
      const state = useX6GraphStore.getState()

      expect(state.nodes[0].connectionPoints?.[0].direction).toBe('bottom')
    })
  })

  describe('导出功能', () => {
    it('应该导出 JSON', () => {
      const json = useX6GraphStore.getState().exportToJson()
      expect(json).toBe('{}')
    })
  })
})
