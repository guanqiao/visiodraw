/**
 * 简单甘特图示例
 * 展示基础语法和状态标签
 * 适用场景：小型项目、个人任务管理
 */

export const simpleExample = {
  id: 'simple',
  name: '简单项目',
  description: '基础甘特图示例，展示任务状态标签（done/active/crit/milestone）',
  tags: ['基础', '入门'],
  code: `gantt
  title 项目进度计划
  dateFormat YYYY-MM-DD
  
  section 项目规划
  需求分析    :done, a1, 2024-01-01, 7d
  设计阶段    :active, a2, after a1, 5d
  
  section 开发阶段
  编码实现    :a3, after a2, 14d
  测试验证    :a4, after a3, 7d
  
  section 交付阶段
  部署上线    :crit, deploy, after a4, 2d
  项目验收    :milestone, milestone1, after deploy, 0d`,
}

export default simpleExample
