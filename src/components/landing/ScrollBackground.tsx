import { useEffect, useRef } from 'react'

/**
 * Fondo global fijo con la pesa Gymly.
 * En el Hero se ve al 90% de opacidad; al hacer scroll pierde
 * opacidad y gana un zoom suave hasta casi desvanecerse.
 */
export function ScrollBackground() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    let raf = 0

    const update = () => {
      raf = 0
      const progress = Math.min(
        window.scrollY / (window.innerHeight * 1.6),
        1,
      )
      layer.style.opacity = String(0.9 - progress * 0.78)
      layer.style.transform = `scale(${1 + progress * 0.18})`
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div ref={layerRef} className="absolute inset-0 will-change-transform">
        <img
          src="/gymly-dumbbell.png"
          alt=""
          className="h-full w-full object-cover"
        />
        {/* Scrim para que el texto del Hero contraste sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/45 to-bg/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg/80" />
      </div>
    </div>
  )
}
