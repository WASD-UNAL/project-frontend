import type { PaymentMethod, PaymentStatus } from './membership'
import type { StatPoint } from './attendance'

// Espejo 1:1 del ClientResponse del backend (dto/client/ClientResponse.kt).
// No agregamos plan/vigencia/estado: el backend no los expone en este listado.
export interface AdminClient {
  id: number
  name: string
  lastname: string
  email: string
  document: string
  phone: string | null
  weight: number | null
  height: number | null
  active: boolean
  createdAt: string | null
}

// Espejo de ClientUpdateRequest (todos los campos opcionales).
export interface ClientUpdateInput {
  name?: string
  lastname?: string
  email?: string
  document?: string
  phone?: string | null
  weight?: number | null
  height?: number | null
  active?: boolean
}

// Espejo de PaymentResponse (dto/payment/PaymentResponse.kt).
export interface AdminPayment {
  id: number
  membershipId: number
  userId: number
  discountId: number | null
  amount: number
  method: PaymentMethod
  reference: string | null
  status: PaymentStatus
  createdAt: string | null
}

// El nombre del socio no viene en PaymentResponse: se resuelve cruzando userId
// contra el listado de /admin/clients.
export interface AdminPaymentView extends AdminPayment {
  memberName: string | null
}

// Métricas calculadas en el frontend (no hay endpoint dedicado en el backend).
export interface AdminMetrics {
  totalMembers: number
  activeMembers: number
  monthlyRevenue: number
  pendingPayments: number
  attendance: StatPoint[]
  attendancePeak: number
}

export interface MonthlyIncomePoint {
  label: string
  amount: number
}

export interface PlanIncome {
  planName: string
  amount: number
}

export interface IncomeStats {
  monthly: MonthlyIncomePoint[]
  byPlan: PlanIncome[]
  totalYear: number
  monthlyPeak: number
}
