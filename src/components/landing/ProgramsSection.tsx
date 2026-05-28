import { useEffect, useState } from 'react'
import type { Plan } from '../../types/api'

const fallbackPrograms: Plan[] = [
  {
    id: 1,
    name: 'Strength Lab',
    description: 'Programas de fuerza con progresión semanal y foco en técnica.',
    durationDays: 30,
    price: 35,
    active: true,
  },
  {
    id: 2,
    name: 'Cardio Burn',
    description: 'Sesiones de alta energía para mejorar resistencia y rendimiento.',
    durationDays: 30,
    price: 28,
    active: true,
  },
  {
    id: 3,
    name: 'Body Shape',
    description: 'Entrenamiento funcional orientado a composición corporal y control.',
    durationDays: 45,
    price: 32,
    active: true,
  },
  {
    id: 4,
    name: 'Fight Mode',
    description: 'Trabajo explosivo con un enfoque atlético y competitivo.',
    durationDays: 60,
    price: 40,
    active: true,
  },
]

function ProgramsSection() {
  const [programs, setPrograms] = useState<Plan[]>([])

  useEffect(() => {
    const controller = new AbortController()

    async function loadPrograms() {
      try {
        const response = await fetch('/api/plans', { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Failed to load plans: ${response.status}`)
        }

        const plans: Plan[] = await response.json()
        setPrograms(plans)
      } catch {
        if (!controller.signal.aborted) {
          setPrograms([])
        }
      }
    }

    loadPrograms()

    return () => controller.abort()
  }, [])

  const items = programs.length > 0 ? programs : fallbackPrograms

  return (
    <section id="programs" className="border-t border-white/10 bg-zinc-950/95">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.34em] text-lime-300">OUR PROGRAMS</p>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.05em] text-white sm:text-4xl">
            Formatos pensados para cada nivel de intensidad.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((program) => (
            <article
              key={program.id ?? program.name}
              className="group rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-lime-300/50 hover:bg-white/[0.07]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300/10 text-lime-300 transition group-hover:bg-lime-300 group-hover:text-zinc-950">
                <span className="text-lg font-black">{program.name.charAt(0)}</span>
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">{program.name}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{program.description ?? 'Programa de entrenamiento disponible en Gymly.'}</p>

              <div className="mt-6 border-t border-white/10 pt-5 text-xs font-semibold tracking-[0.24em] text-lime-300">
                {program.durationDays} DAYS / ${program.price} / {program.active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProgramsSection
