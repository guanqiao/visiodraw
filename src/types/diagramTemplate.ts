/**
 * 图表模板类型定义
 * 用于对标 Mermaid 的图表类型，支持活动图、序列图、状态图、ER图、类图、甘特图等
 */

/** 支持的图表类型 */
export type DiagramType = 'activity' | 'sequence' | 'state' | 'er' | 'class' | 'gantt' | 'mindmap' | 'timeline' | 'gitgraph' | 'pie' | 'journey' | 'requirement' | 'c4' | 'xychart' | 'block'

/** 图表布局方向 */
export type LayoutDirection = 'vertical' | 'horizontal' | 'auto'

/** 连接线样式 */
export type EdgeStyle = 'straight' | 'orthogonal' | 'curved' | 'bezier'

/** 线条样式 */
export type LineStyle = 'solid' | 'dashed' | 'dotted'

/**
 * 模板节点定义
 * 对应 X6 图中的节点配置
 */
export interface TemplateNode {
  /** 节点唯一标识 */
  id: string
  /** 节点类型，对应 shapeLibrary 中的类型 */
  type: string
  /** X 坐标 */
  x: number
  /** Y 坐标 */
  y: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 节点文本（可选） */
  text?: string
  /** 填充颜色（可选） */
  fill?: string
  /** 边框颜色（可选） */
  stroke?: string
  /** 边框宽度（可选） */
  strokeWidth?: number
  /** 其他自定义属性 */
  [key: string]: any
}

/**
 * 模板边定义
 * 对应 X6 图中的边配置
 */
export interface TemplateEdge {
  /** 边唯一标识 */
  id: string
  /** 源节点 ID */
  source: string
  /** 目标节点 ID */
  target: string
  /** 边标签（可选） */
  label?: string
  /** 连接线样式（可选） */
  style?: EdgeStyle
  /** 线条样式（可选） */
  lineStyle?: LineStyle
  /** 起点标记样式（可选） */
  startMarker?: string
  /** 终点标记样式（可选） */
  endMarker?: string
  /** 其他自定义属性 */
  [key: string]: any
}

/**
 * 图表布局配置
 */
export interface DiagramLayout {
  /** 布局方向 */
  direction: LayoutDirection
  /** 节点间距 */
  spacing?: number
  /** 内边距 */
  padding?: number
  /** 是否自动布局 */
  autoLayout?: boolean
}

/**
 * 图表模板定义
 */
export interface DiagramTemplate {
  /** 模板唯一标识 */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述（可选） */
  description?: string
  /** 图表类型 */
  type: DiagramType
  /** 模板节点列表 */
  nodes: TemplateNode[]
  /** 模板边列表（可选） */
  edges?: TemplateEdge[]
  /** 布局配置（可选） */
  layout?: DiagramLayout
  /** 对应的 Mermaid 代码（可选） */
  mermaidCode?: string
  /** 创建时间 */
  createdAt?: number
  /** 更新时间 */
  updatedAt?: number
}

/**
 * Mermaid 解析结果
 */
export interface MermaidParseResult {
  /** 解析是否成功 */
  success: boolean
  /** 图表类型 */
  diagramType?: DiagramType
  /** 解析后的节点列表 */
  nodes?: TemplateNode[]
  /** 解析后的边列表 */
  edges?: TemplateEdge[]
  /** 错误信息（解析失败时） */
  error?: string
}

/**
 * 图表模板分类
 */
export interface DiagramTemplateCategory {
  /** 分类标识 */
  id: DiagramType
  /** 分类名称 */
  name: string
  /** 分类图标 */
  icon: string
  /** 分类描述 */
  description?: string
  /** 该分类下的模板列表 */
  templates: DiagramTemplate[]
}

/**
 * Mermaid 语法配置
 */
export interface MermaidConfig {
  /** 主题 */
  theme?: 'default' | 'dark' | 'forest' | 'neutral'
  /** 方向 */
  direction?: 'TB' | 'TD' | 'BT' | 'RL' | 'LR'
  /** 其他配置 */
  [key: string]: any
}

/**
 * 模板生成选项
 */
export interface TemplateGenerateOptions {
  /** 起始 X 坐标 */
  startX?: number
  /** 起始 Y 坐标 */
  startY?: number
  /** 节点间距 */
  spacing?: number
  /** 布局方向 */
  direction?: LayoutDirection
  /** 是否自动编号消息 */
  autoNumber?: boolean
}
