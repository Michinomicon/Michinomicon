import { Media } from '@/payload-types'
import { formatFileSize } from './formatFileSize'

export type AudioMediaMetaData = {
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

export type VideoMediaMetaData = {
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

export type PdfMediaMetaData = {
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

export type ImageMediaMetaData = {
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

const getMetaDataValue = (prop: keyof Required<Media>, resource: Media): string => {
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

export const getPDFMediaMetaData = (resource: Media): PdfMediaMetaData => {
  const info: PdfMediaMetaData = {
    title: '',
    updatedAt: '',
    createdAt: '',
    url: '',
    thumbnailURL: '',
    filename: '',
    mimeType: '',
    filesize: '',
  }
  for (const prop of Object.keys(info) as Array<keyof PdfMediaMetaData>) {
    info[prop] = getMetaDataValue(prop, resource)
  }

  return info
}

export const getVideoMediaMetaData = (resource: Media): VideoMediaMetaData => {
  const info: VideoMediaMetaData = {
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
  for (const prop of Object.keys(info) as Array<keyof VideoMediaMetaData>) {
    info[prop] = getMetaDataValue(prop, resource)
  }
  return info
}

export const getImageMediaMetaData = (resource: Media): ImageMediaMetaData => {
  const info: ImageMediaMetaData = {
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
  for (const prop of Object.keys(info) as Array<keyof ImageMediaMetaData>) {
    info[prop] = getMetaDataValue(prop, resource)
  }
  return info
}

export const getAudioMediaMetaData = (resource: Media): AudioMediaMetaData => {
  const info: AudioMediaMetaData = {
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
  for (const prop of Object.keys(info) as Array<keyof AudioMediaMetaData>) {
    info[prop] = getMetaDataValue(prop, resource)
  }
  return info
}
