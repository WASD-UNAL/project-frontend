import { api } from './apiClient'
import type { AdminPlan, PlanInput } from '../types/admin'

export function getPlans(): Promise<AdminPlan[]> {
  return api.get<AdminPlan[]>('/plans')
}

export function createPlan(input: PlanInput): Promise<AdminPlan> {
  return api.post<AdminPlan>('/membership/plans', input)
}

export function updatePlan(id: number, input: PlanInput): Promise<AdminPlan> {
  return api.put<AdminPlan>(`/membership/plans/${id}`, input)
}

export function deletePlan(id: number): Promise<void> {
  return api.delete<void>(`/membership/plans/${id}`)
}
