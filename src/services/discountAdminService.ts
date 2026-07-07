import { api } from './apiClient'
import type { AdminDiscount, DiscountInput } from '../types/admin'

export function getDiscounts(): Promise<AdminDiscount[]> {
  return api.get<AdminDiscount[]>('/membership/discounts')
}

export function createDiscount(input: DiscountInput): Promise<AdminDiscount> {
  return api.post<AdminDiscount>('/membership/discounts', input)
}

export function updateDiscount(
  id: number,
  input: DiscountInput,
): Promise<AdminDiscount> {
  return api.put<AdminDiscount>(`/membership/discounts/${id}`, input)
}

export function setDiscountActive(
  id: number,
  active: boolean,
): Promise<AdminDiscount> {
  return api.put<AdminDiscount>(`/membership/discounts/${id}`, { active })
}

export function deleteDiscount(id: number): Promise<void> {
  return api.delete<void>(`/membership/discounts/${id}`)
}
