'use client'
import React, { createContext, useCallback, use, useState } from 'react'
import canUseDOM from '@/utilities/canUseDOM'

export interface ContextType {
  headerThemeMode: string | null
  headerThemeColor: string | null
  setHeaderThemeMode: (mode: string | null) => void
  setHeaderThemeColor: (theme: string | null) => void
}

const initialContext: ContextType = {
  headerThemeMode: null,
  headerThemeColor: null,
  setHeaderThemeMode: () => null,
  setHeaderThemeColor: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export function getImplicitModePreference() {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerThemeMode, setThemeModeState] = useState<string | null>(
    canUseDOM ? document.documentElement.getAttribute('data-mode') : null,
  )
  const [headerThemeColor, setThemeColorState] = useState<string | null>(
    canUseDOM ? document.documentElement.getAttribute('data-theme') : null,
  )

  const setHeaderThemeMode = useCallback((themeModeToSet: string | null) => {
    setThemeModeState(themeModeToSet)
  }, [])
  const setHeaderThemeColor = useCallback((themeColorToSet: string | null) => {
    setThemeColorState(themeColorToSet)
  }, [])

  return (
    <HeaderThemeContext
      value={{ headerThemeMode, setHeaderThemeMode, headerThemeColor, setHeaderThemeColor }}
    >
      {children}
    </HeaderThemeContext>
  )
}

export const useHeaderTheme = (): ContextType => use(HeaderThemeContext)
