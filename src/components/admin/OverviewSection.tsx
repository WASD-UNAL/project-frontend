import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  AlertCircle,
  BadgeCheck,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { StatPoint } from '../../types/attendance'
import { computeAdminCounters, getAttendanceWeek } from '../../services/adminService'
import { formatCOP } from '../../utils/currency'
import { useAdminData } from '../../hooks/useAdminData'

interface Kpi {
  label: string
  value: string
  icon: typeof Users
  accent?: boolean
}

interface Attendance {
  points: StatPoint[]
  peak: number
}

export function OverviewSection() {
  const { members, membersError, payments, paymentsError } = useAdminData()
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [attendanceError, setAttendanceError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAttendanceWeek()
      .then((data) => {
        if (!cancelled) setAttendance({ points: data.points, peak: data.peakValue })
      })
      .catch(() => {
        if (!cancelled) setAttendanceError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const error = membersError || paymentsError || attendanceError
  const counters = members && payments ? computeAdminCounters(members, payments) : null

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
      ) : !counters || !attendance ? (
        <OverviewSkeleton />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              index={0}
              kpi={{
                label: 'Socios totales',
                value: String(counters.totalMembers),
                icon: Users,
              }}
            />
            <KpiCard
              index={1}
              kpi={{
                label: 'Socios activos',
                value: String(counters.activeMembers),
                icon: BadgeCheck,
                accent: true,
              }}
            />
            <KpiCard
              index={2}
              kpi={{
                label: 'Ingresos del mes',
                value: formatCOP(counters.monthlyRevenue),
                icon: TrendingUp,
              }}
            />
            <KpiCard
              index={3}
              kpi={{
                label: 'Pagos pendientes',
                value: String(counters.pendingPayments),
                icon: AlertCircle,
              }}
            />
          </div>

          <AttendanceChart points={attendance.points} peak={attendance.peak} />
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

      <div className="mt-8 flex h-56 items-end gap-2 border-b border-line sm:gap-3">
        {points.map(({ label, count }) => {
          const height = peak > 0 ? Math.max((count / peak) * 100, 4) : 0
          return (
            <div
              key={label}
              className="group flex flex-1 flex-col items-center justify-end gap-2"
              title={`${label}: ${count} visitas`}
            >
              <span className="font-mono text-xs text-muted transition-colors group-hover:text-ink">
                {count}
              </span>
              <div
                className="w-full rounded-t bg-ember transition-opacity group-hover:opacity-80"
                style={{ height: `${height}%` }}
              />
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
