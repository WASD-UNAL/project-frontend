import { useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { KeyRound, Save } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../services/apiClient'
import { changeMyPassword, updateMyProfile } from '../../services/membershipService'
import type { UserProfile } from '../../types/membership'

const fieldClass =
  'w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ember focus:outline-none'

interface Feedback {
  tone: 'ok' | 'error'
  text: string
}

function parseMetric(raw: string): number | null | 'invalid' {
  const value = raw.trim()
  if (!value) return null
  const n = Number(value.replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return 'invalid'
  return n
}

interface BmiResult {
  value: number
  category: string
  tone: 'ok' | 'warn'
}

function computeBmi(weightRaw: string, heightRaw: string): BmiResult | null {
  const weight = parseMetric(weightRaw)
  const height = parseMetric(heightRaw)
  if (typeof weight !== 'number' || typeof height !== 'number') return null

  const meters = height / 100
  const value = weight / (meters * meters)
  if (!Number.isFinite(value)) return null

  if (value < 18.5) return { value, category: 'Bajo peso', tone: 'warn' }
  if (value < 25) return { value, category: 'Peso saludable', tone: 'ok' }
  if (value < 30) return { value, category: 'Sobrepeso', tone: 'warn' }
  return { value, category: 'Obesidad', tone: 'warn' }
}

export function ProfileSection() {
  const { profile, updateProfile } = useAuth()

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">
          PERFIL
        </h1>
        <p className="mt-1 text-sm text-muted">
          Mantén tus datos personales al día y gestiona tu contraseña.
        </p>
      </div>

      {!profile ? (
        <p className="mt-6 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-sm text-ink">
          No pudimos cargar tu perfil. Recarga la página e inténtalo de nuevo.
        </p>
      ) : (
        <>
          <PersonalInfoCard profile={profile} onSaved={updateProfile} />
          <PasswordCard />
        </>
      )}
    </div>
  )
}

function PersonalInfoCard({
  profile,
  onSaved,
}: {
  profile: UserProfile
  onSaved: (profile: UserProfile) => void
}) {
  const [form, setForm] = useState({
    name: profile.name,
    lastname: profile.lastname,
    email: profile.email,
    phone: profile.phone ?? '',
    weight: profile.weight != null ? String(profile.weight) : '',
    height: profile.height != null ? String(profile.height) : '',
  })
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    const name = form.name.trim()
    const lastname = form.lastname.trim()
    const email = form.email.trim()

    if (!name || !lastname || !email) {
      setFeedback({
        tone: 'error',
        text: 'El nombre, apellido y correo son obligatorios.',
      })
      return
    }
    if (!email.includes('@')) {
      setFeedback({ tone: 'error', text: 'Ingresa un correo válido.' })
      return
    }

    const weight = parseMetric(form.weight)
    const height = parseMetric(form.height)
    if (weight === 'invalid' || height === 'invalid') {
      setFeedback({
        tone: 'error',
        text: 'El peso y la estatura deben ser números mayores que cero.',
      })
      return
    }

    setBusy(true)
    setFeedback(null)
    try {
      const updated = await updateMyProfile({
        name,
        lastname,
        email,
        phone: form.phone.trim(),
        weight: weight ?? undefined,
        height: height ?? undefined,
      })
      onSaved(updated)
      setFeedback({ tone: 'ok', text: 'Tus datos se guardaron correctamente.' })
    } catch (err) {
      setFeedback({
        tone: 'error',
        text:
          err instanceof ApiError
            ? err.message
            : 'No pudimos guardar tus datos. Inténtalo de nuevo.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      aria-label="Información personal"
      className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl tracking-wide text-ink">
          Información personal
        </h2>
        <span className="font-mono text-xs text-muted">
          Documento {profile.document}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" required>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Laura"
              autoComplete="given-name"
              className={fieldClass}
            />
          </Field>
          <Field label="Apellido" required>
            <input
              value={form.lastname}
              onChange={(e) => set('lastname', e.target.value)}
              placeholder="Gómez"
              autoComplete="family-name"
              className={fieldClass}
            />
          </Field>
          <Field label="Correo electrónico" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="laura.gomez@correo.com"
              autoComplete="email"
              className={fieldClass}
            />
          </Field>
          <Field label="Teléfono">
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="300 123 4567"
              autoComplete="tel"
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
          <Field label="Estatura (cm)">
            <input
              inputMode="decimal"
              value={form.height}
              onChange={(e) => set('height', e.target.value)}
              placeholder="168"
              className={fieldClass}
            />
          </Field>
        </div>

        <BmiCard bmi={computeBmi(form.weight, form.height)} />

        {feedback && <FeedbackBanner feedback={feedback} />}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-2.5 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
          >
            <Save className="size-4" strokeWidth={2} />
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  )
}

function PasswordCard() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    if (!form.currentPassword) {
      setFeedback({ tone: 'error', text: 'Ingresa tu contraseña actual.' })
      return
    }
    if (form.newPassword.length < 8) {
      setFeedback({
        tone: 'error',
        text: 'La nueva contraseña debe tener al menos 8 caracteres.',
      })
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setFeedback({ tone: 'error', text: 'Las contraseñas nuevas no coinciden.' })
      return
    }

    setBusy(true)
    setFeedback(null)
    try {
      await changeMyPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setFeedback({ tone: 'ok', text: 'Tu contraseña se actualizó correctamente.' })
    } catch (err) {
      setFeedback({
        tone: 'error',
        text:
          err instanceof ApiError && err.code === 'invalid_credentials'
            ? 'La contraseña actual no es correcta.'
            : 'No pudimos cambiar tu contraseña. Inténtalo de nuevo.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      aria-label="Cambiar contraseña"
      className="animate-card-rise mt-6 rounded-2xl border border-line bg-surface p-6"
      style={{ '--rise-delay': '120ms' } as CSSProperties}
    >
      <h2 className="font-display text-2xl tracking-wide text-ink">
        Cambiar contraseña
      </h2>
      <p className="mt-1 text-sm text-muted">
        Necesitas tu contraseña actual para definir una nueva de al menos 8
        caracteres.
      </p>

      <form onSubmit={handleSubmit} className="mt-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Contraseña actual" required>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => set('currentPassword', e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={fieldClass}
            />
          </Field>
          <Field label="Nueva contraseña" required>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => set('newPassword', e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className={fieldClass}
            />
          </Field>
          <Field label="Confirmar contraseña" required>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              placeholder="Repite la nueva"
              autoComplete="new-password"
              className={fieldClass}
            />
          </Field>
        </div>

        {feedback && <FeedbackBanner feedback={feedback} />}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ember/50 px-6 py-2.5 text-sm font-semibold text-ember transition-colors hover:bg-ember hover:text-bg disabled:opacity-60"
          >
            <KeyRound className="size-4" strokeWidth={2} />
            {busy ? 'Actualizando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </section>
  )
}

function BmiCard({ bmi }: { bmi: BmiResult | null }) {
  if (!bmi) return null

  return (
    <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-line bg-surface-soft px-4 py-3">
      <span className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
        IMC
      </span>
      <span className="font-mono text-lg text-ink">{bmi.value.toFixed(1)}</span>
      <span
        className={`text-sm font-medium ${bmi.tone === 'ok' ? 'text-ember' : 'text-muted'}`}
      >
        {bmi.category}
      </span>
      <span className="text-xs text-muted">
        Calculado con tu peso y estatura actuales.
      </span>
    </div>
  )
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  return (
    <p
      role="status"
      className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
        feedback.tone === 'ok'
          ? 'border-ember/40 bg-ember-soft text-ink'
          : 'border-danger/40 bg-danger-soft text-danger'
      }`}
    >
      {feedback.text}
    </p>
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
