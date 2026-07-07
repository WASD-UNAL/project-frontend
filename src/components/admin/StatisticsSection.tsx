import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  CalendarRange,
  Crown,
  TrendingDown,
  TrendingUp,
  UserX,
  Wallet,
} from 'lucide-react'
import type {
  MonthlyRevenue,
  RevenueByPlan,
  RevenueComparison,
} from '../../types/admin'
import type { VisualAlertResponse } from '../../services/accessService'
import {
  getInactiveCustomers,
  getRevenueByPlan,
  getRevenueComparison,
  getYearRevenue,
} from '../../services/adminService'
import { formatCOP } from '../../utils/currency'

const compactCOP = new Intl.NumberFormat('es-CO', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const monthLabels = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

function monthName(month: number): string {
  return monthLabels[month - 1] ?? String(month)
}

function niceMax(peak: number): number {
  if (peak <= 0) return 1_000_000
  const magnitude = 10 ** Math.max(String(Math.round(peak)).length - 2, 4)
  return Math.ceil(peak / magnitude) * magnitude
}

interface ReportData {
  yearly: MonthlyRevenue[]
  byPlan: RevenueByPlan
  comparison: RevenueComparison
  inactive: VisualAlertResponse[]
}

export function StatisticsSection() {
  const [data, setData] = useState<ReportData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const now = new Date()
    Promise.all([
      getYearRevenue(now.getFullYear()),
      getRevenueByPlan(now.getFullYear(), now.getMonth() + 1),
      getRevenueComparison(),
      getInactiveCustomers(),
    ])
      .then(([yearly, byPlan, comparison, inactive]) => {
        if (!cancelled) setData({ yearly, byPlan, comparison, inactive })
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
          Ingresos reales del gimnasio: por mes, por plan y comparados con el
          periodo anterior.
        </p>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar las estadísticas.
        </p>
      ) : !data ? (
        <StatisticsSkeleton />
      ) : (
        <StatisticsContent data={data} />
      )}
    </div>
  )
}

function StatisticsContent({ data }: { data: ReportData }) {
  const { yearly, byPlan, comparison, inactive } = data

  const totalYear = yearly.reduce((sum, m) => sum + m.totalRevenue, 0)
  const monthlyPeak = Math.max(...yearly.map((m) => m.totalRevenue))
  const bestMonth = yearly.reduce((best, m) =>
    m.totalRevenue > best.totalRevenue ? m : best,
  )
  const topPlan =
    byPlan.details.length > 0
      ? byPlan.details.reduce((best, p) => (p.revenue > best.revenue ? p : best))
      : null

  const axisMax = niceMax(monthlyPeak)
  const gridLines = [1, 0.75, 0.5, 0.25].map((f) => Math.round(f * axisMax))
  const avgMonthly = totalYear / yearly.length

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          index={0}
          label="Ingresos del año"
          value={formatCOP(totalYear)}
          icon={Wallet}
          accent
        />
        <KpiCard
          index={1}
          label="Mejor mes"
          value={
            monthlyPeak > 0
              ? `${monthName(bestMonth.month)} · ${compactCOP.format(bestMonth.totalRevenue)}`
              : 'Sin ingresos aún'
          }
          icon={CalendarRange}
        />
        <KpiCard
          index={2}
          label="Plan líder del mes"
          value={topPlan?.planName ?? 'Sin pagos este mes'}
          icon={Crown}
        />
      </div>

      <ComparisonCard comparison={comparison} />

      <section
        aria-label="Ingresos mensuales"
        className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
        style={{ '--rise-delay': '180ms' } as CSSProperties}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Ingresos mensuales · {yearly[0]?.year}
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

              {avgMonthly > 0 && (
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
              )}

              <div className="absolute inset-y-0 right-0 left-[52px] flex items-end gap-2 border-b border-line sm:gap-3">
                {yearly.map((m) => {
                  const height = Math.max((m.totalRevenue / axisMax) * 100, 2)
                  const isPeak = monthlyPeak > 0 && m.totalRevenue === monthlyPeak
                  return (
                    <div
                      key={m.month}
                      className="group flex h-full flex-1 flex-col justify-end"
                      title={`${monthName(m.month)}: ${formatCOP(m.totalRevenue)} (${m.totalPayments} pagos)`}
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
                          {compactCOP.format(m.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-2 flex gap-2 pl-[52px] sm:gap-3">
              {yearly.map((m) => (
                <span
                  key={m.month}
                  className={`flex-1 text-center font-mono text-xs ${
                    monthlyPeak > 0 && m.totalRevenue === monthlyPeak
                      ? 'text-ink'
                      : 'text-muted'
                  }`}
                >
                  {monthName(m.month)}
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
            Ingresos por plan · {monthName(byPlan.month)} {byPlan.year}
          </h2>
          <span className="font-mono text-xs text-muted">
            {formatCOP(byPlan.totalRevenue)} en total
          </span>
        </div>

        {byPlan.details.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            Aún no hay pagos confirmados este mes. Cuando se registren pagos
            exitosos verás aquí el aporte de cada plan.
          </p>
        ) : (
          <ul className="mt-6 space-y-5">
            {byPlan.details.map((plan) => {
              const planPeak = Math.max(...byPlan.details.map((p) => p.revenue))
              const share =
                byPlan.totalRevenue > 0
                  ? Math.round((plan.revenue / byPlan.totalRevenue) * 100)
                  : 0
              const width =
                byPlan.totalRevenue > 0
                  ? Math.max((plan.revenue / byPlan.totalRevenue) * 100, 2)
                  : 2
              const isLeader = plan.revenue === planPeak
              return (
                <li key={plan.planId}>
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
                      {formatCOP(plan.revenue)} · {share}% · {plan.paymentCount}{' '}
                      {plan.paymentCount === 1 ? 'pago' : 'pagos'}
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
        )}
      </section>

      <InactiveCustomersCard customers={inactive} />
    </>
  )
}

function InactiveCustomersCard({
  customers,
}: {
  customers: VisualAlertResponse[]
}) {
  return (
    <section
      aria-label="Clientes inactivos"
      className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
      style={{ '--rise-delay': '320ms' } as CSSProperties}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-ink">
          <UserX className="size-5 text-danger" strokeWidth={1.75} />
          Clientes inactivos
        </h2>
        <span className="font-mono text-xs text-muted">
          {customers.length}{' '}
          {customers.length === 1 ? 'cliente' : 'clientes'} sin membresía
          vigente
        </span>
      </div>

      {customers.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Todos los socios tienen su membresía al día.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {customers.map((c) => (
            <li
              key={c.document}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm text-ink">
                  <span className="size-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
                  {c.userName ?? `Documento ${c.document}`}
                </p>
                <p className="mt-0.5 pl-3.5 font-mono text-xs text-muted">
                  {c.document}
                </p>
              </div>
              <p className="text-xs text-muted">{c.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ComparisonCard({ comparison }: { comparison: RevenueComparison }) {
  const { currentPeriod, previousPeriod, percentageChange } = comparison
  const positive = percentageChange > 0
  const negative = percentageChange < 0
  const TrendIcon = negative ? TrendingDown : TrendingUp
  const trendClass = positive
    ? 'text-ember'
    : negative
      ? 'text-danger'
      : 'text-muted'

  return (
    <section
      aria-label="Comparativo entre periodos"
      className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
      style={{ '--rise-delay': '120ms' } as CSSProperties}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl tracking-wide text-ink">
          Comparativo mensual
        </h2>
        <span className="font-mono text-xs text-muted">
          mes actual vs. anterior
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-soft p-4">
          <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
            Mes anterior
          </p>
          <p className="mt-2 font-mono text-xl text-ink">
            {formatCOP(previousPeriod.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {previousPeriod.totalPayments}{' '}
            {previousPeriod.totalPayments === 1 ? 'pago' : 'pagos'}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface-soft p-4">
          <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
            Mes actual
          </p>
          <p className="mt-2 font-mono text-xl text-ink">
            {formatCOP(currentPeriod.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {currentPeriod.totalPayments}{' '}
            {currentPeriod.totalPayments === 1 ? 'pago' : 'pagos'}
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-line bg-surface-soft p-4">
          <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
            Variación
          </p>
          <p className={`mt-2 flex items-center gap-2 font-display text-3xl tracking-wide ${trendClass}`}>
            <TrendIcon className="size-6" strokeWidth={2} />
            {positive ? '+' : ''}
            {percentageChange}%
          </p>
        </div>
      </div>
    </section>
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
      <div className="mt-6 h-40 animate-pulse rounded-2xl border border-line bg-surface" />
      <div className="mt-6 h-80 animate-pulse rounded-2xl border border-line bg-surface" />
      <div className="mt-6 h-56 animate-pulse rounded-2xl border border-line bg-surface" />
    </div>
  )
}
