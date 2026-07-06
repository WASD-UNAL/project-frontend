import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Save, UserPlus } from 'lucide-react'
import type { AdminClient } from '../../types/admin'
import { Modal } from '../common/Modal'

type Mode = 'create' | 'edit'

// Superset de valores del formulario. En "create" solo importan los campos de
// registro (+ password); en "edit" los datos editables del cliente (+ métricas).
export interface MemberFormValues {
  name: string
  lastname: string
  email: string
  document: string
  password: string
  phone: string
  weight: number | null
  height: number | null
}

interface MemberFormModalProps {
  open: boolean
  mode: Mode
  initial?: AdminClient | null
  busy?: boolean
  onSubmit: (input: MemberFormValues) => Promise<void>
  onClose: () => void
}

const emptyForm = {
  name: '',
  lastname: '',
  document: '',
  email: '',
  password: '',
  phone: '',
  weight: '',
  height: '',
}

function toForm(initial?: AdminClient | null): typeof emptyForm {
  if (!initial) return emptyForm
  return {
    name: initial.name,
    lastname: initial.lastname,
    document: initial.document,
    email: initial.email,
    password: '',
    phone: initial.phone ?? '',
    weight: initial.weight != null ? String(initial.weight) : '',
    height: initial.height != null ? String(initial.height) : '',
  }
}

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

  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => firstRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [open])

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

    if (!name || !lastname || !email || !document) {
      setError('Completa los campos obligatorios (marcados con *).')
      return
    }
    if (!email.includes('@')) {
      setError('Ingresa un correo válido.')
      return
    }
    if (!isEdit && form.password.length < 8) {
      setError('La contraseña inicial debe tener al menos 8 caracteres.')
      return
    }

    const weight = parseMetric(form.weight)
    const height = parseMetric(form.height)
    if (weight === 'invalid' || height === 'invalid') {
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
        password: form.password,
        phone: form.phone.trim(),
        weight,
        height,
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={busy}
      label={isEdit ? 'Editar socio' : 'Registrar nuevo cliente'}
    >
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
            : 'Crea la cuenta del cliente. Los campos con * son obligatorios.'}
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
            <Field label="Correo electrónico" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="laura.gomez@correo.com"
                className={fieldClass}
              />
            </Field>
          </Section>

          {isEdit ? (
            <Section title="Contacto y métricas">
              <Field label="Teléfono" full>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="300 123 4567"
                  className={fieldClass}
                />
              </Field>
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
          ) : (
            <Section title="Acceso">
              <Field label="Contraseña inicial" required full>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className={fieldClass}
                />
              </Field>
            </Section>
          )}

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
    </Modal>
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
