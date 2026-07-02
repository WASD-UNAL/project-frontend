import { useState, useEffect } from 'react'
import type { AttendanceStatsResponse } from '../../types/attendance'

type Period = 'HOURS_DAY' | 'DAYS_WEEK'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

const SKELETON_HEIGHTS = [30, 55, 70, 85, 60, 45, 80, 95, 75, 50, 65, 40, 90, 70, 55, 35, 25, 20]

export function Crowd() {
  const [period, setPeriod] = useState<Period>('HOURS_DAY')
  const [data, setData] = useState<AttendanceStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`${API_BASE}/stats/attendance?period=${period}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [period])

  const isEmpty = data && data.peakValue === 0

  return (
    <section
      id="afluencia"
      className="border-t border-line md:flex md:min-h-[calc(100vh-65px)] md:items-center"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-16">
        <p className="font-mono text-sm tracking-[0.3em] text-ember uppercase">
          Afluencia
        </p>
        <h2 className="mt-4 font-display text-5xl tracking-wide text-ink sm:text-6xl">
          ELIGE TU MEJOR
          <br />
          HORA
        </h2>
        <p className="mt-6 max-w-md text-muted">
          Mira cuándo el gimnasio está más concurrido y planifica tu visita para
          entrenar a tu ritmo.
        </p>

        <div className="mt-10 flex gap-2">
          {(['HOURS_DAY', 'DAYS_WEEK'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-ember text-bg'
                  : 'border border-line text-muted hover:text-ink'
              }`}
            >
              {p === 'HOURS_DAY' ? 'Por horas' : 'Por semana'}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
          {error ? (
            <p className="py-16 text-center text-sm text-muted">
              No pudimos cargar la afluencia en este momento.
            </p>
          ) : loading ? (
            <div className="flex h-40 items-end gap-1 overflow-x-auto">
              {SKELETON_HEIGHTS.map((h, i) => (
                <div key={i} className="flex min-w-[20px] flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full animate-pulse rounded-t-sm bg-line"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <p className="py-16 text-center text-sm text-muted">
              Sin datos para este período.
            </p>
          ) : (
            <div className="flex h-40 items-end gap-1 overflow-x-auto">
              {data!.points.map(point => {
                const heightPct =
                  data!.peakValue > 0
                    ? (point.count / data!.peakValue) * 100
                    : 0
                return (
                  <div
                    key={point.label}
                    className="group flex h-full min-w-[20px] flex-1 flex-col justify-end gap-1"
                    title={`${point.label}: ${point.count} personas`}
                  >
                    <div
                      className="w-full rounded-t-sm bg-ember transition-all duration-300 group-hover:opacity-80"
                      style={{ height: heightPct > 0 ? `${heightPct}%` : '2px' }}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {!error && !loading && !isEmpty && (
            <div className="mt-2 flex gap-1 overflow-x-auto">
              {data!.points.map(point => (
                <div
                  key={point.label}
                  className="flex min-w-[20px] flex-1 justify-center"
                >
                  <span className="font-mono text-[10px] text-muted">
                    {period === 'HOURS_DAY'
                      ? point.label.replace(':00', 'h')
                      : point.label.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!error && !isEmpty && (
            <p className="mt-4 text-right font-mono text-xs text-muted">
              pico: {data?.peakValue ?? '—'} personas
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
