import type { ReactNode } from 'react'

interface RivetPlateProps {
  children: ReactNode
  className?: string
}

export function RivetPlate({ children, className = '' }: RivetPlateProps) {
  return (
    <div
      className={`relative rounded-2xl border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    >
      <span className="rivet left-3 top-3" />
      <span className="rivet right-3 top-3" />
      <span className="rivet bottom-3 left-3" />
      <span className="rivet right-3 bottom-3" />
      {children}
    </div>
  )
}
