import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { CalendarRange, Crown, Wallet } from 'lucide-react'
import type { IncomeStats } from '../../types/admin'
import { getIncomeStats } from '../../services/adminService'
import { formatCOP } from '../../utils/currency'

const compactCOP = new Intl.NumberFormat('es-CO', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function niceMax(peak: number): number {
  const step = 4_000_000
  return Math.max(Math.ceil(peak / step) * step, step)
}

export function StatisticsSection() {
  const [stats, setStats] = useState<IncomeStats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getIncomeStats()
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
          ESTADÍSTICA
        </h1>
        <p className="mt-1 text-sm text-muted">
          Analiza el rendimiento del gimnasio: ingresos mensuales y aporte de
          cada plan.
        </p>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar las estadísticas.
        </p>
      ) : !stats ? (
        <StatisticsSkeleton />
      ) : (
        <StatisticsContent stats={stats} />
      )}
    </div>
  )
}

function StatisticsContent({ stats }: { stats: IncomeStats }) {
  const bestMonth = stats.monthly.reduce((best, m) =>
    m.amount > best.amount ? m : best,
  )
  const topPlan = stats.byPlan.reduce((best, p) =>
    p.amount > best.amount ? p : best,
  )
  const planTotal = stats.byPlan.reduce((sum, p) => sum + p.amount, 0)
  const planPeak = Math.max(...stats.byPlan.map((p) => p.amount))

  const axisMax = niceMax(stats.monthlyPeak)
  const gridLines = [1, 0.75, 0.5, 0.25].map((f) => Math.round(f * axisMax))
  const avgMonthly = stats.totalYear / stats.monthly.length

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          index={0}
          label="Ingresos del año"
          value={formatCOP(stats.totalYear)}
          icon={Wallet}
          accent
        />
        <KpiCard
          index={1}
          label="Mejor mes"
          value={`${bestMonth.label} · ${compactCOP.format(bestMonth.amount)}`}
          icon={CalendarRange}
        />
        <KpiCard
          index={2}
          label="Plan líder"
          value={topPlan.planName}
          icon={Crown}
        />
      </div>

      <section
        aria-label="Ingresos mensuales"
        className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
        style={{ '--rise-delay': '180ms' } as CSSProperties}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Ingresos mensuales
          </h2>
          <span className="font-mono text-xs text-muted">COP por mes</span>
        </div>

        <div className="mt-10 overflow-x-auto">
          <div className="min-w-[560px] pt-6">
            <div className="relative h-56">
              {gridLines.map((v) => (
                <div
                  key={v}
                  className="absolute inset-x-0 flex items-center gap-2"
                  style={{ bottom: `${(v / axisMax) * 100}%` }}
                >
                  <span className="w-11 shrink-0 text-right font-mono text-[10px] text-muted/70">
                    {compactCOP.format(v)}
                  </span>
                  <div className="h-px flex-1 bg-line" />
                </div>
              ))}

              <div
                className="absolute inset-x-0 flex items-center gap-2"
                style={{ bottom: `${(avgMonthly / axisMax) * 100}%` }}
              >
                <span className="w-11 shrink-0" />
                <div className="relative flex-1 border-t border-dashed border-ember/50">
                  <span className="absolute -top-4 right-0 font-mono text-[10px] text-ember/80">
                    Prom. {compactCOP.format(avgMonthly)}
                  </span>
                </div>
              </div>

              <div className="absolute inset-y-0 right-0 left-[52px] flex items-end gap-2 border-b border-line sm:gap-3">
                {stats.monthly.map((m) => {
                  const height = Math.max((m.amount / axisMax) * 100, 2)
                  const isPeak = m.amount === stats.monthlyPeak
                  return (
                    <div
                      key={m.label}
                      className="group flex h-full flex-1 flex-col justify-end"
                      title={`${m.label}: ${formatCOP(m.amount)}`}
                    >
                      <div
                        className={`relative w-full rounded-t transition-opacity group-hover:opacity-80 ${
                          isPeak ? 'bg-ember' : 'bg-ember/70'
                        }`}
                        style={{ height: `${height}%` }}
                      >
                        <span
                          className={`absolute inset-x-0 -top-5 text-center font-mono text-[11px] transition-colors group-hover:text-ink ${
                            isPeak ? 'font-semibold text-ember' : 'text-muted'
                          }`}
                        >
                          {compactCOP.format(m.amount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-2 flex gap-2 pl-[52px] sm:gap-3">
              {stats.monthly.map((m) => (
                <span
                  key={m.label}
                  className={`flex-1 text-center font-mono text-xs ${
                    m.amount === stats.monthlyPeak ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Ingresos por tipo de plan"
        className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
        style={{ '--rise-delay': '260ms' } as CSSProperties}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Ingresos por plan
          </h2>
          <span className="font-mono text-xs text-muted">
            {formatCOP(planTotal)} en total
          </span>
        </div>

        <ul className="mt-6 space-y-5">
          {stats.byPlan.map((plan) => {
            const share = Math.round((plan.amount / planTotal) * 100)
            const width = Math.max((plan.amount / planTotal) * 100, 2)
            const isLeader = plan.amount === planPeak
            return (
              <li key={plan.planName}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {plan.planName}
                    {isLeader && (
                      <span className="rounded-full border border-ember/40 bg-ember-soft px-2 py-0.5 font-mono text-[10px] tracking-wide text-ember uppercase">
                        Líder
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {formatCOP(plan.amount)} · {share}%
                  </span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full ${isLeader ? 'bg-ember' : 'bg-ember/70'}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent = false,
  index,
}: {
  label: string
  value: string
  icon: typeof Wallet
  accent?: boolean
  index: number
}) {
  return (
    <div
      className="animate-card-rise rounded-2xl border border-line bg-surface p-5"
      style={{ '--rise-delay': `${index * 60}ms` } as CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
          {label}
        </p>
        <Icon
          className={accent ? 'size-4 text-ember' : 'size-4 text-muted'}
          strokeWidth={1.75}
        />
      </div>
      <p
        className={`mt-3 font-display text-3xl tracking-wide ${
          accent ? 'text-ember' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function StatisticsSkeleton() {
  return (
    <div aria-hidden>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-line bg-surface"
          />
        ))}
      </div>
      <div className="mt-6 h-80 animate-pulse rounded-2xl border border-line bg-surface" />
      <div className="mt-6 h-56 animate-pulse rounded-2xl border border-line bg-surface" />
    </div>
  )
}
