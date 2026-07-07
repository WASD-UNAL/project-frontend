import { useCallback, useEffect, useState } from 'react'
import { BadgePercent, PencilLine, Play, Pause, Trash2 } from 'lucide-react'
import type { AdminDiscount, AdminPlan, DiscountInput } from '../../types/admin'
import {
  createDiscount,
  deleteDiscount,
  getDiscounts,
  setDiscountActive,
  updateDiscount,
} from '../../services/discountAdminService'
import { formatDiscountDate, formatPercentOff } from '../../utils/discount'
import { ConfirmModal } from '../dashboard/ConfirmModal'
import { DiscountFormModal } from './DiscountFormModal'

interface Feedback {
  tone: 'ok' | 'error'
  text: string
}

interface DiscountsSectionProps {
  plans: AdminPlan[]
  onPlansRefresh: () => Promise<void>
}

type DiscountStatus = 'vigente' | 'programado' | 'finalizado' | 'pausado'

function discountStatus(discount: AdminDiscount): DiscountStatus {
  if (!discount.active) return 'pausado'
  const today = new Date().toLocaleDateString('en-CA')
  if (today < discount.initDate) return 'programado'
  if (today > discount.endDate) return 'finalizado'
  return 'vigente'
}

const statusChips: Record<DiscountStatus, { label: string; className: string }> = {
  vigente: { label: 'Vigente', className: 'border-ember/40 bg-ember-soft text-ember' },
  programado: { label: 'Programado', className: 'border-warn/40 bg-warn-soft text-warn' },
  finalizado: { label: 'Finalizado', className: 'border-line bg-surface-soft text-muted' },
  pausado: { label: 'Pausado', className: 'border-line bg-surface-soft text-muted' },
}

export function DiscountsSection({ plans, onPlansRefresh }: DiscountsSectionProps) {
  const [discounts, setDiscounts] = useState<AdminDiscount[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [editing, setEditing] = useState<AdminDiscount | null>(null)
  const [deleting, setDeleting] = useState<AdminDiscount | null>(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await getDiscounts()
      setDiscounts(data)
      setLoadError(false)
    } catch {
      setLoadError(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function refreshAll() {
    await Promise.all([refresh(), onPlansRefresh()])
  }

  async function handleCreate(input: DiscountInput) {
    setBusy(true)
    try {
      const created = await createDiscount(input)
      await refreshAll()
      setNewOpen(false)
      setFeedback({
        tone: 'ok',
        text:
          created.plans.length > 0
            ? `La promoción “${created.name}” quedó creada y aplicada a ${created.plans.length} ${created.plans.length === 1 ? 'plan' : 'planes'}.`
            : `La promoción “${created.name}” quedó creada. Asígnale planes para que se vea en la página.`,
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate(input: DiscountInput) {
    if (!editing) return
    setBusy(true)
    try {
      const updated = await updateDiscount(editing.id, input)
      await refreshAll()
      setEditing(null)
      setFeedback({ tone: 'ok', text: `Se actualizó la promoción “${updated.name}”.` })
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleActive(discount: AdminDiscount) {
    setBusy(true)
    try {
      const updated = await setDiscountActive(discount.id, !discount.active)
      await refreshAll()
      setFeedback({
        tone: 'ok',
        text: updated.active
          ? `La promoción “${updated.name}” quedó activa de nuevo.`
          : `Pausaste la promoción “${updated.name}”. Los planes vuelven a su precio normal.`,
      })
    } catch (err) {
      setFeedback({
        tone: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'No pudimos cambiar el estado de la promoción. Inténtalo de nuevo.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteDiscount(deleting.id)
      await refreshAll()
      setFeedback({ tone: 'ok', text: `La promoción “${deleting.name}” fue eliminada.` })
      setDeleting(null)
    } catch (err) {
      setDeleting(null)
      setFeedback({
        tone: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'No pudimos eliminar la promoción. Inténtalo de nuevo.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-ember uppercase">
            Promociones
          </p>
          <h2 className="mt-1 font-display text-3xl tracking-wide text-ink">
            DESCUENTOS DE TEMPORADA
          </h2>
          <p className="mt-1 text-sm text-muted">
            Crea promociones con nombre propio y aplícalas a los planes activos.
            Los socios las ven en la página y al inscribirse.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-ember px-5 py-2.5 text-sm font-bold tracking-wide text-ember transition-colors hover:bg-ember-soft"
        >
          <BadgePercent className="size-4" strokeWidth={2} />
          Crear descuento
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mt-4 rounded-xl border px-4 py-3 text-sm text-ink ${
            feedback.tone === 'ok'
              ? 'border-ember/40 bg-ember-soft'
              : 'border-danger/40 bg-danger-soft'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loadError ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar los descuentos.
        </p>
      ) : !discounts ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2" aria-hidden>
          <div className="h-44 animate-pulse rounded-2xl border border-line bg-surface" />
          <div className="h-44 animate-pulse rounded-2xl border border-line bg-surface" />
        </div>
      ) : discounts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            Aún no hay promociones. Crea la primera con “Crear descuento” y
            elige a qué planes aplica.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {discounts.map((discount) => {
            const status = discountStatus(discount)
            const chip = statusChips[status]
            return (
              <article
                key={discount.id}
                className="flex flex-col rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-md bg-warn px-2.5 py-1 font-mono text-sm font-bold text-bg">
                      {formatPercentOff(discount.percentage)}
                    </span>
                    <h3 className="truncate font-display text-2xl tracking-wide text-ink">
                      {discount.name.toUpperCase()}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${chip.className}`}
                  >
                    {chip.label}
                  </span>
                </div>

                {discount.description && (
                  <p className="mt-2 text-sm text-muted">{discount.description}</p>
                )}

                <p className="mt-3 font-mono text-xs tracking-wide text-muted">
                  {formatDiscountDate(discount.initDate)} →{' '}
                  {formatDiscountDate(discount.endDate)}
                </p>

                <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                  {discount.plans.length === 0 ? (
                    <span className="text-xs text-muted/70">
                      Sin planes asignados: no se muestra a los socios.
                    </span>
                  ) : (
                    discount.plans.map((plan) => (
                      <span
                        key={plan.id}
                        className="rounded-full border border-line bg-surface-soft px-2.5 py-1 text-xs text-ink"
                      >
                        {plan.name}
                      </span>
                    ))
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleToggleActive(discount)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-steel hover:text-ink disabled:opacity-50"
                  >
                    {discount.active ? (
                      <Pause className="size-3.5" strokeWidth={2} />
                    ) : (
                      <Play className="size-3.5" strokeWidth={2} />
                    )}
                    {discount.active ? 'Pausar' : 'Reanudar'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEditing(discount)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-steel hover:text-ink disabled:opacity-50"
                  >
                    <PencilLine className="size-3.5" strokeWidth={2} />
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setDeleting(discount)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" strokeWidth={2} />
                    Eliminar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <DiscountFormModal
        key={`create-${newOpen}`}
        open={newOpen}
        mode="create"
        plans={plans}
        busy={busy}
        onSubmit={handleCreate}
        onClose={() => setNewOpen(false)}
      />

      <DiscountFormModal
        key={`edit-${editing?.id ?? 'none'}`}
        open={editing !== null}
        mode="edit"
        plans={plans}
        initial={editing}
        busy={busy}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <ConfirmModal
        open={deleting !== null}
        title="Eliminar descuento"
        confirmLabel="Eliminar descuento"
        destructive
        busy={busy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      >
        Vas a eliminar la promoción “{deleting?.name}”. Los planes asociados
        volverán a mostrarse con su precio normal.
      </ConfirmModal>
    </section>
  )
}
