/**
 * 建筑工程项目示例
 * 展示资源分配、工作日历、复杂依赖关系
 * 适用场景：建筑工程、施工管理、资源调度
 */

export const constructionExample = {
  id: 'construction',
  name: '建筑工程',
  description: '建筑工程项目，展示多阶段施工、资源分配和关键路径管理',
  tags: ['建筑工程', '施工管理', '资源调度'],
  code: `gantt
  title 商业综合体建设项目
  dateFormat YYYY-MM-DD
  
  section 前期准备
  土地平整      :done, prep1, 2024-01-01, 7d
  临时设施搭建  :done, prep2, after prep1, 5d
  施工许可办理  :done, prep3, 2024-01-01, 10d
  开工仪式      :milestone, start, after prep3, 0d
  
  section 基础工程
  基坑开挖      :crit, done, foundation1, after start, 14d
  地基处理      :crit, done, foundation2, after foundation1, 10d
  基础浇筑      :crit, active, foundation3, after foundation2, 7d
  基础验收      :milestone, foundation_check, after foundation3, 0d
  
  section 主体结构
  钢结构安装    :crit, active, structure1, after foundation_check, 20d
  楼板浇筑      :crit, structure2, after structure1, 15d
  墙体砌筑      :structure3, after structure2, 10d
  结构封顶      :crit, milestone, topping, after structure3, 0d
  
  section 装饰装修
  外立面施工    :decor1, after topping, 20d
  室内装修      :decor2, after topping, 30d
  机电安装      :decor3, after topping, 25d
  竣工验收      :crit, milestone, completion, after decor1, 0d`,
}

export default constructionExample
