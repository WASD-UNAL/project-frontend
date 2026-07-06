import { api } from './apiClient'
import { register } from './authService'
import type { AttendanceStatsResponse } from '../types/attendance'
import type {
  AdminClient,
  AdminMetrics,
  AdminPayment,
  AdminPaymentView,
  ClientUpdateInput,
  IncomeStats,
  MonthlyIncomePoint,
  PlanIncome,
} from '../types/admin'
import type { PaymentMethod, PaymentStatus } from '../types/membership'

// ---------------------------------------------------------------------------
// Socios (clientes) — /admin/clients (protegido por ROLE_ADMIN)
// ---------------------------------------------------------------------------

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

// No existe un endpoint "admin crea cliente": se reutiliza el registro público
// (POST /auth/register), que crea una cuenta con rol CLIENT. El token que
// devuelve corresponde al nuevo socio y se descarta (no toca la sesión admin).
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

// ---------------------------------------------------------------------------
// Pagos — /payments
// ---------------------------------------------------------------------------

export function getPayments(): Promise<AdminPayment[]> {
  return api.get<AdminPayment[]>('/payments')
}

// PaymentResponse no trae el nombre del socio; lo resolvemos cruzando userId
// contra /admin/clients (asumiendo que userId === User.id === AdminClient.id).
export async function getPaymentsWithMembers(): Promise<AdminPaymentView[]> {
  const [payments, members] = await Promise.all([getPayments(), getMembers()])
  const nameById = new Map(
    members.map((m) => [m.id, `${m.name} ${m.lastname}`] as const),
  )
  return payments.map((p) => ({
    ...p,
    memberName: nameById.get(p.userId) ?? null,
  }))
}

// UpdatePaymentRequest exige amount y method (@NotNull) además del status, así
// que reenviamos los valores actuales del pago junto al nuevo estado.
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

// ---------------------------------------------------------------------------
// Afluencia y métricas del resumen (calculadas en el cliente)
// ---------------------------------------------------------------------------

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

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [members, payments, attendance] = await Promise.all([
    getMembers(),
    getPayments(),
    getAttendanceWeek(),
  ])

  const monthlyRevenue = payments
    .filter((p) => p.status === 'SUCCESSFUL' && isCurrentMonth(p.createdAt))
    .reduce((sum, p) => sum + p.amount, 0)

  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.active).length,
    monthlyRevenue,
    pendingPayments: payments.filter((p) => p.status === 'PENDING').length,
    attendance: attendance.points,
    attendancePeak: attendance.peakValue,
  }
}

// ---------------------------------------------------------------------------
// Estadística de ingresos — datos de demostración (no hay endpoint en el backend)
// ---------------------------------------------------------------------------

const monthlyIncome: MonthlyIncomePoint[] = [
  { label: 'Ene', amount: 8_450_000 },
  { label: 'Feb', amount: 9_120_000 },
  { label: 'Mar', amount: 10_300_000 },
  { label: 'Abr', amount: 9_800_000 },
  { label: 'May', amount: 11_200_000 },
  { label: 'Jun', amount: 12_100_000 },
  { label: 'Jul', amount: 12_900_000 },
  { label: 'Ago', amount: 11_600_000 },
  { label: 'Sep', amount: 12_400_000 },
  { label: 'Oct', amount: 13_100_000 },
  { label: 'Nov', amount: 13_800_000 },
  { label: 'Dic', amount: 15_200_000 },
]

const incomeByPlan: PlanIncome[] = [
  { planName: 'Básico', amount: 29_400_000 },
  { planName: 'Plus', amount: 61_570_000 },
  { planName: 'Elite', amount: 49_000_000 },
]

export function getIncomeStats(): Promise<IncomeStats> {
  const totalYear = monthlyIncome.reduce((sum, m) => sum + m.amount, 0)
  const monthlyPeak = Math.max(...monthlyIncome.map((m) => m.amount))
  return Promise.resolve({
    monthly: monthlyIncome.map((m) => ({ ...m })),
    byPlan: incomeByPlan.map((p) => ({ ...p })),
    totalYear,
    monthlyPeak,
  })
}
