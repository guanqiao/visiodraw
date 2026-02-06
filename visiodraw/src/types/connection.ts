/**
 * 连接点与连接线类型定义
 * @version 1.4.0
 * @date 2026-02-07
 */

/**
 * 连接点位置类型
 */
export type ConnectionPointPosition = 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'custom';

/**
 * 连接点接口
 */
export interface ConnectionPoint {
  /** 唯一标识 */
  id: string;
  /** 相对图形的X坐标（0-1之间） */
  x: number;
  /** 相对图形的Y坐标（0-1之间） */
  y: number;
  /** 位置类型 */
  position: ConnectionPointPosition;
  /** 是否可见 */
  isVisible: boolean;
  /** 是否已连接 */
  isConnected: boolean;
  /** 连接到此点的连接线ID列表 */
  connectedLineIds: string[];
}

/**
 * 连接线样式类型
 */
export type ConnectorStyle = 'straight' | 'orthogonal' | 'curved';

/**
 * 连接线端点样式
 */
export type ConnectorEndStyle = 'none' | 'arrow' | 'dot' | 'diamond';

/**
 * 连接线接口
 */
export interface Connector {
  /** 唯一标识 */
  id: string;
  /** 源图形ID */
  sourceShapeId: string;
  /** 源连接点ID */
  sourcePointId: string;
  /** 目标图形ID */
  targetShapeId: string;
  /** 目标连接点ID */
  targetPointId: string;
  /** 连接线样式 */
  style: ConnectorStyle;
  /** 起点样式 */
  startStyle: ConnectorEndStyle;
  /** 终点样式 */
  endStyle: ConnectorEndStyle;
  /** 线条颜色 */
  stroke: string;
  /** 线条宽度 */
  strokeWidth: number;
  /** 透明度 */
  opacity?: number;
  /** 文本标签 */
  label?: string;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字体大小 */
  labelFontSize?: number;
  /** 路径点（用于正交线和曲线） */
  pathPoints?: { x: number; y: number }[];
  /** 是否被选中 */
  isSelected?: boolean;
}

/**
 * 连接点渲染选项
 */
export interface ConnectionPointRenderOptions {
  /** 连接点半径 */
  radius: number;
  /** 未连接时填充颜色 */
  fill: string;
  /** 已连接时填充颜色 */
  connectedFill: string;
  /** 悬停时填充颜色 */
  hoverFill: string;
  /** 描边颜色 */
  stroke: string;
  /** 描边宽度 */
  strokeWidth: number;
}

/**
 * 默认连接点渲染选项
 */
export const defaultConnectionPointOptions: ConnectionPointRenderOptions = {
  radius: 6,
  fill: '#ffffff',
  connectedFill: '#52c41a',
  hoverFill: '#1890ff',
  stroke: '#1890ff',
  strokeWidth: 2,
};

/**
 * 连接点交互状态
 */
export interface ConnectionPointState {
  /** 是否高亮 */
  isHighlighted: boolean;
  /** 是否可吸附 */
  isSnappable: boolean;
  /** 吸附距离 */
  snapDistance: number;
}

/**
 * 连接线绘制状态
 */
export interface ConnectorDrawingState {
  /** 是否正在绘制 */
  isDrawing: boolean;
  /** 起始图形ID */
  sourceShapeId: string | null;
  /** 起始连接点ID */
  sourcePointId: string | null;
  /** 起始位置 */
  startPosition: { x: number; y: number } | null;
  /** 当前鼠标位置 */
  currentPosition: { x: number; y: number } | null;
  /** 当前线型 */
  style: ConnectorStyle;
}

/**
 * 图形类型与默认连接点数量的映射
 */
export const defaultConnectionPointsConfig: Record<string, ConnectionPointPosition[]> = {
  rectangle: ['top', 'bottom', 'left', 'right'],
  circle: ['top', 'bottom', 'left', 'right'],
  triangle: ['top', 'bottom-left', 'bottom-right'],
  diamond: ['top', 'bottom', 'left', 'right'],
  'start-end': ['left', 'right'],
  process: ['top', 'bottom', 'left', 'right'],
  decision: ['top', 'bottom', 'left', 'right'],
  'input-output': ['top', 'bottom', 'left', 'right'],
  document: ['top', 'bottom', 'left', 'right'],
  database: ['top', 'bottom', 'left', 'right'],
  line: [],
  text: [],
};

/**
 * 连接点吸附配置
 */
export interface SnapConfig {
  /** 是否启用吸附 */
  enabled: boolean;
  /** 吸附距离阈值（像素） */
  threshold: number;
  /** 是否显示吸附提示 */
  showIndicator: boolean;
}

/**
 * 默认吸附配置
 */
export const defaultSnapConfig: SnapConfig = {
  enabled: true,
  threshold: 15,
  showIndicator: true,
};
