import type { PaymentMethod, PaymentStatus, PlanDiscount } from './membership'

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
  discount?: PlanDiscount | null
}

export interface PlanInput {
  name: string
  description: string | null
  durationDays: number
  price: number
  active: boolean
}

export interface DiscountPlanRef {
  id: number
  name: string
}

export interface AdminDiscount {
  id: number
  name: string
  description: string | null
  percentage: number
  initDate: string
  endDate: string
  active: boolean
  plans: DiscountPlanRef[]
}

export interface DiscountInput {
  name: string
  description: string | null
  percentage: number
  initDate: string
  endDate: string
  active: boolean
  planIds: number[]
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
