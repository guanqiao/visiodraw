import { Node } from '@antv/x6'
import { ShapeRenderConfig, ShapeRendererMap, getPortGroups, getPortItems } from './types'
import { baseRenderers } from './base'
import { flowchartRenderers } from './flowchart'
import { umlRenderers } from './uml'
import { erRenderers } from './er'
import { bpmnRenderers } from './bpmn'
import { cloudRenderers } from './cloud'
import { renderDatabase } from './flowchart'
import { cloudProviderRenderers } from './cloudProviders'
import { mermaidRenderers } from './mermaidShapes'
import { globalShapeCache } from '../rendering/ShapeCache'
import { renderLogger, devWarn } from '../logger'

export * from './types'
export * from './base'
export * from './flowchart'
export * from './uml'
export * from './er'
export * from './bpmn'
export * from './cloud'
export * from './cloudProviders'
// 从mermaidShapes选择性导出，避免与base中的renderCircle冲突
export {
  renderStadium,
  renderCylinder,
  renderHexagon as renderMermaidHexagon,
  renderParallelogramLeft,
  renderParallelogramRight,
  renderTrapezoidTop,
  renderTrapezoidBottom,
  renderSubroutine,
  renderDoubleCircle,
  renderAsymmetric,
  renderCircle as renderMermaidCircle,
  renderRhombus,
  mermaidRenderers,
} from './mermaidShapes'

const awsRenderers: ShapeRendererMap = {
  'aws-ec2': cloudRenderers.server,
  'aws-lambda': cloudRenderers.server,
  'aws-ecs': cloudRenderers.server,
  'aws-eks': cloudRenderers.server,
  'aws-s3': renderDatabase,
  'aws-ebs': renderDatabase,
  'aws-rds': renderDatabase,
  'aws-dynamodb': renderDatabase,
  'aws-vpc': cloudProviderRenderers['aws-vpc'],
  'aws-elb': cloudProviderRenderers['aws-elb'],
  'aws-cloudfront': cloudRenderers.cloud,
  'aws-sqs': cloudProviderRenderers['aws-sqs'],
  'aws-sns': cloudProviderRenderers['aws-sns'],
  'aws-iam': cloudProviderRenderers['aws-iam'],
  'aws-cloudwatch': cloudProviderRenderers['aws-cloudwatch'],
  'aws-apigateway': cloudRenderers.cloud,
  'aws-kinesis': cloudProviderRenderers['aws-kinesis'],
  'aws-redshift': renderDatabase,
  'aws-elasticache': renderDatabase,
  'aws-eventbridge': cloudProviderRenderers['aws-eventbridge'],
  'aws-stepfunctions': cloudProviderRenderers['aws-stepfunctions'],
  'aws-codebuild': cloudRenderers.server,
  'aws-cloudformation': cloudProviderRenderers['aws-cloudformation'],
}

const azureRenderers: ShapeRendererMap = {
  'azure-vm': cloudRenderers.server,
  'azure-functions': cloudRenderers.server,
  'azure-appservice': cloudRenderers.server,
  'azure-aks': cloudRenderers.server,
  'azure-storage': renderDatabase,
  'azure-sql': renderDatabase,
  'azure-cosmosdb': renderDatabase,
  'azure-vnet': cloudProviderRenderers['azure-vnet'],
  'azure-lb': cloudProviderRenderers['azure-lb'],
  'azure-cdn': cloudRenderers.cloud,
  'azure-eventhub': cloudProviderRenderers['azure-eventhub'],
  'azure-servicebus': cloudProviderRenderers['azure-servicebus'],
  'azure-keyvault': cloudProviderRenderers['azure-keyvault'],
  'azure-redis': renderDatabase,
  'azure-apim': cloudRenderers.cloud,
  'azure-logicapps': cloudProviderRenderers['azure-logicapps'],
  'azure-eventgrid': cloudProviderRenderers['azure-eventgrid'],
  'azure-devops': cloudProviderRenderers['azure-devops'],
}

const gcpRenderers: ShapeRendererMap = {
  'gcp-compute': cloudRenderers.server,
  'gcp-functions': cloudRenderers.server,
  'gcp-gke': cloudRenderers.server,
  'gcp-storage': renderDatabase,
  'gcp-cloudsql': renderDatabase,
  'gcp-firestore': renderDatabase,
  'gcp-vpc': cloudProviderRenderers['gcp-vpc'],
  'gcp-lb': cloudProviderRenderers['gcp-lb'],
  'gcp-bigquery': renderDatabase,
  'gcp-pubsub': cloudProviderRenderers['gcp-pubsub'],
  'gcp-cloudrun': cloudRenderers.server,
  'gcp-apigee': cloudRenderers.cloud,
  'gcp-dataflow': cloudProviderRenderers['gcp-dataflow'],
  'gcp-cloudbuild': cloudRenderers.server,
}

const aliyunRenderers: ShapeRendererMap = {
  'aliyun-ecs': cloudRenderers.server,
  'aliyun-oss': renderDatabase,
  'aliyun-rds': renderDatabase,
  'aliyun-slb': cloudProviderRenderers['aliyun-slb'],
  'aliyun-vpc': cloudProviderRenderers['aliyun-vpc'],
  'aliyun-ack': cloudRenderers.server,
  'aliyun-rocketmq': cloudProviderRenderers['aliyun-rocketmq'],
  'aliyun-cdn': cloudRenderers.cloud,
  'aliyun-apigateway': cloudRenderers.cloud,
}

const tencentRenderers: ShapeRendererMap = {
  'tencent-cvm': cloudRenderers.server,
  'tencent-cos': renderDatabase,
  'tencent-cdb': renderDatabase,
  'tencent-clb': cloudProviderRenderers['tencent-clb'],
  'tencent-tke': cloudRenderers.server,
  'tencent-cmq': cloudProviderRenderers['tencent-cmq'],
  'tencent-apigateway': cloudRenderers.cloud,
  'tencent-cls': cloudProviderRenderers['tencent-cls'],
}

const genericCloudRenderers: ShapeRendererMap = {
  'cloud-generic': cloudRenderers.cloud,
  'cloud-server': cloudRenderers.server,
  'cloud-database': renderDatabase,
  'cloud-loadbalancer': cloudProviderRenderers['cloud-loadbalancer'],
  'cloud-firewall': cloudRenderers.firewall,
  'cloud-cdn': cloudRenderers.cloud,
  'cloud-api-gateway': cloudRenderers.cloud,
  'cloud-mq': cloudProviderRenderers['cloud-mq'],
}

export const shapeRenderers: ShapeRendererMap = {
  ...baseRenderers,
  ...flowchartRenderers,
  ...umlRenderers,
  ...erRenderers,
  ...bpmnRenderers,
  ...cloudRenderers,
  ...awsRenderers,
  ...azureRenderers,
  ...gcpRenderers,
  ...aliyunRenderers,
  ...tencentRenderers,
  ...genericCloudRenderers,
  ...mermaidRenderers,
}

export const renderShape = (type: string, config: ShapeRenderConfig): Node => {
  const renderer = shapeRenderers[type]
  const configWithType = { ...config, shapeType: type }

  if (!renderer) {
    devWarn(`[renderShape] 未找到渲染器: ${type}，使用默认矩形`)
    return baseRenderers.rectangle(configWithType)
  }

  try {
    const cachedNode = globalShapeCache.get(type, config)
    if (cachedNode) {
      const clonedNode = cachedNode.clone() as Node
      clonedNode.setPosition(config.x, config.y)
      ;(clonedNode as any).id = config.id
      if (config.text) {
        clonedNode.attr('label/text', config.text)
      }
      
      clonedNode.setPorts({
        groups: getPortGroups(),
        items: getPortItems(),
      })
      
      clonedNode.setData({ fromStore: true, shapeType: type })
      renderLogger.debug(`从缓存克隆: ${type}, id: ${config.id}`)
      return clonedNode
    }

    const node = renderer(configWithType)
    node.setData({ fromStore: true, shapeType: type })

    const cacheConfig = { ...config }
    delete (cacheConfig as any).id
    delete (cacheConfig as any).x
    delete (cacheConfig as any).y
    delete (cacheConfig as any).text
    globalShapeCache.set(type, cacheConfig, node)

    renderLogger.debug(`成功渲染: ${type}, id: ${config.id}`)
    return node
  } catch (error) {
    renderLogger.error(`渲染失败: ${type}, id: ${config.id}`, error)
    return baseRenderers.rectangle(configWithType)
  }
}

export default renderShape
