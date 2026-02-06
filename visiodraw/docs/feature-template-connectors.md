# 模板连接线功能文档

**版本**: v1.5.0  
**更新日期**: 2026-02-07  
**功能名称**: Template Connectors (模板连接线)

---

## 功能描述

模板连接线功能允许模板中包含预定义的连接线，当用户加载模板时，图形之间的连接线会自动渲染。这使得流程图、组织结构图等模板更加完整和实用。

### 主要特性

1. **模板预定义连接线**: 模板可以包含连接线和图形的关系定义
2. **多种线型支持**: 支持直线、正交线（直角线）、曲线三种线型
3. **端点样式**: 支持无、箭头、圆点、菱形四种端点样式
4. **自动渲染**: 加载模板时自动渲染连接线
5. **标签支持**: 连接线可以包含文本标签（如"是"/"否"）

---

## 使用方法

### 1. 加载带连接线的模板

在模板面板中选择流程图模板，连接线会自动显示并连接各个图形。

### 2. 支持的线型

| 线型 | 说明 | 适用场景 |
|-----|------|---------|
| `straight` | 直线 | 简单连接 |
| `orthogonal` | 正交线（直角） | 流程图、组织架构 |
| `curved` | 曲线（贝塞尔） | 柔和连接效果 |

### 3. 支持的端点样式

| 样式 | 说明 | 适用场景 |
|-----|------|---------|
| `none` | 无端点 | 简单线条 |
| `arrow` | 箭头 | 表示流向 |
| `dot` | 圆点 | 标记点 |
| `diamond` | 菱形 | 特殊标记 |

---

## 技术实现

### 文件结构

```
src/
├── templates/
│   ├── types.ts              # 模板类型定义（已扩展）
│   └── builtInTemplates.ts   # 内置模板（已添加连接线）
├── utils/
│   └── connectorRenderer.ts  # 连接线渲染工具（新建）
├── components/
│   └── Canvas.tsx            # 画布组件（已扩展）
└── docs/
    └── feature-template-connectors.md  # 本文档
```

### 模板数据结构

```typescript
interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  thumbnail?: string
  shapes: Shape[]
  connectors?: Connector[]  // 新增：连接线数组
  version: string
  createdAt: string
  updatedAt: string
  isBuiltIn: boolean
}

interface Connector {
  id: string              // 唯一标识
  sourceShapeId: string   // 源图形ID
  sourcePointId: string   // 源连接点ID
  targetShapeId: string   // 目标图形ID
  targetPointId: string   // 目标连接点ID
  style: 'straight' | 'orthogonal' | 'curved'  // 线型
  startStyle: 'none' | 'arrow' | 'dot' | 'diamond'  // 起点样式
  endStyle: 'none' | 'arrow' | 'dot' | 'diamond'    // 终点样式
  stroke: string          // 线条颜色
  strokeWidth: number     // 线条宽度
  label?: string          // 文本标签
}
```

### 主要函数

- `createConnectorObjects()`: 根据Connector数据创建Fabric.js对象
- `calculateStraightPath()`: 计算直线路径
- `calculateOrthogonalPath()`: 计算正交线路径
- `calculateCurvedPath()`: 计算曲线路径
- `createArrowPath()`: 创建箭头端点
- `createDotPath()`: 创建圆点端点
- `createDiamondPath()`: 创建菱形端点

---

## 内置模板示例

### 简单流程图

包含7条连接线：
1. 开始 → 输入数据
2. 输入数据 → 处理数据
3. 处理数据 → 判断
4. 判断 → 显示错误（否分支，红色）
5. 判断 → 输出结果（是分支，绿色）
6. 显示错误 → 输出结果
7. 输出结果 → 结束

---

## 注意事项

1. **ID对应关系**: 连接线中的`sourceShapeId`和`targetShapeId`必须与模板中图形的ID对应
2. **连接点ID**: 可以使用预定义的位置名称（`top`, `bottom`, `left`, `right`）或具体的连接点ID
3. **性能考虑**: 大量连接线时，正交线和曲线的计算开销较大
4. **颜色配置**: 建议根据业务含义设置不同颜色（如错误流程用红色）

---

## 限制条件

1. 目前连接线不支持交互编辑（拖拽调整）
2. 连接线不会随图形移动自动更新（需要重新加载模板）
3. 复杂路径的正交线算法有待优化

---

## 后续计划

- [ ] 支持连接线交互编辑
- [ ] 连接线随图形移动自动更新
- [ ] 更多线型支持（如虚线、双线等）
- [ ] 连接线动画效果

---

## 更新日志

### v1.5.0 (2026-02-07)
- 初始版本发布
- 实现模板连接线功能
- 支持三种线型（直线、正交线、曲线）
- 支持四种端点样式
- 简单流程图模板添加7条连接线
