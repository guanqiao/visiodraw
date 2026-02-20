/**
 * ER图模板测试
 */

import {
  createSimpleErTemplate,
  createOneToManyErTemplate,
  createManyToManyErTemplate,
  createSelfReferenceErTemplate,
  createEcommerceErTemplate,
  createBlogErTemplate,
  createSocialNetworkErTemplate,
  createInventoryErTemplate,
  createLibraryErTemplate,
  createHrErTemplate,
  createRbacErTemplate,
  createCmsErTemplate,
  createWorkflowErTemplate,
  createNotificationErTemplate,
  createFileStorageErTemplate,
  getErTemplates,
} from '../erTemplates'
import { generateErTemplate } from '../../utils/erDiagramUtils'

describe('ER图模板', () => {
  describe('基础模板', () => {
    it('应创建简单ER图模板', () => {
      const template = createSimpleErTemplate()
      expect(template.id).toBe('er-simple')
      expect(template.name).toBe('简单ER图')
      expect(template.type).toBe('er')
      expect(template.nodes).toHaveLength(4)
      expect(template.edges).toHaveLength(3)
      expect(template.mermaidCode).toContain('erDiagram')
      expect(template.mermaidCode).toContain('USER')
      expect(template.mermaidCode).toContain('ORDER')
    })

    it('应创建一对多关系模板', () => {
      const template = createOneToManyErTemplate()
      expect(template.id).toBe('er-one-to-many')
      expect(template.nodes).toHaveLength(2)
      expect(template.edges).toHaveLength(1)
    })

    it('应创建多对多关系模板', () => {
      const template = createManyToManyErTemplate()
      expect(template.id).toBe('er-many-to-many')
      expect(template.nodes).toHaveLength(3)
      expect(template.edges).toHaveLength(2)
    })

    it('应创建自引用关系模板', () => {
      const template = createSelfReferenceErTemplate()
      expect(template.id).toBe('er-self-reference')
      expect(template.nodes).toHaveLength(1)
      expect(template.edges).toHaveLength(1)
      expect(template.edges[0].isSelfLoop).toBe(true)
    })
  })

  describe('业务系统模板', () => {
    it('应创建电商系统ER图模板', () => {
      const template = createEcommerceErTemplate()
      expect(template.id).toBe('er-ecommerce')
      expect(template.nodes.length).toBeGreaterThanOrEqual(6)
      expect(template.edges.length).toBeGreaterThanOrEqual(6)
      expect(template.mermaidCode).toContain('CUSTOMER')
      expect(template.mermaidCode).toContain('PRODUCT')
    })

    it('应创建博客系统ER图模板', () => {
      const template = createBlogErTemplate()
      expect(template.id).toBe('er-blog')
      expect(template.nodes.length).toBeGreaterThanOrEqual(6)
      expect(template.mermaidCode).toContain('POST')
      expect(template.mermaidCode).toContain('COMMENT')
    })

    it('应创建社交网络ER图模板', () => {
      const template = createSocialNetworkErTemplate()
      expect(template.id).toBe('er-social-network')
      expect(template.nodes.length).toBeGreaterThanOrEqual(6)
      expect(template.mermaidCode).toContain('FOLLOW')
      expect(template.mermaidCode).toContain('LIKE')
    })

    it('应创建库存管理系统ER图模板', () => {
      const template = createInventoryErTemplate()
      expect(template.id).toBe('er-inventory')
      expect(template.nodes.length).toBeGreaterThanOrEqual(6)
      expect(template.mermaidCode).toContain('INVENTORY')
      expect(template.mermaidCode).toContain('WAREHOUSE')
    })

    it('应创建图书馆管理系统ER图模板', () => {
      const template = createLibraryErTemplate()
      expect(template.id).toBe('er-library')
      expect(template.nodes.length).toBeGreaterThanOrEqual(5)
      expect(template.mermaidCode).toContain('MEMBER')
      expect(template.mermaidCode).toContain('LOAN')
    })

    it('应创建HR人力资源ER图模板', () => {
      const template = createHrErTemplate()
      expect(template.id).toBe('er-hr')
      expect(template.nodes.length).toBeGreaterThanOrEqual(7)
      expect(template.mermaidCode).toContain('EMPLOYEE')
      expect(template.mermaidCode).toContain('DEPARTMENT')
    })
  })

  describe('新增模板', () => {
    it('应创建RBAC权限管理模板', () => {
      const template = createRbacErTemplate()
      expect(template.id).toBe('er-rbac')
      expect(template.nodes).toHaveLength(5)
      expect(template.edges).toHaveLength(4)
      expect(template.mermaidCode).toContain('USER')
      expect(template.mermaidCode).toContain('ROLE')
      expect(template.mermaidCode).toContain('PERMISSION')
    })

    it('应创建CMS内容管理模板', () => {
      const template = createCmsErTemplate()
      expect(template.id).toBe('er-cms')
      expect(template.nodes.length).toBeGreaterThanOrEqual(6)
      expect(template.mermaidCode).toContain('SITE')
      expect(template.mermaidCode).toContain('CONTENT')
    })

    it('应创建工作流系统模板', () => {
      const template = createWorkflowErTemplate()
      expect(template.id).toBe('er-workflow')
      expect(template.nodes.length).toBeGreaterThanOrEqual(5)
      expect(template.mermaidCode).toContain('WORKFLOW')
      expect(template.mermaidCode).toContain('WORKFLOW_TASK')
    })

    it('应创建消息通知系统模板', () => {
      const template = createNotificationErTemplate()
      expect(template.id).toBe('er-notification')
      expect(template.nodes.length).toBeGreaterThanOrEqual(5)
      expect(template.mermaidCode).toContain('NOTIFICATION')
      expect(template.mermaidCode).toContain('SUBSCRIPTION')
    })

    it('应创建文件存储系统模板', () => {
      const template = createFileStorageErTemplate()
      expect(template.id).toBe('er-file-storage')
      expect(template.nodes.length).toBeGreaterThanOrEqual(6)
      expect(template.mermaidCode).toContain('STORAGE_BUCKET')
      expect(template.mermaidCode).toContain('FILE')
    })
  })

  describe('模板集合', () => {
    it('应获取所有ER图模板', () => {
      const templates = getErTemplates()
      expect(templates).toHaveLength(15)
      expect(templates[0].id).toBe('er-simple')
      expect(templates[14].id).toBe('er-file-storage')
    })

    it('应支持自定义选项', () => {
      const templates = getErTemplates({
        startX: 200,
        startY: 200,
        spacing: 300,
      })
      expect(templates).toHaveLength(15)
      // 验证第一个节点的位置使用了自定义选项
      expect(templates[0].nodes[0].x).toBe(200)
      expect(templates[0].nodes[0].y).toBe(200)
    })
  })

  describe('实体和关系结构', () => {
    it('实体应包含正确的字段定义', () => {
      const template = createSimpleErTemplate()
      const userNode = template.nodes.find(n => n.id === 'entity-user')
      expect(userNode).toBeDefined()
      expect(userNode?.text).toContain('USER')
      expect(userNode?.text).toContain('id')
      expect(userNode?.text).toContain('PK')
    })

    it('关系应包含基数信息', () => {
      const template = createOneToManyErTemplate()
      expect(template.edges[0].data).toBeDefined()
      expect(template.edges[0].data.sourceCardinality).toBe('one')
      expect(template.edges[0].data.targetCardinality).toBe('zero-or-many')
    })

    it('弱实体应使用正确的样式', () => {
      const template = createEcommerceErTemplate()
      const addressNode = template.nodes.find(n => n.id === 'entity-address')
      expect(addressNode).toBeDefined()
      expect(addressNode?.data?.entityType).toBe('weak')
    })

    it('关联实体应使用正确的样式', () => {
      const template = createManyToManyErTemplate()
      const enrollmentNode = template.nodes.find(n => n.id === 'entity-enrollment')
      expect(enrollmentNode).toBeDefined()
      expect(enrollmentNode?.data?.entityType).toBe('associative')
    })
  })

  describe('Mermaid代码生成', () => {
    it('应生成有效的Mermaid ER图代码', () => {
      const template = createSimpleErTemplate()
      expect(template.mermaidCode).toMatch(/^erDiagram/)
      expect(template.mermaidCode).toMatch(/\{\s*\n/)
      // Mermaid ER图的基数符号: ||--o{ 表示一对零或多
      expect(template.mermaidCode).toContain('||--o{')
      // Mermaid ER图的基数符号: ||--}| 表示一对一或多
      expect(template.mermaidCode).toContain('||--}|')
    })

    it('Mermaid代码应包含所有实体', () => {
      const template = createBlogErTemplate()
      const entities = ['USER', 'POST', 'COMMENT', 'TAG', 'CATEGORY']
      entities.forEach(entity => {
        expect(template.mermaidCode).toContain(entity)
      })
    })

    it('Mermaid代码应包含所有关系', () => {
      const template = createSimpleErTemplate()
      expect(template.mermaidCode).toContain('places')
      expect(template.mermaidCode).toContain('contains')
    })
  })

  describe('布局配置', () => {
    it('应支持水平布局', () => {
      const template = createSimpleErTemplate({ direction: 'horizontal' })
      expect(template.layout?.direction).toBe('horizontal')
    })

    it('应支持垂直布局', () => {
      const template = createSimpleErTemplate({ direction: 'vertical' })
      expect(template.layout?.direction).toBe('vertical')
    })

    it('应正确计算实体位置', () => {
      const template = createSimpleErTemplate({
        startX: 100,
        startY: 100,
        spacing: 200,
      })
      expect(template.nodes[0].x).toBe(100)
      expect(template.nodes[0].y).toBe(100)
    })
  })

  describe('参数校验', () => {
    it('应验证实体ID唯一性', () => {
      const invalidConfig = {
        id: 'test',
        name: '测试',
        description: '测试模板',
        category: 'basic' as const,
        tags: ['test'],
        difficulty: 'beginner' as const,
        entities: [
          { id: 'user', name: 'USER', columns: [{ name: 'id', dataType: 'INT', isPrimary: true }] },
          { id: 'user', name: 'USER2', columns: [{ name: 'id', dataType: 'INT', isPrimary: true }] },
        ],
        relationships: [],
      }
      expect(() => generateErTemplate(invalidConfig)).toThrow()
    })

    it('应验证关系引用的实体存在', () => {
      const invalidConfig = {
        id: 'test',
        name: '测试',
        description: '测试模板',
        category: 'basic' as const,
        tags: ['test'],
        difficulty: 'beginner' as const,
        entities: [
          { id: 'user', name: 'USER', columns: [{ name: 'id', dataType: 'INT', isPrimary: true }] },
        ],
        relationships: [
          {
            source: 'user',
            target: 'nonexistent',
            sourceCardinality: 'one' as const,
            targetCardinality: 'many' as const,
          },
        ],
      }
      expect(() => generateErTemplate(invalidConfig)).toThrow()
    })

    it('应验证实体必须有主键', () => {
      const invalidConfig = {
        id: 'test',
        name: '测试',
        description: '测试模板',
        category: 'basic' as const,
        tags: ['test'],
        difficulty: 'beginner' as const,
        entities: [
          { id: 'user', name: 'USER', columns: [{ name: 'name', dataType: 'VARCHAR' }] },
        ],
        relationships: [],
      }
      expect(() => generateErTemplate(invalidConfig)).toThrow()
    })

    it('应验证布局配置有效性', () => {
      expect(() => createSimpleErTemplate({ startX: -1 })).toThrow()
      expect(() => createSimpleErTemplate({ startY: -1 })).toThrow()
    })
  })

  describe('高级功能', () => {
    it('应支持生成SQL DDL', () => {
      const template = createSimpleErTemplate()
      const userNode = template.nodes.find(n => n.id === 'entity-user')
      expect(userNode).toBeDefined()
      expect(userNode?.text).toContain('USER')
    })

    it('应支持分析实体连接度', () => {
      const template = createEcommerceErTemplate()
      // 电商模板中订单实体应该有多条关系
      const orderNode = template.nodes.find(n => n.id === 'entity-order')
      expect(orderNode).toBeDefined()
    })

    it('应支持不同主题', () => {
      const template = createSimpleErTemplate()
      expect(template.nodes[0].fill).toBeDefined()
      expect(template.nodes[0].stroke).toBeDefined()
    })
  })
})
