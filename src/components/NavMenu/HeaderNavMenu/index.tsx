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
import {
  MenuTreeCategoryItem,
  MenuTreeItem,
  MenuTreePageItem,
  MenuTreeLinkItem,
  MenuTreePostItem,
  MenuTree,
} from '@/utilities/buildNavTree'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
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

function isDisabledCategoryOrPageTabTrigger(
  categoryOrPage: MenuTreeCategoryItem | MenuTreePageItem,
): boolean {
  return (
    categoryOrPage.type === 'category' &&
    (!categoryOrPage.children || categoryOrPage.children.length === 0)
  )
}

type PageWithContentPanelDisabled = MenuTreePageItem & { siteMenuShowContentPanel: false }

function isPageWithContentPanelDisabled(
  menuTreeItem: MenuTreeItem,
): menuTreeItem is PageWithContentPanelDisabled {
  return menuTreeItem.type === 'page' && menuTreeItem.siteMenuShowContentPanel === false
}

function isCategoryItem(menuTreeItem: MenuTreeItem): menuTreeItem is MenuTreeCategoryItem {
  return menuTreeItem.type === 'category'
}

function isPageItem(menuTreeItem: MenuTreeItem): menuTreeItem is MenuTreePageItem {
  return menuTreeItem.type === 'page'
}

function isPostItem(menuTreeItem: MenuTreeItem): menuTreeItem is MenuTreePostItem {
  return menuTreeItem.type === 'post'
}

function isLinkItem(menuTreeItem: MenuTreeItem): menuTreeItem is MenuTreeLinkItem {
  return menuTreeItem.type === 'link'
}

function isCategoryOrPageWithTabContent(
  menuTreeItem: MenuTreeItem,
): menuTreeItem is (MenuTreePageItem & { siteMenuShowContentPanel: true }) | MenuTreeCategoryItem {
  return (
    menuTreeItem.type === 'category' ||
    (menuTreeItem.type === 'page' && menuTreeItem.siteMenuShowContentPanel === true)
  )
}

function MenuItemTooltipContent(
  item: MenuTreePageItem | MenuTreePostItem | MenuTreeLinkItem,
): React.ReactNode {
  const destinationTitle: string =
    isLinkItem(item) && item.link.label ? item.link.label : item.title
  const newTabMsg: string = isLinkItem(item) && item.link.newTab ? 'in a new tab' : ''
  return (
    <span>
      Open <span className="font-semibold">{destinationTitle}</span> {newTabMsg}
    </span>
  )
}

function MenuItemTabsTrigger({
  menuTreeItem: item,
  onMouseEnterTriggerHandler,
}: {
  menuTreeItem: MenuTreeItem
  onMouseEnterTriggerHandler: React.MouseEventHandler<HTMLButtonElement>
}): React.ReactNode {
  if (isPostItem(item) || isLinkItem(item) || isPageWithContentPanelDisabled(item)) {
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
            {...(isLinkItem(item) ? {} : { asChild: true })}
          >
            {isLinkItem(item) ? (
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
        disabled={isDisabledCategoryOrPageTabTrigger(item)}
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

function RecursiveTabs({ items }: { items: MenuTreeItem[] }): React.ReactNode | null {
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
            menuTreeItem={menuItem}
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
          .filter((item) => isCategoryOrPageWithTabContent(item))
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

function TabContentNode({ item }: { item: MenuTreeItem }): React.ReactNode {
  if (isPageItem(item)) {
    if (item.siteMenuShowContentPanel) {
      return <PageContentPanel item={item} />
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
  } else if (isCategoryItem(item)) {
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
    // Fallback for Posts
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

function PageContentPanel({ item }: { item: MenuTreePageItem }): React.ReactNode {
  const isMobile = useIsMobile()
  return (
    <div className="flex h-full w-full flex-col justify-center p-1">
      <div className={cn('w-full', isMobile ? 'text-left' : 'text-center')}>
        <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <Link
              href={item.url}
              className="mb-6 block rounded-none pb-1 text-2xl font-bold tracking-tight text-foreground hover:text-primary hover:underline"
            >
              {item.title}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <MenuItemTooltipContent {...item} />
          </TooltipContent>
        </Tooltip>
      </div>

      {Array.isArray(item.children) && item.children.length > 0 ? (
        <div
          className={cn(
            'mx-auto grid grid-flow-col-dense gap-2',
            isMobile ? 'auto-cols-max grid-cols-2' : 'auto-cols-max',
          )}
        >
          {item.children?.map((child) => (
            <Tooltip
              key={child.id}
              delayDuration={DEFAULT_TOOLTIP_DELAY}
              disableHoverableContent={true}
            >
              <TooltipTrigger asChild>
                <Link
                  href={`${item.url}#${child.url}`}
                  className="block rounded-md border p-2 text-foreground transition-colors hover:bg-muted"
                >
                  <div className="text-sm font-medium">{child.title}</div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                Go to section <span className="font-semibold">{child.title}</span> on page{' '}
                <span className="font-semibold">{item.title}</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      ) : (
        <span className="text-center text-sm text-muted-foreground">
          No posts available under this page.
        </span>
      )}
    </div>
  )
}

const NavigationMenuLinkClassName = cn(navigationMenuTriggerStyle(), 'w-full whitespace-nowrap')

function NavigationMenuLevelZeroNode({ item }: { item: MenuTreeItem }): React.ReactNode | null {
  if (isCategoryItem(item)) {
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
  }
  if (isPageItem(item)) {
    if (item.siteMenuShowContentPanel && Array.isArray(item.children) && item.children.length > 0) {
      // PAGE (with children)
      return (
        <NavigationMenuItem className={NavigationMenuItemClassName}>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent className={cn(NavigationMenuContentClassName)}>
            <div className={cn(HeaderRowStyles, NavigationMenuContentInnerContainerClassName)}>
              <div className={cn('col-span-12')}>
                <div className={cn('flex w-full flex-col items-center justify-center')}>
                  <PageContentPanel item={item} />
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      )
    } else {
      // PAGE (without children)
      return (
        <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <NavigationMenuItem className={cn(NavigationMenuItemClassName, 'hover:underline')}>
              <NavigationMenuLink href={item.url} className={cn(NavigationMenuLinkClassName)}>
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </TooltipTrigger>
          <TooltipContent>
            <MenuItemTooltipContent {...item} />
          </TooltipContent>
        </Tooltip>
      )
    }
  }
  if (isLinkItem(item)) {
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

  if (isPostItem(item)) {
    // Any Item without children (Post)
    return (
      <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <NavigationMenuItem className={cn(NavigationMenuItemClassName, 'hover:underline')}>
            <Link href={item.url} passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle())}>
                {item.title}
              </NavigationMenuLink>
            </Link>
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
