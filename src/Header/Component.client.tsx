'use client'

import React, { useEffect, useState } from 'react'
import { ColorThemeToggle } from '@/providers/Theme/color-theme-toggle'
import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import NavMenu from '@/components/NavMenu'
import { NavTreeItem } from '@/utilities/buildNavTree'
import { PageTableOfContentsTrigger } from '@/components/PageTableOfContents'
import { cn } from '@/lib/utils'
import { AppMainLogo } from '@/components/AppMainLogo'

interface HeaderClientProps {
  data: Header
  appTitle?: string | undefined
  navTree: NavTreeItem[]
}

export const HeaderClient: React.FC<HeaderClientProps> = ({
  appTitle,
  navTree,
  // data,
}) => {
  /* Storing the value in a useState to avoid hydration errors */
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

  const HeaderRowStyles =
    'px-2 py-2 mx-auto container grid grid-cols-12 grid-rows-1 gap-3 rounded-none'

  return (
    <header
      className={`fixed w-screen rounded-none top-0 z-20 bg-background shadow-md`}
      data-theme={themeColor}
      data-mode={themeMode}
    >
      {/* TOP ROW OF HEADER */}
      <div className={cn(HeaderRowStyles, 'border-b')}>
        <div className="col-span-2 flex justify-start"></div>
        <div className="col-span-8 flex flex-row flex-nowrap justify-center rounded-none bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <AppMainLogo text={appTitle} />
        </div>
        <div className="col-span-2 flex justify-end">
          <ColorThemeToggle />
        </div>
      </div>

      {/* BOTTOM ROW OF HEADER */}
      <div className={cn(HeaderRowStyles)}>
        <div className="col-span-2 flex justify-start"></div>
        <div className="col-span-8 flex flex-row flex-nowrap justify-center rounded-none bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <NavMenu navTree={navTree} />
          {/* <HeaderNav data={data} /> */}
        </div>
        <div className="col-span-2 flex justify-end">{/* <PageTableOfContentsTrigger /> */}</div>
      </div>
    </header>
  )
}
