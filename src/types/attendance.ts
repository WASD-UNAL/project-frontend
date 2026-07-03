export interface StatPoint {
  label: string
  count: number
}

export interface AttendanceStatsResponse {
  period: string
  peakValue: number
  points: StatPoint[]
}
