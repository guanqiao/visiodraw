/**
 * 里程碑计划示例
 * 展示关键路径、阶段性里程碑
 * 适用场景：大型项目分阶段管理、重要节点跟踪
 */

export const milestoneExample = {
  id: 'milestone',
  name: '里程碑计划',
  description: '以里程碑为导向的项目计划，突出关键节点和阶段性成果',
  tags: ['里程碑', '阶段管理'],
  code: `gantt
  title 产品发布里程碑计划
  dateFormat YYYY-MM-DD
  
  section 第一阶段 - 概念验证
  市场调研      :done, m1_task1, 2024-01-01, 5d
  可行性分析    :done, m1_task2, after m1_task1, 3d
  概念验证完成  :milestone, m1, after m1_task2, 0d
  
  section 第二阶段 - 原型开发
  原型设计      :active, m2_task1, after m1, 7d
  原型开发      :active, m2_task2, after m2_task1, 10d
  原型测试      :m2_task3, after m2_task2, 5d
  原型评审通过  :milestone, m2, after m2_task3, 0d
  
  section 第三阶段 - MVP开发
  MVP需求定义   :m3_task1, after m2, 5d
  MVP开发       :crit, m3_task2, after m3_task1, 20d
  MVP测试       :m3_task3, after m3_task2, 7d
  MVP发布       :milestone, m3, after m3_task3, 0d
  
  section 第四阶段 - 正式发布
  生产环境准备  :m4_task1, after m3, 5d
  营销材料制作  :m4_task2, after m3, 10d
  正式发布      :crit, milestone, after m4_task1, 0d`,
}

export default milestoneExample
