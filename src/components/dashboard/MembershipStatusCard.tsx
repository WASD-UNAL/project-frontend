import { CalendarClock, Clock, CreditCard } from 'lucide-react'
import type { MyMembership } from '../../types/membership'
import { formatCOP } from '../../utils/currency'
import { formatDate, statusThemes, totalDaysBetween } from '../../utils/membership'

interface MembershipStatusCardProps {
  membership: MyMembership
  onEnroll: () => void
  onCancel: () => void
}

const pendingTheme = {
  border: 'border-warn',
  bgSoft: 'bg-warn-soft',
  text: 'text-warn',
  fill: 'bg-warn',
  label: 'Pendiente',
}

export function MembershipStatusCard({
  membership,
  onEnroll,
  onCancel,
}: MembershipStatusCardProps) {
  const active = membership.hasActiveMembership
  const pending = membership.pendingApproval
  const theme = pending ? pendingTheme : statusThemes[membership.statusColor]

  let remainingPct = 0
  if (active && membership.initDate && membership.endDate) {
    const total = totalDaysBetween(membership.initDate, membership.endDate)
    remainingPct = Math.min(100, Math.max(0, (membership.daysRemaining / total) * 100))
  }

  return (
    <section
      aria-label="Estado de tu membresía"
      className={`animate-card-rise relative overflow-hidden rounded-2xl border-2 ${theme.border} ${theme.bgSoft} p-6 md:p-8`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
            Tu membresía
          </p>
          <h2 className="mt-1 font-display text-4xl tracking-wide text-ink md:text-5xl">
            {(active || pending) && membership.planName
              ? `PLAN ${membership.planName.toUpperCase()}`
              : 'SIN PLAN ACTIVO'}
          </h2>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full border ${theme.border} px-3 py-1 text-xs font-bold tracking-wide ${theme.text}`}
        >
          <span className={`size-2 rounded-full ${theme.fill}`} aria-hidden />
          {theme.label}
        </span>
      </div>

      {active ? (
        <>
          <div className="mt-8 flex items-end gap-4">
            <span
              className={`font-mono text-7xl leading-none font-semibold md:text-8xl ${theme.text}`}
            >
              {membership.daysRemaining}
            </span>
            <span className="mb-2 text-lg text-muted">
              {membership.daysRemaining === 1 ? 'día restante' : 'días restantes'}
            </span>
          </div>

          <div
            className="mt-5 h-2 w-full overflow-hidden rounded-full bg-bg/60"
            role="progressbar"
            aria-valuenow={Math.round(remainingPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Vigencia restante"
          >
            <div
              className={`h-full rounded-full ${theme.fill} transition-[width] duration-700`}
              style={{ width: `${remainingPct}%` }}
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-steel">
            {membership.message}
          </p>

          <div className="mt-6 grid gap-3 border-t border-line/70 pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarClock className="size-5 shrink-0 text-muted" strokeWidth={1.75} />
              <div>
                <p className="text-xs text-muted">Vence el</p>
                <p className="font-mono text-sm text-ink">
                  {membership.endDate ? formatDate(membership.endDate) : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="size-5 shrink-0 text-muted" strokeWidth={1.75} />
              <div>
                <p className="text-xs text-muted">Próximo cobro</p>
                <p className="font-mono text-sm text-ink">
                  {membership.price !== null ? formatCOP(membership.price) : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-danger hover:text-danger"
            >
              Cancelar plan
            </button>
          </div>
        </>
      ) : pending ? (
        <>
          <div className="mt-8 flex items-center gap-3">
            <Clock className="size-6 shrink-0 text-warn" strokeWidth={1.75} />
            <p className="font-display text-2xl tracking-wide text-ink">
              Pago pendiente de aprobación
            </p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-steel">
            Registramos tu inscripción. Tu membresía se activará y verás los días
            restantes en cuanto un administrador confirme el pago
            {membership.price !== null ? ` de ${formatCOP(membership.price)}` : ''}
            . Si pagas en efectivo o por transferencia, confirma el pago en
            recepción.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-danger hover:text-danger"
            >
              Cancelar inscripción
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-steel">
            {membership.message} Inscríbete a un plan para activar tu acceso al
            gimnasio y llevar el control de tus pagos desde aquí.
          </p>
          <button
            type="button"
            onClick={onEnroll}
            className="mt-6 rounded-full bg-ember px-6 py-3 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Inscribirme a un plan
          </button>
        </>
      )}
    </section>
  )
}
