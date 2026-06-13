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
import { MenuTreeItem } from '@/utilities/buildNavTree'
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
  menuTree: MenuTreeItem[]
  twitchStatusSlot?: React.ReactNode
  triggerButtonProps?: ComponentPropsWithoutRef<typeof Button>
  triggerButtonIconProps?: ComponentPropsWithoutRef<typeof Icon>
}

function MobileMenuItem({
  item,
  onNavigateHandler,
}: {
  item: MenuTreeItem
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
            'group ml-6 w-full justify-start rounded-none rounded-tl-none border-l border-l-primary/20 bg-card/40 pl-6 text-lg text-foreground transition-none hover:border-l-2 hover:border-l-primary-foreground',
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
              'group w-full justify-start rounded-none border-l border-l-primary/20 text-lg text-foreground transition-none data-[state=open]:border-l-2 data-[state=open]:border-l-primary',
            )}
          >
            {item.title}
            <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="rounded-none">
          <div className={cn('flex flex-col gap-x-1 bg-card/40')}>
            {item.children?.map((child) => (
              <MobileMenuItem key={child.id} item={child} onNavigateHandler={onNavigateHandler} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return <></>
}

type OnNavigateHandler = (event?: { preventDefault: () => void }) => void

export default function MobileNavMenu({
  menuTree: navTree,
  appTitle,
  twitchStatusSlot,
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
  const triggerButtonSize = sizeFromProps ?? 'icon'

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

      <DrawerContent className={cn(MobileDrawerMainMenuContentClassName)}>
        <DrawerHeader>
          <DrawerTitle className="text-center">
            <div className="grid w-full grid-cols-2 gap-2 align-middle">
              <AppMainLogo
                variant={'default'}
                text={appTitle}
                className={'items-center justify-center'}
              />
              <div className="mx-auto flex h-full w-full flex-col items-end justify-center">
                {twitchStatusSlot}
              </div>
            </div>
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div className={cn('flex h-full w-full flex-col overflow-hidden')}>
          <div
            className={cn(
              MobileDrawerContentListCLassName,
              'flex h-full flex-col items-center justify-stretch gap-y-0 overflow-x-hidden overflow-y-auto',
            )}
          >
            {navTree.map((item) => (
              <MobileMenuItem key={item.id} item={item} onNavigateHandler={handleOnNavigate} />
            ))}
          </div>
        </div>

        <DrawerFooter className={cn(MobileDrawerFooterClassName)}>
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
            <Button variant="ghost" className="w-fit">
              Close
            </Button>
          </DrawerClose>
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
      <DrawerContent className={cn(MobileDrawerSubMenuContentClassName)}>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div className={cn(MobileDrawerContentListCLassName)}>
          <AppearanceSettingsDrawer />
        </div>

        <DrawerFooter className={cn(MobileDrawerFooterClassName)}>
          <DrawerClose asChild>
            <Button variant="ghost" className="w-fit">
              <ArrowLeft className={'mr-2'} />
              Back
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
      <DrawerContent className={cn(MobileDrawerSubMenuContentClassName)}>
        <DrawerHeader className="rounded-none">
          <DrawerTitle>Appearance</DrawerTitle>
          <DrawerDescription>Change the look and feel of the website.</DrawerDescription>
        </DrawerHeader>

        <div className={cn(MobileDrawerContentListCLassName)}>
          <MobileWallpaperSettingsFieldGroup />
          <MobileColorThemeFieldGroup />
          <MobileThemeModeFieldGroup />
        </div>

        <DrawerFooter className={cn(MobileDrawerFooterClassName)}>
          <DrawerClose asChild>
            <Button variant="ghost" className="w-fit">
              <ArrowLeft className={'mr-2'} />
              Back
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const MobileDrawerMainMenuContentClassName = cn(
  'rounded-none bg-blend-darken',
  'data-[vaul-drawer-direction=bottom]:h-screen data-[vaul-drawer-direction=bottom]:min-h-90vh',
  'data-[vaul-drawer-direction=bottom]:rounded-t-none',
)
const MobileDrawerSubMenuContentClassName = cn(
  'rounded-none bg-blend-darken',
  'data-[vaul-drawer-direction=bottom]:max-h-90vh data-[vaul-drawer-direction=bottom]:min-h-1/2',
  'data-[vaul-drawer-direction=bottom]:rounded-t-none',
)
const MobileDrawerContentListCLassName =
  'mx-2 flex flex-col items-center justify-center gap-y-4 overflow-auto border border-primary/30 bg-background pb-2'
const MobileDrawerFooterClassName = 'flex flex-col items-center justify-center rounded-none'
