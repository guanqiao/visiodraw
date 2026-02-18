/**
 * 关键路径计划示例
 * 展示CPM关键路径法、关键任务标识
 * 适用场景：需要严格控制工期的项目、关键路径分析
 */

export const criticalExample = {
  id: 'critical',
  name: '关键路径',
  description: '突出关键路径上的任务，展示CPM（关键路径法）的应用',
  tags: ['关键路径', 'CPM', '工期控制'],
  code: `gantt
  title 关键路径计划（CPM）
  dateFormat YYYY-MM-DD
  
  section 关键路径
  项目启动      :done, crit_start, 2024-01-01, 2d
  核心架构设计  :crit, done, crit_arch, after crit_start, 5d
  数据库设计    :crit, done, crit_db, after crit_arch, 3d
  API接口开发   :crit, active, crit_api, after crit_db, 7d
  前端核心开发  :crit, active, crit_fe, after crit_api, 10d
  系统集成测试  :crit, crit_test, after crit_fe, 5d
  生产部署      :crit, crit_deploy, after crit_test, 2d
  项目交付      :crit, milestone, crit_delivery, after crit_deploy, 0d
  
  section 非关键路径
  UI设计        :done, ui_design, after crit_arch, 8d
  文档编写      :doc_write, after crit_api, 12d
  用户培训      :training, after crit_test, 3d
  营销准备      :marketing, after crit_deploy, 5d`,
}

export default criticalExample
