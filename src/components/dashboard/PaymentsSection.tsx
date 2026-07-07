import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import type {
  AvailablePlan,
  MyMembership,
  PaymentHistoryItem,
  PaymentMethod,
  PaymentStatus,
} from '../../types/membership'
import {
  cancelMembership,
  confirmCheckout,
  createCheckout,
  enrollInPlan,
  getMyMembership,
  getPaymentHistory,
} from '../../services/membershipService'
import { getActivePlans } from '../../services/planService'
import { ApiError } from '../../services/apiClient'
import { useAuth } from '../../hooks/useAuth'
import { MembershipStatusCard } from './MembershipStatusCard'
import { PaymentHistoryList } from './PaymentHistoryList'
import { EnrollPlanModal } from './EnrollPlanModal'
import { ConfirmModal } from './ConfirmModal'

interface Feedback {
  tone: 'ok' | 'error'
  text: string
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Tu sesión expiró o no has iniciado sesión. Vuelve a entrar para ver tus pagos.'
    }
    return error.message
  }
  return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
}

const returnMessages: Record<string, Feedback> = {
  success: {
    tone: 'ok',
    text: 'Tu pago fue aprobado. Tu membresía se activará en cuanto la pasarela lo confirme.',
  },
  pending: {
    tone: 'ok',
    text: 'Tu pago quedó en proceso. Te confirmaremos cuando la pasarela lo apruebe.',
  },
  failure: {
    tone: 'error',
    text: 'El pago no se completó. Puedes intentarlo de nuevo cuando quieras.',
  },
}

const confirmedMessages: Record<PaymentStatus, Feedback> = {
  SUCCESSFUL: {
    tone: 'ok',
    text: '¡Tu pago fue aprobado y tu membresía ya está activa! No necesitas ninguna confirmación adicional.',
  },
  PENDING: {
    tone: 'ok',
    text: 'Tu pago quedó en proceso. Te confirmaremos cuando la pasarela lo apruebe.',
  },
  REJECTED: {
    tone: 'error',
    text: 'La pasarela rechazó tu pago y quedó registrado como rechazado en tu historial. Puedes inscribirte e intentarlo de nuevo cuando quieras.',
  },
}

function parseMpPaymentId(params: URLSearchParams): number | null {
  const raw = params.get('payment_id') ?? params.get('collection_id')
  if (raw === null) return null
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function PaymentsSection() {
  const { profile } = useAuth()
  const [membership, setMembership] = useState<MyMembership | null>(null)
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [plans, setPlans] = useState<AvailablePlan[]>([])

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const enrollParam = searchParams.get('enroll')
  const initialPlanId = enrollParam ? Number(enrollParam) : null

  const [enrollOpen, setEnrollOpen] = useState(enrollParam !== null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checkoutReturn] = useState(() => ({
    outcome: searchParams.get('payment'),
    mpPaymentId: parseMpPaymentId(searchParams),
  }))
  const [feedback, setFeedback] = useState<Feedback | null>(
    checkoutReturn.outcome ? (returnMessages[checkoutReturn.outcome] ?? null) : null,
  )

  useEffect(() => {
    if (checkoutReturn.outcome !== null) {
      setSearchParams({}, { replace: true })
    }
  }, [checkoutReturn, setSearchParams])

  const closeEnroll = useCallback(() => {
    setEnrollOpen(false)
    if (enrollParam !== null) {
      setSearchParams({}, { replace: true })
    }
  }, [enrollParam, setSearchParams])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [membershipData, paymentsData, plansData] = await Promise.all([
        getMyMembership(),
        getPaymentHistory(),
        getActivePlans(),
      ])
      setMembership(membershipData)
      setPayments(paymentsData)
      setPlans(plansData)
    } catch (error) {
      setLoadError(messageFor(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (checkoutReturn.mpPaymentId === null) return
    confirmCheckout(checkoutReturn.mpPaymentId)
      .then((result) => {
        setFeedback(confirmedMessages[result.status])
        return load()
      })
      .catch(() => {
        if (checkoutReturn.outcome !== null) {
          setFeedback(returnMessages[checkoutReturn.outcome] ?? null)
        }
      })
  }, [checkoutReturn, load])

  async function handleEnroll(planId: number, method: PaymentMethod) {
    setBusy(true)
    setFeedback(null)
    try {
      const updated = await enrollInPlan(planId, method)
      setMembership(updated)
      setPayments(await getPaymentHistory())

      if (method === 'CASH' || method === 'TRANSFER') {
        closeEnroll()
        setFeedback({
          tone: 'ok',
          text:
            method === 'CASH'
              ? 'Te inscribiste correctamente. Paga en recepción para confirmar tu membresía.'
              : 'Te inscribiste correctamente. Realiza la transferencia y presenta el comprobante en recepción para confirmar tu membresía.',
        })
        return
      }

      const plan = plans.find((p) => p.id === planId)
      if (updated.membershipId === null || plan === undefined || profile === null) {
        closeEnroll()
        setFeedback({
          tone: 'error',
          text: 'Tu inscripción quedó registrada, pero no pudimos generar el enlace de pago. Actualiza la página e inténtalo de nuevo.',
        })
        return
      }

      const checkout = await createCheckout({
        membershipId: updated.membershipId,
        userId: profile.id,
        amount: plan.price,
        method,
      })
      window.location.assign(checkout.checkoutUrl)
    } catch (error) {
      closeEnroll()
      setFeedback({ tone: 'error', text: messageFor(error) })
      setBusy(false)
      return
    }
    setBusy(false)
  }

  async function handleCancel() {
    setBusy(true)
    setFeedback(null)
    try {
      const updated = await cancelMembership()
      setMembership(updated)
      setPayments(await getPaymentHistory())
      setCancelOpen(false)
      setFeedback({
        tone: 'ok',
        text: 'Cancelaste tu plan. Puedes volver a inscribirte cuando quieras.',
      })
    } catch (error) {
      setCancelOpen(false)
      setFeedback({ tone: 'error', text: messageFor(error) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
            PAGOS
          </h1>
          <p className="mt-1 text-sm text-muted">
            Consulta la vigencia de tu plan, renueva o cancela, y revisa tus
            pagos.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
          Actualizar
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mt-6 rounded-xl border px-4 py-3 text-sm text-ink ${
            feedback.tone === 'ok'
              ? 'border-ember/40 bg-ember-soft'
              : 'border-danger/40 bg-danger-soft'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loading ? (
        <PaymentsSkeleton />
      ) : loadError ? (
        <div className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6">
          <p className="text-sm text-ink">{loadError}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-steel"
          >
            Reintentar
          </button>
        </div>
      ) : membership ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <MembershipStatusCard
              membership={membership}
              onEnroll={() => setEnrollOpen(true)}
              onCancel={() => setCancelOpen(true)}
            />
          </div>
          <div
            className="animate-card-rise lg:col-span-2"
            style={{ '--rise-delay': '120ms' } as CSSProperties}
          >
            <PaymentHistoryList payments={payments} />
          </div>
        </div>
      ) : null}

      <EnrollPlanModal
        open={enrollOpen}
        plans={plans}
        initialPlanId={initialPlanId}
        busy={busy}
        onEnroll={handleEnroll}
        onClose={closeEnroll}
      />

      <ConfirmModal
        open={cancelOpen}
        title={membership?.pendingApproval ? '¿Cancelar tu inscripción?' : '¿Cancelar tu plan?'}
        confirmLabel="Sí, cancelar"
        destructive
        busy={busy}
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      >
        {membership?.pendingApproval
          ? 'Se anulará tu inscripción pendiente de aprobación. Podrás inscribirte al mismo plan o a otro cuando quieras.'
          : 'Perderás el acceso al gimnasio al finalizar el día de hoy. Podrás volver a inscribirte cuando quieras, pero tendrás que realizar un nuevo pago.'}
      </ConfirmModal>
    </div>
  )
}

function PaymentsSkeleton() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-5" aria-hidden>
      <div className="h-80 animate-pulse rounded-2xl border border-line bg-surface lg:col-span-3" />
      <div className="h-80 animate-pulse rounded-2xl border border-line bg-surface lg:col-span-2" />
    </div>
  )
}
