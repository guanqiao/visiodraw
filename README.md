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
- 支持拖拽绘制
- 支持从模具库拖拽添加

### 2. 连接线
- 正交连接线（Manhattan 路由）
- 直线连接
- 支持箭头标记
- 自动吸附到连接点

### 3. 选择和编辑
- 单选/多选
- 框选（Rubberband）
- 拖拽移动
- 缩放调整大小
- 旋转

### 4. 对齐和分布
- 左对齐、水平居中、右对齐
- 顶端对齐、垂直居中、底端对齐
- 水平分布、垂直分布

### 5. 键盘快捷键
- `Delete/Backspace` - 删除选中元素
- `Ctrl+C` / `Ctrl+V` - 复制/粘贴
- `Ctrl+X` - 剪切
- `Ctrl+Z` / `Ctrl+Y` - 撤销/重做
- `Ctrl+A` - 全选
- `Ctrl+滚轮` - 缩放

### 6. 导入导出
- 导出为 PNG
- 导出为 JSON
- 从 JSON 导入

## 项目结构

```
visiodraw-x6/
├── src/
│   ├── components/
│   │   └── X6Canvas.tsx      # X6 画布组件
│   ├── stores/
│   │   ├── x6GraphStore.ts   # X6 图形状态管理
│   │   └── clipboardStore.ts # 剪贴板状态管理
│   ├── types/
│   │   ├── connection.ts     # 连接点/线类型定义
│   │   └── dragDrop.ts       # 拖拽类型定义
│   ├── utils/
│   │   └── connectionPoints.ts # 连接点工具函数
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

## 开发计划

### 已完成
- [x] 基础 X6 画布组件
- [x] 状态管理迁移
- [x] 基本图形绘制
- [x] 连接线功能
- [x] 选择和对齐
- [x] 键盘快捷键

### 待完成
- [ ] 模具库组件
- [ ] 属性面板
- [ ] 图层管理
- [ ] 主题系统
- [ ] Visio 文件导入/导出
- [ ] 打印功能
- [ ] 更多图形类型
- [ ] 组合/解组功能
- [ ] 文本编辑
- [ ] 图片支持

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
```

## 与原版 VisioDraw 的关系

本项目使用 git worktree 创建，位于 `../visiodraw-x6`，与原版 `visiodraw` 共享同一个 Git 仓库但不同的工作目录。可以在两个版本之间自由切换和比较。

```bash
# 切换到原版
cd ../visiodraw

# 切换到 X6 版本
cd ../visiodraw-x6
```

## 贡献

这是一个重构实验项目，欢迎提出建议和改进意见。

## 许可证

MIT
