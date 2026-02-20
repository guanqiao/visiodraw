import type { ErColumn } from '../types/shapeLibrary'
import {
  parseCreateTableSQL,
  parseAlterTableSQL,
  parseCreateViewSQL,
  parseCreateIndexSQL,
  parseFullSQL,
  applyAlterStatements,
  type ParsedSqlTable,
  type SqlParseResult,
  type ParsedAlterStatement,
  type ParsedView,
  type ParsedIndex,
  type ExtendedSqlParseResult,
} from './erSqlParser'
import {
  exportTableToSQL,
  exportAllTablesToSQL,
  exportToMermaid,
  exportToPlantUML,
  exportToDbml,
  parseErTableText,
  type SqlDialect,
  type SqlExportOptions,
} from './erSqlExporter'
import {
  calculateErLayout,
  type ErLayoutOptions,
  type ErTableNode,
  type ErLayoutResult,
  type ErLayoutAlgorithm,
} from './erLayoutEngine'

export {
  parseCreateTableSQL,
  parseAlterTableSQL,
  parseCreateViewSQL,
  parseCreateIndexSQL,
  parseFullSQL,
  applyAlterStatements,
  exportTableToSQL,
  exportAllTablesToSQL,
  exportToMermaid,
  exportToPlantUML,
  exportToDbml,
  parseErTableText,
  calculateErLayout,
}

export type {
  ParsedSqlTable,
  SqlParseResult,
  ParsedAlterStatement,
  ParsedView,
  ParsedIndex,
  ExtendedSqlParseResult,
  SqlDialect,
  SqlExportOptions,
  ErLayoutOptions,
  ErTableNode,
  ErLayoutResult,
  ErLayoutAlgorithm,
}

export function generateErNodesFromTables(
  tables: ParsedSqlTable[],
  startX: number = 100,
  startY: number = 100,
  spacingX: number = 250,
  spacingY: number = 300,
  columnsPerRow: number = 3
): { id: string; type: string; x: number; y: number; width: number; height: number; text: string }[] {
  return tables.map((table, index) => {
    const row = Math.floor(index / columnsPerRow)
    const col = index % columnsPerRow
    
    const columnCount = table.columns.length
    const height = Math.max(100, 50 + columnCount * 28)
    const width = Math.max(180, 200)
    
    const lines = [table.name]
    table.columns.forEach(col => {
      const constraints = col.constraints.length > 0 ? ` [${col.constraints.join(',')}]` : ''
      lines.push(`${col.name}\t${col.type}${constraints}`)
    })
    
    return {
      id: `er-table-${index}-${Date.now()}`,
      type: 'er-table-entity-with-columns',
      x: startX + col * spacingX,
      y: startY + row * spacingY,
      width,
      height,
      text: lines.join('\n'),
    }
  })
}

export function validateErDiagram(
  tables: ParsedSqlTable[]
): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  const tableNames = new Set<string>()
  const columnRefs = new Map<string, Set<string>>()
  
  for (const table of tables) {
    if (tableNames.has(table.name.toLowerCase())) {
      errors.push(`重复的表名: ${table.name}`)
    }
    tableNames.add(table.name.toLowerCase())
    
    const columnNames = new Set<string>()
    let hasPk = false
    
    for (const col of table.columns) {
      if (columnNames.has(col.name.toLowerCase())) {
        errors.push(`表 ${table.name} 中存在重复的列名: ${col.name}`)
      }
      columnNames.add(col.name.toLowerCase())
      
      if (col.constraints.includes('pk')) {
        hasPk = true
      }
    }
    
    if (!hasPk) {
      warnings.push(`表 ${table.name} 没有主键`)
    }
    
    columnRefs.set(table.name.toLowerCase(), columnNames)
  }
  
  for (const table of tables) {
    if (table.foreignKeys) {
      for (const fk of table.foreignKeys) {
        const refTableLower = fk.refTable.toLowerCase()
        if (!tableNames.has(refTableLower)) {
          errors.push(`表 ${table.name} 的外键引用了不存在的表: ${fk.refTable}`)
        } else {
          const refColumns = columnRefs.get(refTableLower)
          if (refColumns && !refColumns.has(fk.refColumn.toLowerCase())) {
            errors.push(`表 ${table.name} 的外键引用了表 ${fk.refTable} 中不存在的列: ${fk.refColumn}`)
          }
        }
      }
    }
  }
  
  return { errors, warnings }
}
