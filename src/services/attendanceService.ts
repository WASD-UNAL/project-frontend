import type { AttendanceEntry, MyAttendance } from '../types/attendance'

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const entries: AttendanceEntry[] = [
  { id: 1, date: '2026-07-05', checkIn: '07:12', checkOut: '08:35', durationMin: 83 },
  { id: 2, date: '2026-07-04', checkIn: '06:58', checkOut: '08:20', durationMin: 82 },
  { id: 3, date: '2026-07-03', checkIn: '18:05', checkOut: '19:30', durationMin: 85 },
  { id: 4, date: '2026-07-02', checkIn: '07:20', checkOut: '08:40', durationMin: 80 },
  { id: 5, date: '2026-06-30', checkIn: '19:10', checkOut: '20:25', durationMin: 75 },
  { id: 6, date: '2026-06-28', checkIn: '09:02', checkOut: '10:30', durationMin: 88 },
  { id: 7, date: '2026-06-27', checkIn: '07:05', checkOut: '08:15', durationMin: 70 },
  { id: 8, date: '2026-06-25', checkIn: '18:40', checkOut: '20:05', durationMin: 85 },
  { id: 9, date: '2026-06-24', checkIn: '07:15', checkOut: '08:33', durationMin: 78 },
  { id: 10, date: '2026-06-22', checkIn: '17:50', checkOut: '19:00', durationMin: 70 },
]

export function getMyAttendance(): Promise<MyAttendance> {
  return delay({
    currentStreak: 4,
    totalCount: entries.length,
    entries: entries.map((e) => ({ ...e })),
  })
}
