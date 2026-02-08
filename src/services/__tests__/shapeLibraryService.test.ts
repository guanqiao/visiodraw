import { describe, it, expect } from 'vitest'
import { shapeLibraryService } from '../shapeLibraryService'

describe('shapeLibraryService', () => {
  describe('getAllCategories', () => {
    it('should return all categories', () => {
      const categories = shapeLibraryService.getAllCategories()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories[0]).toHaveProperty('id')
      expect(categories[0]).toHaveProperty('name')
      expect(categories[0]).toHaveProperty('shapes')
    })

    it('should return categories with shapes', () => {
      const categories = shapeLibraryService.getAllCategories()
      categories.forEach((category) => {
        expect(category.shapes.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getCategoryById', () => {
    it('should return category by id', () => {
      const category = shapeLibraryService.getCategoryById('basic')
      expect(category).toBeDefined()
      expect(category?.id).toBe('basic')
    })

    it('should return undefined for non-existent category', () => {
      const category = shapeLibraryService.getCategoryById('nonexistent')
      expect(category).toBeUndefined()
    })
  })

  describe('getShapeById', () => {
    it('should return shape by id', () => {
      const categories = shapeLibraryService.getAllCategories()
      const firstShape = categories[0].shapes[0]
      const shape = shapeLibraryService.getShapeById(firstShape.id)
      expect(shape).toBeDefined()
      expect(shape?.id).toBe(firstShape.id)
    })

    it('should return undefined for non-existent shape', () => {
      const shape = shapeLibraryService.getShapeById('nonexistent')
      expect(shape).toBeUndefined()
    })
  })

  describe('searchShapes', () => {
    it('should search shapes by name', () => {
      const results = shapeLibraryService.searchShapes('矩形')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((s) => s.name.includes('矩形'))).toBe(true)
    })

    it('should search case-insensitively', () => {
      const results1 = shapeLibraryService.searchShapes('rect')
      const results2 = shapeLibraryService.searchShapes('RECT')
      expect(results1.length).toBe(results2.length)
    })

    it('should return empty array for no matches', () => {
      const results = shapeLibraryService.searchShapes('xyznonexistent')
      expect(results).toEqual([])
    })

    it('should search across all categories', () => {
      const results = shapeLibraryService.searchShapes('流程')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('getShapesByCategory', () => {
    it('should return shapes for a category', () => {
      const shapes = shapeLibraryService.getShapesByCategory('basic')
      expect(shapes.length).toBeGreaterThan(0)
      shapes.forEach((shape) => {
        expect(shape.category).toBe('basic')
      })
    })

    it('should return empty array for non-existent category', () => {
      const shapes = shapeLibraryService.getShapesByCategory('nonexistent')
      expect(shapes).toEqual([])
    })
  })

  describe('getAllShapes', () => {
    it('should return all shapes', () => {
      const shapes = shapeLibraryService.getAllShapes()
      expect(shapes.length).toBeGreaterThan(0)
    })

    it('should return shapes with all required properties', () => {
      const shapes = shapeLibraryService.getAllShapes()
      shapes.forEach((shape) => {
        expect(shape).toHaveProperty('id')
        expect(shape).toHaveProperty('name')
        expect(shape).toHaveProperty('category')
        expect(shape).toHaveProperty('type')
        expect(shape).toHaveProperty('width')
        expect(shape).toHaveProperty('height')
        expect(shape).toHaveProperty('defaultProps')
      })
    })
  })

  describe('Shape data integrity', () => {
    it('should have unique shape ids', () => {
      const shapes = shapeLibraryService.getAllShapes()
      const ids = shapes.map((s) => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid dimensions', () => {
      const shapes = shapeLibraryService.getAllShapes()
      shapes.forEach((shape) => {
        expect(shape.width).toBeGreaterThan(0)
        expect(shape.height).toBeGreaterThan(0)
      })
    })
  })
})
