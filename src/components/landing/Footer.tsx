function Footer() {
  return (
    <footer id="contact" className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-zinc-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-lg font-black tracking-[0.32em] text-white">GYMLY</p>
          <p className="mt-2 max-w-xl leading-7">
            Un espacio digital para gimnasios pequeños, entrenadores y clientes con foco en
            rendimiento.
          </p>
        </div>

        <div
          id="join-now"
          className="rounded-2xl border border-lime-300/20 bg-lime-300/10 px-5 py-4 text-zinc-100"
        >
          <p className="text-xs font-semibold tracking-[0.28em] text-lime-300">READY TO START</p>
          <p className="mt-2 text-sm">Administra tu gimnasio con una experiencia moderna y clara.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
