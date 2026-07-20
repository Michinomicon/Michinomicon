import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
        status: '',
        caption: `bg-transparent text-white [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:border-border underline-offset-4 [a&]:hover:underline`,
      },
      status: {
        planned: '',
        active: '',
        completed: '',
        archived: '',
        inactive: '',
      },
    },
    compoundVariants: [
      {
        variant: 'status',
        status: 'planned',
        className:
          'bg-purple-50 text-purple-700 [a&]:hover:bg-purple-50/90 dark:bg-purple-950 dark:text-purple-300',
      },
      {
        variant: 'status',
        status: 'active',
        className:
          'bg-green-700 text-green-50 [a&]:hover:bg-green-700/90 dark:bg-green-850 dark:text-green-100',
      },
      {
        variant: 'status',
        status: 'completed',
        className: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
      },
      {
        variant: 'status',
        status: 'archived',
        className:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
      {
        variant: 'status',
        status: 'inactive',
        className: 'bg-muted/50 text-foreground-muted [a&]:hover:bg-muted/70',
      },
    ],
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

export type BadgeStatus = string & VariantProps<typeof badgeVariants>['status']

function Badge({ className, variant = 'default', status, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-status={status}
      className={cn(badgeVariants({ variant, status }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
