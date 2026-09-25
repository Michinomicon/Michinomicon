import { AppMainLogo } from '@/components/AppMainLogo'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { MenuTreeEntry } from '@/utilities/buildNavTree'
import { Button } from '@/components/ui/button'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  House,
  Icon,
  Menu,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { ComponentPropsWithoutRef, createContext, useContext, useState } from 'react'
import React from 'react'
import {
  MobileColorThemeFieldGroup,
  MobileThemeModeFieldGroup,
  MobileWallpaperSettingsFieldGroup,
} from '@/providers/Theme/color-theme-toggle'
import { ScrollArea } from '@/components/ui/scroll-area'

export type MobileNavMenuProps = {
  appTitle?: string
  menuItems: MenuTreeEntry[]
  twitchStatusSlot?: React.ReactNode
  triggerButtonProps?: ComponentPropsWithoutRef<typeof Button>
  triggerButtonIconProps?: ComponentPropsWithoutRef<typeof Icon>
}

export type MenuItemProps = {
  item: MenuTreeEntry
  index: number
  menuDepth?: number
  isOpen?: boolean
  onNavigateHandler: OnNavigateHandler
  onOpenChange?: () => void
  onDrillDown?: (item: MenuTreeEntry) => void
}

export interface MenuLevelProps {
  items: MenuTreeEntry[]
  level?: number
  onNavigateHandler: OnNavigateHandler
}

interface DrillDownContextType {
  stack: MenuTreeEntry[]
  pushGroup: (group: MenuTreeEntry) => void
  popGroup: () => void
  navigateToIndex: (index: number) => void
  onNavigateHandler: OnNavigateHandler
}

type OnNavigateHandler = (event?: { preventDefault: () => void }) => void

const DrillDownContext = createContext<DrillDownContextType | null>(null)

const DEFAULT_TOP_LEVEL_MENU_LABEL = 'Menu'

interface MenuBreadcrumbsProps {
  stack: MenuTreeEntry[]
  navigateToIndex: (index: number) => void
  rootLabel?: string
}

function MenuBreadcrumbs({
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

export function MenuItem({ item, onNavigateHandler, onDrillDown }: MenuItemProps): React.ReactNode {
  const context = useContext(DrillDownContext)
  const hasChildren = Boolean(item.children && item.children.length > 0)

  // Empty Category -> Disabled Item
  if (item.type === 'group' && !hasChildren) {
    return (
      <div className={cn('rounded-none border-b border-b-border/10')}>
        <Button
          disabled
          variant="ghost"
          size="lg"
          className={cn(
            'w-full justify-start gap-2 rounded-none py-2 pl-4 text-lg text-muted-foreground',
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
          variant="ghost"
          size="lg"
          className={cn(
            'group w-full justify-start rounded-none py-2.5 pl-4 text-lg text-foreground transition-none',
          )}
        >
          <Link href={item.url} passHref onNavigate={onNavigateHandler}>
            {item.title}
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
          variant="ghost"
          size="lg"
          onClick={handleDrillDown}
          className={cn(
            'group flex w-full items-center justify-between rounded-none px-4 py-3 text-lg font-medium text-foreground transition-colors',
          )}
        >
          <span className="truncate">{item.title}</span>
          <ChevronRightIcon className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    )
  }

  return null
}

export const MenuLevel: React.FC<MenuLevelProps> = ({ items, onNavigateHandler }) => {
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

  // Active item list based on the drill-down stack
  const currentItems = stack.length > 0 ? stack[stack.length - 1].children || [] : items
  const currentDepth = stack.length

  // Transition key forces state/animation re-trigger on view updates
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
        <MenuBreadcrumbs
          stack={stack}
          navigateToIndex={navigateToIndex}
          rootLabel={DEFAULT_TOP_LEVEL_MENU_LABEL}
        />

        {/* Sliding View Container */}
        <div
          key={transitionKey}
          className={cn(
            'mt-6 flex h-full w-full grow flex-col transition-all duration-200 ease-in-out',
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

        {/* Bottom Back Button */}
        {stack.length > 0 && (
          <div className="p-2 text-right">
            <Button
              variant="ghost"
              size="lg"
              onClick={popGroup}
              className="w-fit gap-2 px-2 text-primary"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              <span>
                Back to{' '}
                {stack.length > 1 ? stack[stack.length - 2].title : DEFAULT_TOP_LEVEL_MENU_LABEL}
              </span>
            </Button>
          </div>
        )}
      </div>
    </DrillDownContext.Provider>
  )
}

export default function MobileNavMenu({
  menuItems,
  appTitle,
  triggerButtonProps = {},
  ...props
}: React.ComponentPropsWithoutRef<typeof Drawer> & MobileNavMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const {
    variant: variantFromProps,
    size: sizeFromProps,
    ...restTriggerButtonProps
  } = triggerButtonProps
  const triggerButtonVariant = variantFromProps ?? 'ghost'
  const triggerButtonSize = sizeFromProps ?? 'lg'

  const onNavigateHandler: OnNavigateHandler = () => {
    console.log(`closing mobile nav menu after link navigation`)
    setIsOpen(false)
  }

  return (
    <Drawer direction={'bottom'} {...props} open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant={triggerButtonVariant}
          size={triggerButtonSize}
          className="group items-center justify-center text-accent-foreground transition-colors"
          aria-label={`${isOpen ? 'Close Menu' : 'Open Menu'}`}
          {...restTriggerButtonProps}
        >
          <Menu className="transition-transform" size={48} />
          <span className="">Menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className={cn(MobileMenuDrawerContentClassName)}>
        <DrawerHeader className={cn('rounded-none')}>
          <DrawerTitle className="py-0">
            <AppMainLogo
              variant={'default'}
              text={appTitle}
              className={'mx-auto items-center justify-center'}
            />
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className={cn(MobileMenuItemScrollList)}>
          <MenuLevel items={menuItems} level={0} onNavigateHandler={onNavigateHandler} />
        </ScrollArea>
        <div className="flex flex-col border-b border-b-primary/40">
          <Button
            variant={'ghost'}
            size={'lg'}
            className={'w-full rounded-none border-b border-border/10 px-4 py-5 text-xl'}
            asChild
          >
            <Link
              href="/home"
              passHref
              onNavigate={onNavigateHandler}
              className="justify-start px-0 no-underline decoration-0"
            >
              <House className="w-6" />
              <span className="no-underline">Home</span>
            </Link>
          </Button>
          <SettingsDrawer />
        </div>

        <DrawerFooter
          className={cn('m-0 flex w-full flex-row items-center justify-between rounded-none p-0')}
        >
          <DrawerClose asChild>
            <Button
              variant={'ghost'}
              size={'lg'}
              className={'h-10.25 w-full justify-end rounded-none px-4 text-xl'}
            >
              <ChevronDownIcon className="h-6 w-6" />
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function SettingsDrawer() {
  return (
    <Drawer direction={'bottom'}>
      <DrawerTrigger asChild>
        <Button
          variant={'ghost'}
          size={'lg'}
          className={
            'w-full justify-start rounded-none border-b border-border/10 px-4 py-5 text-left text-xl'
          }
        >
          <Settings className="w-6" />
          Settings
        </Button>
      </DrawerTrigger>
      <DrawerContent className={cn(MobileMenuDrawerContentClassName)}>
        <DrawerHeader className={cn('')}>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <ScrollArea className={cn(MobileMenuItemScrollList)}>
          <div className={cn('flex h-full w-full flex-col justify-center gap-y-4 p-4')}>
            <MobileWallpaperSettingsFieldGroup className={ListItemClassName} />
            <MobileColorThemeFieldGroup className={ListItemClassName} />
            <MobileThemeModeFieldGroup className={ListItemClassName} />
          </div>
        </ScrollArea>
        <DrawerFooter
          className={cn('mt-0 flex items-center justify-between rounded-none px-0 py-0')}
        >
          <DrawerClose asChild>
            <Button
              variant={'ghost'}
              size={'lg'}
              className={'h-10.25 w-full justify-end rounded-none px-4 text-xl'}
            >
              <ChevronLeftIcon className="h-6 w-6" />
              Main Menu
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const ListItemClassName = 'w-full rounded-none border-b border-border/10 pb-5 pt-0 text-xl'

const MobileMenuDrawerContentClassName = cn(
  'mobile-menu-primary-menu-content rounded-md bg-background',
  'data-[vaul-drawer-direction=bottom]:h-[98vh]',
  'data-[vaul-drawer-direction=bottom]:rounded-t-none',
  // 'shadow-(--shadow-scrollable)',
)

const MobileMenuItemScrollList = cn(
  '[&_>div_>div]:flex! [&_>div_>div]:h-full! [&_>div_>div]:flex-col!',
  'mobile-menu-scroll-list',
  'flex flex-col h-full border-t border-b border-t-primary/40 border-b-primary/40 ',
)
