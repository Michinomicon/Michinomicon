'use client'

import { globalSearch, GlobalSearchResults } from '@/app/api/search/route'
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

type GlobalSearchProps = {
  onSelectionCallback?: () => void
  buttonProps?: ButtonProps
}

export default function GlobalSearch({ onSelectionCallback, buttonProps }: GlobalSearchProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const debouncedValue = useDebounce(query)

  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<GlobalSearchResults>({
    posts: [],
    categories: [],
    pages: [],
  })

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
        setResults({ posts: [], categories: [], pages: [] })
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

  const getPageCategoryString = (page: Page): string => {
    const { parentCategory } = page
    if (typeof parentCategory === 'object' && parentCategory.breadcrumbs) {
      return parentCategory.breadcrumbs.map(({ label }) => label ?? '').join(' / ')
    }
    return 'Uncategorized'
  }

  return (
    <React.Fragment>
      <Button
        onClick={() => setOpen(true)}
        variant={'link'}
        size={'lg'}
        className={'w-fit'}
        {...buttonProps}
      >
        <SearchIcon className="w-5" />
        <span className="">Search</span>
      </Button>
      <CommandDialog title={'Search'} open={open} onOpenChange={setOpen}>
        <Command
          shouldFilter={false}
          label=""
          // filter=""
          defaultValue=""
          value=""
          // onValueChange=""
          // loop=""
          disablePointerSelection={true}
          vimBindings={false}
        >
          {/* shouldFilter={false} required to bypass cmdk default text filtering */}
          <CommandInput placeholder="Search..." value={query} onValueChange={setQuery} />
          <CommandList className={'p-1'}>
            <CommandEmpty>{loading ? 'Searching...' : 'No results found.'}</CommandEmpty>

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

            {/* --- Pages GROUP --- */}
            {results.pages.length > 0 && (
              <>
                <CommandGroup heading="Pages" className={'group p-0'}>
                  {results.pages.map((page) => (
                    <CommandItem
                      key={page.id}
                      value={`page-${page.id}`}
                      data-selected={false}
                      onSelect={() => {
                        console.debug(`selected page item "${page.slug}"`, page)
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

                      <div className="w-full text-right">
                        <span className="text-xs text-muted-foreground">
                          {getPageCategoryString(page)}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator className="mx-0 my-1" alwaysRender={true} />
              </>
            )}

            {/* --- POSTS GROUP --- */}
            {results.posts.length > 0 && (
              <CommandGroup heading="Posts" className={'group p-0'}>
                {results.posts.map((post) => (
                  <CommandItem
                    key={post.id}
                    value={`post-${post.id}`}
                    onSelect={() => {
                      console.debug(`selected post item "${post.slug}"`, post)
                      handleSelect(`/posts/${post.slug}`)
                    }}
                    className={'mb-1'}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{post.title}</span>
                      {/* Post Attribute: Category Name */}
                      <span className="text-xs text-muted-foreground">
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
                      </span>
                    </div>
                    {/* Post Attribute: Last Updated */}
                    <span className="text-xs text-muted-foreground">
                      Updated: {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
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
