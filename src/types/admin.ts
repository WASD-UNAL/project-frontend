import type { PaymentMethod, PaymentStatus } from './membership'

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

export interface AdminPaymentView extends AdminPayment {
  memberName: string | null
}

export interface AdminPlan {
  id: number
  name: string
  description: string | null
  durationDays: number
  price: number
  active: boolean
}

export interface PlanInput {
  name: string
  description: string | null
  durationDays: number
  price: number
  active: boolean
}

export interface MonthlyRevenue {
  year: number
  month: number
  label: string
  totalRevenue: number
  totalPayments: number
}

export interface PlanRevenue {
  planId: number
  planName: string
  revenue: number
  paymentCount: number
}

export interface RevenueByPlan {
  year: number
  month: number
  totalRevenue: number
  details: PlanRevenue[]
}

export interface PeriodSummary {
  label: string
  totalRevenue: number
  totalPayments: number
}

export interface RevenueComparison {
  currentPeriod: PeriodSummary
  previousPeriod: PeriodSummary
  percentageChange: number
}
