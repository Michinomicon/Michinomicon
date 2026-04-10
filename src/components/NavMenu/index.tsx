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
} from '@/components/ui/navigation-menu'
import { NavTreeItem, NavTreePageItem } from '@/utilities/buildNavTree'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
          className={cn(navigationMenuTriggerStyle(), 'opacity-50 pointer-events-none')}
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
          <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'text-primary')}>
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
        <NavigationMenuTrigger className="text-primary">{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="w-full md:w-100 lg:w-150">
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
        <NavigationMenuTrigger className="text-primary">{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="w-full md:w-100 lg:w-180">
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

  // Auto-select the first tab
  const defaultTab = items[0]?.id
  return (
    <Tabs
      defaultValue={defaultTab}
      onValueChange={(value) => setActiveTab(value)}
      value={activeTab}
      className="flex flex-row w-full h-full min-h-60 rounded-none gap-0"
    >
      <TabsList className="bg-card/10 flex flex-col max-w-62.5 min-w-26 w-auto h-auto justify-start items-start p-0 rounded-none border-r m-0">
        {items.map((item) => {
          const isDisabled =
            item.type === 'category' && (!item.children || item.children.length === 0)

          return (
            <TabsTrigger
              onMouseEnter={() => setActiveTab(item.id)}
              key={item.id}
              value={item.id}
              disabled={isDisabled}
              className={cn(
                'rounded-none max-h-10 min-w-26 max-w-70 w-full justify-start text-left px-3 py-2 m-0 ',
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
              )}
            >
              {item.title}
            </TabsTrigger>
          )
        })}
      </TabsList>

      <div className="flex-1 rounded-none overflow-y-auto p-0 m-0">
        {items.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className="rounded-none m-0 w-full h-full focus-visible:outline-none focus-visible:ring-0"
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
      return <RecursiveTabs items={item.children} />
    }
    return (
      <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
        No further content available.
      </div>
    )
  }

  // Fallback for Posts
  if (item.type === 'post') {
    return (
      <Link href={item.url} className="text-sm hover:underline text-primary">
        {item.title}
      </Link>
    )
  }

  return null
}

function PageContentLayout({ item }: { item: NavTreePageItem }) {
  return (
    <div className="flex flex-col h-full p-3">
      <Link
        href={item.url}
        className="text-2xl font-bold tracking-tight hover:underline mb-6 pb-2 border-b rounded-none block text-foreground hover:text-primary"
      >
        {item.title}
      </Link>
      {item.children && item.children.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={`${item.url}#${child.url}`}
              className="block p-2 border rounded-md hover:bg-muted transition-colors text-foreground"
            >
              <div className="font-medium text-sm">{child.title}</div>
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
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <HomeNavigationMenuItem />
        {navTree.map((item) => (
          <LevelZeroNode key={item.id} item={item} />
        ))}
        <SearchNavigationMenuItem />
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  )
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
