'use client'

import { globalSearch, GlobalSearchResults } from '@/app/(frontend)/search/actions'
import React from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button, ButtonProps } from '../ui/button'
import { SearchIcon } from 'lucide-react'
import { Page } from '@/payload-types'
import { cn } from '@/lib/utils'
import { DEFAULT_TOOLTIP_DELAY, Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Kbd, KbdGroup } from '../ui/kbd'

type GlobalSearchProps = {
  onSelectionCallback?: () => void
  buttonProps?: ButtonProps
  showLabel?: boolean
}

export const getPageCategoryString = (page: Page): string => {
  const { parentCategory } = page
  if (parentCategory && typeof parentCategory === 'object' && parentCategory.breadcrumbs) {
    return parentCategory.breadcrumbs.map(({ label }) => label ?? '').join(' / ')
  }
  return 'Uncategorized'
}

function getTotalResults(results: GlobalSearchResults): number {
  let total = 0
  for (const key in results) {
    total += results[key as keyof GlobalSearchResults]?.length ?? 0
  }
  return total
}

export default function GlobalSearch({
  onSelectionCallback,
  buttonProps,
  showLabel = false,
}: GlobalSearchProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const debouncedValue = useDebounce(query)

  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<GlobalSearchResults>({
    posts: [],
    categories: [],
    pages: [],
    creators: [],
    projects: [],
  })

  const {
    variant: buttonVariant = 'link',
    size: buttonSize = 'lg',
    className: buttonClassName,
    ...restButtonProps
  } = buttonProps || ({} as ButtonProps)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Fetch results when debounced query changes
  React.useEffect(() => {
    async function fetchResults() {
      if (debouncedValue.length < 2) {
        setResults({ posts: [], categories: [], pages: [], projects: [], creators: [] })
        return
      }

      setLoading(true)
      try {
        const data = await globalSearch(debouncedValue)
        setResults(data)
      } catch (error) {
        console.error('Search failed', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [debouncedValue])

  const handleSelect = (path: string) => {
    setOpen(false)
    if (onSelectionCallback) {
      onSelectionCallback()
    }
    router.push(path)
  }

  const totalResults = getTotalResults(results)

  return (
    <React.Fragment>
      <Tooltip
        open={tooltipOpen}
        onOpenChange={setTooltipOpen}
        delayDuration={DEFAULT_TOOLTIP_DELAY}
        disableHoverableContent={true}
      >
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              setTooltipOpen(false)
              setOpen(true)
            }}
            variant={buttonVariant}
            size={buttonSize}
            className={cn(buttonClassName, 'w-fit')}
            {...restButtonProps}
          >
            <SearchIcon className="w-5" />
            {showLabel && <span className="">Search</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Search (
          {
            <KbdGroup>
              <Kbd>Ctrl + K</Kbd>
            </KbdGroup>
          }
          )
        </TooltipContent>
      </Tooltip>

      <CommandDialog title={'Search'} open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false} label="" disablePointerSelection={true} vimBindings={false}>
          <div className="w-full px-1 pb-4">
            <div className={'ml-auto text-right text-[10px] text-muted-foreground'}>
              Press{' '}
              {
                <KbdGroup>
                  <Kbd>escape</Kbd>
                </KbdGroup>
              }{' '}
              or click outside to close.
            </div>
          </div>
          {/* shouldFilter={false} required to bypass cmdk default text filtering */}
          <CommandInput
            placeholder="Start typing to search site content..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className={'p-1'}>
            <CommandEmpty className={'h-20'}>
              {loading ? 'Searching...' : query.length > 0 ? 'No results found.' : ''}
            </CommandEmpty>

            {totalResults > 0 && (
              <div className="text-center text-sm">Found {totalResults} results.</div>
            )}

            {/* --- CATEGORIES GROUP --- */}
            {/* {results.categories.length > 0 && (
              <>
                <CommandGroup heading="Categories" className={'group p-0'}>
                  {results.categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={`category-${category.id}`}
                      onSelect={() => {
                        console.debug(`selected category item "${category.slug}"`, category)
                        handleSelect(`/${category.slug}`)
                      }}
                      className={'data-[selected=true]:bg-primary-40 mb-1 bg-primary/20'}
                    >
                      <span>{category.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator className="mx-0 my-1" alwaysRender={true} />
              </>
            )} */}

            {/* --- Projects GROUP --- */}
            {results.projects.length > 0 && (
              <>
                <CommandGroup
                  heading={`Projects (${results.projects.length})`}
                  className={'group p-0'}
                >
                  {results.projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={`project-${project.id}`}
                      onSelect={() => {
                        console.debug(`selected search result: project "${project.slug}"`, project)
                        handleSelect(`projects/${project.slug}`)
                      }}
                      className={'mb-1 flex flex-col'}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium">{project.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Updated: {new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="w-full text-right">
                        <span className="text-xs text-muted-foreground">
                          {/* {getPageCategoryString(creator)} */}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator className="mx-0 my-1" alwaysRender={true} />
              </>
            )}

            {/* --- Creators GROUP --- */}
            {results.creators.length > 0 && (
              <>
                <CommandGroup
                  heading={`Creators (${results.creators.length})`}
                  className={'group p-0'}
                >
                  {results.creators.map((creator) => (
                    <CommandItem
                      key={creator.id}
                      value={`creator-${creator.id}`}
                      onSelect={() => {
                        console.debug(`selected search result: "${creator.slug}"`, creator)
                        handleSelect(`creators/${creator.slug}`)
                      }}
                      className={'mb-1 flex flex-col'}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium">{creator.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Updated: {new Date(creator.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="w-full text-right">
                        <span className="text-xs text-muted-foreground">
                          {/* {getPageCategoryString(creator)} */}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator className="mx-0 my-1" alwaysRender={true} />
              </>
            )}

            {/* --- Pages GROUP --- */}
            {results.pages.length > 0 && (
              <>
                <CommandGroup heading={`Pages (${results.pages.length})`} className={'group p-0'}>
                  {results.pages.map((page) => (
                    <CommandItem
                      key={page.id}
                      value={`page-${page.id}`}
                      onSelect={() => {
                        console.debug(`selected search result: "${page.slug}"`, page)
                        handleSelect(`/${page.slug}`)
                      }}
                      className={'mb-1 flex flex-col'}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium">{page.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Updated: {new Date(page.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* <div className="w-full text-right">
                        <span className="text-xs text-muted-foreground">
                          {getPageCategoryString(page)}
                        </span>
                      </div> */}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator className="mx-0 my-1" alwaysRender={true} />
              </>
            )}

            {/* --- POSTS GROUP --- */}
            {results.posts.length > 0 && (
              <CommandGroup heading={`Posts (${results.posts.length})`} className={'group p-0'}>
                {results.posts.map((post) => (
                  <CommandItem
                    key={post.id}
                    value={`post-${post.id}`}
                    onSelect={() => {
                      console.debug(`selected search result: "${post.slug}"`, post)
                      handleSelect(`/posts/${post.slug}`)
                    }}
                    className={'mb-1'}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{post.title}</span>
                      {/* Post Attribute: Category Name */}
                      {/* <span className="text-xs text-muted-foreground">
                        {post.categories
                          ? post.categories
                              .map((cat) => {
                                if (typeof cat === 'object') {
                                  return cat.title
                                } else {
                                  return cat
                                }
                              })
                              .join(', ')
                          : 'Uncategorized'}
                      </span> */}
                    </div>
                    {/* Post Attribute: Last Updated */}
                    {/* <span className="text-xs text-muted-foreground">
                      Updated: {new Date(post.updatedAt).toLocaleDateString()}
                    </span> */}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </React.Fragment>
  )
}
