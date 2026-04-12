'use client'

import { ChevronRight, House, SearchIcon, SquareArrowRightExit } from 'lucide-react'
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
import { NavTreeCategoryItem, NavTreeItem, NavTreePageItem } from '@/utilities/buildNavTree'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const BaseNavMenuItemTriggerStyle = cn(
  'rounded-none font-medium whitespace-nowrap text-sm transition-color text-accent-foreground bg-accent/20',
  'hover:bg-accent/80',
  'data-[state=active]:text-accent-foreground ',
  `data-[state=active]:bg-accent/70`,
  'data-[state=active]:font-semibold',
  `data-[state=active]:hover:bg-accent`,
  'data-[state=active]:hover:text-accent-foreground',
  'data-[state=active]:hover:font-semibold',
  'disabled:pointer-events-none disabled:opacity-50 disabled:bg-none',
)

const MenuTabsStyles = {
  vertical: {
    NavigationMenuContent: {
      page: cn('md:w-100 lg:w-150'),
      category: cn('md:w-100 lg:w-150'),
    },
    Tabs: 'flex flex-row w-full h-full min-h-60 rounded-none gap-0',
    TabsList:
      'bg-card/10 flex flex-col max-w-62.5 min-w-26 w-auto h-auto justify-start items-start p-0 rounded-none border-r m-0',
    TabsTrigger: {
      trigger: cn(
        BaseNavMenuItemTriggerStyle,
        'max-h-10 min-w-26 max-w-70 w-full justify-start text-left px-3 py-2 m-0',
      ),
      triggerActiveIconCenter: cn(
        'transition-all opacity-0 ease-in duration-300 delay-100',
        'group-data-[state=active]:opacity-100 group-data-[state=active]:translate-x-2',
      ),
      triggerActiveIconRight: cn(
        'absolute size-5 -left-1 z-10 transition-all opacity-0 ease-in duration-300 delay-100',
        'group-data-[state=active]:group-hover:opacity-100 group-data-[state=active]:group-hover:translate-x-1',
      ),
    },
    TabsContentWrapper: 'flex-1 rounded-none overflow-y-auto p-0 m-0',
    TabsContent: 'rounded-none m-0 focus-visible:outline-none focus-visible:ring-0',
    TabContentNode: {
      category: {
        noContentMessage: 'text-sm text-muted-foreground flex items-center justify-center',
      },
      fallbackPostLink: 'text-sm hover:underline text-primary',
    },
    PageContentLayout: {
      container: 'flex flex-col p-3',
      pageTitleLink:
        'text-sm font-bold tracking-tight hover:underline mb-6 pb-2 border-b rounded-none block text-foreground hover:text-primary',
      postItemLink: 'block p-2 border rounded-md hover:bg-muted transition-colors text-foreground',
      postItemLinkText: 'font-medium text-sm',
      postContainer: 'grid grid-cols-2 gap-2',
      noPostsMessage: 'text-sm text-muted-foreground',
    },
  },
  horizontal: {
    NavigationMenuContent: {
      page: cn(),
      // 'md:w-100 lg:w-150',
      // 'flex-col',
      category: cn(),
      // 'md:w-100 lg:w-150',
      // 'flex-col',
    },
    Tabs: 'rounded-none gap-0',
    TabsList:
      'pointer-events-none flex flex-col p-0 rounded-none m-0 group border-b border-sidebar-border/20 has-hover:border-sidebar-border/60 has-hover:border-b-2',
    TabsTrigger: {
      trigger: cn(
        BaseNavMenuItemTriggerStyle,
        'group pointer-events-auto w-50 h-6 text-center m-0 hover:border-sidebar-border/40 hover:border-b',
      ),
      triggerActiveIconCenter: cn(
        'absolute size-5 top-[1.05rem] z-10 transition-all opacity-0 ease-in duration-300 delay-100',
        'group-data-[state=active]:group-hover:opacity-100 group-data-[state=active]:group-hover:translate-y-2.5',
      ),
      triggerActiveIconRight: cn(
        'absolute size-5 right-5 z-10 -translate-x-1 transition-all opacity-0 ease-in duration-300 delay-100',
        'group-data-[state=active]:group-hover:opacity-100 group-data-[state=active]:group-hover:translate-x-1',
      ),
    },
    TabsContentWrapper: 'rounded-none overflow-visible p-0 m-0 transition-all ',
    TabsContent: 'rounded-none m-0 focus-visible:outline-none focus-visible:ring-0 ',
    TabContentNode: {
      category: {
        noContentMessage: 'text-sm text-muted-foreground flex items-center justify-center h-full',
      },
      fallbackPostLink: 'text-sm hover:underline text-primary',
    },
    PageContentLayout: {
      container:
        'overflow-visible flex flex-col hover:border-t-2 rounded-t-none hover:border-sidebar-border/60',
      pageTitleLink:
        'h-6 text-sm font-bold whitespace-nowrap tracking-tight hover:underline border-b rounded-none block text-foreground hover:text-primary ',
      postItemLink: 'block p-2 border rounded-md hover:bg-muted transition-colors text-foreground',
      postItemLinkText: 'font-medium text-sm',
      postContainer: 'grid grid-cols-2 gap-2',
      noPostsMessage: 'text-sm text-muted-foreground',
    },
  },
}

type NavMenuLayout = 'vertical' | 'horizontal'

type NavMenuProps = {
  navTree: NavTreeItem[]
}

function LevelZeroNode({ item, layout }: { item: NavTreeItem; layout: NavMenuLayout }) {
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
        <NavigationMenuContent openDirection="default" className={cn('bg-card')}>
          <div className={cn('flex flex-col flex-nowrap')}>
            <TabPageContentLayout item={item} layout={layout} />
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
        <NavigationMenuContent openDirection="default" className={cn('bg-card')}>
          <div className={cn('absolute left-full -top-full flex flex-nowrap')}>
            <RecursiveSubMenu items={item.children} layout={layout} />
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }
  return null
}

function RecursiveSubMenu({
  items,
  depth = 0,
  layout = 'vertical',
}: {
  items: NavTreeItem[]
  depth?: number
  layout: NavMenuLayout
}) {
  if (!items || items.length === 0) return null
  const currentDepth: number = depth

  return (
    <NavigationMenu
      viewport={false}
      orientation={'vertical'}
      className={cn('relative flex flex-row flex-nowrap ')}
    >
      <NavigationMenuList
        className={cn(
          'bg-card p-1 border border-bg-sidebar-primary flex flex-col items-start space-x-0 flex-nowrap',
        )}
      >
        {items
          .filter((item) => item.type === 'category' || item.type === 'page')
          .map((catOrPage) => {
            const getTrigger = (catOrPage: NavTreeCategoryItem | NavTreePageItem) => {
              const isDisabled = !catOrPage.children || catOrPage.children.length === 0
              if (catOrPage.type === 'category') {
                return (
                  <NavigationMenuTrigger
                    className="w-full h-full"
                    disabled={isDisabled}
                    openDirection={'right'}
                  >
                    {catOrPage.title}
                    <ChevronRight
                      className={MenuTabsStyles[layout].TabsTrigger.triggerActiveIconRight}
                    />
                  </NavigationMenuTrigger>
                )
              } else {
                return (
                  <NavigationMenuLink
                    asChild
                    className={cn(navigationMenuTriggerStyle(), 'w-full!')}
                  >
                    <Link href={catOrPage.url}>
                      <div className="flex flex-row justify-center flex-nowrap gap-0.5">
                        <span>{catOrPage.title}</span>
                        <SquareArrowRightExit
                          className={cn(MenuTabsStyles[layout].TabsTrigger.triggerActiveIconRight)}
                        />
                      </div>
                    </Link>
                  </NavigationMenuLink>
                )
              }
            }

            return (
              <NavigationMenuItem key={catOrPage.id} className={cn('group w-34 h-9 relative')}>
                {getTrigger(catOrPage)}
                <NavigationMenuContent
                  openDirection="right"
                  className={cn('bg-card', 'absolute top-0! left-full! -mt-1! ml-2!')}
                >
                  <SubMenuContentNode item={catOrPage} depth={currentDepth} layout={layout} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function SubMenuContentNode({
  item,
  depth = 0,
  layout,
}: {
  item: NavTreeItem
  depth?: number
  layout: NavMenuLayout
}) {
  if (item.type === 'page') {
    return <SubMenuPageContentLayout item={item} layout={layout} />
  }

  if (item.type === 'category') {
    // Category child Categories and Pages
    if (item.children && item.children.length > 0) {
      const nextDepth = depth++
      return <RecursiveSubMenu items={item.children} depth={nextDepth} layout={layout} />
    }
    return (
      <div className={MenuTabsStyles[layout].TabContentNode.category.noContentMessage}>
        No further content available.
      </div>
    )
  }

  // Fallback for Posts
  if (item.type === 'post') {
    return (
      <Link href={item.url} className={MenuTabsStyles[layout].TabContentNode.fallbackPostLink}>
        {item.title}
      </Link>
    )
  }

  return null
}

function SubMenuPageContentLayout({
  item,
  layout,
}: {
  item: NavTreePageItem
  layout: NavMenuLayout
}) {
  return (
    <div className={cn()}>
      <Link href={item.url} className={cn()}>
        Go to page: {item.title} <SquareArrowRightExit />
      </Link>
      {item.children && item.children.length > 0 ? (
        <div className={cn()}>
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={`${item.url}#${child.url}`}
              className={MenuTabsStyles[layout].PageContentLayout.postItemLink}
            >
              <div className={MenuTabsStyles[layout].PageContentLayout.postItemLinkText}>
                {child.title}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className={MenuTabsStyles[layout].PageContentLayout.noPostsMessage}>
          No posts available under this page.
        </p>
      )}
    </div>
  )
}

export default function NavMenu({ navTree }: NavMenuProps) {
  const layout: NavMenuLayout = 'horizontal'
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <HomeNavigationMenuItem />
        {navTree.map((item) => (
          <LevelZeroNode key={item.id} item={item} layout={layout} />
        ))}
        <SearchNavigationMenuItem />
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function RecursiveTabs({
  items,
  depth = 0,
  layout = 'vertical',
}: {
  items: NavTreeItem[]
  depth?: number
  layout: NavMenuLayout
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<string>()
  if (!items || items.length === 0) return null
  const currentDepth: number = depth

  // Auto-select the first tab
  const defaultTab: string = items[0]?.id
  return (
    <Tabs
      orientation={layout}
      defaultValue={defaultTab}
      onValueChange={(value) => setActiveTab(value)}
      value={activeTab}
      className={MenuTabsStyles[layout].Tabs}
    >
      <TabsList className={MenuTabsStyles[layout].TabsList} variant={'default'}>
        {items
          .filter((item) => item.type === 'category' || item.type === 'page')
          .map((catOrPage) => {
            if (catOrPage.type === 'category') {
              const isDisabled = !catOrPage.children || catOrPage.children.length === 0
              return (
                <TabsTrigger
                  onMouseEnter={() => setActiveTab(catOrPage.id)}
                  key={catOrPage.id}
                  value={catOrPage.id}
                  disabled={isDisabled}
                  data-activetab={activeTab === catOrPage.id}
                  className={cn(MenuTabsStyles[layout].TabsTrigger.trigger, 'group')}
                >
                  {catOrPage.title}
                  <ChevronRight
                    className={MenuTabsStyles[layout].TabsTrigger.triggerActiveIconRight}
                  />
                </TabsTrigger>
              )
            } else {
              return (
                <TabsTrigger
                  onMouseEnter={() => setActiveTab(catOrPage.id)}
                  key={catOrPage.id}
                  value={catOrPage.id}
                  data-activetab={activeTab === catOrPage.id}
                  className={cn(MenuTabsStyles[layout].TabsTrigger.trigger, 'group')}
                  asChild
                >
                  <Button
                    onClick={() => router.push(catOrPage.url)}
                    className={cn(
                      MenuTabsStyles[layout].PageContentLayout.pageTitleLink,
                      'no-underline text-nowrap p-0 m-0',
                    )}
                  >
                    <div className="flex flex-row justify-center flex-nowrap gap-0.5">
                      <span>{catOrPage.title}</span>
                      <SquareArrowRightExit
                        className={cn(MenuTabsStyles[layout].TabsTrigger.triggerActiveIconRight)}
                      />
                    </div>
                  </Button>
                </TabsTrigger>
              )
            }
          })}
      </TabsList>

      <div className={MenuTabsStyles[layout].TabsContentWrapper}>
        {items
          .filter((item) => item.type === 'category')
          .map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className={MenuTabsStyles[layout].TabsContent}
            >
              <TabContentNode item={category} depth={currentDepth} layout={layout} />
            </TabsContent>
          ))}
      </div>
    </Tabs>
  )
}

function TabContentNode({
  item,
  depth = 0,
  layout,
}: {
  item: NavTreeItem
  depth?: number
  layout: NavMenuLayout
}) {
  if (item.type === 'page') {
    return <TabPageContentLayout item={item} layout={layout} />
  }

  if (item.type === 'category') {
    // Category child Categories and Pages
    if (item.children && item.children.length > 0) {
      const nextDepth = depth++
      return <RecursiveTabs items={item.children} depth={nextDepth} layout={layout} />
    }
    return (
      <div className={MenuTabsStyles[layout].TabContentNode.category.noContentMessage}>
        No further content available.
      </div>
    )
  }

  // Fallback for Posts
  if (item.type === 'post') {
    return (
      <Link href={item.url} className={MenuTabsStyles[layout].TabContentNode.fallbackPostLink}>
        {item.title}
      </Link>
    )
  }

  return null
}

function TabPageContentLayout({ item, layout }: { item: NavTreePageItem; layout: NavMenuLayout }) {
  return (
    <div className={MenuTabsStyles[layout].PageContentLayout.container}>
      <Link href={item.url} className={MenuTabsStyles[layout].PageContentLayout.pageTitleLink}>
        Go to page: {item.title} <SquareArrowRightExit />
      </Link>
      {item.children && item.children.length > 0 ? (
        <div className={MenuTabsStyles[layout].PageContentLayout.postContainer}>
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={`${item.url}#${child.url}`}
              className={MenuTabsStyles[layout].PageContentLayout.postItemLink}
            >
              <div className={MenuTabsStyles[layout].PageContentLayout.postItemLinkText}>
                {child.title}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className={MenuTabsStyles[layout].PageContentLayout.noPostsMessage}>
          No posts available under this page.
        </p>
      )}
    </div>
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
