import { Media } from '@/payload-types'
import path from 'path'

export function getMediaFileName(media: Media): string | undefined {
  const { filename } = media
  if (filename) {
    const { name } = path.parse(filename)
    if (name.length > 0) {
      return name
    }
  }
  return
}
