import { describe, it, expect, beforeEach } from 'vitest'
import { useErDiagramStore, type ErTable, type ErRelation } from '../erDiagramStore'
import type { ErColumn } from '../../types/shapeLibrary'

describe('erDiagramStore', () => {
  beforeEach(() => {
    useErDiagramStore.getState().clearDiagram()
  })

  describe('Table operations', () => {
    it('should add a table', () => {
      const { addTable, tables } = useErDiagramStore.getState()
      
      const tableData: Omit<ErTable, 'id'> = {
        name: 'users',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk'] },
          { name: 'name', type: 'varchar', constraints: [] },
        ],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      }
      
      const id = addTable(tableData)
      
      expect(id).toBeDefined()
      expect(useErDiagramStore.getState().tables.length).toBe(1)
      expect(useErDiagramStore.getState().tables[0].name).toBe('users')
    })

    it('should update a table', () => {
      const { addTable, updateTable, tables } = useErDiagramStore.getState()
      
      const id = addTable({
        name: 'users',
        columns: [],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
      
      updateTable(id, { name: 'customers' })
      
      expect(useErDiagramStore.getState().tables[0].name).toBe('customers')
    })

    it('should delete a table', () => {
      const { addTable, deleteTable, tables } = useErDiagramStore.getState()
      
      const id = addTable({
        name: 'users',
        columns: [],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
      
      expect(useErDiagramStore.getState().tables.length).toBe(1)
      
      deleteTable(id)
      
      expect(useErDiagramStore.getState().tables.length).toBe(0)
    })

    it('should delete multiple tables', () => {
      const { addTable, deleteTables } = useErDiagramStore.getState()
      
      const id1 = addTable({
        name: 'users',
        columns: [],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
      
      const id2 = addTable({
        name: 'orders',
        columns: [],
        x: 300,
        y: 100,
        width: 200,
        height: 100,
      })
      
      expect(useErDiagramStore.getState().tables.length).toBe(2)
      
      deleteTables([id1, id2])
      
      expect(useErDiagramStore.getState().tables.length).toBe(0)
    })

    it('should select a table', () => {
      const { addTable, selectTable } = useErDiagramStore.getState()
      
      const id = addTable({
        name: 'users',
        columns: [],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
      
      selectTable(id)
      
      expect(useErDiagramStore.getState().selectedTableIds).toContain(id)
    })

    it('should toggle table selection', () => {
      const { addTable, toggleTableSelection } = useErDiagramStore.getState()
      
      const id = addTable({
        name: 'users',
        columns: [],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
      
      toggleTableSelection(id)
      expect(useErDiagramStore.getState().selectedTableIds).toContain(id)
      
      toggleTableSelection(id)
      expect(useErDiagramStore.getState().selectedTableIds).not.toContain(id)
    })
  })

  describe('Column operations', () => {
    let tableId: string

    beforeEach(() => {
      tableId = useErDiagramStore.getState().addTable({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk'] },
        ],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
    })

    it('should add a column', () => {
      const { addColumn } = useErDiagramStore.getState()
      
      const newColumn: ErColumn = { name: 'email', type: 'varchar', constraints: [] }
      addColumn(tableId, newColumn)
      
      const table = useErDiagramStore.getState().tables.find(t => t.id === tableId)
      expect(table?.columns.length).toBe(2)
      expect(table?.columns[1].name).toBe('email')
    })

    it('should update a column', () => {
      const { updateColumn } = useErDiagramStore.getState()
      
      updateColumn(tableId, 'id', { type: 'bigint' })
      
      const table = useErDiagramStore.getState().tables.find(t => t.id === tableId)
      expect(table?.columns[0].type).toBe('bigint')
    })

    it('should delete a column', () => {
      const { addColumn, deleteColumn } = useErDiagramStore.getState()
      
      addColumn(tableId, { name: 'email', type: 'varchar', constraints: [] })
      
      expect(useErDiagramStore.getState().tables.find(t => t.id === tableId)?.columns.length).toBe(2)
      
      deleteColumn(tableId, 'email')
      
      expect(useErDiagramStore.getState().tables.find(t => t.id === tableId)?.columns.length).toBe(1)
    })

    it('should reorder columns', () => {
      const { addColumn, reorderColumns } = useErDiagramStore.getState()
      
      addColumn(tableId, { name: 'name', type: 'varchar', constraints: [] })
      addColumn(tableId, { name: 'email', type: 'varchar', constraints: [] })
      
      reorderColumns(tableId, 0, 2)
      
      const table = useErDiagramStore.getState().tables.find(t => t.id === tableId)
      expect(table?.columns[0].name).toBe('name')
      expect(table?.columns[1].name).toBe('email')
      expect(table?.columns[2].name).toBe('id')
    })
  })

  describe('Relation operations', () => {
    let table1Id: string
    let table2Id: string

    beforeEach(() => {
      const { addTable } = useErDiagramStore.getState()
      
      table1Id = addTable({
        name: 'users',
        columns: [{ name: 'id', type: 'int', constraints: ['pk'] }],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
      
      table2Id = addTable({
        name: 'orders',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk'] },
          { name: 'user_id', type: 'int', constraints: ['fk'] },
        ],
        x: 400,
        y: 100,
        width: 200,
        height: 100,
      })
    })

    it('should add a relation', () => {
      const { addRelation } = useErDiagramStore.getState()
      
      const relationData: Omit<ErRelation, 'id'> = {
        sourceTableId: table1Id,
        targetTableId: table2Id,
        sourceColumn: 'id',
        targetColumn: 'user_id',
        type: 'one-to-many',
        relationType: 'er-one-to-many',
      }
      
      const id = addRelation(relationData)
      
      expect(id).toBeDefined()
      expect(useErDiagramStore.getState().relations.length).toBe(1)
    })

    it('should update a relation', () => {
      const { addRelation, updateRelation } = useErDiagramStore.getState()
      
      const id = addRelation({
        sourceTableId: table1Id,
        targetTableId: table2Id,
        sourceColumn: 'id',
        targetColumn: 'user_id',
        type: 'one-to-many',
        relationType: 'er-one-to-many',
      })
      
      updateRelation(id, { label: 'places' })
      
      expect(useErDiagramStore.getState().relations[0].label).toBe('places')
    })

    it('should delete a relation', () => {
      const { addRelation, deleteRelation } = useErDiagramStore.getState()
      
      const id = addRelation({
        sourceTableId: table1Id,
        targetTableId: table2Id,
        sourceColumn: 'id',
        targetColumn: 'user_id',
        type: 'one-to-many',
        relationType: 'er-one-to-many',
      })
      
      expect(useErDiagramStore.getState().relations.length).toBe(1)
      
      deleteRelation(id)
      
      expect(useErDiagramStore.getState().relations.length).toBe(0)
    })

    it('should select a relation', () => {
      const { addRelation, selectRelation } = useErDiagramStore.getState()
      
      const id = addRelation({
        sourceTableId: table1Id,
        targetTableId: table2Id,
        sourceColumn: 'id',
        targetColumn: 'user_id',
        type: 'one-to-many',
        relationType: 'er-one-to-many',
      })
      
      selectRelation(id)
      
      expect(useErDiagramStore.getState().selectedRelationId).toBe(id)
    })
  })

  describe('Layout operations', () => {
    beforeEach(() => {
      const { addTable } = useErDiagramStore.getState()
      
      for (let i = 0; i < 5; i++) {
        addTable({
          name: `table_${i}`,
          columns: [{ name: 'id', type: 'int', constraints: ['pk'] }],
          x: 0,
          y: 0,
          width: 200,
          height: 100,
        })
      }
    })

    it('should apply grid layout', () => {
      const { autoLayout } = useErDiagramStore.getState()
      
      autoLayout('grid')
      
      const tables = useErDiagramStore.getState().tables
      const positions = tables.map(t => ({ x: t.x, y: t.y }))
      
      expect(positions.some(p => p.x > 0)).toBe(true)
      expect(positions.some(p => p.y > 0)).toBe(true)
    })

    it('should apply hierarchical layout', () => {
      const { autoLayout } = useErDiagramStore.getState()
      
      autoLayout('hierarchical')
      
      const tables = useErDiagramStore.getState().tables
      expect(tables.length).toBe(5)
    })

    it('should apply force layout', () => {
      const { autoLayout } = useErDiagramStore.getState()
      
      autoLayout('force')
      
      const tables = useErDiagramStore.getState().tables
      expect(tables.length).toBe(5)
    })

    it('should apply smart layout', () => {
      const { autoLayout } = useErDiagramStore.getState()
      
      autoLayout('smart')
      
      const tables = useErDiagramStore.getState().tables
      expect(tables.length).toBe(5)
    })

    it('should set table position', () => {
      const { setTablePosition } = useErDiagramStore.getState()
      const tableId = useErDiagramStore.getState().tables[0].id
      
      setTablePosition(tableId, 500, 300)
      
      const table = useErDiagramStore.getState().tables.find(t => t.id === tableId)
      expect(table?.x).toBe(500)
      expect(table?.y).toBe(300)
    })
  })

  describe('Mode operations', () => {
    it('should set mode', () => {
      const { setMode } = useErDiagramStore.getState()
      
      setMode('create-table')
      expect(useErDiagramStore.getState().mode).toBe('create-table')
      
      setMode('create-relation')
      expect(useErDiagramStore.getState().mode).toBe('create-relation')
      
      setMode('select')
      expect(useErDiagramStore.getState().mode).toBe('select')
    })
  })

  describe('Zoom and pan', () => {
    it('should set zoom', () => {
      const { setZoom } = useErDiagramStore.getState()
      
      setZoom(1.5)
      expect(useErDiagramStore.getState().zoom).toBe(1.5)
      
      setZoom(0.5)
      expect(useErDiagramStore.getState().zoom).toBe(0.5)
    })

    it('should set pan offset', () => {
      const { setPanOffset } = useErDiagramStore.getState()
      
      setPanOffset({ x: 100, y: 200 })
      expect(useErDiagramStore.getState().panOffset).toEqual({ x: 100, y: 200 })
    })
  })

  describe('Import/Export', () => {
    it('should export to JSON', () => {
      const { addTable, exportToJson } = useErDiagramStore.getState()
      
      addTable({
        name: 'users',
        columns: [{ name: 'id', type: 'int', constraints: ['pk'] }],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
      
      const json = exportToJson()
      const parsed = JSON.parse(json)
      
      expect(parsed.tables.length).toBe(1)
      expect(parsed.tables[0].name).toBe('users')
    })

    it('should import from JSON', () => {
      const { importFromJson, tables } = useErDiagramStore.getState()
      
      const jsonData = JSON.stringify({
        tables: [
          {
            id: 'test-id',
            name: 'imported_table',
            columns: [{ name: 'id', type: 'int', constraints: ['pk'] }],
            x: 50,
            y: 50,
            width: 200,
            height: 100,
          },
        ],
        relations: [],
      })
      
      importFromJson(jsonData)
      
      expect(useErDiagramStore.getState().tables.length).toBe(1)
      expect(useErDiagramStore.getState().tables[0].name).toBe('imported_table')
    })

    it('should clear diagram', () => {
      const { addTable, clearDiagram } = useErDiagramStore.getState()
      
      addTable({
        name: 'users',
        columns: [],
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      })
      
      expect(useErDiagramStore.getState().tables.length).toBe(1)
      
      clearDiagram()
      
      expect(useErDiagramStore.getState().tables.length).toBe(0)
      expect(useErDiagramStore.getState().relations.length).toBe(0)
      expect(useErDiagramStore.getState().selectedTableIds.length).toBe(0)
    })
  })
})
