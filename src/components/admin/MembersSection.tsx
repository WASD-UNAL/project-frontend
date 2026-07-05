import { useEffect, useMemo, useState } from 'react'
import { Eye, Search, Trash2, UserCheck, UserPlus, UserX } from 'lucide-react'
import type { AdminMember, MemberStatus } from '../../types/admin'
import type { NewMemberInput } from '../../services/adminService'
import {
  createMember,
  deleteMember,
  getMembers,
  setMemberActive,
  updateMember,
} from '../../services/adminService'
import { formatDate } from '../../utils/membership'
import { ConfirmModal } from '../dashboard/ConfirmModal'
import { MemberFormModal } from './MemberFormModal'
import { MemberProfileModal } from './MemberProfileModal'

const statusThemes: Record<MemberStatus, { label: string; text: string; dot: string }> = {
  ACTIVE: { label: 'Activo', text: 'text-ember', dot: 'bg-ember' },
  EXPIRING: { label: 'Por vencer', text: 'text-warn', dot: 'bg-warn' },
  EXPIRED: { label: 'Vencida', text: 'text-danger', dot: 'bg-danger' },
  INACTIVE: { label: 'Inactivo', text: 'text-muted', dot: 'bg-muted' },
}

export function MembersSection() {
  const [members, setMembers] = useState<AdminMember[] | null>(null)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminMember | null>(null)
  const [editing, setEditing] = useState<AdminMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<AdminMember | null>(null)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMembers()
      .then((data) => {
        if (!cancelled) setMembers(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!members) return []
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) =>
      `${m.name} ${m.lastname} ${m.email} ${m.document}`
        .toLowerCase()
        .includes(q),
    )
  }, [members, query])

  async function toggleActive(member: AdminMember) {
    setBusyId(member.id)
    try {
      const updated = await setMemberActive(member.id, !member.active)
      setMembers((prev) =>
        prev
          ? prev.map((m) => (m.id === updated.id ? updated : m))
          : prev,
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleCreate(input: NewMemberInput) {
    setCreating(true)
    try {
      const created = await createMember(input)
      setMembers((prev) => (prev ? [created, ...prev] : [created]))
      setNewOpen(false)
      setFeedback(`${created.name} ${created.lastname} quedó registrado.`)
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdate(input: NewMemberInput) {
    if (!editing) return
    setSaving(true)
    try {
      const updated = await updateMember(editing.id, input)
      setMembers((prev) =>
        prev ? prev.map((m) => (m.id === updated.id ? updated : m)) : prev,
      )
      setEditing(null)
      setFeedback(`Se actualizó el perfil de ${updated.name} ${updated.lastname}.`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    const target = deleting
    setRemoving(true)
    try {
      await deleteMember(target.id)
      setMembers((prev) =>
        prev ? prev.filter((m) => m.id !== target.id) : prev,
      )
      setDeleting(null)
      setFeedback(`Se eliminó a ${target.name} ${target.lastname}.`)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
            SOCIOS
          </h1>
          <p className="mt-1 text-sm text-muted">
            Consulta el estado de los socios y gestiona su acceso.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="size-4" strokeWidth={2} />
          Registrar cliente
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o documento"
            className="w-full rounded-full border border-line bg-surface-soft py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ember focus:outline-none"
          />
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-ember/40 bg-ember-soft px-4 py-3 text-sm text-ink"
        >
          {feedback}
        </div>
      )}

      {error ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar los socios.
        </p>
      ) : !members ? (
        <div className="mt-6 h-80 animate-pulse rounded-2xl border border-line bg-surface" aria-hidden />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                  <th className="px-5 py-3.5 font-medium">Socio</th>
                  <th className="px-5 py-3.5 font-medium">Documento</th>
                  <th className="px-5 py-3.5 font-medium">Plan</th>
                  <th className="px-5 py-3.5 font-medium">Vence</th>
                  <th className="px-5 py-3.5 font-medium">Estado</th>
                  <th className="px-5 py-3.5 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted">
                      No hay socios que coincidan con “{query}”.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => {
                    const status = statusThemes[m.status]
                    return (
                      <tr key={m.id} className="transition-colors hover:bg-surface-soft/50">
                        <td className="px-5 py-4">
                          <p className="text-ink">
                            {m.name} {m.lastname}
                          </p>
                          <p className="font-mono text-xs text-muted">{m.email}</p>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">
                          {m.document}
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {m.planName ?? '—'}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">
                          {m.endDate ? formatDate(m.endDate) : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.text}`}
                          >
                            <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelected(m)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-steel hover:text-ink"
                            >
                              <Eye className="size-3.5" strokeWidth={2} />
                              Ver
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleActive(m)}
                              disabled={busyId === m.id}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                                m.active
                                  ? 'border-line text-muted hover:border-danger hover:text-danger'
                                  : 'border-ember/50 text-ember hover:bg-ember hover:text-bg'
                              }`}
                            >
                              {m.active ? (
                                <>
                                  <UserX className="size-3.5" strokeWidth={2} />
                                  Suspender
                                </>
                              ) : (
                                <>
                                  <UserCheck className="size-3.5" strokeWidth={2} />
                                  Activar
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(m)}
                              aria-label={`Eliminar a ${m.name} ${m.lastname}`}
                              className="inline-flex items-center justify-center rounded-full border border-line p-1.5 text-muted transition-colors hover:border-danger hover:text-danger"
                            >
                              <Trash2 className="size-3.5" strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MemberFormModal
        key={`create-${newOpen}`}
        open={newOpen}
        mode="create"
        busy={creating}
        onSubmit={handleCreate}
        onClose={() => setNewOpen(false)}
      />

      <MemberFormModal
        key={`edit-${editing?.id ?? 'none'}`}
        open={editing !== null}
        mode="edit"
        initial={editing}
        busy={saving}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <MemberProfileModal
        member={selected}
        onEdit={(m) => {
          setSelected(null)
          setEditing(m)
        }}
        onClose={() => setSelected(null)}
      />

      <ConfirmModal
        open={deleting !== null}
        title="¿Eliminar socio?"
        confirmLabel="Sí, eliminar"
        destructive
        busy={removing}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      >
        Vas a eliminar a{' '}
        <span className="font-semibold text-ink">
          {deleting ? `${deleting.name} ${deleting.lastname}` : ''}
        </span>{' '}
        de forma permanente. Se perderá su perfil y su historial asociado. Esta
        acción no se puede deshacer.
      </ConfirmModal>
    </div>
  )
}
