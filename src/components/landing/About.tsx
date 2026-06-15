import { Dumbbell, Users, BadgeCheck, CreditCard } from 'lucide-react'

const features = [
  {
    icon: Dumbbell,
    title: 'Equipo de primer nivel',
    description:
      'Pesas libres, máquinas de última generación y zona de cardio renovada cada año.',
  },
  {
    icon: Users,
    title: 'Clases grupales',
    description:
      'Funcional, spinning, yoga y más, incluidas en los planes Plus y Elite.',
  },
  {
    icon: BadgeCheck,
    title: 'Entrenadores certificados',
    description:
      'Acompañamiento real para que tu rutina avance sin lesiones ni estancamientos.',
  },
  {
    icon: CreditCard,
    title: 'Pagos online',
    description:
      'Paga y renueva tu membresía desde la app con tarjeta o PSE, sin filas en recepción ni efectivo.',
  },
]

export function About() {
  return (
    <section
      id="nosotros"
      className="border-t border-line md:flex md:min-h-[calc(100vh-65px)] md:items-center"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-16">
        <div>
          <p className="font-mono text-sm tracking-[0.3em] text-ember uppercase">
            ¿Qué es Gymly?
          </p>
          <h2 className="mt-4 font-display text-5xl tracking-wide text-ink sm:text-6xl">
            UN ESPACIO PARA
            <br />
            FORJARTE, NO SOLO
            <br />
            ENTRENAR
          </h2>
          <p className="mt-6 max-w-md text-muted">
            Llevamos años abriendo las puertas a las 5 a.m. para quienes
            entrenan antes de trabajar, y cerrando a las 10 p.m. para quienes
            llegan después. GYMLY nació en el barrio para el barrio: un gimnasio
            de comunidad, sin filas eternas ni máquinas dañadas, donde cada
            persona tiene un plan claro y un equipo que le hace seguimiento.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <Icon className="size-6 text-ember" strokeWidth={1.75} />
              <h3 className="mt-4 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
