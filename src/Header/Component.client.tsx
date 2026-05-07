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
        className={`fixed top-0 z-20 w-screen rounded-none bg-background shadow-md`}
        data-theme={themeColor}
        data-mode={themeMode}
      >
        <div className={cn(HeaderRowStyles, 'border-b py-2')}>
          <div className="col-span-2 flex flex-nowrap items-center justify-start">
            <MobileNavMenu appTitle={appTitle} navTree={navTree} />
          </div>
          <div className="col-span-8 flex flex-nowrap items-center justify-center">
            <AppMainLogo text={appTitle} variant={'default'} />
          </div>
          <div className="col-span-2 flex flex-nowrap items-center justify-end">
            <PageTOCTriggerButton size={'lg'} />
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
        <div className={cn(HeaderRowStyles, 'border-b py-1')}>
          <div className="col-span-4 flex items-center justify-start">{twitchStatusSlot}</div>
          <div className="col-span-4 flex flex-nowrap items-center justify-center rounded-none">
            <AppMainLogo text={appTitle} />
          </div>
          <div className="col-span-4 flex items-center justify-end">
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
