import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { PlusCircle, Save } from 'lucide-react'
import type { AdminPlan, PlanInput } from '../../types/admin'
import { Modal } from '../common/Modal'

type Mode = 'create' | 'edit'

interface PlanFormModalProps {
  open: boolean
  mode: Mode
  initial?: AdminPlan | null
  busy?: boolean
  onSubmit: (input: PlanInput) => Promise<void>
  onClose: () => void
}

const emptyForm = {
  name: '',
  description: '',
  durationDays: '',
  price: '',
}

function toForm(initial?: AdminPlan | null): typeof emptyForm {
  if (!initial) return emptyForm
  return {
    name: initial.name,
    description: initial.description ?? '',
    durationDays: String(initial.durationDays),
    price: String(initial.price),
  }
}

export function PlanFormModal({
  open,
  mode,
  initial,
  busy = false,
  onSubmit,
  onClose,
}: PlanFormModalProps) {
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    const name = form.name.trim()
    const description = form.description.trim()

    if (!name) {
      setError('El nombre del plan es obligatorio.')
      return
    }
    if (name.length > 100) {
      setError('El nombre no puede superar los 100 caracteres.')
      return
    }
    if (description.length > 255) {
      setError('La descripción no puede superar los 255 caracteres.')
      return
    }

    const durationDays = Number(form.durationDays)
    if (!Number.isInteger(durationDays) || durationDays < 1) {
      setError('La duración debe ser un número entero de al menos 1 día.')
      return
    }

    const price = Number(form.price.replace(',', '.'))
    if (!Number.isFinite(price) || price < 0) {
      setError('El precio debe ser un número mayor o igual a cero.')
      return
    }

    setError(null)
    try {
      await onSubmit({
        name,
        description: description || null,
        durationDays,
        price,
        active: initial?.active ?? true,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos guardar el plan. Inténtalo de nuevo.',
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
      maxWidth="max-w-xl"
      label={isEdit ? 'Editar plan' : 'Crear plan'}
    >
      <div className="p-6 sm:p-8">
        <p className="font-mono text-xs tracking-[0.3em] text-ember uppercase">
          {isEdit ? 'Editar plan' : 'Nuevo plan'}
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-wide text-ink">
          {isEdit ? 'Editar plan' : 'Crear plan'}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {isEdit
            ? 'Actualiza los datos del plan. Los campos con * son obligatorios.'
            : 'Define el nuevo plan de membresía. Los campos con * son obligatorios.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <Field label="Nombre" required>
            <input
              ref={firstRef}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Plan Plus"
              className={fieldClass}
            />
          </Field>

          <Field label="Descripción">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Acceso completo a máquinas y clases grupales"
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duración (días)" required>
              <input
                inputMode="numeric"
                value={form.durationDays}
                onChange={(e) => set('durationDays', e.target.value)}
                placeholder="30"
                className={fieldClass}
              />
            </Field>
            <Field label="Precio (COP)" required>
              <input
                inputMode="decimal"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="98000"
                className={fieldClass}
              />
            </Field>
          </div>

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
                <PlusCircle className="size-4" strokeWidth={2} />
              )}
              {busy
                ? 'Guardando…'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Crear plan'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="space-y-2">
      <span className="block font-mono text-xs tracking-[0.25em] text-muted uppercase">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      {children}
    </label>
  )
}
