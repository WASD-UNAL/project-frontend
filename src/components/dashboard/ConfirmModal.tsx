import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface ConfirmModalProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** true pinta el botón de confirmar como acción destructiva. */
  destructive?: boolean
  /** deshabilita los botones mientras corre la acción. */
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Volver',
  destructive = false,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <h2 className="font-display text-3xl tracking-wide text-ink">
          {title}
        </h2>
        <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-steel disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-full px-5 py-2.5 text-sm font-bold tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 ${
              destructive
                ? 'bg-danger text-ink'
                : 'bg-ember text-bg'
            }`}
          >
            {busy ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
