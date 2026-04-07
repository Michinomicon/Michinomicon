'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NavTreeItem } from '@/utilities/buildNavTree'
import { cn } from '@/lib/utils'
import { PageAnchor } from '@/providers/PageAnchors'

type BreadcrumbNavProps = {
  navTree: NavTreeItem[]
  anchors: PageAnchor[]
}

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

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

    for (const id of itemIds ?? []) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => {
      for (const id of itemIds ?? []) {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      }
    }
  }, [itemIds])

  return activeId
}

// recursively find the current active path based on the URL
function findPathToUrl(
  tree: NavTreeItem[],
  targetUrl: string,
  currentPath: NavTreeItem[] = [],
): NavTreeItem[] {
  for (const node of tree) {
    const path = [...currentPath, node]
    if (node.type === 'page' && `/${node.url}` === targetUrl) {
      return path
    }
    if (node.children.length > 0) {
      const found = findPathToUrl(node.children, targetUrl, path)

      if (found) return found
    }
  }
  return []
}

export function PageBreadcrumbNav({ navTree, anchors }: BreadcrumbNavProps) {
  const pathname = usePathname()
  const activePath = React.useMemo(() => findPathToUrl(navTree, pathname), [navTree, pathname])
  const itemIds = React.useMemo(() => anchors.map((a) => a.id), [anchors])
  const activeHeading = useActiveItem(itemIds ?? [])

  const anchorNavItems = anchors.map(
    (a) =>
      ({ id: a.id, url: `#${a.id}`, title: a.title, type: 'post', children: [] }) as NavTreeItem,
  )

  const crumbs = [...activePath, ...anchorNavItems]

  const vertical = true

  if (vertical) {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 p-4 pt-0 text-sm',
          'bg-card font-medium text-muted-foreground',
        )}
      >
        <div className="flex flex-col gap-2 relative">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap min-h-6">
              {activePath.map((item, index) => {
                const isLast = index >= activePath.length - 1
                return (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      <div className="text-primary font-medium">{item.title}</div>
                    </BreadcrumbItem>

                    {isLast ? <></> : <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-col gap-2 p-4 pt-0 text-sm ml-1">
          {anchorNavItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground data-[depth=3]:pl-4 data-[depth=4]:pl-6"
              data-active={item.url === `#${activeHeading}`}
              data-depth={1}
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 relative">
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap min-h-6">
          {crumbs.map((item, index) => {
            const isActive = activeHeading === item.id
            return (
              <BreadcrumbItem key={index}>
                <BreadcrumbLink asChild>
                  <Link href={`#${item.id}`} className="text-primary hover:underline font-medium">
                    <div className={cn(`${isActive ? 'font-semibold text-lg' : ''}`)}>
                      {item.title}
                    </div>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

/**
 * 
 * 
      <div className={cn("flex flex-col gap-2 p-4 pt-0 text-sm", className)}>
        <p className="sticky top-0 h-6 bg-background text-xs font-medium text-muted-foreground">
          On This Page
        </p>
        {toc.map((item) => (
          <a
            key={item.url}
            href={item.url}
            className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground data-[depth=3]:pl-4 data-[depth=4]:pl-6"
            data-active={item.url === `#${activeHeading}`}
            data-depth={item.depth}
          >
            {item.title}
          </a>
        ))}
      </div>
    

  return (
    <>
      <nav className="h-8 gap-2 px-3 text-sm">
        <div className="container flex flex-col gap-3">
          <div className="flex flex-col gap-2 relative">
            <Breadcrumb>
              <BreadcrumbList className="flex-wrap min-h-6">
                {level === 0 && (
                  <React.Fragment>
                    <BreadcrumbItem>
                      <React.Fragment>
                        <Link href="/">
                          <House className="size-4" />
                          <span className="sr-only">Home</span>
                        </Link>
                      </React.Fragment>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                      <Dot />
                    </BreadcrumbSeparator>
                  </React.Fragment>
                )}
                {rowItems.map((item, index) => {
                  const isHovered = hoverPath[level]?.id === item.id
                  return (
                    <React.Fragment key={item.id}>
                      <BreadcrumbItem>
                        {item.type === 'page' ? (
                          <BreadcrumbLink
                            asChild
                            onMouseEnter={() => handleNodeHover(level, item)}
                            onClick={() => handleClickPage(level, item)}
                          >
                            <Link
                              href={`/${item.url}`}
                              className="text-primary hover:underline font-medium"
                            >
                              {item.title}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <span
                            onMouseEnter={() => handleNodeHover(level, item)}
                            className={`cursor-default transition-colors ${
                              isHovered
                                ? 'text-foreground font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {item.title}
                          </span>
                        )}
                      </BreadcrumbItem>

                      {isHovered ? (
                        <BreadcrumbSeparator>
                          <ChevronDown />
                        </BreadcrumbSeparator>
                      ) : (
                        index < rowItems.length - 1 && (
                          <BreadcrumbSeparator>
                            <Dot />
                          </BreadcrumbSeparator>
                        )
                      )}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </nav>


        <nav className="h-8 gap-2 px-3 text-sm">
          <div className="container flex flex-col gap-3">
            <div className="flex flex-col gap-2 relative">
              <Breadcrumb>
                <BreadcrumbList className="flex-wrap gap-y-2">
                  <BreadcrumbItem>{activePath.map((p) => p.title).pop()}:</BreadcrumbItem>
                  {postAnchors.map((anchor, index) => (
                    <React.Fragment key={anchor.id}>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={`#${anchor.id}`}>{anchor.title}</BreadcrumbLink>
                      </BreadcrumbItem>
                      {index < postAnchors.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </nav>
        

    </>
  )
}


 */
