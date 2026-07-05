export interface StatPoint {
  label: string
  count: number
}

export interface AttendanceStatsResponse {
  period: string
  peakValue: number
  points: StatPoint[]
}

export interface AttendanceEntry {
  id: number
  date: string
  checkIn: string
  checkOut: string | null
  durationMin: number | null
}

export interface MyAttendance {
  monthCount: number
  currentStreak: number
  totalCount: number
  entries: AttendanceEntry[]
}
