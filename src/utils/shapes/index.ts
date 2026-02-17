import { Node } from '@antv/x6'
import { ShapeRenderConfig, ShapeRendererMap } from './types'
import { baseRenderers } from './base'
import { flowchartRenderers } from './flowchart'
import { umlRenderers } from './uml'
import { erRenderers } from './er'
import { bpmnRenderers } from './bpmn'
import { cloudRenderers } from './cloud'
import { renderDatabase } from './flowchart'
import { globalShapeCache } from '../rendering/ShapeCache'

export * from './types'
export * from './base'
export * from './flowchart'
export * from './uml'
export * from './er'
export * from './bpmn'
export * from './cloud'

const awsRenderers: ShapeRendererMap = {
  'aws-ec2': cloudRenderers.server,
  'aws-lambda': cloudRenderers.server,
  'aws-ecs': cloudRenderers.server,
  'aws-eks': cloudRenderers.server,
  'aws-s3': renderDatabase,
  'aws-ebs': renderDatabase,
  'aws-rds': renderDatabase,
  'aws-dynamodb': renderDatabase,
  'aws-vpc': baseRenderers.rectangle,
  'aws-elb': baseRenderers.rectangle,
  'aws-cloudfront': cloudRenderers.cloud,
  'aws-sqs': baseRenderers.rectangle,
  'aws-sns': baseRenderers.rectangle,
  'aws-iam': baseRenderers.rectangle,
  'aws-cloudwatch': baseRenderers.rectangle,
  'aws-apigateway': cloudRenderers.cloud,
  'aws-kinesis': baseRenderers.rectangle,
  'aws-redshift': renderDatabase,
  'aws-elasticache': renderDatabase,
  'aws-eventbridge': baseRenderers.rectangle,
  'aws-stepfunctions': baseRenderers.rectangle,
  'aws-codebuild': cloudRenderers.server,
  'aws-cloudformation': baseRenderers.rectangle,
}

const azureRenderers: ShapeRendererMap = {
  'azure-vm': cloudRenderers.server,
  'azure-functions': cloudRenderers.server,
  'azure-appservice': cloudRenderers.server,
  'azure-aks': cloudRenderers.server,
  'azure-storage': renderDatabase,
  'azure-sql': renderDatabase,
  'azure-cosmosdb': renderDatabase,
  'azure-vnet': baseRenderers.rectangle,
  'azure-lb': baseRenderers.rectangle,
  'azure-cdn': cloudRenderers.cloud,
  'azure-eventhub': baseRenderers.rectangle,
  'azure-servicebus': baseRenderers.rectangle,
  'azure-keyvault': baseRenderers.rectangle,
  'azure-redis': renderDatabase,
  'azure-apim': cloudRenderers.cloud,
  'azure-logicapps': baseRenderers.rectangle,
  'azure-eventgrid': baseRenderers.rectangle,
  'azure-devops': baseRenderers.rectangle,
}

const gcpRenderers: ShapeRendererMap = {
  'gcp-compute': cloudRenderers.server,
  'gcp-functions': cloudRenderers.server,
  'gcp-gke': cloudRenderers.server,
  'gcp-storage': renderDatabase,
  'gcp-cloudsql': renderDatabase,
  'gcp-firestore': renderDatabase,
  'gcp-vpc': baseRenderers.rectangle,
  'gcp-lb': baseRenderers.rectangle,
  'gcp-bigquery': renderDatabase,
  'gcp-pubsub': baseRenderers.rectangle,
  'gcp-cloudrun': cloudRenderers.server,
  'gcp-apigee': cloudRenderers.cloud,
  'gcp-dataflow': baseRenderers.rectangle,
  'gcp-cloudbuild': cloudRenderers.server,
}

const aliyunRenderers: ShapeRendererMap = {
  'aliyun-ecs': cloudRenderers.server,
  'aliyun-oss': renderDatabase,
  'aliyun-rds': renderDatabase,
  'aliyun-slb': baseRenderers.rectangle,
  'aliyun-vpc': baseRenderers.rectangle,
  'aliyun-ack': cloudRenderers.server,
  'aliyun-rocketmq': baseRenderers.rectangle,
  'aliyun-cdn': cloudRenderers.cloud,
  'aliyun-apigateway': cloudRenderers.cloud,
}

const tencentRenderers: ShapeRendererMap = {
  'tencent-cvm': cloudRenderers.server,
  'tencent-cos': renderDatabase,
  'tencent-cdb': renderDatabase,
  'tencent-clb': baseRenderers.rectangle,
  'tencent-tke': cloudRenderers.server,
  'tencent-cmq': baseRenderers.rectangle,
  'tencent-apigateway': cloudRenderers.cloud,
  'tencent-cls': baseRenderers.rectangle,
}

const genericCloudRenderers: ShapeRendererMap = {
  'cloud-generic': cloudRenderers.cloud,
  'cloud-server': cloudRenderers.server,
  'cloud-database': renderDatabase,
  'cloud-loadbalancer': baseRenderers.rectangle,
  'cloud-firewall': baseRenderers.rectangle,
  'cloud-cdn': cloudRenderers.cloud,
  'cloud-api-gateway': cloudRenderers.cloud,
  'cloud-mq': baseRenderers.rectangle,
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
}

export const renderShape = (type: string, config: ShapeRenderConfig): Node => {
  const renderer = shapeRenderers[type]
  const configWithType = { ...config, shapeType: type }

  if (!renderer) {
    console.warn(`[renderShape] 未找到渲染器: ${type}，使用默认矩形`)
    return baseRenderers.rectangle(configWithType)
  }

  try {
    const cachedNode = globalShapeCache.get(type, config)
    if (cachedNode) {
      cachedNode.setPosition(config.x, config.y)
      ;(cachedNode as any).id = config.id
      if (config.text) {
        cachedNode.attr('label/text', config.text)
      }
      cachedNode.setData({ fromStore: true, shapeType: type })
      console.log(`[renderShape] 从缓存克隆: ${type}, id: ${config.id}`)
      return cachedNode
    }

    const node = renderer(configWithType)
    node.setData({ fromStore: true, shapeType: type })
    
    const cacheConfig = { ...config }
    delete (cacheConfig as any).id
    delete (cacheConfig as any).x
    delete (cacheConfig as any).y
    delete (cacheConfig as any).text
    globalShapeCache.set(type, cacheConfig, node)
    
    console.log(`[renderShape] 成功渲染: ${type}, id: ${config.id}`)
    return node
  } catch (error) {
    console.error(`[renderShape] 渲染失败: ${type}, id: ${config.id}`, error)
    return baseRenderers.rectangle(configWithType)
  }
}

export default renderShape
