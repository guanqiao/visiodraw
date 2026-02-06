# 任务6.2: 智能连接线 - 开发计划

**版本**: v1.4.0  
**更新日期**: 2026-02-07  
**优先级**: 高  
**预计时间**: 5天

---

## 任务描述

实现多种样式的智能连接线，支持动态调整。包括直线、直角线、曲线三种样式，连接线随图形移动自动更新，支持箭头样式和文本标签。

---

## 任务依赖

- 任务6.1: 连接点系统（已完成）

---

## 详细设计

### 1. 连接线样式

```typescript
type ConnectorStyle = 'straight' | 'orthogonal' | 'curved';
type ConnectorEndStyle = 'none' | 'arrow' | 'dot' | 'diamond';
```

### 2. 连接线数据结构

```typescript
interface Connector {
  id: string;
  sourceShapeId: string;      // 源图形ID
  sourcePointId: string;      // 源连接点ID
  targetShapeId: string;      // 目标图形ID
  targetPointId: string;      // 目标连接点ID
  style: ConnectorStyle;      // 连接线样式
  startStyle: ConnectorEndStyle;  // 起点样式
  endStyle: ConnectorEndStyle;    // 终点样式
  stroke: string;             // 线条颜色
  strokeWidth: number;        // 线条宽度
  label?: string;             // 文本标签
  pathPoints?: { x: number; y: number }[];  // 路径点
}
```

### 3. 连接线绘制算法

#### 直线 (Straight)
- 直接连接两个连接点

#### 直角线 (Orthogonal)
- 使用曼哈顿路由算法
- 支持最少弯折数
- 支持避开其他图形

#### 曲线 (Curved)
- 使用贝塞尔曲线
- 根据连接点方向计算控制点

### 4. 功能列表

1. 三种连接线样式绘制
2. 连接线随图形移动自动更新
3. 连接线文本标签
4. 箭头样式（单向、双向、无箭头、圆点、菱形）
5. 删除图形时自动删除关联连接线
6. 连接线选中和高亮

---

## 完成标准

- [ ] 三种连接线样式都能正常绘制
- [ ] 图形移动时连接线自动跟随
- [ ] 连接线可以添加文本标签
- [ ] 连接线样式可配置（颜色、粗细、箭头）
- [ ] 删除图形时自动删除关联连接线

---

## 测试用例

1. 创建两个矩形，用直角线连接，验证路径正确
2. 移动其中一个矩形，验证连接线自动调整
3. 切换连接线样式，验证平滑过渡
4. 删除连接的图形，验证连接线自动删除
5. 复杂场景：10个图形互相连接，移动时无卡顿

---

## 相关文件

- `src/utils/connectorEngine.ts` (新建)
- `src/components/Canvas.tsx` (修改)
- `src/components/ConnectorLayer.tsx` (新建)
- `src/stores/canvasStore.ts` (已修改)

---

## 开发步骤

1. 实现连接线绘制引擎
2. 实现三种连接线样式算法
3. 集成到Canvas组件
4. 实现连接线随图形移动更新
5. 实现连接线删除逻辑
6. 测试和优化

---

## 注意事项

1. 连接线更新需要考虑性能，避免频繁重绘
2. 正交线路由算法需要优化，避免过度复杂
3. 连接线z-index应该在图形之下
4. 考虑连接线的选中状态显示
