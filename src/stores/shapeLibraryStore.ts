import { create } from 'zustand'
import type { ShapeLibraryStore, ShapeLibraryItem } from '../types/shapeLibrary'

const STORAGE_KEY = 'visiodraw-shape-favorites'

const getStoredFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveFavorites = (favorites: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // Ignore storage errors
  }
}

const useShapeLibraryStore = create<ShapeLibraryStore>((set, get) => ({
  // State
  categories: [],
  favorites: getStoredFavorites(),
  recent: [],
  searchQuery: '',
  activeCategory: null,

  // Actions
  setCategories: (categories) => set({ categories }),

  _resetFavorites: () => {
    saveFavorites([])
    set({ favorites: [] })
  },

  toggleFavorite: (shapeId) => {
    const { favorites } = get()
    const newFavorites = favorites.includes(shapeId)
      ? favorites.filter((id) => id !== shapeId)
      : [...favorites, shapeId]
    saveFavorites(newFavorites)
    set({ favorites: newFavorites })
  },

  addRecent: (shapeId) => {
    const { recent } = get()
    const filtered = recent.filter((id) => id !== shapeId)
    const newRecent = [shapeId, ...filtered].slice(0, 10)
    set({ recent: newRecent })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setActiveCategory: (categoryId) => set({ activeCategory: categoryId }),

  getFavorites: () => {
    const { categories, favorites } = get()
    const allShapes = categories.flatMap((cat) => cat.shapes)
    return allShapes.filter((shape) => favorites.includes(shape.id))
  },

  getRecent: () => {
    const { categories, recent } = get()
    const allShapes = categories.flatMap((cat) => cat.shapes)
    const shapeMap = new Map(allShapes.map((s) => [s.id, s]))
    return recent
      .map((id) => shapeMap.get(id))
      .filter((shape): shape is ShapeLibraryItem => shape !== undefined)
  },

  searchShapes: (query) => {
    const { categories } = get()
    if (!query.trim()) return []

    const allShapes = categories.flatMap((cat) => cat.shapes)
    const lowerQuery = query.toLowerCase()

    return allShapes.filter(
      (shape) =>
        shape.name.toLowerCase().includes(lowerQuery) ||
        shape.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
  },

  getShapesByCategory: (categoryId) => {
    const { categories } = get()
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.shapes || []
  },
}))

export default useShapeLibraryStore
