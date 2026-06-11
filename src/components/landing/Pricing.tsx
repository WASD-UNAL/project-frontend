import { Check } from 'lucide-react'
import { plans } from '../../data/plans'
import { formatCOP } from '../../utils/currency'
import { RivetPlate } from './RivetPlate'

export function Pricing() {
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

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <RivetPlate
              key={plan.id}
              className={`flex flex-col p-6 ${
                plan.highlighted
                  ? 'border-ember/60 shadow-[0_0_0_1px_var(--color-ember)_inset,0_20px_60px_-20px_var(--color-ember)]'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ember px-4 py-1 text-xs font-bold tracking-wide text-bg">
                  MÁS POPULAR
                </span>
              )}

              <h3 className="font-display text-3xl tracking-wide text-ink">
                {plan.name.toUpperCase()}
              </h3>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

              <p className="mt-5">
                <span className="font-mono text-4xl font-semibold text-ink">
                  {formatCOP(plan.priceCOP)}
                </span>
                <span className="text-muted"> / mes</span>
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-ember" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`mt-6 rounded-full px-6 py-3 text-center text-sm font-bold tracking-wide transition-transform hover:scale-[1.02] ${
                  plan.highlighted
                    ? 'bg-ember text-bg'
                    : 'border border-line text-ink hover:border-steel'
                }`}
              >
                Elegir {plan.name}
              </a>
            </RivetPlate>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Vienes en pareja o en grupo?{' '}
          <span className="text-ink">Pregunta por nuestros descuentos por temporada.</span>
        </p>
      </div>
    </section>
  )
}
