import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AvailablePlan } from '../../types/membership'
import { getHighlightedPlanId, sortPlansByPrice } from '../../utils/planHighlight'
import { PricingCard } from './PricingCard'

interface PricingCarouselProps {
  plans: AvailablePlan[]
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function PricingCarousel({ plans }: PricingCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    duration: prefersReducedMotion ? 0 : 22,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const sortedPlans = sortPlansByPrice(plans)
  const highlightedId = getHighlightedPlanId(plans)
  const hasPagination = scrollSnaps.length > 1

  return (
    <div>
      <div className="overflow-hidden pt-6 pb-8" ref={emblaRef}>
        <div className="-ml-6 flex">
          {sortedPlans.map((plan, index) => (
            <div
              key={plan.id}
              className="animate-card-rise min-w-0 shrink-0 grow-0 basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
              style={{ '--rise-delay': `${index * 90}ms` } as CSSProperties}
            >
              <PricingCard plan={plan} highlighted={plan.id === highlightedId} />
            </div>
          ))}
        </div>
      </div>

      {hasPagination && (
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Plan anterior"
            className="flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-steel disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-5" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2.5">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Ir al plan ${index + 1}`}
                aria-current={index === selectedIndex}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'w-6 bg-ember'
                    : 'w-2 bg-line hover:bg-steel'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Siguiente plan"
            className="flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-steel disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-5" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  )
}
