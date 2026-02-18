import { useEffect, useCallback, useRef } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { v4 as uuidv4 } from 'uuid'
import type { UseGraphEventsOptions, NodeEventData, EdgeEventData, ERRelationInfo } from './types'
import { generateDefaultConnectionPoints } from '../../utils/connectionPoints'
import { ConnectorRenderer } from '../../utils/connectorRenderer'
import { isErTableNode, getErNodeName } from '../ERRelationQuickSelector'
import { showPorts } from '../../utils/connectionPoints'
import { updateNodePathOnResize, needsPathUpdate } from '../../utils/shapePathUpdater'
import { devLog } from '../../utils/logger'

export const useGraphEvents = (options: UseGraphEventsOptions) => {
  const {
    graph,
    isDark,
    onNodeAdded,
    onNodeMoved,
    onNodeResized,
    onNodeSelected,
    onEdgeAdded,
    onEdgeConnected,
    onEdgeSelected,
    onClearSelection,
    onZoomChange,
    onShowERRelationSelector,
    nodes,
  } = options

  const isDarkRef = useRef(isDark)
  isDarkRef.current = isDark

  const createNodeEventData = useCallback((node: Node): NodeEventData => {
    return {
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
  }, [])

  const createEdgeEventData = useCallback((edge: Edge): EdgeEventData => {
    const source = edge.getSource()
    const target = edge.getTarget()
    const connector = ConnectorRenderer.fromX6Edge(edge)
    
    return {
      id: edge.id,
      sourceShapeId: 'cell' in source ? String(source.cell) : '',
      sourcePointId: 'port' in source ? source.port || 'default' : 'default',
      targetShapeId: 'cell' in target ? String(target.cell) : '',
      targetPointId: 'port' in target ? target.port || 'default' : 'default',
      style: connector.style,
      lineStyle: connector.lineStyle,
      startStyle: connector.startStyle,
      endStyle: connector.endStyle,
      stroke: connector.stroke,
      strokeWidth: connector.strokeWidth,
      labels: connector.labels,
    }
  }, [])

  useEffect(() => {
    if (!graph) return

    const handleNodeMouseEnter = ({ node }: { node: Node }) => {
      showPorts(node, true)
    }

    const handleNodeMouseLeave = ({ node }: { node: Node }) => {
      showPorts(node, false)
    }

    const handleEdgeMouseEnter = ({ edge }: { edge: Edge }) => {
      // 悬停效果：加粗线条、改变颜色
      const originalStrokeWidth = edge.attr('line/strokeWidth') as number || 2
      const originalStroke = edge.attr('line/stroke') as string || '#333333'
      
      edge.setData({
        ...edge.getData(),
        _hoverOriginal: {
          strokeWidth: originalStrokeWidth,
          stroke: originalStroke,
        },
      })
      
      edge.attr('line/strokeWidth', originalStrokeWidth + 1)
      edge.attr('line/stroke', '#1890ff')
    }

    const handleEdgeMouseLeave = ({ edge }: { edge: Edge }) => {
      // 恢复原始样式
      const data = edge.getData() as any
      if (data?._hoverOriginal) {
        edge.attr('line/strokeWidth', data._hoverOriginal.strokeWidth)
        edge.attr('line/stroke', data._hoverOriginal.stroke)
        
        // 清理临时数据
        const newData = { ...data }
        delete newData._hoverOriginal
        edge.setData(newData)
      }
    }

    const handleNodeAdded = ({ node }: { node: Node }) => {
      const data = node.getData() as any
      if (data?.fromStore) return

      const existingNodes = nodes
      if (existingNodes.find(n => n.id === node.id)) {
        return
      }

      const nodeData = createNodeEventData(node)
      node.setData({ fromStore: true })
      onNodeAdded(nodeData)
    }

    const handleNodeMoved = ({ node }: { node: Node }) => {
      onNodeMoved(node.id, node.position().x, node.position().y)
    }

    const handleNodeResized = ({ node }: { node: Node }) => {
      onNodeResized(node.id, node.size().width, node.size().height)
      if (needsPathUpdate(node)) {
        updateNodePathOnResize(node)
      }
    }

    const handleNodeSelected = ({ node }: { node: Node }) => {
      onNodeSelected(node.id)
    }

    const handleNodeUnselected = () => {
      onClearSelection()
    }

    const handleNodeDblClick = ({ node, e }: { node: Node; e: any }) => {
      e.stopPropagation()
      
      const currentText = (node.attr('label/text') as string) || ''
      const currentIsDark = isDarkRef.current
      
      const bgColor = currentIsDark ? '#2c2c2c' : '#ffffff'
      const textColor = currentIsDark ? '#e0e0e0' : '#333333'
      const borderColor = currentIsDark ? '#18a0fb' : '#1890ff'
      
      const editor = document.createElement('div')
      editor.contentEditable = 'true'
      editor.innerText = currentText
      editor.style.cssText = `
        position: fixed;
        background: ${bgColor};
        color: ${textColor};
        border: 2px solid ${borderColor};
        padding: 4px 8px;
        border-radius: 4px;
        outline: none;
        min-width: 60px;
        text-align: center;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `
      
      const position = node.getPosition()
      const size = node.getSize()
      
      const clientPoint = graph.localToClient(
        position.x + size.width / 2,
        position.y + size.height / 2
      )
      
      editor.style.left = `${clientPoint.x - 30}px`
      editor.style.top = `${clientPoint.y - 15}px`
      
      document.body.appendChild(editor)
      editor.focus()
      
      const range = document.createRange()
      range.selectNodeContents(editor)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      
      const save = () => {
        const newText = editor.innerText.trim()
        node.attr('label/text', newText || '')
        document.body.removeChild(editor)
      }
      
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
    }

    const handleEdgeAdded = ({ edge }: { edge: Edge }) => {
      const data = edge.getData() as any
      if (data?.fromStore) return

      const source = edge.getSource()
      const target = edge.getTarget()

      if (source && target) {
        const connector = ConnectorRenderer.fromX6Edge(edge)
        edge.setData({ fromStore: true })
        const edgeData = createEdgeEventData(edge)
        onEdgeAdded(edgeData)
      }
    }

    const handleEdgeConnected = ({ edge, isNew }: { edge: Edge; isNew?: boolean }) => {
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
              
              const relationInfo: ERRelationInfo = {
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
              }
              onShowERRelationSelector(relationInfo)
              return
            }
          }
        }
        
        const edgeData = createEdgeEventData(edge)
        onEdgeConnected(edgeData, true)
      }
    }

    const handleEdgeSelected = ({ edge }: { edge: Edge }) => {
      onEdgeSelected(edge.id)
    }

    const handleEdgeUnselected = () => {
      onClearSelection()
    }

    const handleBlankClick = () => {
      onClearSelection()
    }

    const handleScale = ({ sx }: { sx: number }) => {
      onZoomChange(sx)
    }

    graph.on('node:mouseenter', handleNodeMouseEnter)
    graph.on('node:mouseleave', handleNodeMouseLeave)
    graph.on('node:added', handleNodeAdded)
    graph.on('node:moved', handleNodeMoved)
    graph.on('node:resized', handleNodeResized)
    graph.on('node:selected', handleNodeSelected)
    graph.on('node:unselected', handleNodeUnselected)
    graph.on('node:dblclick', handleNodeDblClick)
    graph.on('edge:mouseenter', handleEdgeMouseEnter)
    graph.on('edge:mouseleave', handleEdgeMouseLeave)
    graph.on('edge:added', handleEdgeAdded)
    graph.on('edge:connected', handleEdgeConnected)
    graph.on('edge:selected', handleEdgeSelected)
    graph.on('edge:unselected', handleEdgeUnselected)
    graph.on('blank:click', handleBlankClick)
    graph.on('scale', handleScale)

    return () => {
      graph.off('node:mouseenter', handleNodeMouseEnter)
      graph.off('node:mouseleave', handleNodeMouseLeave)
      graph.off('node:added', handleNodeAdded)
      graph.off('node:moved', handleNodeMoved)
      graph.off('node:resized', handleNodeResized)
      graph.off('node:selected', handleNodeSelected)
      graph.off('node:unselected', handleNodeUnselected)
      graph.off('node:dblclick', handleNodeDblClick)
      graph.off('edge:mouseenter', handleEdgeMouseEnter)
      graph.off('edge:mouseleave', handleEdgeMouseLeave)
      graph.off('edge:added', handleEdgeAdded)
      graph.off('edge:connected', handleEdgeConnected)
      graph.off('edge:selected', handleEdgeSelected)
      graph.off('edge:unselected', handleEdgeUnselected)
      graph.off('blank:click', handleBlankClick)
      graph.off('scale', handleScale)
    }
  }, [
    graph,
    nodes,
    onNodeAdded,
    onNodeMoved,
    onNodeResized,
    onNodeSelected,
    onEdgeAdded,
    onEdgeConnected,
    onEdgeSelected,
    onClearSelection,
    onZoomChange,
    onShowERRelationSelector,
    createNodeEventData,
    createEdgeEventData,
  ])
}

export const useEdgeLabelEditor = (
  graph: Graph | null,
  isDark: boolean,
  onUpdateEdge: (id: string, updates: any) => void
) => {
  const isDarkRef = useRef(isDark)
  isDarkRef.current = isDark

  useEffect(() => {
    if (!graph) return

    const handleEdgeDblClick = ({ edge, e }: { edge: Edge; e: any }) => {
      e.stopPropagation()
      
      const labels = edge.getLabels()
      const hasExistingLabel = labels && labels.length > 0
      const currentText = hasExistingLabel 
        ? ((labels[0].attrs?.text?.text as string) || '') 
        : ''
      
      const currentIsDark = isDarkRef.current
      const bgColor = currentIsDark ? '#2c2c2c' : '#ffffff'
      const textColor = currentIsDark ? '#e0e0e0' : '#333333'
      const borderColor = currentIsDark ? '#18a0fb' : '#1890ff'
      
      const editor = document.createElement('div')
      editor.contentEditable = 'true'
      editor.innerText = currentText
      editor.style.cssText = `
        position: absolute;
        background: ${bgColor};
        color: ${textColor};
        border: 2px solid ${borderColor};
        padding: 4px 8px;
        border-radius: 4px;
        outline: none;
        min-width: 60px;
        text-align: center;
        font-size: 12px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `
      
      editor.style.left = `${e.clientX - 30}px`
      editor.style.top = `${e.clientY - 15}px`
      
      document.body.appendChild(editor)
      editor.focus()
      
      const range = document.createRange()
      range.selectNodeContents(editor)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      
      const save = () => {
        const newText = editor.innerText.trim()
        
        if (hasExistingLabel) {
          const connector = ConnectorRenderer.fromX6Edge(edge)
          const updatedLabels = connector.labels?.map((label: any, index: number) => {
            if (index === 0) {
              return { ...label, text: newText }
            }
            return label
          }) || []
          onUpdateEdge(edge.id, { labels: updatedLabels })
          
          const labelConfig = {
            attrs: {
              text: {
                text: newText,
              },
            },
          }
          edge.setLabelAt(0, labelConfig)
        } else {
          const newLabel = {
            id: uuidv4(),
            text: newText,
            position: 0.5,
            fontSize: 12,
            color: '#333333',
          }
          const connector = ConnectorRenderer.fromX6Edge(edge)
          const updatedLabels = [...(connector.labels || []), newLabel]
          onUpdateEdge(edge.id, { labels: updatedLabels })
          
          ConnectorRenderer.updateEdgeLabel(edge, newLabel, 0)
        }
        
        document.body.removeChild(editor)
      }
      
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
    }

    graph.on('edge:dblclick', handleEdgeDblClick)

    return () => {
      graph.off('edge:dblclick', handleEdgeDblClick)
    }
  }, [graph, onUpdateEdge])
}
