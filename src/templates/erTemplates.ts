/**
 * ER图模板
 * 对标 Mermaid erDiagram
 */

import type { DiagramTemplate, TemplateGenerateOptions } from '../types/diagramTemplate'
import { createTemplateNode, createTemplateEdge } from '../utils/diagramTemplateBuilder'

/**
 * 简单ER图模板
 * 用户-订单-商品关系
 */
export function createSimpleErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('user', 'er-table-entity-with-columns', 'USER\nid int PK\nname string\nemail string', 0, options),
    createTemplateNode('order', 'er-table-entity-with-columns', 'ORDER\nid int PK\nuser_id int FK\ntotal decimal', 1, options),
    createTemplateNode('product', 'er-table-entity-with-columns', 'PRODUCT\nid int PK\nname string\nprice decimal', 2, options),
  ]

  const edges = [
    createTemplateEdge('user', 'order', 'places', 0),
    createTemplateEdge('order', 'product', 'contains', 1),
  ]

  return {
    id: 'er-simple',
    name: '简单ER图',
    description: '用户-订单-商品关系',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : included_in`,
  }
}

/**
 * 一对多关系模板
 */
export function createOneToManyErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('department', 'er-table-entity-with-columns', 'DEPARTMENT\nid int PK\nname string', 0, options),
    createTemplateNode('employee', 'er-table-entity-with-columns', 'EMPLOYEE\nid int PK\ndept_id int FK\nname string', 1, options),
  ]

  const edges = [
    createTemplateEdge('department', 'employee', 'employs', 0),
  ]

  return {
    id: 'er-one-to-many',
    name: '一对多关系',
    description: '部门与员工的一对多关系',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    DEPARTMENT ||--o{ EMPLOYEE : employs`,
  }
}

/**
 * 多对多关系模板
 */
export function createManyToManyErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('student', 'er-table-entity-with-columns', 'STUDENT\nid int PK\nname string', 0, options),
    createTemplateNode('enrollment', 'er-table-entity-with-columns', 'ENROLLMENT\nstudent_id int PK\ncourse_id int PK', 1, options),
    createTemplateNode('course', 'er-table-entity-with-columns', 'COURSE\nid int PK\ntitle string', 2, options),
  ]

  const edges = [
    createTemplateEdge('student', 'enrollment', 'enrolls', 0),
    createTemplateEdge('course', 'enrollment', 'has', 1),
  ]

  return {
    id: 'er-many-to-many',
    name: '多对多关系',
    description: '学生与课程的多对多关系',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    STUDENT }o--o{ COURSE : enrolls`,
  }
}

/**
 * 自引用关系模板
 */
export function createSelfReferenceErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('employee', 'er-table-entity-with-columns', 'EMPLOYEE\nid int PK\nmanager_id int FK\nname string', 0, options),
  ]

  const edges = [
    {
      ...createTemplateEdge('employee', 'employee', 'manages', 0),
      // 自引用边配置
      isSelfLoop: true,
      selfLoopConfig: {
        direction: 'top',
        radius: 40,
      },
    },
  ]

  return {
    id: 'er-self-reference',
    name: '自引用关系',
    description: '员工的上下级关系',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    EMPLOYEE ||--o{ EMPLOYEE : manages`,
  }
}

/**
 * 电商系统ER图模板
 */
export function createEcommerceErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('customer', 'er-table-entity-with-columns', 'CUSTOMER\nid int PK\nname string\nemail string', 0, options),
    createTemplateNode('order', 'er-table-entity-with-columns', 'ORDER\nid int PK\ncustomer_id int FK\nstatus string', 1, options),
    createTemplateNode('orderItem', 'er-table-entity-with-columns', 'ORDER_ITEM\nid int PK\norder_id int FK\nproduct_id int FK', 2, options),
    createTemplateNode('product', 'er-table-entity-with-columns', 'PRODUCT\nid int PK\nname string\nprice decimal', 3, options),
    createTemplateNode('category', 'er-table-entity-with-columns', 'CATEGORY\nid int PK\nname string', 4, options),
  ]

  const edges = [
    createTemplateEdge('customer', 'order', 'places', 0),
    createTemplateEdge('order', 'orderItem', 'contains', 1),
    createTemplateEdge('product', 'orderItem', 'included_in', 2),
    createTemplateEdge('category', 'product', 'categorizes', 3),
  ]

  return {
    id: 'er-ecommerce',
    name: '电商系统ER图',
    description: '完整的电商系统数据模型',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : included_in
    CATEGORY ||--o{ PRODUCT : categorizes`,
  }
}

/**
 * 获取所有ER图模板
 */
export function getErTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleErTemplate(options),
    createOneToManyErTemplate(options),
    createManyToManyErTemplate(options),
    createSelfReferenceErTemplate(options),
    createEcommerceErTemplate(options),
  ]
}
