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
import { TOCItem } from '@/providers/PageTOC'

type PageTableOfContentsProps = {
  // pageTOC:TOCItem[],
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

function generateHeadingTagSlug(textContent: string): string {
  return textContent
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with a hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
}

function collectHeadingTagReferences(
  pageSlug: string,
  node?: Element | null,
  parentSlug?: string | null,
  headings: Array<TOCItem> = [],
  encounteredIds: Map<string, number> = new Map(),
): TOCItem[] {
  // Skip non-element nodes
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return headings

  const lowerCaseTagName = node.tagName.toLowerCase()
  const isPost = node.getAttribute('data-post') === 'true'
  const postSlug = isPost ? node.getAttribute('data-post-slug') : parentSlug ? parentSlug : ''
  parentSlug = postSlug

  // if is heading tag, collect it
  if (
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(lowerCaseTagName) &&
    node.textContent &&
    node.textContent.trim().length > 0
  ) {
    let { id } = node
    const textContent = node.textContent
    const isPostHeading = node.getAttribute('data-post-title') === 'true'
    const baseId = generateHeadingTagSlug(
      !isPostHeading && lowerCaseTagName !== 'h1'
        ? `${parentSlug}-${textContent}`
        : `${textContent}`,
    )

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

    // update encountered IDs
    encounteredIds.set(id, 1)

    const treeDepth =
      HeadingTagDepth[lowerCaseTagName as keyof typeof HeadingTagDepth] +
      (parentSlug && parentSlug?.trim().length >= 0 && !isPostHeading ? 2 : 0)

    headings.push({
      depth: treeDepth,
      id: id,
      title: textContent,
      url: `${pageSlug}#${id}`,
    })
  }

  // recursive for child nodes
  for (const child of node.children) {
    collectHeadingTagReferences(pageSlug, child, parentSlug, headings)
  }

  return headings
}

function useActiveTocItem(tocContent: TOCItem[]) {
  const [tableOfContents, setTableOfContents] = React.useState<Array<TOCItem>>(tocContent)
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
      // TODO - Improve accuracy or reduce window of activation
      { rootMargin: '0% 0% -90% 0%' },
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
    setActiveId,
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
      <BreadcrumbList className="gap-y-0 md:gap-y-0">
        {pathToPage.map((item, index) => {
          const notLast = index < pathToPage.length - 1
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <div className="min-h-6 gap-2 font-medium text-primary">{item.title}</div>
              </BreadcrumbItem>

              {notLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function PageContentsHeadingList({ tableOfContents }: { tableOfContents: TOCItem[] }) {
  const { activeId, setActiveId, tocContent } = useActiveTocItem(tableOfContents)
  return (
    <div className="flex h-auto w-full flex-col rounded-none">
      {tocContent.map((item, index) => {
        const isH1 = item.depth === 1
        const isActive = item.id === activeId
        // console.debug(`isActive: ${item.id} === ${activeId}`, isActive)
        return (
          <div
            className={cn('rounded-none', isH1 ? `text-xl text-primary` : 'text-xs')}
            key={index}
            title={item.id}
          >
            <Link
              key={item.id}
              href={item.url}
              className={cn(
                'align-middle text-xs',
                'flex-flex-nowrap flex flex-row overflow-hidden whitespace-nowrap text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:text-primary',
                'data-[depth=1]:pl-0',
                'data-[depth=2]:pl-2',
                'data-[depth=3]:pl-4',
                'data-[depth=4]:pl-6',
                'data-[depth=5]:pl-9',
                'data-[depth=6]:pl-12',
              )}
              data-active={isActive}
              data-depth={item.depth}
              onNavigate={() => {
                console.debug(`onNavigate link "${item.url}"`)
                setActiveId(item.id)
              }}
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
              <div className="self-center whitespace-normal">{item.title}</div>
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
  const [tableOfContents, setTableOfContents] = React.useState<Array<TOCItem>>([])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const pagePath = findPagePathByUrl(navTree, pathname)
    setPathToPage(pagePath)

    if (document?.body) {
      const currentPageSlug = pagePath ? pagePath[pagePath.length - 1].url : ''
      const headingTags = collectHeadingTagReferences(currentPageSlug, document.body)
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
        'pr-0 pl-0',
        'pt-[calc(var(--header-height)+0px)]',
        'pb-[calc(var(--footer-height)+0px)]',
        'z-10 max-h-[calc(100svh-calc(var(--header-height)+0px))-calc(var(--footer-height)+0px)] border border-sidebar bg-sidebar',
      )}
    >
      <SidebarHeader className="flex flex-row flex-nowrap items-center rounded-none border-b align-middle">
        <Button variant="ghost" size="icon" className={cn('mr-auto')} onClick={toggleSidebar}>
          {sidebarOpen ? <PanelRightClose /> : <PanelRightOpen />}
        </Button>
        <div className="grow">Page Contents</div>
      </SidebarHeader>
      <SidebarContent className="flex h-auto max-h-full flex-col justify-start bg-blend-darken">
        <SidebarGroup className="max-w-(--sidebar-width)">
          <PathPathBreadcrumbs pathToPage={pathToPage} />
        </SidebarGroup>
        <SidebarGroup className="flex max-w-(--sidebar-width) flex-col bg-blend-darken">
          <PageContentsHeadingList tableOfContents={tableOfContents} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail className="border-sidebar-foreground/70 hover:border-sidebar-border" />
    </Sidebar>
  )
}
