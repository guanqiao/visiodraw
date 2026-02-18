import { describe, it, expect, beforeEach } from 'vitest'
import { SequenceObjectPool } from '../sequenceDiagramObjectPool'

describe('SequenceObjectPool', () => {
  let pool: SequenceObjectPool

  beforeEach(() => {
    pool = new SequenceObjectPool()
  })

  describe('acquireNode', () => {
    it('should acquire nodes from pool', () => {
      const nodes = pool.acquireNode('uml-participant', 3)

      expect(nodes).toHaveLength(3)
      nodes.forEach(node => {
        expect(node.type).toBe('uml-participant')
        expect(node.id).toBeDefined()
      })
    })

    it('should reuse released nodes', () => {
      const nodes1 = pool.acquireNode('uml-participant', 2)
      const ids1 = nodes1.map(n => n.id)

      pool.releaseNode('uml-participant', nodes1)

      const nodes2 = pool.acquireNode('uml-participant', 2)
      const ids2 = nodes2.map(n => n.id)

      // 应该复用之前的节点
      expect(ids2).toEqual(ids1)
    })

    it('should reset node properties when reusing', () => {
      const nodes = pool.acquireNode('uml-participant', 1)
      nodes[0].x = 100
      nodes[0].y = 200
      nodes[0].text = 'test'

      pool.releaseNode('uml-participant', nodes)

      const nodes2 = pool.acquireNode('uml-participant', 1)
      expect(nodes2[0].x).toBe(0)
      expect(nodes2[0].y).toBe(0)
      expect(nodes2[0].text).toBe('')
    })
  })

  describe('acquireEdge', () => {
    it('should acquire edges from pool', () => {
      const edges = pool.acquireEdge('message', 2)

      expect(edges).toHaveLength(2)
      edges.forEach(edge => {
        expect(edge.id).toBeDefined()
        expect(edge.style).toBe('straight')
      })
    })

    it('should reuse released edges', () => {
      const edges1 = pool.acquireEdge('message', 1)
      const id1 = edges1[0].id

      pool.releaseEdge('message', edges1)

      const edges2 = pool.acquireEdge('message', 1)
      const id2 = edges2[0].id

      expect(id2).toBe(id1)
    })

    it('should reset edge properties when reusing', () => {
      const edges = pool.acquireEdge('message', 1)
      edges[0].sourceShapeId = 'shape-1'
      edges[0].targetShapeId = 'shape-2'
      edges[0].labels = [{ id: 'label-1', text: 'test', position: 0.5 }]

      pool.releaseEdge('message', edges)

      const edges2 = pool.acquireEdge('message', 1)
      expect(edges2[0].sourceShapeId).toBe('')
      expect(edges2[0].targetShapeId).toBe('')
      expect(edges2[0].labels).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return correct stats', () => {
      pool.acquireNode('uml-participant', 3)
      pool.acquireNode('uml-actor', 2)
      pool.acquireEdge('message', 4)

      const stats = pool.getStats()

      expect(stats.nodeTypes).toBe(2)
      expect(stats.totalNodes).toBe(5)
      expect(stats.usedNodes).toBe(5)
      expect(stats.edgeTypes).toBe(1)
      expect(stats.totalEdges).toBe(4)
      expect(stats.usedEdges).toBe(4)
    })

    it('should track released nodes correctly', () => {
      const nodes = pool.acquireNode('uml-participant', 2)
      pool.releaseNode('uml-participant', nodes)

      const stats = pool.getStats()
      expect(stats.totalNodes).toBe(2)
      expect(stats.usedNodes).toBe(0)
    })
  })

  describe('cleanup', () => {
    it('should remove idle objects after timeout', () => {
      const nodes = pool.acquireNode('uml-participant', 2)
      pool.releaseNode('uml-participant', nodes)

      // 模拟时间流逝（超过60秒）
      const originalDateNow = Date.now
      Date.now = () => originalDateNow() + 61000

      pool.cleanup()

      const stats = pool.getStats()
      expect(stats.totalNodes).toBe(0)

      // 恢复Date.now
      Date.now = originalDateNow
    })

    it('should keep in-use objects', () => {
      pool.acquireNode('uml-participant', 2)
      // 不释放，保持in-use状态

      const originalDateNow = Date.now
      Date.now = () => originalDateNow() + 61000

      pool.cleanup()

      const stats = pool.getStats()
      expect(stats.totalNodes).toBe(2)

      Date.now = originalDateNow
    })
  })

  describe('clear', () => {
    it('should clear all pools', () => {
      pool.acquireNode('uml-participant', 3)
      pool.acquireEdge('message', 2)

      pool.clear()

      const stats = pool.getStats()
      expect(stats.totalNodes).toBe(0)
      expect(stats.totalEdges).toBe(0)
      expect(stats.nodeTypes).toBe(0)
      expect(stats.edgeTypes).toBe(0)
    })
  })

  describe('different types', () => {
    it('should handle different node types separately', () => {
      pool.acquireNode('uml-participant', 2)
      pool.acquireNode('uml-actor', 3)

      const stats = pool.getStats()
      expect(stats.nodeTypes).toBe(2)
      expect(stats.totalNodes).toBe(5)
    })

    it('should handle different edge types separately', () => {
      pool.acquireEdge('sync', 2)
      pool.acquireEdge('async', 3)

      const stats = pool.getStats()
      expect(stats.edgeTypes).toBe(2)
      expect(stats.totalEdges).toBe(5)
    })
  })
})
