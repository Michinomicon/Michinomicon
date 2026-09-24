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
import { MenuTreeEntry } from '@/utilities/buildNavTree'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import GlobalSearch from '@/components/GlobalSearch'

export type MobileMenuProps = {
  appTitle?: string
  menuItems: MenuTreeEntry[]
  twitchStatusSlot?: React.ReactNode
  triggerButtonProps?: ComponentPropsWithoutRef<typeof Button>
  triggerButtonIconProps?: ComponentPropsWithoutRef<typeof Icon>
}

type MobileMenuItemProps = {
  item: MenuTreeEntry
  index: number
  menuDepth?: number
  isOpen?: boolean
  onNavigateHandler: OnNavigateHandler
  onOpenChange?: () => void
}
function MobileMenuItem({
  item,
  index,
  menuDepth = 0,
  isOpen = false,
  onNavigateHandler,
  onOpenChange,
}: MobileMenuItemProps): React.ReactNode {
  const hasChildren = item.children && item.children.length > 0
  const isOddIndex = Math.abs(index % 2) == 1

  // Empty Category -> Disabled Item
  if (item.type === 'group' && !hasChildren) {
    return (
      <div
        className={cn(
          'rounded-none border-b border-b-border/10 py-2',
          isOddIndex ? 'bg-black/5' : '',
        )}
      >
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

  // Item without children
  if (item.type === 'item') {
    return (
      <div
        className={cn(
          'rounded-none border-b border-b-border/10 py-2',
          isOddIndex ? 'bg-black/5' : '',
        )}
      >
        <Button
          asChild
          variant="ghost"
          size="lg"
          className={cn(
            'group ml-3 w-full justify-start rounded-none rounded-tl-none pl-4 text-lg text-foreground transition-none',
          )}
        >
          <Link href={item.url} passHref onNavigate={onNavigateHandler}>
            {item.title}
          </Link>
        </Button>
      </div>
    )
  }

  // Item Group with children
  if (item.type === 'group') {
    return (
      <Collapsible
        className={cn(
          'w-full rounded-none border-b border-b-border/10 py-2',
          isOddIndex ? 'bg-black/5' : '',
        )}
        defaultOpen={false}
        open={isOpen}
        onOpenChange={onOpenChange}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              'group w-full justify-start rounded-none px-0 pl-2 text-lg text-foreground transition-none data-[state=open]:ml-0 data-[state=open]:border-l-4 data-[state=open]:border-l-primary/50 data-[state=open]:pl-0 data-[state=open]:font-bold',
            )}
          >
            <ChevronRightIcon className={cn('transition-transform', isOpen ? 'rotate-90' : '')} />
            {item.title}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className={cn('group rounded-none')}>
          <div
            className={cn(
              'ml-0 flex flex-col gap-x-1 rounded-none bg-card/40 pl-1 group-data-[state=open]:border-l-4 group-data-[state=open]:border-l-primary/50',
            )}
          >
            <MenuLevel
              items={item.children!}
              level={menuDepth + 1}
              onNavigateHandler={onNavigateHandler}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return <></>
}

interface MenuLevelProps {
  items: MenuTreeEntry[]
  level?: number
  onNavigateHandler: OnNavigateHandler
}
const MenuLevel: React.FC<MenuLevelProps> = ({ items, level = 0, onNavigateHandler }) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  return (
    <React.Fragment>
      {items.map((item, index) => {
        const itemKey: string = `${item.id}-${level}-${index}`
        return (
          <MobileMenuItem
            key={`${item.id}-${index}`}
            index={index}
            item={item}
            menuDepth={level}
            isOpen={openItemId === itemKey}
            onNavigateHandler={onNavigateHandler}
            onOpenChange={() =>
              // If open, close it. Otherwise, open it.
              setOpenItemId(openItemId === itemKey ? null : itemKey)
            }
          />
        )
      })}
    </React.Fragment>
  )
}

type OnNavigateHandler = (event?: { preventDefault: () => void }) => void

export default function MobileNavMenu({
  menuItems,
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
  const triggerButtonSize = sizeFromProps ?? 'lg'

  const onNavigateHandler: OnNavigateHandler = () => {
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
          <span className="">Menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className={cn(MobileMenuDrawerContentClassName)}>
        <DrawerHeader className={cn(MobileMenuDrawerHeaderClassName)}>
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

        <ScrollArea className={cn(MobileMenuItemScrollList)}>
          <MenuLevel items={menuItems} level={0} onNavigateHandler={onNavigateHandler} />
        </ScrollArea>

        <DrawerFooter className={cn(MobileDrawerFooterClassName)}>
          <div className="mb-2 flex w-full flex-row items-center justify-center gap-x-1 rounded-none border-t border-b border-t-primary border-b-primary">
            <Button variant={'link'} size={'lg'} className={'text-primary'} asChild>
              <Link
                href="/home"
                passHref
                onNavigate={onNavigateHandler}
                className="no-underline decoration-0"
              >
                <House className="w-5" />
                <span className="no-underline">Home</span>
              </Link>
            </Button>
            <GlobalSearch
              onSelectionCallback={onNavigateHandler}
              buttonProps={{ className: 'text-primary' }}
            />
            <SettingsDrawer />
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
      <DrawerContent className={cn(MobileMenuDrawerContentClassName)}>
        <DrawerHeader className={cn(MobileMenuDrawerHeaderClassName)}>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <ScrollArea className={cn(MobileMenuItemScrollList)}>
          <div className={cn(MobileMenuItemScrollListContent)}>
            <AppearanceSettingsDrawer />
          </div>
        </ScrollArea>
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
        <Button variant="outline">
          <PaletteIcon className={'mr-1'} />
          Appearance
        </Button>
      </DrawerTrigger>
      <DrawerContent className={cn(MobileMenuDrawerContentClassName)}>
        <DrawerHeader className={cn(MobileMenuDrawerHeaderClassName)}>
          <DrawerTitle>Appearance</DrawerTitle>
          <DrawerDescription>Change the look and feel of the website.</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className={cn(MobileMenuItemScrollList)}>
          <div className={cn(MobileMenuItemScrollListContent)}>
            <MobileWallpaperSettingsFieldGroup />
            <MobileColorThemeFieldGroup />
            <MobileThemeModeFieldGroup />
          </div>
        </ScrollArea>
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

const MobileMenuDrawerContentClassName = cn(
  'mobile-menu-primary-menu-content rounded-md bg-background',
  'data-[vaul-drawer-direction=bottom]:h-[90vh]',
  'data-[vaul-drawer-direction=bottom]:rounded-t-none',
)

const MobileMenuDrawerHeaderClassName = cn('rounded-none ')

const MobileMenuItemScrollList = cn('flex flex-col justify-end mt-auto')

const MobileMenuItemScrollListContent = cn('flex h-full flex-col justify-end')

const MobileDrawerFooterClassName = 'flex flex-col items-center justify-center rounded-none mt-0'
