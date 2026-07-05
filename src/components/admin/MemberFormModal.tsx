import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Save, UserPlus, X } from 'lucide-react'
import { plans } from '../../data/plans'
import type { AdminMember, Gender } from '../../types/admin'
import type { NewMemberInput } from '../../services/adminService'

type Mode = 'create' | 'edit'

interface MemberFormModalProps {
  open: boolean
  mode: Mode
  initial?: AdminMember | null
  busy?: boolean
  onSubmit: (input: NewMemberInput) => Promise<void>
  onClose: () => void
}

const emptyForm = {
  name: '',
  lastname: '',
  document: '',
  birthDate: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  weight: '',
  height: '',
  planName: plans[0]?.name ?? '',
}

function toForm(initial?: AdminMember | null): typeof emptyForm {
  if (!initial) return emptyForm
  return {
    name: initial.name,
    lastname: initial.lastname,
    document: initial.document,
    birthDate: initial.birthDate ?? '',
    gender: initial.gender ?? '',
    email: initial.email,
    phone: initial.phone,
    address: initial.address ?? '',
    weight: initial.weightKg != null ? String(initial.weightKg) : '',
    height: initial.heightCm != null ? String(initial.heightCm) : '',
    planName: initial.planName ?? plans[0]?.name ?? '',
  }
}

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
  { value: 'OTHER', label: 'Otro' },
]

export function MemberFormModal({
  open,
  mode,
  initial,
  busy = false,
  onSubmit,
  onClose,
}: MemberFormModalProps) {
  const [form, setForm] = useState(() => toForm(initial))
  const [error, setError] = useState<string | null>(null)
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => firstRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  const isEdit = mode === 'edit'

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function parseMetric(raw: string): number | null | 'invalid' {
    const value = raw.trim()
    if (!value) return null
    const n = Number(value.replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0) return 'invalid'
    return n
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    const name = form.name.trim()
    const lastname = form.lastname.trim()
    const email = form.email.trim()
    const document = form.document.trim()
    const phone = form.phone.trim()

    if (!name || !lastname || !document || !email || !phone) {
      setError('Completa los campos obligatorios (marcados con *).')
      return
    }
    if (!email.includes('@')) {
      setError('Ingresa un correo válido.')
      return
    }

    const weightKg = parseMetric(form.weight)
    const heightCm = parseMetric(form.height)
    if (weightKg === 'invalid' || heightCm === 'invalid') {
      setError('El peso y la altura deben ser números mayores que cero.')
      return
    }

    setError(null)
    try {
      await onSubmit({
        name,
        lastname,
        email,
        document,
        phone,
        birthDate: form.birthDate || null,
        gender: form.gender ? (form.gender as Gender) : null,
        address: form.address.trim() || null,
        weightKg,
        heightCm,
        planName: form.planName,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos guardar los datos. Inténtalo de nuevo.',
      )
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ember focus:outline-none'

  return createPortal(
    <div
      className="fixed inset-0 z-[70] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Editar socio' : 'Registrar nuevo cliente'}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !busy && onClose()}
        className="fixed inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div className="relative flex min-h-full items-center justify-center px-4 py-8">
        <div className="animate-card-rise relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="h-1 w-full bg-ember" />

          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="absolute top-5 right-5 text-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            <X className="size-5" />
          </button>

          <div className="p-6 sm:p-8">
            <p className="font-mono text-xs tracking-[0.3em] text-ember uppercase">
              {isEdit ? 'Editar perfil' : 'Nuevo socio'}
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-wide text-ink">
              {isEdit ? 'Editar socio' : 'Registrar cliente'}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {isEdit
                ? 'Actualiza los datos del cliente. Los campos con * son obligatorios.'
                : 'Completa el perfil del cliente. Los campos con * son obligatorios.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-7" noValidate>
              <Section title="Datos personales">
                <Field label="Nombre" required>
                  <input
                    ref={firstRef}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Laura"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Apellido" required>
                  <input
                    value={form.lastname}
                    onChange={(e) => set('lastname', e.target.value)}
                    placeholder="Gómez"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Identificación" required>
                  <input
                    inputMode="numeric"
                    value={form.document}
                    onChange={(e) => set('document', e.target.value)}
                    placeholder="1032456789"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Fecha de nacimiento">
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => set('birthDate', e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Género">
                  <select
                    value={form.gender}
                    onChange={(e) => set('gender', e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Sin especificar</option>
                    {genderOptions.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              <Section title="Contacto">
                <Field label="Correo electrónico" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="laura.gomez@correo.com"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Teléfono" required>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="300 123 4567"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Dirección" full>
                  <input
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Cra 45 #23-10, Medellín"
                    className={fieldClass}
                  />
                </Field>
              </Section>

              <Section title="Métricas físicas">
                <Field label="Peso (kg)">
                  <input
                    inputMode="decimal"
                    value={form.weight}
                    onChange={(e) => set('weight', e.target.value)}
                    placeholder="62"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Altura (cm)">
                  <input
                    inputMode="decimal"
                    value={form.height}
                    onChange={(e) => set('height', e.target.value)}
                    placeholder="168"
                    className={fieldClass}
                  />
                </Field>
              </Section>

              <Section title="Membresía">
                <Field label="Plan" full>
                  <select
                    value={form.planName}
                    onChange={(e) => set('planName', e.target.value)}
                    className={fieldClass}
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-steel disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-2.5 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isEdit ? (
                    <Save className="size-4" strokeWidth={2} />
                  ) : (
                    <UserPlus className="size-4" strokeWidth={2} />
                  )}
                  {busy
                    ? isEdit
                      ? 'Guardando…'
                      : 'Registrando…'
                    : isEdit
                      ? 'Guardar cambios'
                      : 'Registrar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 w-full border-b border-line pb-2 font-mono text-[11px] tracking-[0.25em] text-ember uppercase">
        {title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function Field({
  label,
  required = false,
  full = false,
  children,
}: {
  label: string
  required?: boolean
  full?: boolean
  children: ReactNode
}) {
  return (
    <label className={`space-y-2 ${full ? 'sm:col-span-2' : ''}`}>
      <span className="block font-mono text-xs tracking-[0.25em] text-muted uppercase">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      {children}
    </label>
  )
}
