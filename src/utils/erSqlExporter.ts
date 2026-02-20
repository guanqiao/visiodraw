import type { ErColumn, ErConstraint } from '../types/shapeLibrary'

export type SqlDialect = 'mysql' | 'postgres' | 'sqlite' | 'sqlserver'

export interface SqlExportOptions {
  dialect: SqlDialect
  dropIfExists: boolean
  useSchema: boolean
  schemaName?: string
  includeComments?: boolean
  includeForeignKeys?: boolean
  includeIndexes?: boolean
}

export const defaultSqlExportOptions: SqlExportOptions = {
  dialect: 'mysql',
  dropIfExists: false,
  useSchema: false,
  includeComments: true,
  includeForeignKeys: true,
  includeIndexes: true,
}

const TYPE_MAP: Record<string, Record<SqlDialect, string>> = {
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

function getTypeMapping(type: string, dialect: SqlDialect): string {
  const lowerType = type.toLowerCase().replace(/\[.*\]/, '').trim()
  
  if (TYPE_MAP[lowerType]) {
    return TYPE_MAP[lowerType][dialect]
  }
  
  if (type.includes('varchar')) {
    const match = type.match(/varchar\[(\d+)\]/)
    if (match) {
      const size = match[1]
      return dialect === 'sqlite' ? 'TEXT' 
        : dialect === 'sqlserver' ? `NVARCHAR(${size})`
        : `VARCHAR(${size})`
    }
    return TYPE_MAP['varchar'][dialect]
  }
  
  if (type.includes('decimal')) {
    const match = type.match(/decimal\[(\d+),(\d+)\]/)
    if (match) {
      return dialect === 'sqlite' ? 'REAL'
        : `DECIMAL(${match[1]},${match[2]})`
    }
    return TYPE_MAP['decimal'][dialect]
  }
  
  if (type.includes('enum')) {
    const match = type.match(/enum\(([^)]+)\)/)
    if (match && dialect === 'mysql') {
      const values = match[1].split('|').map(v => `'${v}'`).join(', ')
      return `ENUM(${values})`
    }
    return dialect === 'postgres' ? 'VARCHAR(50)' : 'TEXT'
  }
  
  return type
}

function formatConstraints(constraints: ErConstraint[], dialect: SqlDialect): string {
  const parts: string[] = []
  
  if (constraints.includes('pk')) {
    parts.push('PRIMARY KEY')
  }
  
  if (constraints.includes('notnull')) {
    parts.push('NOT NULL')
  }
  
  if (constraints.includes('unique') && !constraints.includes('pk')) {
    parts.push('UNIQUE')
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

function quoteIdentifier(name: string, dialect: SqlDialect): string {
  if (dialect === 'mysql') return `\`${name}\``
  if (dialect === 'sqlserver') return `[${name}]`
  return `"${name}"`
}

export function exportTableToSQL(
  tableName: string,
  columns: ErColumn[],
  options: Partial<SqlExportOptions> = {}
): string {
  const opts = { ...defaultSqlExportOptions, ...options }
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
  
  const tableNameQuoted = quoteIdentifier(tableName, opts.dialect)
  
  lines.push(`CREATE TABLE ${tableNameQuoted} (`)
  
  const columnDefs = columns.map(col => {
    const type = getTypeMapping(col.type, opts.dialect)
    const constraints = formatConstraints(col.constraints, opts.dialect)
    const colNameQuoted = quoteIdentifier(col.name, opts.dialect)
    
    let def = `  ${colNameQuoted} ${type}`
    if (constraints) {
      def += ' ' + constraints
    }
    if (col.defaultValue !== undefined) {
      def += ` DEFAULT '${col.defaultValue}'`
    }
    if (opts.includeComments && col.comment) {
      if (opts.dialect === 'mysql') {
        def += ` COMMENT '${col.comment}'`
      }
    }
    
    return def
  })
  
  const pkColumns = columns.filter(c => c.constraints.includes('pk'))
  if (pkColumns.length > 1) {
    const pkNames = pkColumns.map(c => quoteIdentifier(c.name, opts.dialect))
    columnDefs.push(`  PRIMARY KEY (${pkNames.join(', ')})`)
  }
  
  lines.push(columnDefs.join(',\n'))
  lines.push(');')
  
  return lines.join('\n')
}

export function exportAllTablesToSQL(
  tables: { name: string; columns: ErColumn[]; comment?: string }[],
  options: Partial<SqlExportOptions> = {}
): string {
  const opts = { ...defaultSqlExportOptions, ...options }
  const lines: string[] = []
  
  lines.push(`-- Generated SQL for ${opts.dialect.toUpperCase()}`)
  lines.push(`-- Generated at: ${new Date().toISOString()}`)
  lines.push('')
  
  for (const table of tables) {
    lines.push(exportTableToSQL(table.name, table.columns, options))
    if (opts.includeComments && table.comment && opts.dialect === 'mysql') {
      lines.push(`ALTER TABLE \`${table.name}\` COMMENT = '${table.comment}';`)
    }
    lines.push('')
  }
  
  return lines.join('\n')
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
