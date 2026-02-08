import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'
import { THEME_CHANGE_EVENT } from '@hooks/useTheme'

// 获取初始主题
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('visiodraw-theme')
  if (stored === 'dark' || stored === 'light') return stored
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

// 动态主题包装组件
const DynamicThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => getInitialTheme() === 'dark')

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setIsDark(e.detail === 'dark')
    }

    window.addEventListener(THEME_CHANGE_EVENT as any, handleThemeChange as any)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT as any, handleThemeChange as any)
    }
  }, [])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DynamicThemeProvider>
      <App />
    </DynamicThemeProvider>
  </React.StrictMode>,
)
