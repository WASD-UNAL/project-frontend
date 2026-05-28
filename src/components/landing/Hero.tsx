function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-zinc-950"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(9, 9, 11, 0.12), rgba(9, 9, 11, 0.86)), url('/background.png')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,255,0,0.18),_transparent_28%),radial-gradient(circle_at_right,_rgba(255,255,255,0.08),_transparent_22%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-88px)] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <span className="inline-flex rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-[0.7rem] font-semibold tracking-[0.28em] text-lime-300">
            ELITE TRAINING SPACE
          </span>

          <h1 className="mt-8 max-w-5xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Grind without <span className="text-lime-300">Limits</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            Entrena con una experiencia premium, planes claros y espacios diseñados para
            llevar tu disciplina al siguiente nivel.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#programs"
              className="inline-flex items-center justify-center rounded-full bg-lime-300 px-7 py-4 text-sm font-extrabold tracking-[0.24em] text-zinc-950 transition hover:bg-lime-200"
            >
              SEE PROGRAMS
            </a>
            <a
              href="#join-now"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-4 text-sm font-semibold tracking-[0.24em] text-white transition hover:border-lime-300/70 hover:text-lime-300"
            >
              JOIN NOW
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
