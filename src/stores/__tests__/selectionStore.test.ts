import { describe, it, expect, beforeEach } from 'vitest'
import { useSelectionStore } from '../selectionStore'

describe('selectionStore', () => {
  beforeEach(() => {
    useSelectionStore.setState({
      selectedNodeIds: [],
      selectedEdgeId: null,
    })
  })

  describe('selectNode', () => {
    it('should select a single node', () => {
      useSelectionStore.getState().selectNode('node-1')
      
      expect(useSelectionStore.getState().selectedNodeIds).toEqual(['node-1'])
      expect(useSelectionStore.getState().selectedEdgeId).toBeNull()
    })

    it('should clear selection when null is passed', () => {
      useSelectionStore.setState({ selectedNodeIds: ['node-1'] })
      
      useSelectionStore.getState().selectNode(null)
      
      expect(useSelectionStore.getState().selectedNodeIds).toEqual([])
    })
  })

  describe('selectNodes', () => {
    it('should select multiple nodes', () => {
      useSelectionStore.getState().selectNodes(['node-1', 'node-2', 'node-3'])
      
      expect(useSelectionStore.getState().selectedNodeIds).toEqual(['node-1', 'node-2', 'node-3'])
    })
  })

  describe('toggleNodeSelection', () => {
    it('should add node to selection if not selected', () => {
      useSelectionStore.setState({ selectedNodeIds: ['node-1'] })
      
      useSelectionStore.getState().toggleNodeSelection('node-2')
      
      expect(useSelectionStore.getState().selectedNodeIds).toEqual(['node-1', 'node-2'])
    })

    it('should remove node from selection if already selected', () => {
      useSelectionStore.setState({ selectedNodeIds: ['node-1', 'node-2'] })
      
      useSelectionStore.getState().toggleNodeSelection('node-1')
      
      expect(useSelectionStore.getState().selectedNodeIds).toEqual(['node-2'])
    })
  })

  describe('selectEdge', () => {
    it('should select an edge and clear node selection', () => {
      useSelectionStore.setState({ selectedNodeIds: ['node-1'] })
      
      useSelectionStore.getState().selectEdge('edge-1')
      
      expect(useSelectionStore.getState().selectedEdgeId).toBe('edge-1')
      expect(useSelectionStore.getState().selectedNodeIds).toEqual([])
    })

    it('should clear edge selection when null is passed', () => {
      useSelectionStore.setState({ selectedEdgeId: 'edge-1' })
      
      useSelectionStore.getState().selectEdge(null)
      
      expect(useSelectionStore.getState().selectedEdgeId).toBeNull()
    })
  })

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      useSelectionStore.setState({
        selectedNodeIds: ['node-1', 'node-2'],
        selectedEdgeId: 'edge-1',
      })
      
      useSelectionStore.getState().clearSelection()
      
      expect(useSelectionStore.getState().selectedNodeIds).toEqual([])
      expect(useSelectionStore.getState().selectedEdgeId).toBeNull()
    })
  })

  describe('hasSelection', () => {
    it('should return true when nodes are selected', () => {
      useSelectionStore.setState({ selectedNodeIds: ['node-1'] })
      
      expect(useSelectionStore.getState().hasSelection()).toBe(true)
    })

    it('should return true when edge is selected', () => {
      useSelectionStore.setState({ selectedEdgeId: 'edge-1' })
      
      expect(useSelectionStore.getState().hasSelection()).toBe(true)
    })

    it('should return false when nothing is selected', () => {
      expect(useSelectionStore.getState().hasSelection()).toBe(false)
    })
  })

  describe('selectedCount', () => {
    it('should return correct count of selected items', () => {
      useSelectionStore.setState({ selectedNodeIds: ['node-1', 'node-2'] })
      
      expect(useSelectionStore.getState().selectedCount()).toBe(2)
    })

    it('should count edge as 1', () => {
      useSelectionStore.setState({ selectedEdgeId: 'edge-1' })
      
      expect(useSelectionStore.getState().selectedCount()).toBe(1)
    })
  })
})
