import { BadgePercent } from 'lucide-react'
import { formatPercentOff } from '../../utils/discount'

interface PromoStickerProps {
  name: string
  percentage: number
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'gap-1 px-2.5 py-1 text-[10px]',
  md: 'gap-1.5 px-3 py-1.5 text-xs',
}

const iconClasses = {
  sm: 'size-3',
  md: 'size-3.5',
}

export function PromoSticker({
  name,
  percentage,
  size = 'md',
  className = '',
}: PromoStickerProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-md bg-warn font-bold tracking-wide text-bg uppercase ${sizeClasses[size]} ${className}`}
    >
      <BadgePercent className={`shrink-0 ${iconClasses[size]}`} strokeWidth={2.5} />
      <span className="truncate">{name}</span>
      <span className="shrink-0">{formatPercentOff(percentage)}</span>
    </span>
  )
}
