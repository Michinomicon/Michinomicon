import { House, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu'
import { NavTreeItem, NavTreePageItem } from '@/utilities/buildNavTree'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'

type NavMenuProps = {
  navTree: NavTreeItem[]
}

function LevelZeroNode({ item }: { item: NavTreeItem }) {
  const hasChildren = item.children && item.children.length > 0

  // Empty Category -> Disabled Item
  if (item.type === 'category' && !hasChildren) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          className={cn(navigationMenuTriggerStyle(), 'pointer-events-none opacity-50')}
          aria-disabled="true"
        >
          {item.title}
        </NavigationMenuLink>
      </NavigationMenuItem>
    )
  }

  // Any Item without children (Page/Post)
  if (!hasChildren) {
    return (
      <NavigationMenuItem>
        <Link href={item.url} legacyBehavior passHref>
          <NavigationMenuLink className={cn(navigationMenuTriggerStyle())}>
            {item.title}
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    )
  }

  // PAGE with children (Posts)
  if (item.type === 'page') {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className={cn('w-full md:w-100 lg:w-150')}>
            <PageContentLayout item={item} />
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  // CATEGORY with children
  if (item.type === 'category') {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className={cn('w-full md:w-100 lg:w-180')}>
            <RecursiveTabs items={item.children} />
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }
  return null
}

function RecursiveTabs({ items }: { items: NavTreeItem[] }) {
  const [activeTab, setActiveTab] = React.useState<string>()
  if (!items || items.length === 0) return null

  const isVertical = true

  // const TabStyles = isVertical
  //   ? cn('flex w-full flex-col gap-0 rounded-none')
  //   : cn('flex w-full flex-row gap-0 rounded-none')

  // Auto-select the first tab
  const defaultTab = items[0]?.id
  return (
    <Tabs
      defaultValue={defaultTab}
      onValueChange={(value) => setActiveTab(value)}
      orientation={isVertical ? 'vertical' : 'horizontal'}
      value={activeTab}
      className={cn('flex w-full flex-col gap-0 rounded-none')}
    >
      <TabsList
        className={cn(
          'flex items-start justify-center border-b',
          'm-0 w-full min-w-26 rounded-none bg-card/10 p-0',
        )}
      >
        {items
          .filter((item) => item.type === 'category' || item.type === 'page')
          .map((categoryOrPage) => {
            const isDisabled =
              categoryOrPage.type === 'category' &&
              (!categoryOrPage.children || categoryOrPage.children.length === 0)
            return (
              <TabsTrigger
                onMouseEnter={() => setActiveTab(categoryOrPage.id)}
                key={categoryOrPage.id}
                value={categoryOrPage.id}
                disabled={isDisabled}
                className={cn(NavMenuPageOrCategoryItemTriggerStyle, 'group')}
              >
                {categoryOrPage.title}
              </TabsTrigger>
            )
          })}
      </TabsList>

      <div className="m-0 w-full flex-1 overflow-y-auto rounded-none p-0 group-active:border-t-2">
        {items.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className={cn(
              'm-0 flex w-full flex-col rounded-none focus-visible:ring-0 focus-visible:outline-none',
            )}
          >
            <TabContentNode item={item} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

const NavMenuPageOrCategoryItemTriggerStyle = cn(
  'rounded-none max-h-10 min-w-26 w-full text-center px-3 py-2 m-0 ',
  'hover:bg-accent/80',
  'data-[state=active]:text-accent-foreground ',
  `data-[state=active]:bg-accent/70`,
  `data-[state=active]:hover:bg-accent`,
  'font-medium',
  'whitespace-nowrap text-sm transition-color',
  'disabled:pointer-events-none disabled:opacity-50 disabled:bg-none',
  'text-accent-foreground',
  'data-[state=active]:hover:text-accent-foreground',
  'data-[state=active]:hover:font-semibold',
  'data-[state=active]:font-semibold',
)

function TabContentNode({ item }: { item: NavTreeItem }) {
  if (item.type === 'page') {
    return <PageContentLayout item={item} />
  }

  if (item.type === 'category') {
    // Category child Categories and Pages
    if (item.children && item.children.length > 0) {
      return <RecursiveTabs items={item.children} />
    }
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No further content available.
      </div>
    )
  }

  // Fallback for Posts
  if (item.type === 'post') {
    return (
      <Link href={item.url} className="text-sm text-primary hover:underline">
        {item.title}
      </Link>
    )
  }

  return null
}

function PageContentLayout({ item }: { item: NavTreePageItem }) {
  return (
    <div className="flex h-full w-full flex-col p-3">
      <Link
        href={item.url}
        className="mb-6 block rounded-none border-b pb-2 text-2xl font-bold tracking-tight text-foreground hover:text-primary hover:underline"
      >
        {item.title}
      </Link>
      {item.children && item.children.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={`${item.url}#${child.url}`}
              className="block rounded-md border p-2 text-foreground transition-colors hover:bg-muted"
            >
              <div className="text-sm font-medium">{child.title}</div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No posts available under this page.</p>
      )}
    </div>
  )
}

export default function NavMenu({ navTree }: NavMenuProps) {
  const isMobile = useIsMobile()
  const orientation = 'vertical'

  if (isMobile) {
    return (
      <NavigationMenu orientation={orientation}>
        <NavigationMenuList orientation={orientation}>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenu orientation={orientation}>
                <NavigationMenuList orientation={orientation}>
                  <HomeNavigationMenuItem />
                  {navTree.map((item) => (
                    <LevelZeroNode key={item.id} item={item} />
                  ))}
                  <SearchNavigationMenuItem />
                </NavigationMenuList>
              </NavigationMenu>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>
    )
  } else {
    return (
      <NavigationMenu orientation={orientation}>
        <NavigationMenuList orientation={orientation}>
          <HomeNavigationMenuItem />
          {navTree.map((item) => (
            <LevelZeroNode key={item.id} item={item} />
          ))}
          <SearchNavigationMenuItem />
          <NavigationMenuIndicator />
        </NavigationMenuList>
        <NavigationMenuViewport orientation={'vertical'}></NavigationMenuViewport>
      </NavigationMenu>
    )
  }
}

function HomeNavigationMenuItem({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavigationMenuItem {...props}>
          <Link href="/home" passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <span>
                <House className="w-5 text-primary" />
                <span className="md:sr-only">Home</span>
              </span>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </TooltipTrigger>
      <TooltipContent>Home</TooltipContent>
    </Tooltip>
  )
}

function SearchNavigationMenuItem({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavigationMenuItem {...props}>
          <Link href="/search" passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <span>
                <SearchIcon className="w-5 text-primary" />
                <span className="md:sr-only">Search</span>
              </span>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </TooltipTrigger>
      <TooltipContent>Search</TooltipContent>
    </Tooltip>
  )
}
