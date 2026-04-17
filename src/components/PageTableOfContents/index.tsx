'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NavTreeItem } from '@/utilities/buildNavTree'
import {
  ArrowLeftFromLine,
  ArrowRightToLine,
  CircleSmall,
  ListTree,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  useSidebar,
  SidebarRail,
} from '../ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

type PageTableOfContentsProps = {
  navTree: NavTreeItem[]
}

export enum HeadingTagDepth {
  'h1' = 1,
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
}

export type TableOfContentsItem = {
  depth: number
  id: string
  title: string
  url: string
}

function generateHeadingTagSlug(textContent: string): string {
  return textContent
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with a hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
}

function collectHeadingTagReferences(
  node?: Element,
  headings: Array<TableOfContentsItem> = [],
  encounteredIds: Map<string, number> = new Map(),
): TableOfContentsItem[] {
  // Skip non-element nodes
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return headings
  // if is heading tag, collect it
  const lowerCaseTagName = node.tagName.toLowerCase()
  if (
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(lowerCaseTagName) &&
    node.textContent &&
    node.textContent.trim().length > 0
  ) {
    let { id } = node
    const textContent = node.textContent

    // if tag has no ID, create and assign unique ID
    if (!id) {
      const baseId = generateHeadingTagSlug(textContent) || 'heading'
      let uniqueId = baseId
      // If ID already exists, append a number
      if (encounteredIds.has(uniqueId)) {
        let count = encounteredIds.get(uniqueId)!
        do {
          count++
          uniqueId = `${baseId}-${count}`
        } while (encounteredIds.has(uniqueId))
        encounteredIds.set(baseId, count)
      }
      id = uniqueId
      node.setAttribute('id', id)
      node.classList.add('scroll-mt-[120px]')
    }
    // update encountered IDs
    encounteredIds.set(id, 1)

    headings.push({
      depth: HeadingTagDepth[lowerCaseTagName as keyof typeof HeadingTagDepth],
      id: id,
      title: textContent,
      url: `#${id}`,
    })
  }
  // recursive for child nodes
  for (const child of node.children) {
    collectHeadingTagReferences(child, headings)
  }
  return headings
}

function useActiveTocItem(tocContent: TableOfContentsItem[]) {
  const [tableOfContents, setTableOfContents] =
    React.useState<Array<TableOfContentsItem>>(tocContent)
  const [itemIds, setItemIds] = React.useState<string[]>([])
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const itemIds: string[] = tableOfContents
      .filter(({ id }) => id && id.trim().length > 0)
      .map<string>(({ id }) => id)
    setItemIds(itemIds)
  }, [tableOfContents])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0% 0% -80% 0%' },
    )

    for (const id of itemIds) {
      if (id.trim().length > 0) {
        const element = document.getElementById(id)
        if (element) {
          observer.observe(element)
        }
      }
    }

    return () => {
      for (const id of itemIds) {
        if (id.trim().length > 0) {
          const element = document.getElementById(id)
          if (element) {
            observer.unobserve(element)
          }
        }
      }
    }
  }, [itemIds])

  return {
    activeId,
    tocContent,
    setTocContent: setTableOfContents,
  }
}

function findPagePathByUrl(
  tree: NavTreeItem[],
  targetUrl: string,
  progress: NavTreeItem[] = [],
): NavTreeItem[] | false {
  for (const treeItem of tree) {
    if (treeItem.type === 'page' && `/${treeItem.url}` === targetUrl) {
      return [...progress, treeItem]
    }
    if (treeItem.type === 'category') {
      const result = findPagePathByUrl(treeItem.children, targetUrl, [...progress, treeItem])
      if (result) {
        return result
      }
    }
  }
  return false
}

function PathPathBreadcrumbs({ pathToPage }: { pathToPage: NavTreeItem[] | false }) {
  if (!pathToPage) {
    return <></>
  }
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap">
        {pathToPage.map((item, index) => {
          const notLast = index < pathToPage.length - 1
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <div className="gap-2 min-h-6 text-primary font-medium">{item.title}</div>
              </BreadcrumbItem>

              {notLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function PageContentsHeadingList({ tableOfContents }: { tableOfContents: TableOfContentsItem[] }) {
  const { activeId, tocContent } = useActiveTocItem(tableOfContents)
  return (
    <div className="flex flex-col w-full h-auto rounded-none">
      {tocContent.map((item, index) => {
        const isH1 = item.depth === 1
        const isActive = item.url === `#${activeId}`
        return (
          <div
            className={cn('rounded-none', isH1 ? `text-primary text-xl` : 'text-xs')}
            key={index}
          >
            <Link
              key={item.id}
              href={item.url}
              className={cn(
                'text-xs align-middle',
                'overflow-hidden whitespace-nowrap text-muted-foreground no-underline flex flex-row flex-flex-nowrap transition-colors hover:text-foreground data-[active=true]:text-primary',
                'data-[depth=1]:pl-0 data-[depth=2]:pl-0 data-[depth=3]:pl-3 data-[depth=4]:pl-6 data-[depth=5]:pl-9 data-[depth=6]:pl-12',
              )}
              data-active={isActive}
              data-depth={item.depth}
            >
              <CircleSmall strokeWidth={isActive ? 1.5 : 0} className="my-auto">
                <circle
                  r="3"
                  cx="12"
                  cy="12"
                  stroke="none"
                  fill="currentColor"
                  className={'text-foreground'}
                />
              </CircleSmall>
              <div className="self-center">{item.title}</div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

type PageTOCProps = Omit<ButtonProps & React.RefAttributes<HTMLButtonElement>, 'onClick'>
export function PageTableOfContentsTrigger(props: PageTOCProps) {
  const { variant: variantFromProps, onMouseLeave, ...restProps } = props
  const { toggleSidebar, open } = useSidebar()
  const buttonVariant = variantFromProps || 'outline'

  const [isClicked, setIsClicked] = React.useState(false)

  const handlePointerLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(false) // Reset the hover
    onMouseLeave?.(e) // Fire original onMouseLeave
  }

  const handleClick = () => {
    setIsClicked(true) // skip hover
    toggleSidebar()
  }

  const buttonStyles = cn(
    'group relative flex h-10 w-20 items-center justify-center overflow-hidden rounded-lg transition-colors ',
  )

  const listTreeIconStyles = cn(
    'absolute size-5 transition-transform duration-150 ease-in',
    // translate on hover if the button been clicked
    !isClicked && (open ? 'group-hover:-translate-x-3' : 'group-hover:translate-x-3'),
  )

  const arrowIconStyles = cn(
    'absolute size-5 opacity-0 transition-all duration-100 delay-0 ease-in',
    // translate,opacity on hover if the button been clicked
    !isClicked && 'group-hover:opacity-100',
    !isClicked && (open ? 'group-hover:translate-x-3 ' : 'group-hover:-translate-x-3'),
  )

  return (
    <Tooltip delayDuration={800}>
      <TooltipTrigger asChild>
        <Button
          variant={buttonVariant}
          size="sm"
          {...restProps}
          onClick={handleClick}
          onMouseLeave={handlePointerLeave}
          className={buttonStyles}
          aria-label={`${open ? 'Collapse Table of Contents' : 'Show Table of Contents'}`}
        >
          {open ? (
            <React.Fragment>
              <ListTree className={listTreeIconStyles} />
              <ArrowRightToLine className={arrowIconStyles} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <ListTree className={listTreeIconStyles} />
              <ArrowLeftFromLine className={arrowIconStyles} />
            </React.Fragment>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{open ? 'Collapse Page Table of Contents' : 'Show Page Table of Contents'}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function PageTableOfContents({ navTree }: PageTableOfContentsProps) {
  const { toggleSidebar, open: sidebarOpen } = useSidebar()

  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [pathToPage, setPathToPage] = React.useState<NavTreeItem[] | false>(false)
  const [tableOfContents, setTableOfContents] = React.useState<Array<TableOfContentsItem>>([])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setPathToPage(findPagePathByUrl(navTree, pathname))
    if (document?.body) {
      const headingTags = collectHeadingTagReferences(document.body)
      setTableOfContents(headingTags)
    }
  }, [navTree, pathname])

  if (!mounted) {
    return <></>
  }

  return (
    <Sidebar
      side="right"
      variant="inset"
      collapsible="offcanvas"
      className={cn(
        '',
        'pl-0 pr-6',
        'pt-[calc(var(--header-height)+0px)]',
        'pb-[calc(var(--footer-height)+0px)]',
        'max-h-[calc(100svh-calc(var(--header-height)+0px))-calc(var(--footer-height)+0px)] z-10 border-sidebar border bg-sidebar',
      )}
    >
      <SidebarHeader className="flex flex-row align-middle items-center flex-nowrap border-b rounded-none">
        <Button variant="ghost" size="icon" className={cn('mr-auto')} onClick={toggleSidebar}>
          {sidebarOpen ? <PanelRightClose /> : <PanelRightOpen />}
        </Button>
        <div className="grow">Page Contents</div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-start bg-blend-darken h-auto max-h-full">
        <SidebarGroup>
          <PathPathBreadcrumbs pathToPage={pathToPage} />
        </SidebarGroup>
        <SidebarGroup className="flex flex-col bg-blend-darken">
          <PageContentsHeadingList tableOfContents={tableOfContents} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail className="border-sidebar-foreground/70 hover:border-sidebar-border" />
    </Sidebar>
  )
}
