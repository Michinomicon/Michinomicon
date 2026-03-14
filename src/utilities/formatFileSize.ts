export const formatFileSize = (bytes: number | string | null | undefined): string => {
  const sizes = [' Bytes', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']

  const size = typeof bytes === 'string' ? parseInt(bytes) : (bytes ?? 0)

  for (let i = 1; i < sizes.length; i++) {
    if (size < Math.pow(1024, i)) {
      return Math.round((size / Math.pow(1024, i - 1)) * 100) / 100 + sizes[i - 1]
    }
  }

  return String(bytes)
}
