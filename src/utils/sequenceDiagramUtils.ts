/**
 * 序列图共享工具库
 *
 * 为 sequenceTemplates.ts 和 sequenceDiagramGenerator.ts 提供共享的：
 * 1. 样式配置
 * 2. 工具函数
 * 3. 类型定义
 * 4. 布局计算
 *
 * 消除代码重复，确保一致性
 */

import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector, ConnectorEndStyle, LineStyle } from '../types/connection'

// ==================== 类型定义 ====================

export interface SequenceLayoutConfig {
  startX: number
  startY: number
  participantWidth: number
  participantHeight: number
  participantSpacing: number
  lifelineExtension: number
  messageSpacing: number
  activationWidth: number
  noteWidth: number
  noteHeight: number
}

export interface SequenceStyles {
  participant: ParticipantStyle
  actor: ParticipantStyle
  database: ParticipantStyle
  lifeline: LifelineStyle
  activation: ActivationStyle
  fragment: FragmentStyle
  note: NoteStyle
  message: MessageStyle
}

export interface ParticipantStyle {
  fill: string
  fillGradient?: string[]
  stroke: string
  strokeWidth: number
  cornerRadius: number
  fontSize: number
  fontWeight: number
  shadow?: ShadowConfig
}

export interface LifelineStyle {
  stroke: string
  strokeWidth: number
  dashArray: string
}

export interface ActivationStyle {
  fill: string
  fillGradient?: string[]
  stroke: string
  strokeWidth: number
  cornerRadius: number
  shadow?: ShadowConfig
}

export interface FragmentStyle {
  fill: string
  fillOpacity: number
  stroke: string
  strokeWidth: number
  cornerRadius: number
  headerHeight: number
  shadow?: ShadowConfig
}

export interface NoteStyle {
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
  shadow?: ShadowConfig
}

export interface MessageStyle {
  fontSize: number
  color: string
}

export interface ShadowConfig {
  blur: number
  color: string
  offsetX: number
  offsetY: number
}

export type MessageType = 'sync' | 'async' | 'return' | 'self' | 'create' | 'destroy'
export type FragmentType = 'alt' | 'opt' | 'loop' | 'par' | 'break' | 'critical' | 'group'

// ==================== 默认配置 ====================

export const DEFAULT_LAYOUT_CONFIG: SequenceLayoutConfig = {
  startX: 60,
  startY: 25,
  participantWidth: 120,
  participantHeight: 55,
  participantSpacing: 160,
  lifelineExtension: 50,
  messageSpacing: 45,
  activationWidth: 14,
  noteWidth: 110,
  noteHeight: 45,
}

export const DEFAULT_STYLES: SequenceStyles = {
  participant: {
    fill: '#f0f5ff',
    fillGradient: ['#ffffff', '#f0f5ff'],
    stroke: '#2f54eb',
    strokeWidth: 2,
    cornerRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    shadow: { blur: 4, color: 'rgba(0,0,0,0.1)', offsetX: 2, offsetY: 2 },
  },
  actor: {
    fill: '#fff7e6',
    fillGradient: ['#ffffff', '#fff7e6'],
    stroke: '#fa8c16',
    strokeWidth: 2.5,
    cornerRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    shadow: { blur: 4, color: 'rgba(0,0,0,0.1)', offsetX: 2, offsetY: 2 },
  },
  database: {
    fill: '#f6ffed',
    fillGradient: ['#ffffff', '#f6ffed'],
    stroke: '#52c41a',
    strokeWidth: 2,
    cornerRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    shadow: { blur: 4, color: 'rgba(0,0,0,0.1)', offsetX: 2, offsetY: 2 },
  },
  lifeline: {
    stroke: '#bfbfbf',
    strokeWidth: 1.5,
    dashArray: '5,5',
  },
  activation: {
    fill: '#1890ff',
    fillGradient: ['#40a9ff', '#1890ff'],
    stroke: '#096dd9',
    strokeWidth: 1.5,
    cornerRadius: 4,
    shadow: { blur: 3, color: 'rgba(24,144,255,0.3)', offsetX: 1, offsetY: 1 },
  },
  fragment: {
    fill: '#fafafa',
    fillOpacity: 0.4,
    stroke: '#595959',
    strokeWidth: 1.5,
    cornerRadius: 6,
    headerHeight: 28,
    shadow: { blur: 2, color: 'rgba(0,0,0,0.05)', offsetX: 1, offsetY: 1 },
  },
  note: {
    fill: '#fffbe6',
    stroke: '#ffd666',
    strokeWidth: 1.5,
    cornerRadius: 4,
    shadow: { blur: 3, color: 'rgba(0,0,0,0.08)', offsetX: 1, offsetY: 1 },
  },
  message: {
    fontSize: 12,
    color: '#262626',
  },
}

// 片段类型特定样式
export const FRAGMENT_TYPE_STYLES: Record<FragmentType, { stroke: string; fill: string }> = {
  alt: { stroke: '#722ed1', fill: '#f9f0ff' },
  opt: { stroke: '#13c2c2', fill: '#e6fffb' },
  loop: { stroke: '#1890ff', fill: '#e6f7ff' },
  par: { stroke: '#52c41a', fill: '#f6ffed' },
  break: { stroke: '#f5222d', fill: '#fff1f0' },
  critical: { stroke: '#fa541c', fill: '#fff2e8' },
  group: { stroke: '#8c8c8c', fill: '#fafafa' },
}

// ==================== 工具函数 ====================

/**
 * 获取消息颜色
 */
export function getMessageColor(type: MessageType): string {
  switch (type) {
    case 'destroy':
      return '#f5222d'
    default:
      return '#333333'
  }
}

/**
 * 获取消息箭头样式
 */
export function getMessageArrow(type: MessageType): ConnectorEndStyle {
  switch (type) {
    case 'return':
      return 'open-arrow'
    case 'async':
      return 'open-arrow'
    case 'destroy':
      return 'none'
    default:
      return 'arrow'
  }
}

/**
 * 获取消息线型
 */
export function getMessageLineStyle(type: MessageType): LineStyle {
  switch (type) {
    case 'return':
    case 'create':
      return 'dashed'
    default:
      return 'solid'
  }
}

/**
 * 根据消息类型计算标签位置
 * - 返回消息偏左，便于阅读
 * - 自调用消息偏上，避免与弧线重叠
 * - 普通消息居中
 */
export function calculateLabelPosition(type: MessageType): number {
  switch (type) {
    case 'return':
      return 0.35
    case 'self':
      return 0.25
    case 'create':
    case 'destroy':
      return 0.4
    default:
      return 0.5
  }
}

/**
 * 计算标签垂直偏移，避免相邻消息标签重叠
 */
export function calculateLabelOffsetY(messageOrder: number): number {
  const baseOffset = -8
  const staggerOffset = (messageOrder % 2 === 1) ? -12 : 5
  return baseOffset + staggerOffset
}

/**
 * 生成带编号的消息标签
 */
export function generateMessageLabel(
  text: string,
  order: number,
  autoNumber: boolean
): string {
  if (autoNumber) {
    return `${order}: ${text}`
  }
  return text
}

// ==================== 布局计算 ====================

export interface ParticipantLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
  centerX: number
  bottomY: number
}

/**
 * 计算参与者布局
 */
export function calculateParticipantLayouts(
  participantIds: string[],
  config: SequenceLayoutConfig
): Map<string, ParticipantLayout> {
  const layouts = new Map<string, ParticipantLayout>()

  participantIds.forEach((id, index) => {
    const x = config.startX + index * config.participantSpacing
    const layout: ParticipantLayout = {
      id,
      x,
      y: config.startY,
      width: config.participantWidth,
      height: config.participantHeight,
      centerX: x + config.participantWidth / 2,
      bottomY: config.startY + config.participantHeight,
    }
    layouts.set(id, layout)
  })

  return layouts
}

/**
 * 计算消息Y位置
 */
export function calculateMessageY(
  messageOrder: number,
  config: SequenceLayoutConfig,
  startOffset: number = 0
): number {
  return startOffset + messageOrder * config.messageSpacing
}

/**
 * 计算总高度
 */
export function calculateTotalHeight(
  messageCount: number,
  config: SequenceLayoutConfig,
  startOffset: number = 0
): number {
  return startOffset + messageCount * config.messageSpacing + config.lifelineExtension
}

// ==================== 创建节点辅助函数 ====================

/**
 * 创建参与者节点
 */
export function createParticipantNode(
  id: string,
  name: string,
  layout: ParticipantLayout,
  type: 'participant' | 'actor' | 'database' = 'participant',
  styles: SequenceStyles = DEFAULT_STYLES
): ShapeData {
  const style = styles[type]

  return {
    id: `participant-${id}`,
    type: type === 'participant' ? 'uml-participant' : `uml-${type}-sequence`,
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    text: name,
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    rx: style.cornerRadius,
    ry: style.cornerRadius,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    zIndex: 10,
  }
}

/**
 * 创建生命线节点
 */
export function createLifelineNode(
  participantId: string,
  layout: ParticipantLayout,
  totalHeight: number,
  styles: SequenceStyles = DEFAULT_STYLES
): ShapeData {
  return {
    id: `lifeline-${participantId}`,
    type: 'uml-lifeline',
    x: layout.centerX,
    y: layout.bottomY,
    width: 1,
    height: totalHeight - layout.bottomY,
    text: '',
    fill: 'transparent',
    stroke: styles.lifeline.stroke,
    strokeWidth: styles.lifeline.strokeWidth,
    dashArray: styles.lifeline.dashArray,
    zIndex: 1,
  }
}

/**
 * 创建生命线顶部标记
 */
export function createLifelineTopMarker(
  participantId: string,
  layout: ParticipantLayout,
  styles: SequenceStyles = DEFAULT_STYLES
): ShapeData {
  return {
    id: `lifeline-top-${participantId}`,
    type: 'uml-lifeline-marker',
    x: layout.centerX - 3,
    y: layout.bottomY - 3,
    width: 6,
    height: 6,
    text: '',
    fill: styles.lifeline.stroke,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 3,
    zIndex: 2,
  }
}

/**
 * 创建生命线底部标记
 */
export function createLifelineBottomMarker(
  participantId: string,
  layout: ParticipantLayout,
  totalHeight: number,
  styles: SequenceStyles = DEFAULT_STYLES
): ShapeData {
  return {
    id: `lifeline-bottom-${participantId}`,
    type: 'uml-lifeline-end',
    x: layout.centerX - 6,
    y: totalHeight - 6,
    width: 12,
    height: 12,
    text: '',
    fill: 'transparent',
    stroke: styles.lifeline.stroke,
    strokeWidth: 1.5,
    zIndex: 2,
  }
}

/**
 * 创建激活条节点
 */
export function createActivationNode(
  id: string,
  layout: ParticipantLayout,
  startY: number,
  endY: number,
  styles: SequenceStyles = DEFAULT_STYLES
): ShapeData {
  const height = Math.max(endY - startY + 12, 28)

  return {
    id: `activation-${id}`,
    type: 'uml-activation',
    x: layout.centerX - styles.activation.cornerRadius / 2,
    y: startY - 6,
    width: styles.activation.cornerRadius,
    height,
    text: '',
    fill: styles.activation.fill,
    stroke: styles.activation.stroke,
    strokeWidth: styles.activation.strokeWidth,
    cornerRadius: styles.activation.cornerRadius,
    zIndex: 5,
  }
}

/**
 * 创建消息连接点标记
 */
export function createMessageMarkers(
  messageId: string,
  fromCenterX: number,
  toCenterX: number,
  y: number,
  type: MessageType,
  color: string = '#333333'
): ShapeData[] {
  const markerSize = 4
  const halfSize = markerSize / 2
  const markers: ShapeData[] = []

  // 源点标记
  markers.push({
    id: `msg-marker-src-${messageId}`,
    type: 'uml-message-marker',
    x: fromCenterX - halfSize,
    y: y - halfSize,
    width: markerSize,
    height: markerSize,
    text: '',
    fill: type === 'destroy' ? '#f5222d' : color,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 2,
    zIndex: 3,
  })

  // 目标点标记（销毁消息不添加）
  if (type !== 'destroy') {
    markers.push({
      id: `msg-marker-tgt-${messageId}`,
      type: 'uml-message-marker',
      x: toCenterX - halfSize,
      y: y - halfSize,
      width: markerSize,
      height: markerSize,
      text: '',
      fill: color,
      stroke: 'transparent',
      strokeWidth: 0,
      cornerRadius: 2,
      zIndex: 3,
    })
  }

  return markers
}

/**
 * 创建销毁标记
 */
export function createDestroyMarker(
  messageId: string,
  centerX: number,
  y: number
): ShapeData {
  const markerSize = 20
  const halfSize = markerSize / 2

  return {
    id: `destroy-marker-${messageId}`,
    type: 'uml-destroy-marker',
    x: centerX - halfSize,
    y: y - halfSize,
    width: markerSize,
    height: markerSize,
    text: '',
    fill: 'none',
    stroke: '#f5222d',
    strokeWidth: 2.5,
    zIndex: 10,
  }
}

/**
 * 创建创建标记
 */
export function createCreateMarker(
  messageId: string,
  centerX: number,
  y: number
): ShapeData[] {
  const markerSize = 10
  const halfSize = markerSize / 2

  return [
    {
      id: `create-marker-${messageId}`,
      type: 'uml-create-marker',
      x: centerX - halfSize,
      y: y - halfSize,
      width: markerSize,
      height: markerSize,
      text: '',
      fill: '#52c41a',
      stroke: '#237804',
      strokeWidth: 1.5,
      cornerRadius: 2,
      zIndex: 10,
    },
    {
      id: `create-label-${messageId}`,
      type: 'uml-create-label',
      x: centerX + 15,
      y: y - 12,
      width: 60,
      height: 16,
      text: '«create»',
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      fontSize: 10,
      color: '#52c41a',
      fontWeight: 600,
      zIndex: 11,
    },
  ]
}

// ==================== 创建边辅助函数 ====================

/**
 * 创建消息边
 */
export function createMessageEdge(
  id: string,
  sourceId: string,
  targetId: string,
  label: string,
  type: MessageType,
  order: number,
  autoNumber: boolean = false
): Connector {
  const messageLabel = generateMessageLabel(label, order, autoNumber)
  const labelPosition = calculateLabelPosition(type)
  const labelOffsetY = calculateLabelOffsetY(order)

  return {
    id: `msg-${id}`,
    sourceShapeId: sourceId,
    sourcePointId: 'default',
    targetShapeId: targetId,
    targetPointId: 'default',
    stroke: getMessageColor(type),
    strokeWidth: 1.5,
    lineStyle: getMessageLineStyle(type),
    startStyle: 'none',
    endStyle: getMessageArrow(type),
    style: 'straight',
    labels: messageLabel
      ? [
          {
            id: `label-${id}`,
            text: messageLabel,
            position: labelPosition,
            offsetY: labelOffsetY,
            fontSize: 12,
            color: '#333333',
          },
        ]
      : undefined,
  }
}

// ==================== 导出默认配置 ====================

export default {
  DEFAULT_LAYOUT_CONFIG,
  DEFAULT_STYLES,
  FRAGMENT_TYPE_STYLES,
  getMessageColor,
  getMessageArrow,
  getMessageLineStyle,
  calculateLabelPosition,
  calculateLabelOffsetY,
  generateMessageLabel,
  calculateParticipantLayouts,
  calculateMessageY,
  calculateTotalHeight,
  createParticipantNode,
  createLifelineNode,
  createLifelineTopMarker,
  createLifelineBottomMarker,
  createActivationNode,
  createMessageMarkers,
  createDestroyMarker,
  createCreateMarker,
  createMessageEdge,
}
