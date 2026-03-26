export const formatFileSize = (
  bytes: number | string | null | undefined,
  locale: Intl.LocalesArgument = 'en-US',
  unitDisplay: Intl.NumberFormatOptions['unitDisplay'] = 'short',
  maximumFractionDigits: Intl.NumberFormatOptions['maximumFractionDigits'] = 2,
): string => {
  try {
    const parsed = typeof bytes === 'string' ? parseInt(bytes, 10) : (bytes ?? 0)
    const size = Number.isNaN(parsed) ? 0 : parsed
    const absoluteSize = Math.abs(size)

    const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte']

    let unitIndex = absoluteSize === 0 ? 0 : Math.floor(Math.log(absoluteSize) / Math.log(1024))

    // Cap the index to prevent out-of-bounds if the size exceeds Petabytes
    unitIndex = Math.min(unitIndex, units.length - 1)

    const value = size / Math.pow(1024, unitIndex)
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: units[unitIndex],
      unitDisplay: unitDisplay,
      maximumFractionDigits: maximumFractionDigits,
    }).format(value)
  } catch (_error) {
    if (bytes == null) {
      return ''
    }
    return String(bytes)
  }
}
