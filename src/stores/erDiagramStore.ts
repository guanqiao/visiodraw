import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ErColumn, ErConstraint } from '../types/shapeLibrary'
import { devError } from '../utils/logger'

export interface ErTable {
  id: string
  name: string
  columns: ErColumn[]
  foreignKeys?: { column: string; refTable: string; refColumn: string }[]
  indexes?: { name: string; columns: string[]; isUnique: boolean }[]
  comment?: string
  x: number
  y: number
  width: number
  height: number
  selected?: boolean
}

export interface ErRelation {
  id: string
  sourceTableId: string
  targetTableId: string
  sourceColumn: string
  targetColumn: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  relationType: string
  label?: string
}

export interface ErDiagramState {
  tables: ErTable[]
  relations: ErRelation[]
  selectedTableIds: string[]
  selectedRelationId: string | null
  mode: 'select' | 'create-table' | 'create-relation'
  zoom: number
  panOffset: { x: number; y: number }

  // Table operations
  addTable: (table: Omit<ErTable, 'id'>) => string
  updateTable: (id: string, updates: Partial<ErTable>) => void
  deleteTable: (id: string) => void
  deleteTables: (ids: string[]) => void
  selectTable: (id: string | null) => void
  selectTables: (ids: string[]) => void
  toggleTableSelection: (id: string) => void
  clearSelection: () => void

  // Column operations
  addColumn: (tableId: string, column: ErColumn) => void
  updateColumn: (tableId: string, columnName: string, updates: Partial<ErColumn>) => void
  deleteColumn: (tableId: string, columnName: string) => void
  reorderColumns: (tableId: string, fromIndex: number, toIndex: number) => void

  // Relation operations
  addRelation: (relation: Omit<ErRelation, 'id'>) => string
  updateRelation: (id: string, updates: Partial<ErRelation>) => void
  deleteRelation: (id: string) => void
  selectRelation: (id: string | null) => void

  // Layout operations
  setTablePosition: (id: string, x: number, y: number) => void
  autoLayout: (algorithm: 'grid' | 'hierarchical' | 'force') => void

  // Mode operations
  setMode: (mode: 'select' | 'create-table' | 'create-relation') => void

  // Zoom and pan
  setZoom: (zoom: number) => void
  setPanOffset: (offset: { x: number; y: number }) => void

  // Import/Export
  importFromJson: (json: string) => void
  exportToJson: () => string
  clearDiagram: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useErDiagramStore = create<ErDiagramState>()(
  devtools(
    (set, get) => ({
      tables: [],
      relations: [],
      selectedTableIds: [],
      selectedRelationId: null,
      mode: 'select',
      zoom: 1,
      panOffset: { x: 0, y: 0 },

      // Table operations
      addTable: (table) => {
        const id = generateId()
        set((state) => ({
          tables: [...state.tables, { ...table, id }],
        }))
        return id
      },

      updateTable: (id, updates) => {
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTable: (id) => {
        set((state) => ({
          tables: state.tables.filter((t) => t.id !== id),
          relations: state.relations.filter(
            (r) => r.sourceTableId !== id && r.targetTableId !== id
          ),
          selectedTableIds: state.selectedTableIds.filter((sid) => sid !== id),
        }))
      },

      deleteTables: (ids) => {
        const idSet = new Set(ids)
        set((state) => ({
          tables: state.tables.filter((t) => !idSet.has(t.id)),
          relations: state.relations.filter(
            (r) => !idSet.has(r.sourceTableId) && !idSet.has(r.targetTableId)
          ),
          selectedTableIds: state.selectedTableIds.filter(
            (sid) => !idSet.has(sid)
          ),
        }))
      },

      selectTable: (id) => {
        set((state) => ({
          selectedTableIds: id ? [id] : [],
          selectedRelationId: null,
        }))
      },

      selectTables: (ids) => {
        set({
          selectedTableIds: ids,
          selectedRelationId: null,
        })
      },

      toggleTableSelection: (id) => {
        set((state) => {
          const isSelected = state.selectedTableIds.includes(id)
          return {
            selectedTableIds: isSelected
              ? state.selectedTableIds.filter((sid) => sid !== id)
              : [...state.selectedTableIds, id],
          }
        })
      },

      clearSelection: () => {
        set({
          selectedTableIds: [],
          selectedRelationId: null,
        })
      },

      // Column operations
      addColumn: (tableId, column) => {
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId
              ? { ...t, columns: [...t.columns, column] }
              : t
          ),
        }))
      },

      updateColumn: (tableId, columnName, updates) => {
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  columns: t.columns.map((c) =>
                    c.name === columnName ? { ...c, ...updates } : c
                  ),
                }
              : t
          ),
        }))
      },

      deleteColumn: (tableId, columnName) => {
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  columns: t.columns.filter((c) => c.name !== columnName),
                  foreignKeys: t.foreignKeys?.filter(
                    (fk) => fk.column !== columnName
                  ),
                }
              : t
          ),
        }))
      },

      reorderColumns: (tableId, fromIndex, toIndex) => {
        set((state) => ({
          tables: state.tables.map((t) => {
            if (t.id !== tableId) return t
            const columns = [...t.columns]
            const [removed] = columns.splice(fromIndex, 1)
            columns.splice(toIndex, 0, removed)
            return { ...t, columns }
          }),
        }))
      },

      // Relation operations
      addRelation: (relation) => {
        const id = generateId()
        set((state) => ({
          relations: [...state.relations, { ...relation, id }],
        }))
        return id
      },

      updateRelation: (id, updates) => {
        set((state) => ({
          relations: state.relations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }))
      },

      deleteRelation: (id) => {
        set((state) => ({
          relations: state.relations.filter((r) => r.id !== id),
          selectedRelationId:
            state.selectedRelationId === id ? null : state.selectedRelationId,
        }))
      },

      selectRelation: (id) => {
        set({
          selectedRelationId: id,
          selectedTableIds: [],
        })
      },

      // Layout operations
      setTablePosition: (id, x, y) => {
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === id ? { ...t, x, y } : t
          ),
        }))
      },

      autoLayout: (algorithm) => {
        const { tables } = get()
        const updatedTables = [...tables]

        switch (algorithm) {
          case 'grid':
            updatedTables.forEach((table, index) => {
              const row = Math.floor(index / 3)
              const col = index % 3
              table.x = 100 + col * 280
              table.y = 100 + row * 350
            })
            break

          case 'hierarchical':
            const relations = get().relations
            const inDegree = new Map<string, number>()
            tables.forEach((t) => inDegree.set(t.id, 0))
            relations.forEach((r) => {
              const current = inDegree.get(r.sourceTableId) || 0
              inDegree.set(r.sourceTableId, current + 1)
            })

            const levels: string[][] = []
            const assigned = new Set<string>()

            const rootTables = tables.filter(
              (t) => (inDegree.get(t.id) || 0) === 0
            )
            if (rootTables.length > 0) {
              levels.push(rootTables.map((t) => t.id))
              rootTables.forEach((t) => assigned.add(t.id))
            }

            while (assigned.size < tables.length) {
              const nextLevel: string[] = []
              for (const tableId of Array.from(assigned)) {
                for (const r of relations) {
                  if (r.targetTableId === tableId && !assigned.has(r.sourceTableId)) {
                    nextLevel.push(r.sourceTableId)
                    assigned.add(r.sourceTableId)
                  }
                }
              }
              if (nextLevel.length === 0) {
                const remaining = tables.filter((t) => !assigned.has(t.id))
                if (remaining.length > 0) {
                  levels.push(remaining.map((t) => t.id))
                  remaining.forEach((t) => assigned.add(t.id))
                }
                break
              }
              levels.push(nextLevel)
            }

            levels.forEach((level, levelIndex) => {
              level.forEach((tableId, colIndex) => {
                const table = updatedTables.find((t) => t.id === tableId)
                if (table) {
                  table.x = 100 + colIndex * 280
                  table.y = 100 + levelIndex * 350
                }
              })
            })
            break

          case 'force':
            const centerX = 400
            const centerY = 300
            updatedTables.forEach((table, index) => {
              const angle = (2 * Math.PI * index) / tables.length
              const radius = 200
              table.x = centerX + radius * Math.cos(angle)
              table.y = centerY + radius * Math.sin(angle)
            })
            break
        }

        set({ tables: updatedTables })
      },

      // Mode operations
      setMode: (mode) => {
        set({ mode })
      },

      // Zoom and pan
      setZoom: (zoom) => {
        set({ zoom: Math.max(0.1, Math.min(3, zoom)) })
      },

      setPanOffset: (offset) => {
        set({ panOffset: offset })
      },

      // Import/Export
      importFromJson: (json) => {
        try {
          const data = JSON.parse(json)
          set({
            tables: data.tables || [],
            relations: data.relations || [],
            selectedTableIds: [],
            selectedRelationId: null,
          })
        } catch (error) {
          devError('Failed to import ER diagram:', error)
        }
      },

      exportToJson: () => {
        const { tables, relations } = get()
        return JSON.stringify({ tables, relations }, null, 2)
      },

      clearDiagram: () => {
        set({
          tables: [],
          relations: [],
          selectedTableIds: [],
          selectedRelationId: null,
        })
      },
    }),
    { name: 'er-diagram-store' }
  )
)

export default useErDiagramStore
