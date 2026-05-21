'use client'

import React, { useEffect, useState } from 'react'
import { ColorThemeToggle } from '@/providers/Theme/color-theme-toggle'
import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import { NavTreeItem } from '@/utilities/buildNavTree'
import { cn } from '@/lib/utils'
import { AppMainLogo } from '@/components/AppMainLogo'
import { useIsMobile } from '@/hooks/use-mobile'
import MobileNavMenu from '@/components/NavMenu/MobileNavMenu'
import HeaderNavMenu from '@/components/NavMenu/HeaderNavMenu'
import { PageTOCTriggerButton } from '@/components/PageTableOfContents'

interface HeaderClientProps {
  data: Header
  appTitle?: string | undefined
  navTree: NavTreeItem[]
  twitchStatusSlot?: React.ReactNode
}

export const HeaderRowStyles = 'grid grid-cols-12 grid-rows-1 gap-3 rounded-none px-3 '
export const AltHeaderRowStyles =
  'flex max-h-12 w-screen flex-row items-center rounded-none border-b px-3'

export const HeaderClient: React.FC<HeaderClientProps> = ({
  appTitle,
  navTree,
  twitchStatusSlot,
}) => {
  const [themeMode, setThemeMode] = useState<string | null>(null)
  const [themeColor, setThemeColor] = useState<string | null>(null)

  const { headerThemeMode, setHeaderThemeMode, headerThemeColor, setHeaderThemeColor } =
    useHeaderTheme()
  const pathname = usePathname()
  const isMobile = useIsMobile()

  useEffect(() => {
    setHeaderThemeMode(null)
    setHeaderThemeColor(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerThemeMode && headerThemeMode !== themeMode) setThemeMode(headerThemeMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerThemeMode])

  useEffect(() => {
    if (headerThemeColor && headerThemeColor !== themeColor) setThemeColor(headerThemeColor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerThemeColor])

  if (isMobile) {
    return (
      <header
        className={`fixed top-0 z-20 w-screen max-w-screen rounded-none bg-background shadow-md`}
        data-theme={themeColor}
        data-mode={themeMode}
      >
        <div
          className={cn('flex max-h-12 w-screen flex-row items-center rounded-none border-b px-3')}
        >
          {/* Left group */}
          <div className="flex h-full flex-1 items-center justify-start gap-2">
            <div className="py-auto h-full min-w-fit flex-0">
              <MobileNavMenu
                appTitle={appTitle}
                navTree={navTree}
                twitchStatusSlot={twitchStatusSlot}
              />
            </div>
            <div className="py-auto h-full min-w-fit flex-0 max-sm:hidden">{twitchStatusSlot}</div>
          </div>

          {/* center group */}
          <div
            className={cn(
              'min-w-60 shrink-0 content-center',
              'mx-auto h-full items-center justify-center text-center',
            )}
          >
            <AppMainLogo text={appTitle} variant={'default'} />
          </div>

          {/* right group */}
          <div className="flex h-full min-w-fit flex-1 items-center justify-end gap-2">
            <PageTOCTriggerButton size={'icon'} />
          </div>
        </div>
      </header>
    )
  } else {
    return (
      <header
        className={`fixed top-0 z-20 w-screen rounded-none bg-background shadow-md`}
        data-theme={themeColor}
        data-mode={themeMode}
      >
        {/* TOP ROW OF HEADER */}
        <div className={cn(AltHeaderRowStyles, 'border-b py-1')}>
          <div className={cn('py-auto h-full min-w-fit flex-0')}>{twitchStatusSlot}</div>
          <div className={cn('grow content-center', 'mx-auto max-h-10 max-w-[60vw]')}>
            <AppMainLogo text={appTitle} className={'mx-auto'} />
          </div>
          <div className={cn('ml-auto min-w-fit')}>
            <ColorThemeToggle />
          </div>
        </div>

        {/* BOTTOM ROW OF HEADER */}
        <div className={cn(HeaderRowStyles, 'container py-1')}>
          <div className="col-span-full flex flex-row flex-nowrap justify-center rounded-none bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 xl:col-span-10 xl:col-start-2">
            <HeaderNavMenu navTree={navTree} />
          </div>
        </div>
      </header>
    )
  }
}
