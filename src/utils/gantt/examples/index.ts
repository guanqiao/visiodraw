/**
 * 甘特图示例模块
 * 提供各种业务场景的甘特图示例
 */

import { simpleExample } from './simple.example'
import { softwareExample } from './software.example'
import { milestoneExample } from './milestone.example'
import { agileExample } from './agile.example'
import { criticalExample } from './critical.example'
import { constructionExample } from './construction.example'
import { productLaunchExample } from './productLaunch.example'
import { researchExample } from './research.example'

/**
 * 示例定义接口
 */
export interface GanttExample {
  /** 示例唯一标识 */
  id: string
  /** 示例名称 */
  name: string
  /** 示例描述 */
  description: string
  /** 示例标签 */
  tags: string[]
  /** Mermaid代码 */
  code: string
}

/**
 * 所有示例列表
 */
export const ganttExamples: GanttExample[] = [
  simpleExample,
  softwareExample,
  milestoneExample,
  agileExample,
  criticalExample,
  constructionExample,
  productLaunchExample,
  researchExample,
]

/**
 * 根据ID获取示例
 * @param id 示例ID
 * @returns 示例定义或undefined
 */
export function getExampleById(id: string): GanttExample | undefined {
  return ganttExamples.find(example => example.id === id)
}

/**
 * 根据标签筛选示例
 * @param tag 标签名称
 * @returns 示例列表
 */
export function getExamplesByTag(tag: string): GanttExample[] {
  return ganttExamples.filter(example => example.tags.includes(tag))
}

/**
 * 获取所有示例ID列表
 * @returns ID列表
 */
export function getExampleIds(): string[] {
  return ganttExamples.map(example => example.id)
}

/**
 * 获取所有标签列表
 * @returns 去重后的标签列表
 */
export function getAllTags(): string[] {
  const tagsSet = new Set<string>()
  ganttExamples.forEach(example => {
    example.tags.forEach(tag => tagsSet.add(tag))
  })
  return Array.from(tagsSet)
}

// 导出单个示例
export {
  simpleExample,
  softwareExample,
  milestoneExample,
  agileExample,
  criticalExample,
  constructionExample,
  productLaunchExample,
  researchExample,
}

// 默认导出
export default ganttExamples
