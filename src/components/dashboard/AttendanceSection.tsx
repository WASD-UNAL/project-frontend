import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  LogIn,
} from 'lucide-react'
import type { AttendanceEntry, MyAttendance } from '../../types/attendance'
import { getMyAttendance } from '../../services/attendanceService'

const weekdayFmt = new Intl.DateTimeFormat('es-CO', { weekday: 'long' })
const monthFmt = new Intl.DateTimeFormat('es-CO', { month: 'short' })
const monthLongFmt = new Intl.DateTimeFormat('es-CO', { month: 'long' })

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  monthFmt.format(new Date(2000, i, 1)).replace('.', ''),
)

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const month = monthFmt.format(date).replace('.', '')
  return `${capitalize(weekdayFmt.format(date))} · ${d} de ${month} de ${y}`
}

export function AttendanceSection() {
  const [data, setData] = useState<MyAttendance | null>(null)
  const [error, setError] = useState(false)
  const now = new Date()
  const [selected, setSelected] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  })

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

  const monthEntries = (data?.entries ?? []).filter((e) => {
    const [y, m] = e.date.split('-').map(Number)
    return y === selected.year && m - 1 === selected.month
  })
  const isCurrentMonth =
    selected.year === now.getFullYear() && selected.month === now.getMonth()
  const monthLabel = isCurrentMonth
    ? 'este mes'
    : `${capitalize(monthLongFmt.format(new Date(selected.year, selected.month, 1)))} ${selected.year}`

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
          ASISTENCIA
        </h1>
        <p className="mt-1 text-sm text-muted">
          Revisa tu registro de visitas al gimnasio y tu racha actual.
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
            <MonthStatTile
              count={monthEntries.length}
              selected={selected}
              onSelect={setSelected}
              index={0}
            />
            <StatTile
              index={1}
              label="Racha actual"
              value={String(data.currentStreak)}
              unit="días seguidos"
              icon={Flame}
            />
            <StatTile
              index={2}
              label="Total registradas"
              value={String(data.totalCount)}
              unit="visitas"
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
              <span className="font-mono text-xs text-muted">
                {monthEntries.length} en {monthLabel}
              </span>
            </div>

            {monthEntries.length === 0 ? (
              <p className="mt-6 text-sm text-muted">
                No registraste visitas en {monthLabel}.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {monthEntries.map((entry) => (
                  <AttendanceRow key={entry.id} entry={entry} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function AttendanceRow({ entry }: { entry: AttendanceEntry }) {
  return (
    <li className="flex items-center gap-4 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ember-soft">
        <CalendarCheck className="size-4 text-ember" strokeWidth={2} />
      </span>
      <p className="text-sm text-ink">{dayLabel(entry.date)}</p>
    </li>
  )
}

function MonthStatTile({
  count,
  selected,
  onSelect,
  index,
}: {
  count: number
  selected: { year: number; month: number }
  onSelect: (value: { year: number; month: number }) => void
  index: number
}) {
  const now = new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(selected.year)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isCurrent =
    selected.year === now.getFullYear() && selected.month === now.getMonth()
  const label = isCurrent
    ? 'Este mes'
    : `${capitalize(monthLongFmt.format(new Date(selected.year, selected.month, 1)))} ${selected.year}`

  return (
    <div
      ref={ref}
      className={`animate-card-rise relative rounded-2xl border border-line bg-surface p-5 ${
        open ? 'z-30' : ''
      }`}
      style={{ '--rise-delay': `${index * 60}ms` } as CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
          {label}
        </p>
        <button
          type="button"
          onClick={() => {
            setViewYear(selected.year)
            setOpen((o) => !o)
          }}
          aria-label="Cambiar de mes"
          aria-expanded={open}
          className={`rounded-md p-1 transition-colors hover:text-ink ${
            open ? 'text-ink' : 'text-ember'
          }`}
        >
          <CalendarDays className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-4xl tracking-wide text-ember">
          {count}
        </span>
        <span className="text-xs text-muted">visitas</span>
      </p>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 w-64 rounded-xl border border-line bg-surface p-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              aria-label="Año anterior"
              className="rounded-md p-1 text-muted transition-colors hover:text-ink"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-mono text-sm text-ink">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              aria-label="Año siguiente"
              className="rounded-md p-1 text-muted transition-colors hover:text-ink"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1">
            {MONTHS.map((name, i) => {
              const active = viewYear === selected.year && i === selected.month
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onSelect({ year: viewYear, month: i })
                    setOpen(false)
                  }}
                  className={`rounded-md py-1.5 text-xs font-medium capitalize transition-colors ${
                    active
                      ? 'bg-ember text-bg'
                      : 'text-muted hover:bg-surface-soft hover:text-ink'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
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
