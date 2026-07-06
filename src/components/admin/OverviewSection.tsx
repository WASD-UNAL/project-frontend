import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  AlertCircle,
  BadgeCheck,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { AdminMetrics } from '../../types/admin'
import { getAdminMetrics } from '../../services/adminService'
import { formatCOP } from '../../utils/currency'

interface Kpi {
  label: string
  value: string
  icon: typeof Users
  accent?: boolean
}

export function OverviewSection() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAdminMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data)
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
          RESUMEN
        </h1>
        <p className="mt-1 text-sm text-muted">
          Vista general del gimnasio: socios, ingresos y afluencia.
        </p>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar las métricas.
        </p>
      ) : !metrics ? (
        <OverviewSkeleton />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              index={0}
              kpi={{
                label: 'Socios totales',
                value: String(metrics.totalMembers),
                icon: Users,
              }}
            />
            <KpiCard
              index={1}
              kpi={{
                label: 'Socios activos',
                value: String(metrics.activeMembers),
                icon: BadgeCheck,
                accent: true,
              }}
            />
            <KpiCard
              index={2}
              kpi={{
                label: 'Ingresos del mes',
                value: formatCOP(metrics.monthlyRevenue),
                icon: TrendingUp,
              }}
            />
            <KpiCard
              index={3}
              kpi={{
                label: 'Pagos pendientes',
                value: String(metrics.pendingPayments),
                icon: AlertCircle,
              }}
            />
          </div>

          <AttendanceChart
            points={metrics.attendance}
            peak={metrics.attendancePeak}
          />
        </>
      )}
    </div>
  )
}

function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const Icon = kpi.icon
  return (
    <div
      className="animate-card-rise rounded-2xl border border-line bg-surface p-5"
      style={{ '--rise-delay': `${index * 60}ms` } as CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
          {kpi.label}
        </p>
        <Icon
          className={kpi.accent ? 'size-4 text-ember' : 'size-4 text-muted'}
          strokeWidth={1.75}
        />
      </div>
      <p
        className={`mt-3 font-display text-4xl tracking-wide ${
          kpi.accent ? 'text-ember' : 'text-ink'
        }`}
      >
        {kpi.value}
      </p>
    </div>
  )
}

function AttendanceChart({
  points,
  peak,
}: {
  points: { label: string; count: number }[]
  peak: number
}) {
  return (
    <section
      aria-label="Afluencia semanal por día"
      className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
      style={{ '--rise-delay': '260ms' } as CSSProperties}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl tracking-wide text-ink">
          Afluencia semanal
        </h2>
        <span className="font-mono text-xs text-muted">visitas por día</span>
      </div>

      <div className="mt-8 flex h-56 gap-2 border-b border-line sm:gap-3">
        {points.map(({ label, count }) => {
          const height = Math.max((count / peak) * 100, 4)
          return (
            <div
              key={label}
              className="group flex h-full flex-1 flex-col justify-end"
              title={`${label}: ${count} visitas`}
            >
              <div
                className="relative w-full rounded-t bg-ember transition-opacity group-hover:opacity-80"
                style={{ height: `${height}%` }}
              >
                <span className="absolute inset-x-0 -top-5 text-center font-mono text-xs text-muted transition-colors group-hover:text-ink">
                  {count}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {points.map(({ label }) => (
          <span
            key={label}
            className="flex-1 text-center font-mono text-xs text-muted"
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  )
}

function OverviewSkeleton() {
  return (
    <div aria-hidden>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-line bg-surface"
          />
        ))}
      </div>
      <div className="mt-6 h-80 animate-pulse rounded-2xl border border-line bg-surface" />
    </div>
  )
}
