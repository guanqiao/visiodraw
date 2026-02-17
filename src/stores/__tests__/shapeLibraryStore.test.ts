import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useShapeLibraryStore from '../shapeLibraryStore'
import type { ShapeCategory } from '../../types/shapeLibrary'

const mockCategories: ShapeCategory[] = [
  {
    id: 'basic',
    name: '基础图形',
    icon: 'square',
    shapes: [
      { id: 'rect1', name: '矩形', category: 'basic', type: 'rectangle', icon: '', width: 100, height: 60, defaultProps: {}, tags: ['basic'] },
      { id: 'circle1', name: '圆形', category: 'basic', type: 'circle', icon: '', width: 80, height: 80, defaultProps: {}, tags: ['basic'] },
    ],
  },
  {
    id: 'flowchart',
    name: '流程图',
    icon: 'flow',
    shapes: [
      { id: 'process1', name: '流程', category: 'flowchart', type: 'process', icon: '', width: 120, height: 60, defaultProps: {}, tags: ['flow'] },
      { id: 'decision1', name: '判断', category: 'flowchart', type: 'decision', icon: '', width: 100, height: 80, defaultProps: {}, tags: ['flow'] },
    ],
  },
]

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('ShapeLibraryStore', () => {
  beforeEach(() => {
    // Reset favorites before each test
    const { result } = renderHook(() => useShapeLibraryStore())
    act(() => {
      result.current._resetFavorites()
    })
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with empty categories', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      expect(result.current.categories).toEqual([])
      expect(result.current.recent).toEqual([])
      expect(result.current.searchQuery).toBe('')
      expect(result.current.activeCategory).toBeNull()
    })

    it('should set categories', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
      })
      expect(result.current.categories).toHaveLength(2)
      expect(result.current.categories[0].name).toBe('基础图形')
    })
  })

  describe('Favorites', () => {
    it('should add shape to favorites', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
        result.current.toggleFavorite('rect1')
      })
      expect(result.current.favorites).toContain('rect1')
    })

    it('should remove shape from favorites when toggled again', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
        result.current.toggleFavorite('rect1')
      })
      expect(result.current.favorites).toContain('rect1')
      
      act(() => {
        result.current.toggleFavorite('rect1')
      })
      expect(result.current.favorites).not.toContain('rect1')
    })

    it('should persist favorites to localStorage', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
        result.current.toggleFavorite('rect1')
      })
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'visiodraw-shape-favorites',
        JSON.stringify(['rect1'])
      )
    })

    it('should get favorite shapes', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
        result.current.toggleFavorite('rect1')
        result.current.toggleFavorite('process1')
      })
      const favorites = result.current.getFavorites()
      expect(favorites).toHaveLength(2)
      expect(favorites.map(s => s.id)).toContain('rect1')
      expect(favorites.map(s => s.id)).toContain('process1')
    })
  })

  describe('Recent', () => {
    it('should add shape to recent', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
        result.current.addRecent('rect1')
      })
      expect(result.current.recent).toContain('rect1')
    })

    it('should move existing shape to front of recent', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
        result.current.addRecent('rect1')
        result.current.addRecent('circle1')
        result.current.addRecent('rect1')
      })
      expect(result.current.recent[0]).toBe('rect1')
      expect(result.current.recent).toHaveLength(2)
    })

    it('should limit recent to 10 items', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
        for (let i = 0; i < 15; i++) {
          result.current.addRecent(`shape${i}`)
        }
      })
      expect(result.current.recent).toHaveLength(10)
    })

    it('should get recent shapes', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
        result.current.addRecent('rect1')
        result.current.addRecent('circle1')
      })
      const recent = result.current.getRecent()
      expect(recent).toHaveLength(2)
      expect(recent[0].id).toBe('circle1')
    })
  })

  describe('Search', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setSearchQuery('矩形')
      })
      expect(result.current.searchQuery).toBe('矩形')
    })

    it('should search shapes by name', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
      })
      const results = result.current.searchShapes('矩形')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('矩形')
    })

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
      })
      const results = result.current.searchShapes('nonexistent')
      expect(results).toEqual([])
    })
  })

  describe('Category Filter', () => {
    it('should set active category', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setActiveCategory('flowchart')
      })
      expect(result.current.activeCategory).toBe('flowchart')
    })

    it('should get shapes by category', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
      })
      const shapes = result.current.getShapesByCategory('basic')
      expect(shapes).toHaveLength(2)
      expect(shapes[0].category).toBe('basic')
    })

    it('should return empty array for non-existent category', () => {
      const { result } = renderHook(() => useShapeLibraryStore())
      act(() => {
        result.current.setCategories(mockCategories)
      })
      const shapes = result.current.getShapesByCategory('nonexistent')
      expect(shapes).toEqual([])
    })
  })
})
