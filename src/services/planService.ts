import { api } from './apiClient'
import type { AvailablePlan } from '../types/membership'

export function getActivePlans(): Promise<AvailablePlan[]> {
  return api.get<AvailablePlan[]>('/plans')
}
