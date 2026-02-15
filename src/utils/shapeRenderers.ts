import { Node, Shape } from '@antv/x6'
import {
  calculatePolygonPoints,
  calculateStarPoints,
  calculateCrossPoints,
  createCylinderPath,
  createDocumentPath,
  createParallelogramPoints,
  createTrapezoidPoints,
  createArrowPath,
  createCloudPath,
  createServerPath,
  createWifiPath,
  createGlobePath,
  createFirewallPath,
  createRouterPath,
  createSwitchPath,
  createDesktopPath,
  createLaptopPath,
  createUmlActorPath,
  createUmlClassPath,
  createUmlPackagePath,
  createUmlComponentPath,
  createUmlNodePath,
  createUmlNotePath,
  createBpmnEventPath,
  createBpmnGatewayPath,
  createBpmnActivityPath,
  createBpmnUserTaskPath,
  createBpmnServiceTaskPath,
  createBpmnSubprocessPath,
  createBpmnPoolPath,
  createBpmnLanePath,
  createBpmnDataObjectPath,
  createBpmnDataStorePath,
  createDoubleEllipsePath,
  createErTableEntityPath,
  createErTableWithColumnsPath,
} from './shapeMath'

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
  const points = calculatePolygonPoints(3, config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderDiamond = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = calculatePolygonPoints(4, config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderPentagon = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = calculatePolygonPoints(5, config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderHexagon = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = calculatePolygonPoints(6, config.width, config.height, 0)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderStar = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const outerR = Math.min(config.width, config.height) / 2
  const innerR = outerR * 0.4
  const points = calculateStarPoints(outerR, innerR, 5, cx, cy)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderCross = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = calculateCrossPoints(config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderProcess = renderRectangle

export const renderDecision = renderDiamond

export const renderStartEnd = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        rx: config.height / 2,
        ry: config.height / 2,
      },
    },
  })
}

export const renderInputOutput = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createParallelogramPoints(config.width, config.height, 0.2)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderDocument = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createDocumentPath(config.width, config.height, 0.12, 2)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderDatabase = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createCylinderPath(config.width, config.height, 0.15)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderPreparation = renderHexagon

export const renderManualInput = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createTrapezoidPoints(config.width, config.height, 0.7)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderDisplay = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const skew = config.width * 0.15
  const points = `${skew},0 ${config.width},0 ${config.width - skew},${config.height} 0,${config.height}`
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderOffPage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createArrowPath(config.width, config.height, 0.3)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderServer = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createServerPath(config.width, config.height)
  const dotR = Math.min(config.width, config.height) * 0.03
  const dotX = config.width * 0.15
  const dotY1 = config.height * 0.18
  const dotY2 = config.height * 0.5
  const dotY3 = config.height * 0.82

  const fullPath = `${path}
    M${dotX - dotR},${dotY1} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY1} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY1}
    M${dotX - dotR},${dotY2} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY2} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY2}
    M${dotX - dotR},${dotY3} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY3} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY3}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: fullPath,
      },
    },
  })
}

export const renderCloud = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createCloudPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderRouter = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createRouterPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderSwitch = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createSwitchPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderFirewall = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createFirewallPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderDesktop = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createDesktopPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderLaptop = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createLaptopPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderDatabaseServer = renderDatabase

export const renderWifi = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createWifiPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: 'none',
      },
    },
  })
}

export const renderGlobe = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createGlobePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderUmlClass = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlClassPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderUmlInterface = (config: ShapeRenderConfig): Node => {
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
  const path = createUmlActorPath(config.width, config.height)
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
  const base = createBaseConfig(config)
  const path = createUmlPackagePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderUmlComponent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlComponentPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderUmlNode = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlNodePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderUmlNote = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlNotePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderUmlLifeline = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const height = config.height
  const centerX = config.width / 2

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
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
  return new Shape.Rect({
    ...createBaseConfig(config),
  })
}

export const renderUmlFragment = (config: ShapeRenderConfig): Node => {
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

export const renderErEntity = renderRectangle

export const renderErWeakEntity = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const margin = Math.min(config.width, config.height) * 0.08
  const innerW = config.width - margin * 2
  const innerH = config.height - margin * 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,0 L${config.width},0 L${config.width},${config.height} L0,${config.height} Z M${margin},${margin} L${margin + innerW},${margin} L${margin + innerW},${margin + innerH} L${margin},${margin + innerH} Z`,
      },
    },
  })
}

export const renderErTableEntity = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createErTableEntityPath(config.width, config.height, 0.25, 0.5)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderErTableEntityWithColumns = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const columnCount = Math.max((config.text?.split('\n').length || 3) - 1, 2)
  const path = createErTableWithColumnsPath(config.width, config.height, columnCount)
  
  const lines = (config.text || 'Entity\nid    int [pk]\nname  varchar').split('\n')
  const headerHeight = Math.max(config.height * 0.15, 24)
  const rowHeight = (config.height - headerHeight) / Math.max(columnCount, 1)

  const labelTexts = lines.map((line, index) => {
    const y = index === 0 
      ? headerHeight / 2 + 4 
      : headerHeight + (index - 0.5) * rowHeight + 4
    return {
      text: line,
      x: config.width / 2,
      y: y,
    }
  })

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
      label: {
        ...base.attrs.label,
        text: '',
      },
    },
    shapes: labelTexts.map((item, index) => ({
      type: 'text',
      attrs: {
        x: item.x,
        y: item.y,
        text: item.text,
        fill: '#333333',
        fontSize: index === 0 ? 14 : 11,
        fontWeight: index === 0 ? 'bold' : 'normal',
        textAnchor: 'middle',
        dominantBaseline: 'middle',
      },
    })),
  })
}

export const renderErAttribute = renderEllipse

export const renderErKeyAttribute = (config: ShapeRenderConfig): Node => {
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
  const base = createBaseConfig(config)
  const path = createDoubleEllipsePath(config.width, config.height, 0.12)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: config.fill || '#f6ffed',
      },
    },
  })
}

export const renderErDerivedAttribute = (config: ShapeRenderConfig): Node => {
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
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const outerR = Math.min(config.width, config.height) / 2
  const innerR = outerR * 0.75

  const diamondPath = `M${cx},0 L${config.width},${cy} L${cx},${config.height} L0,${cy} Z M${cx},${outerR - innerR} L${cx + innerR},${cy} L${cx},${cy + innerR} L${cx - innerR},${cy} Z`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: diamondPath,
      },
    },
  })
}

export const renderErAssociation = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const outerR = Math.min(config.width, config.height) / 2
  const innerSize = outerR * 0.5

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx},0 L${config.width},${cy} L${cx},${config.height} L0,${cy} Z M${cx - innerSize},${cy - innerSize} L${cx + innerSize},${cy - innerSize} L${cx + innerSize},${cy + innerSize} L${cx - innerSize},${cy + innerSize} Z`,
      },
    },
  })
}

export const renderErAssociativeEntity = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const diamondR = Math.min(config.width, config.height) * 0.3

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,0 L${config.width},0 L${config.width},${config.height} L0,${config.height} Z M${cx},${cy - diamondR} L${cx + diamondR},${cy} L${cx},${cy + diamondR} L${cx - diamondR},${cy} Z`,
      },
    },
  })
}

export const renderErCompositeAttribute = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createDoubleEllipsePath(config.width, config.height, 0.12)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: config.fill || '#f6ffed',
      },
    },
  })
}

export const renderErWeakKeyAttribute = (config: ShapeRenderConfig): Node => {
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
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx},0 L${config.width},${cy} L${cx},${config.height} L0,${cy} Z M0,${cy} Q-20,${cy} -20,${cy + config.height * 0.3} Q-20,${config.height} ${cx},${config.height} Q${config.width + 20},${config.height} ${config.width + 20},${cy + config.height * 0.3} Q${config.width + 20},${cy} ${config.width},${cy}`,
      },
    },
  })
}

export const renderErCardinality = (config: ShapeRenderConfig): Node => {
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
  const base = createBaseConfig(config)
  const isTotal = config.stroke === '#f5222d'
  const lineWidth = isTotal ? config.width * 0.2 : config.width * 0.1
  const cx = config.width / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx - lineWidth / 2},0 L${cx + lineWidth / 2},0 L${cx + lineWidth / 2},${config.height} L${cx - lineWidth / 2},${config.height} Z`,
        fill: config.stroke || '#52c41a',
      },
    },
  })
}

export const renderErCrowsFoot = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const type = config.text || 'many'
  const w = config.width
  const h = config.height
  const cy = h / 2

  let pathD = ''
  switch (type) {
    case 'one':
      pathD = `M0,${cy} L${w * 0.7},${cy} M${w * 0.7},${cy - h * 0.2} L${w * 0.7},${cy + h * 0.2}`
      break
    case 'many':
      pathD = `M0,${cy} L${w * 0.6},${cy} M${w * 0.6},${cy - h * 0.3} L${w * 0.8},${cy} L${w * 0.6},${cy + h * 0.3}`
      break
    case 'zero':
      pathD = `M0,${cy} L${w * 0.5},${cy} M${w * 0.7},${cy} A${h * 0.2},${h * 0.2} 0 1,1 ${w * 0.7},${cy + 0.1}`
      break
    case 'one-or-many':
      pathD = `M0,${cy} L${w * 0.5},${cy} M${w * 0.5},${cy - h * 0.2} L${w * 0.5},${cy + h * 0.2} M${w * 0.5},${cy - h * 0.3} L${w * 0.7},${cy} L${w * 0.5},${cy + h * 0.3}`
      break
    case 'zero-or-many':
      pathD = `M0,${cy} L${w * 0.4},${cy} M${w * 0.6},${cy} A${h * 0.2},${h * 0.2} 0 1,1 ${w * 0.6},${cy + 0.1} M${w * 0.65},${cy - h * 0.25} L${w * 0.85},${cy} L${w * 0.65},${cy + h * 0.25}`
      break
    default:
      pathD = `M0,${cy} L${w * 0.6},${cy} M${w * 0.6},${cy - h * 0.3} L${w * 0.8},${cy} L${w * 0.6},${cy + h * 0.3}`
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
  const base = createBaseConfig(config)
  const points = calculatePolygonPoints(3, config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
      label: {
        ...base.attrs.label,
        text: config.text || 'ISA',
      },
    },
  })
}

export const renderErConstraint = (config: ShapeRenderConfig): Node => {
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

export const renderBpmnStartEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnEventPath(config.width, config.height, 'start')
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnEndEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnEventPath(config.width, config.height, 'end')
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        strokeWidth: 3,
      },
    },
  })
}

export const renderBpmnIntermediateEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnEventPath(config.width, config.height, 'intermediate')
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnActivityPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnExclusiveGateway = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createBpmnGatewayPath(config.width, config.height)
  const cx = config.width / 2
  const cy = config.height / 2
  const crossSize = Math.min(config.width, config.height) * 0.25
  const path = `M${cx - crossSize},${cy - crossSize} L${cx + crossSize},${cy + crossSize} M${cx + crossSize},${cy - crossSize} L${cx - crossSize},${cy + crossSize}`
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${points} M${path}`,
      },
    },
  })
}

export const renderBpmnParallelGateway = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createBpmnGatewayPath(config.width, config.height)
  const cx = config.width / 2
  const cy = config.height / 2
  const lineLen = Math.min(config.width, config.height) * 0.25
  const path = `M${cx},${cy - lineLen} L${cx},${cy + lineLen} M${cx - lineLen},${cy} L${cx + lineLen},${cy}`
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${points} M${path}`,
      },
    },
  })
}

export const renderBpmnInclusiveGateway = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createBpmnGatewayPath(config.width, config.height)
  const cx = config.width / 2
  const cy = config.height / 2
  const circleR = Math.min(config.width, config.height) * 0.15
  const path = `M${cx},${cy - circleR} A${circleR},${circleR} 0 1,1 ${cx},${cy + circleR} A${circleR},${circleR} 0 1,1 ${cx},${cy - circleR}`
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${points} M${path}`,
      },
    },
  })
}

export const renderBpmnUserTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnUserTaskPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnServiceTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnServiceTaskPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnSubprocess = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnSubprocessPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnPool = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnPoolPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnLane = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnLanePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnDataObject = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnDataObjectPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderBpmnDataStore = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnDataStorePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const shapeRenderers: Record<string, (config: ShapeRenderConfig) => Node> = {
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

  'er-entity': renderErEntity,
  'er-weak-entity': renderErWeakEntity,
  'er-table-entity': renderErTableEntity,
  'er-table-entity-with-columns': renderErTableEntityWithColumns,
  'er-associative-entity': renderErAssociativeEntity,
  'er-attribute': renderErAttribute,
  'er-key-attribute': renderErKeyAttribute,
  'er-composite-attribute': renderErCompositeAttribute,
  'er-multivalued-attribute': renderErMultivaluedAttribute,
  'er-derived-attribute': renderErDerivedAttribute,
  'er-weak-key-attribute': renderErWeakKeyAttribute,
  'er-relationship': renderErRelationship,
  'er-weak-relationship': renderErWeakRelationship,
  'er-recursive-relationship': renderErRecursiveRelationship,
  'er-cardinality-one': renderErCardinality,
  'er-cardinality-many': renderErCardinality,
  'er-cardinality-zero-or-one': renderErCardinality,
  'er-cardinality-one-or-many': renderErCardinality,
  'er-cardinality-zero-or-many': renderErCardinality,
  'er-cardinality-exactly': renderErCardinality,
  'er-total-participation': renderErParticipation,
  'er-partial-participation': renderErParticipation,
  'er-crows-foot-one': renderErCrowsFoot,
  'er-crows-foot-many': renderErCrowsFoot,
  'er-crows-foot-zero': renderErCrowsFoot,
  'er-crows-foot-one-or-many': renderErCrowsFoot,
  'er-crows-foot-zero-or-many': renderErCrowsFoot,
  'er-isa-hierarchy': renderErIsaHierarchy,
  'er-disjoint-constraint': renderErConstraint,
  'er-overlap-constraint': renderErConstraint,
  'er-union-constraint': renderErConstraint,
  'er-association': renderErAssociation,
  'er-one-to-one': renderErCardinality,
  'er-one-to-many': renderErCardinality,
  'er-many-to-many': renderErCardinality,

  'bpmn-start-event': renderBpmnStartEvent,
  'bpmn-end-event': renderBpmnEndEvent,
  'bpmn-intermediate-event': renderBpmnIntermediateEvent,
  'bpmn-task': renderBpmnTask,
  'bpmn-user-task': renderBpmnUserTask,
  'bpmn-service-task': renderBpmnServiceTask,
  'bpmn-subprocess': renderBpmnSubprocess,
  'bpmn-pool': renderBpmnPool,
  'bpmn-lane': renderBpmnLane,
  'bpmn-data-object': renderBpmnDataObject,
  'bpmn-data-store': renderBpmnDataStore,
  'bpmn-exclusive-gateway': renderBpmnExclusiveGateway,
  'bpmn-parallel-gateway': renderBpmnParallelGateway,
  'bpmn-inclusive-gateway': renderBpmnInclusiveGateway,

  'aws-ec2': renderServer,
  'aws-lambda': renderServer,
  'aws-ecs': renderServer,
  'aws-eks': renderServer,
  'aws-s3': renderDatabase,
  'aws-ebs': renderDatabase,
  'aws-rds': renderDatabase,
  'aws-dynamodb': renderDatabase,
  'aws-vpc': renderRectangle,
  'aws-elb': renderRectangle,
  'aws-cloudfront': renderCloud,
  'aws-sqs': renderRectangle,
  'aws-sns': renderRectangle,
  'aws-iam': renderRectangle,
  'aws-cloudwatch': renderRectangle,
  'aws-apigateway': renderCloud,
  'aws-kinesis': renderRectangle,
  'aws-redshift': renderDatabase,
  'aws-elasticache': renderDatabase,
  'aws-eventbridge': renderRectangle,
  'aws-stepfunctions': renderRectangle,
  'aws-codebuild': renderServer,
  'aws-cloudformation': renderRectangle,

  'azure-vm': renderServer,
  'azure-functions': renderServer,
  'azure-appservice': renderServer,
  'azure-aks': renderServer,
  'azure-storage': renderDatabase,
  'azure-sql': renderDatabase,
  'azure-cosmosdb': renderDatabase,
  'azure-vnet': renderRectangle,
  'azure-lb': renderRectangle,
  'azure-cdn': renderCloud,
  'azure-eventhub': renderRectangle,
  'azure-servicebus': renderRectangle,
  'azure-keyvault': renderRectangle,
  'azure-redis': renderDatabase,
  'azure-apim': renderCloud,
  'azure-logicapps': renderRectangle,
  'azure-eventgrid': renderRectangle,
  'azure-devops': renderRectangle,

  'gcp-compute': renderServer,
  'gcp-functions': renderServer,
  'gcp-gke': renderServer,
  'gcp-storage': renderDatabase,
  'gcp-cloudsql': renderDatabase,
  'gcp-firestore': renderDatabase,
  'gcp-vpc': renderRectangle,
  'gcp-lb': renderRectangle,
  'gcp-bigquery': renderDatabase,
  'gcp-pubsub': renderRectangle,
  'gcp-cloudrun': renderServer,
  'gcp-apigee': renderCloud,
  'gcp-dataflow': renderRectangle,
  'gcp-cloudbuild': renderServer,

  'aliyun-ecs': renderServer,
  'aliyun-oss': renderDatabase,
  'aliyun-rds': renderDatabase,
  'aliyun-slb': renderRectangle,
  'aliyun-vpc': renderRectangle,
  'aliyun-ack': renderServer,
  'aliyun-rocketmq': renderRectangle,
  'aliyun-cdn': renderCloud,
  'aliyun-apigateway': renderCloud,

  'tencent-cvm': renderServer,
  'tencent-cos': renderDatabase,
  'tencent-cdb': renderDatabase,
  'tencent-clb': renderRectangle,
  'tencent-tke': renderServer,
  'tencent-cmq': renderRectangle,
  'tencent-apigateway': renderCloud,
  'tencent-cls': renderRectangle,

  'cloud-generic': renderCloud,
  'cloud-server': renderServer,
  'cloud-database': renderDatabase,
  'cloud-loadbalancer': renderRectangle,
  'cloud-firewall': renderRectangle,
  'cloud-cdn': renderCloud,
  'cloud-api-gateway': renderCloud,
  'cloud-mq': renderRectangle,
}

export const renderShape = (type: string, config: ShapeRenderConfig): Node => {
  const renderer = shapeRenderers[type]
  if (renderer) {
    return renderer(config)
  }
  return renderRectangle(config)
}

export default renderShape
