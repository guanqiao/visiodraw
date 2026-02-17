import { describe, it, expect } from 'vitest'
import { 
  parseErColumns, 
  formatErColumns, 
  getErTableName,
  getPrimaryKeyColumns,
  getForeignKeyColumns,
  getRegularColumns,
  ErColumn,
} from '../erTableUtils'

describe('erTableUtils', () => {
  describe('parseErColumns', () => {
    it('should parse table name and columns', () => {
      const text = 'users\nid\tint\t[pk]\nname\tvarchar\t[not null]\nemail\tvarchar'
      const result = parseErColumns(text)
      
      expect(result.tableName).toBe('users')
      expect(result.columns).toHaveLength(3)
      expect(result.columns[0]).toEqual({
        name: 'id',
        type: 'int',
        constraints: ['pk'],
      })
    })

    it('should handle empty text', () => {
      const result = parseErColumns('')
      
      expect(result.tableName).toBe('')
      expect(result.columns).toHaveLength(0)
    })

    it('should handle table name only', () => {
      const result = parseErColumns('users')
      
      expect(result.tableName).toBe('users')
      expect(result.columns).toHaveLength(0)
    })

    it('should parse column without constraints', () => {
      const text = 'users\nid\tint'
      const result = parseErColumns(text)
      
      expect(result.columns[0]).toEqual({
        name: 'id',
        type: 'int',
        constraints: [],
      })
    })

    it('should parse column with multiple constraints', () => {
      const text = 'users\nid\tint\t[pk, auto_increment]'
      const result = parseErColumns(text)
      
      expect(result.columns[0].constraints).toEqual(['pk', 'auto_increment'])
    })

    it('should handle spaces in column definition', () => {
      const text = 'users\nid   int   [pk]'
      const result = parseErColumns(text, /\s+/)
      
      expect(result.columns[0]).toEqual({
        name: 'id',
        type: 'int',
        constraints: ['pk'],
      })
    })
  })

  describe('formatErColumns', () => {
    it('should format columns back to text', () => {
      const tableName = 'users'
      const columns: ErColumn[] = [
        { name: 'id', type: 'int', constraints: ['pk'] },
        { name: 'name', type: 'varchar', constraints: [] },
      ]
      
      const result = formatErColumns(tableName, columns)
      
      expect(result).toBe('users\nid\tint\t[pk]\nname\tvarchar')
    })

    it('should handle empty columns', () => {
      const result = formatErColumns('users', [])
      
      expect(result).toBe('users')
    })
  })

  describe('getErTableName', () => {
    it('should extract table name from text', () => {
      expect(getErTableName('users\nid\tint')).toBe('users')
      expect(getErTableName('orders')).toBe('orders')
      expect(getErTableName('')).toBe('')
    })
  })

  describe('getPrimaryKeyColumns', () => {
    it('should return columns with pk constraint', () => {
      const columns: ErColumn[] = [
        { name: 'id', type: 'int', constraints: ['pk'] },
        { name: 'name', type: 'varchar', constraints: [] },
        { name: 'order_id', type: 'int', constraints: ['pk'] },
      ]
      
      const result = getPrimaryKeyColumns(columns)
      
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('id')
      expect(result[1].name).toBe('order_id')
    })

    it('should return empty array if no pk columns', () => {
      const columns: ErColumn[] = [
        { name: 'name', type: 'varchar', constraints: [] },
      ]
      
      expect(getPrimaryKeyColumns(columns)).toHaveLength(0)
    })
  })

  describe('getForeignKeyColumns', () => {
    it('should return columns with fk constraint', () => {
      const columns: ErColumn[] = [
        { name: 'id', type: 'int', constraints: ['pk'] },
        { name: 'user_id', type: 'int', constraints: ['fk'] },
      ]
      
      const result = getForeignKeyColumns(columns)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('user_id')
    })
  })

  describe('getRegularColumns', () => {
    it('should return columns without pk or fk', () => {
      const columns: ErColumn[] = [
        { name: 'id', type: 'int', constraints: ['pk'] },
        { name: 'user_id', type: 'int', constraints: ['fk'] },
        { name: 'name', type: 'varchar', constraints: [] },
        { name: 'email', type: 'varchar', constraints: ['notnull'] },
      ]
      
      const result = getRegularColumns(columns)
      
      expect(result).toHaveLength(2)
      expect(result.map(c => c.name)).toEqual(['name', 'email'])
    })
  })
})
