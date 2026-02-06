import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { optimizeHistory, deepClone, performanceMonitor } from '@utils/performanceUtils'
import type { ConnectionPoint, Connector } from '../types/connection'

export interface Shape {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  text?: string
  angle?: number
  scaleX?: number
  scaleY?: number
  rotation?: number
  // 连接点支持
  connectionPoints?: ConnectionPoint[]
}

// 连接线存储
export interface ConnectorState {
  connectors: Connector[]
  selectedConnectorId: string | null
}

export interface CanvasState {
  // 画布状态
  canvas: fabric.Canvas | null
  shapes: Shape[]
  selectedShapeId: string | null
  zoom: number
  gridEnabled: boolean
  snapToGrid: boolean
  currentTool: string

  // 连接线状态
  connectors: Connector[]
  selectedConnectorId: string | null
  isDrawingConnector: boolean
  connectorStartShapeId: string | null
  connectorStartPointId: string | null

  // 历史记录
  history: Shape[][]
  historyIndex: number

  // 文件状态
  filePath: string | null
  isModified: boolean

  // Actions
  setCanvas: (canvas: fabric.Canvas) => void
  addShape: (shape: Shape) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  deleteShape: (id: string) => void
  selectShape: (id: string | null) => void
  setZoom: (zoom: number) => void
  setTool: (tool: string) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void

  // 连接点操作
  updateShapeConnectionPoints: (id: string, connectionPoints: ConnectionPoint[]) => void
  setConnectionPointsVisibility: (shapeId: string, visible: boolean) => void

  // 连接线操作
  addConnector: (connector: Connector) => void
  updateConnector: (id: string, updates: Partial<Connector>) => void
  deleteConnector: (id: string) => void
  selectConnector: (id: string | null) => void
  startDrawingConnector: (shapeId: string, pointId: string) => void
  endDrawingConnector: (shapeId: string, pointId: string) => void
  cancelDrawingConnector: () => void

  // 历史操作
  undo: () => void
  redo: () => void
  saveHistory: () => void

  // 文件操作
  newCanvas: () => void
  openFile: (path: string) => Promise<void>
  saveFile: (path?: string) => Promise<void>
  exportToPng: (path: string) => Promise<void>
  exportToPdf: (path: string) => Promise<void>
}

const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      canvas: null,
      shapes: [],
      selectedShapeId: null,
      zoom: 1,
      gridEnabled: true,
      snapToGrid: false,
      currentTool: 'select',

      // 连接线初始状态
      connectors: [],
      selectedConnectorId: null,
      isDrawingConnector: false,
      connectorStartShapeId: null,
      connectorStartPointId: null,

      history: [[]],
      historyIndex: 0,
      filePath: null,
      isModified: false,

      // 设置画布
      setCanvas: (canvas) => {
        set({ canvas })
      },

      // 添加图形
      addShape: (shape) => {
        const { shapes, saveHistory } = get()
        const newShapes = [...shapes, shape]
        set({ shapes: newShapes, isModified: true })
        saveHistory()
      },

      // 更新图形
      updateShape: (id, updates) => {
        const { shapes, saveHistory } = get()
        const newShapes = shapes.map((shape) =>
          shape.id === id ? { ...shape, ...updates } : shape
        )
        set({ shapes: newShapes, isModified: true })
        saveHistory()
      },

      // 删除图形
      deleteShape: (id) => {
        const { shapes, selectedShapeId, saveHistory } = get()
        const newShapes = shapes.filter((shape) => shape.id !== id)
        set({
          shapes: newShapes,
          selectedShapeId: selectedShapeId === id ? null : selectedShapeId,
          isModified: true,
        })
        saveHistory()
      },

      // 选择图形
      selectShape: (id) => {
        set({ selectedShapeId: id })
      },

      // 设置缩放
      setZoom: (zoom) => {
        const { canvas } = get()
        if (canvas) {
          canvas.setZoom(zoom)
          canvas.renderAll()
        }
        set({ zoom })
      },

      // 设置工具
      setTool: (tool) => {
        set({ currentTool: tool })
      },

      // 切换网格
      toggleGrid: () => {
        set((state) => ({ gridEnabled: !state.gridEnabled }))
      },

      // 切换吸附到网格
      toggleSnapToGrid: () => {
        set((state) => ({ snapToGrid: !state.snapToGrid }))
      },

      // 更新图形连接点
      updateShapeConnectionPoints: (id, connectionPoints) => {
        const { shapes, saveHistory } = get()
        const newShapes = shapes.map((shape) =>
          shape.id === id ? { ...shape, connectionPoints } : shape
        )
        set({ shapes: newShapes, isModified: true })
        saveHistory()
      },

      // 设置连接点可见性
      setConnectionPointsVisibility: (shapeId, visible) => {
        const { shapes } = get()
        const newShapes = shapes.map((shape) => {
          if (shape.id === shapeId && shape.connectionPoints) {
            return {
              ...shape,
              connectionPoints: shape.connectionPoints.map((point) => ({
                ...point,
                isVisible: visible,
              })),
            }
          }
          return shape
        })
        set({ shapes: newShapes })
      },

      // 添加连接线
      addConnector: (connector) => {
        const { connectors, saveHistory } = get()
        const newConnectors = [...connectors, connector]
        set({ connectors: newConnectors, isModified: true })
        saveHistory()
      },

      // 更新连接线
      updateConnector: (id, updates) => {
        const { connectors, saveHistory } = get()
        const newConnectors = connectors.map((conn) =>
          conn.id === id ? { ...conn, ...updates } : conn
        )
        set({ connectors: newConnectors, isModified: true })
        saveHistory()
      },

      // 删除连接线
      deleteConnector: (id) => {
        const { connectors, selectedConnectorId, saveHistory } = get()
        const newConnectors = connectors.filter((conn) => conn.id !== id)
        set({
          connectors: newConnectors,
          selectedConnectorId: selectedConnectorId === id ? null : selectedConnectorId,
          isModified: true,
        })
        saveHistory()
      },

      // 选择连接线
      selectConnector: (id) => {
        set({ selectedConnectorId: id })
      },

      // 开始绘制连接线
      startDrawingConnector: (shapeId, pointId) => {
        set({
          isDrawingConnector: true,
          connectorStartShapeId: shapeId,
          connectorStartPointId: pointId,
        })
      },

      // 结束绘制连接线
      endDrawingConnector: (shapeId, pointId) => {
        const { connectorStartShapeId, connectorStartPointId } = get()
        if (connectorStartShapeId && connectorStartPointId) {
          // 创建连接线
          const newConnector: Connector = {
            id: `connector-${Date.now()}`,
            sourceShapeId: connectorStartShapeId,
            sourcePointId: connectorStartPointId,
            targetShapeId: shapeId,
            targetPointId: pointId,
            style: 'straight',
            startStyle: 'none',
            endStyle: 'arrow',
            stroke: '#000000',
            strokeWidth: 1,
          }
          get().addConnector(newConnector)
        }
        set({
          isDrawingConnector: false,
          connectorStartShapeId: null,
          connectorStartPointId: null,
        })
      },

      // 取消绘制连接线
      cancelDrawingConnector: () => {
        set({
          isDrawingConnector: false,
          connectorStartShapeId: null,
          connectorStartPointId: null,
        })
      },

      // 撤销
      undo: () => {
        const { history, historyIndex } = get()
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          set({
            shapes: history[newIndex],
            historyIndex: newIndex,
            isModified: true,
          })
        }
      },

      // 重做
      redo: () => {
        const { history, historyIndex } = get()
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1
          set({
            shapes: history[newIndex],
            historyIndex: newIndex,
            isModified: true,
          })
        }
      },

      // 保存历史记录
      saveHistory: () => {
        performanceMonitor.start('saveHistory')
        const { shapes, history, historyIndex } = get()
        const newHistory = history.slice(0, historyIndex + 1)
        // 使用深克隆避免引用问题
        newHistory.push(deepClone(shapes))
        // 优化历史记录大小
        const optimizedHistory = optimizeHistory(newHistory, 50)
        set({
          history: optimizedHistory,
          historyIndex: optimizedHistory.length - 1,
        })
        performanceMonitor.end('saveHistory')
      },

      // 新建画布
      newCanvas: () => {
        const { canvas } = get()
        if (canvas) {
          canvas.clear()
          canvas.backgroundColor = '#ffffff'
          canvas.renderAll()
        }
        set({
          shapes: [],
          selectedShapeId: null,
          connectors: [],
          selectedConnectorId: null,
          isDrawingConnector: false,
          connectorStartShapeId: null,
          connectorStartPointId: null,
          history: [[]],
          historyIndex: 0,
          filePath: null,
          isModified: false,
        })
      },

      // 打开文件
      openFile: async (path: string) => {
        try {
          // TODO: 实现文件读取逻辑
          console.log('打开文件:', path)
          set({ filePath: path, isModified: false })
        } catch (error) {
          console.error('打开文件失败:', error)
          throw error
        }
      },

      // 保存文件
      saveFile: async (path?: string) => {
        try {
          const { shapes, filePath } = get()
          const savePath = path || filePath
          if (!savePath) {
            throw new Error('未指定保存路径')
          }
          // TODO: 实现文件保存逻辑
          const data = JSON.stringify({ shapes }, null, 2)
          console.log('保存文件:', savePath, data)
          set({ filePath: savePath, isModified: false })
        } catch (error) {
          console.error('保存文件失败:', error)
          throw error
        }
      },

      // 导出为PNG
      exportToPng: async (path: string) => {
        try {
          const { canvas } = get()
          if (!canvas) {
            throw new Error('画布未初始化')
          }
          // TODO: 实现PNG导出逻辑
          console.log('导出PNG:', path)
        } catch (error) {
          console.error('导出PNG失败:', error)
          throw error
        }
      },

      // 导出为PDF
      exportToPdf: async (path: string) => {
        try {
          // TODO: 实现PDF导出逻辑
          console.log('导出PDF:', path)
        } catch (error) {
          console.error('导出PDF失败:', error)
          throw error
        }
      },
    }),
    { name: 'canvas-store' }
  )
)

export default useCanvasStore
