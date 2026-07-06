import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import type { AdminClient } from '../../types/admin'
import { formatDate, memberStatusTheme } from '../../utils/membership'
import { Modal } from '../common/Modal'

interface MemberProfileModalProps {
  member: AdminClient | null
  onEdit: (member: AdminClient) => void
  onClose: () => void
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

function toDateOnly(iso: string): string {
  return formatDate(iso.slice(0, 10))
}

export function MemberProfileModal({
  member,
  onEdit,
  onClose,
}: MemberProfileModalProps) {
  const bmi =
    member && member.weight && member.height
      ? bmiFrom(member.weight, member.height)
      : null

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      label={member ? `Perfil de ${member.name} ${member.lastname}` : 'Perfil'}
    >
      {member && (
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
                <span
                  className={`size-1.5 rounded-full ${memberStatusTheme(member.active).dot}`}
                  aria-hidden
                />
                <span className={memberStatusTheme(member.active).text}>
                  {memberStatusTheme(member.active).label}
                </span>
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
                label="Fecha de alta"
                value={member.createdAt ? toDateOnly(member.createdAt) : null}
              />
            </ProfileSection>

            <ProfileSection title="Contacto">
              <Row label="Correo" value={member.email} />
              <Row label="Teléfono" value={member.phone} />
            </ProfileSection>

            <ProfileSection title="Métricas físicas">
              <Row
                label="Peso"
                value={member.weight != null ? `${member.weight} kg` : null}
              />
              <Row
                label="Altura"
                value={member.height != null ? `${member.height} cm` : null}
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
      )}
    </Modal>
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
