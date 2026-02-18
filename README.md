# VisioDraw X6 - AntV X6 重构版本

## 项目概述

本项目是 VisioDraw 的 AntV X6 重构版本，将原有的 Fabric.js 绘图引擎替换为 AntV X6 图编辑引擎，以获得更好的性能、更丰富的功能和更现代化的架构。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **AntV X6** - 图编辑引擎
- **Zustand** - 状态管理
- **Ant Design** - UI 组件库
- **Vite** - 构建工具

## X6 插件集成

- `@antv/x6-plugin-snapline` - 对齐线插件
- `@antv/x6-plugin-transform` - 变换插件（缩放、旋转）
- `@antv/x6-plugin-keyboard` - 键盘快捷键插件
- `@antv/x6-plugin-clipboard` - 剪贴板插件
- `@antv/x6-plugin-history` - 历史记录插件（撤销/重做）
- `@antv/x6-plugin-selection` - 选择插件

## 核心功能

### 1. 图形绘制
- 矩形、圆形、三角形、菱形等基本图形
- UML 图形（类、接口、组件、用例等）
- ER 图形（实体、关系）
- BPMN 图形
- 云原生图形（K8s、Docker、AWS 等）
- 支持拖拽绘制
- 支持从模具库拖拽添加

### 2. 连接线（Edge）系统
- **多种路由算法**：正交（Manhattan）、直线、曲线、贝塞尔、地铁线
- **智能路由**：A* 算法、障碍物避让
- **自连接边**：支持节点自连线，四方向可选
- **平行边处理**：同一对节点间多条边自动分布
- **丰富的标记**：多种箭头样式（classic、block、diamond、circle 等）
- **线型样式**：实线、虚线、点线
- **标签系统**：支持多标签、位置调整、样式自定义
- **右键菜单**：删除、编辑、切换样式、反向、图层操作
- **悬停效果**：视觉反馈增强

### 3. 选择和编辑
- 单选/多选
- 框选（Rubberband）
- 拖拽移动
- 缩放调整大小
- 旋转
- 连接点编辑（添加/删除/移动）

### 4. 对齐和分布
- 左对齐、水平居中、右对齐
- 顶端对齐、垂直居中、底端对齐
- 水平分布、垂直分布

### 5. 键盘快捷键
- `Delete/Backspace` - 删除选中元素
- `Ctrl+C` / `Ctrl+V` / `Ctrl+X` - 复制/粘贴/剪切
- `Ctrl+Z` / `Ctrl+Y` - 撤销/重做
- `Ctrl+A` - 全选
- `Ctrl+D` - 复制并粘贴
- `Ctrl+0/1` - 缩放至100%/适应屏幕
- `Ctrl+滚轮` - 缩放
- `Ctrl+]/[` - 置于顶层/底层
- `Ctrl+Shift+C/V` - 格式刷复制/粘贴
- `E` - 创建 ER 实体
- `R` - 关系连接模式
- `A` - 添加属性
- `Ctrl+Shift+1` - 连接点工具模式

### 6. 导入导出
- 导出为 PNG
- 导出为 JSON
- 从 JSON 导入
- **Mermaid 导入**：支持 Mermaid 语法导入
- **Visio 导入**：支持 Visio 文件（.vsdx）导入

### 7. 图表生成器
- **甘特图生成器**：自动生成甘特图
- **序列图生成器**：自动生成 UML 序列图
- **数据库逆向工程**：从数据库表结构生成 ER 图

### 8. 模板系统
- 丰富的内置模板（流程图、UML、ER、网络拓扑等）
- 模板搜索和分类
- 模板缩略图预览
- 模板分享功能

### 9. 主题系统
- 支持多种主题（default、dark、forest、neutral）
- 实时主题切换
- 自定义主题变量

### 10. 性能优化
- **虚拟渲染**：只渲染视口内元素，支持大规模图形
- **路径缓存**：边路径计算缓存（LRU策略）
- **动画管理器**：平滑动画效果
- **节点变更检测**：增量更新，减少渲染次数
- **空间索引**：加速连接点查找

## 项目结构

```
visiodraw-x6/
├── src/
│   ├── components/           # UI 组件
│   │   ├── X6Canvas.tsx      # X6 画布组件（核心）
│   │   ├── ShapeLibrary/     # 模具库组件
│   │   ├── PropertyPanel/    # 属性面板
│   │   ├── LayerPanel/       # 图层面板
│   │   ├── TemplateLibrary/  # 模板库
│   │   ├── ContextMenu/      # 右键菜单
│   │   └── ...
│   ├── stores/               # 状态管理
│   │   ├── x6GraphStore.ts   # X6 图形状态管理
│   │   ├── clipboardStore.ts # 剪贴板状态管理
│   │   └── ...
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useOptimizedStoreSync.ts  # 优化的 Store 同步
│   │   ├── useSelfLoopDrawing.ts     # 自连线绘制
│   │   └── ...
│   ├── types/                # 类型定义
│   │   ├── connection.ts     # 连接点/线类型定义
│   │   ├── shape.ts          # 图形类型定义
│   │   └── ...
│   ├── utils/                # 工具函数
│   │   ├── rendering/        # 渲染系统
│   │   │   ├── VirtualRenderer.ts    # 虚拟渲染器
│   │   │   ├── AnimationManager.ts   # 动画管理器
│   │   │   ├── SmartRouter.ts        # 智能路由器
│   │   │   └── ...
│   │   ├── performance/      # 性能优化
│   │   │   ├── nodeChangeDetector.ts # 节点变更检测
│   │   │   ├── SpatialIndex.ts       # 空间索引
│   │   │   └── ...
│   │   ├── selfLoopRouter.ts         # 自连线路由
│   │   ├── parallelEdgeHandler.ts    # 平行边处理
│   │   ├── edgePathCache.ts          # 边路径缓存
│   │   ├── connectorRenderer.ts      # 连接器渲染器
│   │   └── ...
│   ├── templates/            # 模板定义
│   ├── App.tsx               # 主应用组件
│   ├── main.tsx              # 入口文件
│   └── index.css             # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 从 Fabric.js 迁移的主要变化

### 架构变化
1. **渲染方式**: Fabric.js 使用 Canvas 2D API 直接渲染，X6 使用 SVG 渲染
2. **数据模型**: Fabric.js 使用面向对象的图形对象，X6 使用数据驱动的 Cell 模型
3. **插件系统**: X6 提供更完善的插件机制

### API 变化
| Fabric.js | X6 |
|-----------|-----|
| `fabric.Canvas` | `Graph` |
| `fabric.Rect/Circle` | `Node` with shape |
| `fabric.Path` | `Edge` |
| `canvas.add()` | `graph.addNode()/addEdge()` |
| `canvas.remove()` | `graph.removeCell()` |
| `canvas.setActiveObject()` | `graph.select()` |

### 功能增强
1. **内置对齐线**: X6 Snapline 插件提供自动对齐
2. **内置连接线路由**: Manhattan 路由自动避障
3. **连接点系统**: 内置 Port 系统支持连接点
4. **撤销/重做**: History 插件内置支持
5. **键盘快捷键**: Keyboard 插件简化快捷键处理
6. **自连接边**: 支持节点自连线
7. **智能路由**: A* 算法、障碍物避让
8. **平行边处理**: 多条边自动分布

## 开发计划

### 已完成 ✅
- [x] 基础 X6 画布组件
- [x] 状态管理迁移
- [x] 基本图形绘制
- [x] 连接线功能（多种路由算法）
- [x] 自连接边系统
- [x] 平行边处理
- [x] 智能路由（A* 算法）
- [x] 选择和对齐
- [x] 键盘快捷键
- [x] 模具库组件
- [x] 属性面板
- [x] 图层面板
- [x] 主题系统
- [x] 导入/导出（JSON、PNG）
- [x] Mermaid 导入
- [x] Visio 文件导入
- [x] 甘特图生成器
- [x] 序列图生成器
- [x] 数据库逆向工程
- [x] 模板系统
- [x] 虚拟渲染优化
- [x] 动画系统
- [x] 性能优化（缓存、空间索引）

### 待完成 📋
- [ ] 打印功能优化
- [ ] 更多图形类型
- [ ] 组合/解组功能增强
- [ ] 图片支持优化
- [ ] 协作编辑功能
- [ ] 云端存储集成

## 运行项目

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 类型检查
npm run typecheck

# 运行测试
npm run test
```

## 测试覆盖

- **单元测试**: 28+ 测试文件，覆盖核心功能
- **E2E 测试**: 17+ 测试文件，覆盖用户场景
- **测试框架**: Vitest + Playwright

## 与原版 VisioDraw 的关系

本项目使用 git worktree 创建，位于 `../visio-x6`，与原版 `visio` 共享同一个 Git 仓库但不同的工作目录。可以在两个版本之间自由切换和比较。

```bash
# 切换到原版
cd ../visio

# 切换到 X6 版本
cd ../visio-x6
```

## 贡献

这是一个重构实验项目，欢迎提出建议和改进意见。

## 许可证

MIT
