export interface StatPoint {
  label: string
  count: number
}

export interface AttendanceStatsResponse {
  period: string
  peakValue: number
  points: StatPoint[]
}

export interface AttendanceVisit {
  date: string
  time: string | null
}

export interface MyAttendance {
  currentStreak: number
  longestStreak: number
  totalDays: number
  lastAttendanceDate: string | null
  visits: AttendanceVisit[]
}
