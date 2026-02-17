import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VirtualRenderer } from '../VirtualRenderer'
import { Graph, Node, Edge } from '@antv/x6'

// Mock X6 Graph
const createMockGraph = () => {
  const nodes = new Map<string, Node>()
  const edges = new Map<string, Edge>()
  const eventHandlers: Record<string, Function[]> = {}

  return {
    getGraphArea: vi.fn().mockReturnValue({ width: 800, height: 600 }),
    zoom: vi.fn().mockReturnValue(1),
    translate: vi.fn().mockReturnValue({ tx: 0, ty: 0 }),
    getNodes: vi.fn().mockReturnValue(Array.from(nodes.values())),
    getEdges: vi.fn().mockReturnValue(Array.from(edges.values())),
    getCellById: vi.fn((id: string) => nodes.get(id) || edges.get(id)),
    on: vi.fn((event: string, handler: Function) => {
      if (!eventHandlers[event]) eventHandlers[event] = []
      eventHandlers[event].push(handler)
    }),
    trigger: (event: string, data: any) => {
      eventHandlers[event]?.forEach((handler) => handler(data))
    },
    _nodes: nodes,
    _edges: edges,
  } as unknown as Graph
}

// Mock Node
const createMockNode = (id: string, x: number, y: number, width: number, height: number) => {
  return {
    id,
    getBBox: vi.fn().mockReturnValue({ x, y, width, height }),
    show: vi.fn(),
    hide: vi.fn(),
    isNode: vi.fn().mockReturnValue(true),
  } as unknown as Node
}

describe('VirtualRenderer', () => {
  let graph: Graph
  let renderer: VirtualRenderer

  beforeEach(() => {
    graph = createMockGraph()
    renderer = new VirtualRenderer(graph, { enableCulling: true })
  })

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const stats = renderer.getStats()
      expect(stats.totalNodes).toBe(0)
      expect(stats.visibleNodes).toBe(0)
      expect(stats.cullingRatio).toBe(0)
    })

    it('should register event listeners', () => {
      expect(graph.on).toHaveBeenCalledWith('node:added', expect.any(Function))
      expect(graph.on).toHaveBeenCalledWith('node:moved', expect.any(Function))
      expect(graph.on).toHaveBeenCalledWith('node:removed', expect.any(Function))
      expect(graph.on).toHaveBeenCalledWith('scale', expect.any(Function))
      expect(graph.on).toHaveBeenCalledWith('translate', expect.any(Function))
    })
  })

  describe('node visibility', () => {
    it('should show nodes in viewport', () => {
      const node = createMockNode('node1', 100, 100, 50, 50)
      renderer.initialize({ nodes: [node], edges: [] })

      expect(node.show).toHaveBeenCalled()
    })

    it('should handle nodes outside viewport', () => {
      const node = createMockNode('node1', 2000, 2000, 50, 50)
      renderer.initialize({ nodes: [node], edges: [] })

      // Node should be processed, but visibility depends on implementation
      const stats = renderer.getStats()
      expect(stats.totalNodes).toBe(1)
    })
  })

  describe('showAll and hideAll', () => {
    it('should show all nodes when showAll is called', () => {
      const node1 = createMockNode('node1', 2000, 2000, 50, 50)
      const node2 = createMockNode('node2', 3000, 3000, 50, 50)
      renderer.initialize({ nodes: [node1, node2], edges: [] })

      renderer.showAll()

      expect(node1.show).toHaveBeenCalled()
      expect(node2.show).toHaveBeenCalled()
    })

    it('should hide all nodes when hideAll is called', () => {
      const node1 = createMockNode('node1', 100, 100, 50, 50)
      const node2 = createMockNode('node2', 200, 200, 50, 50)
      renderer.initialize({ nodes: [node1, node2], edges: [] })

      renderer.hideAll()

      expect(node1.hide).toHaveBeenCalled()
      expect(node2.hide).toHaveBeenCalled()
    })
  })

  describe('updateOptions', () => {
    it('should update options and refresh visibility', () => {
      const node = createMockNode('node1', 100, 100, 50, 50)
      renderer.initialize({ nodes: [node], edges: [] })

      renderer.updateOptions({ enableCulling: false })

      // When culling is disabled, all nodes should be shown
      expect(node.show).toHaveBeenCalled()
    })
  })

  describe('dispose', () => {
    it('should show all nodes and clear state on dispose', () => {
      const node = createMockNode('node1', 2000, 2000, 50, 50)
      renderer.initialize({ nodes: [node], edges: [] })

      renderer.dispose()

      expect(node.show).toHaveBeenCalled()
      expect(renderer.getStats().totalNodes).toBe(0)
    })
  })
})
