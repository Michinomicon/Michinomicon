'use client'

import { cssVariables } from '@/cssVariables'
const { breakpoints } = cssVariables
import * as React from 'react'

export function useBreakpoint(breakpoint: keyof typeof breakpoints & string) {
  const isBreakpoint = React.useSyncExternalStore(
    React.useCallback(
      (callback) => {
        const mql = window.matchMedia(`(max-width: ${breakpoints[breakpoint] - 1}px)`)
        mql.addEventListener('change', callback)
        return () => mql.removeEventListener('change', callback)
      },
      [breakpoint],
    ),
    () => window.innerWidth < breakpoints[breakpoint],
    () => false,
  )
  return isBreakpoint
}
