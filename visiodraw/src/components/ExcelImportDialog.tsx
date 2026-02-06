/**
 * Excel导入对话框
 */

import React, { useState } from 'react'
import { Modal, Button, Table, Upload, message, Typography, Radio, Space } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import {
  parseExcel,
  convertToOrgData,
  generateOrgChartShapes,
  isExcelFormat,
  readExcelFile,
  ExcelRow,
  OrgData,
} from '@utils/excelParser'
import useCanvasStore from '@stores/canvasStore'

const { Text } = Typography

interface ExcelImportDialogProps {
  visible: boolean
  onClose: () => void
}

const ExcelImportDialog: React.FC<ExcelImportDialogProps> = ({
  visible,
  onClose,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewData, setPreviewData] = useState<ExcelRow[]>([])
  const [orgData, setOrgData] = useState<OrgData[]>([])
  const [importType, setImportType] = useState<'org' | 'data'>('org')
  const { addShape, newCanvas } = useCanvasStore()

  // 处理文件上传
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = async (info: any) => {
    const { file } = info
    
    if (file.status === 'removed') {
      setFileList([])
      setPreviewData([])
      setOrgData([])
      return
    }

    if (!file.originFileObj) return

    if (!isExcelFormat(file.originFileObj)) {
      message.error('请选择Excel文件 (.xlsx, .xls, .csv)')
      return
    }

    setFileList([file])

    try {
      const arrayBuffer = await readExcelFile(file.originFileObj)
      const data = await parseExcel(arrayBuffer)
      setPreviewData(data)

      if (importType === 'org') {
        const org = convertToOrgData(data)
        setOrgData(org)
        message.success(`成功解析 ${org.length} 条组织结构数据`)
      } else {
        message.success(`成功解析 ${data.length} 行数据`)
      }
    } catch (error) {
      console.error('解析Excel失败:', error)
      message.error('解析Excel文件失败')
    }
  }

  // 生成组织结构图
  const handleGenerateOrgChart = () => {
    if (orgData.length === 0) {
      message.warning('没有可导入的组织结构数据')
      return
    }

    // 清空当前画布
    newCanvas()

    // 生成组织结构图形状
    const shapes = generateOrgChartShapes(orgData)
    
    shapes.forEach((shape) => {
      addShape(shape)
    })

    message.success(`成功生成组织结构图，包含 ${shapes.length} 个节点`)
    onClose()
  }

  // 生成数据表格
  const handleGenerateDataTable = () => {
    if (previewData.length === 0) {
      message.warning('没有可导入的数据')
      return
    }

    // 清空当前画布
    newCanvas()

    // 创建表格形状
    const headers = Object.keys(previewData[0])
    const colWidth = 120
    const rowHeight = 30
    const startX = 50
    const startY = 50

    // 绘制表头
    headers.forEach((header, index) => {
      addShape({
        id: `header-${index}`,
        type: 'rectangle',
        x: startX + index * colWidth,
        y: startY,
        width: colWidth,
        height: rowHeight,
        fill: '#1890ff',
        stroke: '#096dd9',
        strokeWidth: 1,
        text: header,
      })
    })

    // 绘制数据行
    previewData.slice(0, 20).forEach((row, rowIndex) => {
      headers.forEach((header, colIndex) => {
        const value = row[header]
        addShape({
          id: `cell-${rowIndex}-${colIndex}`,
          type: 'rectangle',
          x: startX + colIndex * colWidth,
          y: startY + (rowIndex + 1) * rowHeight,
          width: colWidth,
          height: rowHeight,
          fill: rowIndex % 2 === 0 ? '#ffffff' : '#f5f5f5',
          stroke: '#d9d9d9',
          strokeWidth: 1,
          text: value !== null ? String(value) : '',
        })
      })
    })

    message.success(`成功生成数据表格，包含 ${Math.min(previewData.length, 20)} 行数据`)
    onClose()
  }

  // 生成预览表格列
  const getPreviewColumns = () => {
    if (previewData.length === 0) return []
    
    return Object.keys(previewData[0]).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      ellipsis: true,
    }))
  }

  return (
    <Modal
      title="导入Excel数据"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="import"
          type="primary"
          disabled={previewData.length === 0}
          onClick={importType === 'org' ? handleGenerateOrgChart : handleGenerateDataTable}
        >
          {importType === 'org' ? '生成组织结构图' : '生成数据表格'}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 导入类型选择 */}
        <div>
          <Text strong>导入类型</Text>
          <Radio.Group
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
            style={{ marginLeft: 16 }}
          >
            <Radio value="org">组织结构图</Radio>
            <Radio value="data">数据表格</Radio>
          </Radio.Group>
        </div>

        {/* 文件上传 */}
        <Upload
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false}
          accept=".xlsx,.xls,.csv"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>选择Excel文件</Button>
        </Upload>

        {/* 说明 */}
        {importType === 'org' && (
          <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <Text strong>组织结构图要求：</Text>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>必须包含"姓名"列（或name/Name）</li>
              <li>可选包含"职位"列（或title/Title）</li>
              <li>可选包含"部门"列（或department/Department）</li>
              <li>可选包含"上级"列（或manager/Manager），用于建立层级关系</li>
            </ul>
          </div>
        )}

        {/* 数据预览 */}
        {previewData.length > 0 && (
          <div>
            <Text strong>数据预览（前5行）</Text>
            <Table
              dataSource={previewData.slice(0, 5).map((row, index) => ({ ...row, key: index }))}
              columns={getPreviewColumns()}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              共 {previewData.length} 行数据
            </Text>
          </div>
        )}

        {/* 组织结构预览 */}
        {importType === 'org' && orgData.length > 0 && (
          <div style={{ padding: 12, background: '#f6ffed', borderRadius: 4 }}>
            <Text strong style={{ color: '#52c41a' }}>
              组织结构解析结果
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text>节点数: {orgData.length}</Text>
              <br />
              <Text>
                层级数: {Math.max(...orgData.map((n) => n.level)) + 1}
              </Text>
            </div>
          </div>
        )}
      </Space>
    </Modal>
  )
}

export default ExcelImportDialog
