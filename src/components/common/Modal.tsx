import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  label: string
  busy?: boolean
  maxWidth?: string
  accent?: boolean
  showClose?: boolean
  children: ReactNode
}

export function Modal({
  open,
  onClose,
  label,
  busy = false,
  maxWidth = 'max-w-2xl',
  accent = true,
  showClose = true,
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
          {accent && <div className="h-1 w-full bg-ember" />}

          {showClose && (
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => !busy && onClose()}
              disabled={busy}
              className="absolute top-5 right-5 text-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              <X className="size-5" />
            </button>
          )}

          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
