import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// 主题类型
export type ThemeType = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'custom'

// 主题配置接口
export interface ThemeConfig {
  // 主题名称
  name: string
  // 主题类型
  type: ThemeType
  // 画布背景色
  canvasBackground: string
  // 网格颜色
  gridColor: string
  // 图形默认填充色
  defaultFill: string
  // 图形默认边框色
  defaultStroke: string
  // 连接线默认颜色
  defaultConnectorColor: string
  // 选中状态颜色
  selectionColor: string
  // 对齐线颜色
  alignmentLineColor: string
  // 文本默认颜色
  defaultTextColor: string
  // UI主题色
  primaryColor: string
  // 是否深色主题
  isDark: boolean
}

// 预设主题
export const presetThemes: Record<string, ThemeConfig> = {
  light: {
    name: '明亮',
    type: 'light',
    canvasBackground: '#ffffff',
    gridColor: '#e8e8e8',
    defaultFill: '#ffffff',
    defaultStroke: '#333333',
    defaultConnectorColor: '#666666',
    selectionColor: '#1890ff',
    alignmentLineColor: '#1890ff',
    defaultTextColor: '#333333',
    primaryColor: '#1890ff',
    isDark: false,
  },
  dark: {
    name: '深色',
    type: 'dark',
    canvasBackground: '#1f1f1f',
    gridColor: '#333333',
    defaultFill: '#2d2d2d',
    defaultStroke: '#888888',
    defaultConnectorColor: '#aaaaaa',
    selectionColor: '#40a9ff',
    alignmentLineColor: '#40a9ff',
    defaultTextColor: '#e0e0e0',
    primaryColor: '#40a9ff',
    isDark: true,
  },
  blue: {
    name: '商务蓝',
    type: 'blue',
    canvasBackground: '#f0f5ff',
    gridColor: '#d6e4ff',
    defaultFill: '#e6f7ff',
    defaultStroke: '#1890ff',
    defaultConnectorColor: '#1890ff',
    selectionColor: '#096dd9',
    alignmentLineColor: '#1890ff',
    defaultTextColor: '#262626',
    primaryColor: '#1890ff',
    isDark: false,
  },
  green: {
    name: '清新绿',
    type: 'green',
    canvasBackground: '#f6ffed',
    gridColor: '#d9f7be',
    defaultFill: '#f6ffed',
    defaultStroke: '#52c41a',
    defaultConnectorColor: '#52c41a',
    selectionColor: '#389e0d',
    alignmentLineColor: '#52c41a',
    defaultTextColor: '#262626',
    primaryColor: '#52c41a',
    isDark: false,
  },
  purple: {
    name: '优雅紫',
    type: 'purple',
    canvasBackground: '#f9f0ff',
    gridColor: '#efdbff',
    defaultFill: '#f9f0ff',
    defaultStroke: '#722ed1',
    defaultConnectorColor: '#722ed1',
    selectionColor: '#531dab',
    alignmentLineColor: '#722ed1',
    defaultTextColor: '#262626',
    primaryColor: '#722ed1',
    isDark: false,
  },
}

// 主题状态接口
export interface ThemeState {
  // 当前主题
  currentTheme: ThemeConfig
  // 自定义主题列表
  customThemes: ThemeConfig[]
  // 是否跟随系统主题
  followSystem: boolean

  // Actions
  // 设置主题
  setTheme: (themeType: ThemeType, customConfig?: Partial<ThemeConfig>) => void
  // 添加自定义主题
  addCustomTheme: (theme: ThemeConfig) => void
  // 删除自定义主题
  removeCustomTheme: (themeName: string) => void
  // 更新自定义主题
  updateCustomTheme: (themeName: string, updates: Partial<ThemeConfig>) => void
  // 切换跟随系统主题
  toggleFollowSystem: () => void
  // 获取当前主题CSS变量
  getThemeCSSVariables: () => Record<string, string>
  // 导出主题
  exportTheme: () => string
  // 导入主题
  importTheme: (themeJson: string) => boolean
}

// 生成CSS变量
const generateCSSVariables = (theme: ThemeConfig): Record<string, string> => {
  return {
    '--visio-canvas-bg': theme.canvasBackground,
    '--visio-grid-color': theme.gridColor,
    '--visio-default-fill': theme.defaultFill,
    '--visio-default-stroke': theme.defaultStroke,
    '--visio-connector-color': theme.defaultConnectorColor,
    '--visio-selection-color': theme.selectionColor,
    '--visio-alignment-color': theme.alignmentLineColor,
    '--visio-text-color': theme.defaultTextColor,
    '--visio-primary-color': theme.primaryColor,
  }
}

// 应用主题到DOM
const applyThemeToDOM = (cssVariables: Record<string, string>) => {
  const root = document.documentElement
  Object.entries(cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        currentTheme: presetThemes.light,
        customThemes: [],
        followSystem: false,

        // 设置主题
        setTheme: (themeType, customConfig) => {
          let newTheme: ThemeConfig

          if (themeType === 'custom' && customConfig) {
            newTheme = {
              ...presetThemes.light,
              ...customConfig,
              type: 'custom',
            }
          } else {
            newTheme = presetThemes[themeType] || presetThemes.light
          }

          set({ currentTheme: newTheme })

          // 应用主题到DOM
          const cssVariables = generateCSSVariables(newTheme)
          applyThemeToDOM(cssVariables)
        },

        // 添加自定义主题
        addCustomTheme: (theme) => {
          const { customThemes } = get()
          // 检查是否已存在同名主题
          if (customThemes.some((t) => t.name === theme.name)) {
            console.warn(`主题 "${theme.name}" 已存在`)
            return
          }
          set({ customThemes: [...customThemes, theme] })
        },

        // 删除自定义主题
        removeCustomTheme: (themeName) => {
          const { customThemes, currentTheme } = get()
          const newCustomThemes = customThemes.filter((t) => t.name !== themeName)
          set({ customThemes: newCustomThemes })

          // 如果当前使用的是被删除的主题，切换到默认主题
          if (currentTheme.name === themeName) {
            get().setTheme('light')
          }
        },

        // 更新自定义主题
        updateCustomTheme: (themeName, updates) => {
          const { customThemes } = get()
          set({
            customThemes: customThemes.map((t) =>
              t.name === themeName ? { ...t, ...updates } : t
            ),
          })
        },

        // 切换跟随系统主题
        toggleFollowSystem: () => {
          const { followSystem } = get()
          const newFollowSystem = !followSystem
          set({ followSystem: newFollowSystem })

          if (newFollowSystem) {
            // 监听系统主题变化
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleChange = (e: MediaQueryListEvent) => {
              get().setTheme(e.matches ? 'dark' : 'light')
            }
            mediaQuery.addEventListener('change', handleChange)

            // 立即应用当前系统主题
            get().setTheme(mediaQuery.matches ? 'dark' : 'light')
          }
        },

        // 获取当前主题CSS变量
        getThemeCSSVariables: () => {
          const { currentTheme } = get()
          return generateCSSVariables(currentTheme)
        },

        // 导出主题
        exportTheme: () => {
          const { currentTheme } = get()
          return JSON.stringify(currentTheme, null, 2)
        },

        // 导入主题
        importTheme: (themeJson) => {
          try {
            const theme = JSON.parse(themeJson) as ThemeConfig
            // 验证主题配置
            if (!theme.name || !theme.canvasBackground) {
              throw new Error('Invalid theme configuration')
            }
            get().addCustomTheme(theme)
            get().setTheme('custom', theme)
            return true
          } catch (error) {
            console.error('导入主题失败:', error)
            return false
          }
        },
      }),
      {
        name: 'ThemeStore',
        partialize: (state) => ({
          currentTheme: state.currentTheme,
          customThemes: state.customThemes,
          followSystem: state.followSystem,
        }),
      }
    ),
    { name: 'ThemeStore' }
  )
)

// 初始化时应用主题
const initTheme = () => {
  const state = useThemeStore.getState()
  const cssVariables = state.getThemeCSSVariables()
  applyThemeToDOM(cssVariables)
}

// 导出初始化函数
export { initTheme }
export default useThemeStore
