import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface RefreshButtonProps {
  onRefresh: () => Promise<void>
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (busy) return
    setBusy(true)
    try {
      await onRefresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label="Actualizar datos"
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-ember/50 hover:text-ember disabled:opacity-60"
    >
      <RefreshCw
        className={`size-3.5 ${busy ? 'animate-spin' : ''}`}
        strokeWidth={2}
      />
      {busy ? 'Actualizando…' : 'Actualizar'}
    </button>
  )
}
