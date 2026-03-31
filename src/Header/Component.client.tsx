'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { ColorThemeToggle } from '@/providers/Theme/color-theme-toggle'
import type { Header } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface HeaderClientProps {
  data: Header
  appTitle?: string | undefined
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ appTitle, data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [themeMode, setThemeMode] = useState<string | null>(null)
  const [themeColor, setThemeColor] = useState<string | null>(null)

  const { headerThemeMode, setHeaderThemeMode, headerThemeColor, setHeaderThemeColor } =
    useHeaderTheme()
  const pathname = usePathname()

  const isWiki = pathname?.startsWith('/wiki')

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
      className={`w-full h-(--header-height) flex flex-row flex-nowrap px-6 rounded-none sticky top-0 z-20 bg-background shadow-md`}
      data-theme={themeColor}
      data-mode={themeMode}
    >
      <div className="py-2 flex items-center">{isWiki && <SidebarTrigger />}</div>
      <div className="container py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Logo text={appTitle} loading="eager" priority="auto" />
          </Link>
          <HeaderNav data={data} />
          <div className="flex gap-2">
            <ColorThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
