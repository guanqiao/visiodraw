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

export function createUmlClassPath(width: number, height: number): string {
  const headerHeight = height * 0.25
  const divider1Y = headerHeight
  const divider2Y = height * 0.55

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
