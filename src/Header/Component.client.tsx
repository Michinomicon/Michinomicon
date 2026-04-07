'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { ColorThemeToggle } from '@/providers/Theme/color-theme-toggle'
import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import { usePageAnchors } from '@/providers/PageAnchors'
import NavMenu from '@/components/NavMenu'
import { NavTreeItem } from '@/utilities/buildNavTree'
import { PageBreadcrumbNav } from '@/components/PageBreadcrumbNav'

interface HeaderClientProps {
  data: Header
  appTitle?: string | undefined
  navTree: NavTreeItem[]
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ appTitle, data, navTree }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [themeMode, setThemeMode] = useState<string | null>(null)
  const [themeColor, setThemeColor] = useState<string | null>(null)

  const { headerThemeMode, setHeaderThemeMode, headerThemeColor, setHeaderThemeColor } =
    useHeaderTheme()
  const pathname = usePathname()
  const { anchors } = usePageAnchors()

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

  return (
    <header
      className={`w-full px-6 rounded-none sticky top-0 z-20 bg-background shadow-md`}
      data-theme={themeColor}
      data-mode={themeMode}
    >
      <div className="container py-2 flex justify-between">
        <div className="grow"></div>
        <Link href="/">
          <Logo text={appTitle} loading="eager" priority="auto" />
        </Link>
        <div className="grow"></div>
      </div>
      <div className="flex justify-around w-full max-w-7xl mx-auto rounded-none border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <NavMenu navTree={navTree} postAnchors={anchors} />
        {/* <HeaderNav data={data} /> */}
        <div className="grow"></div>
        <ColorThemeToggle />
      </div>
      <div className="absolute left-auto right-0 top-[calc(var(--header-height)+1px)] z-30 ml-auto mr-0 w-(--sidebar-width) overflow-hidden overscroll-none">
        <div className="h-(--top-spacing) shrink-0">
          <div className="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8">
            <PageBreadcrumbNav anchors={anchors} navTree={navTree}></PageBreadcrumbNav>
          </div>
        </div>
      </div>
    </header>
  )
}
