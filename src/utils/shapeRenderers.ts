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
  createBpmnBoundaryEventPath,
  createBpmnTerminateEventPath,
  createBpmnCompensationEventPath,
  createBpmnScriptTaskPath,
  createBpmnSendTaskPath,
  createBpmnReceiveTaskPath,
  createBpmnManualTaskPath,
  createBpmnBusinessRuleTaskPath,
  createDoubleEllipsePath,
  createErTableEntityPath,
  createErTableWithColumnsPath,
  createUmlEnumPath,
  createUmlCompositeStatePath,
  createUmlProvidedInterfacePath,
  createUmlRequiredInterfacePath,
  createUmlSignalSendPath,
  createUmlSignalReceivePath,
  createUmlObjectInstancePath,
  createUmlTimingRulerPath,
  createUmlTimingStateLinePath,
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

function parseErColumnLine(line: string): { 
  name: string
  type: string
  constraints: string[]
  displayText: string
  isPk: boolean
  isFk: boolean
} {
  const constraintMatch = line.match(/^(.+?)\s*\[(.+)\]\s*$/)
  let name = ''
  let type = 'varchar'
  let constraints: string[] = []
  
  if (constraintMatch) {
    const parts = constraintMatch[1].trim().split(/\s+/)
    name = parts[0]
    type = parts.slice(1).join(' ') || 'varchar'
    constraints = constraintMatch[2].split(',').map(c => c.trim().toLowerCase())
  } else {
    const parts = line.trim().split(/\s+/)
    name = parts[0]
    type = parts.slice(1).join(' ') || 'varchar'
  }
  
  const isPk = constraints.includes('pk')
  const isFk = constraints.includes('fk')
  
  const constraintIcons: string[] = []
  if (constraints.includes('pk')) constraintIcons.push('🔑')
  if (constraints.includes('fk')) constraintIcons.push('🔗')
  if (constraints.includes('unique')) constraintIcons.push('UQ')
  if (constraints.includes('notnull')) constraintIcons.push('NN')
  if (constraints.includes('auto')) constraintIcons.push('AI')
  if (constraints.includes('index')) constraintIcons.push('IDX')
  
  const displayText = `${name} ${type}${constraintIcons.length > 0 ? ' ' + constraintIcons.join(' ') : ''}`
  
  return { name, type, constraints, displayText, isPk, isFk }
}

export const renderErTableEntityWithColumns = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const lines = (config.text || 'Entity\nid    int [pk]\nname  varchar').split('\n')
  const columnCount = Math.max(lines.length - 1, 2)
  const path = createErTableWithColumnsPath(config.width, config.height, columnCount)
  
  const headerHeight = Math.max(config.height * 0.18, 28)
  const rowHeight = (config.height - headerHeight) / Math.max(columnCount, 1)
  const tableName = lines[0] || 'Entity'
  
  const columnInfos = lines.slice(1).map(line => parseErColumnLine(line))
  
  const shapes: any[] = []
  
  shapes.push({
    type: 'rect',
    attrs: {
      x: 0,
      y: 0,
      width: config.width,
      height: headerHeight,
      fill: '#1890ff',
      stroke: 'none',
    },
  })
  
  shapes.push({
    type: 'text',
    attrs: {
      x: config.width / 2,
      y: headerHeight / 2 + 1,
      text: tableName,
      fill: '#ffffff',
      fontSize: 13,
      fontWeight: 'bold',
      textAnchor: 'middle',
      dominantBaseline: 'middle',
    },
  })
  
  columnInfos.forEach((col, index) => {
    const y = headerHeight + index * rowHeight
    
    if (index % 2 === 0) {
      shapes.push({
        type: 'rect',
        attrs: {
          x: 0,
          y: y,
          width: config.width,
          height: rowHeight,
          fill: '#fafafa',
          stroke: 'none',
        },
      })
    }
    
    const textColor = col.isPk ? '#1890ff' : col.isFk ? '#722ed1' : '#333333'
    const fontWeight = col.isPk ? 'bold' : 'normal'
    
    shapes.push({
      type: 'text',
      attrs: {
        x: 8,
        y: y + rowHeight / 2,
        text: col.name,
        fill: textColor,
        fontSize: 11,
        fontWeight: fontWeight,
        textAnchor: 'start',
        dominantBaseline: 'middle',
        textDecoration: col.isPk ? 'underline' : 'none',
      },
    })
    
    shapes.push({
      type: 'text',
      attrs: {
        x: config.width - 8,
        y: y + rowHeight / 2,
        text: col.type.toUpperCase(),
        fill: '#666666',
        fontSize: 10,
        fontWeight: 'normal',
        textAnchor: 'end',
        dominantBaseline: 'middle',
      },
    })
    
    const constraintIcons: string[] = []
    if (col.constraints.includes('pk')) constraintIcons.push('🔑')
    if (col.constraints.includes('fk')) constraintIcons.push('🔗')
    if (col.constraints.includes('auto')) constraintIcons.push('⚡')
    if (col.constraints.includes('unique')) constraintIcons.push('🔷')
    if (col.constraints.includes('notnull')) constraintIcons.push('✦')
    
    if (constraintIcons.length > 0) {
      shapes.push({
        type: 'text',
        attrs: {
          x: config.width / 2,
          y: y + rowHeight / 2,
          text: constraintIcons.join(''),
          fill: '#333333',
          fontSize: 9,
          textAnchor: 'middle',
          dominantBaseline: 'middle',
        },
      })
    }
  })

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#ffffff',
      },
      label: {
        ...base.attrs.label,
        text: '',
      },
    },
    shapes,
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

export const renderBpmnBoundaryEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnBoundaryEventPath(config.width, config.height)
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

export const renderBpmnTerminateEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnTerminateEventPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: config.fill || '#fff2f0',
        stroke: config.stroke || '#f5222d',
        strokeWidth: 3,
      },
    },
  })
}

export const renderBpmnCompensationEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnCompensationEventPath(config.width, config.height)
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

export const renderBpmnScriptTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnScriptTaskPath(config.width, config.height)
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

export const renderBpmnSendTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnSendTaskPath(config.width, config.height)
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

export const renderBpmnReceiveTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnReceiveTaskPath(config.width, config.height)
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

export const renderBpmnManualTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnManualTaskPath(config.width, config.height)
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

export const renderBpmnBusinessRuleTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnBusinessRuleTaskPath(config.width, config.height)
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

export const renderUmlEnum = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlEnumPath(config.width, config.height)
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

export const renderUmlGenericClass = (config: ShapeRenderConfig): Node => {
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

export const renderUmlCompositeState = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlCompositeStatePath(config.width, config.height)
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

export const renderUmlStateHistory = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Circle({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        text: 'H',
        fontSize: 12,
        fontWeight: 'bold',
      },
    },
  })
}

export const renderUmlStateDeepHistory = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Circle({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        text: 'H*',
        fontSize: 10,
        fontWeight: 'bold',
      },
    },
  })
}

export const renderUmlStateEntryPoint = renderCircle

export const renderUmlStateExitPoint = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const r = Math.min(config.width, config.height) / 2
  return new Shape.Circle({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: '#fff',
        strokeWidth: 2,
      },
    },
  })
}

export const renderUmlStateTerminate = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const size = Math.min(config.width, config.height) * 0.4
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx - size},${cy - size} L${cx + size},${cy + size} M${cx + size},${cy - size} L${cx - size},${cy + size}`,
        fill: 'none',
        strokeWidth: 3,
      },
    },
  })
}

export const renderUmlProvidedInterface = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlProvidedInterfacePath(config.width, config.height)
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

export const renderUmlRequiredInterface = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlRequiredInterfacePath(config.width, config.height)
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

export const renderUmlConnector = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const r = Math.min(config.width, config.height) * 0.1
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlExecutionEnvironment = (config: ShapeRenderConfig): Node => {
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

export const renderUmlCommunicationPath = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${config.height / 2} L${config.width},${config.height / 2}`,
        fill: 'none',
        strokeDasharray: '5,3',
      },
    },
  })
}

export const renderUmlSignalSend = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlSignalSendPath(config.width, config.height)
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

export const renderUmlSignalReceive = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlSignalReceivePath(config.width, config.height)
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

export const renderUmlFlowFinal = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const r = Math.min(config.width, config.height) / 2
  const cx = config.width / 2
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx - r},${cy - r} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy - r} M${cx - r * 0.7},${cy - r * 0.7} L${cx + r * 0.7},${cy + r * 0.7}`,
        fill: '#fff',
        strokeWidth: 2,
      },
    },
  })
}

export const renderUmlTimingRuler = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlTimingRulerPath(config.width, config.height)
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

export const renderUmlTimingStateLine = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlTimingStateLinePath(config.width, config.height)
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

export const renderUmlTimingEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx},0 L${cx},${config.height}`,
        fill: 'none',
        strokeDasharray: '3,2',
      },
    },
  })
}

export const renderUmlTimingDuration = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  const tickH = config.height * 0.25
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy} M0,${cy - tickH} L0,${cy + tickH} M${config.width},${cy - tickH} L${config.width},${cy + tickH}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlTimingConstraint = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: 'transparent',
        strokeDasharray: '3,2',
      },
    },
  })
}

export const renderUmlObjectInstance = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlObjectInstancePath(config.width, config.height)
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

export const renderUmlLink = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${config.height / 2} L${config.width},${config.height / 2}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlLinkEnd = renderRectangle

export const renderUmlCommObject = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        text: config.text || ':Object',
      },
    },
  })
}

export const renderUmlCommLink = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${config.height / 2} L${config.width},${config.height / 2}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlCommMessage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width - 10},${cy}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlCommReverseMessage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${config.width},${cy} L10,${cy}`,
        fill: 'none',
        strokeDasharray: '3,2',
      },
    },
  })
}

export const renderUmlAbstractClass = (config: ShapeRenderConfig): Node => {
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
      label: {
        ...base.attrs.label,
        fontStyle: 'italic',
      },
    },
  })
}

export const renderUmlAnnotation = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlNotePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#fffbe6',
        stroke: '#faad14',
      },
    },
  })
}

export const renderUmlSystemBoundary = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: 'transparent',
        strokeDasharray: '5,3',
      },
    },
  })
}

export const renderUmlObject = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        text: config.text ? `:${config.text}` : ':Object',
      },
    },
  })
}

export const renderUmlActorLifeline = (config: ShapeRenderConfig): Node => {
  const path = createUmlActorPath(config.width, config.height * 0.3)
  const base = createBaseConfig(config)
  const centerY = config.height * 0.3
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `${path} M${config.width / 2},${centerY} L${config.width / 2},${config.height}`,
        fill: 'none',
        strokeDasharray: '4,4',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    },
  })
}

export const renderUmlSelfMessage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx * 0.3},${config.height * 0.2} L${cx * 1.2},${config.height * 0.2} L${cx * 1.2},${config.height * 0.7} L${cx * 0.3},${config.height * 0.7}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlSyncMessage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlAsyncMessage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlReturnMessage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${config.width},${cy} L0,${cy}`,
        fill: 'none',
        strokeDasharray: '4,4',
      },
    },
  })
}

export const renderUmlActivity = (config: ShapeRenderConfig): Node => {
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

export const renderUmlAction = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        rx: 5,
        ry: 5,
      },
    },
  })
}

export const renderUmlDecision = renderDiamond

export const renderUmlFork = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: '#722ed1',
        width: config.width,
        height: 4,
      },
    },
  })
}

export const renderUmlInitial = renderCircle

export const renderUmlFinal = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const r = Math.min(config.width, config.height) / 2
  const cx = config.width / 2
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy} M${cx - r * 0.6},${cy} A${r * 0.6},${r * 0.6} 0 1,1 ${cx + r * 0.6},${cy} A${r * 0.6},${r * 0.6} 0 1,1 ${cx - r * 0.6},${cy}`,
        fill: '#f5222d',
      },
    },
  })
}

export const renderUmlSwimlane = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const headerWidth = config.width * 0.15
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,0 L${config.width},0 L${config.width},${config.height} L0,${config.height} Z M${headerWidth},0 L${headerWidth},${config.height}`,
        fill: '#fafafa',
      },
    },
  })
}

export const renderUmlObjectNode = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        strokeDasharray: '4,2',
      },
    },
  })
}

export const renderUmlDataStore = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createCylinderPath(config.width, config.height, 0.15)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#fff7e6',
        stroke: '#fa8c16',
      },
    },
  })
}

export const renderUmlState = (config: ShapeRenderConfig): Node => {
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

export const renderUmlInitialState = renderCircle

export const renderUmlFinalState = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const r = Math.min(config.width, config.height) / 2
  const cx = config.width / 2
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy} M${cx - r * 0.6},${cy} A${r * 0.6},${r * 0.6} 0 1,1 ${cx + r * 0.6},${cy} A${r * 0.6},${r * 0.6} 0 1,1 ${cx - r * 0.6},${cy}`,
        fill: '#f5222d',
      },
    },
  })
}

export const renderUmlChoice = renderDiamond

export const renderUmlPort = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: '#fff2e8',
        stroke: '#fa541c',
      },
    },
  })
}

export const renderUmlArtifact = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const foldSize = Math.min(config.width, config.height) * 0.15
  const foldX = config.width - foldSize
  const foldY = foldSize
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,0 L${foldX},0 L${config.width},${foldY} L${config.width},${config.height} L0,${config.height} Z M${foldX},0 L${foldX},${foldY} L${config.width},${foldY}`,
        fill: '#f9f0ff',
        stroke: '#722ed1',
      },
    },
  })
}

export const renderUmlDevice = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlNodePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#e6fffb',
        stroke: '#13c2c2',
      },
    },
  })
}

export const renderUmlComment = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlNotePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#fffbe6',
        stroke: '#faad14',
      },
    },
  })
}

export const renderUmlConstraint = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: 'transparent',
        strokeDasharray: '4,2',
      },
    },
  })
}

export const renderUmlGeneralization = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  const arrowSize = 10
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width - arrowSize},${cy}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlRealization = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy}`,
        fill: 'none',
        strokeDasharray: '6,3',
      },
    },
  })
}

export const renderUmlDependency = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy}`,
        fill: 'none',
        strokeDasharray: '4,2',
      },
    },
  })
}

export const renderUmlAssociation = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlAggregation = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  const diamondSize = 12
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${diamondSize},${cy} L${config.width},${cy}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlComposition = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  const diamondSize = 12
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${diamondSize},${cy} L${config.width},${cy}`,
        fill: 'none',
      },
    },
  })
}

export const renderUmlInclude = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy}`,
        fill: 'none',
        strokeDasharray: '4,2',
      },
    },
  })
}

export const renderUmlExtend = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cy = config.height / 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,${cy} L${config.width},${cy}`,
        fill: 'none',
        strokeDasharray: '4,2',
      },
    },
  })
}

export const renderUmlEntity = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const headerHeight = config.height * 0.25
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,0 L${config.width},0 L${config.width},${config.height} L0,${config.height} Z M0,${headerHeight} L${config.width},${headerHeight}`,
        fill: '#e6f7ff',
        stroke: '#1890ff',
      },
    },
  })
}

export const renderUmlAttribute = renderEllipse

export const renderUmlRelationship = renderDiamond

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
  'uml-enum': renderUmlEnum,
  'uml-generic-class': renderUmlGenericClass,
  'uml-fragment-alt': renderUmlFragment,
  'uml-fragment-loop': renderUmlFragment,
  'uml-fragment-par': renderUmlFragment,
  'uml-fragment-opt': renderUmlFragment,
  'uml-fragment-break': renderUmlFragment,
  'uml-fragment-critical': renderUmlFragment,
  'uml-fragment-strict': renderUmlFragment,
  'uml-fragment-seq': renderUmlFragment,
  'uml-fragment-ignore': renderUmlFragment,
  'uml-fragment-consider': renderUmlFragment,
  'uml-fragment-assert': renderUmlFragment,
  'uml-fragment-neg': renderUmlFragment,
  'uml-signal-send': renderUmlSignalSend,
  'uml-signal-receive': renderUmlSignalReceive,
  'uml-flow-final': renderUmlFlowFinal,
  'uml-state-composite': renderUmlCompositeState,
  'uml-state-history': renderUmlStateHistory,
  'uml-state-deep-history': renderUmlStateDeepHistory,
  'uml-state-entry-point': renderUmlStateEntryPoint,
  'uml-state-exit-point': renderUmlStateExitPoint,
  'uml-state-terminate': renderUmlStateTerminate,
  'uml-interface-provided': renderUmlProvidedInterface,
  'uml-interface-required': renderUmlRequiredInterface,
  'uml-connector': renderUmlConnector,
  'uml-execution-environment': renderUmlExecutionEnvironment,
  'uml-communication-path': renderUmlCommunicationPath,
  'uml-timing-ruler': renderUmlTimingRuler,
  'uml-timing-state-line': renderUmlTimingStateLine,
  'uml-timing-event': renderUmlTimingEvent,
  'uml-timing-duration': renderUmlTimingDuration,
  'uml-timing-constraint': renderUmlTimingConstraint,
  'uml-object-instance': renderUmlObjectInstance,
  'uml-link': renderUmlLink,
  'uml-link-end': renderUmlLinkEnd,
  'uml-comm-object': renderUmlCommObject,
  'uml-comm-link': renderUmlCommLink,
  'uml-comm-message': renderUmlCommMessage,
  'uml-comm-reverse-message': renderUmlCommReverseMessage,
  'uml-abstract-class': renderUmlAbstractClass,
  'uml-annotation': renderUmlAnnotation,
  'uml-system-boundary': renderUmlSystemBoundary,
  'uml-object': renderUmlObject,
  'uml-actor-lifeline': renderUmlActorLifeline,
  'uml-self-message': renderUmlSelfMessage,
  'uml-sync-message': renderUmlSyncMessage,
  'uml-async-message': renderUmlAsyncMessage,
  'uml-return-message': renderUmlReturnMessage,
  'uml-activity': renderUmlActivity,
  'uml-action': renderUmlAction,
  'uml-decision': renderUmlDecision,
  'uml-fork': renderUmlFork,
  'uml-initial': renderUmlInitial,
  'uml-final': renderUmlFinal,
  'uml-swimlane': renderUmlSwimlane,
  'uml-object-node': renderUmlObjectNode,
  'uml-data-store': renderUmlDataStore,
  'uml-state': renderUmlState,
  'uml-initial-state': renderUmlInitialState,
  'uml-final-state': renderUmlFinalState,
  'uml-choice': renderUmlChoice,
  'uml-port': renderUmlPort,
  'uml-artifact': renderUmlArtifact,
  'uml-device': renderUmlDevice,
  'uml-comment': renderUmlComment,
  'uml-constraint': renderUmlConstraint,
  'uml-generalization': renderUmlGeneralization,
  'uml-realization': renderUmlRealization,
  'uml-dependency': renderUmlDependency,
  'uml-association': renderUmlAssociation,
  'uml-aggregation': renderUmlAggregation,
  'uml-composition': renderUmlComposition,
  'uml-include': renderUmlInclude,
  'uml-extend': renderUmlExtend,
  'uml-entity': renderUmlEntity,
  'uml-attribute': renderUmlAttribute,
  'uml-relationship': renderUmlRelationship,
  'uml-actor-sequence': renderUmlActorLifeline,
  'uml-message-sync': renderUmlSyncMessage,
  'uml-message-async': renderUmlAsyncMessage,
  'uml-message-return': renderUmlReturnMessage,
  'uml-alt-fragment': renderUmlFragment,
  'uml-loop-fragment': renderUmlFragment,
  'uml-activity-action': renderUmlAction,
  'uml-activity-start': renderUmlInitial,
  'uml-activity-end': renderUmlFinal,
  'uml-activity-decision': renderUmlDecision,
  'uml-activity-fork': renderUmlFork,
  'uml-activity-swimlane': renderUmlSwimlane,
  'uml-activity-signal-send': renderUmlSignalSend,
  'uml-activity-signal-receive': renderUmlSignalReceive,
  'uml-state-simple': renderUmlState,
  'uml-state-start': renderUmlInitialState,
  'uml-state-end': renderUmlFinalState,
  'uml-state-choice': renderUmlChoice,
  'uml-component-main': renderUmlComponent,
  'uml-node-server': renderUmlNode,
  'uml-artifact-file': renderUmlArtifact,
  'uml-device-server': renderUmlDevice,

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
  'bpmn-boundary-event': renderBpmnBoundaryEvent,
  'bpmn-terminate-event': renderBpmnTerminateEvent,
  'bpmn-compensation-event': renderBpmnCompensationEvent,
  'bpmn-script-task': renderBpmnScriptTask,
  'bpmn-send-task': renderBpmnSendTask,
  'bpmn-receive-task': renderBpmnReceiveTask,
  'bpmn-manual-task': renderBpmnManualTask,
  'bpmn-business-rule-task': renderBpmnBusinessRuleTask,
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
