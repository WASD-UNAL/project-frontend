import { api } from './apiClient'
import { register } from './authService'
import type { VisualAlertResponse } from './accessService'
import type { AttendanceStatsResponse } from '../types/attendance'
import type {
  AdminClient,
  AdminPayment,
  AdminPaymentView,
  ClientUpdateInput,
  MonthlyRevenue,
  RevenueByPlan,
  RevenueComparison,
} from '../types/admin'
import type { PaymentMethod, PaymentStatus } from '../types/membership'

export function getMembers(query?: string): Promise<AdminClient[]> {
  const q = query?.trim()
  const suffix = q ? `?query=${encodeURIComponent(q)}` : ''
  return api.get<AdminClient[]>(`/admin/clients${suffix}`)
}

export function getMember(id: number): Promise<AdminClient> {
  return api.get<AdminClient>(`/admin/clients/${id}`)
}

export function updateMember(
  id: number,
  patch: ClientUpdateInput,
): Promise<AdminClient> {
  return api.put<AdminClient>(`/admin/clients/${id}`, patch)
}

export function setMemberActive(
  id: number,
  active: boolean,
): Promise<AdminClient> {
  return api.put<AdminClient>(`/admin/clients/${id}`, { active })
}

export interface NewMemberInput {
  name: string
  lastname: string
  email: string
  document: string
  password: string
}

export async function createMember(input: NewMemberInput): Promise<void> {
  await register(input)
}

export function getPayments(): Promise<AdminPayment[]> {
  return api.get<AdminPayment[]>('/payments')
}

export function joinPaymentsWithMembers(
  payments: AdminPayment[],
  members: AdminClient[],
): AdminPaymentView[] {
  const nameById = new Map(
    members.map((m) => [m.id, `${m.name} ${m.lastname}`] as const),
  )
  return payments.map((p) => ({
    ...p,
    memberName: nameById.get(p.userId) ?? null,
  }))
}

export function setPaymentStatus(
  payment: Pick<AdminPayment, 'id' | 'amount' | 'method' | 'reference'>,
  status: PaymentStatus,
): Promise<AdminPayment> {
  const body: {
    amount: number
    method: PaymentMethod
    reference: string | null
    status: PaymentStatus
  } = {
    amount: payment.amount,
    method: payment.method,
    reference: payment.reference,
    status,
  }
  return api.put<AdminPayment>(`/payments/${payment.id}`, body)
}

export function getAttendanceWeek(): Promise<AttendanceStatsResponse> {
  return api.get<AttendanceStatsResponse>('/stats/attendance?period=DAYS_WEEK')
}

function isCurrentMonth(iso: string | null): boolean {
  if (!iso) return false
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  )
}

export function computeAdminCounters(members: AdminClient[], payments: AdminPayment[]) {
  const monthlyRevenue = payments
    .filter((p) => p.status === 'SUCCESSFUL' && isCurrentMonth(p.createdAt))
    .reduce((sum, p) => sum + p.amount, 0)

  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.active).length,
    monthlyRevenue,
    pendingPayments: payments.filter((p) => p.status === 'PENDING').length,
  }
}

export function getMonthlyRevenue(
  year: number,
  month: number,
): Promise<MonthlyRevenue> {
  return api.get<MonthlyRevenue>(
    `/admin/reports/monthly-revenue?year=${year}&month=${month}`,
  )
}

export function getYearRevenue(year: number): Promise<MonthlyRevenue[]> {
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  return Promise.all(months.map((m) => getMonthlyRevenue(year, m)))
}

export function getRevenueByPlan(
  year: number,
  month: number,
): Promise<RevenueByPlan> {
  return api.get<RevenueByPlan>(
    `/admin/reports/revenue-by-plan?year=${year}&month=${month}`,
  )
}

export function getRevenueComparison(): Promise<RevenueComparison> {
  return api.get<RevenueComparison>('/admin/reports/revenue-comparison')
}

export function getInactiveCustomers(): Promise<VisualAlertResponse[]> {
  return api.get<VisualAlertResponse[]>('/admin/stats/inactive-customers')
}
