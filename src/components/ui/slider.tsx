'use client'

import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { VariantProps } from 'class-variance-authority'

interface FloatingLabelSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  valueLabelFormatter?: (value: number) => React.ReactNode
  badgeVariant?: VariantProps<typeof Badge>['variant']
}

function FloatingLabelSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  valueLabelFormatter,
  onValueChange,
  badgeVariant,
  ...props
}: FloatingLabelSliderProps) {
  const [internalValues, setInternalValues] = React.useState<number[]>(() =>
    Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
  )

  const [prevValue, setPrevValue] = React.useState(value)

  if (value !== prevValue) {
    setPrevValue(value)
    if (Array.isArray(value)) {
      setInternalValues(value)
    }
  }

  const handleValueChange = (newValues: number[]) => {
    if (!Array.isArray(value)) {
      setInternalValues(newValues)
    }
    if (onValueChange) {
      onValueChange(newValues)
    }
  }

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onValueChange={handleValueChange}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-input/30 data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-input select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {internalValues.map((val, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-3 shrink-0 rounded-full border border-ring bg-input ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
        >
          <Badge
            variant={badgeVariant}
            className="pointer-events-none absolute -top-4.5 left-1/2 min-w-5 -translate-x-1/2 -translate-y-1/2 justify-center border-input px-1 text-xs shadow hover:bg-primary/90 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:hidden"
          >
            {valueLabelFormatter ? valueLabelFormatter(val) : val}
          </Badge>
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

interface AudioSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  bufferValue?: number
}

function AudioSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  bufferValue,
  ...props
}: AudioSliderProps) {
  const _values = React.useMemo(() => {
    if (Array.isArray(value)) {
      return value
    }
    if (Array.isArray(defaultValue)) {
      return defaultValue
    }
    return [min, max]
  }, [value, defaultValue, min, max])

  return (
    <SliderPrimitive.Root
      className={cn(
        'relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      max={max}
      min={min}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          'relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
        )}
        data-slot="slider-track"
      >
        <SliderPrimitive.Range
          className={cn(
            'absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
          )}
          data-slot="slider-range"
        />
        {bufferValue !== undefined && (
          <SliderPrimitive.Range
            className="absolute z-0 bg-primary/40 data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            data-slot="buffer-indicator"
            style={{
              width: `${bufferValue || 0}%`,
              transform: `translateX(-${100 - (bufferValue || 0)}%)`,
            }}
          />
        )}
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          data-slot="slider-thumb"
          key={String(index)}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-primary/30 data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider, FloatingLabelSlider, AudioSlider }
