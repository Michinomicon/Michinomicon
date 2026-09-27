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
} from '@/components/ui/command'
import { Button, ButtonProps } from '@/components/ui/button'
import { Funnel, SearchIcon, X } from 'lucide-react'
import { Page } from '@/payload-types'
import { cn } from '@/lib/utils'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { useIsMobile } from '@/hooks/use-mobile'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { MobileMenuDrawerFooter, MobileMenuListItem } from '../NavMenu/MobileNavMenu'
import { InputGroupButton } from '../ui/input-group'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { DialogClose, DialogFooter } from '../ui/dialog'
import { useIsKeyboardOpen } from '@/hooks/use-mobileKeyboardOpen'
import { ButtonGroup } from '../ui/button-group'

const SearchResultsCommandItemClassName =
  'rounded-none bg-transparent p-0 data-selected:bg-transparent'

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

type GlobalSearchTriggerProps = {
  triggerButtonProps: ButtonProps | undefined
  showTriggerLabel: boolean
  onTriggerClickCallback: ((open: boolean) => void) | undefined
}

function GlobalSearchTrigger({
  triggerButtonProps,
  showTriggerLabel = false,
  onTriggerClickCallback,
}: GlobalSearchTriggerProps) {
  const [tooltipOpen, setTooltipOpen] = React.useState(false)

  const {
    variant: buttonVariant = 'link',
    size: buttonSize = 'lg',
    className: buttonClassName,
    ...restButtonProps
  } = triggerButtonProps || ({} as ButtonProps)

  const onTriggerClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    setTooltipOpen(false)
    if (onTriggerClickCallback) {
      onTriggerClickCallback(true)
    }
  }

  return (
    <Tooltip
      open={tooltipOpen}
      onOpenChange={setTooltipOpen}
      delayDuration={DEFAULT_TOOLTIP_DELAY}
      disableHoverableContent={true}
    >
      <TooltipTrigger asChild>
        <Button
          onClick={onTriggerClick}
          variant={buttonVariant}
          size={buttonSize}
          className={cn(buttonClassName, 'w-fit')}
          {...restButtonProps}
        >
          <SearchIcon className="w-5" />
          {showTriggerLabel && <span className="">Search</span>}
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
  )
}

type GlobalSearchProps = {
  onSelectionCallback?: () => void
  buttonProps?: ButtonProps
  showLabel?: boolean
}

export default function GlobalSearch({
  onSelectionCallback,
  buttonProps,
  showLabel = false,
}: GlobalSearchProps): React.ReactNode {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

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

  const handleResultSelection = (path: string) => {
    setOpen(false)
    if (onSelectionCallback) {
      onSelectionCallback()
    }
    router.push(path)
  }

  return (
    <React.Fragment>
      {isMobile ? (
        <SearchCommandDrawer
          onOpenChange={setOpen}
          open={open}
          onSelectResult={handleResultSelection}
          triggerProps={{
            triggerButtonProps: buttonProps,
            showTriggerLabel: showLabel,
          }}
        />
      ) : (
        <SearchCommandDialog
          triggerProps={{
            triggerButtonProps: buttonProps,
            showTriggerLabel: showLabel,
          }}
          dialogProps={{}}
          setOpen={setOpen}
          open={open}
          onSelectResult={handleResultSelection}
        />
      )}
    </React.Fragment>
  )
}

type SearchCommandDrawerProps = {
  onSelectResult: (path: string) => void
  open?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
  triggerProps: Omit<
    React.ComponentPropsWithoutRef<typeof GlobalSearchTrigger>,
    'onTriggerClickCallback'
  >
} & React.ComponentPropsWithoutRef<typeof Drawer>
function SearchCommandDrawer({
  onSelectResult,
  open,
  onOpenChange,
  triggerProps,
  ...drawerProps
}: SearchCommandDrawerProps) {
  const isMobile = useIsMobile()
  const isKeyboardOpen = useIsKeyboardOpen()
  return (
    <Drawer
      direction={'bottom'}
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!isKeyboardOpen}
      repositionInputs={false}
      {...drawerProps}
    >
      <DrawerTrigger asChild>
        <GlobalSearchTrigger onTriggerClickCallback={onOpenChange} {...triggerProps} />
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'mobile-menu-primary-menu-content rounded-md bg-background',
          'data-[vaul-drawer-direction=bottom]:h-lvh',
          'data-[vaul-drawer-direction=bottom]:rounded-t-none',
        )}
      >
        <SearchCommand onSelectResult={onSelectResult} className={'h-full'} />
        <MobileMenuDrawerFooter
          className={isMobile && isKeyboardOpen ? 'hidden' : 'bottom-0 h-fit p-0'}
        />
      </DrawerContent>
    </Drawer>
  )
}

type SearchCommandDialogProps = {
  onSelectResult: (path: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  dialogProps: Omit<React.ComponentPropsWithoutRef<typeof CommandDialog>, 'setOpen' | 'open'>
  triggerProps: Omit<
    React.ComponentPropsWithoutRef<typeof GlobalSearchTrigger>,
    'onTriggerClickCallback'
  >
}
function SearchCommandDialog({
  onSelectResult,
  open,
  setOpen,
  triggerProps,
  dialogProps,
}: SearchCommandDialogProps) {
  return (
    <React.Fragment>
      <GlobalSearchTrigger onTriggerClickCallback={setOpen} {...triggerProps} />
      <CommandDialog
        title={'Search'}
        showCloseButton={true}
        open={open}
        onOpenChange={setOpen}
        className={cn('w-90/100')}
        {...dialogProps}
      >
        <SearchCommand onSelectResult={onSelectResult} />
      </CommandDialog>
    </React.Fragment>
  )
}

function SearchResultsFilter({
  data,
  onSelectedChange,
}: {
  data: GlobalSearchResults
  onSelectedChange?: (selected: string[]) => void
}): React.ReactNode {
  const [selectedResultTypes, setSelectedResultTypes] = React.useState<Set<string>>(
    new Set(Object.keys(data)),
  )
  const [isOpen, setIsOpen] = React.useState(false)
  const selectAll = selectedResultTypes.size === Object.keys(data).length

  const handleSelectAll = (checked: boolean) => {
    let newSet: Set<string> = new Set()
    if (checked) {
      newSet = new Set(Object.keys(data))
    }
    setSelectedResultTypes(newSet)
    if (onSelectedChange) {
      onSelectedChange([...newSet.values()])
    }
  }

  const handleSelectItemType = (itemType: string, checked: boolean) => {
    const newSelected = new Set(selectedResultTypes)
    if (checked) {
      newSelected.add(itemType)
    } else {
      newSelected.delete(itemType)
    }
    setSelectedResultTypes(newSelected)
    if (onSelectedChange) {
      onSelectedChange([...newSelected.values()])
    }
  }

  return (
    <DropdownMenu
      modal={false}
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
      }}
    >
      <DropdownMenuTrigger
        className={'select-none'}
        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === 'escape') {
            event.stopPropagation()
          }
        }}
        asChild
      >
        <Button variant="outline" aria-label="Filters" size="sm" className="border-input/30">
          <span>Filter</span>
          <Funnel />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={'w-50 select-none!'}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="select-none!">Results to Show</span>
          </DropdownMenuLabel>
          {Object.keys(data).map((itemType, index) => {
            if (itemType === 'categories') {
              return
            }
            const itemCount = data[itemType as keyof GlobalSearchResults].length
            const isDisabled = itemCount <= 0

            return (
              <DropdownMenuCheckboxItem
                key={index}
                id={`filter-${itemType}-checkbox`}
                disabled={isDisabled}
                checked={!isDisabled && selectedResultTypes.has(itemType)}
                defaultChecked={true}
                onCheckedChange={(checked) => handleSelectItemType(itemType, checked === true)}
              >
                <span className="ml-3 capitalize">
                  {itemType}
                  {` (${itemCount})`}
                </span>
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Button
              variant={'ghost'}
              disabled={selectAll}
              className={'w-full cursor-none select-none'}
              onClick={() => handleSelectAll(true)}
            >
              <span className="cursor-none select-none">Reset</span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SearchCommand({
  onSelectResult,
}: React.ComponentPropsWithoutRef<typeof Command> & {
  onSelectResult: (path: string) => void
}) {
  const isMobile = useIsMobile()
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
  const [selectedTypeFilters, setSelectedTypeFilters] = React.useState<string[]>(
    Object.keys(results),
  )

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

  const totalResults = getTotalResults(results)

  /* shouldFilter={false} required to bypass cmdk default text filtering */
  return (
    <Command
      shouldFilter={false}
      label=""
      disablePointerSelection={true}
      vimBindings={false}
      className={cn(isMobile ? 'bg-background text-foreground' : '')}
    >
      <div className={'my-3 flex w-full flex-col items-center justify-center'}>
        <h2 className="text-3xl">Search</h2>
      </div>

      <ButtonGroup className={cn('w-full px-6')}>
        <CommandInput
          className={'h-full w-full border-0 bg-transparent'}
          wrapperClassName={'p-0 w-full'}
          inputGroupClassName={'rounded-tr-none! rounded-br-none! bg-transparent'}
          autoFocus={true}
          placeholder="Start typing to search..."
          value={query}
          onValueChange={setQuery}
          addonInlineEnd={
            query.length > 0 && (
              <InputGroupButton variant="ghost" size={'xs'} onClick={() => setQuery('')}>
                <X />
                <span className="sr-only">Clear</span>
              </InputGroupButton>
            )
          }
        />

        <SearchResultsFilter data={results} onSelectedChange={setSelectedTypeFilters} />
      </ButtonGroup>

      {query.length > 0 && totalResults > 0 && (
        <div className="py-1 text-center text-sm text-primary">Found {totalResults} results.</div>
      )}

      <CommandList className={cn('mx-6 p-0')}>
        <CommandEmpty className={'h-20'}>
          {loading ? 'Searching...' : query.length > 0 ? 'No results found.' : ''}
        </CommandEmpty>

        {Object.entries(results).map(([key, values], groupIndex) => {
          if (key !== 'categories' && selectedTypeFilters.includes(key) && values.length > 0) {
            return (
              <React.Fragment key={groupIndex}>
                <CommandGroup
                  key={groupIndex}
                  heading={
                    <div className="w-full pt-2">
                      <span className={'text-primary'}>
                        <span className={'capitalize'}>{key}</span>
                        {` (${values.length})`}
                      </span>
                    </div>
                  }
                  className={'group border-t border-border/30 p-0'}
                >
                  {values.map((item, itemIndex) => {
                    const isLast = itemIndex === values.length - 1

                    return (
                      <CommandItem
                        key={item.id}
                        value={`${key}-${item.id}`}
                        onSelect={() =>
                          onSelectResult(key === 'pages' ? `/${item.slug}` : `${key}/${item.slug}`)
                        }
                        className={cn(SearchResultsCommandItemClassName)}
                      >
                        <MobileMenuListItem
                          label={item.title}
                          href={key === 'pages' ? `/${item.slug}` : `${key}/${item.slug}`}
                          className={cn(
                            `item-index-${itemIndex}`,
                            isLast ? 'border-0 border-none' : '',
                          )}
                        />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </React.Fragment>
            )
          }
        })}
      </CommandList>
      {!isMobile && (
        <DialogFooter className="bottom-0 h-fit w-full">
          <div className="flex w-full justify-end border-t border-border/30 px-2 py-1">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      )}
    </Command>
  )
}
