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
