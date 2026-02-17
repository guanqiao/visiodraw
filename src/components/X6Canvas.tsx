import React, { useEffect, useRef, useCallback, useState } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Transform } from '@antv/x6-plugin-transform'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { History } from '@antv/x6-plugin-history'
import { Selection } from '@antv/x6-plugin-selection'
import { message } from 'antd'
import useX6GraphStore from '@stores/x6GraphStore'
import useClipboardStore from '@stores/clipboardStore'
import useFormatPainterStore from '@stores/formatPainterStore'
import { THEME_CHANGE_EVENT } from '@hooks/useTheme'
import { useOptimizedStoreSync } from '@hooks/useOptimizedStoreSync'
import { v4 as uuidv4 } from 'uuid'
import { parseDragData } from '../types/dragDrop'
import { generateDefaultConnectionPoints, showPortsDebounced, clearPendingPortVisibility } from '@utils/connectionPoints'
import { ConnectorRenderer } from '@utils/connectorRenderer'
import { renderShape } from '@utils/shapeRenderers'
import ERRelationQuickSelector, { isErTableNode, getErNodeName } from '@components/ERRelationQuickSelector'
import type { ERRelationType } from '../types/connection'
import { erRelations } from '../types/connection'

const X6Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)

  // Get current theme from DOM
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const root = document.getElementById('root')
    return root?.getAttribute('data-theme') === 'dark'
  })

  // Listen to theme changes
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setIsDark(e.detail === 'dark')
    }

    window.addEventListener(THEME_CHANGE_EVENT as any, handleThemeChange as any)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT as any, handleThemeChange as any)
    }
  }, [])

  // Store selectors
  const setGraph = useX6GraphStore((state) => state.setGraph)
  const addNode = useX6GraphStore((state) => state.addNode)
  const addNodes = useX6GraphStore((state) => state.addNodes)
  const updateNode = useX6GraphStore((state) => state.updateNode)
  const deleteNode = useX6GraphStore((state) => state.deleteNode)
  const deleteNodes = useX6GraphStore((state) => state.deleteNodes)
  const selectNode = useX6GraphStore((state) => state.selectNode)
  const clearSelection = useX6GraphStore((state) => state.clearSelection)
  const addEdge = useX6GraphStore((state) => state.addEdge)
  const updateEdge = useX6GraphStore((state) => state.updateEdge)
  const deleteEdge = useX6GraphStore((state) => state.deleteEdge)
  const selectEdge = useX6GraphStore((state) => state.selectEdge)
  const nodes = useX6GraphStore((state) => state.nodes)
  const edges = useX6GraphStore((state) => state.edges)
  const currentTool = useX6GraphStore((state) => state.currentTool)
  const setTool = useX6GraphStore((state) => state.setTool)
  const gridEnabled = useX6GraphStore((state) => state.gridEnabled)
  const gridType = useX6GraphStore((state) => state.gridType)
  const gridSize = useX6GraphStore((state) => state.gridSize)
  const canvasBgColor = useX6GraphStore((state) => state.canvasBgColor)
  const setZoom = useX6GraphStore((state) => state.setZoom)
  const autoSaveToHistory = useX6GraphStore((state) => state.autoSaveToHistory)

  const copy = useClipboardStore((state) => state.copy)
  const paste = useClipboardStore((state) => state.paste)

  // Format painter store
  const copiedNodeStyle = useFormatPainterStore((state) => state.copiedNodeStyle)
  const copiedEdgeStyle = useFormatPainterStore((state) => state.copiedEdgeStyle)
  const copyNodeStyle = useFormatPainterStore((state) => state.copyNodeStyle)
  const copyEdgeStyle = useFormatPainterStore((state) => state.copyEdgeStyle)
  const pasteNodeStyle = useFormatPainterStore((state) => state.pasteNodeStyle)
  const pasteEdgeStyle = useFormatPainterStore((state) => state.pasteEdgeStyle)
  const isPersistentMode = useFormatPainterStore((state) => state.isPersistentMode)
  const setPersistentMode = useFormatPainterStore((state) => state.setPersistentMode)

  // ER Relation Quick Selector state
  const [showERRelationSelector, setShowERRelationSelector] = useState(false)
  const [pendingEdgeInfo, setPendingEdgeInfo] = useState<{
    edgeId: string
    sourceNode: { id: string; type: string; name: string } | null
    targetNode: { id: string; type: string; name: string } | null
  } | null>(null)

  // Initialize X6 Graph
  useEffect(() => {
    if (!containerRef.current) return

    // 根据主题获取默认画布背景色
    const defaultBgColor = isDark ? '#1e1e1e' : '#f0f2f5'
    const bgColor = canvasBgColor || defaultBgColor

    // 根据主题获取网格颜色
    const gridColor = isDark
      ? (gridType === 'line' ? '#3a3a3a' : '#404040')
      : (gridType === 'line' ? '#e0e0e0' : '#d0d0d0')

    const graph: Graph = new Graph({
      container: containerRef.current,
      autoResize: true,
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
        modifiers: ['ctrl', 'meta'],
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
          // 确保从连接点(magnet)开始，且不是同一个节点
          return !!sourceMagnet && !!targetMagnet && sourceCell !== targetCell
        },
      },
    })

    // Add plugins
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
          preserveAspectRatio: true,
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

    // Event handlers for connection points visibility - 使用延迟显示优化性能
    graph.on('node:mouseenter', ({ node }: { node: Node }) => {
      showPortsDebounced(node, true, 50)
    })

    graph.on('node:mouseleave', ({ node }: { node: Node }) => {
      showPortsDebounced(node, false, 50)
    })

    // Debug connecting events - 只在开发环境输出
    if (import.meta.env.DEV) {
      graph.on('edge:connected', ({ edge, type }: { edge: Edge; type: string }) => {
        console.log('Edge connected:', type, edge.id)
      })

      graph.on('edge:created', ({ edge }: { edge: Edge }) => {
        console.log('Edge created:', edge.id)
      })
    }

    // Event handlers
    graph.on('node:added', ({ node }: { node: Node }) => {
      const data = node.getData() as any
      if (data?.fromStore) return

      // Check if node already exists in store (prevent duplicate)
      const existingNodes = useX6GraphStore.getState().nodes
      if (existingNodes.find(n => n.id === node.id)) {
        return
      }

      const nodeData = {
        id: node.id,
        type: node.shape || 'rect',
        x: node.position().x,
        y: node.position().y,
        width: node.size().width,
        height: node.size().height,
        fill: (node.attr('body/fill') as string) || '#ffffff',
        stroke: (node.attr('body/stroke') as string) || '#333333',
        strokeWidth: (node.attr('body/strokeWidth') as number) || 2,
        text: (node.attr('label/text') as string) || '',
        connectionPoints: generateDefaultConnectionPoints(node.shape || 'rect'),
      }
      node.setData({ fromStore: true })
      addNode(nodeData)
    })

    graph.on('node:moved', ({ node }: { node: Node }) => {
      updateNode(node.id, {
        x: node.position().x,
        y: node.position().y,
      })
    })

    graph.on('node:resized', ({ node }: { node: Node }) => {
      updateNode(node.id, {
        width: node.size().width,
        height: node.size().height,
      })
    })

    graph.on('node:selected', ({ node }: { node: Node }) => {
      selectNode(node.id)
    })

    graph.on('node:unselected', () => {
      clearSelection()
    })

    // Double click to edit node text
    graph.on('node:dblclick', ({ node, e }: { node: Node; e: any }) => {
      e.stopPropagation()
      
      // Get current text
      const currentText = (node.attr('label/text') as string) || ''
      
      // Create inline editor
      const editor = document.createElement('div')
      editor.contentEditable = 'true'
      editor.innerText = currentText
      // 根据主题设置编辑器样式
      const editorBgColor = isDark ? '#2c2c2c' : '#ffffff'
      const editorTextColor = isDark ? '#e0e0e0' : '#333333'
      const editorBorderColor = isDark ? '#18a0fb' : '#1890ff'
      editor.style.cssText = `
        position: fixed;
        background: ${editorBgColor};
        color: ${editorTextColor};
        border: 2px solid ${editorBorderColor};
        padding: 4px 8px;
        border-radius: 4px;
        outline: none;
        min-width: 60px;
        text-align: center;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `
      
      // Get node's position on screen using X6's localToClient method
      const position = node.getPosition()
      const size = node.getSize()
      
      // Convert local coordinates to client coordinates
      const clientPoint = graph.localToClient(
        position.x + size.width / 2,
        position.y + size.height / 2
      )
      
      // Center the editor on the node
      editor.style.left = `${clientPoint.x - 30}px`
      editor.style.top = `${clientPoint.y - 15}px`
      
      document.body.appendChild(editor)
      editor.focus()
      
      // Select all text
      const range = document.createRange()
      range.selectNodeContents(editor)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      
      // Handle save
      const save = () => {
        const newText = editor.innerText.trim()
        // Always update text, even if empty (use empty string instead of undefined)
        updateNode(node.id, { text: newText })
        node.attr('label/text', newText || '')
        document.body.removeChild(editor)
      }
      
      // Handle cancel
      const cancel = () => {
        document.body.removeChild(editor)
      }
      
      editor.addEventListener('blur', save)
      editor.addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter') {
          evt.preventDefault()
          editor.blur()
        } else if (evt.key === 'Escape') {
          cancel()
        }
      })
    })

    graph.on('edge:added', ({ edge }: { edge: Edge }) => {
      const data = edge.getData() as any
      if (data?.fromStore) return

      const source = edge.getSource()
      const target = edge.getTarget()

      if (source && target) {
        const connector = ConnectorRenderer.fromX6Edge(edge)
        edge.setData({ fromStore: true })
        addEdge(connector)
      }
    })

    graph.on('edge:connected', ({ edge, isNew }: { edge: Edge; isNew?: boolean }) => {
      const source = edge.getSource()
      const target = edge.getTarget()

      if (source && target && isNew) {
        const sourceCellId = 'cell' in source ? source.cell : null
        const targetCellId = 'cell' in target ? target.cell : null
        
        if (sourceCellId && targetCellId && typeof sourceCellId === 'string' && typeof targetCellId === 'string') {
          const sourceCell = graph.getCellById(sourceCellId)
          const targetCell = graph.getCellById(targetCellId)
          
          if (sourceCell?.isNode() && targetCell?.isNode()) {
            const sourceNode = sourceCell as Node
            const targetNode = targetCell as Node
            const sourceType = sourceNode.shape || 'rect'
            const targetType = targetNode.shape || 'rect'
            
            if (isErTableNode(sourceType) && isErTableNode(targetType)) {
              const sourceData = nodes.find(n => n.id === sourceCellId)
              const targetData = nodes.find(n => n.id === targetCellId)
              
              setPendingEdgeInfo({
                edgeId: edge.id,
                sourceNode: {
                  id: sourceCellId,
                  type: sourceType,
                  name: getErNodeName(sourceData),
                },
                targetNode: {
                  id: targetCellId,
                  type: targetType,
                  name: getErNodeName(targetData),
                },
              })
              setShowERRelationSelector(true)
              return
            }
          }
        }
        
        const connector = ConnectorRenderer.fromX6Edge(edge)
        addEdge(connector)
      }
    })

    graph.on('edge:selected', ({ edge }: { edge: Edge }) => {
      selectEdge(edge.id)
    })

    graph.on('edge:unselected', () => {
      clearSelection()
    })

    // Double click to edit edge label
    graph.on('edge:dblclick', ({ edge, e }: { edge: Edge; e: any }) => {
      e.stopPropagation()
      
      // Get current labels
      const labels = edge.getLabels()
      const hasExistingLabel = labels && labels.length > 0
      const currentText = hasExistingLabel 
        ? ((labels[0].attrs?.text?.text as string) || '') 
        : ''
      
      // Create inline editor
      const editor = document.createElement('div')
      editor.contentEditable = 'true'
      editor.innerText = currentText
      // 根据主题设置编辑器样式
      const editorBgColor = isDark ? '#2c2c2c' : '#ffffff'
      const editorTextColor = isDark ? '#e0e0e0' : '#333333'
      const editorBorderColor = isDark ? '#18a0fb' : '#1890ff'
      editor.style.cssText = `
        position: absolute;
        background: ${editorBgColor};
        color: ${editorTextColor};
        border: 2px solid ${editorBorderColor};
        padding: 4px 8px;
        border-radius: 4px;
        outline: none;
        min-width: 60px;
        text-align: center;
        font-size: 12px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `
      
      // Position editor at mouse position
      editor.style.left = `${e.clientX - 30}px`
      editor.style.top = `${e.clientY - 15}px`
      
      document.body.appendChild(editor)
      editor.focus()
      
      // Select all text
      const range = document.createRange()
      range.selectNodeContents(editor)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      
      // Handle save
      const save = () => {
        const newText = editor.innerText.trim()
        
        if (hasExistingLabel) {
          // Update existing label
          const connector = ConnectorRenderer.fromX6Edge(edge)
          const updatedLabels = connector.labels?.map((label: any, index: number) => {
            if (index === 0) {
              return { ...label, text: newText }
            }
            return label
          }) || []
          updateEdge(edge.id, { labels: updatedLabels })
          
          // Update X6 edge
          const labelConfig = {
            attrs: {
              text: {
                text: newText,
              },
            },
          }
          edge.setLabelAt(0, labelConfig)
        } else {
          // Add new label
          const newLabel = {
            id: uuidv4(),
            text: newText,
            position: 0.5,
            fontSize: 12,
            color: '#333333',
          }
          const connector = ConnectorRenderer.fromX6Edge(edge)
          const updatedLabels = [...(connector.labels || []), newLabel]
          updateEdge(edge.id, { labels: updatedLabels })
          
          // Update X6 edge
          ConnectorRenderer.updateEdgeLabel(edge, newLabel, 0)
        }
        
        document.body.removeChild(editor)
      }
      
      // Handle cancel
      const cancel = () => {
        document.body.removeChild(editor)
      }
      
      editor.addEventListener('blur', save)
      editor.addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter') {
          evt.preventDefault()
          editor.blur()
        } else if (evt.key === 'Escape') {
          cancel()
        }
      })
    })

    graph.on('blank:click', () => {
      clearSelection()
    })

    graph.on('scale', ({ sx }: { sx: number }) => {
      setZoom(sx)
    })

    // Keyboard shortcuts
    graph.bindKey(['delete', 'backspace'], () => {
      const selectedNodes = graph.getSelectedCells().filter((cell: any) => cell.isNode())
      const selectedEdges = graph.getSelectedCells().filter((cell: any) => cell.isEdge())
      
      selectedNodes.forEach((node: any) => {
        deleteNode(node.id)
        graph.removeCell(node.id)
      })
      
      selectedEdges.forEach((edge: any) => {
        deleteEdge(edge.id)
        graph.removeCell(edge.id)
      })
    })

    graph.bindKey(['ctrl+c', 'meta+c'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length > 0) {
        graph.copy(selectedCells)
        const selectedNodes = selectedCells
          .filter((cell: any) => cell.isNode())
          .map((cell: any) => nodes.find(n => n.id === cell.id))
          .filter(Boolean)
        copy(selectedNodes as any[])
      }
    })

    graph.bindKey(['ctrl+x', 'meta+x'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length > 0) {
        graph.cut(selectedCells)
        const selectedNodeIds = selectedCells
          .filter((cell: any) => cell.isNode())
          .map((cell: any) => cell.id)
        deleteNodes(selectedNodeIds)
      }
    })

    graph.bindKey(['ctrl+v', 'meta+v'], () => {
      const result = paste()
      if (result && result.shapes.length > 0) {
        const newNodes = result.shapes.map((shape) => ({
          ...shape,
          id: uuidv4(),
          x: shape.x + 20,
          y: shape.y + 20,
        }))
        addNodes(newNodes)
      } else {
        // Use X6 clipboard
        graph.paste({ offset: 20 })
      }
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

    // Duplicate (Ctrl+D) - Copy and paste in place
    graph.bindKey(['ctrl+d', 'meta+d'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length === 0) return

      graph.copy(selectedCells)
      graph.paste({ offset: 20 })
    })

    // Zoom shortcuts
    graph.bindKey(['ctrl+0', 'meta+0'], () => {
      graph.zoomTo(1)
      setZoom(1)
    })

    graph.bindKey(['ctrl+1', 'meta+1'], () => {
      graph.zoomToFit({ padding: 20 })
      setZoom(graph.zoom())
    })

    graph.bindKey(['ctrl+=', 'meta+='], () => {
      const newZoom = Math.min(graph.zoom() + 0.1, 3)
      graph.zoomTo(newZoom)
      setZoom(newZoom)
    })

    graph.bindKey(['ctrl+-', 'meta+-'], () => {
      const newZoom = Math.max(graph.zoom() - 0.1, 0.1)
      graph.zoomTo(newZoom)
      setZoom(newZoom)
    })

    // Layer ordering shortcuts
    graph.bindKey(['ctrl+]', 'meta+]'], () => {
      const selectedCells = graph.getSelectedCells()
      selectedCells.forEach((cell: any) => {
        if (cell.isNode()) {
          cell.toFront()
        }
      })
    })

    graph.bindKey(['ctrl+[', 'meta+['], () => {
      const selectedCells = graph.getSelectedCells()
      selectedCells.forEach((cell: any) => {
        if (cell.isNode()) {
          cell.toBack()
        }
      })
    })

    // Escape to clear selection
    graph.bindKey('esc', () => {
      clearSelection()
      graph.cleanSelection()
    })

    // Format painter: Copy style (Ctrl+Shift+C)
    graph.bindKey(['ctrl+shift+c', 'meta+shift+c'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length === 0) return

      // Copy style from the first selected node or edge
      const firstCell = selectedCells[0]
      if (firstCell.isNode()) {
        const node = firstCell as Node
        const style = {
          fill: (node.attr('body/fill') as string) || '#ffffff',
          stroke: (node.attr('body/stroke') as string) || '#333333',
          strokeWidth: (node.attr('body/strokeWidth') as number) || 2,
          fontSize: (node.attr('label/fontSize') as number) || 14,
          fontColor: (node.attr('label/fill') as string) || '#333333',
        }
        copyNodeStyle(style)
        if (import.meta.env.DEV) {
          console.log('Node style copied:', style)
        }
      } else if (firstCell.isEdge()) {
        const edge = firstCell as Edge
        const lineStyle: 'solid' | 'dashed' | 'dotted' = (edge.attr('line/style/animation') as string) === 'dash' ? 'dashed' : 'solid'
        const style = {
          stroke: (edge.attr('line/stroke') as string) || '#333333',
          strokeWidth: (edge.attr('line/strokeWidth') as number) || 2,
          lineStyle,
          sourceMarker: (edge.attr('line/sourceMarker/name') as string) || 'none',
          targetMarker: (edge.attr('line/targetMarker/name') as string) || 'classic',
          router: (edge.getRouter() as any)?.name || 'normal',
        }
        copyEdgeStyle(style)
        if (import.meta.env.DEV) {
          console.log('Edge style copied:', style)
        }
      }
    })

    // Format painter: Paste style (Ctrl+Shift+V)
    graph.bindKey(['ctrl+shift+v', 'meta+shift+v'], () => {
      const selectedCells = graph.getSelectedCells()
      if (selectedCells.length === 0) return

      selectedCells.forEach((cell) => {
        if (cell.isNode()) {
          const style = pasteNodeStyle()
          if (style) {
            const node = cell as Node
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
            // Update store
            updateNode(node.id, {
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
            const edge = cell as Edge
            edge.attr({
              line: {
                stroke: style.stroke,
                strokeWidth: style.strokeWidth,
                sourceMarker: style.sourceMarker !== 'none' ? { name: style.sourceMarker, size: 10 } : null,
                targetMarker: style.targetMarker !== 'none' ? { name: style.targetMarker, size: 10 } : null,
              },
            })
            // Update router if needed
            if (style.router && style.router !== 'normal') {
              edge.setRouter(style.router)
            }
            // Update store
            updateEdge(edge.id, {
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              lineStyle: style.lineStyle,
            })
          }
        }
      })
    })

    // ER Diagram shortcuts
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
      addNode(nodeData)
      message.success('已创建实体 (快捷键 E)')
    })

    graph.bindKey('r', () => {
      setTool('connector')
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
        updateNode(node.id, {
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
        const node = cell as Node
        const nodeData = nodes.find(n => n.id === node.id)
        
        if (nodeData && (nodeData.type === 'er-table-entity-with-columns' || nodeData.type === 'er-table-entity')) {
          const lines = (nodeData.text || '').split('\n')
          const tableName = lines[0]
          const existingColumns = lines.slice(1)
          const newColumn = `column_${existingColumns.length + 1}\tvarchar`
          const newText = [tableName, ...existingColumns, newColumn].join('\n')
          
          updateNode(nodeData.id, { 
            text: newText,
            height: nodeData.height + 28,
          })
          message.success('已添加属性 (快捷键 A)')
        }
      }
    })

    graphRef.current = graph
    setGraph(graph)

    // Set up auto save interval (check every minute)
    const autoSaveInterval = setInterval(() => {
      autoSaveToHistory()
    }, 60000)

    return () => {
      clearInterval(autoSaveInterval)
      clearPendingPortVisibility() // 清理待处理的连接点显示
      graph.dispose()
      graphRef.current = null
    }
  }, [])

  // 使用优化的 Store 同步 Hook
  useOptimizedStoreSync(graphRef.current, nodes, edges, {
    debounceMs: 16, // 约 60fps
    batchSize: 50,
  })

  // Handle theme changes - update canvas background and grid
  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    // 根据主题更新画布背景
    const defaultBgColor = isDark ? '#1e1e1e' : '#f0f2f5'
    const bgColor = canvasBgColor || defaultBgColor
    graph.drawBackground({ color: bgColor })

    // 根据主题更新网格颜色
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
  }, [isDark, canvasBgColor, gridEnabled, gridType])

  // Handle tool changes
  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    // Reset interaction mode
    graph.disablePanning()
    graph.disableRubberband()

    switch (currentTool) {
      case 'select':
        graph.enableRubberband()
        break
      case 'hand':
        // Enable panning with left mouse button for hand tool
        graph.enablePanning()
        break
      case 'connector':
        // Enable connecting mode
        break
      case 'rectangle':
      case 'circle':
      case 'triangle':
        // Drawing mode - handled by click events
        break
    }
  }, [currentTool])

  // Handle drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    const dragData = parseDragData(e.dataTransfer)
    if (!dragData) return

    const graph = graphRef.current
    if (!graph) return

    // Convert to local coordinates directly from client coordinates
    const localPoint = graph.clientToLocal({ x: e.clientX, y: e.clientY })

    const id = uuidv4()
    const shapeType = dragData.shapeType || 'rectangle'
    const width = dragData.width || 100
    const height = dragData.height || 60
    const defaultProps = dragData.defaultProps || {}

    const nodeData = {
      id,
      type: shapeType,
      x: localPoint.x - width / 2,
      y: localPoint.y - height / 2,
      width,
      height,
      fill: (defaultProps.fill as string) || '#e6f7ff',
      stroke: (defaultProps.stroke as string) || '#1890ff',
      strokeWidth: (defaultProps.strokeWidth as number) || 2,
      text: dragData.name,
      connectionPoints: generateDefaultConnectionPoints(shapeType),
    }

    addNode(nodeData)
  }, [addNode])

  // Handle canvas click for drawing shapes
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (currentTool === 'select' || currentTool === 'connector') return

    const graph = graphRef.current
    if (!graph) return

    // Convert to local coordinates directly from client coordinates
    const localPoint = graph.clientToLocal({ x: e.clientX, y: e.clientY })

    const id = uuidv4()
    const width = 100
    const height = 60

    const nodeData = {
      id,
      type: currentTool,
      x: localPoint.x - width / 2,
      y: localPoint.y - height / 2,
      width,
      height,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
      connectionPoints: generateDefaultConnectionPoints(currentTool),
    }

    addNode(nodeData)

    // Auto-switch back to select tool
    setTool('select')
  }, [currentTool, addNode, setTool])

  // Get cursor style based on current tool
  const getCursorStyle = () => {
    switch (currentTool) {
      case 'select':
        return 'default'
      case 'hand':
        return 'grab'
      case 'rectangle':
      case 'circle':
      case 'triangle':
        return 'crosshair'
      default:
        return 'default'
    }
  }

  // Handle ER relation type selection
  const handleERRelationSelect = useCallback((relationType: ERRelationType) => {
    if (!pendingEdgeInfo || !graphRef.current) return
    
    const { edgeId } = pendingEdgeInfo
    const graph = graphRef.current
    const edge = graph.getCellById(edgeId) as Edge
    
    if (edge) {
      const config = erRelations[relationType]
      if (config) {
        edge.setAttrs({
          line: {
            stroke: config.stroke,
            strokeWidth: config.strokeWidth,
            strokeDasharray: config.lineStyle === 'dashed' ? '5,5' : 
                            config.lineStyle === 'dotted' ? '2,2' : undefined,
            sourceMarker: config.startStyle !== 'none' ? {
              name: config.startStyle,
              size: 10,
            } : null,
            targetMarker: config.endStyle !== 'none' ? {
              name: config.endStyle,
              size: 10,
            } : null,
          },
        })
        
        if (config.lineStyle === 'dashed' || config.lineStyle === 'dotted') {
          edge.attr('line/style/animation', 'dash')
        }
        
        const connector = ConnectorRenderer.fromX6Edge(edge)
        connector.lineStyle = config.lineStyle
        connector.startStyle = config.startStyle
        connector.endStyle = config.endStyle
        connector.stroke = config.stroke
        connector.strokeWidth = config.strokeWidth
        
        addEdge(connector)
      }
    }
    
    setShowERRelationSelector(false)
    setPendingEdgeInfo(null)
  }, [pendingEdgeInfo, addEdge])

  const handleERRelationCancel = useCallback(() => {
    if (pendingEdgeInfo && graphRef.current) {
      const edge = graphRef.current.getCellById(pendingEdgeInfo.edgeId) as Edge
      if (edge) {
        graphRef.current.removeCell(edge)
      }
    }
    setShowERRelationSelector(false)
    setPendingEdgeInfo(null)
  }, [pendingEdgeInfo])

  return (
    <>
      <div
        ref={containerRef}
        className="x6-graph"
        data-testid="x6-canvas"
        data-grid-type={gridType}
        data-tool={currentTool}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: canvasBgColor,
          cursor: getCursorStyle(),
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      />
      
      <ERRelationQuickSelector
        visible={showERRelationSelector}
        sourceNodeInfo={pendingEdgeInfo?.sourceNode || null}
        targetNodeInfo={pendingEdgeInfo?.targetNode || null}
        onSelect={handleERRelationSelect}
        onCancel={handleERRelationCancel}
      />
    </>
  )
}

// Helper function to create X6 node from data
function createX6NodeFromData(node: any): Node {
  return renderShape(node.type, {
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    fill: node.fill,
    stroke: node.stroke,
    strokeWidth: node.strokeWidth,
    text: node.text,
    rx: node.rx,
    ry: node.ry,
  })
}

export default X6Canvas
