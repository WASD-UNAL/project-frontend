import { useNavigate } from 'react-router-dom'
import type { AvailablePlan } from '../../types/membership'
import { formatCOP } from '../../utils/currency'
import { planPeriodLabel } from '../../utils/planPeriod'
import { useAuth } from '../../hooks/useAuth'
import { useAuthFlow } from '../../hooks/useAuthFlow'
import { RivetPlate } from './RivetPlate'

interface PricingCardProps {
  plan: AvailablePlan
  highlighted: boolean
}

export function PricingCard({ plan, highlighted }: PricingCardProps) {
  const { isAuthenticated } = useAuth()
  const { openAuth } = useAuthFlow()
  const navigate = useNavigate()

  function handleChoose() {
    if (isAuthenticated) {
      navigate(`/dashboard?enroll=${plan.id}`)
    } else {
      openAuth('register', plan.id)
    }
  }

  return (
    <RivetPlate
      className={`flex h-full flex-col p-6 ${
        highlighted
          ? 'border-ember/60 shadow-[0_0_0_1px_var(--color-ember)_inset,0_20px_60px_-20px_var(--color-ember)]'
          : ''
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ember px-4 py-1 text-xs font-bold tracking-wide text-bg">
          MÁS POPULAR
        </span>
      )}

      <h3 className="font-display text-3xl tracking-wide text-ink">
        {plan.name.toUpperCase()}
      </h3>

      {plan.description && (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {plan.description}
        </p>
      )}

      <p className="mt-6">
        <span className="font-mono text-4xl font-semibold text-ink">
          {formatCOP(plan.price)}
        </span>
        <span className="text-muted"> {planPeriodLabel(plan.durationDays)}</span>
      </p>

      <button
        type="button"
        onClick={handleChoose}
        className={`mt-6 rounded-full px-6 py-3 text-center text-sm font-bold tracking-wide transition-transform hover:scale-[1.02] ${
          highlighted
            ? 'bg-ember text-bg'
            : 'border border-line text-ink hover:border-steel'
        }`}
      >
        Elegir {plan.name}
      </button>
    </RivetPlate>
  )
}
