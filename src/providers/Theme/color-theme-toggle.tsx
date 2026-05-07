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
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

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
                        <div className="flex items-center justify-center space-x-0 rounded-full border-2 border-accent outline-0">
                          <div className="rounded-r-0 h-6 w-3 rounded-l-full bg-primary outline-0"></div>
                          <div className="rounded-l-0 h-6 w-3 rounded-r-full bg-secondary outline-0"></div>
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
              Reactive Colors
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function MobileThemeModeFieldGroup() {
  const { setTheme, theme } = useTheme()

  return (
    <FieldGroup className="w-full px-8">
      <FieldSet>
        <FieldLegend variant="label">Dark or Light Appearance</FieldLegend>
        <RadioGroup value={theme} onValueChange={setTheme} className="pl-5">
          <FieldLabel
            htmlFor={'lightModeRadioItem'}
            data-active={theme === 'light'}
            className={cn(
              'group',
              'data-[active="true"]:border data-[active="true"]:border-primary',
            )}
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  <SunIcon className="transition-all" />
                  <span className={cn('group-data-[active="true"]:font-semibold')}>Light</span>
                </FieldTitle>
              </FieldContent>
              <div className="flex h-full flex-col items-center justify-center">
                <RadioGroupItem value={'light'} id={'lightModeRadioItem'}></RadioGroupItem>
              </div>
            </Field>
          </FieldLabel>
          <FieldLabel
            htmlFor={'darkModeRadioItem'}
            data-active={theme === 'dark'}
            className={cn(
              'group',
              'data-[active="true"]:border data-[active="true"]:border-primary',
            )}
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  <MoonIcon className="transition-all" />
                  <span className={cn('group-data-[active="true"]:font-semibold')}>Dark</span>
                </FieldTitle>
              </FieldContent>
              <div className="flex h-full flex-col items-center justify-center">
                <RadioGroupItem value={'dark'} id={'darkModeRadioItem'}></RadioGroupItem>
              </div>
            </Field>
          </FieldLabel>
          <FieldLabel
            htmlFor={'systemModeRadioItem'}
            className={cn(
              'group',
              'data-[active="true"]:border data-[active="true"]:border-primary',
            )}
            data-active={theme === 'system'}
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>
                  <SunMoonIcon className="transition-all" />
                  <span className={cn('group-data-[active="true"]:font-semibold')}>Auto</span>
                </FieldTitle>
              </FieldContent>
              <div className="flex h-full flex-col items-center justify-center">
                <RadioGroupItem value={'system'} id={'systemModeRadioItem'}></RadioGroupItem>
              </div>
            </Field>
          </FieldLabel>
        </RadioGroup>
      </FieldSet>
    </FieldGroup>
  )
}

export function MobileColorThemeFieldGroup() {
  const { colorTheme, setColorTheme, theme: currentThemeMode } = useTheme()
  const [activeColorTheme, setActiveColorTheme] = React.useState<string>(colorTheme)

  const onChangeActiveColorTheme = (nextActiveTheme: string) => {
    console.debug(`setting active color theme to "${nextActiveTheme}"`)
    setActiveColorTheme(nextActiveTheme)
    setColorTheme(nextActiveTheme)
  }

  const handleThemeItemMouseEnter = (itemTheme: string) => {
    console.debug(`handleThemeItemMouseEnter "${itemTheme}"`)
    if (itemTheme !== activeColorTheme) {
      setColorTheme(itemTheme)
    }
  }

  const handleThemeItemMouseLeave = (itemTheme: string) => {
    console.debug(`handleThemeItemMouseLeave "${itemTheme}"`)
    if (itemTheme !== activeColorTheme) {
      setColorTheme(activeColorTheme)
    }
  }

  return (
    <FieldGroup className="w-full px-8">
      <FieldSet>
        <FieldLegend variant="label">Color Pallette</FieldLegend>
        <RadioGroup
          value={activeColorTheme}
          onValueChange={onChangeActiveColorTheme}
          className="pl-5"
        >
          {colorThemes.map((theme, index) => {
            const isActiveTheme = activeColorTheme === theme.id
            return (
              <FieldLabel
                htmlFor={theme.id}
                data-active={isActiveTheme}
                key={index}
                onMouseEnter={() => {
                  handleThemeItemMouseEnter(theme.id)
                }}
                onMouseLeave={() => {
                  handleThemeItemMouseLeave(theme.id)
                }}
                className={cn(
                  'group',
                  'data-[active="true"]:border data-[active="true"]:border-primary',

                  isActiveTheme ? `` : ``,
                )}
              >
                <Field
                  orientation="horizontal"
                  className={`group-data-[active="true"]:bg-primary/10`}
                >
                  <FieldContent data-theme={theme.id} data-mode={currentThemeMode}>
                    <FieldTitle>
                      <div className="p-x-2 flex items-center gap-x-2">
                        <div className="flex items-center justify-center space-x-0 rounded-full border-2 border-accent outline-0">
                          <div className="rounded-r-0 h-6 w-3 rounded-l-full bg-primary outline-0"></div>
                          <div className="rounded-l-0 h-6 w-3 rounded-r-full bg-secondary outline-0"></div>
                        </div>
                        <span className={cn('group-data-[active="true"]:font-semibold')}>
                          {theme.label}
                        </span>
                      </div>
                    </FieldTitle>
                  </FieldContent>
                  <div className="flex h-full flex-col items-center justify-center">
                    <RadioGroupItem value={theme.id} id={theme.id}></RadioGroupItem>
                  </div>
                </Field>
              </FieldLabel>
            )
          })}
        </RadioGroup>
      </FieldSet>
      <FieldSeparator />
    </FieldGroup>
  )
}

export function MobileWallpaperSettingsFieldGroup() {
  const { globalSpotlight, globalReactiveTile, setSpotlight, setReactiveTile } = useWallpaper()

  return (
    <FieldGroup className="w-full px-8">
      <FieldSeparator />
      <FieldSet>
        <FieldLabel>Wallpaper Features</FieldLabel>
        <FieldGroup data-slot="checkbox-group" className="pl-5">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="checkbox-wallpaper-spotlight">
              Spotlight Effect
              <Popover>
                <PopoverTrigger className="">
                  <TriangleAlertIcon size={24} className="mx-auto text-destructive" />
                  {/* <Button variant="link" size="sm" className="text-destructive">
                        
                      </Button> */}
                </PopoverTrigger>
                <PopoverContent className="w-80 border border-destructive" side={'top'}>
                  <PopoverHeader>
                    <PopoverTitle>Experimental feature.</PopoverTitle>
                    <PopoverDescription>May negatively impact CPU performance.</PopoverDescription>
                  </PopoverHeader>
                </PopoverContent>
              </Popover>
            </FieldLabel>
            <Checkbox
              id="checkbox-wallpaper-spotlight"
              checked={globalSpotlight}
              onCheckedChange={setSpotlight}
            />
          </Field>

          <Field orientation="horizontal">
            <FieldLabel htmlFor="checkbox-wallpaper-reactive-colors">Reactive Colors</FieldLabel>
            <Checkbox
              id="checkbox-wallpaper-reactive-colors"
              checked={globalReactiveTile}
              onCheckedChange={setReactiveTile}
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
    </FieldGroup>
  )
}
