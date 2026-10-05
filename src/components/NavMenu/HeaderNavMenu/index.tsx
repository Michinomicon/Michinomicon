import { House, SearchIcon } from 'lucide-react'
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
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import GlobalSearch from '@/components/GlobalSearch'
import { CMSLink } from '@/components/Link'
import { MenuLevel } from '../MenuLevel'
import { OnNavigateHandler } from '../MenuItem'

const NavigationMenuItemClassName = cn(
  // 'group-has-[[data-state=open]]:[&:not([data-state=open]):not(:has([data-state=open]))]:[&_>*]:opacity-60!',
  'w-[160px] [&_>*]:w-[160px] text-center',
  'nav-menu-item rounded-none [&_>*]:rounded-none border-transparent ',
)

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

const NavigationMenuLinkClassName = cn(navigationMenuTriggerStyle(), 'w-full whitespace-nowrap')

function NavigationMenuLevelZeroNode({ item }: { item: MenuTreeEntry }): React.ReactNode | null {
  const onNavigateHandler: OnNavigateHandler = () => {
    console.log(`closing mobile nav menu after link navigation`)
  }

  if (isMenuItemGroup(item)) {
    if (Array.isArray(item.children) && item.children.length > 0) {
      // CATEGORY with children
      return (
        <NavigationMenuItem className={cn(NavigationMenuItemClassName)}>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent
            className={cn(
              'flex min-h-100 max-w-screen flex-col items-start justify-start rounded-md border border-border bg-card p-1 md:w-4xl',
            )}
          >
            <MenuLevel
              items={item.children}
              level={1}
              rootLabel={item.title}
              onNavigateHandler={onNavigateHandler}
            />
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
