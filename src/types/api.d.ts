export interface Plan {
  id: number | null
  name: string
  description: string | null
  durationDays: number
  price: number
  active: boolean
}

export interface Role {
  id: number | null
  name: string
}

export interface PeakHourPoint {
  hour: number
  value: number
}

export interface PeakHoursResponse {
  week: string
  weekLabel: string
  day: string
  dayLabel: string
  peakValue: number
  activeSlots: number
  topHours: PeakHourPoint[]
  points: PeakHourPoint[]
}
