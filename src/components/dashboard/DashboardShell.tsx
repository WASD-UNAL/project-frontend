import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LogOut,
  User,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export type DashboardSection = 'payments' | 'attendance' | 'profile'

interface NavItem {
  key?: DashboardSection
  label: string
  icon: typeof CreditCard
  soon?: boolean
}

const navItems: NavItem[] = [
  { key: 'payments', label: 'Pagos', icon: CreditCard },
  { key: 'attendance', label: 'Asistencias', icon: CalendarCheck },
  { key: 'profile', label: 'Perfil', icon: User },
]

interface DashboardShellProps {
  active: DashboardSection
  onSelect: (section: DashboardSection) => void
  children: ReactNode
}

function NavList({
  active,
  onSelect,
  compact = false,
}: {
  active: DashboardSection
  onSelect: (section: DashboardSection) => void
  compact?: boolean
}) {
  return (
    <nav className={compact ? 'flex gap-1' : 'flex flex-col gap-1'}>
      {navItems.map(({ key, label, icon: Icon, soon }) => {
        const isActive = !soon && key === active
        return (
          <button
            key={label}
            type="button"
            disabled={soon}
            onClick={() => key && onSelect(key)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-surface-soft text-ink'
                : soon
                  ? 'cursor-not-allowed text-muted/50'
                  : 'text-muted hover:text-ink'
            } ${compact ? 'flex-1 justify-center' : ''}`}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            {!compact && <span>{label}</span>}
            {!compact && soon && (
              <span className="ml-auto font-mono text-[10px] tracking-wide text-muted/60 uppercase">
                Pronto
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

export function DashboardShell({ active, onSelect, children }: DashboardShellProps) {
  const { logout, profile } = useAuth()
  const memberName = profile ? `${profile.name} ${profile.lastname}` : null

  const initial = memberName?.charAt(0) ?? '?'

  return (
    <div className="min-h-[100dvh] bg-bg lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:flex lg:flex-col">
        <Link
          to="/"
          className="flex items-center gap-2 border-b border-line px-6 py-5 transition-colors hover:bg-surface-soft"
        >
          <Dumbbell className="size-6 text-ember" strokeWidth={2} />
          <span className="font-display text-2xl tracking-[0.2em] text-ink">
            Gymly
          </span>
        </Link>

        <div className="flex-1 px-4 py-6">
          <NavList active={active} onSelect={onSelect} />
        </div>

        <div className="border-t border-line px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-ember-soft font-display text-lg text-ember">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">
                {memberName ?? 'Cargando...'}
              </p>
              <p className="text-xs text-muted">Socio</p>
            </div>
          </div>
          <Link
            to="/"
            onClick={logout}
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-danger"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            Cerrar sesión
          </Link>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <Dumbbell className="size-5 text-ember" strokeWidth={2} />
          <span className="font-display text-xl tracking-[0.2em] text-ink">
            Gymly
          </span>
        </Link>
        <Link
          to="/"
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-danger"
        >
          <LogOut className="size-4" strokeWidth={1.75} />
          Salir
        </Link>
      </header>
      <div className="border-b border-line bg-surface px-2 py-2 lg:hidden">
        <NavList active={active} onSelect={onSelect} compact />
      </div>

      <main className="px-4 py-8 md:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  )
}
