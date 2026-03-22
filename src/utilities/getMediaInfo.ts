import {
  isPayloadMedia,
  getMIMEType,
  AudioMediaProps,
  ImageMediaProps,
  PdfMediaProps,
  VideoMediaProps,
} from '@/components/Media/types'
import { Media } from '@/payload-types'
import { formatFileSize } from './formatFileSize'

export type AudioMediaInfo = {
  [Prop in keyof Required<
    Pick<
      Media,
      | 'title'
      | 'updatedAt'
      | 'createdAt'
      | 'alt'
      | 'caption'
      | 'width'
      | 'height'
      | 'duration'
      | 'codec'
      | 'format'
      | 'folder'
      | 'url'
      | 'thumbnailURL'
      | 'filename'
      | 'mimeType'
      | 'filesize'
      | 'artist'
      | 'album'
    >
  >]: string
}

export type VideoMediaInfo = {
  [Prop in keyof Required<
    Pick<
      Media,
      | 'title'
      | 'updatedAt'
      | 'createdAt'
      | 'alt'
      | 'caption'
      | 'width'
      | 'height'
      | 'duration'
      | 'codec'
      | 'format'
      | 'folder'
      | 'url'
      | 'thumbnailURL'
      | 'filename'
      | 'mimeType'
      | 'filesize'
    >
  >]: string
}

export type PdfMediaInfo = {
  [Prop in keyof Required<
    Pick<
      Media,
      | 'title'
      | 'updatedAt'
      | 'createdAt'
      | 'url'
      | 'thumbnailURL'
      | 'filename'
      | 'mimeType'
      | 'filesize'
    >
  >]: string
}

export type ImageMediaInfo = {
  [Prop in keyof Required<
    Pick<
      Media,
      | 'title'
      | 'updatedAt'
      | 'createdAt'
      | 'alt'
      | 'caption'
      | 'width'
      | 'height'
      | 'format'
      | 'hasAlpha'
      | 'folder'
      | 'url'
      | 'thumbnailURL'
      | 'filename'
      | 'mimeType'
      | 'filesize'
      | 'focalX'
      | 'focalY'
    >
  >]: string
}

const getFormattedMediaInfoPropertyValue = (
  prop: keyof Required<Media>,
  resource: Media,
): string => {
  switch (prop) {
    case 'updatedAt':
      return resource[prop] ? new Date(resource[prop]).toUTCString() : ''
    case 'createdAt':
      return resource[prop] ? new Date(resource[prop]).toUTCString() : ''
    case 'filesize':
      return formatFileSize(resource[prop])
    default:
      return resource[prop] ? String(resource[prop]) : ''
  }
}

export const getPDFMediaInfo = (resource: Media): PdfMediaInfo => {
  const info: PdfMediaInfo = {
    title: '',
    updatedAt: '',
    createdAt: '',
    url: '',
    thumbnailURL: '',
    filename: '',
    mimeType: '',
    filesize: '',
  }
  for (const prop of Object.keys(info) as Array<keyof PdfMediaInfo>) {
    info[prop] = getFormattedMediaInfoPropertyValue(prop, resource)
  }

  return info
}

export const getVideoMediaInfo = (resource: Media): VideoMediaInfo => {
  const info: VideoMediaInfo = {
    title: '',
    updatedAt: '',
    createdAt: '',
    url: '',
    thumbnailURL: '',
    filename: '',
    mimeType: '',
    filesize: '',
    alt: '',
    caption: '',
    width: '',
    height: '',
    format: '',
    folder: '',
    duration: '',
    codec: '',
  }
  for (const prop of Object.keys(info) as Array<keyof VideoMediaInfo>) {
    info[prop] = getFormattedMediaInfoPropertyValue(prop, resource)
  }
  return info
}

export const getImageMediaInfo = (resource: Media): ImageMediaInfo => {
  const info: ImageMediaInfo = {
    title: '',
    updatedAt: '',
    createdAt: '',
    url: '',
    thumbnailURL: '',
    filename: '',
    mimeType: '',
    filesize: '',
    alt: '',
    caption: '',
    width: '',
    height: '',
    format: '',
    hasAlpha: '',
    folder: '',
    focalX: '',
    focalY: '',
  }
  for (const prop of Object.keys(info) as Array<keyof ImageMediaInfo>) {
    info[prop] = getFormattedMediaInfoPropertyValue(prop, resource)
  }
  return info
}

export const getAudioMediaInfo = (resource: Media): AudioMediaInfo => {
  const info: AudioMediaInfo = {
    title: '',
    updatedAt: '',
    createdAt: '',
    url: '',
    thumbnailURL: '',
    filename: '',
    mimeType: '',
    filesize: '',
    alt: '',
    caption: '',
    width: '',
    height: '',
    format: '',
    folder: '',
    duration: '',
    codec: '',
    artist: '',
    album: '',
  }
  for (const prop of Object.keys(info) as Array<keyof AudioMediaInfo>) {
    info[prop] = getFormattedMediaInfoPropertyValue(prop, resource)
  }
  return info
}

export const getMediaResourceInfo = (
  mediaProps: PdfMediaProps | VideoMediaProps | AudioMediaProps | ImageMediaProps,
):
  | ImageMediaInfo
  | VideoMediaInfo
  | AudioMediaInfo
  | PdfMediaInfo
  | { error: 'No information.' } => {
  const { resource } = mediaProps
  if (isPayloadMedia(resource)) {
    const mime = getMIMEType(resource.mimeType)
    if (mime) {
      switch (mime.type) {
        case 'image':
          return getImageMediaInfo(resource)
        case 'video':
          return getVideoMediaInfo(resource)
        case 'audio':
          return getAudioMediaInfo(resource)
        case 'application':
          if (mime.subtype === 'pdf') {
            return getPDFMediaInfo(resource)
          }
          break
        default:
          break
      }
    }
  }
  return { error: 'No information.' }
}
