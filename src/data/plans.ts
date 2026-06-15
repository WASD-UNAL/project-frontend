export interface Plan {
  id: string
  name: string
  tagline: string
  priceCOP: number
  features: string[]
  highlighted?: boolean
}

export const plans: Plan[] = [
  {
    id: 'basico',
    name: 'Básico',
    tagline: 'Para empezar a moverte',
    priceCOP: 79000,
    features: [
      'Acceso a sala de musculación y cardio',
      'Horario completo: 5:00 a.m. - 10:00 p.m.',
      'Casillero personal',
      'Control de acceso por documento',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'El más elegido por la comunidad',
    priceCOP: 119000,
    highlighted: true,
    features: [
      'Todo lo del plan Básico',
      'Clases grupales ilimitadas (funcional, spinning, yoga)',
      'Seguimiento de asistencia y rachas en la app',
      'Congela tu membresía cuando lo necesites',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'Acompañamiento personalizado',
    priceCOP: 179000,
    features: [
      'Todo lo del plan Plus',
      '4 sesiones de entrenador personal al mes',
      'Plan nutricional a tu medida',
      'Prioridad de cupo en horarios de alta demanda',
    ],
  },
]
