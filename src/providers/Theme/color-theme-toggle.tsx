'use client'

import { MoonIcon, PaletteIcon, SunIcon, SunMoonIcon, TriangleAlertIcon } from 'lucide-react'

import { useTheme } from '.'
import { useWallpaper } from '../Wallpaper'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'

const colorThemes: Array<{ id: string; label: string }> = [
  { id: 'default', label: 'Default' },
  { id: 'simple', label: 'Simple' },
  { id: 'purple', label: 'Purple' },
  // { id: 'minimal-red', label: 'Minimal Red' },
  // { id: 'minimal-rose', label: 'Minimal Rose' },
  // { id: 'minimal-orange', label: 'Minimal Orange' },
  // { id: 'minimal-green', label: 'Minimal Green' },
  // { id: 'minimal-blue', label: 'Minimal Blue' },
  // { id: 'minimal-yellow', label: 'Minimal Yellow' },
  // { id: 'minimal-violet', label: 'Minimal Violet' },
  // { id: 'blue', label: 'Blue' },
]

export function ColorThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const { setTheme, theme, colorTheme, setColorTheme } = useTheme()

  const [activeColorTheme, setActiveColorTheme] = React.useState<string>(colorTheme)
  const { globalSpotlight, globalReactiveTile, setSpotlight, setReactiveTile } = useWallpaper()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const onChangeActiveColorTheme = (nextActiveTheme: string) => {
    console.debug(`setting active color theme to "${nextActiveTheme}"`)
    setActiveColorTheme(nextActiveTheme)
    setColorTheme(nextActiveTheme)
  }

  const handleThemeItemMouseEnter = (itemTheme: string) => {
    if (itemTheme !== activeColorTheme) {
      setColorTheme(itemTheme)
    }
  }

  const handleThemeItemMouseLeave = (itemTheme: string) => {
    if (itemTheme !== activeColorTheme) {
      setColorTheme(activeColorTheme)
    }
  }

  return (
    <div
    // onMouseEnter={() => {
    //   setDropdownOpen(true)
    // }}
    >
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="default" className="text-primary">
            {theme === 'light' ? (
              <SunIcon className="transition-all" />
            ) : theme === 'dark' ? (
              <MoonIcon className="transition-all" />
            ) : theme === 'system' ? (
              <SunMoonIcon className="transition-all" />
            ) : (
              <PaletteIcon />
            )}{' '}
            Theme
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48"
          // onMouseLeave={() => {
          //   // Close when leaving the trigger or dropdown menu
          //   setDropdownOpen(false)
          // }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Light/Dark Mode</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <SunIcon className="transition-all" />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <MoonIcon className="transition-all" />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <SunMoonIcon className="transition-all" />
                Follow Browser
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>

          <DropdownMenuSeparator></DropdownMenuSeparator>

          <DropdownMenuGroup>
            <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={activeColorTheme}
              onValueChange={onChangeActiveColorTheme}
              className=""
            >
              {colorThemes.map((theme, index) => {
                const isActiveTheme = activeColorTheme === theme.id
                return (
                  <span data-theme={theme.id} key={index}>
                    <DropdownMenuRadioItem
                      onMouseEnter={() => {
                        handleThemeItemMouseEnter(theme.id)
                      }}
                      onMouseLeave={() => {
                        handleThemeItemMouseLeave(theme.id)
                      }}
                      value={theme.id}
                      data-theme={theme.id}
                      className={cn(
                        `bg-primary/10`,
                        isActiveTheme ? `border border-primary font-semibold` : ``,
                      )}
                    >
                      <div className="flex items-center gap-2 p-2">
                        <div className="flex items-center justify-center space-x-0 rounded-full border-accent border-2 outline-0">
                          <div className="w-3 h-6 bg-primary rounded-l-full rounded-r-0 outline-0"></div>
                          <div className="w-3 h-6 bg-secondary rounded-l-0 rounded-r-full outline-0"></div>
                        </div>
                        <span>{theme.label}</span>
                      </div>
                    </DropdownMenuRadioItem>
                  </span>
                )
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>

          <DropdownMenuSeparator></DropdownMenuSeparator>

          <DropdownMenuGroup>
            <DropdownMenuLabel>Wallpaper Features</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              id="checkbox-wallpaper-spotlight"
              checked={globalSpotlight}
              onCheckedChange={setSpotlight}
            >
              <Label className="text-nowrap">
                Spotlight Effect
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="link" size="sm" className="text-destructive">
                      <TriangleAlertIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Experimental feature. May Impact CPU Performance</TooltipContent>
                </Tooltip>
              </Label>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              id="checkbox-wallpaper-reactive-colors"
              checked={globalReactiveTile}
              onCheckedChange={setReactiveTile}
            >
              Reactive Colours
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
