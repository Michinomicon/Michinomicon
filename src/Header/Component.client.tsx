'use client'

import React, { useEffect, useState } from 'react'
import { ColorThemeToggle } from '@/providers/Theme/color-theme-toggle'
import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import NavMenu from '@/components/NavMenu'
import { NavTreeItem } from '@/utilities/buildNavTree'
import { cn } from '@/lib/utils'
import { AppMainLogo } from '@/components/AppMainLogo'

interface HeaderClientProps {
  data: Header
  appTitle?: string | undefined
  navTree: NavTreeItem[]
  twitchStatusSlot?: React.ReactNode
}

export const HeaderClient: React.FC<HeaderClientProps> = ({
  appTitle,
  navTree,
  twitchStatusSlot,
  // data,
}) => {
  const [themeMode, setThemeMode] = useState<string | null>(null)
  const [themeColor, setThemeColor] = useState<string | null>(null)

  const { headerThemeMode, setHeaderThemeMode, headerThemeColor, setHeaderThemeColor } =
    useHeaderTheme()
  const pathname = usePathname()

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

  const HeaderRowStyles = 'px-2 py-2 mx-auto grid grid-cols-12 grid-rows-1 gap-3 rounded-none'

  return (
    <header
      className={`fixed top-0 z-20 w-screen rounded-none bg-background shadow-md`}
      data-theme={themeColor}
      data-mode={themeMode}
    >
      {/* TOP ROW OF HEADER */}
      <div className={cn(HeaderRowStyles, 'border-b')}>
        <div className="col-span-2 flex justify-start align-middle">{twitchStatusSlot}</div>
        <div className="col-span-8 flex flex-row flex-nowrap justify-center rounded-none">
          <AppMainLogo text={appTitle} />
        </div>
        <div className="col-span-2 flex justify-end">
          <ColorThemeToggle />
        </div>
      </div>

      {/* BOTTOM ROW OF HEADER */}
      <div className={cn(HeaderRowStyles, 'container')}>
        <div className="col-span-2 flex justify-start"></div>
        <div className="col-span-8 flex flex-row flex-nowrap justify-center rounded-none bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <NavMenu navTree={navTree} />
          {/* <HeaderNav data={data} /> */}
        </div>
      </div>
    </header>
  )
}
