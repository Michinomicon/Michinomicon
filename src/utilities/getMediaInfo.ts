import { isPayloadMedia, MediaProps } from '@/components/Media/types'
import { Media } from '@/payload-types'
import { formatFileSize } from './formatFileSize'

export type MediaInfo = {
  [Prop in keyof Required<
    Omit<Media, 'sizes' | 'folder' | 'caption' | 'focalX' | 'focalY' | 'id' | 'width' | 'height'>
  >]: string
}

const getMediaInfoPropertyValue = (prop: keyof MediaInfo, resource: Media) => {
  switch (prop) {
    case 'updatedAt':
      return new Date(resource[prop]).toUTCString()
    case 'createdAt':
      return new Date(resource[prop]).toUTCString()
    case 'filesize':
      return formatFileSize(resource[prop])
    default:
      return resource[prop] ? String(resource[prop]) : ''
  }
}

export const getMediaInfo = (mediaProps?: MediaProps) => {
  const info: MediaInfo = {
    alt: '',
    title: '',
    updatedAt: '',
    createdAt: '',
    url: '',
    thumbnailURL: '',
    filename: '',
    mimeType: '',
    filesize: '',
  }

  if (isPayloadMedia(mediaProps?.resource)) {
    const { resource } = mediaProps
    for (const prop of Object.keys(info) as Array<keyof MediaInfo>) {
      info[prop] = getMediaInfoPropertyValue(prop, resource)
    }
  }
  return info
}
