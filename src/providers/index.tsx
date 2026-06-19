import React from 'react'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AudioTrackProvider } from './Audio'
import { WallpaperProvider } from './Wallpaper'
import { PageTOCProvider } from './PageTOC'
import { SidebarProvider } from '@/components/ui/sidebar'

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
            <AudioTrackProvider>
              <PageTOCProvider>
                <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
              </PageTOCProvider>
            </AudioTrackProvider>
          </TooltipProvider>
        </HeaderThemeProvider>
      </ThemeProvider>
    </WallpaperProvider>
  )
}
