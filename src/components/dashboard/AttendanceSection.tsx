import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { CalendarCheck, Flame, LogIn, Trophy } from 'lucide-react'
import type { AttendanceVisit, MyAttendance } from '../../types/attendance'
import { getMyAttendance } from '../../services/attendanceService'

const weekdayFmt = new Intl.DateTimeFormat('es-CO', { weekday: 'long' })
const monthFmt = new Intl.DateTimeFormat('es-CO', { month: 'short' })

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const month = monthFmt.format(date).replace('.', '')
  return `${capitalize(weekdayFmt.format(date))} · ${d} de ${month} de ${y}`
}

function streakUnit(value: number): string {
  return value === 1 ? 'día seguido' : 'días seguidos'
}

export function AttendanceSection() {
  const [data, setData] = useState<MyAttendance | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMyAttendance()
      .then((res) => {
        if (!cancelled) setData(res)
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
          ASISTENCIA
        </h1>
        <p className="mt-1 text-sm text-muted">
          Cada ingreso al gimnasio queda registrado cuando presentas tu
          documento en recepción. Aquí ves tus visitas y tu racha.
        </p>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar tu asistencia. Inténtalo de nuevo más tarde.
        </p>
      ) : !data ? (
        <AttendanceSkeleton />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile
              index={0}
              label="Racha actual"
              value={String(data.currentStreak)}
              unit={streakUnit(data.currentStreak)}
              icon={Flame}
              accent
            />
            <StatTile
              index={1}
              label="Mejor racha"
              value={String(data.longestStreak)}
              unit={streakUnit(data.longestStreak)}
              icon={Trophy}
            />
            <StatTile
              index={2}
              label="Total de visitas"
              value={String(data.totalDays)}
              unit={data.totalDays === 1 ? 'visita' : 'visitas'}
              icon={LogIn}
            />
          </div>

          <section
            aria-label="Historial de visitas"
            className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
            style={{ '--rise-delay': '180ms' } as CSSProperties}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl tracking-wide text-ink">
                Últimas visitas
              </h2>
              {data.visits.length > 0 && (
                <span className="font-mono text-xs text-muted">
                  {data.visits.length}{' '}
                  {data.visits.length === 1 ? 'registro' : 'registros'}
                </span>
              )}
            </div>

            {data.visits.length === 0 ? (
              <p className="mt-6 text-sm text-muted">
                Aún no tienes visitas registradas. Tu primera asistencia
                aparecerá aquí en cuanto ingreses al gimnasio con tu documento.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {data.visits.map((visit, index) => (
                  <AttendanceRow
                    key={`${visit.date}-${visit.time ?? index}`}
                    visit={visit}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function AttendanceRow({ visit }: { visit: AttendanceVisit }) {
  return (
    <li className="flex items-center gap-4 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ember-soft">
        <CalendarCheck className="size-4 text-ember" strokeWidth={2} />
      </span>
      <p className="flex-1 text-sm text-ink">{dayLabel(visit.date)}</p>
      {visit.time && (
        <span className="font-mono text-xs text-muted">
          Ingreso {visit.time}
        </span>
      )}
    </li>
  )
}

function StatTile({
  label,
  value,
  unit,
  icon: Icon,
  accent = false,
  index,
}: {
  label: string
  value: string
  unit: string
  icon: typeof CalendarCheck
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
      <p className="mt-3 flex items-baseline gap-2">
        <span
          className={`font-display text-4xl tracking-wide ${
            accent ? 'text-ember' : 'text-ink'
          }`}
        >
          {value}
        </span>
        <span className="text-xs text-muted">{unit}</span>
      </p>
    </div>
  )
}

function AttendanceSkeleton() {
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
    </div>
  )
}
