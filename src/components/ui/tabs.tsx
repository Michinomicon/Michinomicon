'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

type TabsContextType = {
  direction: 'left' | 'right'
  setDirection: (dir: 'left' | 'right') => void
  lastIndex: number
  setLastIndex: (index: number) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [direction, setDirection] = React.useState<'left' | 'right'>('right')
  const [lastIndex, setLastIndex] = React.useState(0)
  return (
    <TabsContext.Provider value={{ direction, setDirection, lastIndex, setLastIndex }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
        {...props}
      />
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  onFocus,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const context = React.useContext(TabsContext)

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (context) {
      const parent = e.currentTarget.parentElement
      if (parent) {
        const triggers = Array.from(parent.children)
        const currentIndex = triggers.indexOf(e.currentTarget)

        if (currentIndex > context.lastIndex) {
          context.setDirection('right')
        } else if (currentIndex < context.lastIndex) {
          context.setDirection('left')
        }
        context.setLastIndex(currentIndex)
      }
    }
    if (onFocus) onFocus(e)
  }

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      onFocus={handleFocus}
      className={cn(
        'text-sm font-medium whitespace-nowrap text-foreground/60',
        "relative inline-flex h-[calc(100%-1px)] min-w-max flex-1 shrink items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        'data-active:grow data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground',
        'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-1.25 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const context = React.useContext(TabsContext)
  const direction = context?.direction ?? 'right'
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 text-sm transition-all outline-none',
        'data-[state=active]:animate-fadeIn data-[state=active]:duration-300 data-[state=active]:ease-in-out data-[state=active]:fade-in-5',
        direction === 'right'
          ? 'data-[state=active]:slide-in-from-right-8'
          : 'data-[state=active]:slide-in-from-left-8',
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
