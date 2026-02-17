/**
 * 日志工具 - 统一管理日志输出
 * 在生产环境中自动禁用调试日志
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  level: LogLevel
  enabled: boolean
  prefix?: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// 默认配置
const defaultConfig: LoggerConfig = {
  level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
  enabled: import.meta.env.VITE_ENABLE_LOGS !== 'false',
}

/**
 * 创建日志记录器
 */
export function createLogger(prefix?: string): {
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
} {
  const config: LoggerConfig = {
    ...defaultConfig,
    prefix,
  }

  const shouldLog = (level: LogLevel): boolean => {
    if (!config.enabled) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[config.level]
  }

  const formatMessage = (level: LogLevel, args: any[]): any[] => {
    const timestamp = new Date().toISOString()
    const prefixStr = config.prefix ? `[${config.prefix}]` : ''
    return [`[${timestamp}][${level.toUpperCase()}]${prefixStr}`, ...args]
  }

  return {
    debug: (...args: any[]) => {
      if (shouldLog('debug')) {
        console.debug(...formatMessage('debug', args))
      }
    },
    info: (...args: any[]) => {
      if (shouldLog('info')) {
        console.info(...formatMessage('info', args))
      }
    },
    warn: (...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn(...formatMessage('warn', args))
      }
    },
    error: (...args: any[]) => {
      if (shouldLog('error')) {
        console.error(...formatMessage('error', args))
      }
    },
  }
}

/**
 * 默认日志记录器
 */
export const logger = createLogger()

/**
 * 图形渲染日志记录器
 */
export const renderLogger = createLogger('render')

/**
 * 性能日志记录器
 */
export const perfLogger = createLogger('perf')

/**
 * 调试专用日志 - 只在开发环境输出
 */
export function devLog(...args: any[]): void {
  if (import.meta.env.DEV) {
    console.log('[DEV]', ...args)
  }
}

/**
 * 调试专用警告 - 只在开发环境输出
 */
export function devWarn(...args: any[]): void {
  if (import.meta.env.DEV) {
    console.warn('[DEV]', ...args)
  }
}

/**
 * 调试专用错误 - 只在开发环境输出
 */
export function devError(...args: any[]): void {
  if (import.meta.env.DEV) {
    console.error('[DEV]', ...args)
  }
}

export default logger
