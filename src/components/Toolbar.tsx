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
} from '@ant-design/icons'
import { Button, Space, Divider, Tooltip, Tabs } from 'antd'
import useX6GraphStore from '@stores/x6GraphStore'

const { TabPane } = Tabs

interface ToolbarProps {
  onNewFile?: () => void
  onOpenFile?: () => void
  onSaveFile?: () => void
  onExportPng?: () => void
  onShowTemplates?: () => void
  onShowStencils?: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNewFile,
  onOpenFile,
  onSaveFile,
  onExportPng,
  onShowTemplates,
  onShowStencils,
}) => {
  const {
    currentTool,
    setTool,
    gridEnabled,
    toggleGrid,
    snapToGrid,
    toggleSnapToGrid,
    zoom,
    setZoom,
    selectedNodeIds,
    alignNodes,
    distributeNodes,
    undo,
    redo,
    newGraph,
    exportToPng,
  } = useX6GraphStore()

  const hasSelection = selectedNodeIds.length > 0
  const hasMultipleSelection = selectedNodeIds.length > 1

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
      console.error('Export failed:', error)
    }
  }

  return (
    <div data-testid="toolbar" style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
      <Tabs defaultActiveKey="home" size="small" style={{ margin: 0 }}>
        <TabPane tab="开始" key="home">
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* 工具选择 */}
            <Space>
              <Tooltip title="选择工具 (V)">
                <Button
                  data-testid="tool-select"
                  type={currentTool === 'select' ? 'primary' : 'default'}
                  icon={<SelectOutlined />}
                  onClick={() => handleToolClick('select')}
                />
              </Tooltip>
              <Tooltip title="矩形 (R)">
                <Button
                  data-testid="tool-rectangle"
                  type={currentTool === 'rectangle' ? 'primary' : 'default'}
                  icon={<BorderOutlined />}
                  onClick={() => handleToolClick('rectangle')}
                />
              </Tooltip>
              <Tooltip title="圆形 (C)">
                <Button
                  data-testid="tool-circle"
                  type={currentTool === 'circle' ? 'primary' : 'default'}
                  icon={<Loading3QuartersOutlined style={{ transform: 'rotate(45deg)' }} />}
                  onClick={() => handleToolClick('circle')}
                />
              </Tooltip>
              <Tooltip title="三角形 (T)">
                <Button
                  data-testid="tool-triangle"
                  type={currentTool === 'triangle' ? 'primary' : 'default'}
                  icon={<WarningOutlined />}
                  onClick={() => handleToolClick('triangle')}
                />
              </Tooltip>
            </Space>

            <Divider type="vertical" />

            {/* 编辑操作 */}
            <Space>
              <Tooltip title="撤销 (Ctrl+Z)">
                <Button icon={<UndoOutlined />} onClick={undo} />
              </Tooltip>
              <Tooltip title="重做 (Ctrl+Y)">
                <Button icon={<RedoOutlined />} onClick={redo} />
              </Tooltip>
              <Tooltip title="复制 (Ctrl+C)">
                <Button icon={<CopyOutlined />} disabled={!hasSelection} />
              </Tooltip>
              <Tooltip title="粘贴 (Ctrl+V)">
                <Button icon={<SnippetsOutlined />} />
              </Tooltip>
              <Tooltip title="删除 (Delete)">
                <Button icon={<DeleteOutlined />} disabled={!hasSelection} danger />
              </Tooltip>
            </Space>

            <Divider type="vertical" />

            {/* 视图操作 */}
            <Space>
              <Tooltip title="放大 (Ctrl++)">
                <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
              </Tooltip>
              <Tooltip title="缩小 (Ctrl+-)">
                <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
              </Tooltip>
              <Tooltip title="适应窗口 (Ctrl+0)">
                <Button icon={<ExpandOutlined />} onClick={handleZoomReset} />
              </Tooltip>
              <Tooltip title="显示/隐藏网格">
                <Button
                  data-testid="toggle-grid"
                  type={gridEnabled ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={toggleGrid}
                />
              </Tooltip>
              <Tooltip title="吸附到网格">
                <Button
                  data-testid="toggle-snap"
                  type={snapToGrid ? 'primary' : 'default'}
                  icon={<GatewayOutlined />}
                  onClick={toggleSnapToGrid}
                />
              </Tooltip>
            </Space>
          </div>
        </TabPane>

        <TabPane tab="布局" key="layout">
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* 对齐操作 */}
            <Space>
              <Tooltip title="左对齐">
                <Button
                  icon={<AlignLeftOutlined />}
                  disabled={!hasMultipleSelection}
                  onClick={() => handleAlign('left')}
                />
              </Tooltip>
              <Tooltip title="水平居中">
                <Button
                  icon={<AlignCenterOutlined />}
                  disabled={!hasMultipleSelection}
                  onClick={() => handleAlign('center')}
                />
              </Tooltip>
              <Tooltip title="右对齐">
                <Button
                  icon={<AlignRightOutlined />}
                  disabled={!hasMultipleSelection}
                  onClick={() => handleAlign('right')}
                />
              </Tooltip>
            </Space>

            <Divider type="vertical" />

            <Space>
              <Tooltip title="顶端对齐">
                <Button
                  icon={<VerticalAlignTopOutlined />}
                  disabled={!hasMultipleSelection}
                  onClick={() => handleAlign('top')}
                />
              </Tooltip>
              <Tooltip title="垂直居中">
                <Button
                  icon={<VerticalAlignMiddleOutlined />}
                  disabled={!hasMultipleSelection}
                  onClick={() => handleAlign('middle')}
                />
              </Tooltip>
              <Tooltip title="底端对齐">
                <Button
                  icon={<VerticalAlignBottomOutlined />}
                  disabled={!hasMultipleSelection}
                  onClick={() => handleAlign('bottom')}
                />
              </Tooltip>
            </Space>

            <Divider type="vertical" />

            {/* 分布操作 */}
            <Space>
              <Tooltip title="水平分布">
                <Button
                  icon={<ColumnWidthOutlined />}
                  disabled={selectedNodeIds.length < 3}
                  onClick={() => handleDistribute('horizontal')}
                />
              </Tooltip>
              <Tooltip title="垂直分布">
                <Button
                  icon={<ColumnHeightOutlined />}
                  disabled={selectedNodeIds.length < 3}
                  onClick={() => handleDistribute('vertical')}
                />
              </Tooltip>
            </Space>
          </div>
        </TabPane>

        <TabPane tab="文件" key="file">
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Space>
              <Tooltip title="新建 (Ctrl+N)">
                <Button icon={<FileAddOutlined />} onClick={handleNewFile}>
                  新建
                </Button>
              </Tooltip>
              <Tooltip title="打开 (Ctrl+O)">
                <Button icon={<FolderOpenOutlined />} onClick={onOpenFile}>
                  打开
                </Button>
              </Tooltip>
              <Tooltip title="保存 (Ctrl+S)">
                <Button icon={<SaveOutlined />} onClick={onSaveFile}>
                  保存
                </Button>
              </Tooltip>
              <Tooltip title="导出 PNG">
                <Button icon={<DownloadOutlined />} onClick={handleExportPng}>
                  导出 PNG
                </Button>
              </Tooltip>
            </Space>

            <Divider type="vertical" />

            <Space>
              <Tooltip title="模板库">
                <Button icon={<BgColorsOutlined />} onClick={onShowTemplates}>
                  模板库
                </Button>
              </Tooltip>
              <Tooltip title="模具浏览器">
                <Button icon={<NodeIndexOutlined />} onClick={onShowStencils}>
                  模具浏览器
                </Button>
              </Tooltip>
            </Space>
          </div>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default Toolbar
