'use client'



import React, { createContext, useCallback, use, useState } from 'react'

import canUseDOM from '@/utilities/canUseDOM'
// import { ThemeMode } from '../Theme/shared'

export interface ContextType {
  headerTheme?: string | null
  setHeaderTheme: (theme: string | null) => void
}

const initialContext: ContextType = {
  headerTheme: undefined,
  setHeaderTheme: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setThemeState] = useState<string | undefined | null>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as string) : undefined,
  )

  const setHeaderTheme = useCallback((themeToSet: string | null) => {
    setThemeState(themeToSet)
  }, [])

  return <HeaderThemeContext value={{ headerTheme, setHeaderTheme }}>{children}</HeaderThemeContext>
}

export const useHeaderTheme = (): ContextType => use(HeaderThemeContext)
