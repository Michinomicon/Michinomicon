import { ChevronDown, House } from 'lucide-react'
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
import { NavTreeCategoryItem, NavTreeItem, NavTreePageItem } from '@/utilities/buildNavTree'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { HeaderRowStyles } from '@/Header/Component.client'
import GlobalSearch from '@/components/GlobalSearch'

const MENU_LINK_TOOLTIP_DELAY = 1600

export type NavMenuProps = {
  navTree: NavTreeItem[]
}

const navigationMenuTabTriggerStyle = cn(
  'h-9 items-center justify-center rounded-md bg-background text-sm font-medium transition-colors text-accent-foreground',
  'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  'data-[state=active]:text-accent-foreground data-[state=active]:bg-accent/50 data-[state=active]:hover:bg-accent data-[state=active]:focus:bg-accent',
)

const NavigationMenuContentClassName = cn('animate-in animate-out slide-in-from-top')
const NavigationMenuContentInnerContainerClassName = cn(
  'gap-x-1 gap-y-0 w-screen inset-shadow-header',
)

const RecursiveTabsTabsClassName = cn(
  'flex w-screen flex-col items-center justify-center gap-0 rounded-none',
)
const RecursiveTabsTabsListClassName = cn(
  'w-max flex items-center justify-center gap-0 m-0 rounded-none bg-card/10',
)
const RecursiveTabsTabsTriggerClassName = cn(
  navigationMenuTabTriggerStyle,
  'group flex shrink grow-0 flex-col rounded-t-md px-2',
)
const RecursiveTabsTabsTriggerTitleClassName = cn('text-accent-foreground')
const RecursiveTabsTabsTriggerAsLinkClassName = cn('text-sm text-primary hover:underline')
const RecursiveTabsTabsTriggerActiveStatusChevronClassName = cn(
  'relative top-px ml-1 h-3 w-3 transition duration-300 group-data-[state=active]:rotate-180',
)
const RecursiveTabsTabContentContainerClassName = cn(
  'm-0 flex w-full min-w-max flex-1 items-center justify-center overflow-x-hidden overflow-y-auto rounded-none border-0 border-t border-border/10 bg-card/30 p-0 inset-shadow-header duration-300 animate-in animate-out slide-in-from-top',
)
const RecursiveTabsTabsContentClassName = cn(
  'm-0 flex w-max flex-col items-center justify-center rounded-none focus-visible:ring-0 focus-visible:outline-none',
)
const RecursiveTabsCategoryNoContentPanelClassName = cn(
  'flex h-full w-full items-center justify-center text-center text-sm text-muted-foreground',
)

function isDisabledCategoryOrPageTabTrigger(
  categoryOrPage: NavTreeCategoryItem | NavTreePageItem,
): boolean {
  return (
    categoryOrPage.type === 'category' &&
    (!categoryOrPage.children || categoryOrPage.children.length === 0)
  )
}

function isPageWithShowContentPanelDisabled(
  categoryOrPage: NavTreeCategoryItem | NavTreePageItem,
): categoryOrPage is NavTreePageItem & { siteMenuShowContentPanel: false } {
  return categoryOrPage.type === 'page' && !categoryOrPage.siteMenuShowContentPanel
}

function isCategoryOrPage(
  categoryOrPage: NavTreeItem,
): categoryOrPage is NavTreePageItem | NavTreeCategoryItem {
  return categoryOrPage.type === 'category' || categoryOrPage.type === 'page'
}

function isCategoryOrPageWithTabContent(
  categoryOrPage: NavTreeItem,
): categoryOrPage is (NavTreePageItem & { siteMenuShowContentPanel: true }) | NavTreeCategoryItem {
  return (
    categoryOrPage.type === 'category' ||
    (categoryOrPage.type === 'page' && categoryOrPage.siteMenuShowContentPanel === true)
  )
}

function CategoryOrPageTabsTrigger({
  categoryOrPage,
  onMouseEnterTriggerHandler,
}: {
  categoryOrPage: NavTreeCategoryItem | NavTreePageItem
  onMouseEnterTriggerHandler: React.MouseEventHandler<HTMLButtonElement>
}): React.JSX.Element {
  if (isPageWithShowContentPanelDisabled(categoryOrPage)) {
    // Page that does not have 'siteMenuShowContentPanel' enabled
    return (
      <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <TabsTrigger
            onMouseEnter={onMouseEnterTriggerHandler}
            key={categoryOrPage.id}
            value={categoryOrPage.id}
            className={cn(RecursiveTabsTabsTriggerClassName)}
            asChild
          >
            <Link href={categoryOrPage.url} className={cn(RecursiveTabsTabsTriggerAsLinkClassName)}>
              <span className={cn(RecursiveTabsTabsTriggerTitleClassName)}>
                {categoryOrPage.title}
              </span>
            </Link>
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          Go to page <span className="font-semibold">{categoryOrPage.title}</span>
        </TooltipContent>
      </Tooltip>
    )
  } else {
    // Category or Page that expands to show child content
    return (
      <TabsTrigger
        onMouseEnter={onMouseEnterTriggerHandler}
        key={categoryOrPage.id}
        value={categoryOrPage.id}
        disabled={isDisabledCategoryOrPageTabTrigger(categoryOrPage)}
        className={cn(RecursiveTabsTabsTriggerClassName)}
      >
        <div className={cn('flex px-1')}>
          <span className={cn(RecursiveTabsTabsTriggerTitleClassName)}>{categoryOrPage.title}</span>{' '}
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

function RecursiveTabs({ items }: { items: NavTreeItem[] }): React.JSX.Element | null {
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
      <TabsList className={cn(RecursiveTabsTabsListClassName)}>
        {items
          .filter((item) => isCategoryOrPage(item))
          .map((categoryOrPage) => (
            <CategoryOrPageTabsTrigger
              key={categoryOrPage.id}
              categoryOrPage={categoryOrPage}
              onMouseEnterTriggerHandler={onMouseEnterTriggerHandler(categoryOrPage.id)}
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

function TabContentNode({ item }: { item: NavTreeItem }): React.JSX.Element {
  if (item.type === 'page') {
    if (item.siteMenuShowContentPanel) {
      return <PageContentPanel item={item} />
    } else {
      return (
        <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <Link href={item.url} className={cn(RecursiveTabsTabsTriggerAsLinkClassName)}>
              {item.title}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            Go to page <span className="font-semibold">{item.title}</span>
          </TooltipContent>
        </Tooltip>
      )
    }
  } else if (item.type === 'category') {
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
      <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <Link href={item.url} className={cn(RecursiveTabsTabsTriggerAsLinkClassName)}>
            {item.title}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          Go to post <span className="font-semibold">{item.title}</span>
        </TooltipContent>
      </Tooltip>
    )
  }
}

function PageContentPanel({ item }: { item: NavTreePageItem }): React.JSX.Element {
  const isMobile = useIsMobile()
  return (
    <div className="flex h-full w-full flex-col justify-center p-1">
      <div className={cn('w-full', isMobile ? 'text-left' : 'text-center')}>
        <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <Link
              href={item.url}
              className="mb-6 block rounded-none pb-1 text-2xl font-bold tracking-tight text-foreground hover:text-primary hover:underline"
            >
              {item.title}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            Go to page <span className="font-semibold">{item.title}</span>
          </TooltipContent>
        </Tooltip>
      </div>

      {item.children && item.children.length > 0 ? (
        <div
          className={cn(
            'mx-auto grid grid-flow-col-dense gap-2',
            isMobile ? 'auto-cols-max grid-cols-2' : 'auto-cols-max',
          )}
        >
          {item.children.map((child) => (
            <Tooltip
              key={child.id}
              delayDuration={MENU_LINK_TOOLTIP_DELAY}
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
        <p className="text-center text-sm text-muted-foreground">
          No posts available under this page.
        </p>
      )}
    </div>
  )
}

function NavigationMenuLevelZeroNode({ item }: { item: NavTreeItem }): React.JSX.Element | null {
  const hasChildren = item.children && item.children.length > 0

  // Empty Category -> Disabled Item
  if (item.type === 'category' && !hasChildren) {
    return (
      <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <NavigationMenuItem>
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

  // Any Item without children (Page/Post)
  if (!hasChildren) {
    return (
      <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <NavigationMenuItem>
            <Link href={item.url} legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle())}>
                {item.title}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </TooltipTrigger>
        <TooltipContent>
          Go to page <span className="font-semibold">{item.title}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  // PAGE (with children)
  if (item.type === 'page') {
    if (item.siteMenuShowContentPanel) {
      return (
        <NavigationMenuItem>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent className={cn(NavigationMenuContentClassName)}>
            <div className={cn(HeaderRowStyles, NavigationMenuContentInnerContainerClassName)}>
              <div className="col-span-8 col-start-3">
                <div className={cn('flex flex-col items-center justify-center')}>
                  <PageContentPanel item={item} />
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      )
    } else {
      return (
        <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
          <TooltipTrigger asChild>
            <NavigationMenuItem>
              <Link href={item.url} legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle())}>
                  {item.title}{' '}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </TooltipTrigger>
          <TooltipContent>
            Go to page <span className="font-semibold">{item.title}</span>
          </TooltipContent>
        </Tooltip>
      )
    }
  }

  // CATEGORY with children
  if (item.type === 'category') {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className={cn(NavigationMenuContentClassName)}>
          <div className={cn(HeaderRowStyles, NavigationMenuContentInnerContainerClassName)}>
            <div className="col-span-8 col-start-3">
              <div className={cn('flex flex-col items-center justify-center')}>
                <RecursiveTabs items={item.children} />
              </div>
            </div>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }
  return null
}
function HomeNavigationMenuItem({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>) {
  return (
    <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
      <TooltipTrigger asChild>
        <NavigationMenuItem {...props}>
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

function SearchNavigationMenuItem({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>) {
  return (
    <Tooltip delayDuration={MENU_LINK_TOOLTIP_DELAY} disableHoverableContent={true}>
      <TooltipTrigger asChild>
        <NavigationMenuItem {...props}>
          <GlobalSearch buttonProps={{ variant: 'ghost', size: 'default' }} />
          {/* <Link href="/search" passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <span>
                <SearchIcon className="w-5 text-primary" />
                <span className="md:sr-only">Search</span>
              </span>
            </NavigationMenuLink>
          </Link> */}
        </NavigationMenuItem>
      </TooltipTrigger>
      <TooltipContent>Search</TooltipContent>
    </Tooltip>
  )
}

export default function HeaderNavMenu({
  navTree,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof NavigationMenu>, 'orientation'> &
  NavMenuProps): React.JSX.Element {
  return (
    <NavigationMenu {...props} orientation={'vertical'}>
      <NavigationMenuList orientation={'vertical'}>
        <HomeNavigationMenuItem />
        {navTree.map((item) => (
          <NavigationMenuLevelZeroNode key={item.id} item={item} />
        ))}
        <SearchNavigationMenuItem />
      </NavigationMenuList>
      <NavigationMenuViewport orientation={'vertical'}></NavigationMenuViewport>
    </NavigationMenu>
  )
}
