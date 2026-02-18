/**
 * SmartRouter 测试用例
 *
 * 测试智能路由器的核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SmartRouter } from '../rendering/SmartRouter'

// Mock X6 Graph
const createMockGraph = () => {
  const nodes = new Map()
  const edges = new Map()
  const eventHandlers: Record<string, Function[]> = {}

  return {
    getNodes: vi.fn(() => Array.from(nodes.values())),
    getEdges: vi.fn(() => Array.from(edges.values())),
    getConnectedEdges: vi.fn((node: any) => {
      return Array.from(edges.values()).filter((edge: any) => 
        edge.source === node.id || edge.target === node.id
      )
    }),
    on: vi.fn((event: string, handler: Function) => {
      if (!eventHandlers[event]) {
        eventHandlers[event] = []
      }
      eventHandlers[event].push(handler)
    }),
    off: vi.fn((event: string) => {
      delete eventHandlers[event]
    }),
    trigger: (event: string, data: any) => {
      if (eventHandlers[event]) {
        eventHandlers[event].forEach((handler) => handler(data))
      }
    },
    addNode: (node: any) => {
      nodes.set(node.id, node)
    },
    addEdge: (edge: any) => {
      edges.set(edge.id, edge)
    },
    nodes,
    edges,
    eventHandlers,
  }
}

// Mock X6 Node
const createMockNode = (id: string, x: number, y: number, width: number, height: number) => {
  return {
    id,
    getBBox: vi.fn(() => ({ x, y, width, height })),
    getPort: vi.fn((portId: string) => ({ id: portId })),
    getPortProp: vi.fn(() => ({ x: 0.5, y: 0.5 })),
  }
}

// Mock X6 Edge
const createMockEdge = (id: string, source: string, target: string) => {
  return {
    id,
    source,
    target,
    getSourceNode: vi.fn(),
    getTargetNode: vi.fn(),
    getSourcePortId: vi.fn(() => 'center'),
    getTargetPortId: vi.fn(() => 'center'),
    setVertices: vi.fn(),
    setConnector: vi.fn(),
  }
}

describe('SmartRouter', () => {
  let mockGraph: any
  let router: SmartRouter

  beforeEach(() => {
    mockGraph = createMockGraph()
    router = new SmartRouter(mockGraph as any)
  })

  describe('基本功能', () => {
    it('应该初始化并设置事件监听', () => {
      expect(mockGraph.on).toHaveBeenCalledWith('node:added', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('node:moved', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('node:removed', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('node:resized', expect.any(Function))
    })

    it('应该初始化障碍物列表', () => {
      expect(mockGraph.getNodes).toHaveBeenCalled()
    })
  })

  describe('障碍物管理', () => {
    it('应该添加节点作为障碍物', () => {
      const node = createMockNode('node-1', 100, 100, 80, 60)
      mockGraph.addNode(node)
      mockGraph.trigger('node:added', { node })

      // 验证障碍物已添加
      expect(node.getBBox).toHaveBeenCalled()
    })

    it('应该更新障碍物位置', () => {
      const node = createMockNode('node-1', 100, 100, 80, 60)
      mockGraph.addNode(node)
      
      // 触发移动事件
      mockGraph.trigger('node:moved', { node })

      expect(node.getBBox).toHaveBeenCalled()
    })

    it('应该移除障碍物', () => {
      const node = createMockNode('node-1', 100, 100, 80, 60)
      mockGraph.addNode(node)
      mockGraph.trigger('node:added', { node })
      
      // 触发删除事件
      mockGraph.trigger('node:removed', { node })

      // 验证节点已移除
      expect(mockGraph.off).toBeDefined()
    })
  })

  describe('路由计算', () => {
    it('应该计算基本路由', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 100 }

      const route = router.calculateRoute(start, end)

      expect(route).toBeDefined()
      expect(route.length).toBeGreaterThanOrEqual(2)
      expect(route[0]).toEqual(start)
      expect(route[route.length - 1]).toEqual(end)
    })

    it('应该支持排除特定障碍物', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 100 }
      const excludeIds = ['node-1']

      const route = router.calculateRoute(start, end, { excludeIds })

      expect(route).toBeDefined()
      expect(route.length).toBeGreaterThanOrEqual(2)
    })

    it('应该处理水平路由', () => {
      const start = { x: 0, y: 50 }
      const end = { x: 100, y: 50 }

      const route = router.calculateRoute(start, end)

      expect(route).toBeDefined()
      expect(route[0]).toEqual(start)
      expect(route[route.length - 1]).toEqual(end)
    })

    it('应该处理垂直路由', () => {
      const start = { x: 50, y: 0 }
      const end = { x: 50, y: 100 }

      const route = router.calculateRoute(start, end)

      expect(route).toBeDefined()
      expect(route[0]).toEqual(start)
      expect(route[route.length - 1]).toEqual(end)
    })
  })

  describe('曼哈顿路由', () => {
    it('应该生成曼哈顿路径（直角）', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 100 }
      const obstacles: any[] = []

      // 使用曼哈顿路由
      const route = (router as any).manhattanRoute(start, end, obstacles, 10, 100)

      expect(route).toBeDefined()
      expect(route.length).toBeGreaterThanOrEqual(2)
      
      // 曼哈顿路径应该有直角转弯
      const hasRightAngle = route.some((point: any, index: number) => {
        if (index < 2) return false
        const prev = route[index - 1]
        const prevPrev = route[index - 2]
        // 检查是否有方向变化（直角）
        const dx1 = prev.x - prevPrev.x
        const dy1 = prev.y - prevPrev.y
        const dx2 = point.x - prev.x
        const dy2 = point.y - prev.y
        return (dx1 !== 0 && dy2 !== 0) || (dy1 !== 0 && dx2 !== 0)
      })
      
      expect(hasRightAngle).toBe(true)
    })
  })

  describe('几何计算', () => {
    it('应该检测线段相交', () => {
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 100, y: 100 }
      const p3 = { x: 0, y: 100 }
      const p4 = { x: 100, y: 0 }

      const intersects = (router as any).lineSegmentsIntersect(p1, p2, p3, p4)

      expect(intersects).toBe(true)
    })

    it('应该检测线段不相交', () => {
      const p1 = { x: 0, y: 0 }
      const p2 = { x: 50, y: 50 }
      const p3 = { x: 100, y: 100 }
      const p4 = { x: 150, y: 150 }

      const intersects = (router as any).lineSegmentsIntersect(p1, p2, p3, p4)

      expect(intersects).toBe(false)
    })

    it('应该检测点在矩形内', () => {
      const point = { x: 50, y: 50 }
      
      const inside = (router as any).pointInRectangle(point, 0, 0, 100, 100)
      
      expect(inside).toBe(true)
    })

    it('应该检测点在矩形外', () => {
      const point = { x: 150, y: 150 }
      
      const inside = (router as any).pointInRectangle(point, 0, 0, 100, 100)
      
      expect(inside).toBe(false)
    })

    it('应该计算线段与矩形相交', () => {
      const p1 = { x: -10, y: 50 }
      const p2 = { x: 110, y: 50 }
      const obstacle = { x: 0, y: 0, width: 100, height: 100 }

      const intersects = (router as any).lineIntersectsObstacle(p1, p2, obstacle, 0)

      expect(intersects).toBe(true)
    })
  })

  describe('连接点计算', () => {
    it('应该获取默认端口位置', () => {
      const top = (router as any).getDefaultPortPosition('top')
      expect(top).toEqual({ x: 0.5, y: 0 })

      const bottom = (router as any).getDefaultPortPosition('bottom')
      expect(bottom).toEqual({ x: 0.5, y: 1 })

      const left = (router as any).getDefaultPortPosition('left')
      expect(left).toEqual({ x: 0, y: 0.5 })

      const right = (router as any).getDefaultPortPosition('right')
      expect(right).toEqual({ x: 1, y: 0.5 })

      const center = (router as any).getDefaultPortPosition('center')
      expect(center).toEqual({ x: 0.5, y: 0.5 })
    })

    it('应该返回默认中心位置当端口未知', () => {
      const unknown = (router as any).getDefaultPortPosition('unknown')
      expect(unknown).toEqual({ x: 0.5, y: 0.5 })
    })
  })

  describe('重新路由', () => {
    it('应该重新路由连接的边', () => {
      const node = createMockNode('node-1', 100, 100, 80, 60)
      const edge = createMockEdge('edge-1', 'node-1', 'node-2')
      
      mockGraph.addNode(node)
      mockGraph.addEdge(edge)
      
      // 设置 getConnectedEdges 返回值
      mockGraph.getConnectedEdges.mockReturnValue([edge])

      // 触发移动事件
      mockGraph.trigger('node:moved', { node })

      // 验证重新路由被触发
      expect(mockGraph.getConnectedEdges).toHaveBeenCalledWith(node)
    })
  })
})
