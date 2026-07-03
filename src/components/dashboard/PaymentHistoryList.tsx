import type { PaymentHistoryItem } from '../../types/membership'
import { formatCOP } from '../../utils/currency'
import {
  formatDate,
  paymentMethodLabel,
  paymentStatusThemes,
} from '../../utils/membership'

interface PaymentHistoryListProps {
  payments: PaymentHistoryItem[]
}

export function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
  return (
    <section
      aria-label="Historial de pagos"
      className="animate-card-rise rounded-2xl border border-line bg-surface p-6"
      style={{ '--rise-delay': '80ms' } as React.CSSProperties}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl tracking-wide text-ink">
          Historial de pagos
        </h3>
        <span className="font-mono text-xs text-muted">
          {payments.length} registros
        </span>
      </div>

      {payments.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Aquí verás tus pagos una vez realices tu primera inscripción.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {payments.map((p) => {
            const status = paymentStatusThemes[p.status]
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">
                    {p.reference ?? `Pago #${p.id}`}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {formatDate(p.createdAt)} · {paymentMethodLabel(p.method)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
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
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
