import { Graph, Node, Edge } from '@antv/x6'
import type { ERRelationType } from '../../types/connection'

export interface GraphInitOptions {
  container: HTMLElement
  isDark: boolean
  canvasBgColor: string
  gridEnabled: boolean
  gridType: 'dot' | 'line' | 'none'
  gridSize: number
}

export interface GraphThemeConfig {
  isDark: boolean
  canvasBgColor: string
  gridEnabled: boolean
  gridType: 'dot' | 'line' | 'none'
}

export interface NodeEventData {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  text: string
  connectionPoints?: any[]
}

export interface EdgeEventData {
  id: string
  sourceShapeId: string
  sourcePointId: string
  targetShapeId: string
  targetPointId: string
  style: string
  lineStyle: string
  startStyle: string
  endStyle: string
  stroke: string
  strokeWidth: number
  labels?: any[]
}

export interface ERRelationInfo {
  edgeId: string
  sourceNode: { id: string; type: string; name: string } | null
  targetNode: { id: string; type: string; name: string } | null
}

export interface UseGraphEventsOptions {
  graph: Graph | null
  isDark: boolean
  onNodeAdded: (data: NodeEventData) => void
  onNodeMoved: (id: string, x: number, y: number) => void
  onNodeResized: (id: string, width: number, height: number) => void
  onNodeSelected: (id: string) => void
  onEdgeAdded: (data: EdgeEventData) => void
  onEdgeConnected: (data: EdgeEventData, isNew: boolean) => void
  onEdgeSelected: (id: string) => void
  onClearSelection: () => void
  onZoomChange: (zoom: number) => void
  onShowERRelationSelector: (info: ERRelationInfo) => void
  nodes: any[]
}

export interface UseKeyboardShortcutsOptions {
  graph: Graph | null
  nodes: any[]
  selectedNodeIds: string[]
  onDeleteNodes: (ids: string[]) => void
  onDeleteEdge: (id: string) => void
  onCopy: () => void
  onCut: () => void
  onPaste: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onZoomToFit: () => void
  onClearSelection: () => void
  onSetTool: (tool: string) => void
  onAddNode: (node: any) => void
  onUpdateNode: (id: string, updates: any) => void
}
