import { MenuTreeEntry } from '@/utilities/buildNavTree'
import { Button } from '../ui/button'
import { cn } from '@/utilities/ui'
import React from 'react'
import { ChevronRightIcon } from 'lucide-react'
import { DEFAULT_TOP_LEVEL_MENU_LABEL } from './MenuLevel'

export interface MenuBreadcrumbsProps {
  stack: MenuTreeEntry[]
  navigateToIndex: (index: number) => void
  rootLabel?: string
}

export function MenuBreadcrumbs({
  stack,
  navigateToIndex,
  rootLabel = DEFAULT_TOP_LEVEL_MENU_LABEL,
}: MenuBreadcrumbsProps): React.ReactNode {
  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-border/10 bg-background/95 px-3 py-2 text-sm text-muted-foreground backdrop-blur"
    >
      <Button
        variant="clean"
        size="sm"
        onClick={() => navigateToIndex(-1)}
        className={cn(
          'h-auto p-1 text-sm',
          stack.length === 0 ? 'cursor-default' : 'text-muted-foreground',
        )}
      >
        <span>{rootLabel}</span>
      </Button>

      {stack.map((group, idx) => {
        const isLast = idx === stack.length - 1

        return (
          <React.Fragment key={`${group.id}-${idx}`}>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <Button
              variant="clean"
              size="sm"
              onClick={() => navigateToIndex(idx)}
              disabled={isLast}
              className={cn(
                'h-auto max-w-30 truncate p-1 text-sm',
                isLast
                  ? 'cursor-default text-primary disabled:opacity-100'
                  : 'text-muted-foreground',
              )}
            >
              {group.title}
            </Button>
          </React.Fragment>
        )
      })}
    </nav>
  )
}
