import { describe, it, expect, beforeEach } from 'vitest'
import { useCanvasConfigStore } from '../canvasConfigStore'

describe('canvasConfigStore', () => {
  beforeEach(() => {
    useCanvasConfigStore.setState({
      zoom: 1,
      gridEnabled: true,
      gridType: 'dot',
      gridSize: 10,
      canvasBgColor: '#f0f2f5',
      snapToGrid: false,
    })
  })

  describe('setZoom', () => {
    it('should set zoom level', () => {
      useCanvasConfigStore.getState().setZoom(1.5)
      
      expect(useCanvasConfigStore.getState().zoom).toBe(1.5)
    })

    it('should accept zoom updater function', () => {
      useCanvasConfigStore.setState({ zoom: 1 })
      
      useCanvasConfigStore.getState().setZoom(prev => prev + 0.1)
      
      expect(useCanvasConfigStore.getState().zoom).toBe(1.1)
    })

    it('should clamp zoom to valid range', () => {
      useCanvasConfigStore.getState().setZoom(0.05)
      expect(useCanvasConfigStore.getState().zoom).toBe(0.1)

      useCanvasConfigStore.getState().setZoom(5)
      expect(useCanvasConfigStore.getState().zoom).toBe(3)
    })
  })

  describe('toggleGrid', () => {
    it('should toggle grid visibility', () => {
      useCanvasConfigStore.getState().toggleGrid()
      
      expect(useCanvasConfigStore.getState().gridEnabled).toBe(false)
      
      useCanvasConfigStore.getState().toggleGrid()
      
      expect(useCanvasConfigStore.getState().gridEnabled).toBe(true)
    })
  })

  describe('setGridType', () => {
    it('should set grid type', () => {
      useCanvasConfigStore.getState().setGridType('line')
      
      expect(useCanvasConfigStore.getState().gridType).toBe('line')
    })
  })

  describe('setGridSize', () => {
    it('should set grid size', () => {
      useCanvasConfigStore.getState().setGridSize(20)
      
      expect(useCanvasConfigStore.getState().gridSize).toBe(20)
    })
  })

  describe('setCanvasBgColor', () => {
    it('should set canvas background color', () => {
      useCanvasConfigStore.getState().setCanvasBgColor('#ffffff')
      
      expect(useCanvasConfigStore.getState().canvasBgColor).toBe('#ffffff')
    })
  })

  describe('toggleSnapToGrid', () => {
    it('should toggle snap to grid', () => {
      useCanvasConfigStore.getState().toggleSnapToGrid()
      
      expect(useCanvasConfigStore.getState().snapToGrid).toBe(true)
    })
  })

  describe('zoomIn', () => {
    it('should increase zoom by 0.1', () => {
      useCanvasConfigStore.setState({ zoom: 1 })
      
      useCanvasConfigStore.getState().zoomIn()
      
      expect(useCanvasConfigStore.getState().zoom).toBe(1.1)
    })

    it('should not exceed max zoom', () => {
      useCanvasConfigStore.setState({ zoom: 2.95 })
      
      useCanvasConfigStore.getState().zoomIn()
      
      expect(useCanvasConfigStore.getState().zoom).toBe(3)
    })
  })

  describe('zoomOut', () => {
    it('should decrease zoom by 0.1', () => {
      useCanvasConfigStore.setState({ zoom: 1.5 })
      
      useCanvasConfigStore.getState().zoomOut()
      
      expect(useCanvasConfigStore.getState().zoom).toBe(1.4)
    })

    it('should not go below min zoom', () => {
      useCanvasConfigStore.setState({ zoom: 0.15 })
      
      useCanvasConfigStore.getState().zoomOut()
      
      expect(useCanvasConfigStore.getState().zoom).toBe(0.1)
    })
  })

  describe('resetZoom', () => {
    it('should reset zoom to 1', () => {
      useCanvasConfigStore.setState({ zoom: 2 })
      
      useCanvasConfigStore.getState().resetZoom()
      
      expect(useCanvasConfigStore.getState().zoom).toBe(1)
    })
  })
})
