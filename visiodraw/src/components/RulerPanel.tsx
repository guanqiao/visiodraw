import React from 'react'
import { Button, Switch, Tooltip, Divider, Slider } from 'antd'
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  BorderHorizontalOutlined,
  BorderVerticleOutlined,
} from '@ant-design/icons'
import useRulerStore from '../stores/rulerStore'
import './RulerPanel.css'

const RulerPanel: React.FC = () => {
  const {
    showRulers,
    showGuideLines,
    guideLines,
    rulerInterval,
    toggleRulers,
    toggleGuideLines,
    clearAllGuideLines,
    setRulerInterval,
  } = useRulerStore()

  const horizontalGuides = guideLines.filter((g) => g.orientation === 'horizontal')
  const verticalGuides = guideLines.filter((g) => g.orientation === 'vertical')

  return (
    <div className="ruler-panel">
      <h4 className="ruler-panel-title">
        <BorderHorizontalOutlined /> 标尺与参考线
      </h4>

      <div className="ruler-panel-content">
        {/* 显示控制 */}
        <div className="ruler-control-group">
          <div className="ruler-control-item">
            <span>显示标尺</span>
            <Switch
              checked={showRulers}
              onChange={toggleRulers}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </div>
          <div className="ruler-control-item">
            <span>显示参考线</span>
            <Switch
              checked={showGuideLines}
              onChange={toggleGuideLines}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* 标尺设置 */}
        <div className="ruler-control-group">
          <div className="ruler-control-label">标尺刻度间隔</div>
          <Slider
            value={rulerInterval}
            onChange={setRulerInterval}
            min={10}
            max={100}
            step={10}
            marks={{
              10: '10px',
              50: '50px',
              100: '100px',
            }}
          />
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* 参考线统计 */}
        <div className="ruler-control-group">
          <div className="ruler-guide-stats">
            <div className="ruler-guide-stat">
              <BorderHorizontalOutlined />
              <span>水平参考线: {horizontalGuides.length}</span>
            </div>
            <div className="ruler-guide-stat">
              <BorderVerticleOutlined />
              <span>垂直参考线: {verticalGuides.length}</span>
            </div>
          </div>

          {guideLines.length > 0 && (
            <Tooltip title="清除所有参考线">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                block
                onClick={clearAllGuideLines}
                style={{ marginTop: 8 }}
              >
                清除所有参考线
              </Button>
            </Tooltip>
          )}
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* 使用说明 */}
        <div className="ruler-help">
          <h5>使用说明</h5>
          <ul>
            <li>点击标尺创建参考线</li>
            <li>拖拽参考线调整位置</li>
            <li>悬停参考线显示控制按钮</li>
            <li>锁定参考线防止误操作</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RulerPanel
