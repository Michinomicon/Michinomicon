import { ChevronDown, House, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu'
import { MenuTreeEntry, MenuTreeItemGroup, MenuTreeItem, MenuTree } from '@/utilities/buildNavTree'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HeaderRowStyles } from '@/Header/Component.client'
import GlobalSearch from '@/components/GlobalSearch'
import { CMSLink } from '@/components/Link'

const NavigationMenuItemClassName = cn(
  'group-has-[[data-state=open]]:[&:not([data-state=open]):not(:has([data-state=open]))]:[&_>*]:opacity-60!',
  'w-[160px] [&_>*]:w-[160px] text-center',
  'nav-menu-item rounded-none [&_>*]:rounded-none border-transparent ',
)

const NavigationMenuContentClassName = cn(
  'nav-menu-item-content md:w-7xl max-w-screen inset-shadow-header rounded-none',
)
const NavigationMenuContentInnerContainerClassName = cn(
  'mav-menu-item-content-inner w-full max-w-7xl px-0',
  'border-border/30 border border-t-0 gap-x-1 gap-y-0 bg-card rounded-none rounded-b-md',
)

const RecursiveTabsTabsTriggerClassName = cn(
  'h-9 items-center w-full justify-center rounded-none bg-background text-sm font-medium transition-colors text-accent-foreground',
  'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-60',
  'data-[state=active]:text-accent-foreground data-[state=active]:bg-accent/50 data-[state=active]:hover:bg-accent data-[state=active]:focus:bg-accent data-[state=active]:[&_>*]:font-bold',
  'nav-tabs-trigger bg-transparent group flex flex-col items-center justify-center min-w-fit max-w-[160px]',
)

const RecursiveTabsTabsTriggerAsLinkClassName = cn(
  'nav-tabs-trigger text-sm text-primary-foreground hover:underline px-1',
)

function isDisabledGroupOrItemTabTrigger(groupOrItem: MenuTreeItemGroup | MenuTreeItem): boolean {
  return (
    groupOrItem.type === 'group' && (!groupOrItem.children || groupOrItem.children.length === 0)
  )
}

function isMenuItem(menuTreeItem: MenuTreeEntry): menuTreeItem is MenuTreeItem {
  return menuTreeItem.type === 'item'
}

function isMenuItemGroup(menuTreeItem: MenuTreeEntry): menuTreeItem is MenuTreeItemGroup {
  return menuTreeItem.type === 'group'
}

function MenuItemTooltipContent(item: MenuTreeItem): React.ReactNode {
  const destinationTitle: string =
    isMenuItem(item) && item.link.label ? item.link.label : item.title
  const newTabMsg: string = isMenuItem(item) && item.link.newTab ? 'in a new tab' : ''
  return (
    <span>
      Open <span className="font-semibold">{destinationTitle}</span> {newTabMsg}
    </span>
  )
}

function MenuItemTabsTrigger({
  item,
  onMouseEnterTriggerHandler,
}: {
  item: MenuTreeEntry
  onMouseEnterTriggerHandler: React.MouseEventHandler<HTMLButtonElement>
}): React.ReactNode {
  if (isMenuItem(item)) {
    return (
      <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <TabsTrigger
            onMouseEnter={onMouseEnterTriggerHandler}
            key={item.id}
            value={item.id}
            className={cn(
              RecursiveTabsTabsTriggerClassName,
              'transition duration-300 ease-out',
              'group-has-data-[state=active]:[&:not(data-[state=active])]:opacity-60!',
            )}
            {...(isMenuItem(item) ? {} : { asChild: true })}
          >
            {item.link.url ? (
              <CMSLink
                {...item.link}
                disableTooltip={true}
                appearance={'link'}
                className={cn(RecursiveTabsTabsTriggerClassName)}
              />
            ) : (
              <Link href={`${item.url}`} className={cn(RecursiveTabsTabsTriggerAsLinkClassName)}>
                <span className={cn(RecursiveTabsTabsTriggerClassName)}>{item.title}</span>
              </Link>
            )}
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <MenuItemTooltipContent {...item} />
        </TooltipContent>
      </Tooltip>
    )
  } else {
    // Category or Page that expands to show child content
    return (
      <TabsTrigger
        onMouseEnter={onMouseEnterTriggerHandler}
        key={item.id}
        value={item.id}
        disabled={isDisabledGroupOrItemTabTrigger(item)}
        className={cn(RecursiveTabsTabsTriggerClassName)}
      >
        <div className={cn('flex items-center gap-x-1')}>
          <span className={cn(RecursiveTabsTabsTriggerClassName)}>{item.title}</span>{' '}
          <ChevronDown
            className={cn(
              'relative top-px left-px m-0 h-[1em]! w-[1em]! p-0 text-[12px]! transition duration-300 group-data-[state=active]:rotate-180',
            )}
            aria-hidden="true"
          />
        </div>
      </TabsTrigger>
    )
  }
}

function RecursiveTabs({ items }: { items: MenuTreeEntry[] }): React.ReactNode | null {
  const [activeTab, setActiveTab] = React.useState<string>()

  const onMouseEnterTriggerHandler = (
    categoryOrPageId: string,
  ): React.MouseEventHandler<HTMLButtonElement> => {
    return () => setActiveTab(categoryOrPageId)
  }

  const isActiveContent = (itemId: string): boolean => {
    return activeTab === itemId
  }

  if (!items || items.length === 0) return null

  return (
    <Tabs
      onValueChange={(value) => setActiveTab(value)}
      orientation={'vertical'}
      value={activeTab}
      className={cn(
        'nav-tabs mx-auto flex w-full flex-col items-center justify-center gap-0 rounded-none',
      )}
    >
      <TabsList
        className={cn(
          'nav-tabs-list group m-0 flex w-full items-center justify-center gap-0 rounded-none border-0 border-t-border/40 bg-background/95 py-0 backdrop-blur group-data-[active=true]:border-t supports-backdrop-filter:bg-background/60 [&_>a]:not-last:border-r-border/20 [&_>button]:not-last:border-r-border/20',
        )}
        variant={'default'}
      >
        {items.map((menuItem) => (
          <MenuItemTabsTrigger
            key={menuItem.id}
            item={menuItem}
            onMouseEnterTriggerHandler={onMouseEnterTriggerHandler(menuItem.id)}
          />
        ))}
      </TabsList>

      <div
        className={cn(
          'nav-tab-content-container m-0 flex w-full min-w-max flex-1 items-center justify-center overflow-x-hidden overflow-y-auto rounded-none bg-black/40 p-0 inset-shadow-header',
        )}
      >
        {items
          .filter((item) => isMenuItemGroup(item))
          .map((item) => {
            return (
              <TabsContent
                key={item.id}
                value={item.id}
                data-active={isActiveContent(item.id)}
                className={cn(
                  'nav-tab-content group m-0 flex w-max flex-col items-center justify-center rounded-none focus-visible:ring-0 focus-visible:outline-none',
                )}
              >
                <TabContentNode item={item} />
              </TabsContent>
            )
          })}
      </div>
    </Tabs>
  )
}

function TabContentNode({ item }: { item: MenuTreeEntry }): React.ReactNode {
  if (isMenuItemGroup(item)) {
    if (item.children && item.children.length > 0) {
      return <RecursiveTabs items={item.children} />
    } else {
      return (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center text-center text-sm text-muted-foreground',
          )}
        >
          No content available.
        </div>
      )
    }
  } else {
    return (
      <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <Link
            href={item.url}
            className={cn(RecursiveTabsTabsTriggerAsLinkClassName, 'hover:underline')}
          >
            {item.title}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <MenuItemTooltipContent {...item} />
        </TooltipContent>
      </Tooltip>
    )
  }
}

const NavigationMenuLinkClassName = cn(navigationMenuTriggerStyle(), 'w-full whitespace-nowrap')

function NavigationMenuLevelZeroNode({ item }: { item: MenuTreeEntry }): React.ReactNode | null {
  if (isMenuItemGroup(item)) {
    if (Array.isArray(item.children) && item.children.length > 0) {
      // CATEGORY with children
      return (
        <NavigationMenuItem className={cn(NavigationMenuItemClassName)}>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent className={cn(NavigationMenuContentClassName)}>
            <div className={cn(HeaderRowStyles, NavigationMenuContentInnerContainerClassName)}>
              <div className={cn('col-span-12')}>
                <div className={cn('flex w-full flex-col items-center justify-center')}>
                  <RecursiveTabs items={item.children} />
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      )
    } else {
      // CATEGORY without children
      // Empty Category -> Disabled Item
      return (
        <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <NavigationMenuItem className={cn(NavigationMenuItemClassName)}>
              <NavigationMenuLink
                className={cn(NavigationMenuLinkClassName, 'cursor-not-allowed opacity-50')}
                onMouseOver={(event) => event.preventDefault()}
                aria-disabled="true"
              >
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </TooltipTrigger>
          <TooltipContent>Empty Category</TooltipContent>
        </Tooltip>
      )
    }
  } else if (isMenuItem(item)) {
    return (
      <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <NavigationMenuItem className={cn(NavigationMenuItemClassName, 'hover:underline')}>
            <NavigationMenuLink className={cn(NavigationMenuLinkClassName)} asChild>
              <CMSLink {...item.link} appearance="link" className={'cms-link'} />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </TooltipTrigger>
        <TooltipContent>
          <MenuItemTooltipContent {...item} />
        </TooltipContent>
      </Tooltip>
    )
  }
  return null
}

export function HomeNavigationMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>): React.ReactNode {
  return (
    <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
      <TooltipTrigger asChild>
        <NavigationMenuItem {...props} className={cn(NavigationMenuItemClassName, className)}>
          <Link href="/home" passHref>
            <NavigationMenuLink
              className={cn(NavigationMenuLinkClassName, 'hover:underline')}
              asChild
            >
              <span>
                <House className="w-5" />
                <span className="ml-3">Home</span>
                <span className="md:sr-only">Home</span>
              </span>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </TooltipTrigger>
      <TooltipContent>Go to Homepage</TooltipContent>
    </Tooltip>
  )
}

export const SearchNavigationMenuItem = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>): React.ReactNode => {
  const useClassicSearch: boolean = false
  return (
    <NavigationMenuItem {...props} className={NavigationMenuItemClassName}>
      {useClassicSearch ? (
        <Link href="/search" passHref>
          <NavigationMenuLink
            className={cn(navigationMenuTriggerStyle(), 'hover:underline')}
            asChild
          >
            <span>
              <SearchIcon className="w-5 text-primary" />
              <span className="md:sr-only">Search</span>
            </span>
          </NavigationMenuLink>
        </Link>
      ) : (
        <GlobalSearch
          showLabel={true}
          buttonProps={{
            variant: 'clean',
            size: 'default',
            className: cn(navigationMenuTriggerStyle(), 'hover:underline'),
          }}
        />
      )}
    </NavigationMenuItem>
  )
}

export function NavigationMenuItems({ menuTree }: { menuTree: MenuTree }): React.ReactNode[] {
  return menuTree.map((item, index) => (
    <NavigationMenuLevelZeroNode key={`${index}-${item.id}`} item={item} />
  ))
}

export type NavMenuProps = {
  showSearch?: boolean
  showHome?: boolean
  menuItems?: MenuTree
}
export default function HeaderNavMenu({
  showSearch = true,
  showHome = true,
  menuItems,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof NavigationMenu>, 'orientation'> &
  NavMenuProps): React.ReactNode {
  return (
    <NavigationMenu {...props} orientation={'vertical'}>
      <NavigationMenuList orientation={'vertical'} className={'space-x-0'}>
        {showHome && <HomeNavigationMenuItem />}
        {menuItems && <NavigationMenuItems menuTree={menuItems} />}
        {showSearch && <SearchNavigationMenuItem />}
      </NavigationMenuList>
      <NavigationMenuViewport orientation={'vertical'}></NavigationMenuViewport>
    </NavigationMenu>
  )
}
