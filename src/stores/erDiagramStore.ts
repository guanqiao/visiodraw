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
  autoLayout: (algorithm: 'grid' | 'hierarchical' | 'force' | 'smart') => void

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
        const { tables, relations } = get()
        if (tables.length === 0) return

        const updatedTables = [...tables]
        const tableMap = new Map<string, typeof tables[0]>()
        updatedTables.forEach((t) => tableMap.set(t.id, t))

        const calculateTableSize = (table: typeof tables[0]) => {
          const columnCount = table.columns.length
          const width = Math.max(180, 200)
          const height = Math.max(100, 50 + columnCount * 28)
          return { width, height }
        }

        switch (algorithm) {
          case 'grid': {
            const cols = Math.ceil(Math.sqrt(tables.length))
            const maxColumns = Math.max(3, cols)
            
            updatedTables.forEach((table, index) => {
              const row = Math.floor(index / maxColumns)
              const col = index % maxColumns
              const size = calculateTableSize(table)
              const spacingX = 280 + size.width * 0.2
              const spacingY = 350 + size.height * 0.2
              table.x = 100 + col * spacingX
              table.y = 100 + row * spacingY
            })
            break
          }

          case 'hierarchical': {
            const inDegree = new Map<string, number>()
            const outDegree = new Map<string, number>()
            tables.forEach((t) => {
              inDegree.set(t.id, 0)
              outDegree.set(t.id, 0)
            })
            
            relations.forEach((r) => {
              const currentIn = inDegree.get(r.sourceTableId) || 0
              const currentOut = outDegree.get(r.targetTableId) || 0
              inDegree.set(r.sourceTableId, currentIn + 1)
              outDegree.set(r.targetTableId, currentOut + 1)
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

            let maxIterations = tables.length * 2
            let iterations = 0
            while (assigned.size < tables.length && iterations < maxIterations) {
              const nextLevel: string[] = []
              
              for (const tableId of Array.from(assigned)) {
                for (const r of relations) {
                  if (r.targetTableId === tableId && !assigned.has(r.sourceTableId)) {
                    nextLevel.push(r.sourceTableId)
                    assigned.add(r.sourceTableId)
                  }
                  if (r.sourceTableId === tableId && !assigned.has(r.targetTableId)) {
                    nextLevel.push(r.targetTableId)
                    assigned.add(r.targetTableId)
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
              levels.push([...new Set(nextLevel)])
              iterations++
            }

            let maxWidth = 0
            levels.forEach((level) => {
              const levelWidth = level.length * 300
              maxWidth = Math.max(maxWidth, levelWidth)
            })

            levels.forEach((level, levelIndex) => {
              const levelWidth = level.length * 300
              const startX = 100 + (maxWidth - levelWidth) / 2
              
              level.forEach((tableId, colIndex) => {
                const table = updatedTables.find((t) => t.id === tableId)
                if (table) {
                  const size = calculateTableSize(table)
                  table.x = startX + colIndex * 300
                  table.y = 100 + levelIndex * (350 + size.height * 0.3)
                }
              })
            })
            break
          }

          case 'force': {
            const canvasWidth = Math.max(800, tables.length * 250)
            const canvasHeight = Math.max(600, Math.ceil(tables.length / 3) * 350)
            const centerX = canvasWidth / 2
            const centerY = canvasHeight / 2
            const radius = Math.min(canvasWidth, canvasHeight) * 0.35

            updatedTables.forEach((table, index) => {
              const angle = (2 * Math.PI * index) / tables.length
              table.x = centerX + radius * Math.cos(angle)
              table.y = centerY + radius * Math.sin(angle)
            })

            const iterations = 100
            const k = Math.sqrt((canvasWidth * canvasHeight) / tables.length) * 0.5
            const positions = updatedTables.map((t) => ({ x: t.x, y: t.y }))

            for (let iter = 0; iter < iterations; iter++) {
              const displacements = positions.map(() => ({ x: 0, y: 0 }))
              const temperature = Math.max(0.1, 1 - iter / iterations)

              for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                  const dx = positions[j].x - positions[i].x
                  const dy = positions[j].y - positions[i].y
                  const distance = Math.sqrt(dx * dx + dy * dy) || 1

                  const repulsiveForce = (k * k) / distance
                  const fx = (dx / distance) * repulsiveForce * 0.5
                  const fy = (dy / distance) * repulsiveForce * 0.5

                  displacements[i].x -= fx
                  displacements[i].y -= fy
                  displacements[j].x += fx
                  displacements[j].y += fy
                }
              }

              for (const relation of relations) {
                const sourceIndex = updatedTables.findIndex((t) => t.id === relation.sourceTableId)
                const targetIndex = updatedTables.findIndex((t) => t.id === relation.targetTableId)

                if (sourceIndex !== -1 && targetIndex !== -1) {
                  const dx = positions[targetIndex].x - positions[sourceIndex].x
                  const dy = positions[targetIndex].y - positions[sourceIndex].y
                  const distance = Math.sqrt(dx * dx + dy * dy) || 1

                  const attractiveForce = (distance * distance) / k
                  const fx = (dx / distance) * attractiveForce * 0.1
                  const fy = (dy / distance) * attractiveForce * 0.1

                  displacements[sourceIndex].x += fx
                  displacements[sourceIndex].y += fy
                  displacements[targetIndex].x -= fx
                  displacements[targetIndex].y -= fy
                }
              }

              for (let i = 0; i < positions.length; i++) {
                const disp = displacements[i]
                const dispLength = Math.sqrt(disp.x * disp.x + disp.y * disp.y) || 1
                const limitedDisp = Math.min(dispLength, temperature * 150)

                positions[i].x += (disp.x / dispLength) * limitedDisp
                positions[i].y += (disp.y / dispLength) * limitedDisp

                positions[i].x = Math.max(50, Math.min(canvasWidth - 50, positions[i].x))
                positions[i].y = Math.max(50, Math.min(canvasHeight - 50, positions[i].y))
              }
            }

            updatedTables.forEach((table, index) => {
              table.x = positions[index].x
              table.y = positions[index].y
            })
            break
          }

          case 'smart': {
            const adjacencyList = new Map<string, Set<string>>()
            tables.forEach((t) => adjacencyList.set(t.id, new Set()))
            
            relations.forEach((r) => {
              adjacencyList.get(r.sourceTableId)?.add(r.targetTableId)
              adjacencyList.get(r.targetTableId)?.add(r.sourceTableId)
            })

            const clusters: string[][] = []
            const visited = new Set<string>()

            for (const table of tables) {
              if (!visited.has(table.id)) {
                const cluster: string[] = []
                const queue = [table.id]
                
                while (queue.length > 0) {
                  const current = queue.shift()!
                  if (visited.has(current)) continue
                  visited.add(current)
                  cluster.push(current)
                  
                  const neighbors = adjacencyList.get(current) || new Set()
                  for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                      queue.push(neighbor)
                    }
                  }
                }
                
                if (cluster.length > 0) {
                  clusters.push(cluster)
                }
              }
            }

            clusters.sort((a, b) => b.length - a.length)

            let globalX = 100
            let globalY = 100
            const clusterSpacingX = 400
            const clusterSpacingY = 450

            for (const cluster of clusters) {
              const clusterTables = cluster.map((id) => tableMap.get(id)!).filter(Boolean)
              
              if (clusterTables.length === 1) {
                const table = clusterTables[0]
                table.x = globalX
                table.y = globalY
                globalX += clusterSpacingX
              } else {
                const clusterInDegree = new Map<string, number>()
                clusterTables.forEach((t) => clusterInDegree.set(t.id, 0))
                
                for (const r of relations) {
                  if (cluster.includes(r.sourceTableId)) {
                    const current = clusterInDegree.get(r.sourceTableId) || 0
                    clusterInDegree.set(r.sourceTableId, current + 1)
                  }
                }

                const sortedTables = [...clusterTables].sort(
                  (a, b) => (clusterInDegree.get(a.id) || 0) - (clusterInDegree.get(b.id) || 0)
                )

                const cols = Math.ceil(Math.sqrt(clusterTables.length))
                sortedTables.forEach((table, index) => {
                  const row = Math.floor(index / cols)
                  const col = index % cols
                  table.x = globalX + col * 300
                  table.y = globalY + row * 350
                })

                globalY += Math.ceil(clusterTables.length / cols) * 350 + 100
              }
            }
            break
          }
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
