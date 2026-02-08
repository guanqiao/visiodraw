import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export interface CanvasHistoryItem {
  id: string
  name: string
  timestamp: number
  data: string // JSON string of the canvas
  thumbnail?: string // base64 encoded thumbnail
}

export interface CanvasHistoryState {
  history: CanvasHistoryItem[]
  maxHistoryCount: number

  // Actions
  addToHistory: (name: string, data: string, thumbnail?: string) => void
  deleteFromHistory: (id: string) => void
  loadHistory: (id: string) => CanvasHistoryItem | null
  getHistoryList: () => CanvasHistoryItem[]
  clearHistory: () => void
  updateHistoryName: (id: string, name: string) => void
}

const STORAGE_KEY = 'visiodraw-canvas-history'
const MAX_HISTORY_COUNT = 20

// Load history from localStorage
const loadHistoryFromStorage = (): CanvasHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load history from storage:', error)
  }
  return []
}

// Save history to localStorage
const saveHistoryToStorage = (history: CanvasHistoryItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save history to storage:', error)
  }
}

const useCanvasHistoryStore = create<CanvasHistoryState>()(
  devtools(
    (set, get) => ({
      history: loadHistoryFromStorage(),
      maxHistoryCount: MAX_HISTORY_COUNT,

      addToHistory: (name: string, data: string, thumbnail?: string) => {
        const { history, maxHistoryCount } = get()
        
        const newItem: CanvasHistoryItem = {
          id: uuidv4(),
          name: name || `画布 ${new Date().toLocaleString('zh-CN')}`,
          timestamp: Date.now(),
          data,
          thumbnail,
        }

        // Add to beginning and limit count
        const newHistory = [newItem, ...history].slice(0, maxHistoryCount)
        
        set({ history: newHistory })
        saveHistoryToStorage(newHistory)
        
        return newItem.id
      },

      deleteFromHistory: (id: string) => {
        const { history } = get()
        const newHistory = history.filter(item => item.id !== id)
        set({ history: newHistory })
        saveHistoryToStorage(newHistory)
      },

      loadHistory: (id: string) => {
        const { history } = get()
        return history.find(item => item.id === id) || null
      },

      getHistoryList: () => {
        return get().history
      },

      clearHistory: () => {
        set({ history: [] })
        localStorage.removeItem(STORAGE_KEY)
      },

      updateHistoryName: (id: string, name: string) => {
        const { history } = get()
        const newHistory = history.map(item => 
          item.id === id ? { ...item, name } : item
        )
        set({ history: newHistory })
        saveHistoryToStorage(newHistory)
      },
    }),
    { name: 'canvas-history-store' }
  )
)

export default useCanvasHistoryStore
