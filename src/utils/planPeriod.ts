export function planPeriodLabel(durationDays: number): string {
  if (durationDays === 30) return 'por mes'
  if (durationDays === 365) return 'por año'
  return `por ${durationDays} días`
}
