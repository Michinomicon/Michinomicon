'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const WALLPAPER_EFFECT_SPOTLIGHT_STORAGE_KEY = 'michnomicon-wallpaper-effect-spotlight'
const WALLPAPER_EFFECT_REACTIVE_STORAGE_KEY = 'michnomicon-wallpaper-effect-reactive'

type WallpaperPreferences = {
  globalSpotlight: boolean
  globalReactiveTile: boolean
  setSpotlight: (value: boolean) => void
  setReactiveTile: (value: boolean) => void
}

const WallpaperContext = createContext<WallpaperPreferences | undefined>(undefined)

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const [globalSpotlight, setGlobalSpotlight] = useState(false)
  const [globalReactiveTile, setGlobalReactiveTile] = useState(true)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const setFeatureStateFromStorage = () => {
      const savedSpotlight = localStorage.getItem(WALLPAPER_EFFECT_SPOTLIGHT_STORAGE_KEY)
      const savedTile = localStorage.getItem(WALLPAPER_EFFECT_REACTIVE_STORAGE_KEY)
      if (savedSpotlight !== null) setGlobalSpotlight(savedSpotlight === 'true')
      if (savedTile !== null) setGlobalReactiveTile(savedTile === 'true')
    }
    setFeatureStateFromStorage()
  }, [])

  const setSpotlight = (value: boolean) => {
    console.debug(`WallpaperProvider: Spotlight = ${value}`)
    setGlobalSpotlight((prev) => {
      if (prev !== value) {
        localStorage.setItem(WALLPAPER_EFFECT_SPOTLIGHT_STORAGE_KEY, String(value))
        return value
      }
      return prev
    })
  }

  const setReactiveTile = (value: boolean) => {
    console.debug(`WallpaperProvider: Reactive = ${value}`)
    setGlobalReactiveTile((prev) => {
      if (prev !== value) {
        localStorage.setItem(WALLPAPER_EFFECT_REACTIVE_STORAGE_KEY, String(value))
        return value
      }
      return prev
    })
  }

  return (
    <WallpaperContext.Provider
      value={{
        globalSpotlight,
        globalReactiveTile,
        setSpotlight,
        setReactiveTile,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  )
}

export function useWallpaper() {
  const context = useContext(WallpaperContext)
  if (context === undefined) {
    throw new Error('useWallpaper must be used within a WallpaperProvider')
  }
  return context
}
