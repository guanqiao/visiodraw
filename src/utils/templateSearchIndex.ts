import type { Template } from '../types/template'

/**
 * 倒排索引项
 */
export interface InvertedIndexEntry {
  /** 模板ID列表 */
  templateIds: Set<string>
  /** 词频统计（用于相关性排序） */
  termFrequency: Map<string, number>
}

/**
 * 倒排索引结构
 */
export interface SearchIndex {
  /** 名称索引：词 -> 模板ID集合 */
  nameIndex: Map<string, InvertedIndexEntry>
  /** 描述索引：词 -> 模板ID集合 */
  descriptionIndex: Map<string, InvertedIndexEntry>
  /** 标签索引：标签 -> 模板ID集合 */
  tagIndex: Map<string, Set<string>>
  /** 分类索引：分类 -> 模板ID集合 */
  categoryIndex: Map<string, Set<string>>
  /** 拼音索引：拼音 -> 模板ID集合 */
  pinyinIndex: Map<string, Set<string>>
  /** 模板数据缓存：ID -> Template */
  templateCache: Map<string, Template>
  /** 最后更新时间 */
  lastUpdated: number
}

/**
 * 搜索结果项
 */
export interface IndexedSearchResult {
  template: Template
  score: number
  matchedFields: Array<'name' | 'description' | 'tag' | 'category' | 'pinyin'>
}

/**
 * 创建空的搜索索引
 */
export function createSearchIndex(): SearchIndex {
  return {
    nameIndex: new Map(),
    descriptionIndex: new Map(),
    tagIndex: new Map(),
    categoryIndex: new Map(),
    pinyinIndex: new Map(),
    templateCache: new Map(),
    lastUpdated: Date.now(),
  }
}

/**
 * 分词函数
 * 将文本分割成关键词列表
 */
export function tokenize(text: string): string[] {
  if (!text || typeof text !== 'string') return []

  // 转换为小写并去除多余空格
  const normalized = text.toLowerCase().trim()
  if (!normalized) return []

  // 按空格、标点符号分词
  const tokens = normalized
    .split(/[\s\p{P}\p{S}]+/u)
    .filter((token) => token.length > 0)

  // 同时添加 n-gram（2-3 字）用于中文模糊匹配
  const ngrams: string[] = []
  for (const token of tokens) {
    if (token.length >= 2) {
      for (let i = 0; i <= token.length - 2; i++) {
        ngrams.push(token.substring(i, i + 2))
        if (i <= token.length - 3) {
          ngrams.push(token.substring(i, i + 3))
        }
      }
    }
  }

  return [...new Set([...tokens, ...ngrams])]
}

/**
 * 简单的拼音映射表
 * 实际项目中可以使用 pinyin 库
 */
const PINYIN_MAP: Record<string, string> = {
  // 常见词汇
  '流程': 'liucheng',
  '流程图': 'liuchengtu',
  '架构': 'jiagou',
  '架构图': 'jiagoutu',
  '组织': 'zuzhi',
  '组织结构': 'zuzhijiegou',
  '网络': 'wangluo',
  '网络拓扑': 'wangluotuopu',
  '设计': 'sheji',
  '基础': 'jichu',
  '入门': 'rumen',
  '管理': 'guanli',
  '拓扑': 'tuopu',
  '微服务': 'weifuwu',
  '云原生': 'yunyuansheng',
  '数据库': 'shujuku',
  '系统': 'xitong',
  '部署': 'bushu',
  '安全': 'anquan',
  '监控': 'jiankong',
  '活动': 'huodong',
  '状态': 'zhuangtai',
  '时序': 'shixu',
  '序列': 'xulie',
  '实体': 'shiti',
  '关系': 'guanxi',
  '类图': 'letu',
  '甘特': 'gante',
  '项目': 'xiangmu',
  '进度': 'jindu',
  '决策': 'juece',
  '泳道': 'yongdao',
  '用例': 'yongli',
  '组件': 'zujian',
  '高可用': 'gaokeyong',
  '集群': 'jiqun',
  '负载': 'fuzai',
  '均衡': 'junheng',
  '缓存': 'huancun',
  '消息': 'xiaoxi',
  '队列': 'duilie',
  '搜索': 'sousuo',
  '推荐': 'tuijian',
  '日志': 'rizi',
  '用户': 'yonghu',
  '认证': 'renzheng',
  '授权': 'shouquan',
  '支付': 'zhifu',
  '订单': 'dingdan',
  '库存': 'kucun',
  '仓储': 'cangchu',
  '物流': 'wuliu',
  '配送': 'peisong',
  '供应链': 'gongyinglian',
}

/**
 * 获取文本的拼音表示
 */
export function getPinyin(text: string): string[] {
  if (!text) return []

  const pinyins: string[] = []

  // 直接匹配完整词汇
  for (const [chars, py] of Object.entries(PINYIN_MAP)) {
    if (text.includes(chars)) {
      pinyins.push(py)
      // 也添加首字母缩写
      pinyins.push(py.charAt(0))
    }
  }

  return [...new Set(pinyins)]
}

/**
 * 构建倒排索引
 * @param templates 模板列表
 * @returns 搜索索引
 */
export function buildSearchIndex(templates: Template[]): SearchIndex {
  const index = createSearchIndex()

  for (const template of templates) {
    if (!template.id) continue

    // 缓存模板数据
    index.templateCache.set(template.id, template)

    // 索引名称
    if (template.name) {
      const nameTokens = tokenize(template.name)
      for (const token of nameTokens) {
        addToIndex(index.nameIndex, token, template.id, template.name)
      }

      // 索引拼音
      const pinyins = getPinyin(template.name)
      for (const py of pinyins) {
        if (!index.pinyinIndex.has(py)) {
          index.pinyinIndex.set(py, new Set())
        }
        index.pinyinIndex.get(py)!.add(template.id)
      }
    }

    // 索引描述
    if (template.description) {
      const descTokens = tokenize(template.description)
      for (const token of descTokens) {
        addToIndex(index.descriptionIndex, token, template.id, template.description)
      }
    }

    // 索引标签
    if (template.tags) {
      for (const tag of template.tags) {
        const normalizedTag = tag.toLowerCase()
        if (!index.tagIndex.has(normalizedTag)) {
          index.tagIndex.set(normalizedTag, new Set())
        }
        index.tagIndex.get(normalizedTag)!.add(template.id)

        // 标签也加入拼音索引
        const tagPinyins = getPinyin(tag)
        for (const py of tagPinyins) {
          if (!index.pinyinIndex.has(py)) {
            index.pinyinIndex.set(py, new Set())
          }
          index.pinyinIndex.get(py)!.add(template.id)
        }
      }
    }

    // 索引分类
    if (template.category) {
      const normalizedCategory = template.category.toLowerCase()
      if (!index.categoryIndex.has(normalizedCategory)) {
        index.categoryIndex.set(normalizedCategory, new Set())
      }
      index.categoryIndex.get(normalizedCategory)!.add(template.id)
    }
  }

  index.lastUpdated = Date.now()
  return index
}

/**
 * 添加条目到索引
 */
function addToIndex(
  index: Map<string, InvertedIndexEntry>,
  token: string,
  templateId: string,
  sourceText: string
): void {
  if (!index.has(token)) {
    index.set(token, {
      templateIds: new Set(),
      termFrequency: new Map(),
    })
  }

  const entry = index.get(token)!
  entry.templateIds.add(templateId)

  // 计算词频
  const currentFreq = entry.termFrequency.get(templateId) || 0
  entry.termFrequency.set(templateId, currentFreq + 1)
}

/**
 * 更新索引（添加单个模板）
 * @param index 搜索索引
 * @param template 要添加的模板
 */
export function addTemplateToIndex(index: SearchIndex, template: Template): void {
  if (!template.id) return

  // 移除旧的（如果存在）
  removeTemplateFromIndex(index, template.id)

  // 重新添加
  const tempIndex = buildSearchIndex([template])

  // 合并索引
  mergeIndex(index.nameIndex, tempIndex.nameIndex)
  mergeIndex(index.descriptionIndex, tempIndex.descriptionIndex)
  mergeTagIndex(index.tagIndex, tempIndex.tagIndex)
  mergeTagIndex(index.categoryIndex, tempIndex.categoryIndex)
  mergeTagIndex(index.pinyinIndex, tempIndex.pinyinIndex)

  // 更新缓存
  index.templateCache.set(template.id, template)
  index.lastUpdated = Date.now()
}

/**
 * 从索引中移除模板
 * @param index 搜索索引
 * @param templateId 模板ID
 */
export function removeTemplateFromIndex(index: SearchIndex, templateId: string): void {
  // 从所有索引中移除
  removeFromInvertedIndex(index.nameIndex, templateId)
  removeFromInvertedIndex(index.descriptionIndex, templateId)
  removeFromTagIndex(index.tagIndex, templateId)
  removeFromTagIndex(index.categoryIndex, templateId)
  removeFromTagIndex(index.pinyinIndex, templateId)

  // 从缓存中移除
  index.templateCache.delete(templateId)
  index.lastUpdated = Date.now()
}

/**
 * 从倒排索引中移除模板
 */
function removeFromInvertedIndex(
  index: Map<string, InvertedIndexEntry>,
  templateId: string
): void {
  for (const [token, entry] of index.entries()) {
    entry.templateIds.delete(templateId)
    entry.termFrequency.delete(templateId)

    // 如果没有模板包含这个词，删除该索引项
    if (entry.templateIds.size === 0) {
      index.delete(token)
    }
  }
}

/**
 * 从标签索引中移除模板
 */
function removeFromTagIndex(
  index: Map<string, Set<string>>,
  templateId: string
): void {
  for (const [key, ids] of index.entries()) {
    ids.delete(templateId)
    if (ids.size === 0) {
      index.delete(key)
    }
  }
}

/**
 * 合并倒排索引
 */
function mergeIndex(
  target: Map<string, InvertedIndexEntry>,
  source: Map<string, InvertedIndexEntry>
): void {
  for (const [token, entry] of source.entries()) {
    if (!target.has(token)) {
      target.set(token, {
        templateIds: new Set(),
        termFrequency: new Map(),
      })
    }

    const targetEntry = target.get(token)!
    for (const id of entry.templateIds) {
      targetEntry.templateIds.add(id)
    }
    for (const [id, freq] of entry.termFrequency.entries()) {
      const currentFreq = targetEntry.termFrequency.get(id) || 0
      targetEntry.termFrequency.set(id, currentFreq + freq)
    }
  }
}

/**
 * 合并标签索引
 */
function mergeTagIndex(
  target: Map<string, Set<string>>,
  source: Map<string, Set<string>>
): void {
  for (const [key, ids] of source.entries()) {
    if (!target.has(key)) {
      target.set(key, new Set())
    }
    for (const id of ids) {
      target.get(key)!.add(id)
    }
  }
}

/**
 * 使用倒排索引搜索模板
 * @param index 搜索索引
 * @param query 搜索关键词
 * @param options 搜索选项
 * @returns 搜索结果列表
 */
export function searchWithIndex(
  index: SearchIndex,
  query: string,
  options: {
    category?: string | string[]
    tags?: string[]
    limit?: number
    fuzzy?: boolean
  } = {}
): IndexedSearchResult[] {
  if (!query || !query.trim()) {
    // 如果没有查询词，返回所有模板（或按过滤条件）
    return getAllTemplatesFromIndex(index, options)
  }

  const normalizedQuery = query.toLowerCase().trim()
  const queryTokens = tokenize(normalizedQuery)

  // 收集匹配的模板ID及其得分
  const scores = new Map<string, { score: number; matchedFields: Set<string> }>()

  // 在名称索引中搜索
  for (const token of queryTokens) {
    searchInInvertedIndex(index.nameIndex, token, scores, 'name', 3)
  }

  // 在描述索引中搜索
  for (const token of queryTokens) {
    searchInInvertedIndex(index.descriptionIndex, token, scores, 'description', 1.5)
  }

  // 在标签索引中搜索
  for (const token of queryTokens) {
    const exactTagMatch = index.tagIndex.get(token)
    if (exactTagMatch) {
      for (const id of exactTagMatch) {
        updateScore(scores, id, 2, 'tag')
      }
    }

    // 模糊匹配标签
    if (options.fuzzy !== false) {
      for (const [tag, ids] of index.tagIndex.entries()) {
        if (tag.includes(token) || token.includes(tag)) {
          for (const id of ids) {
            updateScore(scores, id, 1, 'tag')
          }
        }
      }
    }
  }

  // 在拼音索引中搜索
  const queryPinyins = getPinyin(normalizedQuery)
  for (const py of queryPinyins) {
    const pinyinMatch = index.pinyinIndex.get(py)
    if (pinyinMatch) {
      for (const id of pinyinMatch) {
        updateScore(scores, id, 2.5, 'pinyin')
      }
    }
  }

  // 模糊拼音匹配（查询词本身就是拼音）
  if (options.fuzzy !== false) {
    for (const [py, ids] of index.pinyinIndex.entries()) {
      if (py.includes(normalizedQuery) || normalizedQuery.includes(py)) {
        for (const id of ids) {
          updateScore(scores, id, 1.5, 'pinyin')
        }
      }
    }
  }

  // 转换为结果数组
  let results: IndexedSearchResult[] = []
  for (const [id, data] of scores.entries()) {
    const template = index.templateCache.get(id)
    if (template) {
      results.push({
        template,
        score: data.score,
        matchedFields: Array.from(data.matchedFields) as any,
      })
    }
  }

  // 应用过滤条件
  if (options.category) {
    results = filterByCategory(results, options.category, index)
  }

  if (options.tags && options.tags.length > 0) {
    results = filterByTags(results, options.tags, index)
  }

  // 按得分排序
  results.sort((a, b) => b.score - a.score)

  // 限制结果数量
  if (options.limit && options.limit > 0) {
    results = results.slice(0, options.limit)
  }

  return results
}

/**
 * 在倒排索引中搜索
 */
function searchInInvertedIndex(
  index: Map<string, InvertedIndexEntry>,
  token: string,
  scores: Map<string, { score: number; matchedFields: Set<string> }>,
  field: string,
  weight: number
): void {
  // 精确匹配
  const exactMatch = index.get(token)
  if (exactMatch) {
    for (const id of exactMatch.templateIds) {
      const tf = exactMatch.termFrequency.get(id) || 1
      updateScore(scores, id, weight * (1 + Math.log(tf)), field)
    }
  }

  // 前缀匹配
  for (const [key, entry] of index.entries()) {
    if (key !== token && (key.startsWith(token) || token.startsWith(key))) {
      for (const id of entry.templateIds) {
        const tf = entry.termFrequency.get(id) || 1
        updateScore(scores, id, weight * 0.5 * (1 + Math.log(tf)), field)
      }
    }
  }
}

/**
 * 更新得分
 */
function updateScore(
  scores: Map<string, { score: number; matchedFields: Set<string> }>,
  id: string,
  score: number,
  field: string
): void {
  if (!scores.has(id)) {
    scores.set(id, { score: 0, matchedFields: new Set() })
  }
  const data = scores.get(id)!
  data.score += score
  data.matchedFields.add(field)
}

/**
 * 从索引获取所有模板
 */
function getAllTemplatesFromIndex(
  index: SearchIndex,
  options: {
    category?: string | string[]
    tags?: string[]
    limit?: number
  }
): IndexedSearchResult[] {
  let results: IndexedSearchResult[] = Array.from(index.templateCache.values()).map(
    (template) => ({
      template,
      score: 0,
      matchedFields: [],
    })
  )

  if (options.category) {
    results = filterByCategory(results, options.category, index)
  }

  if (options.tags && options.tags.length > 0) {
    results = filterByTags(results, options.tags, index)
  }

  if (options.limit && options.limit > 0) {
    results = results.slice(0, options.limit)
  }

  return results
}

/**
 * 按分类过滤
 */
function filterByCategory(
  results: IndexedSearchResult[],
  category: string | string[],
  index: SearchIndex
): IndexedSearchResult[] {
  const categories = Array.isArray(category)
    ? category.map((c) => c.toLowerCase())
    : [category.toLowerCase()]

  return results.filter((result) => {
    const templateCategory = result.template.category?.toLowerCase()
    return categories.includes(templateCategory || '')
  })
}

/**
 * 按标签过滤
 */
function filterByTags(
  results: IndexedSearchResult[],
  tags: string[],
  index: SearchIndex
): IndexedSearchResult[] {
  const normalizedTags = tags.map((t) => t.toLowerCase())

  return results.filter((result) => {
    if (!result.template.tags) return false
    const templateTags = result.template.tags.map((t) => t.toLowerCase())
    return normalizedTags.every((tag) => templateTags.includes(tag))
  })
}

/**
 * 获取索引统计信息
 * @param index 搜索索引
 */
export function getIndexStats(index: SearchIndex): {
  totalTemplates: number
  nameTokens: number
  descriptionTokens: number
  tagCount: number
  categoryCount: number
  pinyinCount: number
  lastUpdated: number
} {
  return {
    totalTemplates: index.templateCache.size,
    nameTokens: index.nameIndex.size,
    descriptionTokens: index.descriptionIndex.size,
    tagCount: index.tagIndex.size,
    categoryCount: index.categoryIndex.size,
    pinyinCount: index.pinyinIndex.size,
    lastUpdated: index.lastUpdated,
  }
}

/**
 * 获取搜索建议
 * @param index 搜索索引
 * @param prefix 输入前缀
 * @param limit 返回数量限制
 */
export function getSearchSuggestions(
  index: SearchIndex,
  prefix: string,
  limit: number = 5
): string[] {
  if (!prefix || prefix.length < 1) return []

  const normalizedPrefix = prefix.toLowerCase()
  const suggestions = new Set<string>()

  // 从名称索引获取建议
  for (const token of index.nameIndex.keys()) {
    if (token.startsWith(normalizedPrefix)) {
      suggestions.add(token)
    }
    if (suggestions.size >= limit * 2) break
  }

  // 从标签索引获取建议
  for (const tag of index.tagIndex.keys()) {
    if (tag.startsWith(normalizedPrefix)) {
      suggestions.add(tag)
    }
    if (suggestions.size >= limit * 2) break
  }

  // 从拼音索引获取建议
  for (const py of index.pinyinIndex.keys()) {
    if (py.startsWith(normalizedPrefix)) {
      // 找到对应的模板名称作为建议
      const templateIds = index.pinyinIndex.get(py)
      if (templateIds) {
        for (const id of templateIds) {
          const template = index.templateCache.get(id)
          if (template?.name) {
            suggestions.add(template.name)
            break
          }
        }
      }
    }
    if (suggestions.size >= limit * 2) break
  }

  return Array.from(suggestions).slice(0, limit)
}

export default {
  createSearchIndex,
  buildSearchIndex,
  addTemplateToIndex,
  removeTemplateFromIndex,
  searchWithIndex,
  getIndexStats,
  getSearchSuggestions,
  tokenize,
  getPinyin,
}
