/**
 * 研发管理示例
 * 展示多产品线并行、标签分类、资源管理
 * 适用场景：研发团队管理、多产品线规划、资源分配
 */

export const researchExample = {
  id: 'research',
  name: '研发管理',
  description: '多产品线研发管理，展示资源分配、优先级管理和跨团队协作',
  tags: ['研发管理', '多产品线', '资源分配'],
  code: `gantt
  title 研发团队季度规划
  dateFormat YYYY-MM-DD
  
  section 产品A - 核心平台
  架构升级        :crit, done, pa1, 2024-01-01, 10d
  性能优化        :crit, done, pa2, after pa1, 7d
  新功能开发      :crit, active, pa3, after pa2, 14d
  技术债务清理    :pa4, after pa2, 5d
  版本发布        :milestone, pa_release, after pa3, 0d
  
  section 产品B - 移动应用
  UI改版          :done, pb1, 2024-01-01, 7d
  功能迭代        :active, pb2, after pb1, 10d
  适配新系统      :pb3, after pb2, 5d
  应用商店审核    :milestone, pb_review, after pb3, 0d
  
  section 产品C - 数据服务
  数据模型设计    :done, pc1, 2024-01-01, 5d
  API开发         :active, pc2, after pc1, 10d
  数据迁移        :crit, pc3, after pc2, 7d
  服务上线        :milestone, pc_launch, after pc3, 0d
  
  section 基础设施
  CI/CD优化       :infra1, 2024-01-01, 14d
  监控系统升级    :infra2, after infra1, 7d
  安全加固        :crit, infra3, after infra2, 5d
  文档更新        :infra4, after infra1, 10d
  
  section 团队建设
  技术分享会      :team1, 2024-01-15, 1d
  代码规范制定    :team2, after team1, 3d
  新人培训        :team3, after team2, 5d`,
}

export default researchExample
