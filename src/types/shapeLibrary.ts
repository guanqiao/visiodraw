export interface ShapeLibraryItem {
  id: string
  name: string
  category: string
  type: string
  icon: string
  width: number
  height: number
  defaultProps: Record<string, unknown>
  tags: string[]
}

export type ErConstraint = 'pk' | 'fk' | 'unique' | 'notnull' | 'auto' | 'index'

export interface ErColumn {
  name: string
  type: string
  constraints: ErConstraint[]
  defaultValue?: string
  comment?: string
  length?: number
  nullable?: boolean
  precision?: number
  scale?: number
  charset?: string
  collation?: string
  enumValues?: string[]
  unsigned?: boolean
  zerofill?: boolean
}

export interface ErColumnRenderInfo {
  name: string
  type: string
  constraints: ErConstraint[]
  defaultValue?: string
  comment?: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  isNullable: boolean
  displayText: string
  constraintIcons: string[]
}

export interface ErTableEntityData {
  entityName: string
  columns: ErColumn[]
}

export interface ShapeCategory {
  id: string
  name: string
  icon: string
  shapes: ShapeLibraryItem[]
}

export interface ShapeLibraryState {
  categories: ShapeCategory[]
  favorites: string[]
  recent: string[]
  searchQuery: string
  activeCategory: string | null
}

export interface ShapeLibraryActions {
  setCategories: (categories: ShapeCategory[]) => void
  toggleFavorite: (shapeId: string) => void
  addRecent: (shapeId: string) => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (categoryId: string | null) => void
  getFavorites: () => ShapeLibraryItem[]
  getRecent: () => ShapeLibraryItem[]
  searchShapes: (query: string) => ShapeLibraryItem[]
  getShapesByCategory: (categoryId: string) => ShapeLibraryItem[]
  _resetFavorites: () => void
}

export type ShapeLibraryStore = ShapeLibraryState & ShapeLibraryActions
