import React from 'react'
import {
  SelectOutlined,
  BorderOutlined,
  Loading3QuartersOutlined,
  WarningOutlined,
  DeleteOutlined,
  CopyOutlined,
  SnippetsOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  SaveOutlined,
  DownloadOutlined,
  BgColorsOutlined,
  AppstoreOutlined,
  GatewayOutlined,
  NodeIndexOutlined,
  MoonOutlined,
  SunOutlined,
  BorderOuterOutlined,
  DotChartOutlined,
  CloseSquareOutlined,
  ClearOutlined,
  HistoryOutlined,
  FileImageOutlined,
  FileOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import { HandIcon } from './HandIcon'
import { Button, Space, Divider, Tooltip, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import useX6GraphStore from '@stores/x6GraphStore'
import { useTheme } from '@hooks/useTheme'
import styles from './toolbar.module.css'

interface ToolbarProps {
  onNewFile?: () => void
  onOpenFile?: () => void
  onSaveFile?: () => void
  onExportPng?: () => void
  onShowTemplates?: () => void
  onShowStencils?: () => void
  onShowHistory?: () => void
  onShowScriptEditor?: () => void
  onShowSqlExport?: () => void
  onShowSqlImport?: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNewFile,
  onOpenFile,
  onSaveFile,
  onExportPng,
  onShowTemplates,
  onShowStencils,
  onShowHistory,
  onShowScriptEditor,
  onShowSqlExport,
  onShowSqlImport,
}) => {
  const {
    currentTool,
    setTool,
    gridEnabled,
    toggleGrid,
    snapToGrid,
    toggleSnapToGrid,
    gridType,
    setGridType,
    canvasBgColor,
    setCanvasBgColor,
    setZoom,
    selectedNodeIds,
    alignNodes,
    distributeNodes,
    undo,
    redo,
    newGraph,
    exportToPng,
    exportToSvg,
    deleteNodes,
    graph,
  } = useX6GraphStore()

  const { isDark, toggleTheme } = useTheme()

  const hasSelection = selectedNodeIds.length > 0
  const hasMultipleSelection = selectedNodeIds.length > 1

  // Grid style menu items
  const gridStyleItems: MenuProps['items'] = [
    {
      key: 'dot',
      label: '点状网格',
      icon: <DotChartOutlined />,
      onClick: () => setGridType('dot'),
    },
    {
      key: 'line',
      label: '线状网格',
      icon: <BorderOuterOutlined />,
      onClick: () => setGridType('line'),
    },
    {
      key: 'none',
      label: '隐藏网格',
      icon: <CloseSquareOutlined />,
      onClick: () => setGridType('none'),
    },
  ]

  // Canvas background color options
  const bgColorItems: MenuProps['items'] = [
    {
      key: '#f0f2f5',
      label: '默认灰',
      onClick: () => setCanvasBgColor('#f0f2f5'),
    },
    {
      key: '#ffffff',
      label: '白色',
      onClick: () => setCanvasBgColor('#ffffff'),
    },
    {
      key: '#1e1e1e',
      label: '深色',
      onClick: () => setCanvasBgColor('#1e1e1e'),
    },
    {
      key: '#f6ffed',
      label: '浅绿',
      onClick: () => setCanvasBgColor('#f6ffed'),
    },
    {
      key: '#e6f7ff',
      label: '浅蓝',
      onClick: () => setCanvasBgColor('#e6f7ff'),
    },
  ]

  const handleToolClick = (tool: string) => {
    setTool(tool)
  }

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.1, 0.1))
  }

  const handleZoomReset = () => {
    setZoom(1)
  }

  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    alignNodes(alignment)
  }

  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    distributeNodes(direction)
  }

  const handleNewFile = () => {
    newGraph()
    onNewFile?.()
  }

  const handleExportPng = async () => {
    try {
      const dataUrl = await exportToPng()
      const link = document.createElement('a')
      link.download = 'visiodraw-export.png'
      link.href = dataUrl
      link.click()
      onExportPng?.()
    } catch (error) {
      console.error('Export PNG failed:', error)
    }
  }

  const handleExportSvg = async (transparent: boolean = false) => {
    try {
      const svgString = await exportToSvg({ transparent, padding: 10 })
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `visiodraw-export${transparent ? '-transparent' : ''}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export SVG failed:', error)
    }
  }

  // Export menu items
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'png',
      label: '导出 PNG',
      icon: <FileImageOutlined />,
      onClick: handleExportPng,
    },
    {
      key: 'svg',
      label: '导出 SVG',
      icon: <FileOutlined />,
      onClick: () => handleExportSvg(false),
    },
    {
      key: 'svg-transparent',
      label: '导出 SVG (透明背景)',
      icon: <FileOutlined />,
      onClick: () => handleExportSvg(true),
    },
    { type: 'divider' },
    {
      key: 'sql',
      label: '导出 SQL (ER图)',
      icon: <CodeOutlined />,
      onClick: onShowSqlExport,
    },
    {
      key: 'sql-import',
      label: '从 SQL 导入 ER图',
      icon: <DatabaseOutlined />,
      onClick: onShowSqlImport,
    },
  ]

  return (
    <div data-testid="toolbar" className={styles.toolbar}>
      {/* 文件操作组 */}
      <div className={styles.group}>
        <Space>
          <Tooltip title="新建 (Ctrl+N)">
            <Button
              data-testid="btn-new"
              icon={<FileAddOutlined />}
              onClick={handleNewFile}
              className={styles.toolbarButton}
            >
              新建
            </Button>
          </Tooltip>
          <Tooltip title="打开 (Ctrl+O)">
            <Button
              data-testid="btn-open"
              icon={<FolderOpenOutlined />}
              onClick={onOpenFile}
              className={styles.toolbarButton}
            >
              打开
            </Button>
          </Tooltip>
          <Tooltip title="保存 (Ctrl+S)">
            <Button
              data-testid="btn-save"
              icon={<SaveOutlined />}
              onClick={onSaveFile}
              className={styles.toolbarButton}
            >
              保存
            </Button>
          </Tooltip>
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomLeft">
            <Tooltip title="导出">
              <Button
                data-testid="btn-export"
                icon={<DownloadOutlined />}
                className={styles.toolbarButton}
              >
                导出
              </Button>
            </Tooltip>
          </Dropdown>
        </Space>
      </div>

      <Divider type="vertical" className={styles.divider} />

      {/* 工具选择组 */}
      <div className={styles.group}>
        <Space>
          <Tooltip title="选择工具 (V)">
            <Button
              data-testid="tool-select"
              type={currentTool === 'select' ? 'primary' : 'default'}
              icon={<SelectOutlined />}
              onClick={() => handleToolClick('select')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="小手/拖拽画布 (H)">
            <Button
              data-testid="tool-hand"
              type={currentTool === 'hand' ? 'primary' : 'default'}
              icon={<HandIcon />}
              onClick={() => handleToolClick('hand')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="矩形 (R)">
            <Button
              data-testid="tool-rectangle"
              type={currentTool === 'rectangle' ? 'primary' : 'default'}
              icon={<BorderOutlined />}
              onClick={() => handleToolClick('rectangle')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="圆形 (C)">
            <Button
              data-testid="tool-circle"
              type={currentTool === 'circle' ? 'primary' : 'default'}
              icon={<Loading3QuartersOutlined style={{ transform: 'rotate(45deg)' }} />}
              onClick={() => handleToolClick('circle')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="三角形 (T)">
            <Button
              data-testid="tool-triangle"
              type={currentTool === 'triangle' ? 'primary' : 'default'}
              icon={<WarningOutlined />}
              onClick={() => handleToolClick('triangle')}
              className={styles.toolbarButton}
            />
          </Tooltip>
        </Space>
      </div>

      <Divider type="vertical" className={styles.divider} />

      {/* 编辑操作组 */}
      <div className={styles.group}>
        <Space>
          <Tooltip title="撤销 (Ctrl+Z)">
            <Button
              data-testid="btn-undo"
              icon={<UndoOutlined />}
              onClick={undo}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="重做 (Ctrl+Y / Ctrl+Shift+Z)">
            <Button
              data-testid="btn-redo"
              icon={<RedoOutlined />}
              onClick={redo}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="复制 (Ctrl+C)">
            <Button
              data-testid="btn-copy"
              icon={<CopyOutlined />}
              disabled={!hasSelection}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="粘贴 (Ctrl+V)">
            <Button
              data-testid="btn-paste"
              icon={<SnippetsOutlined />}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="复制并粘贴 (Ctrl+D)">
            <Button
              data-testid="btn-duplicate"
              icon={<CopyOutlined />}
              disabled={!hasSelection}
              className={styles.toolbarButton}
            >
              复制并粘贴
            </Button>
          </Tooltip>
          <Tooltip title="删除 (Delete)">
            <Button
              data-testid="btn-delete"
              icon={<DeleteOutlined />}
              disabled={!hasSelection}
              danger
              className={styles.toolbarButton}
              onClick={() => {
                if (graph) {
                  const selectedCells = graph.getSelectedCells()
                  const selectedNodeIds = selectedCells
                    .filter((cell: any) => cell.isNode())
                    .map((cell: any) => cell.id)
                  const selectedEdgeIds = selectedCells
                    .filter((cell: any) => cell.isEdge())
                    .map((cell: any) => cell.id)
                  deleteNodes(selectedNodeIds)
                  selectedEdgeIds.forEach((id: string) => {
                    const cell = graph.getCellById(id)
                    if (cell) {
                      graph.removeCell(cell)
                    }
                  })
                }
              }}
            />
          </Tooltip>
          <Tooltip title="清空画布">
            <Button
              data-testid="btn-clear-canvas"
              icon={<ClearOutlined />}
              onClick={handleNewFile}
              className={styles.toolbarButton}
            >
              清空
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Divider type="vertical" className={styles.divider} />

      {/* 对齐操作组 */}
      <div className={styles.group}>
        <Space>
          <Tooltip title="左对齐">
            <Button
              data-testid="btn-align-left"
              icon={<AlignLeftOutlined />}
              disabled={!hasMultipleSelection}
              onClick={() => handleAlign('left')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="水平居中">
            <Button
              data-testid="btn-align-center"
              icon={<AlignCenterOutlined />}
              disabled={!hasMultipleSelection}
              onClick={() => handleAlign('center')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="右对齐">
            <Button
              data-testid="btn-align-right"
              icon={<AlignRightOutlined />}
              disabled={!hasMultipleSelection}
              onClick={() => handleAlign('right')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="顶端对齐">
            <Button
              data-testid="btn-align-top"
              icon={<VerticalAlignTopOutlined />}
              disabled={!hasMultipleSelection}
              onClick={() => handleAlign('top')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="垂直居中">
            <Button
              data-testid="btn-align-middle"
              icon={<VerticalAlignMiddleOutlined />}
              disabled={!hasMultipleSelection}
              onClick={() => handleAlign('middle')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="底端对齐">
            <Button
              data-testid="btn-align-bottom"
              icon={<VerticalAlignBottomOutlined />}
              disabled={!hasMultipleSelection}
              onClick={() => handleAlign('bottom')}
              className={styles.toolbarButton}
            />
          </Tooltip>
        </Space>
      </div>

      <Divider type="vertical" className={styles.divider} />

      {/* 分布操作组 */}
      <div className={styles.group}>
        <Space>
          <Tooltip title="水平分布">
            <Button
              data-testid="btn-distribute-h"
              icon={<ColumnWidthOutlined />}
              disabled={selectedNodeIds.length < 3}
              onClick={() => handleDistribute('horizontal')}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="垂直分布">
            <Button
              data-testid="btn-distribute-v"
              icon={<ColumnHeightOutlined />}
              disabled={selectedNodeIds.length < 3}
              onClick={() => handleDistribute('vertical')}
              className={styles.toolbarButton}
            />
          </Tooltip>
        </Space>
      </div>

      <Divider type="vertical" className={styles.divider} />

      {/* 视图操作组 */}
      <div className={styles.group}>
        <Space>
          <Tooltip title="放大 (Ctrl++)">
            <Button
              data-testid="btn-zoom-in"
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="缩小 (Ctrl+-)">
            <Button
              data-testid="btn-zoom-out"
              icon={<ZoomOutOutlined />}
              onClick={handleZoomOut}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="100% (Ctrl+0)">
            <Button
              data-testid="btn-zoom-100"
              icon={<span style={{ fontSize: 12, fontWeight: 'bold' }}>1:1</span>}
              onClick={() => setZoom(1)}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="适应窗口 (Ctrl+1)">
            <Button
              data-testid="btn-zoom-fit"
              icon={<ExpandOutlined />}
              onClick={() => {
                const graph = useX6GraphStore.getState().graph
                if (graph) {
                  graph.zoomToFit({ padding: 20 })
                  setZoom(graph.zoom())
                }
              }}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="显示/隐藏网格">
            <Button
              data-testid="toggle-grid"
              type={gridEnabled ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={toggleGrid}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="吸附到网格">
            <Button
              data-testid="toggle-snap"
              type={snapToGrid ? 'primary' : 'default'}
              icon={<GatewayOutlined />}
              onClick={toggleSnapToGrid}
              className={styles.toolbarButton}
            />
          </Tooltip>
          <Tooltip title="网格样式">
            <Dropdown menu={{ items: gridStyleItems }} placement="bottom">
              <Button
                data-testid="grid-style-selector"
                icon={gridType === 'dot' ? <DotChartOutlined /> : gridType === 'line' ? <BorderOuterOutlined /> : <CloseSquareOutlined />}
                className={styles.toolbarButton}
              />
            </Dropdown>
          </Tooltip>
          <Tooltip title="画布背景色">
            <Dropdown menu={{ items: bgColorItems }} placement="bottom">
              <Button
                data-testid="canvas-bg-color"
                icon={<BgColorsOutlined />}
                style={{ backgroundColor: canvasBgColor }}
                className={styles.toolbarButton}
              />
            </Dropdown>
          </Tooltip>
        </Space>
      </div>

      <Divider type="vertical" className={styles.divider} />

      {/* 模板与资源组 */}
      <div className={styles.group}>
        <Space>
          <Tooltip title="模板库">
            <Button
              data-testid="btn-templates"
              icon={<BgColorsOutlined />}
              onClick={onShowTemplates}
              className={styles.toolbarButton}
            >
              模板
            </Button>
          </Tooltip>
          <Tooltip title="模具浏览器">
            <Button
              data-testid="btn-stencils"
              icon={<NodeIndexOutlined />}
              onClick={onShowStencils}
              className={styles.toolbarButton}
            >
              模具
            </Button>
          </Tooltip>
          <Tooltip title="历史记录">
            <Button
              data-testid="btn-history"
              icon={<HistoryOutlined />}
              onClick={onShowHistory}
              className={styles.toolbarButton}
            >
              历史
            </Button>
          </Tooltip>
          <Tooltip title="脚本编辑器">
            <Button
              data-testid="btn-script-editor"
              icon={<CodeOutlined />}
              onClick={onShowScriptEditor}
              className={styles.toolbarButton}
            >
              脚本
            </Button>
          </Tooltip>
        </Space>
      </div>

      <div className={styles.spacer} />

      {/* 主题切换 */}
      <div className={styles.group}>
        <Tooltip title={isDark ? '切换到浅色主题' : '切换到深色主题'}>
          <Button
            data-testid="theme-toggle"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            className={styles.toolbarButton}
          />
        </Tooltip>
      </div>
    </div>
  )
}

export default Toolbar
