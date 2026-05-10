import { AppMainLogo } from '@/components/AppMainLogo'
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from '@/components/ui/collapsible'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { NavTreeItem } from '@/utilities/buildNavTree'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRightIcon, House, Icon, Menu, PaletteIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { ComponentPropsWithoutRef, useState } from 'react'
import React from 'react'
import {
  MobileColorThemeFieldGroup,
  MobileThemeModeFieldGroup,
  MobileWallpaperSettingsFieldGroup,
} from '@/providers/Theme/color-theme-toggle'
import GlobalSearch from '@/components/GlobalSearch'

export type MobileMenuProps = {
  appTitle?: string
  navTree: NavTreeItem[]
  triggerButtonProps?: ComponentPropsWithoutRef<typeof Button>
  triggerButtonIconProps?: ComponentPropsWithoutRef<typeof Icon>
}

function MobileMenuItem({
  item,
  onNavigateHandler,
}: {
  item: NavTreeItem
  onNavigateHandler: OnNavigateHandler
}): React.JSX.Element {
  const hasChildren = item.children && item.children.length > 0

  // Empty Category -> Disabled Item
  if (item.type === 'category' && !hasChildren) {
    return (
      <div className="rounded-none">
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
      <div className="rounded-none">
        <Button
          asChild
          variant="ghost"
          size="lg"
          className={cn(
            'group mt-1 mr-1 mb-1 ml-3 w-full justify-start rounded-none text-lg text-foreground transition-none',
            'rounded-tl-none border-l border-l-primary/50 bg-card/40 hover:border-l-2 hover:border-l-primary-foreground',
          )}
        >
          <Link href={item.url} passHref onNavigate={onNavigateHandler}>
            {item.title}
          </Link>
        </Button>
      </div>
    )
  }

  // CATEGORY with children
  if (item.type === 'category') {
    return (
      <Collapsible className={'w-full'}>
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
            {item.children.map((child) => (
              <MobileMenuItem key={child.id} item={child} onNavigateHandler={onNavigateHandler} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return <></>
}

function MobileMenuContent({
  navTree,
  onNavigateHandler,
}: {
  navTree: NavTreeItem[]
  onNavigateHandler: OnNavigateHandler
}): React.JSX.Element {
  return (
    <div className={'flex h-screen w-full flex-col overflow-hidden px-4'}>
      <div className="flex h-full flex-col items-center justify-stretch gap-y-1 overflow-x-hidden overflow-y-auto rounded-none rounded-bl-sm border border-primary/30 bg-card/20 py-2 pr-2">
        {navTree.map((item) => (
          <MobileMenuItem key={item.id} item={item} onNavigateHandler={onNavigateHandler} />
        ))}
      </div>
    </div>
  )
}

type OnNavigateHandler = (event?: { preventDefault: () => void }) => void

export default function MobileNavMenu({
  navTree,
  appTitle,
  triggerButtonProps = {},
  ...props
}: React.ComponentPropsWithoutRef<typeof Drawer> & MobileMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const {
    variant: variantFromProps,
    size: sizeFromProps,
    ...restTriggerButtonProps
  } = triggerButtonProps
  const triggerButtonVariant = variantFromProps ?? 'ghost'
  const triggerButtonSize = sizeFromProps ?? 'lg'

  const handleOnNavigate: OnNavigateHandler = () => {
    console.log(`closing mobile nav menu after link navigation`)
    setIsOpen(false)
  }

  return (
    <Drawer direction={'bottom'} {...props} open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant={triggerButtonVariant}
          size={triggerButtonSize}
          className="group items-center justify-center text-accent-foreground transition-colors"
          aria-label={`${isOpen ? 'Close Menu' : 'Open Menu'}`}
          {...restTriggerButtonProps}
        >
          <Menu className="transition-transform" size={48} />
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className={cn(
          'rounded-none bg-background',
          'data-[vaul-drawer-direction=bottom]:h-full data-[vaul-drawer-direction=bottom]:max-h-screen',
          'data-[vaul-drawer-direction=bottom]:rounded-t-none',
        )}
      >
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

        <MobileMenuContent navTree={navTree} onNavigateHandler={handleOnNavigate} />
        <DrawerFooter>
          <div className="flex flex-col items-center justify-around gap-x-1 rounded-none">
            <div className="mb-2 flex w-full flex-row items-center justify-center gap-x-1 rounded-none border-t border-b border-t-primary border-b-primary">
              <Button variant={'link'} size={'lg'} className={'text-primary'} asChild>
                <Link
                  href="/home"
                  passHref
                  onNavigate={handleOnNavigate}
                  className="no-underline decoration-0"
                >
                  <House className="w-5" />
                  <span className="no-underline">Home</span>
                </Link>
              </Button>
              <GlobalSearch
                onSelectionCallback={handleOnNavigate}
                buttonProps={{ className: 'text-primary' }}
              />
              <SettingsDrawer />
              {/* <Button variant={'link'} size={'lg'} className={'text-primary'} asChild>
                <Link href="/searchresults" passHref onNavigate={handleOnNavigate}>
                  <SearchIcon className="w-5" />
                  <span>Search</span>
                </Link>
              </Button> */}
            </div>
            <DrawerClose asChild>
              <Button variant="default">Close Menu</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function SettingsDrawer() {
  return (
    <Drawer direction={'bottom'}>
      <DrawerTrigger asChild>
        <Button variant={'link'} size={'lg'} className={'text-primary'}>
          <Settings />
          Settings
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'rounded-none bg-background',
          'data-[vaul-drawer-direction=bottom]:max-h-screen data-[vaul-drawer-direction=bottom]:min-h-1/2',
        )}
      >
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="flex h-full flex-col items-center justify-center gap-y-4">
          <AppearanceSettingsDrawer />
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="default">
              <ArrowLeft className={'mr-6'} />
              Back to Main Menu
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function AppearanceSettingsDrawer() {
  return (
    <Drawer direction={'bottom'}>
      <DrawerTrigger asChild>
        <Button variant="ghost">
          <PaletteIcon className={'mr-1'} />
          Appearance
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'rounded-none bg-background',
          'data-[vaul-drawer-direction=bottom]:h-full data-[vaul-drawer-direction=bottom]:max-h-screen',
          'data-[vaul-drawer-direction=bottom]:rounded-t-none',
        )}
      >
        <DrawerHeader>
          <DrawerTitle>Appearance</DrawerTitle>
          <DrawerDescription>Change the look and feel of the website.</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col items-center justify-center gap-y-4">
          <MobileWallpaperSettingsFieldGroup />
          <div className="flex w-full items-center justify-center gap-y-4">
            <MobileColorThemeFieldGroup />
          </div>
          <MobileThemeModeFieldGroup />
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="default">
              <ArrowLeft className={'mr-6'} />
              Back to Settings
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
