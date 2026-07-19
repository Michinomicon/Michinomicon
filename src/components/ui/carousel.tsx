'use client'

import * as React from 'react'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
export type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = 'horizontal', opts, setApi, plugins, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return
    }

    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext],
  )

  React.useEffect(() => {
    if (!api || !setApi) {
      return
    }

    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) {
      return
    }

    requestAnimationFrame(() => {
      onSelect(api)
    })

    // onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)

    return () => {
      api?.off('select', onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn('relative rounded-none border-r border-l', className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = 'Carousel'

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { slideSpacing?: number }
>(({ slideSpacing = 4, className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()
  const slideSpacingClassName =
    orientation === 'horizontal' ? `-ml-${slideSpacing}` : `-mt-${slideSpacing} flex-col`
  return (
    <div ref={carouselRef} className="embla__viewport overflow-hidden rounded-none">
      <div
        ref={ref}
        className={cn(slideSpacingClassName, 'embla__container flex', className)}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = 'CarouselContent'

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  { slideSize?: number; slideSpacing?: number } & React.HTMLAttributes<HTMLDivElement>
>(({ slideSize = 70, slideSpacing = 4, className, ...props }, ref) => {
  const { orientation } = useCarousel()
  const slideSpacingClassName = orientation === 'horizontal' ? `pl-${slideSpacing}` : 'pt-4'
  const slideSizeClassName = `basis-${slideSize}/100`

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        slideSizeClassName,
        'embla__slide',
        'min-w-0 shrink-0 grow-0',
        // orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        slideSpacingClassName,
        className,
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = 'CarouselItem'

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev, api } = useCarousel()
    const nodeCount = api?.slideNodes()?.length ?? 0
    const isDisabled = !canScrollPrev || nodeCount < 2
    const buttonStyle = 'large'

    if (buttonStyle === 'large') {
      return (
        <React.Fragment>
          {/* Shadow */}
          <div className={cn('absolute top-1/100 -left-11 z-9 h-98/100 w-11')}>
            <div
              className={cn(
                'relative top-1/100 left-0 h-98/100 w-full shadow-[8px_0px_20px_-15px_rgba(0,0,0,0.8)]',
              )}
            ></div>
          </div>

          {/* Button */}
          <div
            className={cn(
              'border-r border-border/10',
              'absolute z-10 h-full w-11 rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none py-2',
              '',
              orientation === 'horizontal'
                ? `-translate-y- top-0 -left-11`
                : `-top-9 left-1/2 -translate-x-1/2 rotate-90`,
            )}
          >
            <Button
              ref={ref}
              variant={'carouselControl'}
              size={size}
              className={cn(
                'h-full w-full rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-lg',
                isDisabled ? 'border-border/40 grayscale' : 'border-border',
                className,
              )}
              disabled={isDisabled}
              onClick={scrollPrev}
              {...props}
            >
              <ChevronLeft className={cn('h-8 w-8', isDisabled ? 'opacity-40' : '')} />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
        </React.Fragment>
      )
    } else {
      return (
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={cn(
            'absolute h-8 w-8 rounded-full',
            orientation === 'horizontal'
              ? `top-1/2 -left-9 -translate-y-1/2`
              : `-top-9 left-1/2 -translate-x-1/2 rotate-90`,
            isDisabled ? 'border-border/40 grayscale' : 'border-border',
            'text-border',
            className,
          )}
          disabled={isDisabled}
          onClick={scrollPrev}
          {...props}
        >
          <ChevronLeft className={cn('h-4 w-4', isDisabled ? 'opacity-40' : '')} />
          <span className="sr-only">Previous slide</span>
        </Button>
      )
    }
  },
)
CarouselPrevious.displayName = 'CarouselPrevious'

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext, api } = useCarousel()
    const nodeCount = api?.slideNodes()?.length ?? 0
    const isDisabled = !canScrollNext || nodeCount < 2
    const buttonStyle = 'large'

    if (buttonStyle === 'large') {
      return (
        <React.Fragment>
          {/* Shadow */}
          <div className={cn('absolute top-1/100 -right-11 z-9 h-98/100 w-11')}>
            <div
              className={cn(
                'relative top-1/100 right-0 h-98/100 w-full shadow-[-8px_0px_20px_-15px_rgba(0,0,0,0.8)]',
              )}
            ></div>
          </div>

          {/* Button */}
          <div
            className={cn(
              'border-l border-border/10',
              'absolute z-10 h-full w-11 rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none py-2',
              '',
              orientation === 'horizontal'
                ? `-translate-y- top-0 -right-11`
                : `-bottom-9 left-1/2 -translate-x-1/2 rotate-90`,
            )}
          >
            <Button
              ref={ref}
              variant={'carouselControl'}
              size={size}
              className={cn(
                'h-full w-full rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none',
                isDisabled ? 'border-border/40 grayscale' : 'border-border',
                className,
              )}
              disabled={isDisabled}
              onClick={scrollNext}
              {...props}
            >
              <ChevronRight className={cn('h-8 w-8', isDisabled ? 'opacity-40' : '')} />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
        </React.Fragment>
      )
    } else {
      return (
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={cn(
            'absolute h-8 w-8 rounded-full',
            orientation === 'horizontal'
              ? `top-1/2 -right-9 -translate-y-1/2`
              : `-bottom-9 left-1/2 -translate-x-1/2 rotate-90`,
            isDisabled ? 'border-border/40 grayscale' : 'border-border',
            'text-border',
            className,
          )}
          disabled={isDisabled}
          onClick={scrollNext}
          {...props}
        >
          <ChevronRight className={cn('h-4 w-4', isDisabled ? 'opacity-40' : '')} />
          <span className="sr-only">Next slide</span>
        </Button>
      )
    }
  },
)
CarouselNext.displayName = 'CarouselNext'

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
