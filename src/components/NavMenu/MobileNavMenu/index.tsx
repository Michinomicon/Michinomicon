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
  menuItems: MenuTreeItem[]
  twitchStatusSlot?: React.ReactNode
  triggerButtonProps?: ComponentPropsWithoutRef<typeof Button>
  triggerButtonIconProps?: ComponentPropsWithoutRef<typeof Icon>
}

function MobileMenuItem({
  item,
  index,
  menuDepth = 0,
  isOpen = false,
  onNavigateHandler,
  onOpenChange,
}: {
  item: MenuTreeItem
  index: number
  menuDepth?: number
  isOpen?: boolean
  onNavigateHandler: OnNavigateHandler
  onOpenChange?: () => void
}): React.ReactNode {
  const hasChildren = item.children && item.children.length > 0
  const isOddIndex = Math.abs(index % 2) == 1

  // Empty Category -> Disabled Item
  if (item.type === 'category' && !hasChildren) {
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

  // Any Item without children (Page/Post)
  // OR
  // PAGE with children (Posts)
  if (item.type === 'page' || !hasChildren) {
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

  // CATEGORY with children
  if (item.type === 'category') {
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
  items: MenuTreeItem[]
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

        <div
          className={cn(
            'mt-auto flex h-full max-h-2/3 w-full flex-col justify-end overflow-hidden',
          )}
        >
          <div
            className={cn(
              MobileDrawerContentListCLassName,
              'flex max-h-full min-h-fit flex-col justify-end overflow-x-hidden overflow-y-auto',
            )}
          >
            <MenuLevel items={menuItems} level={0} onNavigateHandler={onNavigateHandler} />
          </div>
        </div>

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
  'rounded-md bg-background',
  'data-[vaul-drawer-direction=bottom]:h-screen',
  'data-[vaul-drawer-direction=bottom]:max-h-[90vh]',
  'data-[vaul-drawer-direction=bottom]:min-h-1/2',
  'data-[vaul-drawer-direction=bottom]:rounded-t-none',
)
const MobileDrawerSubMenuContentClassName = cn(
  'rounded-md bg-background',
  'data-[vaul-drawer-direction=bottom]:max-h-2/3',
  'data-[vaul-drawer-direction=bottom]:min-h-1/2',
  'data-[vaul-drawer-direction=bottom]:rounded-t-none',
)
const MobileDrawerContentListCLassName =
  'mx-2 flex flex-col justify-center overflow-auto border border-primary/30 bg-background rounded-md'

const MobileDrawerFooterClassName = 'flex flex-col items-center justify-center rounded-none'
