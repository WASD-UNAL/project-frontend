import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X } from 'lucide-react'
import type { AdminMember, Gender, MemberStatus } from '../../types/admin'
import { formatDate } from '../../utils/membership'

interface MemberProfileModalProps {
  member: AdminMember | null
  onEdit: (member: AdminMember) => void
  onClose: () => void
}

const genderLabels: Record<Gender, string> = {
  F: 'Femenino',
  M: 'Masculino',
  OTHER: 'Otro',
}

const statusLabels: Record<MemberStatus, { label: string; text: string; dot: string }> = {
  ACTIVE: { label: 'Activo', text: 'text-ember', dot: 'bg-ember' },
  EXPIRING: { label: 'Por vencer', text: 'text-warn', dot: 'bg-warn' },
  EXPIRED: { label: 'Vencida', text: 'text-danger', dot: 'bg-danger' },
  INACTIVE: { label: 'Inactivo', text: 'text-muted', dot: 'bg-muted' },
}

function ageFrom(iso: string): number {
  const birth = new Date(iso)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1
  return age
}

function bmiFrom(weightKg: number, heightCm: number) {
  const h = heightCm / 100
  const value = weightKg / (h * h)
  const rounded = Math.round(value * 10) / 10
  const category =
    value < 18.5
      ? { label: 'Bajo peso', text: 'text-warn' }
      : value < 25
        ? { label: 'Normal', text: 'text-ember' }
        : value < 30
          ? { label: 'Sobrepeso', text: 'text-warn' }
          : { label: 'Obesidad', text: 'text-danger' }
  return { value: rounded, ...category }
}

export function MemberProfileModal({
  member,
  onEdit,
  onClose,
}: MemberProfileModalProps) {
  useEffect(() => {
    if (!member) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [member, onClose])

  if (!member) return null

  const status = statusLabels[member.status]
  const age = member.birthDate ? ageFrom(member.birthDate) : null
  const bmi =
    member.weightKg && member.heightCm
      ? bmiFrom(member.weightKg, member.heightCm)
      : null

  return createPortal(
    <div
      className="fixed inset-0 z-[70] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${member.name} ${member.lastname}`}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="fixed inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div className="relative flex min-h-full items-center justify-center px-4 py-8">
        <div className="animate-card-rise relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="h-1 w-full bg-ember" />

          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute top-5 right-5 text-muted transition-colors hover:text-ink"
          >
            <X className="size-5" />
          </button>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ember-soft font-display text-2xl text-ember">
                {member.name.charAt(0)}
                {member.lastname.charAt(0)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-3xl tracking-wide text-ink">
                  {member.name} {member.lastname}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium">
                  <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden />
                  <span className={status.text}>{status.label}</span>
                  {!member.active && (
                    <span className="text-muted"> · acceso suspendido</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-6">
              <ProfileSection title="Datos personales">
                <Row label="Identificación" value={member.document} />
                <Row
                  label="Fecha de nacimiento"
                  value={
                    member.birthDate
                      ? `${formatDate(member.birthDate)}${age !== null ? ` · ${age} años` : ''}`
                      : null
                  }
                />
                <Row
                  label="Género"
                  value={member.gender ? genderLabels[member.gender] : null}
                />
                <Row label="Fecha de alta" value={formatDate(member.joinedAt)} />
              </ProfileSection>

              <ProfileSection title="Contacto">
                <Row label="Correo" value={member.email} />
                <Row label="Teléfono" value={member.phone} />
                <Row label="Dirección" value={member.address} full />
              </ProfileSection>

              <ProfileSection title="Métricas físicas">
                <Row
                  label="Peso"
                  value={member.weightKg ? `${member.weightKg} kg` : null}
                />
                <Row
                  label="Altura"
                  value={member.heightCm ? `${member.heightCm} cm` : null}
                />
                <div className="sm:col-span-2">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                    IMC
                  </p>
                  {bmi ? (
                    <p className="mt-1 text-sm text-ink">
                      {bmi.value}{' '}
                      <span className={`font-medium ${bmi.text}`}>
                        · {bmi.label}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted">
                      Sin datos suficientes
                    </p>
                  )}
                </div>
              </ProfileSection>

              <ProfileSection title="Membresía">
                <Row label="Plan" value={member.planName} />
                <Row
                  label="Vence"
                  value={member.endDate ? formatDate(member.endDate) : null}
                />
              </ProfileSection>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-line pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-steel"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => onEdit(member)}
                className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-2.5 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Pencil className="size-4" strokeWidth={2} />
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function ProfileSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 w-full border-b border-line pb-2 font-mono text-[11px] tracking-[0.25em] text-ember uppercase">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Row({
  label,
  value,
  full = false,
}: {
  label: string
  value: string | null
  full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
        {label}
      </p>
      <p className={`mt-1 text-sm ${value ? 'text-ink' : 'text-muted'}`}>
        {value ?? '—'}
      </p>
    </div>
  )
}
