import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { Template, TemplateCategory } from '../../types/template'
import type { DiagramTemplate, DiagramType } from '../../types/diagramTemplate'
import { getBuiltinTemplates, getCustomTemplates } from '../../templates/templateRegistry'
import { getAllTemplates } from '../../templates'
import { buildSearchIndex, searchWithIndex, SearchIndex } from '../../utils/templateSearchIndex'

export interface UseTemplatesOptions {
  visible: boolean
}

export interface UseTemplatesReturn {
  // 数据
  templates: Template[]
  customTemplates: Template[]
  diagramTemplates: DiagramTemplate[]
  favorites: Set<string>
  searchIndex: SearchIndex | null

  // 搜索和过滤
  searchText: string
  setSearchText: (text: string) => void
  activeTab: TemplateCategory | 'custom' | 'diagram'
  setActiveTab: (tab: TemplateCategory | 'custom' | 'diagram') => void
  activeDiagramTab: DiagramType
  setActiveDiagramTab: (tab: DiagramType) => void

  // 过滤后的数据
  filteredTemplates: Template[]
  filteredCustomTemplates: Template[]
  filteredDiagramTemplates: DiagramTemplate[]
  diagramTemplatesByType: Record<DiagramType, DiagramTemplate[]>

  // 操作
  refreshTemplates: () => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

export function useTemplates(options: UseTemplatesOptions): UseTemplatesReturn {
  const { visible } = options

  // 基础数据状态
  const [templates, setTemplates] = useState<Template[]>([])
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  const [diagramTemplates, setDiagramTemplates] = useState<DiagramTemplate[]>([])

  // UI 状态
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<TemplateCategory | 'custom' | 'diagram'>('flowchart')
  const [activeDiagramTab, setActiveDiagramTab] = useState<DiagramType>('activity')

  // 收藏状态
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('visiodraw_template_favorites')
      return new Set(saved ? JSON.parse(saved) : [])
    } catch {
      return new Set()
    }
  })

  // 搜索索引
  const searchIndexRef = useRef<SearchIndex | null>(null)

  // 加载模板数据
  useEffect(() => {
    if (visible) {
      refreshTemplates()
    }
  }, [visible])

  // 保存收藏到 localStorage
  useEffect(() => {
    localStorage.setItem('visiodraw_template_favorites', JSON.stringify([...favorites]))
  }, [favorites])

  // 刷新模板数据
  const refreshTemplates = useCallback(() => {
    const builtinTemplates = getBuiltinTemplates()
    const custom = getCustomTemplates()
    const diagrams = getAllTemplates()

    setTemplates(builtinTemplates)
    setCustomTemplates(custom)
    setDiagramTemplates(diagrams)

    // 构建搜索索引
    const allTemplates = [...builtinTemplates, ...custom, ...diagrams as any]
    searchIndexRef.current = buildSearchIndex(allTemplates)
  }, [])

  // 切换收藏状态
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // 检查是否已收藏
  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites]
  )

  // 使用索引搜索过滤模板
  const filteredTemplates = useMemo(() => {
    if (!searchText) return templates
    if (!searchIndexRef.current) return templates

    const results = searchWithIndex(searchIndexRef.current, searchText, {
      category: ['flowchart', 'org', 'network', 'uml'],
    })

    return results.map((r) => r.template as Template)
  }, [templates, searchText])

  // 过滤自定义模板
  const filteredCustomTemplates = useMemo(() => {
    if (!searchText) return customTemplates
    if (!searchIndexRef.current) return customTemplates

    const results = searchWithIndex(searchIndexRef.current, searchText, {
      category: 'custom',
    })

    return results.map((r) => r.template as Template)
  }, [customTemplates, searchText])

  // 过滤图表模板
  const filteredDiagramTemplates = useMemo(() => {
    if (!searchText) return diagramTemplates
    if (!searchIndexRef.current) return diagramTemplates

    const results = searchWithIndex(searchIndexRef.current, searchText)
    return results
      .map((r) => r.template as unknown as DiagramTemplate)
      .filter((t): t is DiagramTemplate => 'type' in t && 'nodes' in t)
  }, [diagramTemplates, searchText])

  // 按类型分组的图表模板
  const diagramTemplatesByType = useMemo(() => {
    const result: Partial<Record<DiagramType, DiagramTemplate[]>> = {
      activity: [],
      sequence: [],
      state: [],
      er: [],
      class: [],
      gantt: [],
    }

    const source = searchText ? filteredDiagramTemplates : diagramTemplates

    source.forEach((template) => {
      if (!result[template.type]) {
        result[template.type] = []
      }
      result[template.type]!.push(template)
    })

    return result as Record<DiagramType, DiagramTemplate[]>
  }, [diagramTemplates, filteredDiagramTemplates, searchText])

  return {
    // 数据
    templates,
    customTemplates,
    diagramTemplates,
    favorites,
    searchIndex: searchIndexRef.current,

    // 搜索和过滤
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    activeDiagramTab,
    setActiveDiagramTab,

    // 过滤后的数据
    filteredTemplates,
    filteredCustomTemplates,
    filteredDiagramTemplates,
    diagramTemplatesByType,

    // 操作
    refreshTemplates,
    toggleFavorite,
    isFavorite,
  }
}
