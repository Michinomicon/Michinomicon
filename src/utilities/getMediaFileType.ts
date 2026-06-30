import { Media } from '@/payload-types'
import path from 'path'

export function getMediaFileExtension(media: Media): string | undefined {
  const { filename } = media
  if (filename) {
    const extension: string = path.extname(filename)
    if (extension.length > 0) {
      return extension
    }
  }
  return
}
