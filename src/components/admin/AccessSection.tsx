import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, ScanLine, XCircle, AlertTriangle } from 'lucide-react'
import type { VisualAlertResponse } from '../../services/accessService'
import { registerAccess } from '../../services/accessService'
import { statusThemes } from '../../utils/membership'
import type { StatusColor } from '../../types/membership'

const statusIcons: Record<StatusColor, typeof CheckCircle2> = {
  GREEN: CheckCircle2,
  YELLOW: AlertTriangle,
  RED: XCircle,
}

const statusTitles: Record<StatusColor, string> = {
  GREEN: 'Acceso permitido',
  YELLOW: 'Acceso permitido · por vencer',
  RED: 'Acceso denegado',
}

export function AccessSection() {
  const [document, setDocument] = useState('')
  const [result, setResult] = useState<VisualAlertResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const doc = document.trim()
    if (!doc || busy) return

    setBusy(true)
    setError(null)
    try {
      const alert = await registerAccess(doc)
      setResult(alert)
      setDocument('')
    } catch (err) {
      setResult(null)
      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos validar el acceso. Inténtalo de nuevo.',
      )
    } finally {
      setBusy(false)
    }
  }

  const theme = result ? statusThemes[result.statusColor] : null
  const Icon = result ? statusIcons[result.statusColor] : null
  const granted = result !== null && result.statusColor !== 'RED'

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
        CONTROL DE ACCESO
      </h1>
      <p className="mt-1 text-sm text-muted">
        Valida el documento del socio en recepción. Si el acceso se permite, la
        asistencia queda registrada automáticamente.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <ScanLine className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
          <input
            inputMode="numeric"
            autoFocus
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Documento del socio"
            className="w-full rounded-full border border-line bg-surface-soft py-3.5 pr-5 pl-12 text-lg text-ink placeholder:text-muted/60 transition-colors focus:border-ember focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !document.trim()}
          className="rounded-full bg-ember px-8 py-3.5 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {busy ? 'Validando…' : 'Validar acceso'}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {result && theme && Icon ? (
        <div
          role="status"
          className={`mt-8 rounded-2xl border-2 ${theme.border} ${theme.bgSoft} p-8 text-center sm:p-12`}
        >
          <Icon className={`mx-auto size-16 ${theme.text}`} strokeWidth={1.5} />
          <p className={`mt-4 font-display text-3xl tracking-wide sm:text-4xl ${theme.text}`}>
            {statusTitles[result.statusColor]}
          </p>
          <p className="mt-3 text-xl text-ink">
            {result.userName ?? `Documento ${result.document}`}
          </p>
          <p className="mt-2 text-sm text-muted">{result.message}</p>
          {granted && (
            <>
              {result.daysRemaining > 0 && (
                <p className="mt-4 font-mono text-xs tracking-[0.2em] text-muted uppercase">
                  {result.daysRemaining}{' '}
                  {result.daysRemaining === 1 ? 'día restante' : 'días restantes'}{' '}
                  de membresía
                </p>
              )}
              <p className={`mt-4 inline-flex items-center gap-2 rounded-full border ${theme.border} px-4 py-1.5 text-xs font-semibold ${theme.text}`}>
                <CheckCircle2 className="size-3.5" strokeWidth={2} />
                Asistencia registrada
              </p>
            </>
          )}
        </div>
      ) : (
        !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-line p-12 text-center text-sm text-muted">
            Ingresa un documento para ver el estado del socio.
          </div>
        )
      )}
    </div>
  )
}
