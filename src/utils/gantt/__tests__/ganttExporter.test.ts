/**
 * 甘特图导入导出器单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GanttExporter } from '../ganttExporter'
import type { ParsedGanttDiagram, GanttTask, GanttSection } from '../../ganttDiagramGenerator'

describe('GanttExporter', () => {
  let exporter: GanttExporter

  beforeEach(() => {
    exporter = new GanttExporter()
  })

  // 创建测试数据
  const createTestData = (): ParsedGanttDiagram => ({
    title: '测试项目',
    dateFormat: 'YYYY-MM-DD',
    sections: [
      { id: 's1', name: '第一阶段', order: 0 },
      { id: 's2', name: '第二阶段', order: 1 },
    ] as GanttSection[],
    tasks: [
      {
        id: 't1',
        name: '任务1',
        type: 'task',
        status: 'default',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-06'),
        duration: 5,
        dependencies: [],
        order: 0,
        sectionId: 's1',
      },
      {
        id: 't2',
        name: '任务2',
        type: 'task',
        status: 'active',
        startDate: new Date('2024-01-06'),
        endDate: new Date('2024-01-11'),
        duration: 5,
        dependencies: ['t1'],
        order: 1,
        sectionId: 's1',
      },
      {
        id: 't3',
        name: '任务3',
        type: 'task',
        status: 'done',
        startDate: new Date('2024-01-11'),
        endDate: new Date('2024-01-16'),
        duration: 5,
        dependencies: ['t2'],
        order: 2,
        sectionId: 's2',
      },
    ] as GanttTask[],
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-16'),
  })

  describe('Excel/CSV 导出', () => {
    it('应该正确导出为 CSV 格式', () => {
      const data = createTestData()
      const csv = exporter.exportToExcel(data)

      expect(csv).toContain('任务ID,任务名称,分组,开始日期,结束日期,持续时间,状态,依赖任务,进度')
      expect(csv).toContain('t1')
      expect(csv).toContain('任务1')
      expect(csv).toContain('第一阶段')
    })

    it('导出的 CSV 应该包含所有任务', () => {
      const data = createTestData()
      const csv = exporter.exportToExcel(data)
      const lines = csv.split('\n')

      // 表头 + 3个任务 = 4行
      expect(lines.length).toBe(4)
    })

    it('应该正确翻译状态', () => {
      const data = createTestData()
      const csv = exporter.exportToExcel(data)

      expect(csv).toContain('未开始')
      expect(csv).toContain('进行中')
      expect(csv).toContain('已完成')
    })
  })

  describe('Excel/CSV 导入', () => {
    it('应该正确从 CSV 导入', () => {
      const csvContent = `任务ID,任务名称,分组,开始日期,结束日期,持续时间,状态,依赖任务,进度
"t1","任务1","第一阶段","2024-01-01","2024-01-06",5,"未开始","",0
"t2","任务2","第一阶段","2024-01-06","2024-01-11",5,"进行中","t1",50
"t3","任务3","第二阶段","2024-01-11","2024-01-16",5,"已完成","t2",100`

      const result = exporter.importFromExcel(csvContent)

      expect(result.tasks).toHaveLength(3)
      expect(result.sections).toHaveLength(2)
      expect(result.tasks?.[0].name).toBe('任务1')
      expect(result.tasks?.[0].status).toBe('default')
    })

    it('应该正确解析依赖关系', () => {
      const csvContent = `任务ID,任务名称,分组,开始日期,结束日期,持续时间,状态,依赖任务,进度
"t1","任务1","第一阶段","2024-01-01","2024-01-06",5,"未开始","",0
"t2","任务2","第一阶段","2024-01-06","2024-01-11",5,"进行中","t1",50`

      const result = exporter.importFromExcel(csvContent)

      expect(result.tasks?.[0].dependencies).toEqual([])
      expect(result.tasks?.[1].dependencies).toEqual(['t1'])
    })

    it('空 CSV 应该抛出错误', () => {
      expect(() => exporter.importFromExcel('')).toThrow('CSV文件格式错误')
    })

    it('只有表头的 CSV 应该抛出错误', () => {
      expect(() => exporter.importFromExcel('任务ID,任务名称')).toThrow('CSV文件格式错误')
    })
  })

  describe('JSON 导出导入', () => {
    it('应该正确导出为 JSON', () => {
      const data = createTestData()
      const json = exporter.exportToJSON(data)

      const parsed = JSON.parse(json)
      expect(parsed.title).toBe('测试项目')
      expect(parsed.tasks).toHaveLength(3)
    })

    it('应该正确从 JSON 导入', () => {
      const data = createTestData()
      const json = exporter.exportToJSON(data)

      const imported = exporter.importFromJSON(json)
      expect(imported.title).toBe('测试项目')
      expect(imported.tasks).toHaveLength(3)
      expect(imported.tasks[0].startDate instanceof Date).toBe(true)
    })
  })

  describe('MS Project XML 导出', () => {
    it('应该正确导出为 MS Project XML 格式', () => {
      const data = createTestData()
      const xml = exporter.exportToMSProjectXML(data)

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
      expect(xml).toContain('<Project')
      expect(xml).toContain('<Name>测试项目</Name>')
      expect(xml).toContain('<Tasks>')
      expect(xml).toContain('<Task>')
      expect(xml).toContain('<Name>任务1</Name>')
    })

    it('XML 应该包含正确的任务信息', () => {
      const data = createTestData()
      const xml = exporter.exportToMSProjectXML(data)

      expect(xml).toContain('<UID>1</UID>')
      expect(xml).toContain('<Duration>5 days</Duration>')
      expect(xml).toContain('<PercentComplete>0</PercentComplete>')
      expect(xml).toContain('<PercentComplete>50</PercentComplete>')
      expect(xml).toContain('<PercentComplete>100</PercentComplete>')
    })

    it('应该正确转义 XML 特殊字符', () => {
      const data = createTestData()
      data.tasks[0].name = '任务<测试>&"\''
      const xml = exporter.exportToMSProjectXML(data)

      expect(xml).toContain('任务&lt;测试&gt;&amp;&quot;&apos;')
    })
  })

  describe('项目报告生成', () => {
    it('应该生成正确的项目报告', () => {
      const data = createTestData()
      const report = exporter.generateReport(data)

      expect(report).toContain('# 项目报告')
      expect(report).toContain('项目名称: 测试项目')
      expect(report).toContain('总任务数: 3')
      expect(report).toContain('已完成: 1')
      expect(report).toContain('进行中: 1')
      expect(report).toContain('未开始: 1')
    })

    it('报告应该包含分组信息', () => {
      const data = createTestData()
      const report = exporter.generateReport(data)

      expect(report).toContain('## 分组信息')
      expect(report).toContain('第一阶段: 2 个任务')
      expect(report).toContain('第二阶段: 1 个任务')
    })

    it('报告应该处理无标题的情况', () => {
      const data = createTestData()
      data.title = undefined
      const report = exporter.generateReport(data)

      expect(report).toContain('项目名称: 未命名项目')
    })
  })

  describe('文件下载', () => {
    it('应该调用下载方法', () => {
      const createElementSpy = vi.spyOn(document, 'createElement')
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      exporter.downloadFile('test content', 'test.txt', 'text/plain')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })
})
