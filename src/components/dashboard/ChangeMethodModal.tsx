import { useEffect, useState } from 'react'
import type { PaymentMethod } from '../../types/membership'
import { paymentMethodLabel } from '../../utils/membership'

interface ChangeMethodModalProps {
  open: boolean
  busy?: boolean
  onConfirm: (method: PaymentMethod) => void
  onClose: () => void
}

const methods: PaymentMethod[] = ['CARD', 'TRANSFER', 'CASH']

export function ChangeMethodModal({
  open,
  busy = false,
  onConfirm,
  onClose,
}: ChangeMethodModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('CARD')

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Cambiar método de pago"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="border-b border-line p-6">
          <h2 className="font-display text-3xl tracking-wide text-ink">
            Cambiar método de pago
          </h2>
          <p className="mt-1 text-sm text-muted">
            Tu inscripción sigue vigente. Elige cómo quieres completar el pago:
            con tarjeta te llevamos de nuevo a MercadoPago; en efectivo o
            transferencia el pago se confirma en recepción.
          </p>
        </div>

        <div className="p-6">
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
              disabled={busy}
              onClick={() => onConfirm(method)}
              className="rounded-full bg-ember px-6 py-2.5 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
            >
              {busy
                ? method === 'CARD'
                  ? 'Abriendo MercadoPago…'
                  : 'Guardando…'
                : method === 'CARD'
                  ? 'Pagar con tarjeta'
                  : 'Confirmar método'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
