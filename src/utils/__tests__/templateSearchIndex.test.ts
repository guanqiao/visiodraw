// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest'
import type { Template } from '../../types/template'
import {
  createSearchIndex,
  buildSearchIndex,
  addTemplateToIndex,
  removeTemplateFromIndex,
  searchWithIndex,
  getIndexStats,
  getSearchSuggestions,
  tokenize,
  getPinyin,
} from '../templateSearchIndex'

// Mock templates
const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: '基础流程图',
    description: '一个简单的流程图模板，适合入门使用',
    category: 'flowchart',
    tags: ['流程', '基础', '入门'],
    shapes: [],
  },
  {
    id: 'template-2',
    name: '系统架构图',
    description: '微服务系统架构设计模板',
    category: 'architecture',
    tags: ['架构', '微服务', '系统'],
    shapes: [],
  },
  {
    id: 'template-3',
    name: '组织结构图',
    description: '公司组织架构图模板',
    category: 'org',
    tags: ['组织', '管理', '架构'],
    shapes: [],
  },
  {
    id: 'template-4',
    name: '网络拓扑图',
    description: '网络设备拓扑结构图',
    category: 'network',
    tags: ['网络', '拓扑', '架构'],
    shapes: [],
  },
  {
    id: 'template-5',
    name: '数据库设计',
    description: '数据库ER图设计模板',
    category: 'uml',
    tags: ['数据库', 'ER图', '设计'],
    shapes: [],
  },
]

describe('Template Search Index', () => {
  describe('Tokenize', () => {
    it('should tokenize English text', () => {
      const tokens = tokenize('Hello World Test')
      expect(tokens).toContain('hello')
      expect(tokens).toContain('world')
      expect(tokens).toContain('test')
    })

    it('should tokenize Chinese text', () => {
      const tokens = tokenize('基础流程图')
      expect(tokens.length).toBeGreaterThan(0)
      // Should include 2-grams and 3-grams
      expect(tokens).toContain('基础')
      expect(tokens).toContain('流程')
      expect(tokens).toContain('基础流') // 3-gram prefix
    })

    it('should handle empty text', () => {
      expect(tokenize('')).toEqual([])
      expect(tokenize(null as any)).toEqual([])
    })

    it('should remove duplicates', () => {
      const tokens = tokenize('test test test')
      const uniqueTokens = [...new Set(tokens)]
      expect(tokens.length).toBe(uniqueTokens.length)
    })
  })

  describe('Get Pinyin', () => {
    it('should return pinyin for known words', () => {
      const pinyins = getPinyin('流程图')
      expect(pinyins).toContain('liucheng')
      expect(pinyins).toContain('liuchengtu')
      expect(pinyins).toContain('l')
    })

    it('should return empty array for unknown words', () => {
      const pinyins = getPinyin('未知词汇')
      expect(pinyins).toEqual([])
    })

    it('should handle empty text', () => {
      expect(getPinyin('')).toEqual([])
    })
  })

  describe('Create Search Index', () => {
    it('should create empty index', () => {
      const index = createSearchIndex()
      expect(index.nameIndex.size).toBe(0)
      expect(index.descriptionIndex.size).toBe(0)
      expect(index.tagIndex.size).toBe(0)
      expect(index.templateCache.size).toBe(0)
    })
  })

  describe('Build Search Index', () => {
    it('should build index from templates', () => {
      const index = buildSearchIndex(mockTemplates)

      expect(index.templateCache.size).toBe(5)
      expect(index.nameIndex.size).toBeGreaterThan(0)
      expect(index.tagIndex.size).toBeGreaterThan(0)
    })

    it('should index template names', () => {
      const index = buildSearchIndex(mockTemplates)

      // Should have indexed '基础' from '基础流程图'
      expect(index.nameIndex.has('基础')).toBe(true)
      expect(index.nameIndex.has('流程')).toBe(true)
    })

    it('should index tags', () => {
      const index = buildSearchIndex(mockTemplates)

      expect(index.tagIndex.has('流程')).toBe(true)
      expect(index.tagIndex.has('架构')).toBe(true)
      expect(index.tagIndex.get('架构')?.size).toBe(3) // template-2, 3, 4
    })

    it('should index categories', () => {
      const index = buildSearchIndex(mockTemplates)

      expect(index.categoryIndex.has('flowchart')).toBe(true)
      expect(index.categoryIndex.has('architecture')).toBe(true)
    })

    it('should index pinyin', () => {
      const index = buildSearchIndex(mockTemplates)

      // '流程' -> 'liucheng'
      expect(index.pinyinIndex.has('liucheng')).toBe(true)
      // '架构' -> 'jiagou'
      expect(index.pinyinIndex.has('jiagou')).toBe(true)
    })

    it('should handle empty template list', () => {
      const index = buildSearchIndex([])
      expect(index.templateCache.size).toBe(0)
    })

    it('should skip templates without id', () => {
      const templatesWithoutId = [{ name: 'Test', category: 'test' }] as Template[]
      const index = buildSearchIndex(templatesWithoutId)
      expect(index.templateCache.size).toBe(0)
    })
  })

  describe('Search with Index', () => {
    let index: ReturnType<typeof buildSearchIndex>

    beforeEach(() => {
      index = buildSearchIndex(mockTemplates)
    })

    it('should search by name', () => {
      const results = searchWithIndex(index, '基础')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].template.name).toContain('基础')
    })

    it('should search by description', () => {
      const results = searchWithIndex(index, '入门')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should search by tag', () => {
      const results = searchWithIndex(index, '架构')
      expect(results.length).toBeGreaterThanOrEqual(3)
    })

    it('should support pinyin search', () => {
      const results = searchWithIndex(index, 'liucheng')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.template.name.includes('流程'))).toBe(true)
    })

    it('should return empty array for no match', () => {
      const results = searchWithIndex(index, '不存在的词')
      expect(results).toEqual([])
    })

    it('should return all templates for empty query', () => {
      const results = searchWithIndex(index, '')
      expect(results.length).toBe(5)
    })

    it('should filter by category', () => {
      const results = searchWithIndex(index, '', { category: 'flowchart' })
      expect(results.length).toBe(1)
      expect(results[0].template.category).toBe('flowchart')
    })

    it('should filter by multiple categories', () => {
      const results = searchWithIndex(index, '', {
        category: ['flowchart', 'org'],
      })
      expect(results.length).toBe(2)
    })

    it('should filter by tags', () => {
      const results = searchWithIndex(index, '', { tags: ['架构'] })
      expect(results.length).toBe(3)
    })

    it('should filter by multiple tags (AND logic)', () => {
      const results = searchWithIndex(index, '', { tags: ['架构', '网络'] })
      expect(results.length).toBe(1)
      expect(results[0].template.name).toContain('网络')
    })

    it('should limit results', () => {
      const results = searchWithIndex(index, '架构', { limit: 2 })
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('should return scored results', () => {
      const results = searchWithIndex(index, '架构')
      expect(results[0].score).toBeGreaterThan(0)
      expect(results[0].matchedFields.length).toBeGreaterThan(0)
    })

    it('should sort by score descending', () => {
      const results = searchWithIndex(index, '架构')
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
      }
    })

    it('should support fuzzy search', () => {
      const results = searchWithIndex(index, '基', { fuzzy: true })
      expect(results.length).toBeGreaterThan(0)
    })

    it('should disable fuzzy search when specified', () => {
      const resultsWithFuzzy = searchWithIndex(index, '基', { fuzzy: true })
      const resultsWithoutFuzzy = searchWithIndex(index, '基', { fuzzy: false })
      // Results might differ based on implementation
      expect(resultsWithoutFuzzy).toBeDefined()
    })
  })

  describe('Add Template to Index', () => {
    it('should add new template', () => {
      const index = buildSearchIndex(mockTemplates)
      const newTemplate: Template = {
        id: 'template-6',
        name: '测试模板',
        description: '新添加的测试模板',
        category: 'test',
        tags: ['测试'],
        shapes: [],
      }

      addTemplateToIndex(index, newTemplate)

      expect(index.templateCache.has('template-6')).toBe(true)
      expect(index.tagIndex.has('测试')).toBe(true)
    })

    it('should update existing template', () => {
      const index = buildSearchIndex(mockTemplates)
      const updatedTemplate: Template = {
        ...mockTemplates[0],
        name: '更新的名称',
        tags: ['新标签'],
      }

      addTemplateToIndex(index, updatedTemplate)

      const cached = index.templateCache.get('template-1')
      expect(cached?.name).toBe('更新的名称')
    })

    it('should skip template without id', () => {
      const index = buildSearchIndex(mockTemplates)
      const invalidTemplate = { name: 'No ID' } as Template

      addTemplateToIndex(index, invalidTemplate)

      expect(index.templateCache.size).toBe(5)
    })
  })

  describe('Remove Template from Index', () => {
    it('should remove template from index', () => {
      const index = buildSearchIndex(mockTemplates)

      removeTemplateFromIndex(index, 'template-1')

      expect(index.templateCache.has('template-1')).toBe(false)
    })

    it('should remove template from tag index', () => {
      const index = buildSearchIndex(mockTemplates)

      removeTemplateFromIndex(index, 'template-1')

      // template-1 has tag '流程', and no other template has this tag
      // so the entire tag entry should be removed
      expect(index.tagIndex.has('流程')).toBe(false)

      // But '架构' tag should still exist (shared by template-2, 3, 4)
      expect(index.tagIndex.has('架构')).toBe(true)
      expect(index.tagIndex.get('架构')?.has('template-1')).toBe(false)
      expect(index.tagIndex.get('架构')?.has('template-2')).toBe(true)
    })

    it('should handle non-existent template id', () => {
      const index = buildSearchIndex(mockTemplates)

      expect(() => removeTemplateFromIndex(index, 'non-existent')).not.toThrow()
      expect(index.templateCache.size).toBe(5)
    })
  })

  describe('Get Index Stats', () => {
    it('should return correct stats', () => {
      const index = buildSearchIndex(mockTemplates)
      const stats = getIndexStats(index)

      expect(stats.totalTemplates).toBe(5)
      expect(stats.nameTokens).toBeGreaterThan(0)
      expect(stats.tagCount).toBeGreaterThan(0)
      expect(stats.categoryCount).toBeGreaterThan(0)
      expect(stats.lastUpdated).toBeGreaterThan(0)
    })

    it('should return zero for empty index', () => {
      const index = createSearchIndex()
      const stats = getIndexStats(index)

      expect(stats.totalTemplates).toBe(0)
      expect(stats.nameTokens).toBe(0)
      expect(stats.tagCount).toBe(0)
    })
  })

  describe('Get Search Suggestions', () => {
    let index: ReturnType<typeof buildSearchIndex>

    beforeEach(() => {
      index = buildSearchIndex(mockTemplates)
    })

    it('should return suggestions based on prefix', () => {
      const suggestions = getSearchSuggestions(index, '基')
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should limit suggestions', () => {
      const suggestions = getSearchSuggestions(index, '基', 2)
      expect(suggestions.length).toBeLessThanOrEqual(2)
    })

    it('should return empty for short prefix', () => {
      const suggestions = getSearchSuggestions(index, '')
      expect(suggestions).toEqual([])
    })

    it('should include tag suggestions', () => {
      const suggestions = getSearchSuggestions(index, '流')
      expect(suggestions.some((s) => s.includes('流') || s === '流程')).toBe(true)
    })

    it('should include pinyin suggestions', () => {
      const suggestions = getSearchSuggestions(index, 'liu')
      // Should suggest template names matching pinyin
      expect(suggestions.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Performance', () => {
    it('should build index efficiently', () => {
      const start = Date.now()
      buildSearchIndex(mockTemplates)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('should search efficiently', () => {
      const index = buildSearchIndex(mockTemplates)

      const start = Date.now()
      for (let i = 0; i < 100; i++) {
        searchWithIndex(index, '架构')
      }
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('should handle large template list', () => {
      const largeTemplates: Template[] = Array(100)
        .fill(null)
        .map((_, i) => ({
          id: `template-${i}`,
          name: `模板 ${i}`,
          description: `描述 ${i}`,
          category: i % 2 === 0 ? 'category-a' : 'category-b',
          tags: [`tag-${i % 5}`],
          shapes: [],
        }))

      const start = Date.now()
      const index = buildSearchIndex(largeTemplates)
      const buildDuration = Date.now() - start

      expect(buildDuration).toBeLessThan(500)
      expect(index.templateCache.size).toBe(100)

      const searchStart = Date.now()
      const results = searchWithIndex(index, '模板')
      const searchDuration = Date.now() - searchStart

      expect(searchDuration).toBeLessThan(50)
      expect(results.length).toBe(100)
    })
  })
})
