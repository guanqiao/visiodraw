import { useState, useEffect, useCallback } from 'react'
import { theme as antdTheme } from 'antd'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'visiodraw-theme'

// 创建自定义事件用于跨组件通信
const THEME_CHANGE_EVENT = 'visiodraw-theme-change'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
      if (stored && (stored === 'light' || stored === 'dark')) {
        return stored
      }

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    return 'dark'
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.getElementById('root')
    const body = document.body

    if (theme === 'dark') {
      root?.setAttribute('data-theme', 'dark')
      body?.setAttribute('data-theme', 'dark')
    } else {
      root?.removeAttribute('data-theme')
      body?.removeAttribute('data-theme')
    }

    // 触发自定义事件，通知主题变化
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }))
  }, [theme])

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [theme, setTheme])

  const isDark = theme === 'dark'
  const isLight = theme === 'light'

  // 获取 Ant Design 主题配置
  const antdThemeConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isLight,
    antdThemeConfig,
  }
}

export { THEME_CHANGE_EVENT }

export default useTheme
