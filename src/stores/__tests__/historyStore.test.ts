import { describe, it, expect, beforeEach } from 'vitest'
import { useHistoryStore } from '../historyStore'

describe('historyStore', () => {
  beforeEach(() => {
    useHistoryStore.setState({
      past: [],
      future: [],
    })
  })

  describe('pushState', () => {
    it('should add state to past', () => {
      const state1 = { nodes: [{ id: '1' }], edges: [] }
      
      useHistoryStore.getState().pushState(state1)
      
      expect(useHistoryStore.getState().past).toHaveLength(1)
      expect(useHistoryStore.getState().past[0]).toEqual(state1)
    })

    it('should clear future when new state is pushed', () => {
      useHistoryStore.setState({ future: [{ nodes: [], edges: [] }] })
      
      useHistoryStore.getState().pushState({ nodes: [], edges: [] })
      
      expect(useHistoryStore.getState().future).toHaveLength(0)
    })

    it('should limit history size', () => {
      const store = useHistoryStore.getState()
      
      for (let i = 0; i < 60; i++) {
        store.pushState({ nodes: [{ id: String(i) }], edges: [] })
      }
      
      expect(useHistoryStore.getState().past.length).toBeLessThanOrEqual(50)
    })
  })

  describe('undo', () => {
    it('should return previous state and update history', () => {
      const state1 = { nodes: [], edges: [] }
      const state2 = { nodes: [{ id: '1' }], edges: [] }
      
      useHistoryStore.getState().pushState(state1)
      useHistoryStore.getState().pushState(state2)
      
      const currentState = { nodes: [{ id: '1' }, { id: '2' }], edges: [] }
      const undoResult = useHistoryStore.getState().undo(currentState)
      
      expect(undoResult).toEqual(state2)
      expect(useHistoryStore.getState().future).toHaveLength(1)
      expect(useHistoryStore.getState().future[0]).toEqual(currentState)
    })

    it('should return null if no past state', () => {
      const result = useHistoryStore.getState().undo({ nodes: [], edges: [] })
      
      expect(result).toBeNull()
    })
  })

  describe('redo', () => {
    it('should return next state from future', () => {
      const futureState = { nodes: [{ id: '1' }], edges: [] }
      useHistoryStore.setState({ future: [futureState] })
      
      const currentState = { nodes: [], edges: [] }
      const redoResult = useHistoryStore.getState().redo(currentState)
      
      expect(redoResult).toEqual(futureState)
      expect(useHistoryStore.getState().past).toHaveLength(1)
      expect(useHistoryStore.getState().past[0]).toEqual(currentState)
    })

    it('should return null if no future state', () => {
      const result = useHistoryStore.getState().redo({ nodes: [], edges: [] })
      
      expect(result).toBeNull()
    })
  })

  describe('canUndo/canRedo', () => {
    it('should correctly report undo availability', () => {
      expect(useHistoryStore.getState().canUndo()).toBe(false)
      
      useHistoryStore.getState().pushState({ nodes: [], edges: [] })
      
      expect(useHistoryStore.getState().canUndo()).toBe(true)
    })

    it('should correctly report redo availability', () => {
      expect(useHistoryStore.getState().canRedo()).toBe(false)
      
      useHistoryStore.setState({ future: [{ nodes: [], edges: [] }] })
      
      expect(useHistoryStore.getState().canRedo()).toBe(true)
    })
  })

  describe('clearHistory', () => {
    it('should clear all history', () => {
      useHistoryStore.setState({
        past: [{ nodes: [], edges: [] }],
        future: [{ nodes: [], edges: [] }],
      })
      
      useHistoryStore.getState().clearHistory()
      
      expect(useHistoryStore.getState().past).toHaveLength(0)
      expect(useHistoryStore.getState().future).toHaveLength(0)
    })
  })
})
