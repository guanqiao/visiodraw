import { describe, it, expect } from 'vitest'
import { EdgeStyleManager, EdgeStyleConfig } from '../edgeStyleManager'

describe('edgeStyleManager', () => {
  describe('getDefaultStyle', () => {
    it('should return default style configuration', () => {
      const style = EdgeStyleManager.getDefaultStyle()
      
      expect(style.stroke).toBe('#333333')
      expect(style.strokeWidth).toBe(2)
      expect(style.lineStyle).toBe('solid')
      expect(style.startStyle).toBe('none')
      expect(style.endStyle).toBe('classic')
    })
  })

  describe('applyStyle', () => {
    it('should merge custom style with defaults', () => {
      const customStyle: Partial<EdgeStyleConfig> = {
        stroke: '#1890ff',
        strokeWidth: 3,
      }
      
      const result = EdgeStyleManager.applyStyle(customStyle)
      
      expect(result.stroke).toBe('#1890ff')
      expect(result.strokeWidth).toBe(3)
      expect(result.lineStyle).toBe('solid')
    })
  })

  describe('getMarkerConfig', () => {
    it('should return classic arrow marker', () => {
      const config = EdgeStyleManager.getMarkerConfig('classic')
      
      expect(config).toEqual({
        name: 'classic',
        size: 10,
      })
    })

    it('should return block arrow marker', () => {
      const config = EdgeStyleManager.getMarkerConfig('block')
      
      expect(config).toEqual({
        name: 'block',
        size: 10,
      })
    })

    it('should return null for none', () => {
      const config = EdgeStyleManager.getMarkerConfig('none')
      
      expect(config).toBeNull()
    })
  })

  describe('getLineStyleDash', () => {
    it('should return empty string for solid', () => {
      expect(EdgeStyleManager.getLineStyleDash('solid')).toBe('')
    })

    it('should return dash pattern for dashed', () => {
      expect(EdgeStyleManager.getLineStyleDash('dashed')).toBe('5,5')
    })

    it('should return dot pattern for dotted', () => {
      expect(EdgeStyleManager.getLineStyleDash('dotted')).toBe('2,2')
    })
  })

  describe('getRouterConfig', () => {
    it('should return normal router config', () => {
      const config = EdgeStyleManager.getRouterConfig('normal')
      
      expect(config).toEqual({ name: 'normal' })
    })

    it('should return manhattan router config', () => {
      const config = EdgeStyleManager.getRouterConfig('manhattan')
      
      expect(config).toEqual({
        name: 'manhattan',
        args: {
          padding: 20,
        },
      })
    })

    it('should return orthogonal router config', () => {
      const config = EdgeStyleManager.getRouterConfig('orthogonal')
      
      expect(config).toEqual({ name: 'orthogonal' })
    })
  })

  describe('getConnectorConfig', () => {
    it('should return normal connector config', () => {
      const config = EdgeStyleManager.getConnectorConfig('normal')
      
      expect(config).toEqual({ name: 'normal' })
    })

    it('should return rounded connector config', () => {
      const config = EdgeStyleManager.getConnectorConfig('rounded')
      
      expect(config).toEqual({ name: 'rounded' })
    })

    it('should return smooth connector config', () => {
      const config = EdgeStyleManager.getConnectorConfig('smooth')
      
      expect(config).toEqual({ name: 'smooth' })
    })
  })

  describe('createEdgeAttrs', () => {
    it('should create edge attrs from config', () => {
      const config: EdgeStyleConfig = {
        stroke: '#1890ff',
        strokeWidth: 2,
        lineStyle: 'solid',
        startStyle: 'none',
        endStyle: 'classic',
      }
      
      const attrs = EdgeStyleManager.createEdgeAttrs(config)
      
      expect(attrs.line.stroke).toBe('#1890ff')
      expect(attrs.line.strokeWidth).toBe(2)
      expect(attrs.line.targetMarker).toEqual({ name: 'classic', size: 10 })
    })

    it('should handle dashed line style', () => {
      const config: EdgeStyleConfig = {
        stroke: '#333333',
        strokeWidth: 2,
        lineStyle: 'dashed',
        startStyle: 'none',
        endStyle: 'classic',
      }
      
      const attrs = EdgeStyleManager.createEdgeAttrs(config)
      
      expect(attrs.line.strokeDasharray).toBe('5,5')
    })
  })

  describe('preset styles', () => {
    it('should return flowchart arrow style', () => {
      const style = EdgeStyleManager.getPresetStyle('flowchart-arrow')
      
      expect(style.endStyle).toBe('classic')
      expect(style.lineStyle).toBe('solid')
    })

    it('should return er relationship style', () => {
      const style = EdgeStyleManager.getPresetStyle('er-relationship')
      
      expect(style.startStyle).toBe('none')
      expect(style.endStyle).toBe('none')
    })

    it('should return uml dependency style', () => {
      const style = EdgeStyleManager.getPresetStyle('uml-dependency')
      
      expect(style.lineStyle).toBe('dashed')
      expect(style.endStyle).toBe('blockThin')
    })

    it('should return default style for unknown preset', () => {
      const style = EdgeStyleManager.getPresetStyle('unknown')
      
      expect(style).toEqual(EdgeStyleManager.getDefaultStyle())
    })
  })
})
