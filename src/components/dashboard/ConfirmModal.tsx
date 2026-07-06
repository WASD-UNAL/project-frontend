import type { ReactNode } from 'react'
import { Modal } from '../common/Modal'

interface ConfirmModalProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
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
  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={busy}
      maxWidth="max-w-md"
      accent={false}
      showClose={false}
      label={title}
    >
      <div className="p-6">
        <h2 className="font-display text-3xl tracking-wide text-ink">{title}</h2>
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
            autoFocus
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-full px-5 py-2.5 text-sm font-bold tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 ${
              destructive ? 'bg-danger text-ink' : 'bg-ember text-bg'
            }`}
          >
            {busy ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
