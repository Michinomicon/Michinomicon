import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'
import { MIMEType } from 'util'

export interface BaseMediaProps {
  url?: string
  title?: string
  className?: string
  description?: string
  htmlElement?: ElementType | null
  onClick?: () => void
  onLoad?: () => void
  resource?: MediaType | string | number | null
}

export interface ImageMediaProps extends BaseMediaProps {
  alt?: string
  fill?: boolean
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  pictureClassName?: string
  priority?: boolean
  ref?: Ref<HTMLImageElement | null>
  size?: string
  src?: StaticImageData | string
}

export interface AudioMediaProps extends BaseMediaProps {
  audioClassName?: string
}

export interface VideoMediaProps extends BaseMediaProps {
  alt?: string
  ref?: Ref<HTMLVideoElement | null>
  videoClassName?: string
}

export interface PdfMediaProps extends BaseMediaProps {
  title?: string
}

export type MediaProps = BaseMediaProps &
  Partial<Omit<ImageMediaProps, keyof BaseMediaProps>> &
  Partial<Omit<VideoMediaProps, keyof BaseMediaProps>> &
  Partial<Omit<AudioMediaProps, keyof BaseMediaProps>> &
  Partial<Omit<PdfMediaProps, keyof BaseMediaProps>> & {
    ref?: Ref<HTMLImageElement | HTMLVideoElement | HTMLDivElement | null>
  }

export function isPayloadMedia(resource: unknown): resource is MediaType {
  return (
    resource !== undefined &&
    resource !== null &&
    typeof resource === 'object' &&
    'mimeType' in resource
  )
}

export const getMIMEType = (mimeType: unknown) => {
  try {
    if (mimeType !== null && mimeType !== undefined) {
      return new MIMEType(mimeType)
    }
  } catch (_err) {
    return null
  }
  return null
}

export const isImageMIMEType = (mimeType: unknown) => {
  try {
    if (mimeType !== null && mimeType !== undefined) {
      return new MIMEType(mimeType).type === 'image'
    }
  } catch (_err) {
    return false
  }
  return false
}

export const isAudioMIMEType = (mimeType: unknown) => {
  try {
    if (mimeType !== null && mimeType !== undefined) {
      return new MIMEType(String(mimeType)).type === 'audio'
    }
  } catch (_err) {
    return false
  }
  return false
}

export const isVideoMIMEType = (mimeType: unknown) => {
  try {
    if (mimeType !== null && mimeType !== undefined) {
      return new MIMEType(String(mimeType)).type === 'video'
    }
  } catch (_err) {
    return false
  }
  return false
}

export const isPdfMIMEType = (mimeType: unknown) => {
  try {
    if (mimeType !== null && mimeType !== undefined) {
      const mime = new MIMEType(String(mimeType))
      const { type, subtype } = mime
      return type === 'application' && subtype === 'pdf'
    }
  } catch (_err) {
    return false
  }
  return false
}
