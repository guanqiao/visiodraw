/**
 * Excel 文件解析器
 * 支持导入Excel数据并生成组织结构图
 */

import * as XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'

export interface ExcelRow {
  [key: string]: string | number | boolean | null
}

export interface OrgData {
  id: string
  name: string
  title: string
  department: string
  managerId: string | null
  level: number
}

/**
 * 解析Excel文件
 * @param arrayBuffer Excel文件的ArrayBuffer
 * @returns 解析后的数据
 */
export async function parseExcel(arrayBuffer: ArrayBuffer): Promise<ExcelRow[]> {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  
  // 获取第一个工作表
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  
  // 转换为JSON
  const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1 })
  
  // 第一行作为表头
  if (data.length < 2) {
    return []
  }
  
  const headers = data[0] as unknown as string[]
  const rows: ExcelRow[] = []
  
  for (let i = 1; i < data.length; i++) {
    const row: ExcelRow = {}
    const rowData = data[i] as unknown as (string | number | boolean | null)[]
    
    headers.forEach((header, index) => {
      row[header] = rowData[index] ?? null
    })
    
    rows.push(row)
  }
  
  return rows
}

/**
 * 从Excel数据生成组织结构数据
 * 期望的列：姓名、职位、部门、上级
 */
export function convertToOrgData(rows: ExcelRow[]): OrgData[] {
  const orgData: OrgData[] = []
  const nameToId = new Map<string, string>()
  
  // 第一遍：创建所有节点
  rows.forEach((row, index) => {
    const name = String(row['姓名'] || row['name'] || row['Name'] || '')
    const title = String(row['职位'] || row['title'] || row['Title'] || '')
    const department = String(row['部门'] || row['department'] || row['Department'] || '')
    
    if (!name) return
    
    const id = `org-${index}`
    nameToId.set(name, id)
    
    orgData.push({
      id,
      name,
      title,
      department,
      managerId: null,
      level: 0,
    })
  })
  
  // 第二遍：建立层级关系
  orgData.forEach((node) => {
    const row = rows.find((r) => {
      const name = String(r['姓名'] || r['name'] || r['Name'] || '')
      return name === node.name
    })
    
    if (row) {
      const managerName = String(row['上级'] || row['manager'] || row['Manager'] || row['上级领导'] || '')
      if (managerName && nameToId.has(managerName)) {
        node.managerId = nameToId.get(managerName)!
      }
    }
  })
  
  // 计算层级
  const calculateLevel = (node: OrgData, visited: Set<string> = new Set()): number => {
    if (visited.has(node.id)) return 0 // 防止循环
    if (!node.managerId) return 0
    
    visited.add(node.id)
    const manager = orgData.find((n) => n.id === node.managerId)
    if (!manager) return 0
    
    return calculateLevel(manager, visited) + 1
  }
  
  orgData.forEach((node) => {
    node.level = calculateLevel(node)
  })
  
  return orgData
}

/**
 * 生成组织结构图的形状数据
 */
export function generateOrgChartShapes(orgData: OrgData[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapes: any[] = []
  const levelWidth = 200
  const nodeHeight = 80
  const levelHeight = 150

  // 按层级分组
  const levelGroups = new Map<number, OrgData[]>()
  orgData.forEach((node) => {
    if (!levelGroups.has(node.level)) {
      levelGroups.set(node.level, [])
    }
    levelGroups.get(node.level)!.push(node)
  })

  // 计算每层的节点位置
  const levelCounts = new Map<number, number>()

  orgData.forEach((node) => {
    const count = levelCounts.get(node.level) || 0
    levelCounts.set(node.level, count + 1)

    const x = 100 + count * levelWidth
    const y = 100 + node.level * levelHeight

    shapes.push({
      id: uuidv4(),
      type: 'rectangle',
      x,
      y,
      width: 180,
      height: nodeHeight,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      text: `${node.name}\n${node.title}`,
      orgData: node,
    })
  })

  return shapes
}

/**
 * 检测文件是否为Excel格式
 */
export function isExcelFormat(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'xlsx' || ext === 'xls' || ext === 'csv'
}

/**
 * 读取Excel文件为ArrayBuffer
 */
export function readExcelFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result)
      } else {
        reject(new Error('读取Excel文件失败'))
      }
    }
    reader.onerror = () => reject(new Error('读取Excel文件失败'))
    reader.readAsArrayBuffer(file)
  })
}
