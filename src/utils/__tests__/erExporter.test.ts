// @ts-nocheck
import { describe, it, expect } from 'vitest'
import {
  exportTableToSQL,
  exportAllTablesToSQL,
  parseErTableText,
  parseCreateTableSQL,
  generateErNodesFromTables,
  exportToMermaid,
  exportToPlantUML,
  exportToDbml,
  calculateErLayout,
} from '../erExporter'
import type { ErColumn, ErConstraint } from '../../types/shapeLibrary'

const pk: ErConstraint = 'pk'
const auto: ErConstraint = 'auto'
const notnull: ErConstraint = 'notnull'
const unique: ErConstraint = 'unique'

describe('erExporter', () => {
  describe('exportTableToSQL', () => {
    const columns: ErColumn[] = [
      { name: 'id', type: 'int', constraints: [pk, auto] },
      { name: 'name', type: 'varchar', constraints: [notnull] },
      { name: 'email', type: 'varchar', constraints: [unique] },
    ]

    it('should export table to MySQL format', () => {
      const sql = exportTableToSQL('users', columns, { dialect: 'mysql' })
      expect(sql).toContain('CREATE TABLE `users`')
      expect(sql).toContain('`id`')
      expect(sql).toContain('AUTO_INCREMENT')
    })

    it('should export table to PostgreSQL format', () => {
      const sql = exportTableToSQL('users', columns, { dialect: 'postgres' })
      expect(sql).toContain('CREATE TABLE "users"')
      expect(sql).toContain('GENERATED ALWAYS AS IDENTITY')
    })

    it('should export table to SQLite format', () => {
      const sql = exportTableToSQL('users', columns, { dialect: 'sqlite' })
      expect(sql).toContain('CREATE TABLE "users"')
      expect(sql).toContain('AUTOINCREMENT')
    })

    it('should export table to SQL Server format', () => {
      const sql = exportTableToSQL('users', columns, { dialect: 'sqlserver' })
      expect(sql).toContain('CREATE TABLE [users]')
      expect(sql).toContain('IDENTITY(1,1)')
    })

    it('should include DROP TABLE if specified', () => {
      const sql = exportTableToSQL('users', columns, { dialect: 'mysql', dropIfExists: true })
      expect(sql).toContain('DROP TABLE IF EXISTS')
    })

    it('should handle primary key columns', () => {
      const cols: ErColumn[] = [
        { name: 'id', type: 'int', constraints: [pk] },
      ]
      const sql = exportTableToSQL('test', cols, { dialect: 'mysql' })
      expect(sql).toContain('PRIMARY KEY')
    })
  })

  describe('exportAllTablesToSQL', () => {
    it('should export multiple tables', () => {
      const tables = [
        { name: 'users', columns: [{ name: 'id', type: 'int', constraints: [pk] }] },
        { name: 'posts', columns: [{ name: 'id', type: 'int', constraints: [pk] }] },
      ]
      const sql = exportAllTablesToSQL(tables, { dialect: 'mysql' })
      expect(sql).toContain('CREATE TABLE `users`')
      expect(sql).toContain('CREATE TABLE `posts`')
      expect(sql).toContain('Generated SQL')
    })
  })

  describe('parseErTableText', () => {
    it('should parse table text', () => {
      const text = `users
id [int pk auto]
name [varchar notnull]`
      const result = parseErTableText(text)
      expect(result.name).toBe('users')
      expect(result.columns).toHaveLength(2)
      expect(result.columns[0].name).toBe('id')
      expect(result.columns[0].constraints).toContain('pk')
    })

    it('should handle empty text', () => {
      const result = parseErTableText('')
      expect(result.name).toBe('untitled')
      expect(result.columns).toHaveLength(0)
    })

    it('should parse columns without constraints', () => {
      const text = `test
id int
name varchar`
      const result = parseErTableText(text)
      expect(result.columns).toHaveLength(2)
      expect(result.columns[0].constraints).toHaveLength(0)
    })
  })

  describe('parseCreateTableSQL', () => {
    it('should parse simple CREATE TABLE statement', () => {
      const sql = `CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL
      )`
      const result = parseCreateTableSQL(sql)
      expect(result.tables).toHaveLength(1)
      expect(result.tables[0].name).toBe('users')
      expect(result.tables[0].columns).toHaveLength(2)
    })

    it('should parse table with foreign keys', () => {
      const sql = `CREATE TABLE posts (
        id INT PRIMARY KEY,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
      const result = parseCreateTableSQL(sql)
      expect(result.tables[0].foreignKeys).toHaveLength(1)
      expect(result.tables[0].foreignKeys[0].refTable).toBe('users')
    })

    it('should parse table with indexes', () => {
      const sql = `CREATE TABLE users (
        id INT PRIMARY KEY,
        email VARCHAR(100),
        INDEX idx_email (email)
      )`
      const result = parseCreateTableSQL(sql)
      expect(result.tables[0].indexes).toHaveLength(1)
      expect(result.tables[0].indexes[0].name).toBe('idx_email')
    })

    it('should parse table with comments', () => {
      const sql = `CREATE TABLE users (
        id INT COMMENT '用户ID',
        name VARCHAR(100)
      ) COMMENT = '用户表'`
      const result = parseCreateTableSQL(sql)
      expect(result.tables[0].comment).toBe('用户表')
      expect(result.tables[0].columns[0].comment).toBe('用户ID')
    })

    it('should parse ENUM type', () => {
      const sql = `CREATE TABLE users (
        status ENUM('active', 'inactive', 'banned')
      )`
      const result = parseCreateTableSQL(sql)
      expect(result.tables[0].columns[0].type).toContain('enum')
    })

    it('should handle multiple tables', () => {
      const sql = `
        CREATE TABLE users (id INT PRIMARY KEY);
        CREATE TABLE posts (id INT PRIMARY KEY);
      `
      const result = parseCreateTableSQL(sql)
      expect(result.tables).toHaveLength(2)
    })

    it('should return errors for invalid SQL', () => {
      const sql = 'INVALID SQL'
      const result = parseCreateTableSQL(sql)
      expect(result.tables).toHaveLength(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle IF NOT EXISTS', () => {
      const sql = `CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY)`
      const result = parseCreateTableSQL(sql)
      expect(result.tables).toHaveLength(1)
      expect(result.tables[0].name).toBe('users')
    })

    it('should parse CONSTRAINT foreign keys', () => {
      const sql = `CREATE TABLE comments (
        id INT PRIMARY KEY,
        post_id INT,
        CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id)
      )`
      const result = parseCreateTableSQL(sql)
      expect(result.tables[0].foreignKeys).toHaveLength(1)
    })

    it('should parse NOT NULL constraint', () => {
      const sql = `CREATE TABLE users (
        name VARCHAR(100) NOT NULL
      )`
      const result = parseCreateTableSQL(sql)
      expect(result.tables[0].columns[0].constraints).toContain('notnull')
    })

    it('should parse UNIQUE constraint', () => {
      const sql = `CREATE TABLE users (
        email VARCHAR(100) UNIQUE
      )`
      const result = parseCreateTableSQL(sql)
      expect(result.tables[0].columns[0].constraints).toContain('unique')
    })

    it('should parse AUTO_INCREMENT', () => {
      const sql = `CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT
      )`
      const result = parseCreateTableSQL(sql)
      expect(result.tables[0].columns[0].constraints).toContain('auto')
    })
  })

  describe('generateErNodesFromTables', () => {
    it('should generate ER nodes from parsed tables', () => {
      const tables = [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'int', constraints: [pk] as ErConstraint[] },
            { name: 'name', type: 'varchar', constraints: [] as ErConstraint[] },
          ],
          foreignKeys: [],
          indexes: [],
        },
      ]
      const nodes = generateErNodesFromTables(tables)
      expect(nodes).toHaveLength(1)
      expect(nodes[0].type).toBe('er-table-entity-with-columns')
      expect(nodes[0].text).toContain('users')
    })

    it('should position nodes in grid layout', () => {
      const tables = [
        { name: 't1', columns: [{ name: 'id', type: 'int', constraints: [] as ErConstraint[] }], foreignKeys: [], indexes: [] },
        { name: 't2', columns: [{ name: 'id', type: 'int', constraints: [] as ErConstraint[] }], foreignKeys: [], indexes: [] },
        { name: 't3', columns: [{ name: 'id', type: 'int', constraints: [] as ErConstraint[] }], foreignKeys: [], indexes: [] },
        { name: 't4', columns: [{ name: 'id', type: 'int', constraints: [] as ErConstraint[] }], foreignKeys: [], indexes: [] },
      ]
      const nodes = generateErNodesFromTables(tables, 100, 100, 250, 300, 3)
      expect(nodes[0].x).toBe(100)
      expect(nodes[0].y).toBe(100)
      expect(nodes[3].x).toBe(100)
      expect(nodes[3].y).toBe(400)
    })
  })

  describe('exportToMermaid', () => {
    it('should export tables to Mermaid format', () => {
      const tables = [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'int', constraints: [pk] as ErConstraint[] },
            { name: 'name', type: 'varchar', constraints: [] as ErConstraint[] },
          ],
        },
      ]
      const mermaid = exportToMermaid(tables)
      expect(mermaid).toContain('```mermaid')
      expect(mermaid).toContain('erDiagram')
      expect(mermaid).toContain('users')
    })

    it('should include foreign key relations', () => {
      const fk: ErConstraint = 'fk'
      const tables = [
        {
          name: 'posts',
          columns: [{ name: 'user_id', type: 'int', constraints: [fk] as ErConstraint[] }],
          foreignKeys: [{ column: 'user_id', refTable: 'users', refColumn: 'id' }],
        },
        {
          name: 'users',
          columns: [{ name: 'id', type: 'int', constraints: [pk] as ErConstraint[] }],
        },
      ]
      const mermaid = exportToMermaid(tables)
      expect(mermaid).toContain('||--o{')
    })
  })

  describe('exportToPlantUML', () => {
    it('should export tables to PlantUML format', () => {
      const tables = [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'int', constraints: [pk] as ErConstraint[] },
          ],
        },
      ]
      const plantuml = exportToPlantUML(tables)
      expect(plantuml).toContain('@startuml')
      expect(plantuml).toContain('@enduml')
      expect(plantuml).toContain('entity "users"')
    })

    it('should include table comments', () => {
      const tables = [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'int', constraints: [pk] as ErConstraint[], comment: '用户ID' },
          ],
        },
      ]
      const plantuml = exportToPlantUML(tables)
      expect(plantuml).toContain('用户ID')
    })
  })

  describe('exportToDbml', () => {
    it('should export tables to DBML format', () => {
      const tables = [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'int', constraints: [pk] as ErConstraint[] },
            { name: 'name', type: 'varchar', constraints: [notnull] as ErConstraint[] },
          ],
        },
      ]
      const dbml = exportToDbml(tables)
      expect(dbml).toContain('Table users')
      expect(dbml).toContain('[pk]')
      expect(dbml).toContain('[not null]')
    })

    it('should include default values', () => {
      const tables = [
        {
          name: 'users',
          columns: [
            { name: 'status', type: 'varchar', constraints: [] as ErConstraint[], defaultValue: 'active' },
          ],
        },
      ]
      const dbml = exportToDbml(tables)
      expect(dbml).toContain("default: 'active'")
    })
  })

  describe('calculateErLayout', () => {
    const tables = [
      {
        name: 'users',
        columns: [{ name: 'id', type: 'int', constraints: [pk] as ErConstraint[] }],
        foreignKeys: [],
        indexes: [],
      },
      {
        name: 'posts',
        columns: [{ name: 'id', type: 'int', constraints: [pk] as ErConstraint[] }, { name: 'user_id', type: 'int', constraints: [] as ErConstraint[] }],
        foreignKeys: [{ column: 'user_id', refTable: 'users', refColumn: 'id' }],
        indexes: [],
      },
    ]

    it('should calculate grid layout', () => {
      const result = calculateErLayout(tables, { algorithm: 'grid' })
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
    })

    it('should calculate hierarchical layout', () => {
      const result = calculateErLayout(tables, { algorithm: 'hierarchical' })
      expect(result.nodes).toHaveLength(2)
    })

    it('should calculate force layout', () => {
      const result = calculateErLayout(tables, { algorithm: 'force' })
      expect(result.nodes).toHaveLength(2)
    })

    it('should generate edges for foreign keys', () => {
      const result = calculateErLayout(tables, { algorithm: 'grid' })
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].sourceId).toBe('er-table-1')
      expect(result.edges[0].targetId).toBe('er-table-0')
    })

    it('should calculate node height based on column count', () => {
      const result = calculateErLayout(tables, { algorithm: 'grid' })
      expect(result.nodes[0].height).toBeLessThan(result.nodes[1].height)
    })
  })
})
