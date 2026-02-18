/**
 * 共享工具函数模块
 * 提取通用的工具函数，消除代码重复
 */

// Canvas 渲染相关
export {
  calculateBoundingBox,
  calculateTransform,
  drawGrid,
  drawRoundedRect,
  drawDiamond,
  drawEllipse,
  drawParallelogram,
  drawCloud,
  drawShapeByType,
  drawShape,
  drawConnector,
  CanvasRenderer,
  type RenderOptions,
  type BoundingBox,
  type Transform,
  type Positionable,
  type ShapeRenderOptions,
  type ConnectorRenderOptions,
} from './canvasRenderer'

// XML 工具
export {
  escapeXml,
  unescapeXml,
  extractXmlAttribute,
  extractXmlContent,
  createXmlElement,
} from './xmlUtils'

// 颜色工具
export {
  visioColorToHex,
  rgbToHex,
  hexToRgb,
  adjustBrightness,
  getContrastTextColor,
  blendColors,
} from './colorUtils'
