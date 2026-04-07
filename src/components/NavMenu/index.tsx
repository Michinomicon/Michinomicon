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
} from '@/components/ui/navigation-menu'
import { NavTreeItem, NavTreePageItem } from '@/utilities/buildNavTree'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

type PostAnchor = {
  id: string
  title: string
}

type NavMenuProps = {
  navTree: NavTreeItem[]
  postAnchors?: PostAnchor[]
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
          <div className="w-100 md:w-125 lg:w-150 p-2">
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
          <div className="w-150 md:w-200 lg:w-250 p-2">
            <RecursiveTabs items={item.children} />
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }
  return null
}

function RecursiveTabs({ items }: { items: NavTreeItem[] }) {
  if (!items || items.length === 0) return null

  // Auto-select the first tab
  const defaultTab = items[0]?.id

  return (
    <Tabs defaultValue={defaultTab} className="flex flex-row w-full h-full min-h-60 gap-2">
      <TabsList className="flex flex-col max-w-62.5 min-w-26 w-auto h-auto justify-start items-start bg-transparent space-y-1 p-0 rounded-none border-r pr-2">
        {items.map((item) => {
          const isDisabled =
            item.type === 'category' && (!item.children || item.children.length === 0)
          return (
            <TabsTrigger
              key={item.id}
              value={item.id}
              disabled={isDisabled}
              className=" max-h-10 min-w-26 max-w-70 w-auto justify-start text-left data-[state=active]:bg-primary/30  data-[state=active]:shadow-none px-3 py-2"
            >
              {item.title}
            </TabsTrigger>
          )
        })}
      </TabsList>

      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className="mt-0 h-full focus-visible:outline-none focus-visible:ring-0"
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
    <div className="flex flex-col h-full">
      <Link
        href={item.url}
        className="text-2xl font-bold tracking-tight hover:underline mb-6 pb-2 border-b rounded-none block text-primary"
      >
        {item.title}
      </Link>
      {item.children && item.children.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={`${item.url}#${child.url}`}
              className="block p-4 border rounded-md hover:bg-muted transition-colors text-primary"
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
      </NavigationMenuList>
      <SearchNavigationMenuItem />
    </NavigationMenu>
  )
}

function HomeNavigationMenuItem({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>) {
  return (
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
  )
}

function SearchNavigationMenuItem({
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuItem>) {
  return (
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
  )
}

/**
 function NavigationMenuLinkListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & {
  href: string
  children?: React.ReactNode
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          style={{
            textDecoration: 'none',
          }}
        >
          <div className="flex flex-col gap-1 text-sm text-nowrap whitespace-nowrap">
            <div className="leading-none font-medium">{title}</div>
            {children && <div className="line-clamp-2 text-muted-foreground">{children}</div>}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
 */

/**
 const components: {
  title: string
  href: string
  description: string
  icon: LucideIcon
}[] = [
  {
    title: 'Accordion',
    href: '/components/accordion',
    description:
      'A vertically stacked set of interactive headings that each reveal a section of content.',
    icon: SquareChevronUpIcon,
  },
  {
    title: 'Button',
    href: '/components/button',
    description: 'Displays a button or a component that looks like a button.',
    icon: SquarePowerIcon,
  },
  {
    title: 'Card',
    href: '/components/card',
    description: 'Displays a card with header, content, and footer.',
    icon: CreditCardIcon,
  },
  {
    title: 'Checkbox',
    href: '/components/checkbox',
    description: 'A control that allows the user to toggle between checked and not checked.',
    icon: SquareCheckIcon,
  },
  {
    title: 'Spinner',
    href: '/components/spinner',
    description: 'Informs users about the status of ongoing processes.',
    icon: Loader,
  },
  {
    title: 'Switch',
    href: '/components/switch',
    description: 'A control that allows the user to toggle between checked and not checked.',
    icon: ToggleRight,
  },
]

function DemoMenuItems() {
  return (
    <React.Fragment>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Products</NavigationMenuTrigger>
        <NavigationMenuContent className="px-0 py-1">
          <div className="grid w-225 grid-cols-3 gap-3 divide-x p-4">
            <div className="col-span-2 pe-2">
              <h6 className="pl-2.5 font-semibold text-muted-foreground text-sm uppercase">
                Capabilities
              </h6>
              <ul className="mt-2.5 grid grid-cols-2 gap-3">
                {components.map((component) => (
                  <NavigationMenuLinkListItem
                    href={component.href}
                    key={component.title}
                    title={component.title}
                  >
                    {component.description}
                  </NavigationMenuLinkListItem>
                ))}
              </ul>
            </div>

            <div className="pl-4">
              <h6 className="pl-2.5 font-semibold text-muted-foreground text-sm uppercase">
                Product & Features
              </h6>
              <ul className="mt-2.5 grid gap-3">
                {components.slice(0, 3).map((component) => (
                  <NavigationMenuLinkListItem
                    href={component.href}
                    key={component.title}
                    title={component.title}
                  >
                    {component.description}
                  </NavigationMenuLinkListItem>
                ))}
              </ul>
            </div>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
        <NavigationMenuContent className="p-4">
          <h6 className="pl-2.5 font-semibold text-muted-foreground text-sm uppercase">
            Solutions
          </h6>
          <ul className="mt-2.5 grid w-100 gap-3 md:w-125 md:grid-cols-2 lg:w-150">
            {components.map((component) => (
              <NavigationMenuLinkListItem
                href={component.href}
                key={component.title}
                title={component.title}
              >
                {component.description}
              </NavigationMenuLinkListItem>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </React.Fragment>
  )
}
 */

/**
 export default function NavMenu({ navTree }: NavMenuProps) {
  return (
    <NavigationMenu className="text-primary">
      <NavigationMenuList>
        <HomeNavigationMenuItem />

        {navTree.map(getNavigationMenuItem)}

        <SearchNavigationMenuItem />
        <NavigationMenuIndicator></NavigationMenuIndicator>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
 */

/**
const getNavigationMenuItem = (navTreeItem: NavTreeItem, _index: number, _array: NavTreeItem[]) => {
  const menuItem = () => {
    switch (navTreeItem.type) {
      case 'category':
        return CategoryNavigationMenuItem(navTreeItem)
      case 'page':
        return PageNavigationMenuContent(navTreeItem)
      case 'post':
        return getNavigationMenuItemForPost(navTreeItem)
    }
  }
  return <React.Fragment key={navTreeItem.id}>{menuItem()}</React.Fragment>
}
 */

/**
 const getNavigationMenuItemForPost = (navTreeItem: NavTreePostItem) => {
  return (
    <NavigationMenuLinkListItem
      href={navTreeItem.url}
      key={navTreeItem.title}
      title={navTreeItem.title}
    ></NavigationMenuLinkListItem>
  )
}
 */

/**
function PageSubMenu(pageItem: NavTreePageItem) {
  const pathname = usePathname()
  const isActive = pathname.includes(pageItem.url)
  const childPosts = pageItem.children.filter((item) => item.type === 'post')
  return (
    <NavigationMenuItem
      key={pageItem.id}
      className={cn(`${isActive ? 'active' : ''}`)}
      value={pageItem.id}
    >
      <NavigationMenuTrigger
        className={cn(`${isActive ? 'font-semibold bg-primary/20 text-primary' : ''}`)}
      >
        <div className={cn(`${isActive ? 'font-semibold ' : ''}`)}>{pageItem.title}</div>
      </NavigationMenuTrigger>
      <NavigationMenuContent aria-orientation='vertical'>
        <NavigationMenuSub className="text-primary flex flex-col" orientation="vertical">
          <NavigationMenuList>
            <NavigationMenuLink asChild>
              <Link passHref href={`/${pageItem.url}`}>
                <div className="whitespace-nowrap font-medium text-primary text-sm uppercase">
                  Open {pageItem.title}
                </div>
              </Link>
            </NavigationMenuLink>
            {childPosts.map((post) => (
              <NavigationMenuLinkListItem
                href={`/${pageItem.url}/#${post.url}`}
                key={post.title}
                title={post.title}
              ></NavigationMenuLinkListItem>
            ))}
            <NavigationMenuIndicator></NavigationMenuIndicator>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenuSub>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}
 */

/**
function PageNavigationMenuContent(
  navTreePageItem: NavTreePageItem,
  title: string = navTreePageItem.title,
) {
  const childPosts = navTreePageItem.children.filter((item) => item.type === 'post')
  return (
    <div className="rounded-none min-w-100 w-full h-fit p-4">
      <NavigationMenuLink asChild>
        <Link passHref href={`/${navTreePageItem.url}`}>
          <div className="whitespace-nowrap font-medium text-primary text-sm uppercase">
            {title}
          </div>
        </Link>
      </NavigationMenuLink>

      <ul className="pl-2.5 mt-2.5">
        {childPosts.map((post) => (
          <NavigationMenuLinkListItem
            href={`/${navTreePageItem.url}/#${post.url}`}
            key={post.title}
            title={post.title}
          ></NavigationMenuLinkListItem>
        ))}
      </ul>
    </div>
  )
}
 */

/**
function CategoryNavigationMenuItem(navTreeItem: NavTreeCategoryItem, isSub: boolean = false) {
  const segment = useSelectedLayoutSegment()
  const childPages = navTreeItem.children.filter((item) => item.type === 'page')
  const isActive = (segment && navTreeItem.url.includes(segment)) || false

  const subCategories = navTreeItem.children.filter((item) => item.type === 'category')
  // .filter((subCat) => subCat.children.length > 0)

  // console.debug(`"${navTreeItem.title}" isActive:`, isActive)

  return (
    <NavigationMenuItem
      key={navTreeItem.id}
      className={cn(`${isActive ? 'active' : ''}`)}
      value={navTreeItem.id}
    >
      <NavigationMenuTrigger
        className={cn(`${isActive ? 'font-semibold bg-primary/20 text-primary' : ''}`)}
      >
        <div className={cn(`${isActive ? 'font-semibold ' : ''}`)}>{navTreeItem.title}</div>
      </NavigationMenuTrigger>
      <NavigationMenuContent className={cn(`min-w-100 w-full min-h-100 h-full`)}>
        <NavigationMenuSub className="text-primary flex flex-col" orientation="vertical">
          <NavigationMenuList>
            {childPages.map((page) => PageSubMenu(page))}
            {subCategories.map((subCat) => CategoryNavigationMenuItem(subCat))}
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenuSub>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}
 */

/**
function GetCategoryContent(subCategories: NavTreeCategoryItem[]) {
  const firstChildId = subCategories[0].id

  return (
    <NavigationMenuSub className="text-primary flex flex-col" orientation="vertical">
      <NavigationMenuList>
        <DemoMenuItems></DemoMenuItems>

        <NavigationMenuIndicator></NavigationMenuIndicator>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenuSub>
  )

  // return (
  //   <Tabs
  //     defaultValue={firstChildId}
  //     orientation="horizontal"
  //     className="flex flex-row flex-nowrap rounded-none border-l"
  //   >
  //     <TabsList className="flex flex-col rounded-none h-full w-full">
  //       {subCategories.map((cat, index) => (
  //         <TabsTrigger key={index} value={cat.id} className="h-11.25 w-20 grow-0 rounded-none">
  //           {cat.title}
  //         </TabsTrigger>
  //       ))}
  //     </TabsList>
  //     {subCategories.map((cat, index) => {
  //       const { pathToCategory, result } = findCategoryPathToPages(cat)
  //       if (result) {
  //         const childPages = result.children.filter((item) => item.type === 'page')
  //         return (
  //           <TabsContent key={index} value={cat.id} className="grow w-full min-w-80">
  //             {childPages.map(getNavigationMenuItem, pathToCategory.join(' / '))}
  //           </TabsContent>
  //         )
  //       }
  //     })}
  //   </Tabs>
  // )
}
 */

/** 
function findCategoryPathToPages(
  item: NavTreeCategoryItem,
  currentTitlePath: string[] = [],
  result:
    | { pathToCategory: string[]; result: NavTreeCategoryItem }
    | { pathToCategory: string[]; result: false } = { pathToCategory: [], result: false },
):
  | { pathToCategory: string[]; result: NavTreeCategoryItem }
  | { pathToCategory: string[]; result: false } {
  const path = [...currentTitlePath, item.title]

  console.debug(`Searching category "${item.title}" at path: ${path.join(', ')}... `)

  const pageChildren = item.children.filter((childItem) => childItem.type === 'page')

  if (pageChildren.length > 0) {
    // Found category with page children
    console.debug(`     => Found page children at path: ${path.join(', ')}... `, {
      pathToCategory: path,
      result: item,
    })
    return {
      pathToCategory: path,
      result: item,
    }
  }

  const categoryChildren = item.children.filter((childItem) => childItem.type === 'category')

  if (categoryChildren.length > 0) {
    // Category has Children that are categories
    console.debug(`Searching children of "${item.title}"...`)

    for (const childCategory of categoryChildren) {
      // Found category with category children
      // Need to go deeper
      const found = findCategoryPathToPages(childCategory, path, result)
      if (found.result) return found
      else {
        console.debug(`Search ended at [${found.pathToCategory}]`, found)
      }
    }
  }
  return {
    pathToCategory: path,
    result: false,
  }
}
*/
