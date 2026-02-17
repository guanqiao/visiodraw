import { Graph, Shape, Edge } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Transform } from '@antv/x6-plugin-transform'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { History } from '@antv/x6-plugin-history'
import { Selection } from '@antv/x6-plugin-selection'
import type { GraphInitOptions } from './types'

export const createGraph = (options: GraphInitOptions): Graph => {
  const {
    container,
    isDark,
    canvasBgColor,
    gridEnabled,
    gridType,
    gridSize,
  } = options

  const defaultBgColor = isDark ? '#1e1e1e' : '#f0f2f5'
  const bgColor = canvasBgColor || defaultBgColor

  const gridColor = isDark
    ? (gridType === 'line' ? '#3a3a3a' : '#404040')
    : (gridType === 'line' ? '#e0e0e0' : '#d0d0d0')

  const graph: Graph = new Graph({
    container,
    autoResize: true,
    resizing: true,
    background: {
      color: bgColor,
    },
    grid: {
      visible: gridEnabled && gridType !== 'none',
      size: gridSize,
      type: gridType === 'line' ? 'mesh' : 'dot',
      args: {
        color: gridColor,
        thickness: 1,
      },
    },
    panning: {
      enabled: false,
    },
    mousewheel: {
      enabled: true,
      minScale: 0.1,
      maxScale: 3,
    },
    connecting: {
      allowBlank: false,
      allowMulti: true,
      allowLoop: false,
      allowNode: true,
      allowEdge: false,
      highlight: true,
      anchor: 'center',
      connectionPoint: 'anchor',
      snap: {
        radius: 20,
      },
      createEdge(): Edge {
        return graph.createEdge({
          attrs: {
            line: {
              stroke: '#333333',
              strokeWidth: 2,
              targetMarker: {
                name: 'classic',
                size: 10,
              },
            },
          },
          router: {
            name: 'manhattan',
          },
          connector: {
            name: 'rounded',
          },
        })
      },
      validateConnection({ sourceMagnet, targetMagnet, sourceCell, targetCell }) {
        return !!sourceMagnet && !!targetMagnet && sourceCell !== targetCell
      },
    },
  })

  graph.use(
    new Snapline({
      enabled: true,
      sharp: true,
    })
  )

  graph.use(
    new Transform({
      resizing: {
        enabled: true,
        preserveAspectRatio: false,
      },
      rotating: true,
    })
  )

  graph.use(
    new Keyboard({
      enabled: true,
    })
  )

  graph.use(
    new Clipboard({
      enabled: true,
    })
  )

  graph.use(
    new History({
      enabled: true,
    })
  )

  graph.use(
    new Selection({
      enabled: true,
      multiple: true,
      rubberband: true,
      movable: true,
      showNodeSelectionBox: true,
      showEdgeSelectionBox: true,
    })
  )

  return graph
}

export const updateGraphTheme = (
  graph: Graph,
  options: {
    isDark: boolean
    canvasBgColor: string
    gridEnabled: boolean
    gridType: 'dot' | 'line' | 'none'
  }
): void => {
  const { isDark, canvasBgColor, gridEnabled, gridType } = options

  const defaultBgColor = isDark ? '#1e1e1e' : '#f0f2f5'
  const bgColor = canvasBgColor || defaultBgColor
  graph.drawBackground({ color: bgColor })

  if (gridEnabled && gridType !== 'none') {
    const gridColor = isDark
      ? (gridType === 'line' ? '#3a3a3a' : '#404040')
      : (gridType === 'line' ? '#e0e0e0' : '#d0d0d0')
    graph.clearGrid()
    graph.drawGrid({
      type: gridType === 'line' ? 'mesh' : 'dot',
      args: {
        color: gridColor,
        thickness: 1,
      },
    })
  }
}

export const getEditorThemeStyles = (isDark: boolean) => ({
  bgColor: isDark ? '#2c2c2c' : '#ffffff',
  textColor: isDark ? '#e0e0e0' : '#333333',
  borderColor: isDark ? '#18a0fb' : '#1890ff',
})
