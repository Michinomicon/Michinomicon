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

const navigationMenuTabTriggerStyle = cn(
  'h-9 items-center justify-center rounded-none bg-background text-sm font-medium transition-colors text-accent-foreground',
  'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  'data-[state=active]:text-accent-foreground data-[state=active]:bg-accent/50 data-[state=active]:hover:bg-accent data-[state=active]:focus:bg-accent',
)

const NavigationMenuItemClassName = cn(
  'nav-menu-item rounded-none [&_>a]:rounded-none [&_>button]:rounded-none border-transparent border border-t-0 border-b-0 not-last:border-r-border/20',
)
const NavigationMenuContentClassName = cn('inset-shadow-header rounded-none')
const NavigationMenuContentInnerContainerClassName = cn(
  'border-border/30 border border-t-0 gap-x-1 gap-y-0 bg-card rounded-none rounded-b-md',
)

const RecursiveTabsTabsClassName = cn(
  'nav-tabs w-full mx-auto flex flex-col items-center justify-center gap-0 rounded-none',
)
const RecursiveTabsTabsListClassName = cn(
  'py-0 flex items-center justify-center gap-0 m-0 rounded-none bg-card/10 border-transparent border [&_>button]:not-last:border-r-border/20',
)
const RecursiveTabsTabsTriggerClassName = cn(
  navigationMenuTabTriggerStyle,
  'border border-r bg-card group flex shrink grow-0 flex-col items-center justify-center rounded-none px-4 min-w-30 w-fit',
)
const RecursiveTabsTabsTriggerTitleClassName = cn(
  'text-accent-foreground dark:text-accent-foreground',
)
const RecursiveTabsTabsTriggerAsLinkClassName = cn('text-sm text-primary hover:underline')
const RecursiveTabsTabsTriggerActiveStatusChevronClassName = cn(
  'relative top-px ml-1 h-3 w-3 transition duration-300 group-data-[state=active]:rotate-180',
)
const RecursiveTabsTabContentContainerClassName = cn(
  'nav-tab-content m-0 flex w-full min-w-max flex-1 items-center justify-center overflow-x-hidden overflow-y-auto rounded-none',
  'border-0 border-t border-border bg-card/30 p-0 inset-shadow-header ',
  'group-data-[state=active]:[&_>*]:opacity-1 opacity-0 transition-opacity',
)
const RecursiveTabsTabsContentClassName = cn(
  'm-0 flex w-max flex-col items-center justify-center rounded-none focus-visible:ring-0 focus-visible:outline-none',
)
const RecursiveTabsCategoryNoContentPanelClassName = cn(
  'flex h-full w-full items-center justify-center text-center text-sm text-muted-foreground',
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
): React.JSX.Element {
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
}): React.JSX.Element {
  if (isPostItem(item) || isLinkItem(item) || isPageWithContentPanelDisabled(item)) {
    return (
      <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <TabsTrigger
            onMouseEnter={onMouseEnterTriggerHandler}
            key={item.id}
            value={item.id}
            className={cn(RecursiveTabsTabsTriggerClassName)}
            {...(isLinkItem(item) ? {} : { asChild: true })}
          >
            {isLinkItem(item) ? (
              <CMSLink
                {...item.link}
                disableTooltip={true}
                appearance={'link'}
                className={cn(RecursiveTabsTabsTriggerTitleClassName)}
              />
            ) : (
              <Link href={`${item.url}`} className={cn(RecursiveTabsTabsTriggerAsLinkClassName)}>
                <span className={cn(RecursiveTabsTabsTriggerTitleClassName)}>{item.title}</span>
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
        <div className={cn('flex px-1')}>
          <span className={cn(RecursiveTabsTabsTriggerTitleClassName)}>{item.title}</span>{' '}
          <ChevronDown
            size={0.5}
            className={cn(RecursiveTabsTabsTriggerActiveStatusChevronClassName)}
            aria-hidden="true"
          />
        </div>
      </TabsTrigger>
    )
  }
}

function RecursiveTabs({ items }: { items: MenuTreeItem[] }): React.JSX.Element | null {
  const [activeTab, setActiveTab] = React.useState<string>()

  const onMouseEnterTriggerHandler = (
    categoryOrPageId: string,
  ): React.MouseEventHandler<HTMLButtonElement> => {
    return () => setActiveTab(categoryOrPageId)
  }

  if (!items || items.length === 0) return null

  return (
    <Tabs
      onValueChange={(value) => setActiveTab(value)}
      orientation={'vertical'}
      value={activeTab}
      className={cn(RecursiveTabsTabsClassName)}
    >
      <TabsList className={cn(RecursiveTabsTabsListClassName)} variant={'default'}>
        {items.map((menuItem) => (
          <MenuItemTabsTrigger
            key={menuItem.id}
            menuTreeItem={menuItem}
            onMouseEnterTriggerHandler={onMouseEnterTriggerHandler(menuItem.id)}
          />
        ))}
      </TabsList>

      <div className={cn(RecursiveTabsTabContentContainerClassName)}>
        {items
          .filter((item) => isCategoryOrPageWithTabContent(item))
          .map((item) => {
            return (
              <TabsContent
                key={item.id}
                value={item.id}
                className={cn(RecursiveTabsTabsContentClassName)}
              >
                <TabContentNode item={item} />
              </TabsContent>
            )
          })}
      </div>
    </Tabs>
  )
}

function TabContentNode({ item }: { item: MenuTreeItem }): React.JSX.Element {
  if (isPageItem(item)) {
    if (item.siteMenuShowContentPanel) {
      return <PageContentPanel item={item} />
    } else {
      return (
        <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <Link href={item.url} className={cn(RecursiveTabsTabsTriggerAsLinkClassName)}>
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
        <div className={cn(RecursiveTabsCategoryNoContentPanelClassName)}>
          No content available.
        </div>
      )
    }
  } else {
    // Fallback for Posts
    return (
      <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <Link href={item.url} className={cn(RecursiveTabsTabsTriggerAsLinkClassName)}>
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

function PageContentPanel({ item }: { item: MenuTreePageItem }): React.JSX.Element {
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

function NavigationMenuLevelZeroNode({ item }: { item: MenuTreeItem }): React.JSX.Element | null {
  // Empty Category -> Disabled Item
  if (isCategoryItem(item)) {
    if (Array.isArray(item.children) && item.children.length > 0) {
      // CATEGORY with children
      return (
        <NavigationMenuItem className={NavigationMenuItemClassName}>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent className={cn(NavigationMenuContentClassName)}>
            <div className={cn(HeaderRowStyles, NavigationMenuContentInnerContainerClassName)}>
              <div className="col-span-8 col-start-3">
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
      return (
        <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <NavigationMenuItem className={cn(NavigationMenuItemClassName)}>
              <NavigationMenuLink
                className={cn(navigationMenuTriggerStyle(), 'cursor-not-allowed opacity-50')}
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
              <div className="col-span-8 col-start-3">
                <div className={cn('flex w-full flex-col items-center justify-center')}>
                  <PageContentPanel item={item} />
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      )
    } else {
      return (
        <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <NavigationMenuItem className={NavigationMenuItemClassName}>
              <NavigationMenuLink href={item.url} className={cn(navigationMenuTriggerStyle())}>
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
          <NavigationMenuItem className={NavigationMenuItemClassName}>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle())} asChild>
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
          <NavigationMenuItem className={NavigationMenuItemClassName}>
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

function HomeNavigationMenuItem({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>) {
  return (
    <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true}>
      <TooltipTrigger asChild>
        <NavigationMenuItem {...props} className={NavigationMenuItemClassName}>
          <Link href="/home" passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <span>
                <House className="w-5" />
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

function ClassicSearchLink(): React.JSX.Element {
  return (
    <Link href="/search" passHref>
      <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
        <span>
          <SearchIcon className="w-5 text-primary" />
          <span className="md:sr-only">Search</span>
        </span>
      </NavigationMenuLink>
    </Link>
  )
}

function SearchNavigationMenuItem({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>) {
  const useClassicSearch: boolean = false
  return (
    <NavigationMenuItem {...props} className={NavigationMenuItemClassName}>
      {useClassicSearch ? (
        <ClassicSearchLink></ClassicSearchLink>
      ) : (
        <GlobalSearch
          buttonProps={{
            variant: 'clean',
            size: 'sm',
            className: navigationMenuTriggerStyle(),
          }}
        />
      )}
    </NavigationMenuItem>
  )
}

function NavigationMenuItems({ menuTree }: { menuTree: MenuTree }): React.JSX.Element[] {
  return menuTree.map((item, index) => (
    <NavigationMenuLevelZeroNode key={`${index}-${item.id}`} item={item} />
  ))
}

export type NavMenuProps = {
  menuTree: MenuTree
}

export default function HeaderNavMenu({
  menuTree,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof NavigationMenu>, 'orientation'> &
  NavMenuProps): React.JSX.Element {
  return (
    <NavigationMenu {...props} orientation={'vertical'}>
      <NavigationMenuList orientation={'vertical'} className={'space-x-0'}>
        <HomeNavigationMenuItem />
        <NavigationMenuItems menuTree={menuTree} />
        <SearchNavigationMenuItem />
      </NavigationMenuList>
      <NavigationMenuViewport orientation={'vertical'}></NavigationMenuViewport>
    </NavigationMenu>
  )
}
