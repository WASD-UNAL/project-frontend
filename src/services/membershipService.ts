import { api } from './apiClient'
import type {
  CheckoutResponse,
  MyMembership,
  PaymentHistoryItem,
  PaymentMethod,
  UserProfile,
} from '../types/membership'

export function getMyProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/me/profile')
}


export function getMyMembership(): Promise<MyMembership> {
  return api.get<MyMembership>('/me/membership')
}


export function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
  return api.get<PaymentHistoryItem[]>('/me/payments')
}


export function enrollInPlan(
  planId: number,
  paymentMethod: PaymentMethod,
): Promise<MyMembership> {
  return api.post<MyMembership>('/me/membership/enroll', { planId, paymentMethod })
}


export function cancelMembership(): Promise<MyMembership> {
  return api.patch<MyMembership>('/me/membership/cancel')
}


export function createCheckout(input: {
  membershipId: number
  userId: number
  amount: number
  method: PaymentMethod
}): Promise<CheckoutResponse> {
  return api.post<CheckoutResponse>('/payments/checkout', {
    ...input,
    status: 'PENDING',
  })
}
