// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest'
import type { Template } from '../../types/template'
import {
  searchTemplates,
  filterTemplatesByTags,
  filterTemplatesByCategory,
  sortTemplates,
  getPopularTags,
  highlightSearchKeywords,
  fuzzySearchTemplates,
  SearchOptions,
} from '../templateSearch'

// Mock templates for testing
const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: '简单流程图',
    description: '基础的流程图模板',
    category: 'flowchart',
    tags: ['流程', '基础', '入门'],
    shapes: [],
    connectors: [],
  },
  {
    id: 'template-2',
    name: 'UML类图',
    description: '面向对象设计的类图模板',
    category: 'uml',
    tags: ['UML', '类图', '设计'],
    shapes: [],
    connectors: [],
  },
  {
    id: 'template-3',
    name: '组织架构图',
    description: '公司组织架构模板',
    category: 'org',
    tags: ['组织', '架构', '管理'],
    shapes: [],
    connectors: [],
  },
  {
    id: 'template-4',
    name: '网络拓扑图',
    description: '企业网络拓扑结构',
    category: 'network',
    tags: ['网络', '拓扑', 'IT'],
    shapes: [],
    connectors: [],
  },
  {
    id: 'template-5',
    name: '微服务架构',
    description: '微服务系统架构设计',
    category: 'network',
    tags: ['架构', '微服务', '云原生'],
    shapes: [],
    connectors: [],
  },
]

describe('Template Search', () => {
  describe('Basic Search', () => {
    it('should search by keyword in name', () => {
      const results = searchTemplates(mockTemplates, '流程')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toContain('流程')
    })

    it('should search by keyword in description', () => {
      const results = searchTemplates(mockTemplates, '架构')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((t) => t.description?.includes('架构'))).toBe(true)
    })

    it('should return empty array for no matches', () => {
      const results = searchTemplates(mockTemplates, '不存在的模板')
      expect(results).toEqual([])
    })

    it('should be case insensitive', () => {
      const results1 = searchTemplates(mockTemplates, 'uml')
      const results2 = searchTemplates(mockTemplates, 'UML')
      expect(results1.length).toBe(results2.length)
    })

    it('should handle empty search query', () => {
      const results = searchTemplates(mockTemplates, '')
      expect(results.length).toBe(mockTemplates.length)
    })

    it('should handle special characters in query', () => {
      const results = searchTemplates(mockTemplates, '流程图*')
      expect(results).toBeDefined()
    })
  })

  describe('Tag Filtering', () => {
    it('should filter templates by single tag', () => {
      const results = filterTemplatesByTags(mockTemplates, ['架构'])
      expect(results.length).toBeGreaterThan(0)
      expect(results.every((t) => t.tags?.includes('架构'))).toBe(true)
    })

    it('should filter templates by multiple tags (AND logic)', () => {
      const results = filterTemplatesByTags(mockTemplates, ['架构', '网络'])
      expect(results.every((t) => t.tags?.includes('架构') && t.tags?.includes('网络'))).toBe(true)
    })

    it('should return empty array when no templates match tags', () => {
      const results = filterTemplatesByTags(mockTemplates, ['不存在的标签'])
      expect(results).toEqual([])
    })

    it('should handle empty tags array', () => {
      const results = filterTemplatesByTags(mockTemplates, [])
      expect(results.length).toBe(mockTemplates.length)
    })

    it('should handle templates without tags', () => {
      const templatesWithoutTags = [
        { ...mockTemplates[0], tags: undefined },
        mockTemplates[1],
      ]
      const results = filterTemplatesByTags(templatesWithoutTags, ['UML'])
      expect(results.length).toBe(1)
    })
  })

  describe('Category Filtering', () => {
    it('should filter templates by category', () => {
      const results = filterTemplatesByCategory(mockTemplates, 'network')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every((t) => t.category === 'network')).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const results = filterTemplatesByCategory(mockTemplates, 'nonexistent')
      expect(results).toEqual([])
    })

    it('should handle multiple categories', () => {
      const results = filterTemplatesByCategory(mockTemplates, ['network', 'uml'])
      expect(results.every((t) => ['network', 'uml'].includes(t.category))).toBe(true)
    })
  })

  describe('Combined Search and Filter', () => {
    it('should search with category filter', () => {
      const options: SearchOptions = {
        query: '架构',
        category: 'network',
      }
      const results = searchTemplates(mockTemplates, options.query, options)
      expect(results.every((t) => t.category === 'network')).toBe(true)
      expect(results.some((t) => t.name.includes('架构') || t.description?.includes('架构'))).toBe(true)
    })

    it('should search with tag filter', () => {
      const options: SearchOptions = {
        query: '微服务',
        tags: ['云原生'],
      }
      const results = searchTemplates(mockTemplates, options.query, options)
      expect(results.every((t) => t.tags?.includes('云原生'))).toBe(true)
    })

    it('should apply multiple filters', () => {
      const options: SearchOptions = {
        query: '架构',
        category: 'network',
        tags: ['云原生'],
      }
      const results = searchTemplates(mockTemplates, options.query, options)
      expect(results.every((t) => t.category === 'network' && t.tags?.includes('云原生'))).toBe(true)
    })
  })

  describe('Sorting', () => {
    it('should sort by name ascending', () => {
      const results = sortTemplates(mockTemplates, 'name', 'asc')
      expect(results[0].name <= results[1].name).toBe(true)
    })

    it('should sort by name descending', () => {
      const results = sortTemplates(mockTemplates, 'name', 'desc')
      // 降序排序：第一个应该大于或等于第二个
      const comparison = results[0].name.localeCompare(results[1].name, 'zh-CN')
      expect(comparison >= 0).toBe(true)
    })

    it('should sort by category', () => {
      const results = sortTemplates(mockTemplates, 'category', 'asc')
      expect(results[0].category <= results[1].category).toBe(true)
    })

    it('should handle templates without name', () => {
      const templatesWithEmptyName = [
        { ...mockTemplates[0], name: '' },
        mockTemplates[1],
      ]
      const results = sortTemplates(templatesWithEmptyName, 'name', 'asc')
      expect(results).toBeDefined()
    })
  })

  describe('Fuzzy Search', () => {
    it('should find templates with similar names', () => {
      const results = fuzzySearchTemplates(mockTemplates, '流图')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find templates with typos', () => {
      const results = fuzzySearchTemplates(mockTemplates, '组只') // typo for 组织
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle pinyin search', () => {
      const results = fuzzySearchTemplates(mockTemplates, 'liucheng') // pinyin for 流程
      expect(results.length).toBeGreaterThan(0)
    })

    it('should rank results by relevance', () => {
      const results = fuzzySearchTemplates(mockTemplates, '架构')
      expect(results[0].score).toBeGreaterThanOrEqual(results[results.length - 1].score || 0)
    })
  })

  describe('Keyword Highlighting', () => {
    it('should highlight keywords in text', () => {
      const text = '这是一个流程图模板'
      const highlighted = highlightSearchKeywords(text, '流程')
      expect(highlighted).toContain('<mark>')
      expect(highlighted).toContain('</mark>')
    })

    it('should highlight multiple keywords', () => {
      const text = 'UML类图设计模板'
      const highlighted = highlightSearchKeywords(text, 'UML 类图')
      expect(highlighted.match(/<mark>/g)?.length).toBe(2)
    })

    it('should be case insensitive', () => {
      const text = 'UML类图'
      const highlighted1 = highlightSearchKeywords(text, 'uml')
      const highlighted2 = highlightSearchKeywords(text, 'UML')
      expect(highlighted1).toBe(highlighted2)
    })

    it('should handle empty query', () => {
      const text = '流程图'
      const highlighted = highlightSearchKeywords(text, '')
      expect(highlighted).toBe(text)
    })

    it('should handle no matches', () => {
      const text = '流程图'
      const highlighted = highlightSearchKeywords(text, '架构')
      expect(highlighted).toBe(text)
    })
  })

  describe('Popular Tags', () => {
    it('should return most used tags', () => {
      const popularTags = getPopularTags(mockTemplates, 3)
      expect(popularTags.length).toBeLessThanOrEqual(3)
    })

    it('should count tag usage correctly', () => {
      const popularTags = getPopularTags(mockTemplates)
      const architectureTag = popularTags.find((t) => t.tag === '架构')
      expect(architectureTag?.count).toBeGreaterThanOrEqual(2) // 网络拓扑图和微服务架构都有架构标签
    })

    it('should sort by usage count', () => {
      const popularTags = getPopularTags(mockTemplates)
      for (let i = 1; i < popularTags.length; i++) {
        expect(popularTags[i - 1].count).toBeGreaterThanOrEqual(popularTags[i].count)
      }
    })

    it('should handle templates without tags', () => {
      const templatesWithoutTags = mockTemplates.map((t) => ({ ...t, tags: undefined }))
      const popularTags = getPopularTags(templatesWithoutTags)
      expect(popularTags).toEqual([])
    })
  })

  describe('Search Performance', () => {
    it('should handle large template collections', () => {
      const largeTemplates = Array(1000)
        .fill(null)
        .map((_, i) => ({
          ...mockTemplates[0],
          id: `template-${i}`,
          name: `模板 ${i}`,
        }))
      const start = Date.now()
      const results = searchTemplates(largeTemplates, '模板')
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // Should complete in less than 100ms
      expect(results.length).toBe(1000)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null templates array', () => {
      const results = searchTemplates(null as any, '流程')
      expect(results).toEqual([])
    })

    it('should handle undefined templates array', () => {
      const results = searchTemplates(undefined as any, '流程')
      expect(results).toEqual([])
    })

    it('should handle empty templates array', () => {
      const results = searchTemplates([], '流程')
      expect(results).toEqual([])
    })

    it('should handle templates with special characters', () => {
      const specialTemplates = [
        {
          ...mockTemplates[0],
          name: '模板 <script>alert(1)</script>',
        },
      ]
      const results = searchTemplates(specialTemplates, '模板')
      expect(results.length).toBe(1)
    })

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000)
      const results = searchTemplates(mockTemplates, longQuery)
      expect(results).toEqual([])
    })
  })
})
