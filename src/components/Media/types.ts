import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'
import { Nullable } from '@/utilities/types'
import { ImageMediaProps } from './ImageMedia'
import { ImageGalleryProps } from '../ImageGallery'

export type MediaMetaData = { [key: string]: string }

export interface BaseMediaProps {
  url?: string | null
  title?: string
  className?: string
  description?: string
  htmlElement?: ElementType | null
  onClick?: () => void
  onLoad?: () => void
  metadata?: MediaMetaData
  sortPriority?: Nullable<number>
  resource?: MediaType | string | number
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
  Partial<Omit<ImageGalleryProps, keyof BaseMediaProps>> &
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
