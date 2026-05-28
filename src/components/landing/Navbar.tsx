const navItems = [
  { label: 'HOME', href: '#home' },
  { label: 'PROGRAMS', href: '#programs' },
  { label: 'PEAK HOURS', href: '#peak-hours' },
  { label: 'PRICING', href: '#pricing' },
  { label: 'CONTACT', href: '#contact' },
]

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          className="text-lg font-black tracking-[0.35em] text-zinc-50 transition hover:text-lime-300 sm:text-xl"
        >
          GYMLY
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium tracking-[0.22em] text-zinc-300 transition hover:text-lime-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/login"
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-zinc-100 transition hover:border-lime-300/70 hover:text-lime-300 sm:px-5 sm:text-sm"
          >
            LOGIN
          </a>
          <a
            href="#join-now"
            className="rounded-full bg-lime-300 px-4 py-2 text-xs font-extrabold tracking-[0.24em] text-zinc-950 transition hover:bg-lime-200 sm:px-5 sm:text-sm"
          >
            JOIN NOW
          </a>
        </div>
      </div>
    </header>
  )
}

export default Navbar
