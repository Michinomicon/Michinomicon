import React from 'react'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

const DefaultColorTheme = process.env.DEFAULT_COLOR_THEME

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider
      attribute={['class', 'data-mode']}
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange
      defaultColorTheme="default"
    >
      <HeaderThemeProvider>{children}</HeaderThemeProvider>
    </ThemeProvider>
  )
}
