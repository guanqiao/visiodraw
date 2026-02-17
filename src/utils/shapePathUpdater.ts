import { Node } from '@antv/x6'
import {
  createCylinderPath,
  createDocumentPath,
  createParallelogramPoints,
  createTrapezoidPoints,
  createArrowPath,
  createServerPath,
  createCloudPath,
  createRouterPath,
  createSwitchPath,
  createFirewallPath,
  createDesktopPath,
  createLaptopPath,
  createWifiPath,
  createGlobePath,
  createUmlActorPath,
  createUmlClassPath,
  createUmlPackagePath,
  createUmlComponentPath,
  createUmlNodePath,
  createUmlNotePath,
  createBpmnEventPath,
  createBpmnGatewayPath,
  createBpmnActivityPath,
  createBpmnPoolPath,
  createBpmnLanePath,
  createErTableEntityPath,
  calculatePolygonPoints,
  calculateStarPoints,
  calculateCrossPoints,
} from './shapeMath'

type PathGenerator = (width: number, height: number) => string
type PolygonGenerator = (width: number, height: number) => string

const createFullServerPath = (w: number, h: number): string => {
  const path = createServerPath(w, h)
  const dotR = Math.min(w, h) * 0.03
  const dotX = w * 0.15
  const dotY1 = h * 0.18
  const dotY2 = h * 0.5
  const dotY3 = h * 0.82
  return `${path}
    M${dotX - dotR},${dotY1} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY1} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY1}
    M${dotX - dotR},${dotY2} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY2} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY2}
    M${dotX - dotR},${dotY3} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY3} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY3}`
}

const createFullRouterPath = (w: number, h: number): string => {
  return createRouterPath(w, h)
}

const createFullSwitchPath = (w: number, h: number): string => {
  return createSwitchPath(w, h)
}

const pathGenerators: Record<string, PathGenerator> = {
  database: (w, h) => createCylinderPath(w, h, 0.15),
  document: (w, h) => createDocumentPath(w, h, 0.12, 2),
  'off-page': (w, h) => createArrowPath(w, h, 0.3),
  server: createFullServerPath,
  cloud: createCloudPath,
  router: createFullRouterPath,
  switch: createFullSwitchPath,
  firewall: createFirewallPath,
  desktop: createDesktopPath,
  laptop: createLaptopPath,
  wifi: createWifiPath,
  globe: createGlobePath,
  'uml-actor': createUmlActorPath,
  'uml-class': createUmlClassPath,
  'uml-package': createUmlPackagePath,
  'uml-component': createUmlComponentPath,
  'uml-node': createUmlNodePath,
  'uml-note': createUmlNotePath,
  'bpmn-start-event': (w, h) => createBpmnEventPath(w, h, 'start'),
  'bpmn-end-event': (w, h) => createBpmnEventPath(w, h, 'end'),
  'bpmn-intermediate-event': (w, h) => createBpmnEventPath(w, h, 'intermediate'),
  'bpmn-exclusive-gateway': createBpmnGatewayPath,
  'bpmn-parallel-gateway': createBpmnGatewayPath,
  'bpmn-inclusive-gateway': createBpmnGatewayPath,
  'bpmn-task': createBpmnActivityPath,
  'bpmn-pool': createBpmnPoolPath,
  'bpmn-lane': createBpmnLanePath,
  'er-table-entity': createErTableEntityPath,
  'er-weak-entity': (w, h) => {
    const margin = Math.min(w, h) * 0.08
    const innerW = w - margin * 2
    const innerH = h - margin * 2
    return `M0,0 L${w},0 L${w},${h} L0,${h} Z M${margin},${margin} L${margin + innerW},${margin} L${margin + innerW},${margin + innerH} L${margin},${margin + innerH} Z`
  },
  'er-weak-relationship': (w, h) => {
    const cx = w / 2
    const cy = h / 2
    const outerR = Math.min(w, h) / 2
    const innerR = outerR * 0.75
    return `M${cx},0 L${w},${cy} L${cx},${h} L0,${cy} Z M${cx},${outerR - innerR} L${cx + innerR},${cy} L${cx},${cy + innerR} L${cx - innerR},${cy} Z`
  },
  'database-server': (w, h) => {
    const base = createCylinderPath(w, h, 0.15)
    const lineY1 = h * 0.35
    const lineY2 = h * 0.5
    const lineY3 = h * 0.65
    return `${base} M${w * 0.2},${lineY1} L${w * 0.8},${lineY1} M${w * 0.2},${lineY2} L${w * 0.8},${lineY2} M${w * 0.2},${lineY3} L${w * 0.8},${lineY3}`
  },
}

const polygonGenerators: Record<string, PolygonGenerator> = {
  decision: (w, h) => calculatePolygonPoints(4, w, h),
  'input-output': (w, h) => createParallelogramPoints(w, h, 0.2),
  'manual-input': (w, h) => createTrapezoidPoints(w, h, 0.7),
  display: (w, h) => {
    const skew = w * 0.15
    return `${skew},0 ${w},0 ${w - skew},${h} 0,${h}`
  },
  triangle: (w, h) => calculatePolygonPoints(3, w, h),
  diamond: (w, h) => calculatePolygonPoints(4, w, h),
  pentagon: (w, h) => calculatePolygonPoints(5, w, h),
  hexagon: (w, h) => calculatePolygonPoints(6, w, h, 0),
  star: (w, h) => {
    const cx = w / 2
    const cy = h / 2
    const outerR = Math.min(w, h) / 2
    const innerR = outerR * 0.4
    return calculateStarPoints(outerR, innerR, 5, cx, cy)
  },
  cross: calculateCrossPoints,
}

const shapeTypeToPathType: Record<string, string> = {
  'aws-ec2': 'server',
  'aws-lambda': 'server',
  'aws-ecs': 'server',
  'aws-eks': 'server',
  'aws-s3': 'database',
  'aws-ebs': 'database',
  'aws-rds': 'database',
  'aws-dynamodb': 'database',
  'aws-cloudfront': 'cloud',
  'aws-apigateway': 'cloud',
  'aws-redshift': 'database',
  'aws-elasticache': 'database',
  'aws-codebuild': 'server',

  'azure-vm': 'server',
  'azure-functions': 'server',
  'azure-appservice': 'server',
  'azure-aks': 'server',
  'azure-storage': 'database',
  'azure-sql': 'database',
  'azure-cosmosdb': 'database',
  'azure-cdn': 'cloud',
  'azure-redis': 'database',
  'azure-apim': 'cloud',
  'azure-devops': 'server',

  'gcp-compute': 'server',
  'gcp-functions': 'server',
  'gcp-gke': 'server',
  'gcp-storage': 'database',
  'gcp-cloudsql': 'database',
  'gcp-firestore': 'database',
  'gcp-bigquery': 'database',
  'gcp-cloudrun': 'server',
  'gcp-apigee': 'cloud',
  'gcp-cloudbuild': 'server',

  'aliyun-ecs': 'server',
  'aliyun-oss': 'database',
  'aliyun-rds': 'database',
  'aliyun-ack': 'server',
  'aliyun-cdn': 'cloud',
  'aliyun-apigateway': 'cloud',

  'tencent-cvm': 'server',
  'tencent-cos': 'database',
  'tencent-cdb': 'database',
  'tencent-tke': 'server',
  'tencent-apigateway': 'cloud',

  'cloud-generic': 'cloud',
  'cloud-server': 'server',
  'cloud-database': 'database',
  'cloud-cdn': 'cloud',
  'cloud-api-gateway': 'cloud',
}

function getPathType(shapeType: string): string | null {
  if (pathGenerators[shapeType]) return shapeType
  if (polygonGenerators[shapeType]) return shapeType
  return shapeTypeToPathType[shapeType] || null
}

export function updateNodePathOnResize(node: Node): void {
  const nodeData = node.getData() as { shapeType?: string } | undefined
  const shapeType = nodeData?.shapeType || ''
  const size = node.size()
  const width = size.width
  const height = size.height

  const pathType = getPathType(shapeType)
  if (!pathType) return

  if (pathGenerators[pathType]) {
    const newPath = pathGenerators[pathType](width, height)
    node.attr('body/d', newPath)
    return
  }

  if (polygonGenerators[pathType]) {
    const newPoints = polygonGenerators[pathType](width, height)
    node.attr('body/refPoints', newPoints)
    return
  }
}

export function needsPathUpdate(node: Node): boolean {
  const nodeData = node.getData() as { shapeType?: string } | undefined
  const shapeType = nodeData?.shapeType || ''
  return getPathType(shapeType) !== null
}

export const pathGeneratorList = Object.keys(pathGenerators)
export const polygonGeneratorList = Object.keys(polygonGenerators)
