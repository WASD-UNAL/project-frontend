import { useCallback, useEffect, useState } from 'react'
import { PencilLine, PlusCircle, Trash2 } from 'lucide-react'
import type { AdminPlan, PlanInput } from '../../types/admin'
import {
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from '../../services/planAdminService'
import { formatCOP } from '../../utils/currency'
import { planPeriodLabel } from '../../utils/planPeriod'
import { ConfirmModal } from '../dashboard/ConfirmModal'
import { PromoSticker } from '../common/PromoSticker'
import { DiscountsSection } from './DiscountsSection'
import { PlanFormModal } from './PlanFormModal'

interface Feedback {
  tone: 'ok' | 'error'
  text: string
}

export function PlansSection() {
  const [plans, setPlans] = useState<AdminPlan[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPlan | null>(null)
  const [deleting, setDeleting] = useState<AdminPlan | null>(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await getPlans()
      setPlans(data)
      setLoadError(false)
    } catch {
      setLoadError(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleCreate(input: PlanInput) {
    setBusy(true)
    try {
      const created = await createPlan(input)
      await refresh()
      setNewOpen(false)
      setFeedback({ tone: 'ok', text: `El plan “${created.name}” quedó creado.` })
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate(input: PlanInput) {
    if (!editing) return
    setBusy(true)
    try {
      const updated = await updatePlan(editing.id, input)
      await refresh()
      setEditing(null)
      setFeedback({ tone: 'ok', text: `Se actualizó el plan “${updated.name}”.` })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await deletePlan(deleting.id)
      await refresh()
      setFeedback({ tone: 'ok', text: `El plan “${deleting.name}” fue eliminado.` })
      setDeleting(null)
    } catch (err) {
      setDeleting(null)
      setFeedback({
        tone: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'No pudimos eliminar el plan. Inténtalo de nuevo.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
            PLANES
          </h1>
          <p className="mt-1 text-sm text-muted">
            Crea, edita o elimina los planes de membresía del gimnasio.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="size-4" strokeWidth={2} />
          Crear plan
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
          No pudimos cargar los planes.
        </p>
      ) : !plans ? (
        <div className="mt-6 h-80 animate-pulse rounded-2xl border border-line bg-surface" aria-hidden />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Plan</th>
                  <th className="px-5 py-3.5 font-medium">Duración</th>
                  <th className="px-5 py-3.5 font-medium">Precio</th>
                  <th className="px-5 py-3.5 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted">
                      Aún no hay planes. Crea el primero con “Crear plan”.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id} className="transition-colors hover:bg-surface-soft/50">
                      <td className="px-5 py-4">
                        <p className="text-ink">{plan.name}</p>
                        <p className="text-xs text-muted">
                          {plan.description ?? 'Sin descripción'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {plan.durationDays} días
                        <span className="block font-mono text-xs text-muted/70">
                          {planPeriodLabel(plan.durationDays)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {plan.discount ? (
                          <div>
                            <s className="block font-mono text-xs text-muted decoration-warn/70">
                              {formatCOP(plan.price)}
                            </s>
                            <span className="font-mono text-ink">
                              {formatCOP(plan.discount.discountedPrice)}
                            </span>
                            <div className="mt-1.5">
                              <PromoSticker
                                name={plan.discount.name}
                                percentage={plan.discount.percentage}
                                size="sm"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="font-mono text-ink">
                            {formatCOP(plan.price)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing(plan)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-steel hover:text-ink"
                          >
                            <PencilLine className="size-3.5" strokeWidth={2} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(plan)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-danger hover:text-danger"
                          >
                            <Trash2 className="size-3.5" strokeWidth={2} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DiscountsSection plans={plans ?? []} onPlansRefresh={refresh} />

      <PlanFormModal
        key={`create-${newOpen}`}
        open={newOpen}
        mode="create"
        busy={busy}
        onSubmit={handleCreate}
        onClose={() => setNewOpen(false)}
      />

      <PlanFormModal
        key={`edit-${editing?.id ?? 'none'}`}
        open={editing !== null}
        mode="edit"
        initial={editing}
        busy={busy}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <ConfirmModal
        open={deleting !== null}
        title="Eliminar plan"
        confirmLabel="Eliminar plan"
        destructive
        busy={busy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      >
        Vas a eliminar el plan “{deleting?.name}”. Esta acción no se puede
        deshacer y el plan dejará de ofrecerse a los socios.
      </ConfirmModal>
    </div>
  )
}
