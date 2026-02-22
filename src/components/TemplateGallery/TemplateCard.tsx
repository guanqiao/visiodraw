import React, { useMemo } from 'react'
import { Card, Col, Button, Tooltip, Badge, Image } from 'antd'
import {
  FileOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  ExportOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { Template } from '../../types/template'
import type { DiagramTemplate } from '../../types/diagramTemplate'

const { Meta } = Card

interface BaseTemplateCardProps {
  thumbnail: string
  isFavorite: boolean
  categoryColor: string
  onPreview: () => void
  onToggleFavorite: () => void
}

interface TemplateCardProps extends BaseTemplateCardProps {
  template: Template
  isCustom: boolean
  onApply: () => void
  onExport?: () => void
  onDelete?: () => void
}

interface DiagramTemplateCardProps extends BaseTemplateCardProps {
  template: DiagramTemplate
  onApply: () => void
  hasMermaidCode: boolean
}

// 缓存缩略图
const thumbnailCache = new Map<string, string>()

// 获取缓存的缩略图
export function getCachedThumbnail(
  template: Template | DiagramTemplate,
  generateFn: () => string
): string {
  const cacheKey =
    'id' in template && template.id
      ? `${template.id}-v2`
      : `diagram-${(template as DiagramTemplate).name || (template as Template).name}-v2`

  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!
  }

  if ('thumbnail' in template && template.thumbnail) {
    thumbnailCache.set(cacheKey, template.thumbnail)
    return template.thumbnail
  }

  try {
    const thumbnail = generateFn()
    thumbnailCache.set(cacheKey, thumbnail)
    return thumbnail
  } catch (error) {
    console.error('生成缩略图失败:', error)
    return ''
  }
}

// 获取分类颜色
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    flowchart: '#1890ff',
    org: '#52c41a',
    network: '#722ed1',
    uml: '#fa8c16',
    custom: '#13c2c2',
    activity: '#1890ff',
    sequence: '#52c41a',
    state: '#fa8c16',
    er: '#722ed1',
    class: '#eb2f96',
    gantt: '#13c2c2',
  }
  return colors[category] || '#8c8c8c'
}

// 模板卡片组件
export const TemplateCard: React.FC<TemplateCardProps> = React.memo(
  ({
    template,
    thumbnail,
    isCustom,
    isFavorite,
    categoryColor,
    onApply,
    onExport,
    onDelete,
    onPreview,
    onToggleFavorite,
  }) => {
    const actions = useMemo(() => {
      const baseActions = [
        <Tooltip title="应用模板" key="apply">
          <Button type="link" onClick={onApply}>
            应用
          </Button>
        </Tooltip>,
        <Tooltip title={isFavorite ? '取消收藏' : '收藏'} key="favorite">
          {isFavorite ? (
            <StarFilled
              style={{ color: '#faad14', fontSize: 16 }}
              onClick={onToggleFavorite}
            />
          ) : (
            <StarOutlined style={{ fontSize: 16 }} onClick={onToggleFavorite} />
          )}
        </Tooltip>,
      ]

      if (isCustom) {
        baseActions.push(
          <Tooltip title="导出模板" key="export">
            <ExportOutlined onClick={onExport} />
          </Tooltip>
        )
        baseActions.push(
          <Tooltip title="删除模板" key="delete">
            <DeleteOutlined style={{ color: '#ff4d4f' }} onClick={onDelete} />
          </Tooltip>
        )
      }

      return baseActions
    }, [isCustom, isFavorite, onApply, onExport, onDelete, onToggleFavorite])

    return (
      <Col span={8}>
        <Badge.Ribbon
          text={template.category}
          color={categoryColor}
          style={{ display: template.category ? 'block' : 'none' }}
        >
          <Card
            hoverable
            cover={
              <div
                style={{
                  height: 140,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Image
                  src={thumbnail}
                  alt={template.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  preview={false}
                  placeholder={
                    <div style={{ fontSize: 48, color: '#d9d9d9' }}>
                      <FileOutlined />
                    </div>
                  }
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  <Tooltip title="预览">
                    <Button
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreview()
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            }
            actions={actions}
          >
            <Meta
              title={
                <Tooltip title={template.name}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {template.name}
                  </span>
                </Tooltip>
              }
              description={
                <Tooltip title={template.description}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#8c8c8c',
                    }}
                  >
                    {template.description || '暂无描述'}
                  </span>
                </Tooltip>
              }
            />
          </Card>
        </Badge.Ribbon>
      </Col>
    )
  }
)

TemplateCard.displayName = 'TemplateCard'

// 图表模板卡片组件
export const DiagramTemplateCard: React.FC<DiagramTemplateCardProps> = React.memo(
  ({
    template,
    thumbnail,
    isFavorite,
    categoryColor,
    hasMermaidCode,
    onApply,
    onPreview,
    onToggleFavorite,
  }) => {
    return (
      <Col span={8}>
        <Badge.Ribbon text={template.type} color={categoryColor}>
          <Card
            hoverable
            cover={
              <div
                style={{
                  height: 140,
                  background: '#f0f5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Image
                  src={thumbnail}
                  alt={template.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  preview={false}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  <Tooltip title="预览">
                    <Button
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreview()
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            }
            actions={[
              <Tooltip title="应用模板" key="apply">
                <Button type="link" onClick={onApply}>
                  应用
                </Button>
              </Tooltip>,
              <Tooltip title={isFavorite ? '取消收藏' : '收藏'} key="favorite">
                {isFavorite ? (
                  <StarFilled
                    style={{ color: '#faad14', fontSize: 16 }}
                    onClick={onToggleFavorite}
                  />
                ) : (
                  <StarOutlined
                    style={{ fontSize: 16 }}
                    onClick={onToggleFavorite}
                  />
                )}
              </Tooltip>,
            ]}
          >
            <Meta
              title={
                <Tooltip title={template.name}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {template.name}
                  </span>
                </Tooltip>
              }
              description={
                <div style={{ width: '100%' }}>
                  <Tooltip title={template.description}>
                    <span
                      style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#8c8c8c',
                      }}
                    >
                      {template.description || '暂无描述'}
                    </span>
                  </Tooltip>
                  {hasMermaidCode && (
                    <span style={{ fontSize: 12, color: '#2f54eb' }}>支持 Mermaid</span>
                  )}
                </div>
              }
            />
          </Card>
        </Badge.Ribbon>
      </Col>
    )
  }
)

DiagramTemplateCard.displayName = 'DiagramTemplateCard'
