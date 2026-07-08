import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { AdminPaymentView } from '../../types/admin'
import type { PaymentStatus } from '../../types/membership'
import { joinPaymentsWithMembers, setPaymentStatus } from '../../services/adminService'
import { formatCOP } from '../../utils/currency'
import { formatDate, paymentMethodLabel, paymentStatusThemes } from '../../utils/membership'
import { useAdminData } from '../../hooks/useAdminData'
import { RefreshButton } from '../common/RefreshButton'

type Filter = 'ALL' | PaymentStatus

const PAYMENTS_REFRESH_INTERVAL_MS = 15000

const filters: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'SUCCESSFUL', label: 'Pagados' },
  { key: 'REJECTED', label: 'Rechazados' },
]

function formatPaymentDate(iso: string | null): string {
  return iso ? formatDate(iso.slice(0, 10)) : '—'
}

interface Feedback {
  tone: 'ok' | 'error'
  text: string
}

export function PaymentsAdminSection() {
  const { members, payments, paymentsError, refreshMembers, refreshPayments } = useAdminData()
  const [filter, setFilter] = useState<Filter>('PENDING')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const refresh = useCallback(async () => {
    await Promise.all([refreshMembers(), refreshPayments()])
  }, [refreshMembers, refreshPayments])

  // Refresco periódico: los pagos con tarjeta que MercadoPago confirma vía webhook
  // cambian de estado en el backend; así el admin ve el estado actualizado sin recargar.
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPayments()
    }, PAYMENTS_REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refreshPayments])

  const paymentsWithMembers = useMemo(() => {
    if (!payments || !members) return null
    return joinPaymentsWithMembers(payments, members)
  }, [payments, members])

  const counts = useMemo(() => {
    const base = { ALL: 0, PENDING: 0, SUCCESSFUL: 0, REJECTED: 0 } as Record<Filter, number>
    if (!paymentsWithMembers) return base
    base.ALL = paymentsWithMembers.length
    for (const p of paymentsWithMembers) base[p.status] += 1
    return base
  }, [paymentsWithMembers])

  const visible = useMemo(() => {
    if (!paymentsWithMembers) return []
    return filter === 'ALL'
      ? paymentsWithMembers
      : paymentsWithMembers.filter((p) => p.status === filter)
  }, [paymentsWithMembers, filter])

  async function decide(
    payment: Pick<AdminPaymentView, 'id' | 'amount' | 'method' | 'reference'>,
    status: PaymentStatus,
  ) {
    setBusyId(payment.id)
    setFeedback(null)
    try {
      await setPaymentStatus(payment, status)
      await refreshPayments()
    } catch {
      setFeedback({
        tone: 'error',
        text: 'No pudimos actualizar el estado del pago. Inténtalo de nuevo.',
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
            PAGOS
          </h1>
          <p className="mt-1 text-sm text-muted">
            Confirma o rechaza los pagos pendientes y revisa el historial.
          </p>
        </div>
        <RefreshButton onRefresh={refresh} />
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

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === key
                ? 'border-ember bg-ember-soft text-ember'
                : 'border-line text-muted hover:text-ink'
            }`}
          >
            {label}
            <span className="ml-1.5 font-mono text-xs opacity-70">
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {paymentsError ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar los pagos.
        </p>
      ) : !paymentsWithMembers ? (
        <div className="mt-6 h-80 animate-pulse rounded-2xl border border-line bg-surface" aria-hidden />
      ) : visible.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-surface p-10 text-center text-sm text-muted">
          No hay pagos en esta categoría.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((p) => {
            const status = paymentStatusThemes[p.status]
            const pending = p.status === 'PENDING'
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">
                    {p.memberName ?? `Socio #${p.userId}`}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {formatPaymentDate(p.createdAt)} · {paymentMethodLabel(p.method)} ·{' '}
                    {p.reference ?? `Pago #${p.id}`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono text-sm text-ink">
                      {formatCOP(p.amount)}
                    </p>
                    <p
                      className={`mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium ${status.text}`}
                    >
                      <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden />
                      {status.label}
                    </p>
                  </div>

                  {pending && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decide(p, 'SUCCESSFUL')}
                        disabled={busyId === p.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ember/50 px-3 py-1.5 text-xs font-semibold text-ember transition-colors hover:bg-ember hover:text-bg disabled:opacity-50"
                      >
                        <Check className="size-3.5" strokeWidth={2.5} />
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => decide(p, 'REJECTED')}
                        disabled={busyId === p.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                      >
                        <X className="size-3.5" strokeWidth={2.5} />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
