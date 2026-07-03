import { Link } from 'react-router-dom'

const links = [
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#planes', label: 'Planes' },
  { href: '#horarios', label: 'Horarios' },
]

export function Navbar() {
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

        <Link
          to="/dashboard"
          className="rounded-full border border-ember/50 px-5 py-2 text-sm font-semibold text-ember transition-colors hover:bg-ember hover:text-bg"
        >
          Iniciar sesión
        </Link>
      </div>
    </header>
  )
}
