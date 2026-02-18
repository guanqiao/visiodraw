/**
 * 软件开发计划示例
 * 展示依赖关系、并行任务、资源分配
 * 适用场景：软件项目开发、敏捷团队协作
 */

export const softwareExample = {
  id: 'software',
  name: '软件开发',
  description: '完整的软件开发生命周期，包含需求、设计、开发、测试、部署各阶段',
  tags: ['软件开发', '全生命周期'],
  code: `gantt
  title 软件开发项目计划
  dateFormat YYYY-MM-DD
  
  section 需求分析
  用户调研      :done, req1, 2024-01-01, 5d
  竞品分析      :done, req2, 2024-01-01, 3d
  需求文档      :done, req3, after req1, 3d
  需求评审      :milestone, req_review, after req3, 0d
  
  section 系统设计
  架构设计      :active, arch1, after req_review, 7d
  数据库设计    :active, db1, after req_review, 5d
  接口设计      :api1, after arch1, 3d
  UI/UX设计    :ui1, after req_review, 10d
  设计评审      :milestone, design_review, after api1, 0d
  
  section 开发实现
  前端开发      :fe1, after ui1, 14d
  后端开发      :be1, after api1, 14d
  接口联调      :integration, after fe1, 3d
  代码审查      :crit, code_review, after integration, 2d
  
  section 测试部署
  单元测试      :test1, after code_review, 3d
  集成测试      :test2, after test1, 5d
  用户验收测试  :uat, after test2, 3d
  生产部署      :crit, deploy, after uat, 1d
  项目上线      :milestone, launch, after deploy, 0d`,
}

export default softwareExample
