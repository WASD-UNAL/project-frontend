import type {
  AdminMember,
  AdminMetrics,
  AdminPayment,
  Gender,
  IncomeStats,
  MonthlyIncomePoint,
  PlanIncome,
} from '../types/admin'
import type { PaymentStatus } from '../types/membership'

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const MEMBERS_KEY = 'gymly_admin_members_v1'
const PAYMENTS_KEY = 'gymly_admin_payments_v1'

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    return seed
  }
  return seed
}

function persist(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    void 0
  }
}

function commitMembers(next: AdminMember[]): void {
  members = next
  persist(MEMBERS_KEY, members)
}

function commitPayments(next: AdminPayment[]): void {
  payments = next
  persist(PAYMENTS_KEY, payments)
}

const seedMembers: AdminMember[] = [
  { id: 1, name: 'Laura', lastname: 'Gómez', email: 'laura.gomez@correo.com', document: '1032456789', phone: '300 412 8890', birthDate: '1996-04-12', gender: 'F', address: 'Cra 45 #23-10, Medellín', weightKg: 62, heightCm: 168, planName: 'Plus', status: 'ACTIVE', endDate: '2026-07-28', active: true, joinedAt: '2025-11-03' },
  { id: 2, name: 'Andrés', lastname: 'Martínez', email: 'andres.mtz@correo.com', document: '1018223344', phone: '311 776 5521', birthDate: '1990-09-03', gender: 'M', address: 'Calle 80 #12-45, Bogotá', weightKg: 81, heightCm: 179, planName: 'Elite', status: 'ACTIVE', endDate: '2026-08-12', active: true, joinedAt: '2025-09-21' },
  { id: 3, name: 'Valentina', lastname: 'Ríos', email: 'valen.rios@correo.com', document: '1094556677', phone: '320 118 4432', birthDate: '2000-01-27', gender: 'F', address: 'Av 6N #28-15, Cali', weightKg: 55, heightCm: 162, planName: 'Básico', status: 'EXPIRING', endDate: '2026-07-09', active: true, joinedAt: '2026-01-15' },
  { id: 4, name: 'Sebastián', lastname: 'Peña', email: 'seba.pena@correo.com', document: '1077889900', phone: '315 990 2210', birthDate: '1993-11-08', gender: 'M', address: 'Cra 70 #45-30, Medellín', weightKg: 88, heightCm: 183, planName: 'Plus', status: 'EXPIRED', endDate: '2026-06-18', active: true, joinedAt: '2025-07-30' },
  { id: 5, name: 'Mariana', lastname: 'Cardona', email: 'mariana.c@correo.com', document: '1005112233', phone: '301 223 7788', birthDate: '1998-06-19', gender: 'F', address: 'Calle 10 #34-22, Cali', weightKg: 59, heightCm: 165, planName: 'Elite', status: 'ACTIVE', endDate: '2026-09-01', active: true, joinedAt: '2026-02-10' },
  { id: 6, name: 'Julián', lastname: 'Vargas', email: 'julian.vargas@correo.com', document: '1066445566', phone: '312 445 6677', birthDate: '1988-02-14', gender: 'M', address: null, weightKg: null, heightCm: null, planName: null, status: 'INACTIVE', endDate: null, active: false, joinedAt: '2025-05-19' },
  { id: 7, name: 'Camila', lastname: 'Ospina', email: 'camila.ospina@correo.com', document: '1088776655', phone: '318 667 9900', birthDate: '2001-08-30', gender: 'F', address: 'Cra 15 #93-40, Bogotá', weightKg: 57, heightCm: 170, planName: 'Básico', status: 'ACTIVE', endDate: '2026-07-25', active: true, joinedAt: '2026-03-04' },
  { id: 8, name: 'Daniel', lastname: 'Restrepo', email: 'daniel.r@correo.com', document: '1023998877', phone: '304 332 1145', birthDate: '1995-12-05', gender: 'M', address: 'Cra 43A #7-50, Medellín', weightKg: 76, heightCm: 176, planName: 'Plus', status: 'EXPIRING', endDate: '2026-07-07', active: true, joinedAt: '2025-12-12' },
]

const seedPayments: AdminPayment[] = [
  { id: 101, memberName: 'Laura Gómez', memberDocument: '1032456789', amount: 119000, method: 'CARD', status: 'PENDING', reference: 'REF-8821', createdAt: '2026-07-03' },
  { id: 102, memberName: 'Sebastián Peña', memberDocument: '1077889900', amount: 119000, method: 'TRANSFER', status: 'PENDING', reference: 'REF-8822', createdAt: '2026-07-02' },
  { id: 103, memberName: 'Camila Ospina', memberDocument: '1088776655', amount: 79000, method: 'CASH', status: 'SUCCESSFUL', reference: 'REF-8790', createdAt: '2026-06-30' },
  { id: 104, memberName: 'Andrés Martínez', memberDocument: '1018223344', amount: 179000, method: 'CARD', status: 'SUCCESSFUL', reference: 'REF-8776', createdAt: '2026-06-28' },
  { id: 105, memberName: 'Daniel Restrepo', memberDocument: '1023998877', amount: 119000, method: 'TRANSFER', status: 'PENDING', reference: 'REF-8825', createdAt: '2026-07-01' },
  { id: 106, memberName: 'Mariana Cardona', memberDocument: '1005112233', amount: 179000, method: 'CARD', status: 'SUCCESSFUL', reference: 'REF-8740', createdAt: '2026-06-25' },
  { id: 107, memberName: 'Valentina Ríos', memberDocument: '1094556677', amount: 79000, method: 'CASH', status: 'REJECTED', reference: 'REF-8801', createdAt: '2026-06-27' },
  { id: 108, memberName: 'Julián Vargas', memberDocument: '1066445566', amount: 79000, method: 'TRANSFER', status: 'REJECTED', reference: 'REF-8755', createdAt: '2026-06-20' },
]

let members: AdminMember[] = load(MEMBERS_KEY, seedMembers)
let payments: AdminPayment[] = load(PAYMENTS_KEY, seedPayments)

const attendance = [
  { label: 'Lun', count: 182 },
  { label: 'Mar', count: 205 },
  { label: 'Mié', count: 198 },
  { label: 'Jue', count: 231 },
  { label: 'Vie', count: 264 },
  { label: 'Sáb', count: 176 },
  { label: 'Dom', count: 98 },
]

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

export function getAdminMetrics(): Promise<AdminMetrics> {
  const activeMemberships = members.filter(
    (m) => m.status === 'ACTIVE' || m.status === 'EXPIRING',
  ).length
  const monthlyRevenue = payments
    .filter((p) => p.status === 'SUCCESSFUL')
    .reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length
  const attendancePeak = Math.max(...attendance.map((p) => p.count))

  return delay({
    totalMembers: members.length,
    activeMemberships,
    monthlyRevenue,
    pendingPayments,
    attendance,
    attendancePeak,
  })
}

export function getIncomeStats(): Promise<IncomeStats> {
  const totalYear = monthlyIncome.reduce((sum, m) => sum + m.amount, 0)
  const monthlyPeak = Math.max(...monthlyIncome.map((m) => m.amount))
  return delay({
    monthly: monthlyIncome.map((m) => ({ ...m })),
    byPlan: incomeByPlan.map((p) => ({ ...p })),
    totalYear,
    monthlyPeak,
  })
}

export function getMembers(): Promise<AdminMember[]> {
  return delay(members.map((m) => ({ ...m })))
}

export function getPayments(): Promise<AdminPayment[]> {
  return delay(payments.map((p) => ({ ...p })))
}

export function setPaymentStatus(
  id: number,
  status: PaymentStatus,
): Promise<AdminPayment> {
  commitPayments(payments.map((p) => (p.id === id ? { ...p, status } : p)))
  const updated = payments.find((p) => p.id === id)!
  return delay({ ...updated })
}

export interface NewMemberInput {
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
}

export function createMember(input: NewMemberInput): Promise<AdminMember> {
  const email = input.email.trim().toLowerCase()
  const document = input.document.trim()

  const emailTaken = members.some((m) => m.email.toLowerCase() === email)
  const documentTaken = members.some((m) => m.document === document)
  if (emailTaken || documentTaken) {
    const message =
      emailTaken && documentTaken
        ? 'Ya hay un cliente registrado con ese correo y ese documento.'
        : emailTaken
          ? 'Ya hay un cliente registrado con ese correo.'
          : 'Ya hay un cliente registrado con ese documento.'
    return Promise.reject(new Error(message))
  }

  const id = members.reduce((max, m) => Math.max(max, m.id), 0) + 1
  const today = new Date()
  const toIso = (d: Date) => d.toISOString().slice(0, 10)

  const hasPlan = Boolean(input.planName)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 30)

  const member: AdminMember = {
    id,
    name: input.name.trim(),
    lastname: input.lastname.trim(),
    email: input.email.trim(),
    document: input.document.trim(),
    phone: input.phone.trim(),
    birthDate: input.birthDate,
    gender: input.gender,
    address: input.address?.trim() || null,
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    planName: hasPlan ? input.planName : null,
    status: hasPlan ? 'ACTIVE' : 'INACTIVE',
    endDate: hasPlan ? toIso(endDate) : null,
    active: true,
    joinedAt: toIso(today),
  }

  commitMembers([member, ...members])
  return delay({ ...member })
}

export function updateMember(
  id: number,
  input: NewMemberInput,
): Promise<AdminMember> {
  const current = members.find((m) => m.id === id)
  if (!current) {
    return Promise.reject(new Error('El socio ya no existe.'))
  }

  const email = input.email.trim().toLowerCase()
  const document = input.document.trim()
  const emailTaken = members.some(
    (m) => m.id !== id && m.email.toLowerCase() === email,
  )
  const documentTaken = members.some(
    (m) => m.id !== id && m.document === document,
  )
  if (emailTaken || documentTaken) {
    const message =
      emailTaken && documentTaken
        ? 'Ya hay otro cliente con ese correo y ese documento.'
        : emailTaken
          ? 'Ya hay otro cliente con ese correo.'
          : 'Ya hay otro cliente con ese documento.'
    return Promise.reject(new Error(message))
  }

  const hadPlan = Boolean(current.planName)
  const hasPlan = Boolean(input.planName)
  const toIso = (d: Date) => d.toISOString().slice(0, 10)

  let status = current.status
  let endDate = current.endDate
  let active = current.active
  if (!hadPlan && hasPlan) {
    const end = new Date()
    end.setDate(end.getDate() + 30)
    status = 'ACTIVE'
    endDate = toIso(end)
    active = true
  } else if (hadPlan && !hasPlan) {
    status = 'INACTIVE'
    endDate = null
  }

  const updated: AdminMember = {
    ...current,
    name: input.name.trim(),
    lastname: input.lastname.trim(),
    email: input.email.trim(),
    document,
    phone: input.phone.trim(),
    birthDate: input.birthDate,
    gender: input.gender,
    address: input.address?.trim() || null,
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    planName: hasPlan ? input.planName : null,
    status,
    endDate,
    active,
  }

  commitMembers(members.map((m) => (m.id === id ? updated : m)))
  return delay({ ...updated })
}

export function deleteMember(id: number): Promise<void> {
  commitMembers(members.filter((m) => m.id !== id))
  return delay(undefined)
}

export function setMemberActive(
  id: number,
  active: boolean,
): Promise<AdminMember> {
  commitMembers(
    members.map((m) =>
      m.id === id
        ? { ...m, active, status: active ? 'ACTIVE' : 'INACTIVE' }
        : m,
    ),
  )
  const updated = members.find((m) => m.id === id)!
  return delay({ ...updated })
}
