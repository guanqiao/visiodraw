/**
 * 模板系统类型定义
 * @version 1.5.0
 * @date 2026-02-07
 */

import { Shape } from '@stores/canvasStore'
import { Connector } from '../types/connection'

export type TemplateCategory = 'flowchart' | 'org' | 'network' | 'uml' | 'custom'

export interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  thumbnail?: string
  shapes: Shape[]
  connectors?: Connector[]
  version: string
  createdAt: string
  updatedAt: string
  isBuiltIn: boolean
}

export interface TemplateCategoryInfo {
  key: TemplateCategory
  name: string
  icon: string
  description: string
}

export const TEMPLATE_CATEGORIES: TemplateCategoryInfo[] = [
  {
    key: 'flowchart',
    name: '流程图',
    icon: 'PartitionOutlined',
    description: '业务流程、算法流程、工作流程等',
  },
  {
    key: 'org',
    name: '组织结构图',
    icon: 'TeamOutlined',
    description: '公司组织架构、团队结构等',
  },
  {
    key: 'network',
    name: '网络拓扑图',
    icon: 'ApartmentOutlined',
    description: '网络架构、系统拓扑等',
  },
  {
    key: 'uml',
    name: 'UML图',
    icon: 'BranchesOutlined',
    description: '类图、时序图、用例图等',
  },
  {
    key: 'custom',
    name: '自定义模板',
    icon: 'FileAddOutlined',
    description: '用户自定义保存的模板',
  },
]
