import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, IdCard, Lock, Mail, User, UserRound, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAuthFlow } from '../../hooks/useAuthFlow'
import { login, register, roleFromToken } from '../../services/authService'
import { ApiError } from '../../services/apiClient'

const copy = {
  login: {
    eyebrow: 'Bienvenido de vuelta',
    title: 'Iniciar sesión',
    submit: 'Entrar',
    busy: 'Entrando…',
  },
  register: {
    eyebrow: 'Únete a Gymly',
    title: 'Crear cuenta',
    submit: 'Crear cuenta',
    busy: 'Creando cuenta…',
  },
} as const

export function AuthModal() {
  const { setToken } = useAuth()
  const { mode, pendingPlanId, setMode, closeAuth } = useAuthFlow()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [name, setName] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) closeAuth()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, closeAuth])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)

    if (mode === 'register' && password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setBusy(true)
    try {
      const result =
        mode === 'login'
          ? await login({ identifier: identifier.trim(), password })
          : await register({
              name: name.trim(),
              lastname: lastname.trim(),
              email: email.trim(),
              document: documentNumber.trim(),
              password,
            })
      setToken(result.token)
      closeAuth()

      // La inscripción a un plan es una acción de cliente: va siempre al dashboard.
      if (pendingPlanId != null) {
        navigate(`/dashboard?enroll=${pendingPlanId}`)
        return
      }

      // Los admins entran directo a su panel, sin pasar por la vista de cliente.
      // El rol se lee del propio token (el registro siempre crea cuentas CLIENT).
      const isAdmin = mode === 'login' && roleFromToken(result.token) === 'ADMIN'
      navigate(isAdmin ? '/admin' : '/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        console.error('Fallo inesperado en autenticación:', err)
        setError(
          'No pudimos completar la operación. Revisa tu conexión e inténtalo de nuevo.',
        )
      }
      setBusy(false)
    }
  }

  const t = copy[mode]

  return createPortal(
    <div
      className="fixed inset-0 z-[70] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !busy && closeAuth()}
        className="fixed inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div className="relative flex min-h-full items-center justify-center px-4 py-8">
        <div className="animate-card-rise relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="h-1 w-full bg-ember" />

          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => !busy && closeAuth()}
            disabled={busy}
            className="absolute top-5 right-5 text-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            <X className="size-5" />
          </button>

          <div className="p-6 sm:p-8">
            <p className="font-mono text-xs tracking-[0.3em] text-ember uppercase">
              {t.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl tracking-wide text-ink">
              {t.title}
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-surface-soft p-1">
              <ModeTab
                label="Iniciar sesión"
                active={mode === 'login'}
                disabled={busy}
                onClick={() => setMode('login')}
              />
              <ModeTab
                label="Crear cuenta"
                active={mode === 'register'}
                disabled={busy}
                onClick={() => setMode('register')}
              />
            </div>

            {pendingPlanId != null && (
              <p className="mt-4 rounded-xl border border-ember/30 bg-ember-soft px-4 py-3 text-xs text-muted">
                Estás a un paso de tu plan.{' '}
                {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'} para
                completar tu inscripción.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {mode === 'login' ? (
                <Field
                  id="auth-identifier"
                  label="Correo o documento"
                  icon={Mail}
                  autoComplete="username"
                  placeholder="tu@correo.com"
                  value={identifier}
                  onChange={setIdentifier}
                  autoFocus
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      id="auth-name"
                      label="Nombre"
                      icon={User}
                      autoComplete="given-name"
                      placeholder="Ana"
                      value={name}
                      onChange={setName}
                      autoFocus
                    />
                    <Field
                      id="auth-lastname"
                      label="Apellido"
                      icon={UserRound}
                      autoComplete="family-name"
                      placeholder="Ramírez"
                      value={lastname}
                      onChange={setLastname}
                    />
                  </div>
                  <Field
                    id="auth-email"
                    label="Correo electrónico"
                    icon={Mail}
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={setEmail}
                  />
                  <Field
                    id="auth-document"
                    label="Documento"
                    icon={IdCard}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="1002003000"
                    value={documentNumber}
                    onChange={setDocumentNumber}
                  />
                </>
              )}

              <Field
                id="auth-password"
                label="Contraseña"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                value={password}
                onChange={setPassword}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
              />

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-ember px-6 py-3 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {busy ? t.busy : t.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

interface ModeTabProps {
  label: string
  active: boolean
  disabled: boolean
  onClick: () => void
}

function ModeTab({ label, active, disabled, onClick }: ModeTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm transition-colors disabled:opacity-60 ${
        active
          ? 'bg-ember font-bold text-bg'
          : 'font-semibold text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}

interface FieldProps {
  id: string
  label: string
  icon: LucideIcon
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'email'
  placeholder?: string
  autoFocus?: boolean
  trailing?: ReactNode
}

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  autoComplete,
  inputMode,
  placeholder,
  autoFocus,
  trailing,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block font-mono text-xs tracking-[0.25em] text-muted uppercase"
      >
        {label}
      </label>
      <div className="group relative">
        <Icon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-ember" />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-line bg-surface-soft py-3 ${
            trailing ? 'pr-12' : 'pr-4'
          } pl-11 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ember focus:outline-none`}
        />
        {trailing}
      </div>
    </div>
  )
}
