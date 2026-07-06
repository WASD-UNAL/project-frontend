import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAuthFlow } from '../../hooks/useAuthFlow'

const links = [
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#planes', label: 'Planes' },
  { href: '#horarios', label: 'Horarios' },
  { href: '#afluencia', label: 'Afluencia' },
]

export function Navbar() {
  const { isAuthenticated } = useAuth()
  const { openAuth } = useAuthFlow()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="font-display text-2xl tracking-[0.2em] text-ink"
        >
          Gymly
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() =>
            isAuthenticated ? navigate('/dashboard') : openAuth('login')
          }
          className="rounded-full border border-ember/50 px-5 py-2 text-sm font-semibold text-ember transition-colors hover:bg-ember hover:text-bg"
        >
          {isAuthenticated ? 'Mi panel' : 'Iniciar sesión'}
        </button>
      </div>
    </header>
  )
}
