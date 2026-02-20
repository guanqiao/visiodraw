import { describe, it, expect } from 'vitest'
import { analyzeErDiagram, getSuggestionSummary, type ErSuggestion } from '../erAnalyzer'
import type { ShapeData } from '@stores/x6GraphStore'
import type { Connector } from '../../types/connection'

function createErTableNode(
  id: string,
  tableName: string,
  columns: { name: string; type: string; constraints?: string[] }[]
): ShapeData {
  const lines = [tableName]
  columns.forEach(col => {
    const constraints = col.constraints?.length ? ` [${col.constraints.join(',')}]` : ''
    lines.push(`${col.name} ${col.type}${constraints}`)
  })
  
  return {
    id,
    type: 'er-table-entity-with-columns',
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    text: lines.join('\n'),
  }
}

function createConnector(sourceId: string, targetId: string): Connector {
  return {
    id: `edge-${sourceId}-${targetId}`,
    sourceShapeId: sourceId,
    sourcePointId: 'right',
    targetShapeId: targetId,
    targetPointId: 'left',
    style: 'straight',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'arrow',
    stroke: '#333',
    strokeWidth: 1,
  }
}

describe('erAnalyzer', () => {
  describe('analyzeErDiagram', () => {
    it('should detect missing primary key', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'users', [
          { name: 'name', type: 'varchar' },
          { name: 'email', type: 'varchar' },
        ]),
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      const pkWarning = suggestions.find(s => s.category === 'primaryKey')
      
      expect(pkWarning).toBeDefined()
      expect(pkWarning?.message).toContain('缺少主键')
    })

    it('should not warn about primary key when present', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'users', [
          { name: 'id', type: 'int', constraints: ['pk'] },
          { name: 'name', type: 'varchar' },
        ]),
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      const pkWarning = suggestions.find(s => s.category === 'primaryKey')
      
      expect(pkWarning).toBeUndefined()
    })

    it('should detect naming convention issues', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'UserTable', [
          { name: 'UserName', type: 'varchar' },
        ]),
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      const namingIssues = suggestions.filter(s => s.category === 'naming')
      
      expect(namingIssues.length).toBeGreaterThan(0)
    })

    it('should detect reserved words in column names', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'orders', [
          { name: 'id', type: 'int', constraints: ['pk'] },
          { name: 'order', type: 'varchar' },
          { name: 'group', type: 'varchar' },
        ]),
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      const reservedWordWarnings = suggestions.filter(
        s => s.category === 'naming' && s.message.includes('保留字')
      )
      
      expect(reservedWordWarnings.length).toBe(2)
    })

    it('should detect orphan tables', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'users', [
          { name: 'id', type: 'int', constraints: ['pk'] },
        ]),
        createErTableNode('table2', 'products', [
          { name: 'id', type: 'int', constraints: ['pk'] },
        ]),
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      const orphanWarnings = suggestions.filter(s => s.category === 'orphan')
      
      expect(orphanWarnings.length).toBe(2)
    })

    it('should not warn about orphan when connected', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'users', [
          { name: 'id', type: 'int', constraints: ['pk'] },
        ]),
        createErTableNode('table2', 'orders', [
          { name: 'id', type: 'int', constraints: ['pk'] },
        ]),
      ]
      
      const edges: Connector[] = [createConnector('table1', 'table2')]
      const suggestions = analyzeErDiagram(nodes, edges)
      const orphanWarnings = suggestions.filter(s => s.category === 'orphan')
      
      expect(orphanWarnings.length).toBe(0)
    })

    it('should detect missing timestamp fields', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'users', [
          { name: 'id', type: 'int', constraints: ['pk'] },
          { name: 'name', type: 'varchar' },
        ]),
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      const timestampSuggestion = suggestions.find(
        s => s.category === 'bestPractice' && s.message.includes('时间戳')
      )
      
      expect(timestampSuggestion).toBeDefined()
    })

    it('should not warn about timestamp when present', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'users', [
          { name: 'id', type: 'int', constraints: ['pk'] },
          { name: 'created_at', type: 'timestamp' },
          { name: 'updated_at', type: 'timestamp' },
        ]),
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      const timestampSuggestion = suggestions.find(
        s => s.category === 'bestPractice' && s.message.includes('时间戳')
      )
      
      expect(timestampSuggestion).toBeUndefined()
    })

    it('should detect varchar without length', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'users', [
          { name: 'id', type: 'int', constraints: ['pk'] },
          { name: 'name', type: 'varchar' },
        ]),
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      const varcharSuggestion = suggestions.find(
        s => s.category === 'dataType' && s.message.includes('VARCHAR')
      )
      
      expect(varcharSuggestion).toBeDefined()
    })

    it('should detect circular relationships', () => {
      const nodes: ShapeData[] = [
        createErTableNode('table1', 'users', [
          { name: 'id', type: 'int', constraints: ['pk'] },
        ]),
        createErTableNode('table2', 'orders', [
          { name: 'id', type: 'int', constraints: ['pk'] },
        ]),
        createErTableNode('table3', 'items', [
          { name: 'id', type: 'int', constraints: ['pk'] },
        ]),
      ]
      
      const edges: Connector[] = [
        createConnector('table1', 'table2'),
        createConnector('table2', 'table3'),
        createConnector('table3', 'table1'),
      ]
      
      const suggestions = analyzeErDiagram(nodes, edges)
      const circularWarning = suggestions.find(s => s.category === 'relationship')
      
      expect(circularWarning).toBeDefined()
      expect(circularWarning?.message).toContain('循环关系')
    })

    it('should return empty array for empty input', () => {
      const suggestions = analyzeErDiagram([], [])
      expect(suggestions).toEqual([])
    })

    it('should handle nodes without text', () => {
      const nodes: ShapeData[] = [
        {
          id: 'table1',
          type: 'er-table-entity-with-columns',
          x: 0,
          y: 0,
          width: 200,
          height: 100,
        },
      ]
      
      const suggestions = analyzeErDiagram(nodes, [])
      expect(Array.isArray(suggestions)).toBe(true)
    })
  })

  describe('getSuggestionSummary', () => {
    it('should count suggestions by type', () => {
      const suggestions: ErSuggestion[] = [
        { type: 'error', message: 'Error 1', suggestion: 'Fix it', category: 'primaryKey' },
        { type: 'warning', message: 'Warning 1', suggestion: 'Fix it', category: 'naming' },
        { type: 'warning', message: 'Warning 2', suggestion: 'Fix it', category: 'naming' },
        { type: 'info', message: 'Info 1', suggestion: 'Fix it', category: 'bestPractice' },
      ]
      
      const summary = getSuggestionSummary(suggestions)
      
      expect(summary.errors).toBe(1)
      expect(summary.warnings).toBe(2)
      expect(summary.infos).toBe(1)
    })

    it('should count suggestions by category', () => {
      const suggestions: ErSuggestion[] = [
        { type: 'warning', message: 'M1', suggestion: 'S1', category: 'primaryKey' },
        { type: 'warning', message: 'M2', suggestion: 'S2', category: 'primaryKey' },
        { type: 'warning', message: 'M3', suggestion: 'S3', category: 'naming' },
      ]
      
      const summary = getSuggestionSummary(suggestions)
      
      expect(summary.categories.primaryKey).toBe(2)
      expect(summary.categories.naming).toBe(1)
    })

    it('should return zeros for empty array', () => {
      const summary = getSuggestionSummary([])
      
      expect(summary.errors).toBe(0)
      expect(summary.warnings).toBe(0)
      expect(summary.infos).toBe(0)
      expect(Object.keys(summary.categories).length).toBe(0)
    })
  })
})
