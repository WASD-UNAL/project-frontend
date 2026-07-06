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
