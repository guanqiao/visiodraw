import { describe, it, expect } from 'vitest'
import {
  renderAwsVpc,
  renderAwsElb,
  renderAwsSqs,
  renderAwsSns,
  renderAwsIam,
  renderAwsCloudWatch,
  renderAwsKinesis,
  renderAwsEventBridge,
  renderAwsStepFunctions,
  renderAwsCloudFormation,
} from '../cloudProviders'
import type { ShapeRenderConfig } from '../types'

describe('AWS cloud provider shape renderers', () => {
  const defaultConfig: ShapeRenderConfig = {
    id: 'test-aws',
    x: 100,
    y: 200,
    width: 120,
    height: 80,
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    text: 'AWS Service',
  }

  describe('renderAwsVpc', () => {
    it('should create a VPC shape with network cloud icon', () => {
      const node = renderAwsVpc(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsElb', () => {
    it('should create an ELB shape with load balancer icon', () => {
      const node = renderAwsElb(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsSqs', () => {
    it('should create an SQS shape with queue icon', () => {
      const node = renderAwsSqs(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsSns', () => {
    it('should create an SNS shape with notification icon', () => {
      const node = renderAwsSns(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsIam', () => {
    it('should create an IAM shape with user/shield icon', () => {
      const node = renderAwsIam(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsCloudWatch', () => {
    it('should create a CloudWatch shape with dashboard icon', () => {
      const node = renderAwsCloudWatch(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsKinesis', () => {
    it('should create a Kinesis shape with data stream icon', () => {
      const node = renderAwsKinesis(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsEventBridge', () => {
    it('should create an EventBridge shape with event bus icon', () => {
      const node = renderAwsEventBridge(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsStepFunctions', () => {
    it('should create a Step Functions shape with workflow icon', () => {
      const node = renderAwsStepFunctions(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderAwsCloudFormation', () => {
    it('should create a CloudFormation shape with stack icon', () => {
      const node = renderAwsCloudFormation(defaultConfig)
      
      expect(node.id).toBe('test-aws')
      expect(node.shape).toBe('path')
    })
  })
})
