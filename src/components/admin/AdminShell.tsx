import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export type AdminSection = 'overview' | 'statistics' | 'members' | 'payments'

interface NavItem {
  key: AdminSection
  label: string
  icon: typeof CreditCard
}

const navItems: NavItem[] = [
  { key: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { key: 'statistics', label: 'Estadística', icon: BarChart3 },
  { key: 'members', label: 'Socios', icon: Users },
  { key: 'payments', label: 'Pagos', icon: CreditCard },
]

interface AdminShellProps {
  active: AdminSection
  onSelect: (section: AdminSection) => void
  children: ReactNode
}

function NavList({
  active,
  onSelect,
  compact = false,
}: {
  active: AdminSection
  onSelect: (section: AdminSection) => void
  compact?: boolean
}) {
  return (
    <nav className={compact ? 'flex gap-1' : 'flex flex-col gap-1'}>
      {navItems.map(({ key, label, icon: Icon }) => {
        const isActive = key === active
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-surface-soft text-ink'
                : 'text-muted hover:text-ink'
            } ${compact ? 'flex-1 justify-center' : ''}`}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            {!compact && <span>{label}</span>}
          </button>
        )
      })}
    </nav>
  )
}

export function AdminShell({ active, onSelect, children }: AdminShellProps) {
  const { logout, profile } = useAuth()
  const adminName = profile ? `${profile.name} ${profile.lastname}` : null

  const initial = adminName?.charAt(0) ?? 'A'

  return (
    <div className="min-h-[100dvh] bg-bg lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="flex items-center gap-2 border-b border-line px-6 py-5">
          <Dumbbell className="size-6 text-ember" strokeWidth={2} />
          <span className="font-display text-2xl tracking-[0.2em] text-ink">
            Gymly
          </span>
          <span className="ml-1 rounded-full border border-ember/40 bg-ember-soft px-2 py-0.5 font-mono text-[10px] tracking-wide text-ember uppercase">
            Admin
          </span>
        </div>

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
                {adminName ?? 'Administrador'}
              </p>
              <p className="text-xs text-muted">Administrador</p>
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
        <div className="flex items-center gap-2">
          <Dumbbell className="size-5 text-ember" strokeWidth={2} />
          <span className="font-display text-xl tracking-[0.2em] text-ink">
            Gymly
          </span>
          <span className="rounded-full border border-ember/40 bg-ember-soft px-2 py-0.5 font-mono text-[10px] tracking-wide text-ember uppercase">
            Admin
          </span>
        </div>
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
