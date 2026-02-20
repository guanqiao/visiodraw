import type { ErColumn, ErConstraint } from '../types/shapeLibrary'

export interface ParsedSqlTable {
  name: string
  columns: ErColumn[]
  foreignKeys?: ForeignKeyDefinition[]
  indexes?: IndexDefinition[]
  checks?: CheckDefinition[]
  triggers?: TriggerDefinition[]
  comment?: string
}

export interface ForeignKeyDefinition {
  column: string
  refTable: string
  refColumn: string
  onDelete?: string
  onUpdate?: string
}

export interface IndexDefinition {
  name: string
  columns: string[]
  isUnique: boolean
  type?: string
}

export interface CheckDefinition {
  name?: string
  condition: string
}

export interface TriggerDefinition {
  name: string
  timing: string
  event: string
  body: string
}

export interface SqlParseResult {
  tables: ParsedSqlTable[]
  errors: string[]
  warnings: string[]
}

export interface ParsedAlterStatement {
  type: 'ADD_COLUMN' | 'DROP_COLUMN' | 'MODIFY_COLUMN' | 'ADD_CONSTRAINT' | 'ADD_FOREIGN_KEY' | 'ADD_INDEX'
  tableName: string
  columnName?: string
  columnType?: string
  constraints?: ErConstraint[]
  foreignKey?: ForeignKeyDefinition
  indexName?: string
  indexColumns?: string[]
}

export interface ParsedView {
  name: string
  definition: string
  columns?: string[]
}

export interface ParsedIndex {
  name: string
  tableName: string
  columns: string[]
  isUnique: boolean
}

export interface ExtendedSqlParseResult extends SqlParseResult {
  alterStatements: ParsedAlterStatement[]
  views: ParsedView[]
  indexes: ParsedIndex[]
}

const TYPE_MAP: Record<string, string> = {
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

function cleanSql(sql: string): string {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
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

function normalizeType(colType: string): string {
  const baseType = colType.replace(/\([^)]*\)/, '').trim()
  return TYPE_MAP[baseType] || baseType.toLowerCase()
}

function parseColumnConstraints(part: string): { constraints: ErConstraint[]; isNullable: boolean } {
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
  
  return { constraints, isNullable }
}

function parseColumnDefinition(part: string): ErColumn | null {
  const colMatch = part.match(/^([`"[\w\]]+)\s+(\w+(?:\s*\([^)]*\))?)/i)
  if (!colMatch) return null
  
  const colName = colMatch[1].replace(/[`"[\]]/g, '')
  let colType = colMatch[2].toUpperCase()
  
  colType = normalizeType(colType)
  
  const { constraints, isNullable } = parseColumnConstraints(part)
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
  
  return column
}

function parsePrimaryKeyConstraint(
  part: string,
  columns: ErColumn[]
): void {
  const pkMatch = part.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i)
  if (!pkMatch) return
  
  const pkColumns = pkMatch[1].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
  for (const pkCol of pkColumns) {
    const colIndex = columns.findIndex(c => c.name.toLowerCase() === pkCol.toLowerCase())
    if (colIndex !== -1 && !columns[colIndex].constraints.includes('pk')) {
      columns[colIndex].constraints.push('pk')
    }
  }
}

function parseForeignKeyConstraint(
  part: string,
  foreignKeys: ForeignKeyDefinition[],
  columns: ErColumn[]
): void {
  const fkMatch = part.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"[\w\]]+\s*\(([^)]+)\)/i)
  if (!fkMatch) return
  
  const fkColumn = fkMatch[1].replace(/[`"[\]]/g, '').trim()
  const refMatch = part.match(/REFERENCES\s+([`"[\w\]]+)\s*\(([^)]+)\)/i)
  if (!refMatch) return
  
  const refTable = refMatch[1].replace(/[`"[\]]/g, '')
  const refColumn = refMatch[2].replace(/[`"[\]]/g, '').trim()
  
  const onDeleteMatch = part.match(/ON\s+DELETE\s+(CASCADE|SET\s+NULL|SET\s+DEFAULT|RESTRICT|NO\s+ACTION)/i)
  const onUpdateMatch = part.match(/ON\s+UPDATE\s+(CASCADE|SET\s+NULL|SET\s+DEFAULT|RESTRICT|NO\s+ACTION)/i)
  
  foreignKeys.push({
    column: fkColumn,
    refTable,
    refColumn,
    onDelete: onDeleteMatch?.[1]?.toUpperCase(),
    onUpdate: onUpdateMatch?.[1]?.toUpperCase(),
  })
  
  const colIndex = columns.findIndex(c => c.name.toLowerCase() === fkColumn.toLowerCase())
  if (colIndex !== -1 && !columns[colIndex].constraints.includes('fk')) {
    columns[colIndex].constraints.push('fk')
  }
}

function parseIndexDefinition(
  part: string,
  tableName: string,
  indexes: IndexDefinition[]
): void {
  const indexTypeMatch = part.match(/(FULLTEXT|SPATIAL)\s+/i)
  const indexType = indexTypeMatch ? indexTypeMatch[1].toUpperCase() : undefined
  
  const indexMatch = part.match(/(?:FULLTEXT\s+|SPATIAL\s+)?(?:UNIQUE\s+)?(?:INDEX|KEY)\s+(?:[`"]?(\w+)[`"]?\s*)?\(([^)]+)\)/i)
  if (!indexMatch) return
  
  const indexName = indexMatch[1] || `idx_${tableName}_${indexes.length}`
  const indexColumns = indexMatch[2].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
  const isUnique = /UNIQUE/i.test(part)
  
  indexes.push({
    name: indexName,
    columns: indexColumns,
    isUnique,
    type: indexType,
  })
}

function parseUniqueConstraint(
  part: string,
  tableName: string,
  indexes: IndexDefinition[]
): void {
  const uniqueMatch = part.match(/UNIQUE\s*\(([^)]+)\)/i)
  if (!uniqueMatch) return
  
  const uniqueColumns = uniqueMatch[1].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
  indexes.push({
    name: `uk_${tableName}_${uniqueColumns.join('_')}`,
    columns: uniqueColumns,
    isUnique: true,
  })
}

function parseCheckConstraint(
  part: string,
  checks: CheckDefinition[],
  constraintName?: string
): void {
  const checkMatch = part.match(/CHECK\s*\((.+)\)/i)
  if (!checkMatch) return
  
  checks.push({
    name: constraintName,
    condition: checkMatch[1].trim(),
  })
}

function parseConstraintClause(
  part: string,
  tableName: string,
  columns: ErColumn[],
  foreignKeys: ForeignKeyDefinition[],
  indexes: IndexDefinition[],
  checks: CheckDefinition[]
): void {
  const constraintNameMatch = part.match(/CONSTRAINT\s+[`"]?(\w+)[`"]?\s+/i)
  if (!constraintNameMatch) return
  
  const constraintBody = part.substring(part.indexOf(constraintNameMatch[0]) + constraintNameMatch[0].length)
  const constraintUpper = constraintBody.toUpperCase()
  const constraintName = constraintNameMatch[1]
  
  if (constraintUpper.startsWith('FOREIGN KEY')) {
    parseForeignKeyConstraint(constraintBody, foreignKeys, columns)
  } else if (constraintUpper.startsWith('UNIQUE')) {
    parseUniqueConstraint(constraintBody, tableName, indexes)
  } else if (constraintUpper.startsWith('CHECK')) {
    parseCheckConstraint(constraintBody, checks, constraintName)
  }
}

export function parseCreateTableSQL(sql: string): SqlParseResult {
  const tables: ParsedSqlTable[] = []
  const errors: string[] = []
  const warnings: string[] = []
  
  const cleanedSql = cleanSql(sql)
  
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"[\w\]]+\s*\(([\s\S]*?)\)(?:\s*ENGINE\s*=\s*\w+)?(?:\s+COMMENT\s*=\s*['"][^'"]*['"])?(?:\s*;|\s*$)/gi
  
  let match
  while ((match = tableRegex.exec(cleanedSql)) !== null) {
    const fullMatch = match[0]
    const tableBody = match[1]
    
    const tableNameMatch = fullMatch.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"[\w\]]+)/i)
    if (!tableNameMatch) continue
    
    const tableName = tableNameMatch[1].replace(/[`"[\]]/g, '')
    
    const tableCommentMatch = fullMatch.match(/\)\s*COMMENT\s*=\s*['"]([^'"]*)['"]/i)
    const tableComment = tableCommentMatch ? tableCommentMatch[1] : undefined
    
    const columns: ErColumn[] = []
    const foreignKeys: ForeignKeyDefinition[] = []
    const indexes: IndexDefinition[] = []
    const checks: CheckDefinition[] = []
    
    const parts = tableBody.split(',').map(p => p.trim()).filter(p => p)
    
    for (const part of parts) {
      const upperPart = part.toUpperCase()
      
      if (upperPart.startsWith('PRIMARY KEY')) {
        parsePrimaryKeyConstraint(part, columns)
        continue
      }
      
      if (upperPart.startsWith('FOREIGN KEY')) {
        parseForeignKeyConstraint(part, foreignKeys, columns)
        continue
      }
      
      if (upperPart.startsWith('INDEX') || upperPart.startsWith('KEY') || upperPart.startsWith('FULLTEXT') || upperPart.startsWith('SPATIAL')) {
        parseIndexDefinition(part, tableName, indexes)
        continue
      }
      
      if (upperPart.startsWith('UNIQUE') && !upperPart.includes('KEY')) {
        parseUniqueConstraint(part, tableName, indexes)
        continue
      }
      
      if (upperPart.startsWith('CONSTRAINT')) {
        parseConstraintClause(part, tableName, columns, foreignKeys, indexes, checks)
        continue
      }
      
      if (upperPart.startsWith('CHECK')) {
        parseCheckConstraint(part, checks)
        continue
      }
      
      const column = parseColumnDefinition(part)
      if (column) {
        columns.push(column)
      }
    }
    
    if (columns.length > 0) {
      tables.push({
        name: tableName,
        columns,
        foreignKeys,
        indexes,
        checks,
        comment: tableComment,
      })
    }
  }
  
  if (tables.length === 0 && cleanedSql.length > 0) {
    errors.push('未能解析到有效的 CREATE TABLE 语句')
  }
  
  return { tables, errors, warnings }
}

export function parseAlterTableSQL(sql: string): ParsedAlterStatement[] {
  const statements: ParsedAlterStatement[] = []
  const cleanedSql = cleanSql(sql)

  const alterRegex = /ALTER\s+TABLE\s+[`"[\w\]]+\s+([\s\S]*?)(?:;|$)/gi
  
  let match
  while ((match = alterRegex.exec(cleanedSql)) !== null) {
    const fullMatch = match[0]
    const alterBody = match[1]
    
    const tableNameMatch = fullMatch.match(/ALTER\s+TABLE\s+([`"[\w\]]+)/i)
    if (!tableNameMatch) continue
    
    const tableName = tableNameMatch[1].replace(/[`"[\]]/g, '')
    
    const addColumnMatch = alterBody.match(/ADD\s+(?:COLUMN\s+)?([`"[\w\]]+)\s+(\w+(?:\s*\([^)]*\))?)/i)
    if (addColumnMatch) {
      const columnName = addColumnMatch[1].replace(/[`"[\]]/g, '')
      const columnType = addColumnMatch[2].toUpperCase()
      const constraints: ErConstraint[] = []
      
      if (/\bNOT\s+NULL\b/i.test(alterBody)) constraints.push('notnull')
      if (/\bUNIQUE\b/i.test(alterBody)) constraints.push('unique')
      
      statements.push({
        type: 'ADD_COLUMN',
        tableName,
        columnName,
        columnType,
        constraints,
      })
      continue
    }
    
    const dropColumnMatch = alterBody.match(/DROP\s+(?:COLUMN\s+)?([`"[\w\]]+)/i)
    if (dropColumnMatch) {
      statements.push({
        type: 'DROP_COLUMN',
        tableName,
        columnName: dropColumnMatch[1].replace(/[`"[\]]/g, ''),
      })
      continue
    }
    
    const modifyColumnMatch = alterBody.match(/MODIFY\s+(?:COLUMN\s+)?([`"[\w\]]+)\s+(\w+(?:\s*\([^)]*\))?)/i)
    if (modifyColumnMatch) {
      statements.push({
        type: 'MODIFY_COLUMN',
        tableName,
        columnName: modifyColumnMatch[1].replace(/[`"[\]]/g, ''),
        columnType: modifyColumnMatch[2].toUpperCase(),
      })
      continue
    }
    
    const addFkMatch = alterBody.match(/ADD\s+(?:CONSTRAINT\s+[`"]?(\w+)[`"]?\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"[\w\]]+\s*\(([^)]+)\)/i)
    if (addFkMatch) {
      const refMatch = alterBody.match(/REFERENCES\s+([`"[\w\]]+)\s*\(([^)]+)\)/i)
      if (refMatch) {
        statements.push({
          type: 'ADD_FOREIGN_KEY',
          tableName,
          foreignKey: {
            column: addFkMatch[2].replace(/[`"[\]]/g, '').trim(),
            refTable: refMatch[1].replace(/[`"[\]]/g, ''),
            refColumn: refMatch[2].replace(/[`"[\]]/g, '').trim(),
          },
        })
      }
      continue
    }
    
    const addIndexMatch = alterBody.match(/ADD\s+(UNIQUE\s+)?(?:INDEX|KEY)\s+[`"]?(\w+)[`"]?\s*\(([^)]+)\)/i)
    if (addIndexMatch) {
      statements.push({
        type: 'ADD_INDEX',
        tableName,
        indexName: addIndexMatch[2],
        indexColumns: addIndexMatch[3].split(',').map(c => c.trim().replace(/[`"[\]]/g, '')),
      })
      continue
    }
    
    const addConstraintMatch = alterBody.match(/ADD\s+CONSTRAINT\s+[`"]?(\w+)[`"]?\s+(PRIMARY\s+KEY|UNIQUE|CHECK)/i)
    if (addConstraintMatch) {
      statements.push({
        type: 'ADD_CONSTRAINT',
        tableName,
        columnName: addConstraintMatch[1],
      })
    }
  }
  
  return statements
}

export function parseCreateViewSQL(sql: string): ParsedView[] {
  const views: ParsedView[] = []
  const cleanedSql = cleanSql(sql)

  const viewRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+[`"[\w\]]+(?:\s*\([^)]*\))?\s+AS\s+([\s\S]*?)(?:;|$)/gi
  
  let match
  while ((match = viewRegex.exec(cleanedSql)) !== null) {
    const fullMatch = match[0]
    const definition = match[1]
    
    const nameMatch = fullMatch.match(/VIEW\s+([`"[\w\]]+)/i)
    if (!nameMatch) continue
    
    const name = nameMatch[1].replace(/[`"[\]]/g, '')
    
    const columnsMatch = fullMatch.match(/VIEW\s+[`"[\w\]]+\s*\(([^)]+)\)/i)
    const columns = columnsMatch 
      ? columnsMatch[1].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
      : undefined
    
    views.push({
      name,
      definition: definition.trim(),
      columns,
    })
  }
  
  return views
}

export function parseCreateIndexSQL(sql: string): ParsedIndex[] {
  const indexes: ParsedIndex[] = []
  const cleanedSql = cleanSql(sql)

  const indexRegex = /CREATE\s+(UNIQUE\s+)?INDEX\s+[`"]?(\w+)[`"]?\s+ON\s+[`"[\w\]]+\s*\(([^)]+)\)/gi
  
  let match
  while ((match = indexRegex.exec(cleanedSql)) !== null) {
    const isUnique = !!match[1]
    const indexName = match[2]
    const tableMatch = match[0].match(/ON\s+([`"[\w\]]+)/i)
    
    if (!tableMatch) continue
    
    const tableName = tableMatch[1].replace(/[`"[\]]/g, '')
    const columns = match[3].split(',').map(c => c.trim().replace(/[`"[\]]/g, ''))
    
    indexes.push({
      name: indexName,
      tableName,
      columns,
      isUnique,
    })
  }
  
  return indexes
}

export function parseFullSQL(sql: string): ExtendedSqlParseResult {
  const baseResult = parseCreateTableSQL(sql)
  const alterStatements = parseAlterTableSQL(sql)
  const views = parseCreateViewSQL(sql)
  const indexes = parseCreateIndexSQL(sql)
  
  return {
    ...baseResult,
    alterStatements,
    views,
    indexes,
  }
}

export function applyAlterStatements(
  tables: ParsedSqlTable[],
  alterStatements: ParsedAlterStatement[]
): ParsedSqlTable[] {
  const updatedTables = [...tables]
  
  for (const alter of alterStatements) {
    const tableIndex = updatedTables.findIndex(t => t.name.toLowerCase() === alter.tableName.toLowerCase())
    if (tableIndex === -1) continue
    
    const table = { ...updatedTables[tableIndex] }
    
    switch (alter.type) {
      case 'ADD_COLUMN':
        if (alter.columnName && alter.columnType) {
          table.columns = [...table.columns, {
            name: alter.columnName,
            type: alter.columnType,
            constraints: alter.constraints || [],
          }]
        }
        break
        
      case 'DROP_COLUMN':
        if (alter.columnName) {
          table.columns = table.columns.filter(c => c.name.toLowerCase() !== alter.columnName?.toLowerCase())
        }
        break
        
      case 'MODIFY_COLUMN':
        if (alter.columnName && alter.columnType) {
          table.columns = table.columns.map(c => 
            c.name.toLowerCase() === alter.columnName?.toLowerCase()
              ? { ...c, type: alter.columnType! }
              : c
          )
        }
        break
        
      case 'ADD_FOREIGN_KEY':
        if (alter.foreignKey) {
          table.foreignKeys = [...(table.foreignKeys || []), alter.foreignKey]
          const colIndex = table.columns.findIndex(c => 
            c.name.toLowerCase() === alter.foreignKey!.column.toLowerCase()
          )
          if (colIndex !== -1 && !table.columns[colIndex].constraints.includes('fk')) {
            table.columns[colIndex] = {
              ...table.columns[colIndex],
              constraints: [...table.columns[colIndex].constraints, 'fk'],
            }
          }
        }
        break
        
      case 'ADD_INDEX':
        if (alter.indexName && alter.indexColumns) {
          table.indexes = [...(table.indexes || []), {
            name: alter.indexName,
            columns: alter.indexColumns,
            isUnique: false,
          }]
        }
        break
    }
    
    updatedTables[tableIndex] = table
  }
  
  return updatedTables
}
