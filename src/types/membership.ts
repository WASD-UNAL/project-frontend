export type StatusColor = 'GREEN' | 'YELLOW' | 'RED'

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'

export type PaymentStatus = 'SUCCESSFUL' | 'PENDING' | 'REJECTED'


export interface MyMembership {
  hasActiveMembership: boolean
  pendingApproval: boolean
  membershipId: number | null
  planId: number | null
  planName: string | null
  price: number | null
  endDate: string | null
  initDate: string | null
  statusColor: StatusColor
  daysRemaining: number
  message: string
}

export interface PaymentHistoryItem {
  id: number
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference: string | null
  createdAt: string | null
}

export interface PlanDiscount {
  id: number
  name: string
  description: string | null
  percentage: number
  discountedPrice: number
  endDate: string
}

export interface AvailablePlan {
  id: number
  name: string
  description: string | null
  durationDays: number
  price: number
  discount?: PlanDiscount | null
}

export interface CheckoutResponse {
  paymentId: number
  checkoutUrl: string
}

export interface ConfirmCheckoutResult {
  paymentId: number
  status: PaymentStatus
}

export interface UserProfile {
  id: number
  name: string
  lastname: string
  email: string
  document: string
  role: string
  active: boolean
  phone?: string | null
  weight?: number | null
  height?: number | null
}

export interface UpdateProfileInput {
  name?: string
  lastname?: string
  email?: string
  phone?: string
  weight?: number
  height?: number
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}
