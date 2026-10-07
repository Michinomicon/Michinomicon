import { MenuTreeEntry } from '@/utilities/buildNavTree'
import { DrillDownContext, MenuItem, OnNavigateHandler } from './MenuItem'
import { useState } from 'react'
import { MenuBreadcrumbs } from './MenuBreadcrumbs'
import { Button } from '../ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useIsMobile } from '@/hooks/use-mobile'

export const DEFAULT_TOP_LEVEL_MENU_LABEL = 'Menu'

export interface MenuLevelProps {
  items: MenuTreeEntry[]
  level?: number
  rootLabel?: string
  onNavigateHandler: OnNavigateHandler
}
export const MenuLevel: React.FC<MenuLevelProps> = ({ items, rootLabel, onNavigateHandler }) => {
  const isMobile = useIsMobile()
  const [stack, setStack] = useState<MenuTreeEntry[]>([])
  const [direction, setDirection] = useState<'forward' | 'backward' | 'none'>('none')

  const pushGroup = (group: MenuTreeEntry) => {
    setDirection('forward')
    setStack((prev) => [...prev, group])
  }

  const popGroup = () => {
    if (stack.length === 0) return
    setDirection('backward')
    setStack((prev) => prev.slice(0, -1))
  }

  const navigateToIndex = (index: number) => {
    setDirection('backward')
    if (index === -1) {
      setStack([])
    } else {
      setStack((prev) => prev.slice(0, index + 1))
    }
  }

  // Active item list
  const currentItems = stack.length > 0 ? stack[stack.length - 1].children || [] : items
  const currentDepth = stack.length

  // forces state/animation re-trigger on view updates
  const transitionKey = stack.map((item) => item.id).join('-') || 'root'

  return (
    <DrillDownContext.Provider
      value={{
        stack,
        pushGroup,
        popGroup,
        navigateToIndex,
        onNavigateHandler,
      }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden">
        {/* Top Breadcrumb Path */}
        <MenuBreadcrumbs stack={stack} navigateToIndex={navigateToIndex} rootLabel={rootLabel} />

        {/* Sliding View Container */}
        <div
          key={transitionKey}
          className={cn(
            isMobile ? 'mt-6' : '',
            'flex h-full w-full grow flex-col transition-all duration-200 ease-in-out',
            direction === 'forward' && 'duration-200 animate-in fade-in-50 slide-in-from-right-6',
            direction === 'backward' && 'duration-200 animate-in fade-in-50 slide-in-from-left-6',
          )}
        >
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => {
              const itemKey = `${item.id}-${currentDepth}-${index}`
              return (
                <MenuItem
                  key={itemKey}
                  index={index}
                  item={item}
                  menuDepth={currentDepth}
                  onNavigateHandler={onNavigateHandler}
                  onDrillDown={pushGroup}
                />
              )
            })
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No items available in this section.
            </div>
          )}
        </div>

        {/* Back (tone level) Button */}
        {stack.length > 0 && (
          <div
            className={cn('flex w-full flex-col', isMobile ? 'justify-end p-2' : 'justify-start')}
          >
            <Button
              variant="clean"
              size="lg"
              onClick={popGroup}
              className={cn(
                'group w-fit gap-2 px-2 text-primary',
                isMobile ? 'p-2 text-right' : '',
              )}
            >
              <ChevronLeftIcon className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1 group-hover:scale-150" />
              <div className="transition-transform group-hover:scale-105">
                Back to {stack.length > 1 ? stack[stack.length - 2].title : rootLabel}
              </div>
            </Button>
          </div>
        )}
      </div>
    </DrillDownContext.Provider>
  )
}
