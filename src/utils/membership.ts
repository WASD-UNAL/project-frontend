import type {
  PaymentMethod,
  PaymentStatus,
  StatusColor,
} from '../types/membership'

const dateFmt = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string): string {
  const [datePart] = iso.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  return dateFmt.format(new Date(y, m - 1, d))
}

export function totalDaysBetween(initIso: string, endIso: string): number {
  const start = new Date(initIso).getTime()
  const end = new Date(endIso).getTime()
  const days = Math.round((end - start) / 86_400_000)
  return Math.max(days, 1)
}

interface StatusTheme {
  text: string
  border: string
  bgSoft: string
  fill: string
  label: string
}

export const statusThemes: Record<StatusColor, StatusTheme> = {
  GREEN: {
    text: 'text-ember',
    border: 'border-ember',
    bgSoft: 'bg-ember-soft',
    fill: 'bg-ember',
    label: 'Al día',
  },
  YELLOW: {
    text: 'text-warn',
    border: 'border-warn',
    bgSoft: 'bg-warn-soft',
    fill: 'bg-warn',
    label: 'Por vencer',
  },
  RED: {
    text: 'text-danger',
    border: 'border-danger',
    bgSoft: 'bg-danger-soft',
    fill: 'bg-danger',
    label: 'Vencida',
  },
}

const methodLabels: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
}

export function paymentMethodLabel(m: PaymentMethod): string {
  return methodLabels[m]
}

interface PaymentStatusTheme {
  label: string
  text: string
  dot: string
}

export const paymentStatusThemes: Record<PaymentStatus, PaymentStatusTheme> = {
  SUCCESSFUL: { label: 'Pagado', text: 'text-ember', dot: 'bg-ember' },
  PENDING: { label: 'Pendiente', text: 'text-warn', dot: 'bg-warn' },
  REJECTED: { label: 'Rechazado', text: 'text-danger', dot: 'bg-danger' },
}

interface MemberStatusTheme {
  label: string
  text: string
  dot: string
}

export function memberStatusTheme(active: boolean): MemberStatusTheme {
  return active
    ? { label: 'Activo', text: 'text-ember', dot: 'bg-ember' }
    : { label: 'Inactivo', text: 'text-muted', dot: 'bg-muted' }
}
