'use client'

import * as React from 'react'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme } from '.'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function ModeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { setTheme, theme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
      onValueChange={(value) => {
        if (value) setTheme(value)
      }}
    >
      <ToggleGroupItem value="light" aria-label="Light mode">
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode">
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="Follow system">
        <SunMoon className="h-[1.2rem] w-[1.2rem] transition-all" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
