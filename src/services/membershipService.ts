import { api } from './apiClient'
import type {
  MyMembership,
  PaymentHistoryItem,
  PaymentMethod,
  UserProfile,
} from '../types/membership'

/** GET /me/profile — datos del usuario autenticado. */
export function getMyProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/me/profile')
}

/** GET /me/membership — estado de la membresía del cliente autenticado. */
export function getMyMembership(): Promise<MyMembership> {
  return api.get<MyMembership>('/me/membership')
}

/** GET /me/payments — historial de pagos del cliente. */
export function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
  return api.get<PaymentHistoryItem[]>('/me/payments')
}

/** POST /me/membership/enroll — inscribe al cliente en un plan. */
export function enrollInPlan(
  planId: number,
  paymentMethod: PaymentMethod,
): Promise<MyMembership> {
  return api.post<MyMembership>('/me/membership/enroll', { planId, paymentMethod })
}

/** PATCH /me/membership/cancel — cancela la membresía activa. */
export function cancelMembership(): Promise<MyMembership> {
  return api.patch<MyMembership>('/me/membership/cancel')
}
