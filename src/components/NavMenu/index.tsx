import { ChevronDown, ChevronRightIcon, House, SearchIcon } from 'lucide-react'
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
import { Button } from '../ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'
import { AppMainLogo } from '../AppMainLogo'

type NavMenuProps = {
  appTitle?: string
  navTree: NavTreeItem[]
}

const navigationMenuTabTriggerStyle = cn(
  'h-9 items-center justify-center rounded-md bg-background text-sm font-medium transition-colors text-accent-foreground',
  'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  'data-[state=active]:text-accent-foreground data-[state=active]:bg-accent/50 data-[state=active]:hover:bg-accent data-[state=active]:focus:bg-accent',
)

function NavigationMenuLevelZeroNode({ item }: { item: NavTreeItem }) {
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
  const isMobile = useIsMobile()
  return (
    <div className="flex h-full w-full flex-col justify-center p-1">
      <div className={cn('w-full', isMobile ? 'text-left' : 'text-center')}>
        <Link
          href={item.url}
          className="mb-6 block rounded-none pb-1 text-2xl font-bold tracking-tight text-foreground hover:text-primary hover:underline"
        >
          {item.title}
        </Link>
      </div>

      {item.children && item.children.length > 0 ? (
        <div
          className={cn(
            'mx-auto grid grid-flow-col-dense gap-2',
            isMobile ? 'auto-cols-max grid-cols-2' : 'auto-cols-max',
          )}
        >
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

function MobileMenuItem(item: NavTreeItem) {
  const hasChildren = item.children && item.children.length > 0

  // Empty Category -> Disabled Item
  if (item.type === 'category' && !hasChildren) {
    return (
      <div key={item.id} className="rounded-none">
        <Button
          disabled
          variant="ghost"
          size="lg"
          className={cn('w-full justify-start gap-2 rounded-none text-lg text-primary')}
        >
          <span>{item.title}</span>
        </Button>
      </div>
    )
  }

  // Any Item without children (Page/Post)
  // OR
  // PAGE with children (Posts)
  if (item.type === 'page' || !hasChildren) {
    return (
      <div key={item.id} className="rounded-none">
        <Button
          asChild
          variant="ghost"
          size="lg"
          className={cn(
            'group mt-1 mr-1 mb-1 ml-3 w-full justify-start rounded-none text-lg text-foreground transition-none',
            'rounded-tl-none border-l border-l-primary/50 bg-card/40 hover:border-l-2 hover:border-l-primary-foreground',
          )}
        >
          <Link href={item.url} passHref>
            {item.title}
          </Link>
        </Button>
      </div>
    )
  }

  // CATEGORY with children
  if (item.type === 'category') {
    return (
      <Collapsible key={item.id} className={'w-full'}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              'group mt-1 mr-1 ml-3 w-full justify-start rounded-none text-lg text-foreground transition-none',
              'rounded-tl-none border-l border-l-primary/50 bg-card/40 hover:border-l-2 hover:border-l-primary-foreground',
            )}
          >
            {item.title}
            <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="rounded-none">
          <div className="mb-3 ml-3 flex flex-col gap-x-1 rounded-none rounded-bl-sm border-b border-l border-b-primary/50 border-l-primary/50 bg-card/40">
            {item.children.map((child) => MobileMenuItem(child))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }
  return null
}

function MobileMenuContent(navTree: NavTreeItem[]) {
  return (
    <div className={'flex h-screen w-full flex-col overflow-hidden px-4'}>
      <div className="flex h-full flex-col items-center justify-stretch gap-y-1 overflow-x-hidden overflow-y-auto rounded-none rounded-bl-sm border border-primary/30 bg-card/20 py-2 pr-2">
        {navTree.map((item) => MobileMenuItem(item))}
      </div>
    </div>
  )
}

export default function NavMenu({ navTree, appTitle }: NavMenuProps) {
  const isMobile = useIsMobile()
  const orientation = 'vertical'

  if (isMobile) {
    return (
      <Drawer direction={'bottom'}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="group w-full items-center justify-center text-accent-foreground transition-colors"
          >
            Menu
            <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-background data-[vaul-drawer-direction=bottom]:max-h-screen data-[vaul-drawer-direction=bottom]:min-h-screen">
          <DrawerHeader>
            <DrawerTitle className="text-center">
              <div className="w-full">
                <AppMainLogo
                  variant={'default'}
                  text={appTitle}
                  className={'items-center justify-center'}
                />
              </div>
            </DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          {MobileMenuContent(navTree)}
          <DrawerFooter>
            <div className="flex flex-col items-center justify-stretch gap-x-1 rounded-none px-8">
              <div className="mb-2 flex w-full flex-row items-center justify-around gap-x-1 rounded-none border-t border-b border-t-primary border-b-primary">
                <Button variant={'link'} size={'lg'} className={'text-primary'} asChild>
                  <Link href="/home" passHref>
                    <House className="w-5" />
                    <span>Home</span>
                  </Link>
                </Button>
                <Button variant={'link'} size={'lg'} className={'text-primary'} asChild>
                  <Link href="/search" passHref>
                    <SearchIcon className="w-5" />
                    <span>Search</span>
                  </Link>
                </Button>
              </div>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  } else {
    return (
      <NavigationMenu orientation={orientation}>
        <NavigationMenuList orientation={orientation}>
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
