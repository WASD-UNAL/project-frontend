import type { PaymentMethod, PaymentStatus } from './membership'
import type { StatPoint } from './attendance'

export type MemberStatus = 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'INACTIVE'

export type Gender = 'M' | 'F' | 'OTHER'

export interface AdminMember {
  id: number
  name: string
  lastname: string
  email: string
  document: string
  phone: string
  birthDate: string | null
  gender: Gender | null
  address: string | null
  weightKg: number | null
  heightCm: number | null
  planName: string | null
  status: MemberStatus
  endDate: string | null
  active: boolean
  joinedAt: string
}

export interface AdminPayment {
  id: number
  memberName: string
  memberDocument: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference: string | null
  createdAt: string
}

export interface AdminMetrics {
  totalMembers: number
  activeMemberships: number
  monthlyRevenue: number
  pendingPayments: number
  attendance: StatPoint[]
  attendancePeak: number
}
