/**
 * 产品发布计划示例
 * 展示跨部门协作、优先级管理、时间敏感任务
 * 适用场景：产品发布、市场推广、跨部门协作
 */

export const productLaunchExample = {
  id: 'product-launch',
  name: '产品发布',
  description: '新产品发布计划，展示跨部门协作、营销准备和发布节奏',
  tags: ['产品发布', '跨部门协作', '市场营销'],
  code: `gantt
  title 新产品发布计划
  dateFormat YYYY-MM-DD
  
  section 产品部门
  产品定位确定      :done, prod1, 2024-01-01, 5d
  产品定价策略      :done, prod2, after prod1, 3d
  产品手册编写      :active, prod3, after prod2, 7d
  产品培训材料      :prod4, after prod3, 5d
  
  section 研发部门
  最终功能开发      :crit, done, dev1, 2024-01-01, 10d
  性能优化          :crit, done, dev2, after dev1, 5d
  安全审计          :crit, active, dev3, after dev2, 3d
  发布版本构建      :crit, dev4, after dev3, 2d
  
  section 市场部门
  竞品分析报告      :done, mkt1, 2024-01-01, 5d
  营销策略制定      :mkt2, after mkt1, 5d
  宣传材料设计      :mkt3, after mkt2, 10d
  媒体关系建立      :mkt4, after mkt2, 7d
  预热活动启动      :mkt5, after mkt3, 3d
  
  section 销售部门
  销售培训          :sales1, after prod4, 3d
  渠道准备          :sales2, after prod4, 5d
  客户预约          :sales3, after mkt5, 5d
  
  section 发布阶段
  内测发布          :milestone, beta, after dev4, 0d
  公测发布          :milestone, public_beta, after beta, 7d
  正式发布          :crit, milestone, launch, after public_beta, 0d
  发布会举办        :crit, event, after launch, 1d`,
}

export default productLaunchExample
