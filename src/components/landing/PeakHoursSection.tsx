import { useEffect, useState } from 'react'
import type { PeakHoursResponse } from '../../types/api'

type WeekId = 'week-1' | 'week-2' | 'week-3'
type DayId = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const weekOptions: Array<{ id: WeekId; label: string }> = [
  { id: 'week-1', label: 'WEEK 1' },
  { id: 'week-2', label: 'WEEK 2' },
  { id: 'week-3', label: 'WEEK 3' },
]

const dayOptions: Array<{ id: DayId; label: string }> = [
  { id: 'monday', label: 'MON' },
  { id: 'tuesday', label: 'TUE' },
  { id: 'wednesday', label: 'WED' },
  { id: 'thursday', label: 'THU' },
  { id: 'friday', label: 'FRI' },
  { id: 'saturday', label: 'SAT' },
  { id: 'sunday', label: 'SUN' },
]

function PeakHoursSection() {
  const [selectedWeek, setSelectedWeek] = useState<WeekId>('week-1')
  const [selectedDay, setSelectedDay] = useState<DayId>('wednesday')
  const [data, setData] = useState<PeakHoursResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPeakHours() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/stats/peak-hours?week=${selectedWeek}&day=${selectedDay}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`Failed to load peak hours: ${response.status}`)
        }

        const payload: PeakHoursResponse = await response.json()
        setData(payload)
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setData(null)
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load peak hours')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadPeakHours()

    return () => controller.abort()
  }, [selectedWeek, selectedDay])

  const points = data?.points ?? []
  const visiblePoints = points.filter((point) => point.value > 0)
  const chartPoints = visiblePoints.length > 0 ? visiblePoints : points
  const peakValue = Math.max(data?.peakValue ?? 0, 1)
  const topHours = data?.topHours ?? []

  return (
    <section id="peak-hours" className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.34em] text-lime-300">PEAK HOURS</p>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.05em] text-white sm:text-4xl">
              Horas de mayor flujo por semana y día.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
              Vista temporal para analizar las franjas con más gente en el gimnasio. La data se
              carga desde el backend usando la asistencia registrada por semana y día.
            </p>

            <div className="mt-8 rounded-[28px] border border-lime-300/15 bg-lime-300/5 p-6">
              <p className="text-xs font-semibold tracking-[0.28em] text-lime-300">TOP HOURS</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {topHours.map((point, index) => (
                  <div key={`${point.hour}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-zinc-400">
                      HOUR
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">{String(point.hour).padStart(2, '0')}:00</p>
                    <p className="mt-2 text-sm text-lime-300">{point.value} PEOPLE</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-6 lg:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.28em] text-lime-300">{data?.weekLabel ?? 'Semana actual'}</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{data?.dayLabel ?? 'Miércoles'}</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {isLoading ? 'Cargando estadísticas...' : error ? 'No fue posible cargar los datos.' : 'Horarios con mayor flujo de personas.'}
                </p>
              </div>
              <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-lime-300">
                {(data?.activeSlots ?? 0)} ACTIVE SLOTS
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {weekOptions.map((option) => {
                const active = option.id === selectedWeek
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedWeek(option.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold tracking-[0.24em] transition ${
                      active
                        ? 'bg-lime-300 text-zinc-950'
                        : 'border border-white/10 bg-white/5 text-zinc-300 hover:border-lime-300/50 hover:text-lime-300'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {dayOptions.map((option) => {
                const active = option.id === selectedDay
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedDay(option.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.22em] transition ${
                      active
                        ? 'bg-white text-zinc-950'
                        : 'border border-white/10 bg-transparent text-zinc-300 hover:border-lime-300/50 hover:text-lime-300'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-8 grid min-h-[320px] grid-cols-[repeat(6,minmax(0,1fr))] items-end gap-3 sm:min-h-[360px]">
              {chartPoints.map((point) => {
                const height = Math.max((point.value / peakValue) * 100, 10)
                return (
                  <div key={point.hour} className="flex h-full flex-col justify-end gap-3">
                    <div className="flex items-end justify-center rounded-t-[20px] border border-lime-300/25 bg-gradient-to-t from-lime-300/30 to-lime-300/80 px-2 transition hover:from-lime-300/50 hover:to-lime-300" style={{ height: `${height}%` }}>
                      <span className="mb-2 text-[0.65rem] font-black tracking-[0.18em] text-zinc-950">
                        {point.value}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-300">
                        {String(point.hour).padStart(2, '0')}:00
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-sm text-zinc-400">
              <span>{error ? error : 'Intensity based on attendance records from backend'}</span>
              <span className="text-lime-300">Peak: {data?.peakValue ?? 0} people</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PeakHoursSection