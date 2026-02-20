/**
 * 甘特图主题系统
 *
 * 提供专业的视觉样式和主题支持：
 * 1. 现代化配色方案（参考 Microsoft Project）
 * 2. 任务条样式（圆角、阴影、渐变）
 * 3. 时间轴样式
 * 4. 里程碑动画效果
 * 5. 主题切换支持
 */

export type GanttThemeName = 'default' | 'modern' | 'dark' | 'professional'

export interface GanttTheme {
  name: GanttThemeName
  colors: {
    // 任务状态颜色
    taskDefault: string
    taskDone: string
    taskActive: string
    taskCrit: string
    taskMilestone: string

    // 关键路径颜色
    criticalPath: string
    criticalPathHighlight: string

    // 时间轴颜色
    timelineBackground: string
    timelineGrid: string
    timelineWeekend: string
    timelineToday: string

    // 文本颜色
    textPrimary: string
    textSecondary: string
    textMuted: string

    // 边框颜色
    border: string
    borderLight: string

    // 背景色
    background: string
    backgroundSecondary: string
    backgroundTertiary: string

    // 依赖线颜色
    dependency: string
    dependencyCritical: string
  }

  taskBar: {
    borderRadius: number
    shadow: string
    shadowHover: string
    height: number
    minWidth: number
  }

  milestone: {
    size: number
    animation: boolean
    pulseColor: string
  }

  timeline: {
    headerHeight: number
    rowHeight: number
    scaleHeight: number
    fontSize: number
    fontSizeSmall: number
  }

  progressBar: {
    height: number
    color: string
    backgroundColor: string
  }

  grid: {
    showVertical: boolean
    showHorizontal: boolean
    verticalColor: string
    horizontalColor: string
  }
}

// 默认主题
export const defaultTheme: GanttTheme = {
  name: 'default',
  colors: {
    taskDefault: '#1890ff',
    taskDone: '#52c41a',
    taskActive: '#faad14',
    taskCrit: '#ff4d4f',
    taskMilestone: '#722ed1',

    criticalPath: '#ff4d4f',
    criticalPathHighlight: '#ff7875',

    timelineBackground: '#ffffff',
    timelineGrid: '#f0f0f0',
    timelineWeekend: '#fafafa',
    timelineToday: '#e6f7ff',

    textPrimary: '#262626',
    textSecondary: '#595959',
    textMuted: '#8c8c8c',

    border: '#d9d9d9',
    borderLight: '#f0f0f0',

    background: '#ffffff',
    backgroundSecondary: '#fafafa',
    backgroundTertiary: '#f5f5f5',

    dependency: '#8c8c8c',
    dependencyCritical: '#ff4d4f',
  },

  taskBar: {
    borderRadius: 4,
    shadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    shadowHover: '0 2px 8px rgba(0, 0, 0, 0.15)',
    height: 24,
    minWidth: 20,
  },

  milestone: {
    size: 16,
    animation: true,
    pulseColor: '#722ed1',
  },

  timeline: {
    headerHeight: 40,
    rowHeight: 40,
    scaleHeight: 30,
    fontSize: 12,
    fontSizeSmall: 10,
  },

  progressBar: {
    height: 4,
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  grid: {
    showVertical: true,
    showHorizontal: true,
    verticalColor: '#f0f0f0',
    horizontalColor: '#f0f0f0',
  },
}

// 现代主题
export const modernTheme: GanttTheme = {
  ...defaultTheme,
  name: 'modern',
  colors: {
    ...defaultTheme.colors,
    taskDefault: '#1677ff',
    taskDone: '#22c55e',
    taskActive: '#f59e0b',
    taskCrit: '#ef4444',
    taskMilestone: '#8b5cf6',

    timelineBackground: '#fafafa',
    timelineGrid: '#e5e7eb',
    timelineWeekend: '#f3f4f6',
  },

  taskBar: {
    ...defaultTheme.taskBar,
    borderRadius: 6,
    shadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    shadowHover: '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
}

// 深色主题
export const darkTheme: GanttTheme = {
  ...defaultTheme,
  name: 'dark',
  colors: {
    taskDefault: '#3b82f6',
    taskDone: '#10b981',
    taskActive: '#f59e0b',
    taskCrit: '#ef4444',
    taskMilestone: '#a855f7',

    criticalPath: '#ef4444',
    criticalPathHighlight: '#f87171',

    timelineBackground: '#1f2937',
    timelineGrid: '#374151',
    timelineWeekend: '#111827',
    timelineToday: '#1e3a8a',

    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',

    border: '#374151',
    borderLight: '#4b5563',

    background: '#111827',
    backgroundSecondary: '#1f2937',
    backgroundTertiary: '#374151',

    dependency: '#6b7280',
    dependencyCritical: '#ef4444',
  },

  grid: {
    ...defaultTheme.grid,
    verticalColor: '#374151',
    horizontalColor: '#374151',
  },
}

// 专业主题（参考 Microsoft Project）
export const professionalTheme: GanttTheme = {
  ...defaultTheme,
  name: 'professional',
  colors: {
    taskDefault: '#4472c4',
    taskDone: '#70ad47',
    taskActive: '#ffc000',
    taskCrit: '#c5504b',
    taskMilestone: '#5b9bd5',

    criticalPath: '#c5504b',
    criticalPathHighlight: '#d98880',

    timelineBackground: '#ffffff',
    timelineGrid: '#e7e6e6',
    timelineWeekend: '#f2f2f2',
    timelineToday: '#ddebf7',

    textPrimary: '#2d2d2d',
    textSecondary: '#595959',
    textMuted: '#7f7f7f',

    border: '#bfbfbf',
    borderLight: '#d9d9d9',

    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#f2f2f2',

    dependency: '#7f7f7f',
    dependencyCritical: '#c5504b',
  },

  taskBar: {
    ...defaultTheme.taskBar,
    borderRadius: 2,
    shadow: 'none',
    shadowHover: '0 1px 4px rgba(0, 0, 0, 0.1)',
  },

  timeline: {
    ...defaultTheme.timeline,
    fontSize: 11,
    fontSizeSmall: 9,
  },
}

// 主题映射
const themes: Record<GanttThemeName, GanttTheme> = {
  default: defaultTheme,
  modern: modernTheme,
  dark: darkTheme,
  professional: professionalTheme,
}

export class GanttThemeManager {
  private currentTheme: GanttTheme = defaultTheme
  private listeners: ((theme: GanttTheme) => void)[] = []

  /**
   * 获取当前主题
   */
  getCurrentTheme(): GanttTheme {
    return { ...this.currentTheme }
  }

  /**
   * 设置主题
   */
  setTheme(themeName: GanttThemeName): void {
    this.currentTheme = themes[themeName] || defaultTheme
    this.notifyListeners()
  }

  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): { name: GanttThemeName; label: string }[] {
    return [
      { name: 'default', label: '默认' },
      { name: 'modern', label: '现代' },
      { name: 'dark', label: '深色' },
      { name: 'professional', label: '专业' },
    ]
  }

  /**
   * 添加主题变化监听
   */
  addListener(listener: (theme: GanttTheme) => void): void {
    this.listeners.push(listener)
  }

  /**
   * 移除主题变化监听
   */
  removeListener(listener: (theme: GanttTheme) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme))
  }

  /**
   * 获取任务状态颜色
   */
  getTaskStatusColor(status: 'default' | 'done' | 'active' | 'crit' | 'milestone'): string {
    switch (status) {
      case 'done':
        return this.currentTheme.colors.taskDone
      case 'active':
        return this.currentTheme.colors.taskActive
      case 'crit':
        return this.currentTheme.colors.taskCrit
      case 'milestone':
        return this.currentTheme.colors.taskMilestone
      default:
        return this.currentTheme.colors.taskDefault
    }
  }

  /**
   * 生成任务条样式
   */
  generateTaskBarStyle(status: 'default' | 'done' | 'active' | 'crit'): React.CSSProperties {
    const color = this.getTaskStatusColor(status)

    return {
      backgroundColor: color,
      borderRadius: `${this.currentTheme.taskBar.borderRadius}px`,
      boxShadow: this.currentTheme.taskBar.shadow,
      height: `${this.currentTheme.taskBar.height}px`,
      transition: 'box-shadow 0.2s ease',
    }
  }

  /**
   * 生成里程碑样式
   */
  generateMilestoneStyle(): React.CSSProperties {
    const { size, pulseColor } = this.currentTheme.milestone

    return {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: this.currentTheme.colors.taskMilestone,
      transform: 'rotate(45deg)',
      boxShadow: `0 0 0 2px ${pulseColor}40`,
    }
  }
}

// 导出单例
export const ganttThemeManager = new GanttThemeManager()
export default ganttThemeManager
