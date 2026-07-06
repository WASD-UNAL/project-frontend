import { api } from './apiClient'
import type { StatusColor } from '../types/membership'

export interface VisualAlertResponse {
  document: string
  userName: string | null
  statusColor: StatusColor
  daysRemaining: number
  message: string
  userId: number | null
}

export function registerAccess(document: string): Promise<VisualAlertResponse> {
  return api.post<VisualAlertResponse>('/admin/access', { document })
}
