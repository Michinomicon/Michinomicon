export type StorageData =
  | string
  | number
  | boolean
  | null
  | StorageData[]
  | { [key: string]: StorageData }

export type AppStorageData = { [key: string]: StorageData }

export type StoragePath<T extends object> = {
  [K in keyof T & (string | number)]: T[K] extends unknown[]
    ? `${K}`
    : T[K] extends object
      ? `${K}` | `${K}.${StoragePath<T[K]>}`
      : `${K}`
}[keyof T & (string | number)]

export function setDeep<T extends object, P extends StoragePath<T>>(
  obj: T,
  path: P,
  value: StorageData,
): T {
  const keys = (path as string).split('.')
  const result = { ...obj } as Record<string, unknown>
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string
    const existing = current[key]

    current[key] = typeof existing === 'object' && existing !== null ? { ...existing } : {}

    current = current[key] as Record<string, unknown>
  }

  const finalKey = keys[keys.length - 1] as string
  current[finalKey] = value

  return result as unknown as T
}
