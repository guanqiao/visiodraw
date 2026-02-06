import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// 图层接口
export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  shapeIds: string[]
  order: number
}

// 图层状态接口
export interface LayerState {
  // 图层列表
  layers: Layer[]
  // 当前活动图层ID
  activeLayerId: string | null
  // 默认图层ID
  defaultLayerId: string | null

  // Actions
  // 初始化默认图层
  initDefaultLayer: () => void
  // 添加图层
  addLayer: (name?: string) => string
  // 删除图层
  deleteLayer: (id: string) => void
  // 重命名图层
  renameLayer: (id: string, name: string) => void
  // 设置活动图层
  setActiveLayer: (id: string) => void
  // 切换图层可见性
  toggleLayerVisibility: (id: string) => void
  // 切换图层锁定状态
  toggleLayerLock: (id: string) => void
  // 移动图层顺序
  moveLayer: (id: string, direction: 'up' | 'down') => void
  // 将图形添加到图层
  addShapeToLayer: (shapeId: string, layerId?: string) => void
  // 从图层移除图形
  removeShapeFromLayer: (shapeId: string, layerId?: string) => void
  // 移动图形到另一个图层
  moveShapeToLayer: (shapeId: string, targetLayerId: string) => void
  // 获取图形所在的图层
  getLayerByShapeId: (shapeId: string) => Layer | undefined
  // 获取可见的图层ID列表
  getVisibleLayerIds: () => string[]
  // 获取锁定的图层ID列表
  getLockedLayerIds: () => string[]
  // 清空所有图层
  clearAllLayers: () => void
}

// 生成唯一ID
const generateId = () => `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const useLayerStore = create<LayerState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      layers: [],
      activeLayerId: null,
      defaultLayerId: null,

      // 初始化默认图层
      initDefaultLayer: () => {
        const { layers, defaultLayerId } = get()
        // 如果已经存在默认图层，不再创建
        if (defaultLayerId && layers.some((l) => l.id === defaultLayerId)) {
          return
        }

        const defaultLayer: Layer = {
          id: generateId(),
          name: '默认图层',
          visible: true,
          locked: false,
          shapeIds: [],
          order: 0,
        }

        set({
          layers: [defaultLayer],
          activeLayerId: defaultLayer.id,
          defaultLayerId: defaultLayer.id,
        })
      },

      // 添加图层
      addLayer: (name?: string) => {
        const { layers } = get()
        const maxOrder = Math.max(...layers.map((l) => l.order), -1)

        const newLayer: Layer = {
          id: generateId(),
          name: name || `图层 ${layers.length + 1}`,
          visible: true,
          locked: false,
          shapeIds: [],
          order: maxOrder + 1,
        }

        set({ layers: [...layers, newLayer] })
        return newLayer.id
      },

      // 删除图层
      deleteLayer: (id: string) => {
        const { layers, activeLayerId, defaultLayerId } = get()

        // 不能删除默认图层
        if (id === defaultLayerId) {
          console.warn('不能删除默认图层')
          return
        }

        const targetLayer = layers.find((l) => l.id === id)
        if (!targetLayer) return

        // 将该图层中的图形移动到默认图层
        const newLayers = layers
          .map((layer) => {
            if (layer.id === defaultLayerId) {
              return {
                ...layer,
                shapeIds: [...layer.shapeIds, ...targetLayer.shapeIds],
              }
            }
            return layer
          })
          .filter((l) => l.id !== id)
          .sort((a, b) => a.order - b.order)
          .map((l, index) => ({ ...l, order: index }))

        // 如果删除的是活动图层，切换到默认图层
        const newActiveLayerId = activeLayerId === id ? defaultLayerId : activeLayerId

        set({
          layers: newLayers,
          activeLayerId: newActiveLayerId,
        })
      },

      // 重命名图层
      renameLayer: (id: string, name: string) => {
        const { layers } = get()
        set({
          layers: layers.map((layer) =>
            layer.id === id ? { ...layer, name } : layer
          ),
        })
      },

      // 设置活动图层
      setActiveLayer: (id: string) => {
        set({ activeLayerId: id })
      },

      // 切换图层可见性
      toggleLayerVisibility: (id: string) => {
        const { layers } = get()
        set({
          layers: layers.map((layer) =>
            layer.id === id ? { ...layer, visible: !layer.visible } : layer
          ),
        })
      },

      // 切换图层锁定状态
      toggleLayerLock: (id: string) => {
        const { layers } = get()
        set({
          layers: layers.map((layer) =>
            layer.id === id ? { ...layer, locked: !layer.locked } : layer
          ),
        })
      },

      // 移动图层顺序
      moveLayer: (id: string, direction: 'up' | 'down') => {
        const { layers } = get()
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order)
        const index = sortedLayers.findIndex((l) => l.id === id)

        if (index === -1) return

        if (direction === 'up' && index > 0) {
          // 向上移动（减小order）
          const temp = sortedLayers[index].order
          sortedLayers[index].order = sortedLayers[index - 1].order
          sortedLayers[index - 1].order = temp
        } else if (direction === 'down' && index < sortedLayers.length - 1) {
          // 向下移动（增大order）
          const temp = sortedLayers[index].order
          sortedLayers[index].order = sortedLayers[index + 1].order
          sortedLayers[index + 1].order = temp
        }

        set({ layers: sortedLayers })
      },

      // 将图形添加到图层
      addShapeToLayer: (shapeId: string, layerId?: string) => {
        const { layers, activeLayerId, defaultLayerId } = get()
        const targetLayerId = layerId || activeLayerId || defaultLayerId

        if (!targetLayerId) {
          console.warn('没有可用的图层来添加图形')
          return
        }

        set({
          layers: layers.map((layer) =>
            layer.id === targetLayerId
              ? { ...layer, shapeIds: [...layer.shapeIds, shapeId] }
              : layer
          ),
        })
      },

      // 从图层移除图形
      removeShapeFromLayer: (shapeId: string, layerId?: string) => {
        const { layers } = get()

        if (layerId) {
          // 从指定图层移除
          set({
            layers: layers.map((layer) =>
              layer.id === layerId
                ? { ...layer, shapeIds: layer.shapeIds.filter((id) => id !== shapeId) }
                : layer
            ),
          })
        } else {
          // 从所有图层移除
          set({
            layers: layers.map((layer) => ({
              ...layer,
              shapeIds: layer.shapeIds.filter((id) => id !== shapeId),
            })),
          })
        }
      },

      // 移动图形到另一个图层
      moveShapeToLayer: (shapeId: string, targetLayerId: string) => {
        const { layers } = get()

        set({
          layers: layers.map((layer) => {
            // 从原图层移除
            if (layer.shapeIds.includes(shapeId)) {
              return { ...layer, shapeIds: layer.shapeIds.filter((id) => id !== shapeId) }
            }
            // 添加到目标图层
            if (layer.id === targetLayerId) {
              return { ...layer, shapeIds: [...layer.shapeIds, shapeId] }
            }
            return layer
          }),
        })
      },

      // 获取图形所在的图层
      getLayerByShapeId: (shapeId: string) => {
        const { layers } = get()
        return layers.find((layer) => layer.shapeIds.includes(shapeId))
      },

      // 获取可见的图层ID列表
      getVisibleLayerIds: () => {
        const { layers } = get()
        return layers.filter((layer) => layer.visible).map((layer) => layer.id)
      },

      // 获取锁定的图层ID列表
      getLockedLayerIds: () => {
        const { layers } = get()
        return layers.filter((layer) => layer.locked).map((layer) => layer.id)
      },

      // 清空所有图层
      clearAllLayers: () => {
        const { defaultLayerId } = get()
        if (defaultLayerId) {
          set({
            layers: [
              {
                id: defaultLayerId,
                name: '默认图层',
                visible: true,
                locked: false,
                shapeIds: [],
                order: 0,
              },
            ],
            activeLayerId: defaultLayerId,
          })
        } else {
          set({ layers: [], activeLayerId: null })
        }
      },
    }),
    { name: 'LayerStore' }
  )
)

export default useLayerStore
