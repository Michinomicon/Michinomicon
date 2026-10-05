import { cn } from '@/utilities/ui'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import { createContext, useContext } from 'react'
import { MenuTreeEntry } from '@/utilities/buildNavTree'
import { useIsMobile } from '@/hooks/use-mobile'

export type OnNavigateHandler = (event?: { preventDefault: () => void }) => void

interface DrillDownContextType {
  stack: MenuTreeEntry[]
  pushGroup: (group: MenuTreeEntry) => void
  popGroup: () => void
  navigateToIndex: (index: number) => void
  onNavigateHandler: OnNavigateHandler
}

export const DrillDownContext = createContext<DrillDownContextType | null>(null)

export type MenuItemProps = {
  item: MenuTreeEntry
  index: number
  menuDepth?: number
  isOpen?: boolean
  onNavigateHandler: OnNavigateHandler
  onOpenChange?: () => void
  onDrillDown?: (item: MenuTreeEntry) => void
}
export function MenuItem({ item, onNavigateHandler, onDrillDown }: MenuItemProps): React.ReactNode {
  const isMobile = useIsMobile()
  const context = useContext(DrillDownContext)
  const hasChildren = Boolean(item.children && item.children.length > 0)

  // Empty Category -> Disabled Item
  if (item.type === 'group' && !hasChildren) {
    return (
      <div className={cn('rounded-none border-b border-b-border/10')}>
        <Button
          disabled
          variant="clean"
          size="lg"
          className={cn(
            isMobile ? 'py-2.5' : 'py-3',
            'w-full justify-start gap-2 rounded-none pl-4 text-lg text-muted-foreground',
          )}
        >
          <span>{item.title}</span>
        </Button>
      </div>
    )
  }

  // Item without children (Navigation Link)
  if (item.type === 'item') {
    return (
      <div className={cn('rounded-none border-b border-b-border/10')}>
        <Button
          asChild
          variant="clean"
          size="lg"
          className={cn(
            isMobile ? 'py-2.5' : 'py-3',
            'group w-full justify-start rounded-none pl-4 text-lg text-foreground transition-none hover:bg-primary/10',
          )}
        >
          <Link href={item.url} passHref onNavigate={onNavigateHandler}>
            <span className={cn(isMobile ? '' : 'group-hover:underline')}>{item.title}</span>
          </Link>
        </Button>
      </div>
    )
  }

  // Item Group with children (Drill-Down Action)
  if (item.type === 'group') {
    const handleDrillDown = () => {
      if (onDrillDown) {
        onDrillDown(item)
      } else if (context?.pushGroup) {
        context.pushGroup(item)
      }
    }

    return (
      <div className={cn('rounded-none border-b border-b-border/10')}>
        <Button
          variant="clean"
          size="lg"
          onClick={handleDrillDown}
          className={cn(
            isMobile ? 'justify-between py-3' : 'justify-start py-4',
            'group flex w-full items-center rounded-none px-4 text-lg font-medium text-foreground transition-colors hover:bg-primary/10',
          )}
        >
          <span className="truncate transition-transform group-hover:translate-x-1 group-hover:scale-105">
            {item.title}
          </span>
          <ChevronRightIcon className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-3 group-hover:scale-150" />
        </Button>
      </div>
    )
  }

  return null
}
