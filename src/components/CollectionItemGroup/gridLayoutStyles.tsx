import { cn } from '@/utilities/ui'
import { cva } from 'class-variance-authority'

export const GridItemVariant = cva('overflow-hidden', {
  variants: {
    layout: {
      vertical:
        '[&_.item-image-wrapper]:w-[calc(100%-0px))] [&_.item-title]:justify-center [&_.item-text-container]:px-2 [&_.item-text-container]:pb-2 [&_.item-avatars]:px-2',
      horizontal: '[&_.item-text-container]:pl-0',
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
    // VERTICAL LAYOUT STYLES
    {
      layout: 'vertical',
      height: 'sm',
      className: cn('', '[&_.item-content]:h-50'),
    },
    {
      layout: 'vertical',
      height: 'md',
      className: cn('', '[&_.item-content]:h-80'),
    },
    {
      layout: 'vertical',
      height: 'lg',
      className: cn('', '[&_.item-content]:h-100'),
    },
    {
      layout: 'vertical',
      width: 'sm',
      className: cn('[&_.collection-grid-item]:w-[calc(25%-(--spacing(2)))]'),
    },
    {
      layout: 'vertical',
      width: 'md',
      className: cn('[&_.collection-grid-item]:w-[calc(33%-(--spacing(2)))]'),
    },
    {
      layout: 'vertical',
      width: 'lg',
      className: cn('[&_.collection-grid-item]:w-[calc(50%-(--spacing(2)))]'),
    },

    // HORIZONTAL LAYOUT STYLES
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
        '[&_.item-content]:h-30',
        '[&_.item-image-container]:w-30 [&_.item-image-wrapper]:w-30 [&_.item-image-wrapper]:h-30',
      ),
    },
    {
      layout: 'horizontal',
      height: 'md',
      className: cn(
        '[&_.item-content]:h-60',
        '[&_.item-image-container]:w-60 [&_.item-image-wrapper]:w-60 [&_.item-image-wrapper]:h-60',
      ),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      className: cn(
        '[&_.item-content]:h-100',
        '[&_.item-image-container]:w-100 [&_.item-image-wrapper]:w-100 [&_.item-image-wrapper]:h-100',
      ),
    },
  ],
})

export const GridVariant = cva('max-w-full overflow-hidden w-full justify-center gap-4', {
  variants: {
    layout: {
      vertical: 'items-start',
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
