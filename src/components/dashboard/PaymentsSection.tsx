import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import type {
  AvailablePlan,
  MyMembership,
  PaymentHistoryItem,
  PaymentMethod,
} from '../../types/membership'
import {
  cancelMembership,
  enrollInPlan,
  getMyMembership,
  getPaymentHistory,
} from '../../services/membershipService'
import { getActivePlans } from '../../services/planService'
import { ApiError } from '../../services/apiClient'
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

export function PaymentsSection() {
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
  const [feedback, setFeedback] = useState<Feedback | null>(null)

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

  async function handleEnroll(planId: number, method: PaymentMethod) {
    setBusy(true)
    setFeedback(null)
    try {
      const updated = await enrollInPlan(planId, method)
      setMembership(updated)
      setPayments(await getPaymentHistory())
      closeEnroll()
      setFeedback({
        tone: 'ok',
        text: 'Te inscribiste correctamente. Tu pago quedó pendiente de confirmación.',
      })
    } catch (error) {
      setFeedback({ tone: 'error', text: messageFor(error) })
    } finally {
      setBusy(false)
    }
  }

  async function handleCancel() {
    setBusy(true)
    setFeedback(null)
    try {
      const updated = await cancelMembership()
      setMembership(updated)
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
        title="¿Cancelar tu plan?"
        confirmLabel="Sí, cancelar"
        destructive
        busy={busy}
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      >
        Perderás el acceso al gimnasio al finalizar el día de hoy. Podrás volver
        a inscribirte cuando quieras, pero tendrás que realizar un nuevo pago.
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
