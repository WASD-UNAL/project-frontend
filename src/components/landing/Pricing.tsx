import { useCallback, useEffect, useState } from 'react'
import type { AvailablePlan } from '../../types/membership'
import { getActivePlans } from '../../services/planService'
import { ApiError } from '../../services/apiClient'
import { PricingCarousel } from './PricingCarousel'

function messageFor(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
}

export function Pricing() {
  const [plans, setPlans] = useState<AvailablePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPlans(await getActivePlans())
    } catch (err) {
      setError(messageFor(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section
      id="planes"
      className="border-t border-line md:flex md:min-h-[calc(100vh-65px)] md:items-center"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-12">
        <div className="max-w-2xl">
          <p className="font-mono text-sm tracking-[0.3em] text-ember uppercase">
            Membresías
          </p>
          <h2 className="mt-4 font-display text-5xl tracking-wide text-ink">
            PLANES Y PRECIOS
          </h2>
          <p className="mt-4 text-muted">
            Precios mensuales en pesos colombianos (COP). Sin matrícula, sin
            permanencia mínima y sin letra pequeña: cancelas o cambias de
            plan cuando quieras desde la app.
          </p>
        </div>

        <div className="mt-8">
          {loading ? (
            <PricingSkeleton />
          ) : error ? (
            <div className="rounded-2xl border border-danger/40 bg-danger-soft p-6">
              <p className="text-sm text-ink">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-steel"
              >
                Reintentar
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="text-sm text-muted">
                No hay planes disponibles en este momento. Vuelve pronto.
              </p>
            </div>
          ) : (
            <PricingCarousel plans={plans} />
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Vienes en pareja o en grupo?{' '}
          <span className="text-ink">Pregunta por nuestros descuentos por temporada.</span>
        </p>
      </div>
    </section>
  )
}

function PricingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3" aria-hidden>
      <div className="h-80 animate-pulse rounded-2xl border border-line bg-surface" />
      <div className="h-80 animate-pulse rounded-2xl border border-line bg-surface" />
      <div className="hidden h-80 animate-pulse rounded-2xl border border-line bg-surface md:block" />
    </div>
  )
}
