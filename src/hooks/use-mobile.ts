'use client'

import * as React from 'react'

export const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobile = React.useSyncExternalStore(
    // onStoreChange() => Subscribe to media query changes
    React.useCallback((callback) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener('change', callback)
      return () => mql.removeEventListener('change', callback)
    }, []),
    // getSnapshot (Client)
    () => window.innerWidth < MOBILE_BREAKPOINT,
    // getServerSnapshot (Server)
    () => false,
  )

  return isMobile
}
