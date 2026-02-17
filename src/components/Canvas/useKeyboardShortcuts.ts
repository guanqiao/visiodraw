import { useEffect } from 'react'
import { Graph } from '@antv/x6'
import type { UseKeyboardShortcutsOptions } from './types'
import { v4 as uuidv4 } from 'uuid'
import { generateDefaultConnectionPoints } from '../../utils/connectionPoints'
import { message } from 'antd'

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions) => {
  const {
    graph,
    nodes,
    selectedNodeIds,
    onDeleteNodes,
    onDeleteEdge,
    onCopy,
    onCut,
    onPaste,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onZoomToFit,
    onClearSelection,
    onSetTool,
    onAddNode,
    onUpdateNode,
  } = options

  useEffect(() => {
    if (!graph) return

    graph.bindKey(['delete', 'backspace'], () => {
      const selectedCells = graph.getSelectedCells()
      const selectedNodes = selectedCells.filter((cell) => cell.isNode())
      const selectedEdges = selectedCells.filter((cell) => cell.isEdge())
      
      const nodeIds = selectedNodes.map((node) => node.id)
      if (nodeIds.length > 0) {
        onDeleteNodes(nodeIds)
      }
      
      selectedEdges.forEach((edge) => {
        onDeleteEdge(edge.id)
        graph.removeCell(edge.id)
      })
    })

    graph.bindKey(['ctrl+c', 'meta+c'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length > 0) {
        graph.copy(selectedCells)
        onCopy()
      }
    })

    graph.bindKey(['ctrl+x', 'meta+x'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length > 0) {
        graph.cut(selectedCells)
        const nodeIds = selectedCells
          .filter((cell) => cell.isNode())
          .map((cell) => cell.id)
        onDeleteNodes(nodeIds)
      }
    })

    graph.bindKey(['ctrl+v', 'meta+v'], () => {
      onPaste()
    })

    graph.bindKey(['ctrl+z', 'meta+z'], () => {
      graph.undo()
    })

    graph.bindKey(['ctrl+y', 'meta+y', 'ctrl+shift+z', 'meta+shift+z'], () => {
      graph.redo()
    })

    graph.bindKey(['ctrl+a', 'meta+a'], () => {
      graph.select(graph.getCells())
    })

    graph.bindKey(['ctrl+d', 'meta+d'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length === 0) return

      graph.copy(selectedCells)
      graph.paste({ offset: 20 })
    })

    graph.bindKey(['ctrl+0', 'meta+0'], () => {
      graph.zoomTo(1)
      onZoomReset()
    })

    graph.bindKey(['ctrl+1', 'meta+1'], () => {
      graph.zoomToFit({ padding: 20 })
      onZoomToFit()
    })

    graph.bindKey(['ctrl+=', 'meta+='], () => {
      onZoomIn()
    })

    graph.bindKey(['ctrl+-', 'meta+-'], () => {
      onZoomOut()
    })

    graph.bindKey(['ctrl+]', 'meta+]'], () => {
      const selectedCells = graph.getSelectedCells()
      selectedCells.forEach((cell) => {
        if (cell.isNode()) {
          cell.toFront()
        }
      })
    })

    graph.bindKey(['ctrl+[', 'meta+['], () => {
      const selectedCells = graph.getSelectedCells()
      selectedCells.forEach((cell) => {
        if (cell.isNode()) {
          cell.toBack()
        }
      })
    })

    graph.bindKey('esc', () => {
      onClearSelection()
      graph.cleanSelection()
    })

    graph.bindKey('e', () => {
      const id = uuidv4()
      const nodeData = {
        id,
        type: 'er-table-entity-with-columns',
        x: 200 + Math.random() * 200,
        y: 150 + Math.random() * 150,
        width: 200,
        height: 78,
        fill: '#ffffff',
        stroke: '#1890ff',
        strokeWidth: 2,
        text: 'new_entity\nid\tint\t[pk]',
        connectionPoints: generateDefaultConnectionPoints('er-table-entity-with-columns'),
      }
      onAddNode(nodeData)
      message.success('已创建实体 (快捷键 E)')
    })

    graph.bindKey('r', () => {
      onSetTool('connector')
      message.info('关系连接模式：点击源实体，拖拽到目标实体')
    })

    graph.bindKey(['ctrl+l', 'meta+l'], () => {
      const erNodes = nodes.filter(n => 
        n.type === 'er-table-entity-with-columns' || 
        n.type === 'er-table-entity'
      )
      
      if (erNodes.length === 0) {
        message.warning('没有ER实体可以布局')
        return
      }

      erNodes.forEach((node, index) => {
        const row = Math.floor(index / 3)
        const col = index % 3
        onUpdateNode(node.id, {
          x: 100 + col * 280,
          y: 100 + row * 350,
        })
      })
      message.success('已应用网格布局 (Ctrl+L)')
    })

    graph.bindKey('a', () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length !== 1) {
        message.info('请先选择一个实体')
        return
      }
      
      const cell = selectedCells[0]
      if (cell.isNode()) {
        const nodeData = nodes.find(n => n.id === cell.id)
        
        if (nodeData && (nodeData.type === 'er-table-entity-with-columns' || nodeData.type === 'er-table-entity')) {
          const lines = (nodeData.text || '').split('\n')
          const tableName = lines[0]
          const existingColumns = lines.slice(1)
          const newColumn = `column_${existingColumns.length + 1}\tvarchar`
          const newText = [tableName, ...existingColumns, newColumn].join('\n')
          
          onUpdateNode(nodeData.id, { 
            text: newText,
            height: nodeData.height + 28,
          })
          message.success('已添加属性 (快捷键 A)')
        }
      }
    })

    return () => {
      graph.unbindKey(['delete', 'backspace'])
      graph.unbindKey(['ctrl+c', 'meta+c'])
      graph.unbindKey(['ctrl+x', 'meta+x'])
      graph.unbindKey(['ctrl+v', 'meta+v'])
      graph.unbindKey(['ctrl+z', 'meta+z'])
      graph.unbindKey(['ctrl+y', 'meta+y', 'ctrl+shift+z', 'meta+shift+z'])
      graph.unbindKey(['ctrl+a', 'meta+a'])
      graph.unbindKey(['ctrl+d', 'meta+d'])
      graph.unbindKey(['ctrl+0', 'meta+0'])
      graph.unbindKey(['ctrl+1', 'meta+1'])
      graph.unbindKey(['ctrl+=', 'meta+='])
      graph.unbindKey(['ctrl+-', 'meta+-'])
      graph.unbindKey(['ctrl+]', 'meta+]'])
      graph.unbindKey(['ctrl+[', 'meta+['])
      graph.unbindKey('esc')
      graph.unbindKey('e')
      graph.unbindKey('r')
      graph.unbindKey(['ctrl+l', 'meta+l'])
      graph.unbindKey('a')
    }
  }, [
    graph,
    nodes,
    selectedNodeIds,
    onDeleteNodes,
    onDeleteEdge,
    onCopy,
    onCut,
    onPaste,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onZoomToFit,
    onClearSelection,
    onSetTool,
    onAddNode,
    onUpdateNode,
  ])
}

export const useFormatPainterShortcuts = (
  graph: Graph | null,
  copiedNodeStyle: any,
  copiedEdgeStyle: any,
  copyNodeStyle: (style: any) => void,
  copyEdgeStyle: (style: any) => void,
  pasteNodeStyle: () => any,
  pasteEdgeStyle: () => any,
  onUpdateNode: (id: string, updates: any) => void,
  onUpdateEdge: (id: string, updates: any) => void
) => {
  useEffect(() => {
    if (!graph) return

    graph.bindKey(['ctrl+shift+c', 'meta+shift+c'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length === 0) return

      const firstCell = selectedCells[0]
      if (firstCell.isNode()) {
        const node = firstCell as any
        const style = {
          fill: (node.attr('body/fill') as string) || '#ffffff',
          stroke: (node.attr('body/stroke') as string) || '#333333',
          strokeWidth: (node.attr('body/strokeWidth') as number) || 2,
          fontSize: (node.attr('label/fontSize') as number) || 14,
          fontColor: (node.attr('label/fill') as string) || '#333333',
        }
        copyNodeStyle(style)
      } else if (firstCell.isEdge()) {
        const edge = firstCell as any
        const lineStyle: 'solid' | 'dashed' | 'dotted' = 
          (edge.attr('line/style/animation') as string) === 'dash' ? 'dashed' : 'solid'
        const style = {
          stroke: (edge.attr('line/stroke') as string) || '#333333',
          strokeWidth: (edge.attr('line/strokeWidth') as number) || 2,
          lineStyle,
          sourceMarker: (edge.attr('line/sourceMarker/name') as string) || 'none',
          targetMarker: (edge.attr('line/targetMarker/name') as string) || 'classic',
          router: (edge.getRouter() as any)?.name || 'normal',
        }
        copyEdgeStyle(style)
      }
    })

    graph.bindKey(['ctrl+shift+v', 'meta+shift+v'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length === 0) return

      selectedCells.forEach((cell) => {
        if (cell.isNode()) {
          const style = pasteNodeStyle()
          if (style) {
            const node = cell as any
            node.attr({
              body: {
                fill: style.fill,
                stroke: style.stroke,
                strokeWidth: style.strokeWidth,
              },
              label: {
                fontSize: style.fontSize,
                fill: style.fontColor,
              },
            })
            onUpdateNode(node.id, {
              fill: style.fill,
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              fontSize: style.fontSize,
              fontColor: style.fontColor,
            })
          }
        } else if (cell.isEdge()) {
          const style = pasteEdgeStyle()
          if (style) {
            const edge = cell as any
            edge.attr({
              line: {
                stroke: style.stroke,
                strokeWidth: style.strokeWidth,
                sourceMarker: style.sourceMarker !== 'none' ? { name: style.sourceMarker, size: 10 } : null,
                targetMarker: style.targetMarker !== 'none' ? { name: style.targetMarker, size: 10 } : null,
              },
            })
            if (style.router && style.router !== 'normal') {
              edge.setRouter(style.router)
            }
            onUpdateEdge(edge.id, {
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              lineStyle: style.lineStyle,
            })
          }
        }
      })
    })

    return () => {
      graph.unbindKey(['ctrl+shift+c', 'meta+shift+c'])
      graph.unbindKey(['ctrl+shift+v', 'meta+shift+v'])
    }
  }, [
    graph,
    copiedNodeStyle,
    copiedEdgeStyle,
    copyNodeStyle,
    copyEdgeStyle,
    pasteNodeStyle,
    pasteEdgeStyle,
    onUpdateNode,
    onUpdateEdge,
  ])
}
