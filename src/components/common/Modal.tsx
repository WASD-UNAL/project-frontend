import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** Texto para aria-label del diálogo. */
  label: string
  /** Bloquea el cierre (por Escape, backdrop o la X) mientras hay una operación en curso. */
  busy?: boolean
  /** Ancho máximo de la tarjeta (clase de Tailwind). */
  maxWidth?: string
  children: ReactNode
}

/**
 * Cáscara común de modal: portal a document.body, backdrop con blur, cierre con
 * Escape, botón de cierre y el borde superior ember. Evita reimplementar lo
 * mismo en cada modal (perfil, formulario, etc.).
 */
export function Modal({
  open,
  onClose,
  label,
  busy = false,
  maxWidth = 'max-w-2xl',
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[70] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !busy && onClose()}
        className="fixed inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div className="relative flex min-h-full items-center justify-center px-4 py-8">
        <div
          className={`animate-card-rise relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]`}
        >
          <div className="h-1 w-full bg-ember" />

          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="absolute top-5 right-5 text-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            <X className="size-5" />
          </button>

          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
