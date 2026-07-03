import { api } from './apiClient'
import type { AvailablePlan } from '../types/membership'

/** GET /plans — planes activos disponibles para inscripción. */
export function getActivePlans(): Promise<AvailablePlan[]> {
  return api.get<AvailablePlan[]>('/plans')
}
