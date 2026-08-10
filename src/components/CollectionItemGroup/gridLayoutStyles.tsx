import { cn } from '@/utilities/ui'
import { cva } from 'class-variance-authority'

export const GridItemVariant = cva('', {
  variants: {
    layout: {
      vertical: '',
      horizontal: '',
    },
    height: {
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
      className: '[&_.collection-grid-item]:w-[calc(25%-(--spacing(2)))]',
    },
    {
      layout: 'vertical',
      width: 'md',
      className: '[&_.collection-grid-item]:w-[calc(33%-(--spacing(2)))]',
    },
    {
      layout: 'vertical',
      width: 'lg',
      className: '[&_.collection-grid-item]:w-[calc(50%-(--spacing(2)))]',
    },
    {
      layout: 'horizontal',
      width: 'sm',
      className: cn('[&_.collection-grid-item]:w-[calc(50%-(--spacing(2)))]', ''),
    },
    {
      layout: 'horizontal',
      width: 'md',
      className: cn('[&_.collection-grid-item]:w-[calc(50%-(--spacing(2)))]', ''),
    },
    {
      layout: 'horizontal',
      width: 'lg',
      className: cn('[&_.collection-grid-item]:w-[calc(100%-(--spacing(2)))]', ''),
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

export const GridVariant = cva('max-w-full', {
  variants: {
    layout: {
      vertical: '',
      horizontal: '',
    },
    height: {
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
      className: GridItemVariant({ layout: 'horizontal', height: 'sm', width: 'sm' }),
    },
    {
      layout: 'horizontal',
      height: 'sm',
      width: 'md',
      className: GridItemVariant({ layout: 'horizontal', height: 'sm', width: 'md' }),
    },
    {
      layout: 'horizontal',
      height: 'sm',
      width: 'lg',
      className: GridItemVariant({ layout: 'horizontal', height: 'sm', width: 'lg' }),
    },
    {
      layout: 'horizontal',
      height: 'md',
      width: 'sm',
      className: GridItemVariant({ layout: 'horizontal', height: 'md', width: 'sm' }),
    },
    {
      layout: 'horizontal',
      height: 'md',
      width: 'md',
      className: GridItemVariant({ layout: 'horizontal', height: 'md', width: 'md' }),
    },
    {
      layout: 'horizontal',
      height: 'md',
      width: 'lg',
      className: GridItemVariant({ layout: 'horizontal', height: 'md', width: 'lg' }),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      width: 'sm',
      className: GridItemVariant({ layout: 'horizontal', height: 'lg', width: 'sm' }),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      width: 'md',
      className: GridItemVariant({ layout: 'horizontal', height: 'lg', width: 'md' }),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      width: 'lg',
      className: GridItemVariant({ layout: 'horizontal', height: 'lg', width: 'lg' }),
    },
    {
      layout: 'vertical',
      height: 'sm',
      width: 'sm',
      className: GridItemVariant({ layout: 'vertical', height: 'sm', width: 'sm' }),
    },
    {
      layout: 'vertical',
      height: 'sm',
      width: 'md',
      className: GridItemVariant({ layout: 'vertical', height: 'sm', width: 'md' }),
    },
    {
      layout: 'vertical',
      height: 'sm',
      width: 'lg',
      className: GridItemVariant({ layout: 'vertical', height: 'sm', width: 'lg' }),
    },
    {
      layout: 'vertical',
      height: 'md',
      width: 'sm',
      className: GridItemVariant({ layout: 'vertical', height: 'md', width: 'sm' }),
    },
    {
      layout: 'vertical',
      height: 'md',
      width: 'md',
      className: GridItemVariant({ layout: 'vertical', height: 'md', width: 'md' }),
    },
    {
      layout: 'vertical',
      height: 'md',
      width: 'lg',
      className: GridItemVariant({ layout: 'vertical', height: 'md', width: 'lg' }),
    },
    {
      layout: 'vertical',
      height: 'lg',
      width: 'sm',
      className: GridItemVariant({ layout: 'vertical', height: 'lg', width: 'sm' }),
    },
    {
      layout: 'vertical',
      height: 'lg',
      width: 'md',
      className: GridItemVariant({ layout: 'vertical', height: 'lg', width: 'md' }),
    },
    {
      layout: 'vertical',
      height: 'lg',
      width: 'lg',
      className: GridItemVariant({ layout: 'vertical', height: 'lg', width: 'lg' }),
    },
  ],
})
