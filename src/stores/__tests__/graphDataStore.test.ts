import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphDataStore } from '../graphDataStore'
import type { Connector } from '../../types/connection'

const createTestEdge = (overrides: Partial<Connector> = {}): Connector => ({
  id: 'edge-1',
  sourceShapeId: 'node-1',
  targetShapeId: 'node-2',
  sourcePointId: 'default',
  targetPointId: 'default',
  style: 'orthogonal',
  lineStyle: 'solid',
  startStyle: 'none',
  endStyle: 'arrow',
  stroke: '#333',
  strokeWidth: 2,
  ...overrides,
})

describe('graphDataStore', () => {
  beforeEach(() => {
    useGraphDataStore.setState({
      nodes: [],
      edges: [],
      isModified: false,
    })
  })

  describe('Node operations', () => {
    it('should add a node', () => {
      const node = {
        id: 'node-1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 2,
      }

      useGraphDataStore.getState().addNode(node)

      expect(useGraphDataStore.getState().nodes).toHaveLength(1)
      expect(useGraphDataStore.getState().nodes[0].id).toBe('node-1')
      expect(useGraphDataStore.getState().isModified).toBe(true)
    })

    it('should add multiple nodes', () => {
      const nodes = [
        { id: 'node-1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, fill: '#ffffff', stroke: '#333333', strokeWidth: 2 },
        { id: 'node-2', type: 'circle', x: 200, y: 200, width: 100, height: 100, fill: '#ffffff', stroke: '#333333', strokeWidth: 2 },
      ]

      useGraphDataStore.getState().addNodes(nodes)

      expect(useGraphDataStore.getState().nodes).toHaveLength(2)
    })

    it('should update a node', () => {
      const node = { id: 'node-1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, fill: '#ffffff', stroke: '#333333', strokeWidth: 2 }
      useGraphDataStore.getState().addNode(node)

      useGraphDataStore.getState().updateNode('node-1', { x: 150, y: 150 })

      const updatedNode = useGraphDataStore.getState().getNodeById('node-1')
      expect(updatedNode?.x).toBe(150)
      expect(updatedNode?.y).toBe(150)
    })

    it('should delete a node and its related edges', () => {
      const node1 = { id: 'node-1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, fill: '#ffffff', stroke: '#333333', strokeWidth: 2 }
      const node2 = { id: 'node-2', type: 'rectangle', x: 200, y: 200, width: 120, height: 80, fill: '#ffffff', stroke: '#333333', strokeWidth: 2 }
      const edge = createTestEdge({ id: 'edge-1', sourceShapeId: 'node-1', targetShapeId: 'node-2' })

      useGraphDataStore.getState().addNode(node1)
      useGraphDataStore.getState().addNode(node2)
      useGraphDataStore.getState().addEdge(edge)

      useGraphDataStore.getState().deleteNode('node-1')

      expect(useGraphDataStore.getState().nodes).toHaveLength(1)
      expect(useGraphDataStore.getState().edges).toHaveLength(0)
    })

    it('should get node by id', () => {
      const node = { id: 'node-1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, fill: '#ffffff', stroke: '#333333', strokeWidth: 2 }
      useGraphDataStore.getState().addNode(node)

      const found = useGraphDataStore.getState().getNodeById('node-1')
      const notFound = useGraphDataStore.getState().getNodeById('non-existent')

      expect(found).toBeDefined()
      expect(notFound).toBeUndefined()
    })
  })

  describe('Edge operations', () => {
    it('should add an edge', () => {
      const edge = createTestEdge()

      useGraphDataStore.getState().addEdge(edge)

      expect(useGraphDataStore.getState().edges).toHaveLength(1)
      expect(useGraphDataStore.getState().edges[0].id).toBe('edge-1')
    })

    it('should update an edge', () => {
      const edge = createTestEdge()
      useGraphDataStore.getState().addEdge(edge)

      useGraphDataStore.getState().updateEdge('edge-1', { stroke: '#1890ff' })

      const updatedEdge = useGraphDataStore.getState().getEdgeById('edge-1')
      expect(updatedEdge?.stroke).toBe('#1890ff')
    })

    it('should delete an edge', () => {
      const edge = createTestEdge()
      useGraphDataStore.getState().addEdge(edge)

      useGraphDataStore.getState().deleteEdge('edge-1')

      expect(useGraphDataStore.getState().edges).toHaveLength(0)
    })
  })

  describe('Batch operations', () => {
    it('should clear graph', () => {
      const node = { id: 'node-1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, fill: '#ffffff', stroke: '#333333', strokeWidth: 2 }
      const edge = createTestEdge()

      useGraphDataStore.getState().addNode(node)
      useGraphDataStore.getState().addEdge(edge)

      useGraphDataStore.getState().clearGraph()

      expect(useGraphDataStore.getState().nodes).toHaveLength(0)
      expect(useGraphDataStore.getState().edges).toHaveLength(0)
      expect(useGraphDataStore.getState().isModified).toBe(false)
    })
  })

  describe('Computed values', () => {
    it('should return correct counts', () => {
      expect(useGraphDataStore.getState().getNodesCount()).toBe(0)
      expect(useGraphDataStore.getState().getEdgesCount()).toBe(0)

      useGraphDataStore.getState().addNode({ id: 'node-1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, fill: '#ffffff', stroke: '#333333', strokeWidth: 2 })
      useGraphDataStore.getState().addEdge(createTestEdge())

      expect(useGraphDataStore.getState().getNodesCount()).toBe(1)
      expect(useGraphDataStore.getState().getEdgesCount()).toBe(1)
    })
  })
})
