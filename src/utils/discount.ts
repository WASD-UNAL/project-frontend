import type { PlanDiscount } from '../types/membership'

interface Discountable {
  price: number
  discount?: PlanDiscount | null
}

export function effectivePrice(plan: Discountable): number {
  return plan.discount?.discountedPrice ?? plan.price
}

export function formatPercentOff(percentage: number): string {
  return `−${Number(percentage.toFixed(2))}%`
}

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDiscountDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}
