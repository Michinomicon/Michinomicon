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
import { NavTreeItem, NavTreePageItem } from '@/utilities/buildNavTree'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { HeaderRowStyles } from '@/Header/Component.client'

type NavMenuProps = {
  navTree: NavTreeItem[]
}

const navigationMenuTabTriggerStyle = cn(
  'h-9 items-center justify-center rounded-md bg-background text-sm font-medium transition-colors text-accent-foreground',
  'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  'data-[state=active]:text-accent-foreground data-[state=active]:bg-accent/50 data-[state=active]:hover:bg-accent data-[state=active]:focus:bg-accent',
)

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
        <NavigationMenuContent className="animate-in animate-out slide-in-from-top">
          <div
            className={cn(HeaderRowStyles, 'gap-x-1 gap-y-0 p-0', 'w-screen inset-shadow-header')}
          >
            <div className="col-span-2"></div>
            <div className="col-span-8">
              <div className={cn('flex flex-col items-center justify-center')}>
                <PageContentLayout item={item} />
              </div>
            </div>
            <div className="col-span-2"></div>
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
        <NavigationMenuContent className="animate-in animate-out slide-in-from-top">
          <div
            className={cn(HeaderRowStyles, 'gap-x-1 gap-y-0 p-0', 'w-screen inset-shadow-header')}
          >
            <div className="col-span-2"></div>
            <div className="col-span-8">
              <div className={cn('flex flex-col items-center justify-center')}>
                <RecursiveTabs items={item.children} />
              </div>
            </div>
            <div className="col-span-2"></div>
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

  return (
    <Tabs
      onValueChange={(value) => setActiveTab(value)}
      orientation={'vertical'}
      value={activeTab}
      className={cn('flex w-screen flex-col items-center justify-center gap-0 rounded-none')}
    >
      <TabsList
        className={cn(
          'w-max',
          'flex items-center justify-center gap-0',
          'm-0 rounded-none bg-card/10',
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
                className={cn(
                  navigationMenuTabTriggerStyle,
                  'group flex shrink grow-0 flex-col rounded-t-md px-2',
                )}
              >
                <div className={cn('flex px-1')}>
                  <span className="text-accent-foreground">{categoryOrPage.title}</span>{' '}
                  <ChevronDown
                    size={0.5}
                    className="relative top-px ml-1 h-3 w-3 transition duration-300 group-data-[state=active]:rotate-180"
                    aria-hidden="true"
                  />
                </div>
              </TabsTrigger>
            )
          })}
      </TabsList>

      <div
        className={cn(
          'm-0 flex w-full min-w-max flex-1 items-center justify-center overflow-x-hidden overflow-y-auto rounded-none border-0 border-t border-border/10 bg-card/30 p-0 inset-shadow-header duration-300 animate-in animate-out slide-in-from-top',
        )}
      >
        {items.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className={cn(
              'm-0 flex w-max flex-col items-center justify-center rounded-none focus-visible:ring-0 focus-visible:outline-none',
            )}
          >
            <TabContentNode item={item} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

function TabContentNode({ item }: { item: NavTreeItem }) {
  if (item.type === 'page') {
    return <PageContentLayout item={item} />
  }

  if (item.type === 'category') {
    // Category child Categories and Pages
    if (item.children && item.children.length > 0) {
      // If a category only contains a single child and it is a page,
      // then promote that page to serve as the category contents
      if (item.children.length === 1 && item.children[0].type === 'page') {
        return <PageContentLayout item={item.children[0]} />
      } else {
        return <RecursiveTabs items={item.children} />
      }
    }
    return (
      <div className="flex h-full w-full items-center justify-center text-center text-sm text-muted-foreground">
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
    <div className="flex h-full w-full flex-col justify-center p-1">
      <div className="w-full text-center">
        <Link
          href={item.url}
          className="mb-6 block rounded-none pb-1 text-2xl font-bold tracking-tight text-foreground hover:text-primary hover:underline"
        >
          {item.title}
        </Link>
      </div>

      {item.children && item.children.length > 0 ? (
        <div className="mx-auto grid auto-cols-max grid-flow-col-dense gap-2">
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
        <p className="text-center text-sm text-muted-foreground">
          No posts available under this page.
        </p>
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
    <Tooltip delayDuration={800} disableHoverableContent={true}>
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
    <Tooltip delayDuration={800} disableHoverableContent={true}>
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
