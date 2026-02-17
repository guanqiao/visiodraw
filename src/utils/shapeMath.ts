export interface Point {
  x: number
  y: number
}

export function calculatePolygonPoints(
  sides: number,
  width: number,
  height: number,
  rotation: number = -Math.PI / 2
): string {
  const points: Point[] = []
  const centerX = width / 2
  const centerY = height / 2
  const radiusX = width / 2
  const radiusY = height / 2

  for (let i = 0; i < sides; i++) {
    const angle = rotation + (2 * Math.PI * i) / sides
    const x = centerX + radiusX * Math.cos(angle)
    const y = centerY + radiusY * Math.sin(angle)
    points.push({ x, y })
  }

  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

export function calculateStarPoints(
  outerRadius: number,
  innerRadius: number,
  numPoints: number,
  centerX: number,
  centerY: number
): string {
  const points: Point[] = []
  const angleStep = Math.PI / numPoints
  const rotation = -Math.PI / 2

  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = rotation + i * angleStep
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    points.push({ x, y })
  }

  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

export function calculateCrossPoints(
  width: number,
  height: number,
  armWidthRatio: number = 0.35
): string {
  const armWidth = Math.min(width, height) * armWidthRatio
  const halfArm = armWidth / 2
  const cx = width / 2
  const cy = height / 2

  const points: Point[] = [
    { x: cx - halfArm, y: 0 },
    { x: cx + halfArm, y: 0 },
    { x: cx + halfArm, y: cy - halfArm },
    { x: width, y: cy - halfArm },
    { x: width, y: cy + halfArm },
    { x: cx + halfArm, y: cy + halfArm },
    { x: cx + halfArm, y: height },
    { x: cx - halfArm, y: height },
    { x: cx - halfArm, y: cy + halfArm },
    { x: 0, y: cy + halfArm },
    { x: 0, y: cy - halfArm },
    { x: cx - halfArm, y: cy - halfArm },
  ]

  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

export function createCylinderPath(
  width: number,
  height: number,
  ellipseRatio: number = 0.2
): string {
  const ellipseHeight = height * ellipseRatio

  const topEllipse = `M0,${ellipseHeight} 
    Q${width / 2},0 ${width},${ellipseHeight}`
  const body = `L${width},${height - ellipseHeight} 
    Q${width / 2},${height} 0,${height - ellipseHeight} Z`
  const bottomEllipseLine = `M0,${ellipseHeight} 
    Q${width / 2},${ellipseHeight * 2} ${width},${ellipseHeight}`

  return `${topEllipse} ${body} ${bottomEllipseLine}`
}

export function createDocumentPath(
  width: number,
  height: number,
  waveAmplitude: number = 0.1,
  waveFrequency: number = 2
): string {
  const waveHeight = height * waveAmplitude
  const bodyHeight = height - waveHeight

  let path = `M0,0 L${width},0 L${width},${bodyHeight} `

  const segments = waveFrequency * 2
  const segmentWidth = width / segments

  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth
    const y = bodyHeight + (i % 2 === 0 ? 0 : waveHeight)
    if (i === 0) {
      path += `L${x},${y} `
    } else {
      path += `L${x},${y} `
    }
  }

  path += `L0,${bodyHeight} Z`

  return path
}

export function createCloudPath(width: number, height: number): string {
  const w = width
  const h = height
  const cx = w / 2
  const cy = h / 2

  const r1 = Math.min(w, h) * 0.25
  const r2 = r1 * 0.85
  const r3 = r1 * 0.7

  const p1 = { x: w * 0.15, y: cy + h * 0.15 }
  const p2 = { x: w * 0.35, y: cy - h * 0.25 }
  const p3 = { x: w * 0.55, y: cy - h * 0.35 }
  const p4 = { x: w * 0.75, y: cy - h * 0.2 }
  const p5 = { x: w * 0.9, y: cy + h * 0.1 }
  const p6 = { x: w * 0.85, y: cy + h * 0.3 }

  return `M${p1.x},${p1.y + r1 * 0.5}
    Q${p1.x - r1},${p1.y} ${p1.x},${p1.y - r1 * 0.5}
    Q${p2.x - r2},${p2.y - r2} ${p2.x + r2 * 0.5},${p2.y - r2 * 0.3}
    Q${p3.x - r3},${p3.y - r3} ${p3.x + r3 * 0.3},${p3.y - r3 * 0.5}
    Q${p4.x - r2 * 0.5},${p4.y - r2} ${p4.x + r2 * 0.5},${p4.y - r2 * 0.3}
    Q${p5.x + r1},${p5.y - r1 * 0.5} ${p5.x + r1 * 0.3},${p5.y + r1 * 0.5}
    Q${p6.x + r1 * 0.5},${p6.y + r1} ${p6.x - r1 * 0.5},${p6.y + r1 * 0.5}
    Q${cx},${h} ${p1.x},${p1.y + r1 * 0.5}
    Z`
}

export function createParallelogramPoints(
  width: number,
  height: number,
  skewRatio: number = 0.2
): string {
  const skew = width * skewRatio

  return `${skew},0 ${width},0 ${width - skew},${height} 0,${height}`
}

export function createTrapezoidPoints(
  width: number,
  height: number,
  topRatio: number = 0.6
): string {
  const topWidth = width * topRatio
  const leftOffset = (width - topWidth) / 2

  return `${leftOffset},0 ${leftOffset + topWidth},0 ${width},${height} 0,${height}`
}

export function createArrowPath(
  width: number,
  height: number,
  arrowRatio: number = 0.3
): string {
  const arrowWidth = width * arrowRatio
  const bodyWidth = width - arrowWidth

  return `0,0 ${bodyWidth},0 ${width},${height / 2} ${bodyWidth},${height} 0,${height}`
}

export function createServerPath(width: number, height: number): string {
  const unit = Math.min(width, height) / 10
  const margin = unit
  const bodyHeight = height - margin * 2

  const lineY1 = margin + bodyHeight * 0.33
  const lineY2 = margin + bodyHeight * 0.67

  return `M${margin},${margin} 
    L${width - margin},${margin} 
    L${width - margin},${height - margin} 
    L${margin},${height - margin} Z
    M${margin},${lineY1} L${width - margin},${lineY1}
    M${margin},${lineY2} L${width - margin},${lineY2}`
}

export function createWifiPath(width: number, height: number): string {
  const cx = width / 2
  const baseY = height * 0.85
  const dotRadius = Math.min(width, height) * 0.08

  const r1 = Math.min(width, height) * 0.15
  const r2 = r1 * 2
  const r3 = r1 * 3

  const arc1Y = baseY - r1 * 1.5
  const arc2Y = baseY - r2 * 1.2
  const arc3Y = baseY - r3 * 0.9

  return `M${cx},${baseY}
    A${dotRadius},${dotRadius} 0 1,1 ${cx + 0.01},${baseY}
    M${cx - r1},${arc1Y}
    A${r1},${r1} 0 0,1 ${cx + r1},${arc1Y}
    M${cx - r2},${arc2Y}
    A${r2},${r2} 0 0,1 ${cx + r2},${arc2Y}
    M${cx - r3},${arc3Y}
    A${r3},${r3} 0 0,1 ${cx + r3},${arc3Y}`
}

export function createGlobePath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) / 2 - 2

  return `M${cx},${cy - r}
    A${r},${r} 0 1,1 ${cx},${cy + r}
    A${r},${r} 0 1,1 ${cx},${cy - r}
    M${cx},${cy - r} L${cx},${cy + r}
    M${cx - r},${cy} L${cx + r},${cy}
    M${cx - r * 0.7},${cy - r * 0.7}
    Q${cx},${cy - r * 0.3} ${cx + r * 0.7},${cy - r * 0.7}
    M${cx - r * 0.7},${cy + r * 0.7}
    Q${cx},${cy + r * 0.3} ${cx + r * 0.7},${cy + r * 0.7}`
}

export function createFirewallPath(width: number, height: number): string {
  const brickH = height / 3
  const brickW = width / 2

  return `M0,0 L${width},0 L${width},${height} L0,${height} Z
    M${brickW},0 L${brickW},${brickH}
    M0,${brickH} L${width},${brickH}
    M${brickW / 2},${brickH} L${brickW / 2},${brickH * 2}
    M${brickW * 1.5},${brickH} L${brickW * 1.5},${brickH * 2}
    M0,${brickH * 2} L${width},${brickH * 2}
    M${brickW},${brickH * 2} L${brickW},${height}`
}

export function createRouterPath(width: number, height: number): string {
  const margin = width * 0.1
  const bodyTop = height * 0.3
  const bodyBottom = height * 0.85
  const bodyLeft = margin
  const bodyRight = width - margin
  const bodyHeight = bodyBottom - bodyTop

  const antennaHeight = height * 0.25

  const a1x = width * 0.25
  const a2x = width * 0.5
  const a3x = width * 0.75

  const dotR = Math.min(width, height) * 0.04
  const dotY = bodyTop + bodyHeight * 0.5
  const dots = [width * 0.3, width * 0.5, width * 0.7]

  let path = `M${bodyLeft},${bodyTop} L${bodyRight},${bodyTop} L${bodyRight},${bodyBottom} L${bodyLeft},${bodyBottom} Z`

  path += ` M${a1x},${bodyTop} L${a1x},${bodyTop - antennaHeight}`
  path += ` M${a2x},${bodyTop} L${a2x},${bodyTop - antennaHeight * 1.2}`
  path += ` M${a3x},${bodyTop} L${a3x},${bodyTop - antennaHeight}`

  dots.forEach((dx) => {
    path += ` M${dx - dotR},${dotY} A${dotR},${dotR} 0 1,1 ${dx + dotR},${dotY} A${dotR},${dotR} 0 1,1 ${dx - dotR},${dotY}`
  })

  return path
}

export function createSwitchPath(width: number, height: number): string {
  const margin = width * 0.1
  const bodyTop = height * 0.2
  const bodyBottom = height * 0.8
  const bodyLeft = margin
  const bodyRight = width - margin

  const dotR = Math.min(width, height) * 0.05
  const dotY = (bodyTop + bodyBottom) / 2
  const dots = [width * 0.25, width * 0.5, width * 0.75]

  let path = `M${bodyLeft},${bodyTop} L${bodyRight},${bodyTop} L${bodyRight},${bodyBottom} L${bodyLeft},${bodyBottom} Z`

  dots.forEach((dx) => {
    path += ` M${dx - dotR},${dotY} A${dotR},${dotR} 0 1,1 ${dx + dotR},${dotY} A${dotR},${dotR} 0 1,1 ${dx - dotR},${dotY}`
  })

  return path
}

export function createDesktopPath(width: number, height: number): string {
  const monitorMargin = width * 0.1
  const monitorTop = height * 0.05
  const monitorBottom = height * 0.65
  const monitorLeft = monitorMargin
  const monitorRight = width - monitorMargin

  const standWidth = width * 0.15
  const standTop = monitorBottom
  const standBottom = height * 0.8
  const standX = (width - standWidth) / 2

  const baseHeight = height * 0.1
  const baseTop = standBottom
  const baseLeft = width * 0.2
  const baseRight = width * 0.8

  return `M${monitorLeft},${monitorTop} 
    L${monitorRight},${monitorTop} 
    L${monitorRight},${monitorBottom} 
    L${monitorLeft},${monitorBottom} Z
    M${standX},${standTop} L${standX + standWidth},${standTop} L${standX + standWidth},${standBottom} L${standX},${standBottom} Z
    M${baseLeft},${baseTop} L${baseRight},${baseTop} L${baseRight},${baseTop + baseHeight} L${baseLeft},${baseTop + baseHeight} Z`
}

export function createLaptopPath(width: number, height: number): string {
  const screenMargin = width * 0.1
  const screenTop = height * 0.1
  const screenBottom = height * 0.6
  const screenLeft = screenMargin
  const screenRight = width - screenMargin

  const baseHeight = height * 0.15
  const baseTop = screenBottom
  const baseBottom = baseTop + baseHeight
  const baseLeft = width * 0.05
  const baseRight = width * 0.95

  return `M${screenLeft},${screenTop} 
    L${screenRight},${screenTop} 
    L${screenRight},${screenBottom} 
    L${screenLeft},${screenBottom} Z
    M${baseLeft},${baseTop} 
    L${baseRight},${baseTop} 
    L${width},${baseBottom} 
    L0,${baseBottom} Z`
}

export function createUmlActorPath(width: number, height: number): string {
  const cx = width / 2
  const headR = Math.min(width, height) * 0.12
  const headCy = headR + height * 0.02

  const neckY = headCy + headR
  const bodyTop = neckY + height * 0.02
  const bodyBottom = height * 0.65
  const armY = bodyTop + (bodyBottom - bodyTop) * 0.3
  const armSpread = width * 0.4

  const legSpread = width * 0.3
  const legBottom = height * 0.98

  return `M${cx},${headCy - headR}
    A${headR},${headR} 0 1,1 ${cx},${headCy + headR}
    A${headR},${headR} 0 1,1 ${cx},${headCy - headR}
    M${cx},${neckY} L${cx},${bodyBottom}
    M${cx - armSpread},${armY} L${cx + armSpread},${armY}
    M${cx},${bodyBottom} L${cx - legSpread},${legBottom}
    M${cx},${bodyBottom} L${cx + legSpread},${legBottom}`
}

export function createUmlClassPath(
  width: number,
  height: number,
  headerHeight?: number,
  attrHeight?: number
): string {
  const actualHeaderHeight = headerHeight || height * 0.25
  const actualAttrHeight = attrHeight || height * 0.3
  const divider1Y = actualHeaderHeight
  const divider2Y = actualHeaderHeight + actualAttrHeight

  return `M0,0 L${width},0 L${width},${height} L0,${height} Z
    M0,${divider1Y} L${width},${divider1Y}
    M0,${divider2Y} L${width},${divider2Y}`
}

export function createUmlPackagePath(width: number, height: number): string {
  const tabWidth = width * 0.35
  const tabHeight = height * 0.15
  const bodyTop = tabHeight

  return `M0,${bodyTop} L${tabWidth},${bodyTop} L${tabWidth},0 L${width * 0.7},0 L${width * 0.7},${bodyTop} L${width},${bodyTop} L${width},${height} L0,${height} Z`
}

export function createUmlComponentPath(width: number, height: number): string {
  const tabWidth = width * 0.15
  const tabHeight = height * 0.12
  const tab1Y = height * 0.2
  const tab2Y = height * 0.65
  const bodyLeft = tabWidth

  return `M${bodyLeft},0 L${width},0 L${width},${height} L${bodyLeft},${height} Z
    M0,${tab1Y} L${bodyLeft},${tab1Y - tabHeight} L${bodyLeft},${tab1Y + tabHeight} Z
    M0,${tab2Y} L${bodyLeft},${tab2Y - tabHeight} L${bodyLeft},${tab2Y + tabHeight} Z`
}

export function createUmlNodePath(width: number, height: number): string {
  const depth = Math.min(width, height) * 0.2

  return `M${depth},0 L${width},0 L${width},${height - depth} L${width - depth},${height} L0,${height} L0,${depth} Z
    M0,${depth} L${depth},0
    M${width},${height - depth} L${width - depth},${height}
    M${depth},0 L${depth},${height - depth} L${width - depth},${height - depth} L${width - depth},${height}`
}

export function createUmlNotePath(width: number, height: number): string {
  const foldSize = Math.min(width, height) * 0.15
  const foldX = width - foldSize
  const foldY = foldSize

  return `M0,0 L${foldX},0 L${width},${foldY} L${width},${height} L0,${height} Z
    M${foldX},0 L${foldX},${foldY} L${width},${foldY}`
}

export function createBpmnEventPath(
  width: number,
  height: number,
  type: 'start' | 'end' | 'intermediate'
): string {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) / 2 - 2

  let path = `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${r},${r} 0 1,1 ${cx},${cy - r}`

  if (type === 'intermediate') {
    const innerR = r * 0.75
    path += ` M${cx},${cy - innerR} A${innerR},${innerR} 0 1,1 ${cx},${cy + innerR} A${innerR},${innerR} 0 1,1 ${cx},${cy - innerR}`
  }

  return path
}

export function createBpmnGatewayPath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2

  return `${cx},0 ${width},${cy} ${cx},${height} 0,${cy}`
}

export function createBpmnActivityPath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z`
}

export function createBpmnUserTaskPath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1
  const lineY = height * 0.85
  const lineHeight = height * 0.05

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z
    M0,${lineY} L${width},${lineY}
    M0,${lineY + lineHeight} L${width},${lineY + lineHeight}`
}

export function createBpmnServiceTaskPath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1
  const cx = width / 2
  const cy = height / 2
  const gearR = Math.min(width, height) * 0.25
  const innerR = gearR * 0.4
  const toothHeight = gearR * 0.2
  const toothCount = 8

  let gearPath = ''
  for (let i = 0; i < toothCount; i++) {
    const angle = (i / toothCount) * Math.PI * 2
    const nextAngle = ((i + 0.5) / toothCount) * Math.PI * 2
    const x1 = cx + Math.cos(angle) * (gearR + toothHeight)
    const y1 = cy + Math.sin(angle) * (gearR + toothHeight)
    const x2 = cx + Math.cos(nextAngle) * (gearR + toothHeight)
    const y2 = cy + Math.sin(nextAngle) * (gearR + toothHeight)
    const x3 = cx + Math.cos(nextAngle) * gearR
    const y3 = cy + Math.sin(nextAngle) * gearR
    const prevAngle = ((i - 0.5) / toothCount) * Math.PI * 2
    const x4 = cx + Math.cos(prevAngle) * gearR
    const y4 = cy + Math.sin(prevAngle) * gearR
    
    if (i === 0) {
      gearPath = `M${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4}`
    } else {
      gearPath += ` L${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4}`
    }
  }
  gearPath += ' Z'

  const innerCircle = `M${cx},${cy - innerR} A${innerR},${innerR} 0 1,1 ${cx},${cy + innerR} A${innerR},${innerR} 0 1,1 ${cx},${cy - innerR}`

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z
    M${gearPath}
    M${innerCircle}`
}

export function createBpmnSubprocessPath(width: number, height: number): string {
  const outerRadius = Math.min(width, height) * 0.08
  const innerMargin = 12

  return `M${outerRadius},0 
    L${width - outerRadius},0 
    Q${width},0 ${width},${outerRadius}
    L${width},${height - outerRadius}
    Q${width},${height} ${width - outerRadius},${height}
    L${outerRadius},${height}
    Q0,${height} 0,${height - outerRadius}
    L0,${outerRadius}
    Q0,0 ${outerRadius},0 Z
    M${innerMargin},${innerMargin} L${width - innerMargin},${innerMargin}
    L${width - innerMargin},${height - innerMargin} L${innerMargin},${height - innerMargin} Z`
}

export function createBpmnPoolPath(width: number, height: number): string {
  const laneWidth = Math.min(width * 0.2, 80)

  return `M0,0 L${width},0 L${width},${height} L0,${height} Z
    M${laneWidth},0 L${laneWidth},${height}`
}

export function createBpmnLanePath(width: number, height: number): string {
  const laneHeaderWidth = Math.min(width * 0.15, 60)

  return `M0,0 L${width},0 L${width},${height} L0,${height} Z
    M${laneHeaderWidth},0 L${laneHeaderWidth},${height}`
}

export function createBpmnDataObjectPath(width: number, height: number): string {
  const cornerSize = width * 0.25

  return `M0,0 L${width - cornerSize},0 L${width},${cornerSize} L${width},${height} L0,${height} Z`
}

export function createBpmnDataStorePath(width: number, height: number): string {
  const topControl = height * 0.15
  const bottomControl = height * 0.15

  return `M0,${topControl} 
    Q${width / 2},0 ${width},${topControl}
    L${width},${height - bottomControl}
    Q${width / 2},${height} 0,${height - bottomControl}
    Z
    M0,${topControl * 2} 
    Q${width / 2},${topControl} ${width},${topControl * 2}`
}

export function createBpmnBoundaryEventPath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) / 2 - 2
  const innerR = r * 0.6

  return `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${r},${r} 0 1,1 ${cx},${cy - r}
    M${cx},${cy - innerR} A${innerR},${innerR} 0 1,1 ${cx},${cy + innerR} A${innerR},${innerR} 0 1,1 ${cx},${cy - innerR}`
}

export function createBpmnTerminateEventPath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) / 2 - 2

  return `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${r},${r} 0 1,1 ${cx},${cy - r}
    M${cx},${cy - r * 0.5} L${cx + r * 0.5},${cy} L${cx},${cy + r * 0.5} L${cx - r * 0.5},${cy} Z`
}

export function createBpmnCompensationEventPath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) / 2 - 2
  const arrowSize = r * 0.4

  return `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${r},${r} 0 1,1 ${cx},${cy - r}
    M${cx - arrowSize},${cy - arrowSize * 0.5} L${cx},${cy - arrowSize} L${cx + arrowSize},${cy - arrowSize * 0.5}
    M${cx - arrowSize},${cy + arrowSize * 0.5} L${cx},${cy + arrowSize} L${cx + arrowSize},${cy + arrowSize * 0.5}`
}

export function createBpmnScriptTaskPath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1
  const cx = width / 2
  const cy = height / 2
  const scriptW = width * 0.4
  const scriptH = height * 0.5
  const lineSpacing = scriptH / 4

  let scriptPath = ''
  for (let i = 0; i < 3; i++) {
    const y = cy - scriptH / 2 + i * lineSpacing + lineSpacing / 2
    const x1 = cx - scriptW / 2
    const x2 = cx + scriptW / 2
    scriptPath += ` M${x1},${y} L${x2},${y}`
    if (i < 2) scriptPath += ' '
  }

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z
    M${scriptPath}`
}

export function createBpmnSendTaskPath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1
  const cx = width / 2
  const cy = height / 2
  const envW = width * 0.35
  const envH = height * 0.25

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z
    M${cx - envW},${cy - envH / 2} 
    L${cx},${cy + envH / 2} 
    L${cx + envW},${cy - envH / 2}
    L${cx},${cy - envH / 2 + envH * 0.3}
    Z`
}

export function createBpmnReceiveTaskPath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1
  const cx = width / 2
  const cy = height / 2
  const envW = width * 0.35
  const envH = height * 0.25

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z
    M${cx - envW},${cy - envH / 2} 
    L${cx + envW},${cy - envH / 2}
    L${cx + envW},${cy + envH / 2}
    L${cx - envW},${cy + envH / 2}
    Z
    M${cx - envW},${cy - envH / 2} L${cx},${cy + envH / 2} L${cx + envW},${cy - envH / 2}`
}

export function createBpmnManualTaskPath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1
  const cx = width / 2
  const cy = height / 2
  const handW = width * 0.3
  const handH = height * 0.4

  const handPath = `M${cx - handW * 0.5},${cy + handH * 0.3}
    L${cx - handW * 0.3},${cy - handH * 0.5}
    L${cx - handW * 0.1},${cy - handH * 0.5}
    L${cx},${cy - handH * 0.2}
    L${cx + handW * 0.1},${cy - handH * 0.5}
    L${cx + handW * 0.3},${cy - handH * 0.5}
    L${cx + handW * 0.5},${cy + handH * 0.3}
    L${cx + handW * 0.3},${cy + handH * 0.5}
    L${cx - handW * 0.3},${cy + handH * 0.5}
    Z`

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z
    M${handPath}`
}

export function createBpmnBusinessRuleTaskPath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1
  const cx = width / 2
  const cy = height / 2
  const tableW = width * 0.5
  const tableH = height * 0.5
  const rowH = tableH / 4

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z
    M${cx - tableW / 2},${cy - tableH / 2} L${cx + tableW / 2},${cy - tableH / 2}
    M${cx - tableW / 2},${cy - tableH / 2 + rowH} L${cx + tableW / 2},${cy - tableH / 2 + rowH}
    M${cx - tableW / 2},${cy + tableH / 2 - rowH} L${cx + tableW / 2},${cy + tableH / 2 - rowH}
    M${cx - tableW / 2},${cy - tableH / 2} L${cx - tableW / 2},${cy + tableH / 2}
    M${cx + tableW / 2},${cy - tableH / 2} L${cx + tableW / 2},${cy + tableH / 2}
    M${cx - tableW / 2},${cy} L${cx + tableW / 2},${cy}`
}

export function createDoubleEllipsePath(
  width: number,
  height: number,
  innerMargin: number = 0.15
): string {
  const cx = width / 2
  const cy = height / 2
  const outerRx = width / 2
  const outerRy = height / 2
  const innerRx = outerRx * (1 - innerMargin)
  const innerRy = outerRy * (1 - innerMargin)

  return `M${cx},${cy - outerRy}
    A${outerRx},${outerRy} 0 1,1 ${cx},${cy + outerRy}
    A${outerRx},${outerRy} 0 1,1 ${cx},${cy - outerRy}
    M${cx},${cy - innerRy}
    A${innerRx},${innerRy} 0 1,1 ${cx},${cy + innerRy}
    A${innerRx},${innerRy} 0 1,1 ${cx},${cy - innerRy}`
}

export function createErTableEntityPath(
  width: number,
  height: number,
  headerRatio: number = 0.3,
  pkRatio: number = 0.35
): string {
  const headerHeight = height * headerRatio
  const pkHeight = height * pkRatio

  return `M0,0 L${width},0 L${width},${height} L0,${height} Z
    M0,${headerHeight} L${width},${headerHeight}
    M0,${pkHeight} L${width},${pkHeight}`
}

export function createErTableWithColumnsPath(
  width: number,
  height: number,
  columnCount: number
): string {
  const headerHeight = Math.max(height * 0.15, 24)
  const rowHeight = (height - headerHeight) / Math.max(columnCount, 1)

  let path = `M0,0 L${width},0 L${width},${height} L0,${height} Z
    M0,${headerHeight} L${width},${headerHeight}`

  for (let i = 1; i <= columnCount; i++) {
    const y = headerHeight + i * rowHeight
    path += ` M0,${y} L${width},${y}`
  }

  return path
}

export function createUmlEnumPath(width: number, height: number): string {
  const headerHeight = height * 0.25
  return `M0,0 L${width},0 L${width},${height} L0,${height} Z
    M0,${headerHeight} L${width},${headerHeight}`
}

export function createUmlCompositeStatePath(width: number, height: number): string {
  const cornerRadius = Math.min(width, height) * 0.1
  const innerMargin = Math.min(width, height) * 0.1
  const innerWidth = width - innerMargin * 2
  const innerHeight = height * 0.4
  const innerY = height - innerMargin - innerHeight

  return `M${cornerRadius},0 
    L${width - cornerRadius},0 
    Q${width},0 ${width},${cornerRadius}
    L${width},${height - cornerRadius}
    Q${width},${height} ${width - cornerRadius},${height}
    L${cornerRadius},${height}
    Q0,${height} 0,${height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z
    M${innerMargin},${innerY} 
    L${innerMargin + innerWidth},${innerY} 
    L${innerMargin + innerWidth},${innerY + innerHeight} 
    L${innerMargin},${innerY + innerHeight} Z`
}

export function createUmlProvidedInterfacePath(width: number, height: number): string {
  const cx = width * 0.7
  const cy = height / 2
  const r = Math.min(width, height) * 0.2

  return `M0,${cy} L${cx - r},${cy}
    M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${r},${r} 0 1,1 ${cx},${cy - r}`
}

export function createUmlRequiredInterfacePath(width: number, height: number): string {
  const cx = width * 0.7
  const cy = height / 2
  const r = Math.min(width, height) * 0.2

  return `M0,${cy} L${cx},${cy}
    M${cx + r},${cy - r} A${r},${r} 0 1,0 ${cx + r},${cy + r}`
}

export function createUmlSignalSendPath(width: number, height: number): string {
  const arrowWidth = width * 0.25
  return `M0,0 L${width - arrowWidth},0 L${width},${height / 2} L${width - arrowWidth},${height} L0,${height} Z`
}

export function createUmlSignalReceivePath(width: number, height: number): string {
  const arrowWidth = width * 0.25
  return `M${arrowWidth},0 L${width},0 L${width},${height} L${arrowWidth},${height} L0,${height / 2} Z`
}

export function createUmlObjectInstancePath(width: number, height: number): string {
  const headerHeight = height * 0.3
  return `M0,0 L${width},0 L${width},${height} L0,${height} Z
    M0,${headerHeight} L${width},${headerHeight}`
}

export function createUmlTimingRulerPath(width: number, height: number): string {
  const tickCount = 5
  const tickSpacing = width / tickCount
  const tickHeight = height * 0.2
  const cy = height / 2

  let path = `M0,${cy} L${width},${cy}`
  for (let i = 0; i <= tickCount; i++) {
    const x = i * tickSpacing
    path += ` M${x},${cy - tickHeight} L${x},${cy + tickHeight}`
  }
  path += ` M${width - tickHeight},${cy} L${width},${cy} L${width - tickHeight},${cy + tickHeight}`

  return path
}

export function createUmlTimingStateLinePath(width: number, height: number): string {
  const stateWidth = width * 0.15
  const stateHeight = height * 0.3
  const transitions = [
    { x: stateWidth, y: stateHeight / 2 },
    { x: width * 0.4, y: height - stateHeight / 2 },
    { x: width * 0.6, y: height - stateHeight / 2 },
    { x: width - stateWidth, y: stateHeight / 2 },
  ]

  let path = `M0,0 L${stateWidth},0 L${stateWidth},${stateHeight} L0,${stateHeight} Z`
  
  for (let i = 0; i < transitions.length - 1; i++) {
    path += ` M${transitions[i].x},${transitions[i].y} L${transitions[i + 1].x},${transitions[i + 1].y}`
  }

  const lastX = width - stateWidth
  path += ` M${lastX},0 L${width},0 L${width},${stateHeight} L${lastX},${stateHeight} Z`

  return path
}

export function createUmlSwimlanePoolPath(
  width: number,
  height: number,
  laneCount: number = 3,
  headerWidth: number = 80
): string {
  let path = `M0,0 L${width},0 L${width},${height} L0,${height} Z`
  path += ` M${headerWidth},0 L${headerWidth},${height}`

  if (laneCount > 1) {
    const laneHeight = height / laneCount
    for (let i = 1; i < laneCount; i++) {
      const y = Math.round(i * laneHeight)
      path += ` M${headerWidth},${y} L${width},${y}`
    }
  }

  return path
}

export function createUmlSwimlaneHorizontalPath(
  width: number,
  height: number,
  headerWidth: number = 80
): string {
  return `M0,0 L${width},0 L${width},${height} L0,${height} Z M${headerWidth},0 L${headerWidth},${height}`
}

export function createUmlSwimlaneVerticalPath(
  width: number,
  height: number,
  headerHeight: number = 40
): string {
  return `M0,0 L${width},0 L${width},${height} L0,${height} Z M0,${headerHeight} L${width},${headerHeight}`
}

export function createUmlSwimlaneSeparatorPath(width: number, height: number): string {
  const y = Math.round(height / 2)
  return `M0,${y} L${width},${y}`
}

// ==================== AWS 云服务路径函数 ====================

export function createAwsVpcPath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) * 0.35
  const smallR = r * 0.4

  return `M${cx},${cy - r}
    A${r},${r} 0 1,1 ${cx},${cy + r}
    A${r},${r} 0 1,1 ${cx},${cy - r}
    M${cx - smallR},${cy}
    A${smallR},${smallR} 0 1,1 ${cx + smallR},${cy}
    A${smallR},${smallR} 0 1,1 ${cx - smallR},${cy}
    M${cx},${cy - smallR} L${cx},${cy - r * 0.7}
    M${cx},${cy + smallR} L${cx},${cy + r * 0.7}
    M${cx - smallR},${cy} L${cx - r * 0.7},${cy}
    M${cx + smallR},${cy} L${cx + r * 0.7},${cy}`
}

export function createAwsElbPath(width: number, height: number): string {
  const margin = width * 0.1
  const layerHeight = (height - margin * 2) / 3
  const layerWidth = width - margin * 2
  const arrowSize = Math.min(width, height) * 0.08
  const cx = width / 2

  let path = ''
  for (let i = 0; i < 3; i++) {
    const y = margin + i * layerHeight
    const nextY = margin + (i + 1) * layerHeight
    path += `M${margin},${y + layerHeight * 0.2} L${margin + layerWidth},${y + layerHeight * 0.2} L${margin + layerWidth},${y + layerHeight * 0.8} L${margin},${y + layerHeight * 0.8} Z`
    if (i < 2) {
      path += ` M${cx},${y + layerHeight * 0.8} L${cx},${nextY + layerHeight * 0.2}`
      path += ` M${cx - arrowSize},${nextY + layerHeight * 0.2 - arrowSize} L${cx},${nextY + layerHeight * 0.2} L${cx + arrowSize},${nextY + layerHeight * 0.2 - arrowSize}`
    }
  }
  return path
}

export function createAwsSqsPath(width: number, height: number): string {
  const margin = width * 0.15
  const queueWidth = (width - margin * 2) / 3
  const queueHeight = height - margin * 2
  const cx = width / 2

  let path = ''
  for (let i = 0; i < 3; i++) {
    const x = margin + i * queueWidth
    path += ` M${x},${margin} L${x + queueWidth * 0.8},${margin} L${x + queueWidth * 0.8},${margin + queueHeight} L${x},${margin + queueHeight} Z`
  }
  path += ` M${cx},${margin * 0.5} L${cx},${margin}`
  path += ` M${cx - margin * 0.3},${margin * 0.8} L${cx},${margin * 0.5} L${cx + margin * 0.3},${margin * 0.8}`

  return path
}

export function createAwsSnsPath(width: number, height: number): string {
  const cx = width / 2
  const cy = height * 0.6
  const bellR = Math.min(width, height) * 0.25
  const waveR = bellR * 1.5

  return `M${cx},${cy - bellR}
    Q${cx + bellR},${cy - bellR} ${cx + bellR},${cy}
    L${cx + bellR * 0.3},${cy + bellR * 1.2}
    L${cx - bellR * 0.3},${cy + bellR * 1.2}
    L${cx - bellR},${cy}
    Q${cx - bellR},${cy - bellR} ${cx},${cy - bellR}
    M${cx},${cy - bellR} L${cx},${cy - bellR * 1.3}
    M${cx + waveR},${cy - bellR * 0.5}
    A${waveR * 0.3},${waveR * 0.3} 0 0,1 ${cx + waveR + waveR * 0.2},${cy - bellR * 0.5 - waveR * 0.2}
    M${cx - waveR},${cy - bellR * 0.5}
    A${waveR * 0.3},${waveR * 0.3} 0 0,0 ${cx - waveR - waveR * 0.2},${cy - bellR * 0.5 - waveR * 0.2}`
}

export function createAwsIamPath(width: number, height: number): string {
  const cx = width / 2
  const headR = Math.min(width, height) * 0.15
  const headCy = height * 0.25
  const bodyTop = headCy + headR + height * 0.05
  const bodyBottom = height * 0.75
  const shieldW = width * 0.25
  const shieldH = height * 0.3
  const shieldX = width * 0.65
  const shieldY = height * 0.45

  return `M${cx},${headCy - headR}
    A${headR},${headR} 0 1,1 ${cx},${headCy + headR}
    A${headR},${headR} 0 1,1 ${cx},${headCy - headR}
    M${cx},${bodyTop} L${cx},${bodyBottom}
    M${cx - width * 0.2},${bodyTop + (bodyBottom - bodyTop) * 0.3} L${cx + width * 0.2},${bodyTop + (bodyBottom - bodyTop) * 0.3}
    M${shieldX},${shieldY}
    Q${shieldX + shieldW / 2},${shieldY - shieldH * 0.2} ${shieldX + shieldW},${shieldY}
    L${shieldX + shieldW},${shieldY + shieldH * 0.7}
    Q${shieldX + shieldW / 2},${shieldY + shieldH} ${shieldX},${shieldY + shieldH * 0.7}
    L${shieldX},${shieldY}
    M${shieldX + shieldW * 0.5},${shieldY + shieldH * 0.3} L${shieldX + shieldW * 0.5},${shieldY + shieldH * 0.6}
    M${shieldX + shieldW * 0.35},${shieldY + shieldH * 0.45} L${shieldX + shieldW * 0.65},${shieldY + shieldH * 0.45}`
}

export function createAwsCloudWatchPath(width: number, height: number): string {
  const margin = width * 0.1
  const chartW = width - margin * 2
  const chartH = height * 0.5
  const chartY = height * 0.35
  const cx = width / 2

  const points = [
    { x: margin, y: chartY + chartH },
    { x: margin + chartW * 0.2, y: chartY + chartH * 0.6 },
    { x: margin + chartW * 0.4, y: chartY + chartH * 0.8 },
    { x: margin + chartW * 0.6, y: chartY + chartH * 0.3 },
    { x: margin + chartW * 0.8, y: chartY + chartH * 0.5 },
    { x: margin + chartW, y: chartY + chartH * 0.2 },
  ]

  let path = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L${points[i].x},${points[i].y}`
  }

  path += ` M${margin},${chartY + chartH} L${margin + chartW},${chartY + chartH}`
  path += ` M${margin},${chartY} L${margin},${chartY + chartH}`

  const dialR = Math.min(width, height) * 0.12
  const dialY = height * 0.15
  path += ` M${cx},${dialY}
    A${dialR},${dialR} 0 1,1 ${cx},${dialY + 0.01}
    M${cx},${dialY} L${cx + dialR * 0.6},${dialY - dialR * 0.3}`

  return path
}

export function createAwsKinesisPath(width: number, height: number): string {
  const margin = width * 0.1
  const waveCount = 3
  const waveWidth = (width - margin * 2) / waveCount
  const amplitude = height * 0.15
  const cy = height / 2

  let path = ''
  for (let i = 0; i < waveCount; i++) {
    const x1 = margin + i * waveWidth
    const x2 = x1 + waveWidth / 2
    const x3 = x1 + waveWidth
    path += ` M${x1},${cy} Q${x2},${cy - amplitude} ${x3},${cy}`
    path += ` M${x1},${cy} Q${x2},${cy + amplitude} ${x3},${cy}`
  }

  return path
}

export function createAwsEventBridgePath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2
  const centerR = Math.min(width, height) * 0.12
  const spokeLength = Math.min(width, height) * 0.35
  const spokeCount = 6

  let path = `M${cx},${cy - centerR}
    A${centerR},${centerR} 0 1,1 ${cx},${cy + centerR}
    A${centerR},${centerR} 0 1,1 ${cx},${cy - centerR}`

  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2 - Math.PI / 2
    const x1 = cx + Math.cos(angle) * centerR
    const y1 = cy + Math.sin(angle) * centerR
    const x2 = cx + Math.cos(angle) * spokeLength
    const y2 = cy + Math.sin(angle) * spokeLength
    path += ` M${x1},${y1} L${x2},${y2}`
    path += ` M${x2},${y2 - 3} L${x2 + 3},${y2} L${x2},${y2 + 3}`
  }

  return path
}

export function createAwsStepFunctionsPath(width: number, height: number): string {
  const margin = width * 0.1
  const stepWidth = (width - margin * 2) / 4
  const stepHeight = height * 0.25
  const cy = height / 2

  let path = ''
  for (let i = 0; i < 4; i++) {
    const x = margin + i * stepWidth
    const y = cy - stepHeight / 2
    path += ` M${x + stepWidth * 0.1},${y} L${x + stepWidth * 0.9},${y} L${x + stepWidth * 0.9},${y + stepHeight} L${x + stepWidth * 0.1},${y + stepHeight} Z`
    if (i < 3) {
      path += ` M${x + stepWidth * 0.9},${cy} L${x + stepWidth},${cy}`
      path += ` M${x + stepWidth - 4},${cy - 3} L${x + stepWidth},${cy} L${x + stepWidth - 4},${cy + 3}`
    }
  }

  return path
}

export function createAwsCloudFormationPath(width: number, height: number): string {
  const margin = width * 0.15
  const boxSize = Math.min(width, height) * 0.25
  const offset = boxSize * 0.3

  return `M${margin},${margin + offset} L${margin + boxSize},${margin + offset} L${margin + boxSize},${margin + offset + boxSize} L${margin},${margin + offset + boxSize} Z
    M${margin + offset},${margin} L${margin + offset + boxSize},${margin} L${margin + offset + boxSize},${margin + boxSize} L${margin + offset},${margin + boxSize} Z
    M${margin + offset * 2},${margin - offset} L${margin + offset * 2 + boxSize},${margin - offset} L${margin + offset * 2 + boxSize},${margin - offset + boxSize} L${margin + offset * 2},${margin - offset + boxSize} Z`
}

// ==================== Azure 云服务路径函数 ====================

export function createAzureVnetPath(width: number, height: number): string {
  return createAwsVpcPath(width, height)
}

export function createAzureLoadBalancerPath(width: number, height: number): string {
  return createAwsElbPath(width, height)
}

export function createAzureEventHubPath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2
  const hubR = Math.min(width, height) * 0.2
  const spokeLength = Math.min(width, height) * 0.35

  let path = `M${cx},${cy - hubR}
    A${hubR},${hubR} 0 1,1 ${cx},${cy + hubR}
    A${hubR},${hubR} 0 1,1 ${cx},${cy - hubR}`

  const directions = [
    { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
  ]
  directions.forEach(dir => {
    const x1 = cx + dir.x * hubR
    const y1 = cy + dir.y * hubR
    const x2 = cx + dir.x * spokeLength
    const y2 = cy + dir.y * spokeLength
    path += ` M${x1},${y1} L${x2},${y2}`
  })

  return path
}

export function createAzureServiceBusPath(width: number, height: number): string {
  const margin = width * 0.1
  const busY = height / 2
  const busHeight = height * 0.15
  const nodeCount = 4
  const nodeSpacing = (width - margin * 2) / (nodeCount - 1)

  let path = `M${margin},${busY - busHeight / 2} L${width - margin},${busY - busHeight / 2} L${width - margin},${busY + busHeight / 2} L${margin},${busY + busHeight / 2} Z`

  for (let i = 0; i < nodeCount; i++) {
    const x = margin + i * nodeSpacing
    const nodeR = Math.min(width, height) * 0.08
    path += ` M${x},${busY - nodeR}
      A${nodeR},${nodeR} 0 1,1 ${x},${busY + nodeR}
      A${nodeR},${nodeR} 0 1,1 ${x},${busY - nodeR}`
  }

  return path
}

export function createAzureKeyVaultPath(width: number, height: number): string {
  const cx = width / 2
  const shieldW = width * 0.35
  const shieldH = height * 0.5
  const shieldX = cx - shieldW / 2
  const shieldY = height * 0.15

  let path = `M${cx},${shieldY}
    Q${shieldX + shieldW},${shieldY - shieldH * 0.1} ${shieldX + shieldW},${shieldY + shieldH * 0.3}
    L${shieldX + shieldW},${shieldY + shieldH * 0.7}
    Q${cx},${shieldY + shieldH} ${shieldX},${shieldY + shieldH * 0.7}
    L${shieldX},${shieldY + shieldH * 0.3}
    Q${shieldX},${shieldY - shieldH * 0.1} ${cx},${shieldY}
    M${cx},${shieldY + shieldH * 0.35} L${cx},${shieldY + shieldH * 0.65}
    M${cx - shieldW * 0.1},${shieldY + shieldH * 0.5} L${cx + shieldW * 0.1},${shieldY + shieldH * 0.5}`

  const keyY = height * 0.75
  const keyR = Math.min(width, height) * 0.08
  path += ` M${cx - shieldW * 0.3},${keyY}
    A${keyR},${keyR} 0 1,1 ${cx - shieldW * 0.3 + 0.01},${keyY}
    L${cx + shieldW * 0.3},${keyY}
    L${cx + shieldW * 0.3},${keyY + 3}
    L${cx + shieldW * 0.25},${keyY + 3}
    L${cx + shieldW * 0.25},${keyY - 2}
    L${cx + shieldW * 0.2},${keyY - 2}
    L${cx + shieldW * 0.2},${keyY}`

  return path
}

export function createAzureLogicAppsPath(width: number, height: number): string {
  const margin = width * 0.15
  const puzzleSize = Math.min(width, height) * 0.25
  const gap = puzzleSize * 0.2

  const positions = [
    { x: margin, y: margin },
    { x: margin + puzzleSize + gap, y: margin },
    { x: margin, y: margin + puzzleSize + gap },
    { x: margin + puzzleSize + gap, y: margin + puzzleSize + gap },
  ]

  let path = ''
  positions.forEach((pos, i) => {
    const inset = puzzleSize * 0.15
    if (i === 0) {
      path += ` M${pos.x},${pos.y} L${pos.x + puzzleSize},${pos.y} L${pos.x + puzzleSize},${pos.y + puzzleSize} L${pos.x},${pos.y + puzzleSize} Z`
    } else {
      path += ` M${pos.x + inset},${pos.y} L${pos.x + puzzleSize - inset},${pos.y} L${pos.x + puzzleSize},${pos.y + inset} L${pos.x + puzzleSize},${pos.y + puzzleSize - inset} L${pos.x + puzzleSize - inset},${pos.y + puzzleSize} L${pos.x + inset},${pos.y + puzzleSize} L${pos.x},${pos.y + puzzleSize - inset} L${pos.x},${pos.y + inset} Z`
    }
  })

  return path
}

export function createAzureEventGridPath(width: number, height: number): string {
  const margin = width * 0.1
  const rows = 3
  const cols = 3
  const cellW = (width - margin * 2) / cols
  const cellH = (height - margin * 2) / rows

  let path = ''
  for (let row = 0; row <= rows; row++) {
    const y = margin + row * cellH
    path += ` M${margin},${y} L${width - margin},${y}`
  }
  for (let col = 0; col <= cols; col++) {
    const x = margin + col * cellW
    path += ` M${x},${margin} L${x},${height - margin}`
  }

  return path
}

export function createAzureDevOpsPath(width: number, height: number): string {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) * 0.3

  return `M${cx - r},${cy}
    A${r},${r} 0 1,0 ${cx + r},${cy}
    A${r},${r} 0 1,0 ${cx - r},${cy}
    M${cx - r * 0.5},${cy - r * 0.3}
    L${cx + r * 0.5},${cy + r * 0.3}
    M${cx - r * 0.5},${cy + r * 0.3}
    L${cx + r * 0.5},${cy - r * 0.3}`
}

// ==================== GCP 云服务路径函数 ====================

export function createGcpVpcPath(width: number, height: number): string {
  return createAwsVpcPath(width, height)
}

export function createGcpLoadBalancerPath(width: number, height: number): string {
  return createAwsElbPath(width, height)
}

export function createGcpPubSubPath(width: number, height: number): string {
  const margin = width * 0.1
  const pubW = width * 0.25
  const pubH = height * 0.3
  const subW = width * 0.25
  const subH = height * 0.3
  const arrowSize = Math.min(width, height) * 0.05

  const pubX = margin
  const pubY = height * 0.1
  const subX = width - margin - subW
  const subY = height * 0.6

  return `M${pubX},${pubY} L${pubX + pubW},${pubY} L${pubX + pubW},${pubY + pubH} L${pubX},${pubY + pubH} Z
    M${subX},${subY} L${subX + subW},${subY} L${subX + subW},${subY + subH} L${subX},${subY + subH} Z
    M${pubX + pubW},${pubY + pubH / 2} L${subX},${subY + subH / 2}
    M${subX - arrowSize},${subY + subH / 2 - arrowSize} L${subX},${subY + subH / 2} L${subX - arrowSize},${subY + subH / 2 + arrowSize}
    M${pubX + pubW / 2},${pubY - margin * 0.5} L${pubX + pubW / 2},${pubY}
    M${pubX + pubW / 2 - arrowSize},${pubY - margin * 0.5 + arrowSize} L${pubX + pubW / 2},${pubY - margin * 0.5} L${pubX + pubW / 2 + arrowSize},${pubY - margin * 0.5 + arrowSize}`
}

export function createGcpDataflowPath(width: number, height: number): string {
  const margin = width * 0.1
  const pipeY = height / 2
  const pipeHeight = height * 0.15
  const waveCount = 4
  const waveWidth = (width - margin * 2) / waveCount

  let path = `M${margin},${pipeY - pipeHeight / 2} L${width - margin},${pipeY - pipeHeight / 2} L${width - margin},${pipeY + pipeHeight / 2} L${margin},${pipeY + pipeHeight / 2} Z`

  for (let i = 0; i < waveCount; i++) {
    const x = margin + i * waveWidth + waveWidth / 2
    path += ` M${x},${pipeY - pipeHeight / 2} L${x + waveWidth * 0.3},${pipeY}`
    path += ` M${x},${pipeY + pipeHeight / 2} L${x + waveWidth * 0.3},${pipeY}`
  }

  return path
}

// ==================== 阿里云/腾讯云路径函数 ====================

export function createAliyunVpcPath(width: number, height: number): string {
  return createAwsVpcPath(width, height)
}

export function createAliyunSlbPath(width: number, height: number): string {
  return createAwsElbPath(width, height)
}

export function createAliyunRocketMqPath(width: number, height: number): string {
  const margin = width * 0.1
  const rocketW = width * 0.3
  const rocketH = height * 0.5
  const rocketX = margin
  const rocketY = height * 0.25
  const queueX = width - margin - rocketW

  return `M${rocketX + rocketW * 0.5},${rocketY}
    L${rocketX + rocketW},${rocketY + rocketH * 0.3}
    L${rocketX + rocketW * 0.7},${rocketY + rocketH * 0.3}
    L${rocketX + rocketW * 0.7},${rocketY + rocketH}
    L${rocketX + rocketW * 0.3},${rocketY + rocketH}
    L${rocketX + rocketW * 0.3},${rocketY + rocketH * 0.3}
    L${rocketX},${rocketY + rocketH * 0.3}
    Z
    M${rocketX + rocketW * 0.5},${rocketY - margin * 0.3} L${rocketX + rocketW * 0.5},${rocketY}
    M${queueX},${rocketY} L${queueX + rocketW},${rocketY} L${queueX + rocketW},${rocketY + rocketH} L${queueX},${rocketY + rocketH} Z
    M${queueX + rocketW},${rocketY + rocketH * 0.5} L${queueX + rocketW + margin * 0.5},${rocketY + rocketH * 0.5}`
}

export function createTencentClbPath(width: number, height: number): string {
  return createAwsElbPath(width, height)
}

export function createTencentCmqPath(width: number, height: number): string {
  return createAwsSqsPath(width, height)
}

export function createTencentClsPath(width: number, height: number): string {
  const margin = width * 0.15
  const fileW = width * 0.35
  const fileH = height * 0.6
  const foldSize = fileW * 0.25

  return `M${margin},${margin}
    L${margin + fileW - foldSize},${margin}
    L${margin + fileW},${margin + foldSize}
    L${margin + fileW},${margin + fileH}
    L${margin},${margin + fileH}
    Z
    M${margin + fileW - foldSize},${margin} L${margin + fileW - foldSize},${margin + foldSize} L${margin + fileW},${margin + foldSize}
    M${margin + fileW * 1.3},${margin + fileH * 0.3} L${margin + fileW * 1.6},${margin + fileH * 0.3}
    M${margin + fileW * 1.3},${margin + fileH * 0.5} L${margin + fileW * 1.6},${margin + fileH * 0.5}
    M${margin + fileW * 1.3},${margin + fileH * 0.7} L${margin + fileW * 1.6},${margin + fileH * 0.7}`
}

// ==================== 通用云服务路径函数 ====================

export function createCloudLoadBalancerPath(width: number, height: number): string {
  return createAwsElbPath(width, height)
}

export function createCloudMqPath(width: number, height: number): string {
  return createAwsSqsPath(width, height)
}
