export interface ErColumn {
  name: string
  type: string
  constraints: string[]
}

export interface ErTableData {
  tableName: string
  columns: ErColumn[]
}

export const parseErColumns = (text: string, delimiter: RegExp = /\t/): ErTableData => {
  if (!text || !text.trim()) {
    return { tableName: '', columns: [] }
  }

  const lines = text.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) {
    return { tableName: '', columns: [] }
  }

  const tableName = lines[0].trim()
  
  if (lines.length === 1) {
    return { tableName, columns: [] }
  }

  const columns: ErColumn[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const parts = line.split(delimiter).map(p => p.trim())
    
    if (parts.length >= 2) {
      const name = parts[0]
      const type = parts[1]
      let constraints: string[] = []
      
      if (parts.length >= 3 && parts[2]) {
        const constraintStr = parts[2]
        const match = constraintStr.match(/\[([^\]]+)\]/)
        if (match) {
          constraints = match[1].split(',').map(c => c.trim()).filter(Boolean)
        }
      }
      
      columns.push({ name, type, constraints })
    }
  }

  return { tableName, columns }
}

export const formatErColumns = (tableName: string, columns: ErColumn[]): string => {
  if (!tableName) return ''
  
  if (columns.length === 0) return tableName
  
  const columnLines = columns.map(col => {
    const constraintStr = col.constraints.length > 0 
      ? `\t[${col.constraints.join(', ')}]` 
      : ''
    return `${col.name}\t${col.type}${constraintStr}`
  })
  
  return [tableName, ...columnLines].join('\n')
}

export const getErTableName = (text: string): string => {
  if (!text || !text.trim()) return ''
  const firstLine = text.split('\n')[0].trim()
  return firstLine
}

export const getPrimaryKeyColumns = (columns: ErColumn[]): ErColumn[] => {
  return columns.filter(col => 
    col.constraints.some(c => c.toLowerCase() === 'pk')
  )
}

export const getForeignKeyColumns = (columns: ErColumn[]): ErColumn[] => {
  return columns.filter(col => 
    col.constraints.some(c => c.toLowerCase() === 'fk')
  )
}

export const getRegularColumns = (columns: ErColumn[]): ErColumn[] => {
  return columns.filter(col => 
    !col.constraints.some(c => c.toLowerCase() === 'pk' || c.toLowerCase() === 'fk')
  )
}

export const calculateErTableHeight = (columnCount: number, headerHeight: number = 28, rowHeight: number = 28): number => {
  return headerHeight + columnCount * rowHeight
}

export const addErColumn = (text: string, column: ErColumn): string => {
  const { tableName, columns } = parseErColumns(text)
  const newColumns = [...columns, column]
  return formatErColumns(tableName, newColumns)
}

export const removeErColumn = (text: string, columnName: string): string => {
  const { tableName, columns } = parseErColumns(text)
  const newColumns = columns.filter(c => c.name !== columnName)
  return formatErColumns(tableName, newColumns)
}

export const updateErColumn = (text: string, columnName: string, updates: Partial<ErColumn>): string => {
  const { tableName, columns } = parseErColumns(text)
  const newColumns = columns.map(c => 
    c.name === columnName ? { ...c, ...updates } : c
  )
  return formatErColumns(tableName, newColumns)
}
