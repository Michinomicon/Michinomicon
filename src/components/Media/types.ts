import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'
import { MIMEType } from 'util'

export interface BaseMediaProps {
  alt?: string
  className?: string
  htmlElement?: ElementType | null
  onClick?: () => void
  onLoad?: () => void
  resource?: MediaType | string | number | null
}

export interface ImageMediaProps extends BaseMediaProps {
  fill?: boolean
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  pictureClassName?: string
  priority?: boolean
  ref?: Ref<HTMLImageElement | null>
  size?: string
  src?: StaticImageData | string
}

export interface VideoMediaProps extends BaseMediaProps {
  ref?: Ref<HTMLVideoElement | null>
  videoClassName?: string
}

export interface PdfMediaProps extends BaseMediaProps {
  title?: string
}

export type MediaProps = BaseMediaProps &
  Partial<Omit<ImageMediaProps, keyof BaseMediaProps>> &
  Partial<Omit<VideoMediaProps, keyof BaseMediaProps>> &
  Partial<Omit<PdfMediaProps, keyof BaseMediaProps>> & {
    ref?: Ref<HTMLImageElement | HTMLVideoElement | HTMLDivElement | null>
  }

export const isPayloadMedia = (resource: BaseMediaProps['resource']): resource is MediaType => {
  return typeof resource === 'object' && resource !== null && 'mimeType' in resource
}

export const isImageMIMEType = (mimeType: unknown) => {
  return new MIMEType(String(mimeType)).type === 'image'
}

export const isVideoMIMEType = (mimeType: unknown) => {
  return new MIMEType(String(mimeType)).type === 'video'
}
export const isPdfMIMEType = (mimeType: unknown) => {
  const { type, subtype } = new MIMEType(String(mimeType))
  return type === 'application' && subtype === 'pdf'
}
