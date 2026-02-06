import React, { useState, useMemo } from 'react'
import { Button, Tooltip, Space, Tabs, Dropdown } from 'antd'
import type { TabsProps } from 'antd'
import {
  SelectOutlined,
  BorderOutlined,
  LineOutlined,
  FontSizeOutlined,
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  AppstoreOutlined,
  PrinterOutlined,
  ExportOutlined,
  FileExcelOutlined,
  GroupOutlined,
  UngroupOutlined,
  CopyOutlined,
  ScissorOutlined,
  SnippetsOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons'
import useCanvasStore from '@stores/canvasStore'
import TemplateGallery from '../TemplateGallery'
import PrintPreview from '../PrintPreview'
import ExcelImportDialog from '../ExcelImportDialog'
import { exportToPng, exportToSvg } from '@utils/exportUtils'
import './styles.css'

interface ToolbarProps {
  onAlignLeft?: () => void
  onAlignCenter?: () => void
  onAlignRight?: () => void
  onAlignTop?: () => void
  onAlignMiddle?: () => void
  onAlignBottom?: () => void
  onDistributeHorizontal?: () => void
  onDistributeVertical?: () => void
}

const tools = [
  { key: 'select', icon: <SelectOutlined />, title: '选择工具 (V)' },
  { key: 'rectangle', icon: <BorderOutlined />, title: '矩形 (R)' },
  { key: 'circle', icon: <BorderOutlined />, title: '圆形 (C)' },
  { key: 'line', icon: <LineOutlined />, title: '线条 (L)' },
  { key: 'text', icon: <FontSizeOutlined />, title: '文本 (T)' },
  { key: 'connector', icon: <LineOutlined />, title: '连接线 (N)' },
]

const Toolbar: React.FC<ToolbarProps> = ({
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeHorizontal,
  onDistributeVertical,
}) => {
  const {
    currentTool,
    setTool,
    undo,
    redo,
    zoom,
    setZoom,
    newCanvas,
    gridEnabled,
    toggleGrid,
    canvas,
    selectedShapeId,
    selectedShapeIds,
  } = useCanvasStore()

  const [isTemplateGalleryVisible, setIsTemplateGalleryVisible] = useState(false)
  const [isPrintPreviewVisible, setIsPrintPreviewVisible] = useState(false)
  const [isExcelImportVisible, setIsExcelImportVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  const hasSelection = !!selectedShapeId
  const hasMultipleSelection = selectedShapeIds.length >= 2
  const hasThreeOrMoreSelection = selectedShapeIds.length >= 3

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 3)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.1)
    setZoom(newZoom)
  }

  const handleZoomFit = () => {
    setZoom(1)
  }

  // 使用useMemo缓存tabItems，避免每次渲染都创建新的对象
  const tabItems: TabsProps['items'] = useMemo(() => [
    {
      key: 'home',
      label: '开始',
      children: (
        <div className="ribbon-tab-content">
          {/* 剪贴板组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">剪贴板</div>
            <Space direction="vertical" size="small">
              <Space>
                <Tooltip title="剪切 (Ctrl+X)">
                  <Button icon={<ScissorOutlined />} disabled={!hasSelection} />
                </Tooltip>
                <Tooltip title="复制 (Ctrl+C)">
                  <Button icon={<CopyOutlined />} disabled={!hasSelection} />
                </Tooltip>
              </Space>
              <Space>
                <Tooltip title="粘贴 (Ctrl+V)">
                  <Button icon={<SnippetsOutlined />} />
                </Tooltip>
                <Tooltip title="删除 (Delete)">
                  <Button icon={<DeleteOutlined />} danger disabled={!hasSelection} />
                </Tooltip>
              </Space>
            </Space>
          </div>

          <div className="ribbon-divider" />

          {/* 绘图工具组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">绘图工具</div>
            <Space wrap>
              {tools.map((tool) => (
                <Tooltip title={tool.title} key={tool.key}>
                  <Button
                    icon={tool.icon}
                    type={currentTool === tool.key ? 'primary' : 'default'}
                    onClick={() => setTool(tool.key)}
                    className={currentTool === tool.key ? 'tool-active' : ''}
                  >
                    {tool.title.split(' ')[0]}
                  </Button>
                </Tooltip>
              ))}
            </Space>
          </div>

          <div className="ribbon-divider" />

          {/* 编辑操作组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">编辑操作</div>
            <Space direction="vertical" size="small">
              <Space>
                <Tooltip title="撤销 (Ctrl+Z)">
                  <Button icon={<UndoOutlined />} onClick={undo} />
                </Tooltip>
                <Tooltip title="重做 (Ctrl+Y)">
                  <Button icon={<RedoOutlined />} onClick={redo} />
                </Tooltip>
              </Space>
              <Space>
                <Tooltip title="组合 (Ctrl+G)">
                  <Button icon={<GroupOutlined />} disabled={!hasSelection} />
                </Tooltip>
                <Tooltip title="取消组合 (Ctrl+Shift+G)">
                  <Button icon={<UngroupOutlined />} disabled={!hasSelection} />
                </Tooltip>
              </Space>
            </Space>
          </div>

          <div className="ribbon-divider" />

          {/* 视图控制组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">视图</div>
            <Space direction="vertical" size="small">
              <Space>
                <Tooltip title="放大">
                  <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                </Tooltip>
                <span className="zoom-display">{Math.round(zoom * 100)}%</span>
                <Tooltip title="缩小">
                  <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
                </Tooltip>
              </Space>
              <Space>
                <Tooltip title="适应窗口">
                  <Button icon={<ExpandOutlined />} onClick={handleZoomFit} />
                </Tooltip>
                <Tooltip title={gridEnabled ? '隐藏网格' : '显示网格'}>
                  <Button
                    type={gridEnabled ? 'primary' : 'default'}
                    onClick={toggleGrid}
                    icon={gridEnabled ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  >
                    网格
                  </Button>
                </Tooltip>
              </Space>
            </Space>
          </div>
        </div>
      ),
    },
    {
      key: 'layout',
      label: '布局',
      children: (
        <div className="ribbon-tab-content">
          {/* 对齐组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">对齐</div>
            <Space direction="vertical" size="small">
              <Space>
                <Tooltip title="左对齐">
                  <Button
                    icon={<AlignLeftOutlined />}
                    onClick={onAlignLeft}
                    disabled={!hasMultipleSelection}
                  />
                </Tooltip>
                <Tooltip title="水平居中">
                  <Button
                    icon={<AlignCenterOutlined />}
                    onClick={onAlignCenter}
                    disabled={!hasMultipleSelection}
                  />
                </Tooltip>
                <Tooltip title="右对齐">
                  <Button
                    icon={<AlignRightOutlined />}
                    onClick={onAlignRight}
                    disabled={!hasMultipleSelection}
                  />
                </Tooltip>
              </Space>
              <Space>
                <Tooltip title="顶端对齐">
                  <Button
                    icon={<VerticalAlignTopOutlined />}
                    onClick={onAlignTop}
                    disabled={!hasMultipleSelection}
                  />
                </Tooltip>
                <Tooltip title="垂直居中">
                  <Button
                    icon={<VerticalAlignMiddleOutlined />}
                    onClick={onAlignMiddle}
                    disabled={!hasMultipleSelection}
                  />
                </Tooltip>
                <Tooltip title="底端对齐">
                  <Button
                    icon={<VerticalAlignBottomOutlined />}
                    onClick={onAlignBottom}
                    disabled={!hasMultipleSelection}
                  />
                </Tooltip>
              </Space>
            </Space>
          </div>

          <div className="ribbon-divider" />

          {/* 分布组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">分布</div>
            <Space direction="vertical" size="small">
              <Tooltip title="水平分布（需要3个或更多图形）">
                <Button onClick={onDistributeHorizontal} disabled={!hasThreeOrMoreSelection}>
                  水平分布
                </Button>
              </Tooltip>
              <Tooltip title="垂直分布（需要3个或更多图形）">
                <Button onClick={onDistributeVertical} disabled={!hasThreeOrMoreSelection}>
                  垂直分布
                </Button>
              </Tooltip>
            </Space>
          </div>
        </div>
      ),
    },
    {
      key: 'file',
      label: '文件',
      children: (
        <div className="ribbon-tab-content">
          {/* 文件操作组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">文件操作</div>
            <Space direction="vertical" size="small">
              <Tooltip title="新建 (Ctrl+N)">
                <Button icon={<FileAddOutlined />} onClick={newCanvas}>
                  新建
                </Button>
              </Tooltip>
              <Tooltip title="打开 (Ctrl+O)">
                <Button icon={<FolderOpenOutlined />}>打开</Button>
              </Tooltip>
              <Tooltip title="保存 (Ctrl+S)">
                <Button icon={<SaveOutlined />}>保存</Button>
              </Tooltip>
            </Space>
          </div>

          <div className="ribbon-divider" />

          {/* 导入导出组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">导入导出</div>
            <Space direction="vertical" size="small">
              <Tooltip title="导入Excel">
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => setIsExcelImportVisible(true)}
                >
                  Excel导入
                </Button>
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'png',
                      label: '导出为 PNG',
                      onClick: () => {
                        if (canvas) {
                          const dataUrl = exportToPng(canvas)
                          const link = document.createElement('a')
                          link.href = dataUrl
                          link.download = `export-${Date.now()}.png`
                          link.click()
                        }
                      },
                    },
                    {
                      key: 'svg',
                      label: '导出为 SVG',
                      onClick: () => {
                        if (canvas) {
                          const svg = exportToSvg(canvas)
                          const blob = new Blob([svg], { type: 'image/svg+xml' })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `export-${Date.now()}.svg`
                          link.click()
                          URL.revokeObjectURL(url)
                        }
                      },
                    },
                  ],
                }}
              >
                <Button icon={<ExportOutlined />}>导出</Button>
              </Dropdown>
            </Space>
          </div>

          <div className="ribbon-divider" />

          {/* 打印组 */}
          <div className="ribbon-group">
            <div className="ribbon-group-title">打印</div>
            <Space direction="vertical" size="small">
              <Tooltip title="打印预览">
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => setIsPrintPreviewVisible(true)}
                >
                  打印
                </Button>
              </Tooltip>
              <Tooltip title="模板库">
                <Button
                  icon={<AppstoreOutlined />}
                  onClick={() => setIsTemplateGalleryVisible(true)}
                >
                  模板
                </Button>
              </Tooltip>
            </Space>
          </div>
        </div>
      ),
    },
  ], [
    hasSelection,
    hasMultipleSelection,
    hasThreeOrMoreSelection,
    currentTool,
    zoom,
    gridEnabled,
    canvas,
    onAlignLeft,
    onAlignCenter,
    onAlignRight,
    onAlignTop,
    onAlignMiddle,
    onAlignBottom,
    onDistributeHorizontal,
    onDistributeVertical,
    setTool,
    undo,
    redo,
    setZoom,
    newCanvas,
    toggleGrid,
    setIsExcelImportVisible,
    setIsPrintPreviewVisible,
    setIsTemplateGalleryVisible,
  ])

  return (
    <div className="ribbon-toolbar">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
        className="ribbon-tabs"
      />

      {/* 模板库弹窗 */}
      <TemplateGallery
        visible={isTemplateGalleryVisible}
        onClose={() => setIsTemplateGalleryVisible(false)}
      />

      {/* 打印预览弹窗 */}
      <PrintPreview
        visible={isPrintPreviewVisible}
        onClose={() => setIsPrintPreviewVisible(false)}
      />

      {/* Excel导入弹窗 */}
      <ExcelImportDialog
        visible={isExcelImportVisible}
        onClose={() => setIsExcelImportVisible(false)}
      />
    </div>
  )
}

export default Toolbar
