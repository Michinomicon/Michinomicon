import {
  CreditCardIcon,
  House,
  Loader,
  type LucideIcon,
  SearchIcon,
  SquareCheckIcon,
  SquareChevronUpIcon,
  SquarePowerIcon,
  ToggleRight,
} from 'lucide-react'
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
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'
import {
  NavTreeCategoryItem,
  NavTreeItem,
  NavTreePageItem,
  NavTreePostItem,
} from '@/utilities/buildNavTree'
import { NavigationMenuSub } from '@radix-ui/react-navigation-menu'

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

type PostAnchor = {
  id: string
  title: string
}

type NavMenuProps = {
  navTree: NavTreeItem[]
  postAnchors?: PostAnchor[]
}

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

const getNavigationMenuItemForPost = (navTreeItem: NavTreePostItem) => {
  return (
    <NavigationMenuLinkListItem
      href={navTreeItem.url}
      key={navTreeItem.title}
      title={navTreeItem.title}
    ></NavigationMenuLinkListItem>
  )
}

function PageNavigationMenuContent(navTreePageItem: NavTreePageItem) {
  const childPosts = navTreePageItem.children.filter((item) => item.type === 'post')
  return (
    <div className="pl-4 min-w-80">
      <NavigationMenuLink asChild>
        <Link passHref href={`/${navTreePageItem.url}`}>
          <div className="font-medium text-primary text-sm uppercase">{navTreePageItem.title}</div>
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

function CategoryNavigationMenuItem(navTreeItem: NavTreeCategoryItem) {
  const segment = useSelectedLayoutSegment()
  const childPages = navTreeItem.children.filter((item) => item.type === 'page')
  const slugsInThisCategory = childPages.map((p) => p.url)
  const isActive = segment
    ? navTreeItem.url.includes(segment) || slugsInThisCategory.includes(segment)
    : false

  const subCategories = navTreeItem.children
    .filter((item) => item.type === 'category')
    .filter((subCat) => subCat.children.length > 0)

  const subCategoryCount = subCategories.length ?? 0
  const childPagesCount = childPages.length ?? 0

  const contentCols = Math.max(subCategoryCount + childPagesCount, 1)
  //   className={cn(`grid min-w-80 grid-cols-${contentCols} gap-3 divide-x p-4`)}

  console.debug(`"${navTreeItem.title}" isActive:`, isActive)
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
      <NavigationMenuContent className="px-0 py-1">
        <div
          className={cn(`grid min-w-80 min-h-30 grid-cols-${childPagesCount} gap-3 divide-x p-4`)}
        >
          {childPages.map(getNavigationMenuItem)}
          {/* <div>
            {subCategoryCount >= 1 && (
              <NavigationMenuSub defaultValue={subCategories[0].id}>
                <NavigationMenuList>
                  {subCategories.map((subCat) => CategoryNavigationMenuItem(subCat))}
                </NavigationMenuList>
              </NavigationMenuSub>
            )}
          </div> */}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

export default function NavMenu({ navTree }: NavMenuProps) {
  return (
    <NavigationMenu className="text-primary">
      <NavigationMenuList>
        <HomeNavigationMenuItem />

        {navTree.map(getNavigationMenuItem)}

        {/* <DemoMenuItems></DemoMenuItems> */}

        <SearchNavigationMenuItem />
        <NavigationMenuIndicator></NavigationMenuIndicator>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

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
