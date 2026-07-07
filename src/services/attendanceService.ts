import { api } from './apiClient'
import type { AttendanceVisit, MyAttendance } from '../types/attendance'

interface DashboardStreakPeriod {
  startDate: string
  endDate: string
  attendanceDays: number
}

interface DashboardResponse {
  recentAttendances: AttendanceVisit[]
  streak: {
    currentStreak: number
    longestStreak: number
    lastAttendanceDate: string | null
    streakHistory: DashboardStreakPeriod[]
  }
}

export async function getMyAttendance(): Promise<MyAttendance> {
  const dashboard = await api.get<DashboardResponse>('/client/dashboard')
  const totalDays = dashboard.streak.streakHistory.reduce(
    (sum, period) => sum + period.attendanceDays,
    0,
  )
  return {
    currentStreak: dashboard.streak.currentStreak,
    longestStreak: dashboard.streak.longestStreak,
    totalDays,
    lastAttendanceDate: dashboard.streak.lastAttendanceDate,
    visits: dashboard.recentAttendances,
  }
}
