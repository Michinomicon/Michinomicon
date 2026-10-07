import { AppMainLogo } from '@/components/AppMainLogo'
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
import { ChevronDownIcon, House, Icon, Menu, Settings } from 'lucide-react'
import { ComponentPropsWithoutRef, useState } from 'react'
import React from 'react'
import {
  MobileColorThemeFieldGroup,
  MobileThemeModeFieldGroup,
  MobileWallpaperSettingsFieldGroup,
} from '@/providers/Theme/color-theme-toggle'
import { ScrollArea } from '@/components/ui/scroll-area'
import { OnNavigateHandler } from '../MenuItem'
import { MenuLevel } from '../MenuLevel'
import { MenuListItem } from '../MenuListItem'

const ListItemClassName = 'w-full rounded-none border-b border-border/10 pb-5 pt-0 text-xl'

export const MobileMenuDrawerContentClassName = cn(
  'mobile-menu-primary-menu-content rounded-md bg-background',
  'data-[vaul-drawer-direction=bottom]:h-[100lvh]',
  'data-[vaul-drawer-direction=bottom]:min-h-[100lvh]',
  'data-[vaul-drawer-direction=bottom]:rounded-t-none',
  // 'shadow-(--shadow-scrollable)',
)

const MobileMenuItemScrollList = cn(
  '[&_>div_>div]:flex! [&_>div_>div]:h-full! [&_>div_>div]:flex-col!',
  'mobile-menu-scroll-list',
  'flex flex-col h-full border-t border-b border-t-primary/40 border-b-primary/40 ',
)

export type MobileNavMenuProps = {
  appTitle?: string
  menuItems: MenuTreeEntry[]
  twitchStatusSlot?: React.ReactNode
  triggerButtonProps?: ComponentPropsWithoutRef<typeof Button>
  triggerButtonIconProps?: ComponentPropsWithoutRef<typeof Icon>
}

export function MobileMenuDrawerFooter({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof DrawerFooter>, 'className'> & {
  className?: string
}) {
  return (
    <DrawerFooter
      className={cn(
        'm-0 flex w-full flex-row items-center justify-between rounded-none border-t border-t-primary/40 p-0',
        className,
      )}
      {...props}
    >
      <DrawerClose asChild>
        <Button
          variant={'ghost'}
          size={'lg'}
          className={'h-10.25 w-full justify-center rounded-none px-4 text-xl'}
        >
          <ChevronDownIcon className="h-6 w-6" />
          Close
          <ChevronDownIcon className="h-6 w-6" />
        </Button>
      </DrawerClose>
    </DrawerFooter>
  )
}

function SettingsDrawer() {
  return (
    <Drawer direction={'bottom'}>
      <DrawerTrigger asChild>
        <Button
          variant={'ghost'}
          size={'lg'}
          className={
            'w-full justify-start rounded-none border-b border-border/10 px-4 py-5 text-left text-xl'
          }
        >
          <Settings className="w-6" />
          Settings
        </Button>
      </DrawerTrigger>
      <DrawerContent className={cn(MobileMenuDrawerContentClassName)}>
        <DrawerHeader className={cn('sr-only')}>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className={'my-3 flex w-full flex-col items-center justify-center'}>
          <h2 className="text-3xl">Settings</h2>
        </div>
        <ScrollArea className={cn(MobileMenuItemScrollList)}>
          <div className={cn('flex h-full w-full flex-col justify-center gap-y-4 p-4')}>
            <MobileWallpaperSettingsFieldGroup className={ListItemClassName} />
            <MobileColorThemeFieldGroup className={ListItemClassName} />
            <MobileThemeModeFieldGroup className={ListItemClassName} />
          </div>
        </ScrollArea>
        <MobileMenuDrawerFooter />
      </DrawerContent>
    </Drawer>
  )
}

export default function MobileNavMenu({
  menuItems,
  appTitle,
  triggerButtonProps = {},
  ...props
}: React.ComponentPropsWithoutRef<typeof Drawer> & MobileNavMenuProps): React.JSX.Element {
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
        <DrawerHeader className={cn('rounded-none')}>
          <DrawerTitle className="py-0">
            <AppMainLogo
              variant={'default'}
              text={appTitle}
              className={'mx-auto items-center justify-center'}
            />
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className={cn(MobileMenuItemScrollList)}>
          <MenuLevel
            items={menuItems}
            level={0}
            onNavigateHandler={onNavigateHandler}
            rootLabel={'Menu'}
          />
        </ScrollArea>
        <div className="flex flex-col">
          <MenuListItem
            label={'Home'}
            icon={<House className="" />}
            href={'/home'}
            onNavigate={onNavigateHandler}
          />
          <SettingsDrawer />
        </div>
        <MobileMenuDrawerFooter />
      </DrawerContent>
    </Drawer>
  )
}
