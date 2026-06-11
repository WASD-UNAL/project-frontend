import { useEffect, useState } from 'react'

const stats = [
  { value: '500+', label: 'Personas confían en nosotros' },
  { value: '4.8', label: 'Calificación de nuestros miembros' },
  { value: '12', label: 'Clases grupales cada semana' },
]

const description =
  'Alcanza tus metas con entrenamientos personalizados, acompañamiento ' +
  'experto y una comunidad que te impulsa. Ya sea que busques fuerza, ' +
  'resistencia o equilibrio, en Gymly te apoyamos en cada paso.'

// La segunda línea del título termina ~1.3s después de cargar;
// ahí arranca el typing de la descripción.
const TYPING_START_MS = 1500
const TYPING_SPEED_MS = 14

function useTypewriter(text: string, start: boolean, speed: number) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start || count >= text.length) return
    const id = setTimeout(() => setCount((c) => c + 1), speed)
    return () => clearTimeout(id)
  }, [start, count, text.length, speed])

  return { typed: text.slice(0, count), done: count >= text.length }
}

export function Hero() {
  const [startTyping, setStartTyping] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setStartTyping(true), TYPING_START_MS)
    return () => clearTimeout(id)
  }, [])

  const { typed, done } = useTypewriter(description, startTyping, TYPING_SPEED_MS)

  return (
    <section id="top" className="relative">
      <div className="flex min-h-[calc(100vh-65px)] max-w-3xl flex-col justify-center px-6 py-16 md:px-12 lg:px-16">
        <p className="animate-hero-line font-mono text-sm tracking-[0.3em] text-ember uppercase">
          Strength Club · Bogotá
        </p>

        <h1 className="mt-6 font-display text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.95] tracking-wide">
          <span className="animate-hero-line block text-ember [animation-delay:0.25s] drop-shadow-[0_2px_12px_rgba(10,10,10,0.9)]">
            TRANSFORMA TU CUERPO
          </span>
          <span className="animate-hero-line block text-ink [animation-delay:0.85s] drop-shadow-[0_2px_12px_rgba(10,10,10,0.9)]">
            DOMINA TU MENTE
          </span>
        </h1>

        <p className="mt-6 min-h-32 max-w-lg text-lg text-steel text-pretty drop-shadow-[0_1px_6px_rgba(10,10,10,0.9)] sm:min-h-28">
          {typed}
          {startTyping && !done && (
            <span className="animate-caret ml-0.5 inline-block w-0.5 -translate-y-0.5 self-stretch bg-ember align-middle">
              &nbsp;
            </span>
          )}
        </p>

        <div
          className={`transition-all duration-700 ease-out ${
            done ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#planes"
              className="rounded-full bg-ember px-8 py-4 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.03]"
            >
              Empieza tu prueba gratis
            </a>
            <a
              href="#nosotros"
              className="rounded-full border border-steel/40 bg-bg/50 px-8 py-4 text-sm font-semibold text-ink backdrop-blur-sm transition-colors hover:border-steel"
            >
              Conoce Gymly
            </a>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-12 gap-y-8 sm:gap-x-16">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl tracking-wide text-ink drop-shadow-[0_1px_6px_rgba(10,10,10,0.9)]">
                  {stat.value}
                </p>
                <p className="mt-1.5 max-w-[140px] text-sm leading-snug text-steel/90">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
