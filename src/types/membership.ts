// Tipos espejo de los DTOs que expondrá el backend (ver plan de la sesión).
// Por ahora la vista se alimenta de datos mock; al conectar el back solo se
// reemplaza el origen de datos, no estos contratos.

export type StatusColor = 'GREEN' | 'YELLOW' | 'RED'

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'

export type PaymentStatus = 'SUCCESSFUL' | 'PENDING' | 'REJECTED'

/** Respuesta de GET /me/membership */
export interface MyMembership {
  hasActiveMembership: boolean
  planId: number | null
  planName: string | null
  /** Precio del plan en COP. */
  price: number | null
  /** Fecha de vencimiento en ISO (YYYY-MM-DD). */
  endDate: string | null
  /** Fecha de inicio en ISO. Útil para dibujar la barra de vigencia. */
  initDate: string | null
  statusColor: StatusColor
  daysRemaining: number
  message: string
}

/** Item de GET /me/payments */
export interface PaymentHistoryItem {
  id: number
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference: string | null
  /** Fecha de creación en ISO. */
  createdAt: string
}

/** Plan disponible para inscripción (GET /plans). */
export interface AvailablePlan {
  id: number
  name: string
  description: string | null
  durationDays: number
  price: number
}

/** Respuesta de GET /me/profile. */
export interface UserProfile {
  id: number
  name: string
  lastname: string
  email: string
  document: string
  role: string
  active: boolean
}
