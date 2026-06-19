'use client'

import * as React from 'react'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme } from '.'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  const mounted = React.useSyncExternalStore(
    () => () => {}, // Subscribe (noop)
    () => true, // Client snapshot
    () => false, // Server snapshot
  )

  if (!mounted) {
    return null
  }

  return (
    <ToggleGroup
      asChild
      variant="outline"
      type="single"
      size="sm"
      defaultValue="system"
      aria-label="Toggle theme dark mode"
      value={theme}
      spacing={0}
      onValueChange={(value) => {
        if (value) setTheme(value)
      }}
    >
      <ToggleGroupItem value="light" aria-label="Light mode">
        <Sun className="transition-all" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode">
        <Moon className="transition-all" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="Follow system">
        <SunMoon className="transition-all" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
