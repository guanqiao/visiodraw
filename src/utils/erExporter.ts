import type { ErColumn, ErConstraint } from '../types/shapeLibrary'

export type SqlDialect = 'mysql' | 'postgres' | 'sqlite' | 'sqlserver'

export interface SqlExportOptions {
  dialect: SqlDialect
  dropIfExists: boolean
  useSchema: boolean
  schemaName?: string
}

const defaultOptions: SqlExportOptions = {
  dialect: 'mysql',
  dropIfExists: false,
  useSchema: false,
}

function getTypeMapping(type: string, dialect: SqlDialect): string {
  const typeMap: Record<string, Record<SqlDialect, string>> = {
    'int': { mysql: 'INT', postgres: 'INTEGER', sqlite: 'INTEGER', sqlserver: 'INT' },
    'integer': { mysql: 'INT', postgres: 'INTEGER', sqlite: 'INTEGER', sqlserver: 'INT' },
    'varchar': { mysql: 'VARCHAR(255)', postgres: 'VARCHAR(255)', sqlite: 'TEXT', sqlserver: 'NVARCHAR(255)' },
    'text': { mysql: 'TEXT', postgres: 'TEXT', sqlite: 'TEXT', sqlserver: 'NVARCHAR(MAX)' },
    'boolean': { mysql: 'TINYINT(1)', postgres: 'BOOLEAN', sqlite: 'INTEGER', sqlserver: 'BIT' },
    'datetime': { mysql: 'DATETIME', postgres: 'TIMESTAMP', sqlite: 'TEXT', sqlserver: 'DATETIME' },
    'date': { mysql: 'DATE', postgres: 'DATE', sqlite: 'TEXT', sqlserver: 'DATE' },
    'time': { mysql: 'TIME', postgres: 'TIME', sqlite: 'TEXT', sqlserver: 'TIME' },
    'timestamp': { mysql: 'TIMESTAMP', postgres: 'TIMESTAMP', sqlite: 'TEXT', sqlserver: 'DATETIME2' },
    'float': { mysql: 'FLOAT', postgres: 'REAL', sqlite: 'REAL', sqlserver: 'FLOAT' },
    'double': { mysql: 'DOUBLE', postgres: 'DOUBLE PRECISION', sqlite: 'REAL', sqlserver: 'FLOAT' },
    'decimal': { mysql: 'DECIMAL(10,2)', postgres: 'NUMERIC(10,2)', sqlite: 'REAL', sqlserver: 'DECIMAL(10,2)' },
    'json': { mysql: 'JSON', postgres: 'JSONB', sqlite: 'TEXT', sqlserver: 'NVARCHAR(MAX)' },
    'uuid': { mysql: 'CHAR(36)', postgres: 'UUID', sqlite: 'TEXT', sqlserver: 'UNIQUEIDENTIFIER' },
    'bigint': { mysql: 'BIGINT', postgres: 'BIGINT', sqlite: 'INTEGER', sqlserver: 'BIGINT' },
    'smallint': { mysql: 'SMALLINT', postgres: 'SMALLINT', sqlite: 'INTEGER', sqlserver: 'SMALLINT' },
    'tinyint': { mysql: 'TINYINT', postgres: 'SMALLINT', sqlite: 'INTEGER', sqlserver: 'TINYINT' },
    'blob': { mysql: 'BLOB', postgres: 'BYTEA', sqlite: 'BLOB', sqlserver: 'VARBINARY(MAX)' },
    'binary': { mysql: 'BINARY(16)', postgres: 'BYTEA', sqlite: 'BLOB', sqlserver: 'BINARY(16)' },
  }

  const lowerType = type.toLowerCase().replace(/\[.*\]/, '').trim()
  
  if (typeMap[lowerType]) {
    return typeMap[lowerType][dialect]
  }
  
  if (type.includes('varchar')) {
    const match = type.match(/varchar\[(\d+)\]/)
    if (match) {
      const size = match[1]
      return dialect === 'sqlite' ? 'TEXT' 
        : dialect === 'sqlserver' ? `NVARCHAR(${size})`
        : `VARCHAR(${size})`
    }
    return typeMap['varchar'][dialect]
  }
  
  if (type.includes('decimal')) {
    const match = type.match(/decimal\[(\d+),(\d+)\]/)
    if (match) {
      return dialect === 'sqlite' ? 'REAL'
        : `DECIMAL(${match[1]},${match[2]})`
    }
    return typeMap['decimal'][dialect]
  }
  
  return type
}

function formatConstraints(constraints: ErConstraint[], dialect: SqlDialect): string {
  const parts: string[] = []
  
  if (constraints.includes('pk')) {
    parts.push(dialect === 'postgres' || dialect === 'sqlite' ? 'PRIMARY KEY' : 'PRIMARY KEY')
  }
  
  if (constraints.includes('notnull')) {
    parts.push('NOT NULL')
  }
  
  if (constraints.includes('unique')) {
    parts.push(dialect === 'sqlserver' ? 'UNIQUE' : 'UNIQUE')
  }
  
  if (constraints.includes('auto')) {
    if (dialect === 'mysql') {
      parts.push('AUTO_INCREMENT')
    } else if (dialect === 'postgres') {
      parts.push('GENERATED ALWAYS AS IDENTITY')
    } else if (dialect === 'sqlite') {
      parts.push('AUTOINCREMENT')
    } else if (dialect === 'sqlserver') {
      parts.push('IDENTITY(1,1)')
    }
  }
  
  return parts.join(' ')
}

export function exportTableToSQL(
  tableName: string,
  columns: ErColumn[],
  options: Partial<SqlExportOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options }
  const lines: string[] = []
  
  if (opts.dropIfExists) {
    if (opts.dialect === 'mysql') {
      lines.push(`DROP TABLE IF EXISTS \`${tableName}\`;`)
    } else if (opts.dialect === 'postgres' || opts.dialect === 'sqlite') {
      lines.push(`DROP TABLE IF EXISTS "${tableName}";`)
    } else if (opts.dialect === 'sqlserver') {
      lines.push(`IF OBJECT_ID('${tableName}', 'U') IS NOT NULL DROP TABLE ${tableName};`)
    }
    lines.push('')
  }
  
  const tableNameQuoted = opts.dialect === 'mysql' ? `\`${tableName}\`` 
    : opts.dialect === 'sqlserver' ? `[${tableName}]`
    : `"${tableName}"`
  
  lines.push(`CREATE TABLE ${tableNameQuoted} (`)
  
  const columnDefs = columns.map(col => {
    const type = getTypeMapping(col.type, opts.dialect)
    const constraints = formatConstraints(col.constraints, opts.dialect)
    
    const colName = opts.dialect === 'mysql' ? `  \`${col.name}\``
      : opts.dialect === 'sqlserver' ? `  [${col.name}]`
      : `  "${col.name}"`
    
    return `${colName} ${type}${constraints ? ' ' + constraints : ''}`
  })
  
  const pkColumns = columns.filter(c => c.constraints.includes('pk'))
  if (pkColumns.length > 0) {
    const pkNames = pkColumns.map(c => {
      if (opts.dialect === 'mysql') return `\`${c.name}\``
      if (opts.dialect === 'sqlserver') return `[${c.name}]`
      return `"${c.name}"`
    })
    columnDefs.push(`  PRIMARY KEY (${pkNames.join(', ')})`)
  }
  
  lines.push(columnDefs.join(',\n'))
  lines.push(');')
  
  return lines.join('\n')
}

export function exportAllTablesToSQL(
  tables: { name: string; columns: ErColumn[] }[],
  options: Partial<SqlExportOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options }
  const lines: string[] = []
  
  lines.push(`-- Generated SQL for ${opts.dialect.toUpperCase()}`)
  lines.push(`-- Generated at: ${new Date().toISOString()}`)
  lines.push('')
  
  for (const table of tables) {
    lines.push(exportTableToSQL(table.name, table.columns, options))
    lines.push('')
  }
  
  return lines.join('\n')
}

export function parseErTableText(text: string): { name: string; columns: ErColumn[] } {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length === 0) {
    return { name: 'untitled', columns: [] }
  }
  
  const name = lines[0].trim()
  const columns: ErColumn[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const constraintMatch = line.match(/^(.+?)\s*\[(.+)\]\s*$/)
    
    if (constraintMatch) {
      const colName = constraintMatch[1].trim()
      const constraintStr = constraintMatch[2]
      
      const typeMatch = constraintStr.match(/^(\w+)/)
      const type = typeMatch ? typeMatch[1] : 'varchar'
      
      const constraints: ErConstraint[] = []
      if (constraintStr.includes('pk')) constraints.push('pk')
      if (constraintStr.includes('fk')) constraints.push('fk')
      if (constraintStr.includes('unique')) constraints.push('unique')
      if (constraintStr.includes('notnull')) constraints.push('notnull')
      if (constraintStr.includes('auto')) constraints.push('auto')
      if (constraintStr.includes('index')) constraints.push('index')
      
      columns.push({ name: colName, type, constraints })
    } else {
      const parts = line.split(/\s+/)
      const colName = parts[0]
      const type = parts[1] || 'varchar'
      
      columns.push({ name: colName, type, constraints: [] })
    }
  }
  
  return { name, columns }
}

export interface ParsedSqlTable {
  name: string
  columns: ErColumn[]
  foreignKeys: {
    column: string
    refTable: string
    refColumn: string
  }[]
  indexes: {
    name: string
    columns: string[]
    isUnique: boolean
  }[]
  comment?: string
}

export interface SqlParseResult {
  tables: ParsedSqlTable[]
  errors: string[]
  warnings: string[]
}

function extractDefaultValue(part: string): string | undefined {
  const defaultMatch = part.match(/DEFAULT\s+([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+(?:NOT\s+NULL|NULL|UNIQUE|PRIMARY|AUTO_INCREMENT|AUTOINCREMENT|IDENTITY|COMMENT|$))/i)
  if (defaultMatch) {
    let value = defaultMatch[1].trim()
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1)
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    return value
  }
  return undefined
}

function extractComment(part: string): string | undefined {
  const commentMatch = part.match(/COMMENT\s+(['"])([^'"]*)\1/i)
  if (commentMatch) {
    return commentMatch[2]
  }
  return undefined
}

function extractEnumValues(part: string): string[] | undefined {
  const enumMatch = part.match(/ENUM\s*\(([^)]+)\)/i)
  if (enumMatch) {
    const values = enumMatch[1].split(',').map(v => {
      const trimmed = v.trim()
      if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        return trimmed.slice(1, -1)
      }
      return trimmed
    })
    return values
  }
  return undefined
}

export function parseCreateTableSQL(sql: string): SqlParseResult {
  const tables: ParsedSqlTable[] = []
  const errors: string[] = []
  const warnings: string[] = []
  
  const cleanedSql = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"[\w\]]+\s*\(([\s\S]*?)\)(?:\s*ENGINE\s*=\s*\w+)?(?:\s+COMMENT\s*=\s*['"][^'"]*['"])?(?:\s*;|\s*$)/gi
  
  let match
  while ((match = tableRegex.exec(cleanedSql)) !== null) {
    const fullMatch = match[0]
    const tableBody = match[1]
    
    const tableNameMatch = fullMatch.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"[\w\]]+)/i)
    if (!tableNameMatch) continue
    
    let tableName = tableNameMatch[1]
    tableName = tableName.replace(/[`"[\]]/g, '')
    
    const tableCommentMatch = fullMatch.match(/\)\s*COMMENT\s*=\s*['"]([^'"]*)['"]/i)
    const tableComment = tableCommentMatch ? tableCommentMatch[1] : undefined
    
    const columns: ErColumn[] = []
    const foreignKeys: ParsedSqlTable['foreignKeys'] = []
    const indexes: ParsedSqlTable['indexes'] = []
    
    const parts = tableBody.split(',').map(p => p.trim()).filter(p => p)
    
    for (const part of parts) {
      const upperPart = part.toUpperCase()
      
      if (upperPart.startsWith('PRIMARY KEY')) {
        const pkMatch = part.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i)
        if (pkMatch) {
          const pkColumns = pkMatch[1].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
          for (const pkCol of pkColumns) {
            const colIndex = columns.findIndex(c => c.name.toLowerCase() === pkCol.toLowerCase())
            if (colIndex !== -1 && !columns[colIndex].constraints.includes('pk')) {
              columns[colIndex].constraints.push('pk')
            }
          }
        }
        continue
      }
      
      if (upperPart.startsWith('FOREIGN KEY')) {
        const fkMatch = part.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"[\w\]]+\s*\(([^)]+)\)/i)
        if (fkMatch) {
          const fkColumn = fkMatch[1].replace(/[`"[\]]/g, '').trim()
          const refMatch = part.match(/REFERENCES\s+([`"[\w\]]+)\s*\(([^)]+)\)/i)
          if (refMatch) {
            const refTable = refMatch[1].replace(/[`"[\]]/g, '')
            const refColumn = refMatch[2].replace(/[`"[\]]/g, '').trim()
            foreignKeys.push({ column: fkColumn, refTable, refColumn })
            
            const colIndex = columns.findIndex(c => c.name.toLowerCase() === fkColumn.toLowerCase())
            if (colIndex !== -1 && !columns[colIndex].constraints.includes('fk')) {
              columns[colIndex].constraints.push('fk')
            }
          }
        }
        continue
      }
      
      if (upperPart.startsWith('INDEX') || upperPart.startsWith('KEY')) {
        const indexMatch = part.match(/(?:UNIQUE\s+)?(?:INDEX|KEY)\s+(?:[`"]?(\w+)[`"]?\s*)?\(([^)]+)\)/i)
        if (indexMatch) {
          const indexName = indexMatch[1] || `idx_${tableName}_${indexes.length}`
          const indexColumns = indexMatch[2].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
          const isUnique = /UNIQUE/i.test(part)
          indexes.push({ name: indexName, columns: indexColumns, isUnique })
        }
        continue
      }
      
      if (upperPart.startsWith('UNIQUE') && !upperPart.includes('KEY')) {
        const uniqueMatch = part.match(/UNIQUE\s*\(([^)]+)\)/i)
        if (uniqueMatch) {
          const uniqueColumns = uniqueMatch[1].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
          indexes.push({ 
            name: `uk_${tableName}_${uniqueColumns.join('_')}`, 
            columns: uniqueColumns, 
            isUnique: true 
          })
        }
        continue
      }
      
      if (upperPart.startsWith('CONSTRAINT')) {
        const constraintNameMatch = part.match(/CONSTRAINT\s+[`"]?(\w+)[`"]?\s+/i)
        if (constraintNameMatch) {
          const constraintBody = part.substring(part.indexOf(constraintNameMatch[0]) + constraintNameMatch[0].length)
          const constraintUpper = constraintBody.toUpperCase()
          
          if (constraintUpper.startsWith('FOREIGN KEY')) {
            const fkMatch = constraintBody.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"[\w\]]+\s*\(([^)]+)\)/i)
            if (fkMatch) {
              const fkColumn = fkMatch[1].replace(/[`"[\]]/g, '').trim()
              const refMatch = constraintBody.match(/REFERENCES\s+([`"[\w\]]+)\s*\(([^)]+)\)/i)
              if (refMatch) {
                const refTable = refMatch[1].replace(/[`"[\]]/g, '')
                const refColumn = refMatch[2].replace(/[`"[\]]/g, '').trim()
                foreignKeys.push({ column: fkColumn, refTable, refColumn })
                
                const colIndex = columns.findIndex(c => c.name.toLowerCase() === fkColumn.toLowerCase())
                if (colIndex !== -1 && !columns[colIndex].constraints.includes('fk')) {
                  columns[colIndex].constraints.push('fk')
                }
              }
            }
          } else if (constraintUpper.startsWith('UNIQUE')) {
            const uniqueMatch = constraintBody.match(/UNIQUE\s*\(([^)]+)\)/i)
            if (uniqueMatch) {
              const uniqueColumns = uniqueMatch[1].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
              indexes.push({ 
                name: constraintNameMatch[1], 
                columns: uniqueColumns, 
                isUnique: true 
              })
            }
          } else if (constraintUpper.startsWith('CHECK')) {
            warnings.push(`CHECK约束已跳过: ${constraintNameMatch[1]}`)
          }
        }
        continue
      }
      
      if (upperPart.startsWith('CHECK')) {
        warnings.push('CHECK约束已跳过')
        continue
      }
      
      const colMatch = part.match(/^([`"[\w\]]+)\s+(\w+(?:\s*\([^)]*\))?)/i)
      if (colMatch) {
        const colName = colMatch[1].replace(/[`"[\]]/g, '')
        let colType = colMatch[2].toUpperCase()
        
        const typeMap: Record<string, string> = {
          'INTEGER': 'int',
          'INT': 'int',
          'INT UNSIGNED': 'int',
          'BIGINT': 'bigint',
          'BIGINT UNSIGNED': 'bigint',
          'SMALLINT': 'smallint',
          'TINYINT': 'tinyint',
          'VARCHAR': 'varchar',
          'NVARCHAR': 'varchar',
          'CHAR': 'varchar',
          'TEXT': 'text',
          'LONGTEXT': 'text',
          'MEDIUMTEXT': 'text',
          'BOOLEAN': 'boolean',
          'BOOL': 'boolean',
          'DATE': 'date',
          'DATETIME': 'datetime',
          'TIMESTAMP': 'timestamp',
          'TIME': 'time',
          'FLOAT': 'float',
          'DOUBLE': 'double',
          'DECIMAL': 'decimal',
          'NUMERIC': 'decimal',
          'JSON': 'json',
          'JSONB': 'json',
          'UUID': 'uuid',
          'UNIQUEIDENTIFIER': 'uuid',
          'BLOB': 'blob',
          'LONGBLOB': 'blob',
          'BINARY': 'binary',
          'VARBINARY': 'blob',
          'BIT': 'boolean',
          'ENUM': 'enum',
          'SET': 'set',
        }
        
        const baseType = colType.replace(/\([^)]*\)/, '').trim()
        colType = typeMap[baseType] || baseType.toLowerCase()
        
        const constraints: ErConstraint[] = []
        const isNullable = !/\bNOT\s+NULL\b/i.test(part)
        
        if (/\bPRIMARY\s+KEY\b/i.test(part)) {
          constraints.push('pk')
        }
        if (!isNullable) {
          constraints.push('notnull')
        }
        if (/\bUNIQUE\b/i.test(part) && !/\bPRIMARY\s+KEY\b/i.test(part)) {
          constraints.push('unique')
        }
        if (/\bAUTO_INCREMENT\b/i.test(part) || /\bAUTOINCREMENT\b/i.test(part) || /\bIDENTITY\b/i.test(part)) {
          constraints.push('auto')
        }
        
        const defaultValue = extractDefaultValue(part)
        const comment = extractComment(part)
        const enumValues = extractEnumValues(part)
        
        let finalType = colType
        if (enumValues && colType === 'enum') {
          finalType = `enum(${enumValues.join('|')})`
        }
        
        const column: ErColumn = { 
          name: colName, 
          type: finalType, 
          constraints,
          nullable: isNullable,
        }
        
        if (defaultValue !== undefined) {
          column.defaultValue = defaultValue
        }
        if (comment !== undefined) {
          column.comment = comment
        }
        
        columns.push(column)
      }
    }
    
    if (columns.length > 0) {
      tables.push({ 
        name: tableName, 
        columns, 
        foreignKeys,
        indexes,
        comment: tableComment,
      })
    }
  }
  
  if (tables.length === 0 && cleanedSql.length > 0) {
    errors.push('未能解析到有效的 CREATE TABLE 语句')
  }
  
  return { tables, errors, warnings }
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

export function exportToMermaid(
  tables: { name: string; columns: ErColumn[]; foreignKeys?: { column: string; refTable: string; refColumn: string }[] }[]
): string {
  const lines: string[] = []
  
  lines.push('```mermaid')
  lines.push('erDiagram')
  lines.push('')
  
  for (const table of tables) {
    for (const col of table.columns) {
      const keyType = col.constraints.includes('pk') ? 'PK' 
        : col.constraints.includes('fk') ? 'FK' 
        : ''
      const typeDisplay = col.type.toUpperCase()
      const keyMark = keyType ? ` ${keyType}` : ''
      lines.push(`    ${table.name} {`)
      lines.push(`        ${typeDisplay} ${col.name}${keyMark}`)
      lines.push(`    }`)
    }
  }
  
  lines.push('')
  
  const addedRelations = new Set<string>()
  for (const table of tables) {
    if (table.foreignKeys) {
      for (const fk of table.foreignKeys) {
        const relationKey = `${fk.refTable}-${table.name}`
        if (!addedRelations.has(relationKey)) {
          lines.push(`    ${fk.refTable} ||--o{ ${table.name} : "has"`)
          addedRelations.add(relationKey)
        }
      }
    }
  }
  
  lines.push('```')
  
  return lines.join('\n')
}

export function exportToPlantUML(
  tables: { name: string; columns: ErColumn[]; foreignKeys?: { column: string; refTable: string; refColumn: string }[]; comment?: string }[]
): string {
  const lines: string[] = []
  
  lines.push('@startuml')
  lines.push('')
  lines.push("' Generated by VisioDraw X6")
  lines.push(`' Generated at: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('skinparam linetype ortho')
  lines.push('')
  
  for (const table of tables) {
    lines.push(`entity "${table.name}" as ${table.name} {`)
    
    for (const col of table.columns) {
      const parts: string[] = []
      
      if (col.constraints.includes('pk')) {
        parts.push('<u>')
      }
      
      parts.push(col.name)
      
      if (col.constraints.includes('pk')) {
        parts.push('</u>')
      }
      
      parts.push(' : ')
      parts.push(col.type.toUpperCase())
      
      if (col.constraints.includes('fk')) {
        parts.push(' <<FK>>')
      }
      
      if (col.constraints.includes('unique')) {
        parts.push(' <<UNIQUE>>')
      }
      
      if (!col.constraints.includes('notnull') && !col.constraints.includes('pk')) {
        parts.push(' <<NULL>>')
      }
      
      if (col.comment) {
        parts.push(` // ${col.comment}`)
      }
      
      lines.push(`  ${parts.join('')}`)
    }
    
    lines.push('}')
    lines.push('')
  }
  
  for (const table of tables) {
    if (table.foreignKeys) {
      for (const fk of table.foreignKeys) {
        lines.push(`${table.name} }|..|| ${fk.refTable} : "${fk.column}"`)
      }
    }
  }
  
  lines.push('')
  lines.push('@enduml')
  
  return lines.join('\n')
}

export function exportToDbml(
  tables: { name: string; columns: ErColumn[]; foreignKeys?: { column: string; refTable: string; refColumn: string }[]; comment?: string }[]
): string {
  const lines: string[] = []
  
  lines.push(`// Generated by VisioDraw X6`)
  lines.push(`// Generated at: ${new Date().toISOString()}`)
  lines.push('')
  
  for (const table of tables) {
    lines.push(`Table ${table.name} {`)
    
    for (const col of table.columns) {
      const parts: string[] = [col.name, col.type]
      
      if (col.constraints.includes('pk')) {
        parts.push('[pk]')
      }
      if (col.constraints.includes('notnull')) {
        parts.push('[not null]')
      }
      if (col.constraints.includes('unique')) {
        parts.push('[unique]')
      }
      if (col.constraints.includes('auto')) {
        parts.push('[increment]')
      }
      if (col.defaultValue) {
        parts.push(`default: '${col.defaultValue}'`)
      }
      if (col.comment) {
        parts.push(`note: '${col.comment}'`)
      }
      
      lines.push(`  ${parts.join(' ')}`)
    }
    
    lines.push('}')
    lines.push('')
  }
  
  for (const table of tables) {
    if (table.foreignKeys) {
      for (const fk of table.foreignKeys) {
        lines.push(`Ref: ${table.name}.${fk.column} > ${fk.refTable}.${fk.refColumn}`)
      }
    }
  }
  
  return lines.join('\n')
}

export interface ErLayoutOptions {
  startX: number
  startY: number
  spacingX: number
  spacingY: number
  columnsPerRow: number
  algorithm: 'grid' | 'force' | 'hierarchical'
}

const defaultLayoutOptions: ErLayoutOptions = {
  startX: 100,
  startY: 100,
  spacingX: 280,
  spacingY: 350,
  columnsPerRow: 3,
  algorithm: 'grid',
}

export interface ErTableNode {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  columns: ErColumn[]
  foreignKeys?: { column: string; refTable: string; refColumn: string }[]
}

export interface ErLayoutResult {
  nodes: ErTableNode[]
  edges: { sourceId: string; targetId: string; sourceColumn: string; targetColumn: string }[]
}

export function calculateErLayout(
  tables: ParsedSqlTable[],
  options: Partial<ErLayoutOptions> = {}
): ErLayoutResult {
  const opts = { ...defaultLayoutOptions, ...options }
  
  const nodes: ErTableNode[] = tables.map((table, index) => {
    const columnCount = table.columns.length
    const height = Math.max(100, 50 + columnCount * 28)
    const width = Math.max(180, 200)
    
    return {
      id: `er-table-${index}`,
      name: table.name,
      x: 0,
      y: 0,
      width,
      height,
      columns: table.columns,
      foreignKeys: table.foreignKeys,
    }
  })
  
  const tableNameToId = new Map<string, string>()
  tables.forEach((table, index) => {
    tableNameToId.set(table.name.toLowerCase(), `er-table-${index}`)
  })
  
  const edges: ErLayoutResult['edges'] = []
  tables.forEach((table, sourceIndex) => {
    if (table.foreignKeys) {
      for (const fk of table.foreignKeys) {
        const targetId = tableNameToId.get(fk.refTable.toLowerCase())
        if (targetId) {
          edges.push({
            sourceId: `er-table-${sourceIndex}`,
            targetId,
            sourceColumn: fk.column,
            targetColumn: fk.refColumn,
          })
        }
      }
    }
  })
  
  switch (opts.algorithm) {
    case 'hierarchical':
      applyHierarchicalLayout(nodes, edges, opts)
      break
    case 'force':
      applyForceLayout(nodes, edges, opts)
      break
    case 'grid':
    default:
      applyGridLayout(nodes, opts)
  }
  
  return { nodes, edges }
}

function applyGridLayout(nodes: ErTableNode[], options: ErLayoutOptions): void {
  nodes.forEach((node, index) => {
    const row = Math.floor(index / options.columnsPerRow)
    const col = index % options.columnsPerRow
    
    node.x = options.startX + col * options.spacingX
    node.y = options.startY + row * options.spacingY
  })
}

function applyHierarchicalLayout(
  nodes: ErTableNode[],
  edges: ErLayoutResult['edges'],
  options: ErLayoutOptions
): void {
  const nodeMap = new Map<string, ErTableNode>()
  nodes.forEach(node => nodeMap.set(node.id, node))
  
  const inDegree = new Map<string, number>()
  nodes.forEach(node => inDegree.set(node.id, 0))
  
  edges.forEach(edge => {
    const current = inDegree.get(edge.sourceId) || 0
    inDegree.set(edge.sourceId, current + 1)
  })
  
  const levels: string[][] = []
  const assigned = new Set<string>()
  
  const rootNodes = nodes.filter(n => (inDegree.get(n.id) || 0) === 0)
  if (rootNodes.length > 0) {
    levels.push(rootNodes.map(n => n.id))
    rootNodes.forEach(n => assigned.add(n.id))
  }
  
  while (assigned.size < nodes.length) {
    const nextLevel: string[] = []
    
    for (const nodeId of Array.from(assigned)) {
      for (const edge of edges) {
        if (edge.targetId === nodeId && !assigned.has(edge.sourceId)) {
          nextLevel.push(edge.sourceId)
          assigned.add(edge.sourceId)
        }
      }
    }
    
    if (nextLevel.length === 0) {
      const remaining = nodes.filter(n => !assigned.has(n.id))
      if (remaining.length > 0) {
        levels.push(remaining.map(n => n.id))
        remaining.forEach(n => assigned.add(n.id))
      }
      break
    }
    
    levels.push(nextLevel)
  }
  
  levels.forEach((level, levelIndex) => {
    const levelWidth = level.length * options.spacingX
    const startX = options.startX + (Math.max(0, nodes.length * options.spacingX - levelWidth) / 2)
    
    level.forEach((nodeId, colIndex) => {
      const node = nodeMap.get(nodeId)
      if (node) {
        node.x = startX + colIndex * options.spacingX
        node.y = options.startY + levelIndex * options.spacingY
      }
    })
  })
}

function applyForceLayout(
  nodes: ErTableNode[],
  edges: ErLayoutResult['edges'],
  options: ErLayoutOptions
): void {
  const centerX = options.startX + (options.columnsPerRow * options.spacingX) / 2
  const centerY = options.startY + options.spacingY
  
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length
    const radius = Math.min(options.spacingX, options.spacingY) * Math.sqrt(nodes.length) / 2
    node.x = centerX + radius * Math.cos(angle)
    node.y = centerY + radius * Math.sin(angle)
  })
  
  const iterations = 50
  const k = Math.sqrt((options.spacingX * options.spacingY * nodes.length) / nodes.length)
  
  for (let iter = 0; iter < iterations; iter++) {
    const displacements = nodes.map(() => ({ x: 0, y: 0 }))
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = (k * k) / distance
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        displacements[i].x -= fx
        displacements[i].y -= fy
        displacements[j].x += fx
        displacements[j].y += fy
      }
    }
    
    const edgeSet = new Set<string>()
    edges.forEach(e => {
      edgeSet.add(`${e.sourceId}-${e.targetId}`)
      edgeSet.add(`${e.targetId}-${e.sourceId}`)
    })
    
    for (const edge of edges) {
      const sourceIndex = nodes.findIndex(n => n.id === edge.sourceId)
      const targetIndex = nodes.findIndex(n => n.id === edge.targetId)
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const dx = nodes[targetIndex].x - nodes[sourceIndex].x
        const dy = nodes[targetIndex].y - nodes[sourceIndex].y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const attractiveForce = (distance * distance) / k
        const fx = (dx / distance) * attractiveForce
        const fy = (dy / distance) * attractiveForce
        
        displacements[sourceIndex].x += fx
        displacements[sourceIndex].y += fy
        displacements[targetIndex].x -= fx
        displacements[targetIndex].y -= fy
      }
    }
    
    const temperature = Math.max(0.1, 1 - iter / iterations)
    
    nodes.forEach((node, i) => {
      const disp = displacements[i]
      const dispLength = Math.sqrt(disp.x * disp.x + disp.y * disp.y) || 1
      const limitedDisp = Math.min(dispLength, temperature * 100)
      
      node.x += (disp.x / dispLength) * limitedDisp
      node.y += (disp.y / dispLength) * limitedDisp
      
      node.x = Math.max(options.startX, node.x)
      node.y = Math.max(options.startY, node.y)
    })
  }
}
