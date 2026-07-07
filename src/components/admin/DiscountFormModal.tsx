import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Check, PlusCircle, Save } from 'lucide-react'
import type { AdminDiscount, AdminPlan, DiscountInput } from '../../types/admin'
import { Modal } from '../common/Modal'

type Mode = 'create' | 'edit'

interface DiscountFormModalProps {
  open: boolean
  mode: Mode
  plans: AdminPlan[]
  initial?: AdminDiscount | null
  busy?: boolean
  onSubmit: (input: DiscountInput) => Promise<void>
  onClose: () => void
}

const emptyForm = {
  name: '',
  description: '',
  percentage: '',
  initDate: '',
  endDate: '',
}

function toForm(initial?: AdminDiscount | null): typeof emptyForm {
  if (!initial) return emptyForm
  return {
    name: initial.name,
    description: initial.description ?? '',
    percentage: String(initial.percentage),
    initDate: initial.initDate,
    endDate: initial.endDate,
  }
}

export function DiscountFormModal({
  open,
  mode,
  plans,
  initial,
  busy = false,
  onSubmit,
  onClose,
}: DiscountFormModalProps) {
  const [form, setForm] = useState(() => toForm(initial))
  const [planIds, setPlanIds] = useState<number[]>(
    () => initial?.plans.map((plan) => plan.id) ?? [],
  )
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

  function togglePlan(id: number) {
    setPlanIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    const name = form.name.trim()
    const description = form.description.trim()

    if (!name) {
      setError('El nombre promocional es obligatorio.')
      return
    }
    if (name.length > 60) {
      setError('El nombre promocional no puede superar los 60 caracteres.')
      return
    }
    if (description.length > 200) {
      setError('La descripción no puede superar los 200 caracteres.')
      return
    }

    const percentage = Number(form.percentage.replace(',', '.'))
    if (!Number.isFinite(percentage) || percentage < 1 || percentage > 100) {
      setError('El porcentaje debe ser un número entre 1 y 100.')
      return
    }

    if (!form.initDate || !form.endDate) {
      setError('Las fechas de inicio y fin son obligatorias.')
      return
    }
    if (form.endDate < form.initDate) {
      setError('La fecha de fin debe ser igual o posterior a la de inicio.')
      return
    }

    setError(null)
    try {
      await onSubmit({
        name,
        description: description || null,
        percentage,
        initDate: form.initDate,
        endDate: form.endDate,
        active: initial?.active ?? true,
        planIds,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos guardar el descuento. Inténtalo de nuevo.',
      )
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ember focus:outline-none [color-scheme:dark]'

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={busy}
      maxWidth="max-w-xl"
      label={isEdit ? 'Editar descuento' : 'Crear descuento'}
    >
      <div className="p-6 sm:p-8">
        <p className="font-mono text-xs tracking-[0.3em] text-ember uppercase">
          {isEdit ? 'Editar descuento' : 'Nuevo descuento'}
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-wide text-ink">
          {isEdit ? 'Editar descuento' : 'Crear descuento'}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {isEdit
            ? 'Ajusta la promoción o cambia los planes a los que aplica. Los campos con * son obligatorios.'
            : 'Define la promoción de temporada y elige los planes activos a los que aplica. Los campos con * son obligatorios.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <Field label="Nombre promocional" required>
            <input
              ref={firstRef}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Verano Fit"
              className={fieldClass}
            />
          </Field>

          <Field label="Descripción">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Arranca la temporada con precio especial en tu plan"
              rows={2}
              className={`${fieldClass} resize-none`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Descuento (%)" required>
              <input
                inputMode="decimal"
                value={form.percentage}
                onChange={(e) => set('percentage', e.target.value)}
                placeholder="20"
                className={fieldClass}
              />
            </Field>
            <Field label="Inicio" required>
              <input
                type="date"
                value={form.initDate}
                onChange={(e) => set('initDate', e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Fin" required>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="space-y-2">
            <span className="block font-mono text-xs tracking-[0.25em] text-muted uppercase">
              Planes con descuento
            </span>
            {plans.length === 0 ? (
              <p className="rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm text-muted">
                No hay planes activos para asociar. Crea un plan primero.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {plans.map((plan) => {
                  const selected = planIds.includes(plan.id)
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => togglePlan(plan.id)}
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        selected
                          ? 'border-ember bg-ember-soft text-ink'
                          : 'border-line text-muted hover:border-steel hover:text-ink'
                      }`}
                    >
                      {selected && (
                        <Check className="size-3.5 text-ember" strokeWidth={2.5} />
                      )}
                      {plan.name}
                    </button>
                  )
                })}
              </div>
            )}
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
                  : 'Crear descuento'}
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
    <label className="block space-y-2">
      <span className="block font-mono text-xs tracking-[0.25em] text-muted uppercase">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      {children}
    </label>
  )
}
