import { Clock, MapPin, Phone } from 'lucide-react'

const hours = [
  { day: 'Lunes a viernes', time: '5:00 a.m. – 10:00 p.m.' },
  { day: 'Sábados', time: '6:00 a.m. – 6:00 p.m.' },
  { day: 'Domingos y festivos', time: '8:00 a.m. – 2:00 p.m.' },
]

export function Schedule() {
  return (
    <section
      id="horarios"
      className="border-t border-line md:flex md:min-h-[calc(100vh-65px)] md:items-center"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-16">
        <div>
          <p className="font-mono text-sm tracking-[0.3em] text-ember uppercase">
            Horarios
          </p>
          <h2 className="mt-4 font-display text-5xl tracking-wide text-ink sm:text-6xl">
            ABIERTO CUANDO
            <br />
            TÚ ENTRENAS
          </h2>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            {hours.map(({ day, time }) => (
              <div
                key={day}
                className="flex items-center justify-between py-4"
              >
                <dt className="flex items-center gap-3 text-ink">
                  <Clock className="size-4 text-ember" strokeWidth={2} />
                  {day}
                </dt>
                <dd className="font-mono text-sm text-muted">{time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col justify-center gap-6 rounded-2xl border border-line bg-surface p-8">
          <div className="flex items-start gap-4">
            <MapPin className="mt-1 size-5 shrink-0 text-ember" strokeWidth={1.75} />
            <div>
              <p className="font-semibold text-ink">Encuéntranos</p>
              <p className="mt-1 text-sm text-muted">
                Calle 45 #12-30, Bogotá, Colombia
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="mt-1 size-5 shrink-0 text-ember" strokeWidth={1.75} />
            <div>
              <p className="font-semibold text-ink">Llámanos o escríbenos</p>
              <p className="mt-1 text-sm text-muted">+57 300 123 4567</p>
            </div>
          </div>

          <p className="text-sm text-muted">
            ¿Primera vez en Gymly? Pasa cualquier día y te mostramos las
            instalaciones, sin compromiso.
          </p>
        </div>
      </div>
    </section>
  )
}
