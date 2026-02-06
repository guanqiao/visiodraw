/**
 * 模板状态管理
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Template, TemplateCategory } from '@templates/types'
import { BUILT_IN_TEMPLATES } from '@templates/builtInTemplates'

interface TemplateState {
  // 自定义模板列表
  customTemplates: Template[]
  // 当前选中的模板
  selectedTemplateId: string | null
  // 当前分类筛选
  currentCategory: TemplateCategory | 'all'

  // Actions
  addCustomTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>) => void
  updateCustomTemplate: (id: string, updates: Partial<Template>) => void
  deleteCustomTemplate: (id: string) => void
  selectTemplate: (id: string | null) => void
  setCurrentCategory: (category: TemplateCategory | 'all') => void
  getAllTemplates: () => Template[]
  getTemplateById: (id: string) => Template | undefined
  getTemplatesByCategory: (category: TemplateCategory) => Template[]
}

const useTemplateStore = create<TemplateState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        customTemplates: [],
        selectedTemplateId: null,
        currentCategory: 'all',

        // 添加自定义模板
        addCustomTemplate: (template) => {
          const newTemplate: Template = {
            ...template,
            id: `custom-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isBuiltIn: false,
          }
          set((state) => ({
            customTemplates: [...state.customTemplates, newTemplate],
          }))
        },

        // 更新自定义模板
        updateCustomTemplate: (id, updates) => {
          set((state) => ({
            customTemplates: state.customTemplates.map((t) =>
              t.id === id
                ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                : t
            ),
          }))
        },

        // 删除自定义模板
        deleteCustomTemplate: (id) => {
          set((state) => ({
            customTemplates: state.customTemplates.filter((t) => t.id !== id),
            selectedTemplateId:
              state.selectedTemplateId === id ? null : state.selectedTemplateId,
          }))
        },

        // 选择模板
        selectTemplate: (id) => {
          set({ selectedTemplateId: id })
        },

        // 设置当前分类
        setCurrentCategory: (category) => {
          set({ currentCategory: category })
        },

        // 获取所有模板（内置 + 自定义）
        getAllTemplates: () => {
          const { customTemplates } = get()
          return [...BUILT_IN_TEMPLATES, ...customTemplates]
        },

        // 根据ID获取模板
        getTemplateById: (id) => {
          const { customTemplates } = get()
          const allTemplates = [...BUILT_IN_TEMPLATES, ...customTemplates]
          return allTemplates.find((t) => t.id === id)
        },

        // 根据分类获取模板
        getTemplatesByCategory: (category) => {
          const { customTemplates } = get()
          const allTemplates = [...BUILT_IN_TEMPLATES, ...customTemplates]
          return allTemplates.filter((t) => t.category === category)
        },
      }),
      {
        name: 'template-store',
        partialize: (state) => ({
          customTemplates: state.customTemplates,
        }),
      }
    ),
    { name: 'template-store' }
  )
)

export default useTemplateStore
