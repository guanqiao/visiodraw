import type { ShapeData } from '@stores/x6GraphStore'
import type { Connector } from '../types/connection'
import type { ErColumn, ErConstraint } from '../types/shapeLibrary'

export interface ErSuggestion {
  type: 'error' | 'warning' | 'info'
  nodeId?: string
  tableName?: string
  message: string
  suggestion: string
  category: 'primaryKey' | 'naming' | 'orphan' | 'dataType' | 'relationship' | 'bestPractice'
}

export function analyzeErDiagram(
  nodes: ShapeData[],
  edges: Connector[]
): ErSuggestion[] {
  const suggestions: ErSuggestion[] = []
  
  const erNodes = nodes.filter(n => 
    n.type === 'er-table-entity-with-columns' || 
    n.type === 'er-table-entity'
  )

  erNodes.forEach(node => {
    const tableName = node.text?.split('\n')[0] || 'unnamed'
    const columns = parseColumnsFromText(node.text || '')
    
    // Check for missing primary key
    const hasPrimaryKey = columns.some(col => col.constraints.includes('pk'))
    if (!hasPrimaryKey) {
      suggestions.push({
        type: 'warning',
        nodeId: node.id,
        tableName,
        message: `表 "${tableName}" 缺少主键`,
        suggestion: '建议添加主键列（如 id INT PRIMARY KEY）',
        category: 'primaryKey',
      })
    }

    // Check naming conventions
    if (tableName.includes(' ') || tableName !== tableName.toLowerCase()) {
      suggestions.push({
        type: 'info',
        nodeId: node.id,
        tableName,
        message: `表名 "${tableName}" 不符合命名规范`,
        suggestion: '建议使用小写字母和下划线，如 user_account',
        category: 'naming',
      })
    }

    // Check column naming
    columns.forEach(col => {
      if (col.name.includes(' ') || col.name !== col.name.toLowerCase()) {
        suggestions.push({
          type: 'info',
          nodeId: node.id,
          tableName,
          message: `列名 "${col.name}" 不符合命名规范`,
          suggestion: '建议使用小写字母和下划线',
          category: 'naming',
        })
      }

      // Check for reserved words
      const reservedWords = ['order', 'group', 'select', 'from', 'where', 'table', 'index']
      if (reservedWords.includes(col.name.toLowerCase())) {
        suggestions.push({
          type: 'warning',
          nodeId: node.id,
          tableName,
          message: `列名 "${col.name}" 是SQL保留字`,
          suggestion: '建议使用其他名称或添加引号',
          category: 'naming',
        })
      }
    })

    // Check for missing created_at/updated_at
    const hasCreatedAt = columns.some(col => 
      col.name.toLowerCase() === 'created_at' || col.name.toLowerCase() === 'createddate'
    )
    const hasUpdatedAt = columns.some(col => 
      col.name.toLowerCase() === 'updated_at' || col.name.toLowerCase() === 'modifieddate'
    )
    if (!hasCreatedAt && !hasUpdatedAt) {
      suggestions.push({
        type: 'info',
        nodeId: node.id,
        tableName,
        message: `表 "${tableName}" 缺少时间戳字段`,
        suggestion: '建议添加 created_at 和 updated_at 字段',
        category: 'bestPractice',
      })
    }

    // Check for varchar without length
    columns.forEach(col => {
      if (col.type.toLowerCase() === 'varchar' && !col.type.includes('(')) {
        suggestions.push({
          type: 'info',
          nodeId: node.id,
          tableName,
          message: `列 "${col.name}" 的 VARCHAR 类型未指定长度`,
          suggestion: '建议指定长度，如 VARCHAR(255)',
          category: 'dataType',
        })
      }
    })
  })

  // Check for orphan tables (no relationships)
  const connectedNodeIds = new Set<string>()
  edges.forEach(edge => {
    if (edge.sourceShapeId) connectedNodeIds.add(edge.sourceShapeId)
    if (edge.targetShapeId) connectedNodeIds.add(edge.targetShapeId)
  })

  erNodes.forEach(node => {
    if (!connectedNodeIds.has(node.id)) {
      const tableName = node.text?.split('\n')[0] || 'unnamed'
      suggestions.push({
        type: 'warning',
        nodeId: node.id,
        tableName,
        message: `表 "${tableName}" 是孤立表（无关系连接）`,
        suggestion: '检查是否需要添加外键关系',
        category: 'orphan',
      })
    }
  })

  // Check for circular relationships
  const circularRelations = detectCircularRelationships(erNodes, edges)
  circularRelations.forEach(cycle => {
    suggestions.push({
      type: 'warning',
      message: `检测到循环关系: ${cycle.join(' -> ')}`,
      suggestion: '循环关系可能导致数据一致性问题，请检查设计',
      category: 'relationship',
    })
  })

  return suggestions
}

function parseColumnsFromText(text: string): { name: string; type: string; constraints: ErConstraint[] }[] {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length <= 1) return []
  
  return lines.slice(1).map(line => {
    const constraintMatch = line.match(/^(.+?)\s*\[(.+)\]\s*$/)
    
    if (constraintMatch) {
      const name = constraintMatch[1].trim().split(/\s+/)[0]
      const type = constraintMatch[1].trim().split(/\s+/).slice(1).join(' ') || 'varchar'
      const constraintStr = constraintMatch[2]
      
      const constraints: ErConstraint[] = []
      if (constraintStr.includes('pk')) constraints.push('pk')
      if (constraintStr.includes('fk')) constraints.push('fk')
      if (constraintStr.includes('unique')) constraints.push('unique')
      if (constraintStr.includes('notnull')) constraints.push('notnull')
      if (constraintStr.includes('auto')) constraints.push('auto')
      
      return { name, type, constraints }
    }
    
    const parts = line.trim().split(/\s+/)
    return { name: parts[0], type: parts[1] || 'varchar', constraints: [] }
  })
}

function detectCircularRelationships(
  nodes: ShapeData[],
  edges: Connector[]
): string[][] {
  const cycles: string[][] = []
  const nodeMap = new Map<string, string>()
  
  nodes.forEach(node => {
    const tableName = node.text?.split('\n')[0] || 'unnamed'
    nodeMap.set(node.id, tableName)
  })

  const adjacencyList = new Map<string, string[]>()
  edges.forEach(edge => {
    if (edge.sourceShapeId && edge.targetShapeId) {
      const neighbors = adjacencyList.get(edge.sourceShapeId) || []
      neighbors.push(edge.targetShapeId)
      adjacencyList.set(edge.sourceShapeId, neighbors)
    }
  })

  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const path: string[] = []

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)
    path.push(nodeId)

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true
      } else if (recursionStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor)
        const cycle = path.slice(cycleStart).map(id => nodeMap.get(id) || id)
        cycle.push(nodeMap.get(neighbor) || neighbor)
        cycles.push(cycle)
        return true
      }
    }

    path.pop()
    recursionStack.delete(nodeId)
    return false
  }

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id)
    }
  })

  return cycles
}

export function getSuggestionSummary(suggestions: ErSuggestion[]): {
  errors: number
  warnings: number
  infos: number
  categories: Record<string, number>
} {
  return {
    errors: suggestions.filter(s => s.type === 'error').length,
    warnings: suggestions.filter(s => s.type === 'warning').length,
    infos: suggestions.filter(s => s.type === 'info').length,
    categories: suggestions.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}
