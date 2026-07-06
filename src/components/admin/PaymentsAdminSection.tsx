import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { AdminPaymentView } from '../../types/admin'
import type { PaymentStatus } from '../../types/membership'
import { getPaymentsWithMembers, setPaymentStatus } from '../../services/adminService'
import { formatCOP } from '../../utils/currency'
import { formatDate, paymentMethodLabel, paymentStatusThemes } from '../../utils/membership'

type Filter = 'ALL' | PaymentStatus

const filters: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'SUCCESSFUL', label: 'Pagados' },
  { key: 'REJECTED', label: 'Rechazados' },
]

function formatPaymentDate(iso: string | null): string {
  return iso ? formatDate(iso.slice(0, 10)) : '—'
}

export function PaymentsAdminSection() {
  const [payments, setPayments] = useState<AdminPaymentView[] | null>(null)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<Filter>('PENDING')
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    getPaymentsWithMembers()
      .then((data) => {
        if (!cancelled) setPayments(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => {
    const base = { ALL: 0, PENDING: 0, SUCCESSFUL: 0, REJECTED: 0 } as Record<Filter, number>
    if (!payments) return base
    base.ALL = payments.length
    for (const p of payments) base[p.status] += 1
    return base
  }, [payments])

  const visible = useMemo(() => {
    if (!payments) return []
    return filter === 'ALL'
      ? payments
      : payments.filter((p) => p.status === filter)
  }, [payments, filter])

  async function decide(payment: AdminPaymentView, status: PaymentStatus) {
    setBusyId(payment.id)
    try {
      const updated = await setPaymentStatus(payment, status)
      setPayments((prev) =>
        prev
          ? prev.map((p) =>
              p.id === updated.id
                ? { ...updated, memberName: p.memberName }
                : p,
            )
          : prev,
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
          PAGOS
        </h1>
        <p className="mt-1 text-sm text-muted">
          Confirma o rechaza los pagos pendientes y revisa el historial.
        </p>
      </div>

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

      {error ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar los pagos.
        </p>
      ) : !payments ? (
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
