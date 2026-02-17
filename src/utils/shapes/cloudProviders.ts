import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig } from './types'
import {
  createAwsVpcPath,
  createAwsElbPath,
  createAwsSqsPath,
  createAwsSnsPath,
  createAwsIamPath,
  createAwsCloudWatchPath,
  createAwsKinesisPath,
  createAwsEventBridgePath,
  createAwsStepFunctionsPath,
  createAwsCloudFormationPath,
  createAzureVnetPath,
  createAzureLoadBalancerPath,
  createAzureEventHubPath,
  createAzureServiceBusPath,
  createAzureKeyVaultPath,
  createAzureLogicAppsPath,
  createAzureEventGridPath,
  createAzureDevOpsPath,
  createGcpVpcPath,
  createGcpLoadBalancerPath,
  createGcpPubSubPath,
  createGcpDataflowPath,
  createAliyunVpcPath,
  createAliyunSlbPath,
  createAliyunRocketMqPath,
  createTencentClbPath,
  createTencentCmqPath,
  createTencentClsPath,
  createCloudLoadBalancerPath,
  createCloudMqPath,
} from '../shapeMath'

// AWS 云服务图形渲染器
export const renderAwsVpc = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsVpcPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
      },
    },
  })
}

export const renderAwsElb = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsElbPath(config.width, config.height)
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

export const renderAwsSqs = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsSqsPath(config.width, config.height)
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

export const renderAwsSns = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsSnsPath(config.width, config.height)
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

export const renderAwsIam = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsIamPath(config.width, config.height)
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

export const renderAwsCloudWatch = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsCloudWatchPath(config.width, config.height)
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

export const renderAwsKinesis = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsKinesisPath(config.width, config.height)
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

export const renderAwsEventBridge = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsEventBridgePath(config.width, config.height)
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

export const renderAwsStepFunctions = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsStepFunctionsPath(config.width, config.height)
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

export const renderAwsCloudFormation = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAwsCloudFormationPath(config.width, config.height)
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

// Azure 云服务图形渲染器
export const renderAzureVnet = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAzureVnetPath(config.width, config.height)
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

export const renderAzureLoadBalancer = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAzureLoadBalancerPath(config.width, config.height)
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

export const renderAzureEventHub = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAzureEventHubPath(config.width, config.height)
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

export const renderAzureServiceBus = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAzureServiceBusPath(config.width, config.height)
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

export const renderAzureKeyVault = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAzureKeyVaultPath(config.width, config.height)
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

export const renderAzureLogicApps = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAzureLogicAppsPath(config.width, config.height)
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

export const renderAzureEventGrid = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAzureEventGridPath(config.width, config.height)
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

export const renderAzureDevOps = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAzureDevOpsPath(config.width, config.height)
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

// GCP 云服务图形渲染器
export const renderGcpVpc = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createGcpVpcPath(config.width, config.height)
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

export const renderGcpLoadBalancer = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createGcpLoadBalancerPath(config.width, config.height)
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

export const renderGcpPubSub = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createGcpPubSubPath(config.width, config.height)
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

export const renderGcpDataflow = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createGcpDataflowPath(config.width, config.height)
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

// 阿里云图形渲染器
export const renderAliyunVpc = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAliyunVpcPath(config.width, config.height)
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

export const renderAliyunSlb = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAliyunSlbPath(config.width, config.height)
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

export const renderAliyunRocketMq = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createAliyunRocketMqPath(config.width, config.height)
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

// 腾讯云图形渲染器
export const renderTencentClb = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createTencentClbPath(config.width, config.height)
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

export const renderTencentCmq = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createTencentCmqPath(config.width, config.height)
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

export const renderTencentCls = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createTencentClsPath(config.width, config.height)
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

// 通用云服务图形渲染器
export const renderCloudLoadBalancer = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createCloudLoadBalancerPath(config.width, config.height)
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

export const renderCloudMq = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createCloudMqPath(config.width, config.height)
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

// 导出渲染器映射
export const cloudProviderRenderers = {
  // AWS
  'aws-vpc': renderAwsVpc,
  'aws-elb': renderAwsElb,
  'aws-sqs': renderAwsSqs,
  'aws-sns': renderAwsSns,
  'aws-iam': renderAwsIam,
  'aws-cloudwatch': renderAwsCloudWatch,
  'aws-kinesis': renderAwsKinesis,
  'aws-eventbridge': renderAwsEventBridge,
  'aws-stepfunctions': renderAwsStepFunctions,
  'aws-cloudformation': renderAwsCloudFormation,
  // Azure
  'azure-vnet': renderAzureVnet,
  'azure-lb': renderAzureLoadBalancer,
  'azure-eventhub': renderAzureEventHub,
  'azure-servicebus': renderAzureServiceBus,
  'azure-keyvault': renderAzureKeyVault,
  'azure-logicapps': renderAzureLogicApps,
  'azure-eventgrid': renderAzureEventGrid,
  'azure-devops': renderAzureDevOps,
  // GCP
  'gcp-vpc': renderGcpVpc,
  'gcp-lb': renderGcpLoadBalancer,
  'gcp-pubsub': renderGcpPubSub,
  'gcp-dataflow': renderGcpDataflow,
  // 阿里云
  'aliyun-vpc': renderAliyunVpc,
  'aliyun-slb': renderAliyunSlb,
  'aliyun-rocketmq': renderAliyunRocketMq,
  // 腾讯云
  'tencent-clb': renderTencentClb,
  'tencent-cmq': renderTencentCmq,
  'tencent-cls': renderTencentCls,
  // 通用云服务
  'cloud-loadbalancer': renderCloudLoadBalancer,
  'cloud-mq': renderCloudMq,
}
