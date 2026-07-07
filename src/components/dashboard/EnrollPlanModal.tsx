import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import type { AvailablePlan, PaymentMethod } from '../../types/membership'
import { formatCOP } from '../../utils/currency'
import { effectivePrice } from '../../utils/discount'
import { paymentMethodLabel } from '../../utils/membership'
import { PromoSticker } from '../common/PromoSticker'

interface EnrollPlanModalProps {
  open: boolean
  plans: AvailablePlan[]
  initialPlanId?: number | null
  busy?: boolean
  onEnroll: (planId: number, method: PaymentMethod) => void
  onClose: () => void
}

const methods: PaymentMethod[] = ['CARD', 'TRANSFER', 'CASH']

export function EnrollPlanModal({
  open,
  plans,
  initialPlanId = null,
  busy = false,
  onEnroll,
  onClose,
}: EnrollPlanModalProps) {
  const [planId, setPlanId] = useState<number | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('CARD')

  useEffect(() => {
    if (open) {
      const preferred =
        initialPlanId != null && plans.some((p) => p.id === initialPlanId)
          ? initialPlanId
          : (plans[1]?.id ?? plans[0]?.id ?? null)
      setPlanId(preferred)
      setMethod('CARD')
    }
  }, [open, plans, initialPlanId])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  const selected = plans.find((p) => p.id === planId) ?? null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Elegir plan"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div className="relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="border-b border-line p-6">
          <h2 className="font-display text-3xl tracking-wide text-ink">
            Elige tu plan
          </h2>
          <p className="mt-1 text-sm text-muted">
            Selecciona un plan y tu método de pago. Con tarjeta te llevamos a
            MercadoPago; en efectivo o transferencia el pago se confirma en
            recepción.
          </p>
        </div>

        <div className="grid gap-4 overflow-y-auto p-6 md:grid-cols-3">
          {plans.map((plan) => {
            const active = plan.id === planId
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setPlanId(plan.id)}
                aria-pressed={active}
                className={`flex flex-col rounded-xl border p-5 text-left transition-colors ${
                  active
                    ? 'border-ember bg-ember-soft'
                    : 'border-line bg-surface-soft hover:border-steel'
                }`}
              >
                {plan.discount && (
                  <PromoSticker
                    name={plan.discount.name}
                    percentage={plan.discount.percentage}
                    size="sm"
                    className="mb-2 -rotate-1 self-start"
                  />
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl tracking-wide text-ink">
                    {plan.name.toUpperCase()}
                  </h3>
                  {active && (
                    <Check className="size-5 text-ember" strokeWidth={2.5} />
                  )}
                </div>
                <p className="mt-2 min-h-10 text-xs text-muted">
                  {plan.description}
                </p>
                <p className="mt-3">
                  {plan.discount && (
                    <s className="block font-mono text-sm text-muted decoration-warn/70 decoration-2">
                      <span className="sr-only">Antes </span>
                      {formatCOP(plan.price)}
                    </s>
                  )}
                  <span className="font-mono text-2xl font-semibold text-ink">
                    {plan.discount && <span className="sr-only">Ahora </span>}
                    {formatCOP(effectivePrice(plan))}
                  </span>
                  <span className="text-xs text-muted"> / mes</span>
                </p>
              </button>
            )
          })}
        </div>

        <div className="border-t border-line p-6">
          <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
            Método de pago
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {methods.map((m) => {
              const active = m === method
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-ember bg-ember text-bg'
                      : 'border-line text-ink hover:border-steel'
                  }`}
                >
                  {paymentMethodLabel(m)}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-steel disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy || planId === null}
              onClick={() => planId !== null && onEnroll(planId, method)}
              className="rounded-full bg-ember px-6 py-2.5 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
            >
              {busy
                ? method === 'CARD'
                  ? 'Abriendo MercadoPago…'
                  : 'Inscribiendo…'
                : selected
                  ? method === 'CARD'
                    ? `Pagar · ${formatCOP(effectivePrice(selected))}`
                    : `Inscribirme · ${formatCOP(effectivePrice(selected))}`
                  : 'Inscribirme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
