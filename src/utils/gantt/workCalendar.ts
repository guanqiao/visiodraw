/**
 * 工作日历模块
 * 
 * 核心功能：
 * 1. 配置工作日（周一到周日哪些天是工作日）
 * 2. 设置节假日和特殊工作日
 * 3. 计算两个日期之间的工作日天数
 * 4. 根据工作日偏移计算目标日期
 * 5. 可视化标记非工作日
 */

export interface WorkCalendarConfig {
  workDays: number[]        // 工作日，0=周日, 1=周一, ..., 6=周六，默认 [1,2,3,4,5]
  holidays: Date[]          // 节假日列表
  specialWorkDays: Date[]   // 特殊工作日（周末但上班）
  dailyWorkHours: number    // 每日工作小时数，默认 8
}

export interface DateRange {
  start: Date
  end: Date
}

export class WorkCalendar {
  private config: WorkCalendarConfig

  constructor(config?: Partial<WorkCalendarConfig>) {
    this.config = {
      workDays: [1, 2, 3, 4, 5], // 默认周一到周五
      holidays: [],
      specialWorkDays: [],
      dailyWorkHours: 8,
      ...config,
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): WorkCalendarConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<WorkCalendarConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 判断某天是否为工作日
   */
  isWorkDay(date: Date): boolean {
    const dateStr = this.formatDate(date)
    
    // 先检查是否为特殊工作日
    if (this.config.specialWorkDays.some(d => this.formatDate(d) === dateStr)) {
      return true
    }
    
    // 检查是否为节假日
    if (this.config.holidays.some(d => this.formatDate(d) === dateStr)) {
      return false
    }
    
    // 检查是否为常规工作日
    const dayOfWeek = date.getDay()
    return this.config.workDays.includes(dayOfWeek)
  }

  /**
   * 判断某天是否为周末
   */
  isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  /**
   * 判断某天是否为节假日
   */
  isHoliday(date: Date): boolean {
    const dateStr = this.formatDate(date)
    return this.config.holidays.some(d => this.formatDate(d) === dateStr)
  }

  /**
   * 计算两个日期之间的工作日天数
   */
  getWorkDaysBetween(startDate: Date, endDate: Date): number {
    let workDays = 0
    const current = new Date(startDate)
    const end = new Date(endDate)
    
    while (current < end) {
      if (this.isWorkDay(current)) {
        workDays++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return workDays
  }

  /**
   * 根据工作日偏移计算目标日期
   * @param startDate 开始日期
   * @param workDays 工作日偏移（可为负数）
   * @returns 目标日期
   */
  addWorkDays(startDate: Date, workDays: number): Date {
    const result = new Date(startDate)
    let daysAdded = 0
    const direction = workDays >= 0 ? 1 : -1
    const targetDays = Math.abs(workDays)
    
    while (daysAdded < targetDays) {
      result.setDate(result.getDate() + direction)
      if (this.isWorkDay(result)) {
        daysAdded++
      }
    }
    
    return result
  }

  /**
   * 计算任务的实际持续时间（按工作日）
   */
  calculateDuration(startDate: Date, endDate: Date): number {
    return this.getWorkDaysBetween(startDate, endDate)
  }

  /**
   * 根据开始日期和持续时间计算结束日期
   */
  calculateEndDate(startDate: Date, duration: number): Date {
    return this.addWorkDays(startDate, duration)
  }

  /**
   * 获取日期范围内的所有日期信息
   */
  getDateRangeInfo(startDate: Date, endDate: Date): Array<{
    date: Date
    isWorkDay: boolean
    isWeekend: boolean
    isHoliday: boolean
  }> {
    const result = []
    const current = new Date(startDate)
    const end = new Date(endDate)
    
    while (current <= end) {
      result.push({
        date: new Date(current),
        isWorkDay: this.isWorkDay(current),
        isWeekend: this.isWeekend(current),
        isHoliday: this.isHoliday(current),
      })
      current.setDate(current.getDate() + 1)
    }
    
    return result
  }

  /**
   * 添加节假日
   */
  addHoliday(date: Date): void {
    const dateStr = this.formatDate(date)
    if (!this.config.holidays.some(d => this.formatDate(d) === dateStr)) {
      this.config.holidays.push(new Date(date))
    }
  }

  /**
   * 移除节假日
   */
  removeHoliday(date: Date): void {
    const dateStr = this.formatDate(date)
    this.config.holidays = this.config.holidays.filter(
      d => this.formatDate(d) !== dateStr
    )
  }

  /**
   * 添加特殊工作日
   */
  addSpecialWorkDay(date: Date): void {
    const dateStr = this.formatDate(date)
    if (!this.config.specialWorkDays.some(d => this.formatDate(d) === dateStr)) {
      this.config.specialWorkDays.push(new Date(date))
    }
  }

  /**
   * 移除特殊工作日
   */
  removeSpecialWorkDay(date: Date): void {
    const dateStr = this.formatDate(date)
    this.config.specialWorkDays = this.config.specialWorkDays.filter(
      d => this.formatDate(d) !== dateStr
    )
  }

  /**
   * 设置工作日
   */
  setWorkDays(days: number[]): void {
    this.config.workDays = [...days].sort()
  }

  /**
   * 获取月份的工作日数量
   */
  getWorkDaysInMonth(year: number, month: number): number {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    return this.getWorkDaysBetween(start, end) + 1
  }

  /**
   * 获取年份的工作日数量
   */
  getWorkDaysInYear(year: number): number {
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    return this.getWorkDaysBetween(start, end) + 1
  }

  /**
   * 获取下一个工作日
   */
  getNextWorkDay(date: Date): Date {
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    while (!this.isWorkDay(next)) {
      next.setDate(next.getDate() + 1)
    }
    return next
  }

  /**
   * 获取上一个工作日
   */
  getPreviousWorkDay(date: Date): Date {
    const prev = new Date(date)
    prev.setDate(prev.getDate() - 1)
    while (!this.isWorkDay(prev)) {
      prev.setDate(prev.getDate() - 1)
    }
    return prev
  }

  /**
   * 格式化日期为字符串（用于比较）
   */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  /**
   * 批量添加中国法定节假日（2024-2025）
   */
  addChinaHolidays(year: number): void {
    const holidays: Record<number, string[]> = {
      2024: [
        '2024-01-01', // 元旦
        '2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13', '2024-02-14', '2024-02-15', '2024-02-16', '2024-02-17', // 春节
        '2024-04-04', '2024-04-05', '2024-04-06', // 清明
        '2024-05-01', '2024-05-02', '2024-05-03', '2024-05-04', '2024-05-05', // 劳动节
        '2024-06-10', // 端午
        '2024-09-15', '2024-09-16', '2024-09-17', // 中秋
        '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-05', '2024-10-06', '2024-10-07', // 国庆
      ],
      2025: [
        '2024-01-01', // 元旦
        '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04', // 春节
        '2025-04-04', '2025-04-05', '2025-04-06', // 清明
        '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05', // 劳动节
        '2025-05-31', '2025-06-01', '2025-06-02', // 端午
        '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', // 国庆
      ],
    }

    const yearHolidays = holidays[year] || []
    yearHolidays.forEach(dateStr => {
      this.addHoliday(new Date(dateStr))
    })
  }

  /**
   * 序列化为JSON
   */
  toJSON(): string {
    return JSON.stringify({
      workDays: this.config.workDays,
      holidays: this.config.holidays.map(d => this.formatDate(d)),
      specialWorkDays: this.config.specialWorkDays.map(d => this.formatDate(d)),
      dailyWorkHours: this.config.dailyWorkHours,
    })
  }

  /**
   * 从JSON反序列化
   */
  static fromJSON(json: string): WorkCalendar {
    const data = JSON.parse(json)
    return new WorkCalendar({
      workDays: data.workDays,
      holidays: data.holidays.map((d: string) => new Date(d)),
      specialWorkDays: data.specialWorkDays.map((d: string) => new Date(d)),
      dailyWorkHours: data.dailyWorkHours,
    })
  }
}

// 导出单例实例（默认配置）
export const workCalendar = new WorkCalendar()
export default workCalendar
