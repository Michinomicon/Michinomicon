import { cn } from '@/utilities/ui'
import { cva } from 'class-variance-authority'
import { BaseCollectionItemCardVariant } from '.'

export const CarouselItemVariant = cva<BaseCollectionItemCardVariant>('', {
  variants: {
    layout: {
      vertical: '',
      horizontal: '',
    },
    height: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
    },
    width: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    {
      layout: 'vertical',
      height: 'sm',
      className: cn(
        '[&_.item-image-wrapper]:h-50 [&_.item-image-wrapper]:w-50',
        '[&_.item-text-container]:h-50',
      ),
    },
    {
      layout: 'vertical',
      height: 'md',
      className: cn(
        '[&_.item-image-wrapper]:h-60 [&_.item-image-wrapper]:w-60',
        '[&_.item-text-container]:h-80',
      ),
    },
    {
      layout: 'vertical',
      height: 'lg',
      className: cn(
        '[&_.item-image-wrapper]:h-80 [&_.item-image-wrapper]:w-80',
        '[&_.item-text-container]:h-100',
      ),
    },
    {
      layout: 'vertical',
      width: 'sm',
      className: '[&_.carousel-item]:w-3/12',
    },
    {
      layout: 'vertical',
      width: 'md',
      className: '[&_.carousel-item]:w-5/12',
    },
    {
      layout: 'vertical',
      width: 'lg',
      className: '[&_.carousel-item]:w-7/12',
    },
    {
      layout: 'horizontal',
      width: 'sm',
      className: cn('[&_.carousel-item]:w-8/12 ', ' '),
    },
    {
      layout: 'horizontal',
      width: 'md',
      className: cn('[&_.carousel-item]:w-10/12', ''),
    },
    {
      layout: 'horizontal',
      width: 'lg',
      className: cn('[&_.carousel-item]:w-12/12', ''),
    },
    {
      layout: 'horizontal',
      height: 'sm',
      className: cn(
        '[&_.item-text-container]:h-50',
        '[&_.item-image-container]:w-50 [&_.item-image-wrapper]:w-50 [&_.item-image-wrapper]:h-50',
      ),
    },
    {
      layout: 'horizontal',
      height: 'md',
      className: cn(
        '[&_.item-text-container]:h-80',
        '[&_.item-image-container]:w-60 [&_.item-image-wrapper]:w-60 [&_.item-image-wrapper]:h-60',
      ),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      className: cn(
        '[&_.item-text-container]:h-100',
        '[&_.item-image-container]:w-80 [&_.item-image-wrapper]:w-80 [&_.item-image-wrapper]:h-80',
      ),
    },
  ],
})

export const CarouselVariant = cva<BaseCollectionItemCardVariant>('max-w-11/12', {
  variants: {
    layout: {
      vertical: '',
      horizontal: '',
    },
    height: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
    },
    width: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    {
      layout: 'horizontal',
      height: 'sm',
      width: 'sm',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'sm', width: 'sm' }),
    },
    {
      layout: 'horizontal',
      height: 'sm',
      width: 'md',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'sm', width: 'md' }),
    },
    {
      layout: 'horizontal',
      height: 'sm',
      width: 'lg',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'sm', width: 'lg' }),
    },
    {
      layout: 'horizontal',
      height: 'md',
      width: 'sm',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'md', width: 'sm' }),
    },
    {
      layout: 'horizontal',
      height: 'md',
      width: 'md',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'md', width: 'md' }),
    },
    {
      layout: 'horizontal',
      height: 'md',
      width: 'lg',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'md', width: 'lg' }),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      width: 'sm',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'lg', width: 'sm' }),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      width: 'md',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'lg', width: 'md' }),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      width: 'lg',
      className: CarouselItemVariant({ layout: 'horizontal', height: 'lg', width: 'lg' }),
    },
    {
      layout: 'vertical',
      height: 'sm',
      width: 'sm',
      className: CarouselItemVariant({ layout: 'vertical', height: 'sm', width: 'sm' }),
    },
    {
      layout: 'vertical',
      height: 'sm',
      width: 'md',
      className: CarouselItemVariant({ layout: 'vertical', height: 'sm', width: 'md' }),
    },
    {
      layout: 'vertical',
      height: 'sm',
      width: 'lg',
      className: CarouselItemVariant({ layout: 'vertical', height: 'sm', width: 'lg' }),
    },
    {
      layout: 'vertical',
      height: 'md',
      width: 'sm',
      className: CarouselItemVariant({ layout: 'vertical', height: 'md', width: 'sm' }),
    },
    {
      layout: 'vertical',
      height: 'md',
      width: 'md',
      className: CarouselItemVariant({ layout: 'vertical', height: 'md', width: 'md' }),
    },
    {
      layout: 'vertical',
      height: 'md',
      width: 'lg',
      className: CarouselItemVariant({ layout: 'vertical', height: 'md', width: 'lg' }),
    },
    {
      layout: 'vertical',
      height: 'lg',
      width: 'sm',
      className: CarouselItemVariant({ layout: 'vertical', height: 'lg', width: 'sm' }),
    },
    {
      layout: 'vertical',
      height: 'lg',
      width: 'md',
      className: CarouselItemVariant({ layout: 'vertical', height: 'lg', width: 'md' }),
    },
    {
      layout: 'vertical',
      height: 'lg',
      width: 'lg',
      className: CarouselItemVariant({ layout: 'vertical', height: 'lg', width: 'lg' }),
    },
  ],
})
