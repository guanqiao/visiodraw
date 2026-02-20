import { describe, it, expect } from 'vitest'
import {
  calculateLayout,
  calculateGridLayout,
  parseDirectionFromCode,
  calculateNodeSize,
  calculateSwimlaneLayout,
  groupNodesBySwimlane,
  calculateSwimlaneBounds,
  defaultLayoutConfig,
} from '../layoutEngine'
import type { TemplateNode, TemplateEdge } from '../../types/diagramTemplate'

describe('LayoutEngine', () => {
  describe('calculateLayout', () => {
    it('should return empty array for empty nodes', () => {
      const result = calculateLayout([], [])
      expect(result).toEqual([])
    })

    it('should layout nodes with grid when no edges', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A' },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B' },
        { id: 'C', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'C' },
      ]
      
      const result = calculateLayout(nodes, [])
      
      expect(result.length).toBe(3)
      expect(result[0].x).toBeDefined()
      expect(result[0].y).toBeDefined()
    })

    it('should layout nodes with dagre when edges exist', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A' },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B' },
      ]
      
      const edges: TemplateEdge[] = [
        { id: 'e1', source: 'A', target: 'B' },
      ]
      
      const result = calculateLayout(nodes, edges)
      
      expect(result.length).toBe(2)
      
      const nodeA = result.find(n => n.id === 'A')
      const nodeB = result.find(n => n.id === 'B')
      
      expect(nodeA!.x).toBeDefined()
      expect(nodeB!.x).toBeDefined()
    })

    it('should respect direction config', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A' },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B' },
      ]
      
      const edges: TemplateEdge[] = [
        { id: 'e1', source: 'A', target: 'B' },
      ]
      
      const resultTB = calculateLayout(nodes, edges, { direction: 'TB' })
      const resultLR = calculateLayout(nodes, edges, { direction: 'LR' })
      
      expect(resultTB.length).toBe(2)
      expect(resultLR.length).toBe(2)
    })

    it('should handle complex graph', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A' },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B' },
        { id: 'C', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'C' },
        { id: 'D', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'D' },
      ]
      
      const edges: TemplateEdge[] = [
        { id: 'e1', source: 'A', target: 'B' },
        { id: 'e2', source: 'A', target: 'C' },
        { id: 'e3', source: 'B', target: 'D' },
        { id: 'e4', source: 'C', target: 'D' },
      ]
      
      const result = calculateLayout(nodes, edges)
      
      expect(result.length).toBe(4)
    })
  })

  describe('calculateGridLayout', () => {
    it('should arrange nodes in grid', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A' },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B' },
        { id: 'C', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'C' },
        { id: 'D', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'D' },
      ]
      
      const result = calculateGridLayout(nodes)
      
      expect(result.length).toBe(4)
      
      const positions = result.map(n => ({ x: n.x, y: n.y }))
      const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`))
      expect(uniquePositions.size).toBe(4)
    })

    it('should respect padding config', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A' },
      ]
      
      const result = calculateGridLayout(nodes, { padding: 100 })
      
      expect(result[0].x).toBe(100)
      expect(result[0].y).toBe(100)
    })
  })

  describe('parseDirectionFromCode', () => {
    it('should parse TD direction', () => {
      expect(parseDirectionFromCode('flowchart TD\nA --> B')).toBe('TB')
    })

    it('should parse TB direction', () => {
      expect(parseDirectionFromCode('flowchart TB\nA --> B')).toBe('TB')
    })

    it('should parse LR direction', () => {
      expect(parseDirectionFromCode('flowchart LR\nA --> B')).toBe('LR')
    })

    it('should parse RL direction', () => {
      expect(parseDirectionFromCode('flowchart RL\nA --> B')).toBe('RL')
    })

    it('should parse BT direction', () => {
      expect(parseDirectionFromCode('flowchart BT\nA --> B')).toBe('BT')
    })

    it('should default to TB for unknown direction', () => {
      expect(parseDirectionFromCode('flowchart\nA --> B')).toBe('TB')
    })

    it('should handle graph keyword', () => {
      expect(parseDirectionFromCode('graph LR\nA --> B')).toBe('LR')
    })
  })

  describe('calculateNodeSize', () => {
    it('should return fixed size for initial/final nodes', () => {
      const initialSize = calculateNodeSize('uml-initial', '')
      const finalSize = calculateNodeSize('uml-final', '')
      
      expect(initialSize).toEqual({ width: 30, height: 30 })
      expect(finalSize).toEqual({ width: 30, height: 30 })
    })

    it('should return fixed size for decision nodes', () => {
      const size = calculateNodeSize('uml-decision', '')
      
      expect(size).toEqual({ width: 80, height: 80 })
    })

    it('should return fixed size for fork nodes', () => {
      const size = calculateNodeSize('uml-fork', '')
      
      expect(size).toEqual({ width: 20, height: 80 })
    })

    it('should calculate size based on text for action nodes', () => {
      const shortSize = calculateNodeSize('uml-action', 'A')
      const longSize = calculateNodeSize('uml-action', 'This is a very long text')
      
      expect(longSize.width).toBeGreaterThan(shortSize.width)
    })

    it('should handle multiline text', () => {
      const singleLine = calculateNodeSize('uml-action', 'Single')
      const multiLine = calculateNodeSize('uml-action', 'Line1\nLine2\nLine3')
      
      expect(multiLine.height).toBeGreaterThan(singleLine.height)
    })

    it('should return circle size for circle shapes', () => {
      const size = calculateNodeSize('mermaid-circle', 'X')
      
      expect(size.width).toBe(size.height)
    })

    it('should return stadium size', () => {
      const size = calculateNodeSize('mermaid-stadium', 'Start')
      
      expect(size.width).toBeGreaterThanOrEqual(100)
      expect(size.height).toBeGreaterThanOrEqual(40)
    })

    it('should respect min dimensions', () => {
      const size = calculateNodeSize('uml-action', '', { minWidth: 200, minHeight: 100 })
      
      expect(size.width).toBeGreaterThanOrEqual(200)
      expect(size.height).toBeGreaterThanOrEqual(100)
    })
  })

  describe('calculateSwimlaneLayout', () => {
    it('should separate swimlane nodes from regular nodes', () => {
      const nodes: TemplateNode[] = [
        { id: 'lane1', type: 'uml-swimlane-vertical', x: 0, y: 0, width: 200, height: 300, text: 'Lane 1' },
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A', data: { swimlaneId: 'lane1' } },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B', data: { swimlaneId: 'lane1' } },
      ]
      
      const edges: TemplateEdge[] = [
        { id: 'e1', source: 'A', target: 'B' },
      ]
      
      const result = calculateSwimlaneLayout(nodes, edges, ['lane1'])
      
      expect(result.length).toBe(3)
    })

    it('should layout nodes within swimlanes', () => {
      const nodes: TemplateNode[] = [
        { id: 'lane1', type: 'uml-swimlane-vertical', x: 0, y: 0, width: 200, height: 300, text: 'Lane 1' },
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A', data: { swimlaneId: 'lane1' } },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B', data: { swimlaneId: 'lane1' } },
      ]
      
      const edges: TemplateEdge[] = [
        { id: 'e1', source: 'A', target: 'B' },
      ]
      
      const result = calculateSwimlaneLayout(nodes, edges, ['lane1'])
      
      const nodeA = result.find(n => n.id === 'A')
      const nodeB = result.find(n => n.id === 'B')
      
      expect(nodeA!.x).toBeDefined()
      expect(nodeB!.x).toBeDefined()
    })
  })

  describe('groupNodesBySwimlane', () => {
    it('should group nodes by swimlane', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A', data: { swimlaneId: 'lane1' } },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B', data: { swimlaneId: 'lane1' } },
        { id: 'C', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'C', data: { swimlaneId: 'lane2' } },
      ]
      
      const groups = groupNodesBySwimlane(nodes)
      
      expect(groups.size).toBe(2)
      expect(groups.get('lane1')!.length).toBe(2)
      expect(groups.get('lane2')!.length).toBe(1)
    })

    it('should put nodes without swimlane in default group', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'A' },
        { id: 'B', type: 'uml-action', x: 0, y: 0, width: 100, height: 50, text: 'B', data: { swimlaneId: 'lane1' } },
      ]
      
      const groups = groupNodesBySwimlane(nodes)
      
      expect(groups.size).toBe(2)
      expect(groups.get('__default__')!.length).toBe(1)
      expect(groups.get('lane1')!.length).toBe(1)
    })
  })

  describe('calculateSwimlaneBounds', () => {
    it('should calculate bounds for swimlane content', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 100, y: 100, width: 100, height: 50, text: 'A', data: { swimlaneId: 'lane1' } },
        { id: 'B', type: 'uml-action', x: 100, y: 200, width: 100, height: 50, text: 'B', data: { swimlaneId: 'lane1' } },
      ]
      
      const bounds = calculateSwimlaneBounds(nodes, 'lane1')
      
      expect(bounds.x).toBeLessThan(100)
      expect(bounds.y).toBeLessThan(100)
      expect(bounds.width).toBeGreaterThan(100)
      expect(bounds.height).toBeGreaterThan(150)
    })

    it('should return default bounds for empty swimlane', () => {
      const nodes: TemplateNode[] = []
      
      const bounds = calculateSwimlaneBounds(nodes, 'lane1')
      
      expect(bounds).toEqual({ x: 0, y: 0, width: 200, height: 150 })
    })

    it('should include padding in bounds', () => {
      const nodes: TemplateNode[] = [
        { id: 'A', type: 'uml-action', x: 100, y: 100, width: 100, height: 50, text: 'A', data: { swimlaneId: 'lane1' } },
      ]
      
      const bounds = calculateSwimlaneBounds(nodes, 'lane1')
      
      expect(bounds.x).toBe(100 - 30)
      expect(bounds.width).toBe(100 + 30 * 2)
    })
  })

  describe('defaultLayoutConfig', () => {
    it('should have expected default values', () => {
      expect(defaultLayoutConfig.direction).toBe('TB')
      expect(defaultLayoutConfig.nodeWidth).toBe(120)
      expect(defaultLayoutConfig.nodeHeight).toBe(60)
      expect(defaultLayoutConfig.rankSpacing).toBe(80)
      expect(defaultLayoutConfig.nodeSpacing).toBe(50)
      expect(defaultLayoutConfig.padding).toBe(50)
    })
  })
})
