import type { Template } from '../types/template'

export interface SearchOptions {
  category?: string | string[]
  tags?: string[]
  sortBy?: 'name' | 'category' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface FuzzySearchResult {
  template: Template
  score: number
}

/**
 * 搜索模板
 * @param templates 模板列表
 * @param query 搜索关键词
 * @param options 搜索选项
 * @returns 匹配的模板列表
 */
export function searchTemplates(
  templates: Template[],
  query: string,
  options: SearchOptions = {}
): Template[] {
  if (!templates || !Array.isArray(templates)) {
    return []
  }

  let results = [...templates]

  // 关键词搜索
  if (query && query.trim()) {
    const normalizedQuery = query.toLowerCase().trim()
    results = results.filter((template) => {
      const nameMatch = template.name?.toLowerCase().includes(normalizedQuery)
      const descMatch = template.description?.toLowerCase().includes(normalizedQuery)
      const tagMatch = template.tags?.some((tag) =>
        tag.toLowerCase().includes(normalizedQuery)
      )
      return nameMatch || descMatch || tagMatch
    })
  }

  // 分类过滤
  if (options.category) {
    results = filterTemplatesByCategory(results, options.category)
  }

  // 标签过滤
  if (options.tags && options.tags.length > 0) {
    results = filterTemplatesByTags(results, options.tags)
  }

  // 排序
  if (options.sortBy) {
    results = sortTemplates(results, options.sortBy, options.sortOrder)
  }

  return results
}

/**
 * 按标签过滤模板
 * @param templates 模板列表
 * @param tags 标签列表
 * @returns 匹配的模板列表
 */
export function filterTemplatesByTags(templates: Template[], tags: string[]): Template[] {
  if (!templates || !Array.isArray(templates)) {
    return []
  }

  if (!tags || tags.length === 0) {
    return templates
  }

  return templates.filter((template) => {
    if (!template.tags || !Array.isArray(template.tags)) {
      return false
    }
    // AND 逻辑：模板必须包含所有指定的标签
    return tags.every((tag) =>
      template.tags!.some((t) => t.toLowerCase() === tag.toLowerCase())
    )
  })
}

/**
 * 按分类过滤模板
 * @param templates 模板列表
 * @param category 分类或分类列表
 * @returns 匹配的模板列表
 */
export function filterTemplatesByCategory(
  templates: Template[],
  category: string | string[]
): Template[] {
  if (!templates || !Array.isArray(templates)) {
    return []
  }

  const categories = Array.isArray(category) ? category : [category]

  return templates.filter((template) =>
    categories.some((cat) => template.category?.toLowerCase() === cat.toLowerCase())
  )
}

/**
 * 排序模板
 * @param templates 模板列表
 * @param sortBy 排序字段
 * @param sortOrder 排序顺序
 * @returns 排序后的模板列表
 */
export function sortTemplates(
  templates: Template[],
  sortBy: 'name' | 'category' | 'createdAt' = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
): Template[] {
  if (!templates || !Array.isArray(templates)) {
    return []
  }

  const sorted = [...templates].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '', 'zh-CN')
        break
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '', 'zh-CN')
        break
      case 'createdAt':
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        comparison = aDate - bDate
        break
      default:
        comparison = 0
    }

    return sortOrder === 'desc' ? -comparison : comparison
  })

  return sorted
}

/**
 * 获取热门标签
 * @param templates 模板列表
 * @param limit 返回数量限制
 * @returns 热门标签列表
 */
export function getPopularTags(
  templates: Template[],
  limit: number = 10
): { tag: string; count: number }[] {
  if (!templates || !Array.isArray(templates)) {
    return []
  }

  const tagCount = new Map<string, number>()

  templates.forEach((template) => {
    if (template.tags && Array.isArray(template.tags)) {
      template.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase()
        tagCount.set(normalizedTag, (tagCount.get(normalizedTag) || 0) + 1)
      })
    }
  })

  return Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * 高亮搜索关键词
 * @param text 原始文本
 * @param query 搜索关键词
 * @returns 高亮后的HTML字符串
 */
export function highlightSearchKeywords(text: string, query: string): string {
  if (!text || !query || !query.trim()) {
    return text || ''
  }

  const keywords = query.trim().split(/\s+/)
  let highlighted = text

  keywords.forEach((keyword) => {
    if (!keyword) return
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
    highlighted = highlighted.replace(regex, '<mark>$1</mark>')
  })

  return highlighted
}

/**
 * 模糊搜索模板
 * @param templates 模板列表
 * @param query 搜索关键词
 * @returns 带相似度分数的搜索结果
 */
export function fuzzySearchTemplates(
  templates: Template[],
  query: string
): FuzzySearchResult[] {
  if (!templates || !Array.isArray(templates) || !query || !query.trim()) {
    return []
  }

  const normalizedQuery = query.toLowerCase().trim()
  const results: FuzzySearchResult[] = []

  templates.forEach((template) => {
    let score = 0

    // 名称匹配（权重最高）
    const nameScore = calculateSimilarity(template.name?.toLowerCase() || '', normalizedQuery)
    score += nameScore * 3

    // 描述匹配
    const descScore = calculateSimilarity(template.description?.toLowerCase() || '', normalizedQuery)
    score += descScore * 2

    // 标签匹配
    if (template.tags) {
      template.tags.forEach((tag) => {
        const tagScore = calculateSimilarity(tag.toLowerCase(), normalizedQuery)
        score += tagScore * 1.5
      })
    }

    // 拼音匹配（简单实现）
    const pinyinScore = calculatePinyinSimilarity(template.name || '', normalizedQuery)
    score += pinyinScore * 2

    if (score > 0) {
      results.push({ template, score })
    }
  })

  // 按分数降序排序
  return results.sort((a, b) => b.score - a.score)
}

/**
 * 计算字符串相似度（Levenshtein距离）
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 相似度分数（0-1）
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0

  // 完全匹配
  if (str1 === str2) return 1

  // 包含匹配
  if (str1.includes(str2) || str2.includes(str1)) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    return shorter.length / longer.length
  }

  // Levenshtein距离
  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)
  return 1 - distance / maxLength
}

/**
 * 计算Levenshtein距离
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 编辑距离
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * 计算拼音相似度（简化实现）
 * @param str 中文字符串
 * @param query 拼音查询
 * @returns 相似度分数
 */
function calculatePinyinSimilarity(str: string, query: string): number {
  // 简化的拼音匹配实现
  // 实际项目中可以使用 pinyin 库
  const pinyinMap: Record<string, string> = {
    '流程': 'liucheng',
    '架构': 'jiagou',
    '组织': 'zuzhi',
    '网络': 'wangluo',
    '设计': 'sheji',
    '基础': 'jichu',
    '入门': 'rumen',
    '管理': 'guanli',
    '拓扑': 'tuopu',
    '微服务': 'weifuwu',
    '云原生': 'yunyuansheng',
  }

  let score = 0
  for (const [chars, pinyin] of Object.entries(pinyinMap)) {
    if (str.includes(chars) && pinyin.includes(query.toLowerCase())) {
      score = Math.max(score, 0.8)
    }
  }

  return score
}

/**
 * 转义正则表达式特殊字符
 * @param string 字符串
 * @returns 转义后的字符串
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default {
  searchTemplates,
  filterTemplatesByTags,
  filterTemplatesByCategory,
  sortTemplates,
  getPopularTags,
  highlightSearchKeywords,
  fuzzySearchTemplates,
}
