import type { AvailablePlan } from '../types/membership'

export function sortPlansByPrice(plans: AvailablePlan[]): AvailablePlan[] {
  return [...plans].sort((a, b) => a.price - b.price)
}

export function getHighlightedPlanId(plans: AvailablePlan[]): number | null {
  if (plans.length === 0) return null
  const sorted = sortPlansByPrice(plans)
  const index = Math.floor((sorted.length - 1) / 2)
  return sorted[index].id
}
