/**
 * 甘特图验证器
 * 提供全面的甘特图数据验证功能
 */

import type { ValidationResult, ValidationError, ValidationRule } from './types'
import type { ParsedGanttDiagram } from '../parser/types'
import { validateDependencies, dependencyRule } from './rules/dependencyRule'
import { validateDateConflicts, dateConflictRule } from './rules/dateConflictRule'

/**
 * 内置验证规则列表
 */
const builtInRules: ValidationRule[] = [dependencyRule, dateConflictRule]

/**
 * 甘特图验证器类
 */
export class GanttValidator {
  private rules: ValidationRule[] = [...builtInRules]

  /**
   * 添加自定义验证规则
   * @param rule 验证规则
   */
  addRule(rule: ValidationRule): void {
    this.rules.push(rule)
  }

  /**
   * 移除验证规则
   * @param ruleName 规则名称
   */
  removeRule(ruleName: string): void {
    this.rules = this.rules.filter(r => r.name !== ruleName)
  }

  /**
   * 验证甘特图数据
   * @param data 解析后的甘特图数据
   * @returns 验证结果
   */
  validate(data: ParsedGanttDiagram | null): ValidationResult {
    if (!data) {
      return {
        valid: false,
        errors: [
          {
            type: 'parse-error',
            severity: 'error',
            message: '无法解析甘特图数据',
          },
        ],
        warnings: [],
        infos: [],
      }
    }

    const allErrors: ValidationError[] = []

    // 执行所有验证规则
    for (const rule of this.rules) {
      try {
        const errors = rule.validate(data)
        allErrors.push(...errors)
      } catch (error) {
        allErrors.push({
          type: 'validation-error',
          severity: 'error',
          message: `验证规则 "${rule.name}" 执行失败: ${error}`,
        })
      }
    }

    // 按严重级别分类
    const errors = allErrors.filter(e => e.severity === 'error')
    const warnings = allErrors.filter(e => e.severity === 'warning')
    const infos = allErrors.filter(e => e.severity === 'info')

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos,
    }
  }

  /**
   * 快速验证（只返回是否有效）
   * @param data 解析后的甘特图数据
   * @returns 是否有效
   */
  isValid(data: ParsedGanttDiagram | null): boolean {
    if (!data) return false

    for (const rule of this.rules) {
      const errors = rule.validate(data)
      if (errors.some(e => e.severity === 'error')) {
        return false
      }
    }

    return true
  }

  /**
   * 获取所有验证规则
   * @returns 验证规则列表
   */
  getRules(): ValidationRule[] {
    return [...this.rules]
  }

  /**
   * 重置为默认规则
   */
  resetRules(): void {
    this.rules = [...builtInRules]
  }
}

/**
 * 验证甘特图数据（便捷函数）
 * @param data 解析后的甘特图数据
 * @returns 验证结果
 */
export function validateGanttData(data: ParsedGanttDiagram | null): ValidationResult {
  const validator = new GanttValidator()
  return validator.validate(data)
}

/**
 * 快速验证（便捷函数）
 * @param data 解析后的甘特图数据
 * @returns 是否有效
 */
export function isValidGanttData(data: ParsedGanttDiagram | null): boolean {
  if (!data) return false
  const validator = new GanttValidator()
  return validator.isValid(data)
}

// 导出默认实例
export const ganttValidator = new GanttValidator()
export default ganttValidator
