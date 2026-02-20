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
 * 博客系统ER图模板
 */
export function createBlogErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('user', 'er-table-entity-with-columns', 'USER\nid int PK\nusername string\nemail string\npassword string', 0, options),
    createTemplateNode('post', 'er-table-entity-with-columns', 'POST\nid int PK\nauthor_id int FK\ntitle string\ncontent text\nstatus string', 1, options),
    createTemplateNode('comment', 'er-table-entity-with-columns', 'COMMENT\nid int PK\npost_id int FK\nuser_id int FK\ncontent text', 2, options),
    createTemplateNode('tag', 'er-table-entity-with-columns', 'TAG\nid int PK\nname string', 3, options),
    createTemplateNode('postTag', 'er-table-entity-with-columns', 'POST_TAG\npost_id int PK\ntag_id int PK', 4, options),
    createTemplateNode('category', 'er-table-entity-with-columns', 'CATEGORY\nid int PK\nname string\nslug string', 5, options),
  ]

  const edges = [
    createTemplateEdge('user', 'post', 'writes', 0),
    createTemplateEdge('post', 'comment', 'has', 1),
    createTemplateEdge('user', 'comment', 'writes', 2),
    createTemplateEdge('post', 'postTag', 'tagged_with', 3),
    createTemplateEdge('tag', 'postTag', 'used_in', 4),
    createTemplateEdge('category', 'post', 'contains', 5),
  ]

  return {
    id: 'er-blog',
    name: '博客系统ER图',
    description: '博客文章、评论、标签系统',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    USER ||--o{ POST : writes
    USER ||--o{ COMMENT : writes
    POST ||--o{ COMMENT : has
    POST }o--o{ TAG : tagged_with
    CATEGORY ||--o{ POST : contains`,
  }
}

/**
 * 社交网络ER图模板
 */
export function createSocialNetworkErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('user', 'er-table-entity-with-columns', 'USER\nid int PK\nusername string\nemail string\nbio text', 0, options),
    createTemplateNode('post', 'er-table-entity-with-columns', 'POST\nid int PK\nuser_id int FK\ncontent text\ncreated_at timestamp', 1, options),
    createTemplateNode('like', 'er-table-entity-with-columns', 'LIKE\nid int PK\nuser_id int FK\npost_id int FK', 2, options),
    createTemplateNode('follow', 'er-table-entity-with-columns', 'FOLLOW\nfollower_id int PK\nfollowing_id int PK\ncreated_at timestamp', 3, options),
    createTemplateNode('message', 'er-table-entity-with-columns', 'MESSAGE\nid int PK\nsender_id int FK\nreceiver_id int FK\ncontent text', 4, options),
    createTemplateNode('notification', 'er-table-entity-with-columns', 'NOTIFICATION\nid int PK\nuser_id int FK\ntype string\nread boolean', 5, options),
  ]

  const edges = [
    createTemplateEdge('user', 'post', 'creates', 0),
    createTemplateEdge('user', 'like', 'gives', 1),
    createTemplateEdge('post', 'like', 'receives', 2),
    {
      ...createTemplateEdge('user', 'user', 'follows', 3),
      isSelfLoop: true,
      selfLoopConfig: { direction: 'right', radius: 50 },
    },
    createTemplateEdge('user', 'message', 'sends', 4),
    createTemplateEdge('user', 'notification', 'receives', 5),
  ]

  return {
    id: 'er-social-network',
    name: '社交网络ER图',
    description: '用户、帖子、关注、消息系统',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ LIKE : gives
    USER }o--o{ USER : follows
    USER ||--o{ MESSAGE : sends
    USER ||--o{ NOTIFICATION : receives`,
  }
}

/**
 * 库存管理系统ER图模板
 */
export function createInventoryErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('product', 'er-table-entity-with-columns', 'PRODUCT\nid int PK\nsku string\nname string\nprice decimal', 0, options),
    createTemplateNode('warehouse', 'er-table-entity-with-columns', 'WAREHOUSE\nid int PK\nname string\nlocation string', 1, options),
    createTemplateNode('inventory', 'er-table-entity-with-columns', 'INVENTORY\nid int PK\nproduct_id int FK\nwarehouse_id int FK\nquantity int', 2, options),
    createTemplateNode('supplier', 'er-table-entity-with-columns', 'SUPPLIER\nid int PK\nname string\ncontact string', 3, options),
    createTemplateNode('purchase', 'er-table-entity-with-columns', 'PURCHASE\nid int PK\nsupplier_id int FK\ntotal decimal\nstatus string', 4, options),
    createTemplateNode('purchaseItem', 'er-table-entity-with-columns', 'PURCHASE_ITEM\nid int PK\npurchase_id int FK\nproduct_id int FK\nqty int', 5, options),
  ]

  const edges = [
    createTemplateEdge('product', 'inventory', 'stored_in', 0),
    createTemplateEdge('warehouse', 'inventory', 'contains', 1),
    createTemplateEdge('supplier', 'purchase', 'supplies', 2),
    createTemplateEdge('purchase', 'purchaseItem', 'includes', 3),
    createTemplateEdge('product', 'purchaseItem', 'ordered', 4),
  ]

  return {
    id: 'er-inventory',
    name: '库存管理系统ER图',
    description: '产品、仓库、供应商、采购系统',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    PRODUCT ||--o{ INVENTORY : stored_in
    WAREHOUSE ||--o{ INVENTORY : contains
    SUPPLIER ||--o{ PURCHASE : supplies
    PURCHASE ||--|{ PURCHASE_ITEM : includes
    PRODUCT ||--o{ PURCHASE_ITEM : ordered`,
  }
}

/**
 * 图书馆管理系统ER图模板
 */
export function createLibraryErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('member', 'er-table-entity-with-columns', 'MEMBER\nid int PK\nname string\nemail string\nphone string', 0, options),
    createTemplateNode('book', 'er-table-entity-with-columns', 'BOOK\nid int PK\nisbn string\ntitle string\nauthor string', 1, options),
    createTemplateNode('loan', 'er-table-entity-with-columns', 'LOAN\nid int PK\nmember_id int FK\nbook_id int FK\nborrow_date date', 2, options),
    createTemplateNode('reservation', 'er-table-entity-with-columns', 'RESERVATION\nid int PK\nmember_id int FK\nbook_id int FK\nstatus string', 3, options),
    createTemplateNode('fine', 'er-table-entity-with-columns', 'FINE\nid int PK\nloan_id int FK\namount decimal\npaid boolean', 4, options),
  ]

  const edges = [
    createTemplateEdge('member', 'loan', 'borrows', 0),
    createTemplateEdge('book', 'loan', 'lent_to', 1),
    createTemplateEdge('member', 'reservation', 'reserves', 2),
    createTemplateEdge('book', 'reservation', 'reserved_by', 3),
    createTemplateEdge('loan', 'fine', 'incurs', 4),
  ]

  return {
    id: 'er-library',
    name: '图书馆管理系统ER图',
    description: '图书、借阅、预约、罚款系统',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    MEMBER ||--o{ LOAN : borrows
    BOOK ||--o{ LOAN : lent_to
    MEMBER ||--o{ RESERVATION : reserves
    BOOK ||--o{ RESERVATION : reserved_by
    LOAN ||--o| FINE : incurs`,
  }
}

/**
 * HR人力资源管理系统ER图模板
 */
export function createHrErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('employee', 'er-table-entity-with-columns', 'EMPLOYEE\nid int PK\nname string\ndept_id int FK\nmanager_id int FK', 0, options),
    createTemplateNode('department', 'er-table-entity-with-columns', 'DEPARTMENT\nid int PK\nname string\nbudget decimal', 1, options),
    createTemplateNode('position', 'er-table-entity-with-columns', 'POSITION\nid int PK\ntitle string\nlevel int', 2, options),
    createTemplateNode('salary', 'er-table-entity-with-columns', 'SALARY\nid int PK\nemployee_id int FK\namount decimal\neffective_date date', 3, options),
    createTemplateNode('attendance', 'er-table-entity-with-columns', 'ATTENDANCE\nid int PK\nemployee_id int FK\ndate date\nstatus string', 4, options),
    createTemplateNode('leave', 'er-table-entity-with-columns', 'LEAVE\nid int PK\nemployee_id int FK\ntype string\nstart_date date', 5, options),
  ]

  const edges = [
    createTemplateEdge('department', 'employee', 'employs', 0),
    {
      ...createTemplateEdge('employee', 'employee', 'manages', 1),
      isSelfLoop: true,
      selfLoopConfig: { direction: 'top', radius: 40 },
    },
    createTemplateEdge('employee', 'position', 'holds', 2),
    createTemplateEdge('employee', 'salary', 'earns', 3),
    createTemplateEdge('employee', 'attendance', 'records', 4),
    createTemplateEdge('employee', 'leave', 'requests', 5),
  ]

  return {
    id: 'er-hr',
    name: 'HR人力资源ER图',
    description: '员工、部门、薪资、考勤系统',
    type: 'er',
    nodes,
    edges,
    mermaidCode: `erDiagram
    DEPARTMENT ||--o{ EMPLOYEE : employs
    EMPLOYEE ||--o{ EMPLOYEE : manages
    EMPLOYEE ||--o{ SALARY : earns
    EMPLOYEE ||--o{ ATTENDANCE : records
    EMPLOYEE ||--o{ LEAVE : requests`,
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
    createBlogErTemplate(options),
    createSocialNetworkErTemplate(options),
    createInventoryErTemplate(options),
    createLibraryErTemplate(options),
    createHrErTemplate(options),
  ]
}
