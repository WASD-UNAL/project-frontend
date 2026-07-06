import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function RequireRole({
  role,
  children,
}: {
  role: string
  children: ReactNode
}) {
  const { isAuthenticated, profile, profileLoaded } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Esperamos a resolver el perfil antes de decidir, para no parpadear la
  // pantalla ni redirigir a un admin legítimo mientras carga su rol.
  if (!profileLoaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg">
        <span className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
          Cargando…
        </span>
      </div>
    )
  }

  if (!profile || profile.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
