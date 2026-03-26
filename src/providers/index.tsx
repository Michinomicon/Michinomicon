import React from 'react'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AudioTrackProvider } from './Audio'
import { WallpaperProvider } from './Wallpaper'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <WallpaperProvider>
      <ThemeProvider
        attribute={['class', 'data-mode']}
        defaultTheme="dark"
        enableSystem={true}
        disableTransitionOnChange
        defaultColorTheme="default"
      >
        <HeaderThemeProvider>
          <TooltipProvider delayDuration={800} skipDelayDuration={500}>
            <AudioTrackProvider>{children}</AudioTrackProvider>
          </TooltipProvider>
        </HeaderThemeProvider>
      </ThemeProvider>
    </WallpaperProvider>
  )
}
