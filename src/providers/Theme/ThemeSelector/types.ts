import { LocalStorageKey } from '@/providers/LocalStorageProvider'

export type Theme = 'dark' | 'light'

export const ThemeModeLocalStorageKey = `${LocalStorageKey}-theme-mode`

export const defaultTheme = 'light'
