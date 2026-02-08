import { Node, Shape } from '@antv/x6'

export interface ShapeRenderConfig {
  id: string
  x: number
  y: number
  width: number
  height: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  rx?: number
  ry?: number
}

// Port groups configuration
const getPortGroups = () => ({
  top: {
    position: 'top',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#1890ff',
        strokeWidth: 1,
        fill: '#fff',
      },
    },
  },
  bottom: {
    position: 'bottom',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#1890ff',
        strokeWidth: 1,
        fill: '#fff',
      },
    },
  },
  left: {
    position: 'left',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#1890ff',
        strokeWidth: 1,
        fill: '#fff',
      },
    },
  },
  right: {
    position: 'right',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#1890ff',
        strokeWidth: 1,
        fill: '#fff',
      },
    },
  },
})

const getPortItems = () => [
  { id: 'top', group: 'top' },
  { id: 'bottom', group: 'bottom' },
  { id: 'left', group: 'left' },
  { id: 'right', group: 'right' },
]

const createBaseConfig = (config: ShapeRenderConfig) => ({
  id: config.id,
  x: config.x,
  y: config.y,
  width: config.width,
  height: config.height,
  attrs: {
    body: {
      fill: config.fill || '#ffffff',
      stroke: config.stroke || '#333333',
      strokeWidth: config.strokeWidth || 2,
    },
    label: {
      text: config.text || '',
      fontSize: 14,
      fill: '#333333',
    },
  },
  ports: {
    groups: getPortGroups(),
    items: getPortItems(),
  },
  data: { fromStore: true },
})

// ==================== 基础图形 ====================

export const renderRectangle = (config: ShapeRenderConfig): Node => {
  return new Shape.Rect({
    ...createBaseConfig(config),
  })
}

export const renderRoundedRectangle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        rx: config.rx || 10,
        ry: config.ry || 10,
      },
    },
  })
}

export const renderCircle = (config: ShapeRenderConfig): Node => {
  return new Shape.Circle({
    ...createBaseConfig(config),
  })
}

export const renderEllipse = (config: ShapeRenderConfig): Node => {
  return new Shape.Ellipse({
    ...createBaseConfig(config),
  })
}

export const renderTriangle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '0,100 50,0 100,100',
      },
    },
  })
}

export const renderDiamond = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '50,0 100,50 50,100 0,50',
      },
    },
  })
}

export const renderPentagon = (config: ShapeRenderConfig): Node => {
  // 五边形: 5个点，顶部尖角
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '50,0 100,38 82,100 18,100 0,38',
      },
    },
  })
}

export const renderHexagon = (config: ShapeRenderConfig): Node => {
  // 六边形: 6个点，平顶
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '25,0 75,0 100,50 75,100 25,100 0,50',
      },
    },
  })
}

export const renderStar = (config: ShapeRenderConfig): Node => {
  // 五角星: 10个点（5个外点 + 5个内点）
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35',
      },
    },
  })
}

export const renderCross = (config: ShapeRenderConfig): Node => {
  // 十字形
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35',
      },
    },
  })
}

// ==================== 流程图图形 ====================

export const renderProcess = renderRectangle

export const renderDecision = renderDiamond

export const renderStartEnd = renderCircle

export const renderInputOutput = (config: ShapeRenderConfig): Node => {
  // 平行四边形（输入/输出）
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '20,0 100,0 80,100 0,100',
      },
    },
  })
}

export const renderDocument = (config: ShapeRenderConfig): Node => {
  // 文档形状: 矩形带波浪底边
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M0,0 L100,0 L100,80 Q75,90 50,80 Q25,70 0,80 Z',
      },
    },
  })
}

export const renderDatabase = (config: ShapeRenderConfig): Node => {
  // 数据库: 圆柱形
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M0,20 Q50,0 100,20 L100,80 Q50,100 0,80 Z M0,20 Q50,40 100,20',
      },
    },
  })
}

export const renderPreparation = renderHexagon

export const renderManualInput = (config: ShapeRenderConfig): Node => {
  // 手工输入: 梯形（上宽下窄）
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '0,0 100,0 90,100 10,100',
      },
    },
  })
}

export const renderDisplay = (config: ShapeRenderConfig): Node => {
  // 显示: 带斜边的矩形
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '15,0 100,0 100,100 15,100 0,50',
      },
    },
  })
}

export const renderOffPage = (config: ShapeRenderConfig): Node => {
  // 离页连接: 箭头形
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '0,0 70,0 100,50 70,100 0,100',
      },
    },
  })
}

// ==================== 网络/云图形 ====================

export const renderServer = (config: ShapeRenderConfig): Node => {
  // 服务器: 矩形带指示灯
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M10,0 L90,0 L90,100 L10,100 Z M10,25 L90,25 M10,75 L90,75 M20,12.5 A5,5 0 1,1 20,13 M20,50 A5,5 0 1,1 20,51 M20,87.5 A5,5 0 1,1 20,88',
      },
    },
  })
}

export const renderCloud = (config: ShapeRenderConfig): Node => {
  // 云形状
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M25,60 Q10,60 10,45 Q10,30 25,30 Q25,10 45,10 Q60,0 75,10 Q95,10 95,30 Q110,30 110,45 Q110,60 95,60 Z',
      },
    },
  })
}

export const renderRouter = (config: ShapeRenderConfig): Node => {
  // 路由器: 矩形带天线和指示灯
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M10,30 L90,30 L90,90 L10,90 Z M20,30 L20,15 M50,30 L50,10 M80,30 L80,15 M25,60 A5,5 0 1,1 25,61 M50,60 A5,5 0 1,1 50,61 M75,60 A5,5 0 1,1 75,61',
      },
    },
  })
}

export const renderSwitch = (config: ShapeRenderConfig): Node => {
  // 交换机: 矩形带多个指示灯
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M10,20 L90,20 L90,80 L10,80 Z M25,50 A5,5 0 1,1 25,51 M50,50 A5,5 0 1,1 50,51 M75,50 A5,5 0 1,1 75,51',
      },
    },
  })
}

export const renderFirewall = (config: ShapeRenderConfig): Node => {
  // 防火墙: 矩形带斜线
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M0,0 L100,0 L100,100 L0,100 Z M0,0 L100,100 M100,0 L0,100',
      },
    },
  })
}

export const renderDesktop = (config: ShapeRenderConfig): Node => {
  // 台式机: 显示器
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M10,10 L90,10 L90,70 L10,70 Z M30,70 L30,90 M70,70 L70,90 M20,90 L80,90',
      },
    },
  })
}

export const renderLaptop = (config: ShapeRenderConfig): Node => {
  // 笔记本
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M15,20 L85,20 L85,65 L15,65 Z M5,65 L95,65 L100,75 L0,75 Z',
      },
    },
  })
}

export const renderDatabaseServer = renderDatabase

export const renderWifi = (config: ShapeRenderConfig): Node => {
  // WiFi 信号
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M50,85 A10,10 0 1,1 50,86 M20,60 Q50,30 80,60 M5,45 Q50,0 95,45',
      },
    },
  })
}

export const renderGlobe = (config: ShapeRenderConfig): Node => {
  // 地球/互联网
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0 M50,0 L50,100 M0,50 L100,50 M15,15 Q50,35 85,15 M15,85 Q50,65 85,85',
      },
    },
  })
}

// ==================== UML 图形 ====================

export const renderUmlClass = (config: ShapeRenderConfig): Node => {
  // UML 类: 三栏矩形
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M0,0 L100,0 L100,100 L0,100 Z M0,30 L100,30 M0,60 L100,60',
      },
    },
  })
}

export const renderUmlInterface = (config: ShapeRenderConfig): Node => {
  // UML 接口: 带 <<interface>> 标记
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        text: config.text ? `«interface»\n${config.text}` : '«interface»',
      },
    },
  })
}

export const renderUmlActor = (config: ShapeRenderConfig): Node => {
  // UML 参与者: 小人
  // 根据实际尺寸计算路径
  const w = config.width
  const h = config.height
  const cx = w / 2  // 中心X
  const headR = Math.min(w, h) * 0.15  // 头部半径
  const headCy = headR + 5  // 头部中心Y
  const bodyTop = headCy + headR + 2  // 身体顶部
  const bodyBottom = h - 5  // 身体底部
  const armY = bodyTop + (bodyBottom - bodyTop) * 0.3  // 手臂Y位置
  const legSpread = w * 0.35  // 腿展开宽度

  // 构建路径: 头部(圆) + 身体(竖线) + 手臂(横线) + 左腿 + 右腿
  const path = [
    // 头部 - 使用正确的圆弧命令
    `M${cx},${headCy - headR}`,
    `A${headR},${headR} 0 1,1 ${cx},${headCy + headR}`,
    `A${headR},${headR} 0 1,1 ${cx},${headCy - headR}`,
    // 身体
    `M${cx},${bodyTop}`,
    `L${cx},${bodyBottom}`,
    // 手臂
    `M${cx - legSpread},${armY}`,
    `L${cx + legSpread},${armY}`,
    // 左腿
    `M${cx - legSpread * 0.6},${h - 5}`,
    `L${cx},${bodyBottom}`,
    // 右腿
    `L${cx + legSpread * 0.6},${h - 5}`,
  ].join(' ')

  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: 'none',
        stroke: '#333333',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    },
  })
}

export const renderUmlUseCase = renderEllipse

export const renderUmlPackage = (config: ShapeRenderConfig): Node => {
  // UML 包: 带小标签的矩形
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M0,0 L40,0 L40,20 L100,20 L100,100 L0,100 Z',
      },
    },
  })
}

export const renderUmlComponent = (config: ShapeRenderConfig): Node => {
  // UML 组件: 带两个小矩形
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M20,0 L100,0 L100,100 L20,100 Z M0,15 L15,15 L15,30 L0,30 Z M0,70 L15,70 L15,85 L0,85 Z',
      },
    },
  })
}

export const renderUmlNode = (config: ShapeRenderConfig): Node => {
  // UML 节点: 立方体
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M20,0 L100,0 L100,70 L20,70 Z M20,0 L0,20 L0,90 L20,70 M0,20 L80,20 L100,0 M80,20 L80,90 L100,70',
      },
    },
  })
}

export const renderUmlNote = (config: ShapeRenderConfig): Node => {
  // UML 注释: 折角
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M0,0 L70,0 L100,30 L100,100 L0,100 Z M70,0 L70,30 L100,30',
      },
    },
  })
}

export const renderUmlLifeline = (config: ShapeRenderConfig): Node => {
  // UML 生命线: 垂直虚线
  const base = createBaseConfig(config)
  const height = config.height
  const centerX = config.width / 2

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        // 从顶部到底部的垂直虚线
        d: `M${centerX},0 L${centerX},${height}`,
        strokeDasharray: '4,4',
        fill: 'none',
        stroke: '#666666',
        strokeWidth: 1,
      },
    },
  })
}

export const renderUmlActivation = (config: ShapeRenderConfig): Node => {
  // UML 激活条: 窄矩形
  return new Shape.Rect({
    ...createBaseConfig(config),
  })
}

export const renderUmlFragment = (config: ShapeRenderConfig): Node => {
  // UML 片段框: 带标签的矩形
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        rx: 4,
        ry: 4,
      },
    },
  })
}

export const renderUmlRect = (config: ShapeRenderConfig): Node => {
  // UML 标准矩形（用于普通参与者）
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 1,
      },
      label: {
        ...base.attrs.label,
        fontSize: 12,
        fill: '#333333',
      },
    },
  })
}

export const renderUmlAnchor = (config: ShapeRenderConfig): Node => {
  // UML 锚点（用于消息连接，不可见）
  return new Shape.Rect({
    ...createBaseConfig(config),
    attrs: {
      body: {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        width: config.width,
        height: config.height,
      },
    },
  })
}

// ==================== ER 图图形 ====================

export const renderErEntity = renderRectangle

export const renderErWeakEntity = (config: ShapeRenderConfig): Node => {
  // ER 弱实体: 双边框矩形
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M0,0 L100,0 L100,100 L0,100 Z M5,5 L95,5 L95,95 L5,95 Z',
      },
    },
  })
}

export const renderErAttribute = renderEllipse

export const renderErKeyAttribute = (config: ShapeRenderConfig): Node => {
  // ER 主键属性: 椭圆带下划线
  const base = createBaseConfig(config)
  return new Shape.Ellipse({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        textDecoration: 'underline',
      },
    },
  })
}

export const renderErMultivaluedAttribute = (config: ShapeRenderConfig): Node => {
  // ER 多值属性: 双边框椭圆
  const base = createBaseConfig(config)
  return new Shape.Ellipse({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        strokeWidth: 3,
      },
    },
  })
}

export const renderErDerivedAttribute = (config: ShapeRenderConfig): Node => {
  // ER 派生属性: 虚线椭圆
  const base = createBaseConfig(config)
  return new Shape.Ellipse({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        strokeDasharray: '5,3',
      },
    },
  })
}

export const renderErRelationship = renderDiamond

export const renderErWeakRelationship = (config: ShapeRenderConfig): Node => {
  // ER 弱关系: 双边框菱形
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M50,0 L100,50 L50,100 L0,50 Z M50,10 L90,50 L50,90 L10,50 Z',
      },
    },
  })
}

export const renderErAssociation = (config: ShapeRenderConfig): Node => {
  // ER 关联实体: 矩形 + 菱形
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M50,0 L100,50 L50,100 L0,50 Z M25,25 L75,25 L75,75 L25,75 Z',
      },
    },
  })
}

export const renderErAssociativeEntity = (config: ShapeRenderConfig): Node => {
  // ER 关联实体 (Associative Entity): 矩形内包含菱形
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M0,0 L100,0 L100,100 L0,100 Z M50,20 L80,50 L50,80 L20,50 Z',
      },
    },
  })
}

export const renderErCompositeAttribute = (config: ShapeRenderConfig): Node => {
  // ER 复合属性: 双边框椭圆
  const base = createBaseConfig(config)
  return new Shape.Ellipse({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        strokeWidth: 2,
      },
    },
  })
}

export const renderErWeakKeyAttribute = (config: ShapeRenderConfig): Node => {
  // ER 弱实体标识符 (部分键): 虚线椭圆带下划线
  const base = createBaseConfig(config)
  return new Shape.Ellipse({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        strokeDasharray: '5,3',
      },
      label: {
        ...base.attrs.label,
        textDecoration: 'underline',
      },
    },
  })
}

export const renderErRecursiveRelationship = (config: ShapeRenderConfig): Node => {
  // ER 递归关系: 菱形带自连接曲线
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: 'M50,0 L100,50 L50,100 L0,50 Z M0,50 Q-20,50 -20,75 Q-20,100 50,100 Q120,100 120,75 Q120,50 100,50',
      },
    },
  })
}

export const renderErCardinality = (config: ShapeRenderConfig): Node => {
  // ER 基数: 文本标签
  const base = createBaseConfig(config)
  return new Shape.TextBlock({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        text: config.text || '1',
        fontSize: 14,
        fontWeight: 'bold',
        fill: config.stroke || '#333333',
      },
    },
  })
}

export const renderErParticipation = (config: ShapeRenderConfig): Node => {
  // ER 参与度约束: 垂直线条
  const base = createBaseConfig(config)
  const isTotal = config.stroke === '#f5222d'
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: isTotal ? 'M45,0 L55,0 L55,100 L45,100 Z' : 'M48,0 L52,0 L52,100 L48,100 Z',
        fill: config.stroke || '#52c41a',
      },
    },
  })
}

export const renderErCrowsFoot = (config: ShapeRenderConfig): Node => {
  // Crow's Foot 符号
  const base = createBaseConfig(config)
  const type = config.text || 'many'

  let pathD = ''
  switch (type) {
    case 'one':
      pathD = 'M0,50 L70,50 M70,30 L70,70'
      break
    case 'many':
      pathD = 'M0,50 L60,50 M60,20 L80,50 M60,80 L80,50'
      break
    case 'zero':
      pathD = 'M0,50 L50,50 M70,50 A20,20 0 1,1 70,51'
      break
    case 'one-or-many':
      pathD = 'M0,50 L50,50 M50,30 L50,70 M50,20 L80,50 M50,80 L80,50'
      break
    case 'zero-or-many':
      pathD = 'M0,50 L40,50 M60,50 A20,20 0 1,1 60,51 M70,35 L85,50 M70,65 L85,50'
      break
    default:
      pathD = 'M0,50 L60,50 M60,20 L80,50 M60,80 L80,50'
  }

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: pathD,
        fill: 'none',
        strokeWidth: 2,
      },
    },
  })
}

export const renderErIsaHierarchy = (config: ShapeRenderConfig): Node => {
  // ISA层次: 三角形
  const base = createBaseConfig(config)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: '50,0 100,100 0,100',
      },
      label: {
        ...base.attrs.label,
        text: config.text || 'ISA',
      },
    },
  })
}

export const renderErConstraint = (config: ShapeRenderConfig): Node => {
  // ER 约束标记: 圆形带字母
  const base = createBaseConfig(config)
  return new Shape.Circle({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: 'transparent',
        strokeWidth: 2,
      },
      label: {
        ...base.attrs.label,
        text: config.text || 'd',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
  })
}

// ==================== 渲染器映射表 ====================

export const shapeRenderers: Record<string, (config: ShapeRenderConfig) => Node> = {
  // 基础图形
  rectangle: renderRectangle,
  'rounded-rectangle': renderRoundedRectangle,
  circle: renderCircle,
  ellipse: renderEllipse,
  triangle: renderTriangle,
  diamond: renderDiamond,
  pentagon: renderPentagon,
  hexagon: renderHexagon,
  star: renderStar,
  cross: renderCross,

  // 流程图
  process: renderProcess,
  decision: renderDecision,
  'start-end': renderStartEnd,
  'input-output': renderInputOutput,
  document: renderDocument,
  database: renderDatabase,
  preparation: renderPreparation,
  'manual-input': renderManualInput,
  display: renderDisplay,
  'off-page': renderOffPage,

  // 网络/云
  server: renderServer,
  cloud: renderCloud,
  router: renderRouter,
  switch: renderSwitch,
  firewall: renderFirewall,
  desktop: renderDesktop,
  laptop: renderLaptop,
  'database-server': renderDatabaseServer,
  wifi: renderWifi,
  globe: renderGlobe,

  // UML
  'uml-class': renderUmlClass,
  'uml-interface': renderUmlInterface,
  'uml-actor': renderUmlActor,
  'uml-usecase': renderUmlUseCase,
  'uml-package': renderUmlPackage,
  'uml-component': renderUmlComponent,
  'uml-node': renderUmlNode,
  'uml-note': renderUmlNote,
  'uml-lifeline': renderUmlLifeline,
  'uml-activation': renderUmlActivation,
  'uml-fragment': renderUmlFragment,
  'uml-rect': renderUmlRect,
  'uml-anchor': renderUmlAnchor,

  // ER图 - 基于 Chen Notation 和 Crow's Foot Notation
  // 实体类型
  'er-entity': renderErEntity,
  'er-weak-entity': renderErWeakEntity,
  'er-associative-entity': renderErAssociativeEntity,
  // 属性类型
  'er-attribute': renderErAttribute,
  'er-key-attribute': renderErKeyAttribute,
  'er-composite-attribute': renderErCompositeAttribute,
  'er-multivalued-attribute': renderErMultivaluedAttribute,
  'er-derived-attribute': renderErDerivedAttribute,
  'er-weak-key-attribute': renderErWeakKeyAttribute,
  // 关系类型
  'er-relationship': renderErRelationship,
  'er-weak-relationship': renderErWeakRelationship,
  'er-recursive-relationship': renderErRecursiveRelationship,
  // 基数约束
  'er-cardinality-one': renderErCardinality,
  'er-cardinality-many': renderErCardinality,
  'er-cardinality-zero-or-one': renderErCardinality,
  'er-cardinality-one-or-many': renderErCardinality,
  'er-cardinality-zero-or-many': renderErCardinality,
  'er-cardinality-exactly': renderErCardinality,
  // 参与度约束
  'er-total-participation': renderErParticipation,
  'er-partial-participation': renderErParticipation,
  // Crow's Foot 符号
  'er-crows-foot-one': renderErCrowsFoot,
  'er-crows-foot-many': renderErCrowsFoot,
  'er-crows-foot-zero': renderErCrowsFoot,
  'er-crows-foot-one-or-many': renderErCrowsFoot,
  'er-crows-foot-zero-or-many': renderErCrowsFoot,
  // 特殊标记
  'er-isa-hierarchy': renderErIsaHierarchy,
  'er-disjoint-constraint': renderErConstraint,
  'er-overlap-constraint': renderErConstraint,
  'er-union-constraint': renderErConstraint,
  // 向后兼容
  'er-association': renderErAssociation,
  'er-one-to-one': renderErCardinality,
  'er-one-to-many': renderErCardinality,
  'er-many-to-many': renderErCardinality,
}

// 主渲染函数
export const renderShape = (type: string, config: ShapeRenderConfig): Node => {
  const renderer = shapeRenderers[type]
  if (renderer) {
    return renderer(config)
  }
  // 默认返回矩形
  return renderRectangle(config)
}

export default renderShape
