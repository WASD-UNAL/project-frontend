export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl tracking-[0.2em] text-ink">
          Gymly
        </p>
        <p>Calle 45 #12-30, Bogotá · +57 300 123 4567</p>
        <p>© {new Date().getFullYear()} Gymly. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
