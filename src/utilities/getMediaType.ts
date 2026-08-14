import { Media } from '@/payload-types'

export function getMediaType(media: Media): 'image' | 'video' | 'youtube' {
  if (media.youtubeId && media.youtubeId.length > 0) return 'youtube'
  return typeof media.mimeType === 'string' && media.mimeType.includes('video') ? 'video' : 'image'
}
