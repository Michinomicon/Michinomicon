'use client'

import React, { useEffect, useState } from 'react'
import { ColorThemeToggle } from '@/providers/Theme/color-theme-toggle'
import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import { MenuTreeEntry } from '@/utilities/buildNavTree'
import { cn } from '@/lib/utils'
import { AppMainLogo } from '@/components/AppMainLogo'
import { useIsMobile } from '@/hooks/use-mobile'
import MobileNavMenu from '@/components/NavMenu/MobileNavMenu'
import HeaderNavMenu from '@/components/NavMenu/HeaderNavMenu'
import { PageTOCTriggerButton } from '@/components/PageTableOfContents'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import MainNavMenu from '@/components/NavMenu/HeaderNavMenu'
import GlobalSearch from '@/components/GlobalSearch'

interface HeaderClientProps {
  data: Header
  appTitle?: string | undefined
  menuTree: MenuTreeEntry[]
  twitchStatusSlot?: React.ReactNode
}

export const HeaderRowStyles = 'grid grid-cols-12 grid-rows-1 gap-3 rounded-none px-3 '
export const AltHeaderRowStyles =
  'flex max-h-12 w-screen flex-row items-center rounded-none px-3 py-1'

export const HeaderClient: React.FC<HeaderClientProps> = ({
  appTitle,
  menuTree,
  twitchStatusSlot,
}) => {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const isLGBreakpoint = useBreakpoint('lg')

  const [themeMode, setThemeMode] = useState<string | null>(null)
  const { headerThemeMode, setHeaderThemeMode, headerThemeColor, setHeaderThemeColor } =
    useHeaderTheme()
  const [prevHeaderThemeMode, setPrevHeaderThemeMode] = useState(headerThemeMode)

  if (headerThemeMode !== prevHeaderThemeMode) {
    setPrevHeaderThemeMode(headerThemeMode)
    if (headerThemeMode) {
      setThemeMode(headerThemeMode)
    }
  }

  const [themeColor, setThemeColor] = useState<string | null>(null)
  const [prevHeaderThemeColor, setPrevHeaderThemeColor] = useState(headerThemeColor)

  if (headerThemeColor !== prevHeaderThemeColor) {
    setPrevHeaderThemeColor(headerThemeColor)
    if (headerThemeColor) {
      setThemeColor(headerThemeColor)
    }
  }

  useEffect(() => {
    setHeaderThemeMode(null)
    setHeaderThemeColor(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (isMobile) {
    return (
      <React.Fragment>
        <header
          className={cn(
            `fixed z-20 w-screen max-w-screen rounded-none bg-background shadow-md`,
            'top-0',
          )}
          data-theme={themeColor}
          data-mode={themeMode}
        >
          <div
            className={cn(
              'flex max-h-12 w-screen flex-row items-center rounded-none border-b px-3',
            )}
          >
            {/* Left group */}
            <div className={cn('h-full items-center justify-start gap-2', 'min-w-60 shrink-0')}>
              <AppMainLogo text={appTitle} variant={'default'} />
            </div>

            {/* right group */}
            <div className="flex h-full min-w-fit flex-1 items-center justify-end gap-2">
              <div className="py-auto h-full min-w-fit flex-0">{twitchStatusSlot}</div>
            </div>
          </div>
        </header>

        <header
          className={cn(
            `fixed z-20 w-screen rounded-none bg-background shadow-md`,
            'bottom-0 flex flex-col items-center justify-center',
          )}
          data-theme={themeColor}
          data-mode={themeMode}
        >
          <div
            className={cn(
              'flex h-16 w-full flex-row flex-nowrap items-center justify-evenly rounded-none border-b px-3',
            )}
          >
            <div className="">
              <MobileNavMenu
                appTitle={appTitle}
                menuItems={menuTree}
                twitchStatusSlot={twitchStatusSlot}
                triggerButtonProps={{ size: 'lg', className: cn('text-xl px-1') }}
              />
            </div>

            <div className="">
              <GlobalSearch
                showLabel={true}
                buttonProps={{
                  variant: 'clean',
                  size: 'lg',
                  className: cn('text-xl px-1'),
                }}
              />
            </div>

            <div className="">
              <PageTOCTriggerButton size={'lg'} showLabel={true} className={'px-1 text-xl'} />
            </div>
          </div>
        </header>
      </React.Fragment>
    )
  } else {
    const BottomRowClassName = cn(
      'col-span-full flex flex-row flex-nowrap justify-center rounded-none bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 xl:col-span-10 xl:col-start-2',
    )

    return (
      <header
        className={`fixed top-0 z-20 w-screen rounded-none bg-background shadow-md`}
        data-theme={themeColor}
        data-mode={themeMode}
      >
        {/* TOP ROW OF HEADER */}
        <div className={cn(AltHeaderRowStyles)}>
          <div className={cn('py-auto h-full min-w-[20vw] flex-0')}>{twitchStatusSlot}</div>
          <div className={cn('max-h-10 max-w-[60vw] grow content-center')}>
            <AppMainLogo text={appTitle} className={'mx-auto'} />
          </div>
          <div className={cn('ml-auto flex min-w-[20vw] justify-end')}>
            <ColorThemeToggle />
          </div>
        </div>

        {/* BOTTOM ROW OF HEADER */}
        {isLGBreakpoint ? (
          <React.Fragment>
            <div className={cn(HeaderRowStyles, 'container w-[80vw]')}>
              <div className={cn(BottomRowClassName)}>
                <MainNavMenu />
              </div>
            </div>

            <div className={cn(HeaderRowStyles, 'container w-[80vw]')}>
              <div className={cn(BottomRowClassName)}>
                <MainNavMenu showSearch={false} showHome={false} menuItems={menuTree} />
              </div>
            </div>
          </React.Fragment>
        ) : (
          <div className={cn(HeaderRowStyles, 'container w-[80vw]')}>
            <div className={cn(BottomRowClassName)}>
              <HeaderNavMenu menuItems={menuTree} />
            </div>
          </div>
        )}
      </header>
    )
  }
}
