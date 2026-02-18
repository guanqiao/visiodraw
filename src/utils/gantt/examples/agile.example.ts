/**
 * 敏捷迭代计划示例
 * 展示Scrum Sprint规划、迭代周期
 * 适用场景：敏捷开发团队、Sprint规划会议
 */

export const agileExample = {
  id: 'agile',
  name: '敏捷迭代',
  description: 'Scrum Sprint迭代计划，展示敏捷开发流程和迭代周期',
  tags: ['敏捷', 'Scrum', 'Sprint'],
  code: `gantt
  title 敏捷迭代计划（双周Sprint）
  dateFormat YYYY-MM-DD
  
  section Sprint 1
  Sprint计划会议    :done, sp1_plan, 2024-01-01, 1d
  需求细化          :done, sp1_refine, after sp1_plan, 2d
  开发实现          :active, sp1_dev, after sp1_refine, 6d
  代码审查          :sp1_review, after sp1_dev, 1d
  测试验证          :sp1_test, after sp1_review, 2d
  Sprint评审        :milestone, sp1_demo, after sp1_test, 0d
  回顾会议          :sp1_retro, after sp1_demo, 1d
  
  section Sprint 2
  Sprint计划会议    :sp2_plan, after sp1_retro, 1d
  需求细化          :sp2_refine, after sp2_plan, 2d
  开发实现          :sp2_dev, after sp2_refine, 6d
  代码审查          :sp2_review, after sp2_dev, 1d
  测试验证          :sp2_test, after sp2_review, 2d
  Sprint评审        :milestone, sp2_demo, after sp2_test, 0d
  回顾会议          :sp2_retro, after sp2_demo, 1d
  
  section Sprint 3
  Sprint计划会议    :sp3_plan, after sp2_retro, 1d
  需求细化          :sp3_refine, after sp3_plan, 2d
  开发实现          :sp3_dev, after sp3_refine, 6d
  代码审查          :sp3_review, after sp3_dev, 1d
  测试验证          :sp3_test, after sp3_review, 2d
  Sprint评审        :milestone, sp3_demo, after sp3_test, 0d
  发布上线          :crit, release, after sp3_demo, 1d`,
}

export default agileExample
