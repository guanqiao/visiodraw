export interface ThemeColors {
  canvasBg: string
  editorBg: string
  editorText: string
  editorBorder: string
  gridLine: string
  gridDot: string
  gridLineDark: string
  gridDotDark: string
  selectionBox: string
  selectionBoxFill: string
  highlight: string
  defaultStroke: string
  defaultFill: string
}

export const themeColors = {
  light: {
    canvasBg: '#f0f2f5',
    editorBg: '#ffffff',
    editorText: '#333333',
    editorBorder: '#1890ff',
    gridLine: '#e0e0e0',
    gridDot: '#d0d0d0',
    gridLineDark: '#3a3a3a',
    gridDotDark: '#404040',
    selectionBox: '#1890ff',
    selectionBoxFill: 'rgba(24, 144, 255, 0.1)',
    highlight: '#1890ff',
    defaultStroke: '#333333',
    defaultFill: '#ffffff',
  },
  dark: {
    canvasBg: '#1e1e1e',
    editorBg: '#2c2c2c',
    editorText: '#e0e0e0',
    editorBorder: '#18a0fb',
    gridLine: '#3a3a3a',
    gridDot: '#404040',
    gridLineDark: '#3a3a3a',
    gridDotDark: '#404040',
    selectionBox: '#18a0fb',
    selectionBoxFill: 'rgba(24, 160, 251, 0.1)',
    highlight: '#18a0fb',
    defaultStroke: '#e0e0e0',
    defaultFill: '#2c2c2c',
  },
} as const

export const getThemeColors = (isDark: boolean): ThemeColors => {
  return isDark ? themeColors.dark : themeColors.light
}

export const getGridColor = (isDark: boolean, gridType: 'dot' | 'line'): string => {
  const colors = getThemeColors(isDark)
  return gridType === 'line' ? colors.gridLine : colors.gridDot
}

export const getEditorStyles = (isDark: boolean) => {
  const colors = getThemeColors(isDark)
  return {
    backgroundColor: colors.editorBg,
    color: colors.editorText,
    borderColor: colors.editorBorder,
  }
}

export default themeColors
