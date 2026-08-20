'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import { AppStorageData, StoragePath, setDeep, StorageData } from '@/lib/storage-utils'

export const LocalStorageKey = `${process.env.NEXT_PUBLIC_APP_NAME}-${process.env.NODE_ENV}`

type StorageContextType = {
  localStorage: AppStorageData
  setLocalStorage: <P extends string>(path: P, value: StorageData) => void
  getLocalStorage: <P extends string>(path: P) => StorageData
  isHydrated: boolean
}

const LocalStorageContext = createContext<StorageContextType | null>(null)

interface ProviderProps {
  children: ReactNode
  defaultData: AppStorageData
}

export function LocalStorageProvider({ children, defaultData }: ProviderProps) {
  const [data, setData] = useState<AppStorageData>(defaultData)
  const [isHydrated, setIsHydrated] = useState<boolean>(false)
  const defaultDataRef = useRef<AppStorageData>(defaultData)

  // Initialize from local storage on client mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LocalStorageKey)
      if (item) {
        const parsedItem = JSON.parse(item) as AppStorageData
        setData({ ...defaultDataRef.current, ...parsedItem } as AppStorageData)
      }
    } catch (error) {
      console.error('Failed to read from localStorage', error)
    }
    setIsHydrated(true)
  }, [defaultData])

  const setValue = <P extends StoragePath<AppStorageData>>(path: P, value: StorageData) => {
    setData((prevData: AppStorageData) => {
      const newData: AppStorageData = setDeep<AppStorageData, P>(prevData, path, value)
      try {
        window.localStorage.setItem(LocalStorageKey, JSON.stringify(newData))
      } catch (error) {
        console.error('Failed to save to localStorage', error)
      }
      return newData
    })
  }

  const getValue = useCallback(
    <P extends StoragePath<AppStorageData>>(path: P) => {
      const [baseKey, ...keys] = (path as string).split('.')

      let current: unknown = data[baseKey]

      for (const key of keys) {
        // Check if current is a valid object before attempting to access its properties
        if (current !== null && typeof current === 'object' && key in current) {
          current = current[key as keyof typeof current]
        } else {
          return null
        }
      }

      return (current ?? null) as StorageData
    },
    [data],
  )

  const contextValue: StorageContextType = {
    localStorage: data,
    setLocalStorage: setValue,
    getLocalStorage: getValue,
    isHydrated,
  }

  return (
    <LocalStorageContext.Provider value={contextValue}>{children}</LocalStorageContext.Provider>
  )
}

export function useLocalStorage(): StorageContextType {
  const context = useContext(LocalStorageContext)
  if (!context) {
    throw new Error('useLocalStorage must be used within a LocalStorageProvider')
  }
  return context as StorageContextType
}
