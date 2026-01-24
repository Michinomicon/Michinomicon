'use client'

import React, { useEffect, useState } from 'react'
import { Palette } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '.'
import { ModeToggle } from './mode-toggle'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'

const themes: Array<{ id: string; label: string }> = [
  { id: 'default', label: 'Default' },
  { id: 'fii-one', label: 'Fii One' },
  { id: 'minimal-red', label: 'Minimal Red' },
  { id: 'minimal-rose', label: 'Minimal Rose' },
  { id: 'minimal-orange', label: 'Minimal Orange' },
  { id: 'minimal-green', label: 'Minimal Green' },
  { id: 'minimal-blue', label: 'Minimal Blue' },
  { id: 'minimal-yellow', label: 'Minimal Yellow' },
  { id: 'minimal-violet', label: 'Minimal Violet' },
  { id: 'blue', label: 'Blue' },
  { id: 'purple', label: 'Purple' },
]

export function ColorThemeToggle() {
  const { setColorTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <ButtonGroup>
      <ButtonGroup>
        <ModeToggle />
      </ButtonGroup>
      <ButtonGroupSeparator />
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Palette className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            {/* <span className="sr-only">Toggle color theme</span>
            <span className="ml-2 hidden sm:inline-block">
              {themes.find((t) => t.id === colorTheme)?.label || 'Default'}
            </span> */}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {themes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => setColorTheme(theme.id)}
                className="flex items-center gap-2"
                data-theme={theme.id}
              >
                <div className="flex items-center gap-2 p-2">
                  <div className="flex items-center justify-center space-x-0 rounded-full border-accent border-2 outline-0">
                    <div className="w-3 h-6 bg-primary rounded-l-full rounded-r-0 outline-0"></div>
                    <div className="w-3 h-6 bg-secondary rounded-l-0 rounded-r-full outline-0"></div>
                  </div>
                  <span>{theme.label}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}
