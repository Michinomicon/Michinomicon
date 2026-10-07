import { useState, useEffect } from 'react'

export function useIsKeyboardOpen() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (!window.visualViewport) return

    const handleResize = () => {
      // The visualViewport height drops significantly when the keyboard opens
      const isMobileKeyboard =
        window.visualViewport !== null && window.visualViewport.height < window.innerHeight * 0.85
      setIsKeyboardOpen(isMobileKeyboard)
    }

    window.visualViewport.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  return isKeyboardOpen
}
