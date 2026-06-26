import React from 'react'
import { ImageMediaProps } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import { isPayloadMedia, type MediaProps, type VideoMediaProps } from './types'
import RichText from '@/components/RichText'
import { cn } from '@/lib/utils'
import TrackLoader from './AudioTrackLoader'
import { Track } from '@/lib/html-audio'
import { PdfMediaWrapper } from './PdfMediaWrapper'
import { getPDFMediaMetaData, getVideoMediaMetaData } from '@/utilities/getMediaMetaData'
import { ImageGallery } from '../ImageGallery'

const MESSAGE_FAILED_TO_RENDER = 'Failed to render media.'
const MESSAGE_RESOURCE_MISSING = 'Resource was missing or invalid.'
const MESSAGE_MIME_MISSING = 'Missing MIME Type.'
const MESSAGE_MIME_UNSUPPORTED = 'Unsupported MIME Type.'

export const Media = (props: MediaProps) => {
  const {
    alt = '',
    resource,
    description,
    fill,
    loading,
    src,
    videoClassName,
    title,
    ...baseProps
  } = props

  const getMediaPlaceholder = (message: string, details?: string) => {
    return (
      <React.Fragment>
        <details>
          <summary>{MESSAGE_FAILED_TO_RENDER}</summary>
          {message}
          {details}
        </details>
      </React.Fragment>
    )
  }

  if (!isPayloadMedia(resource)) {
    return getMediaPlaceholder(MESSAGE_RESOURCE_MISSING, `src: ${JSON.stringify(src)}`)
  }

  const mimeType: string | null | undefined = resource.mimeType

  if (!mimeType) {
    return getMediaPlaceholder(MESSAGE_MIME_MISSING, `( ${resource.mimeType} ) [${resource.id}]`)
  }

  switch (true) {
    case mimeType.includes('image'):
      const imageProps: ImageMediaProps = {
        ...baseProps,
        alt,
        fill,
        loading,
        src: resource,
      }

      console.log(`imageProps:`, imageProps)

      return (
        <React.Fragment>
          <ImageGallery items={[resource]} />
          {/* <ImageMedia {...imageProps} /> */}
        </React.Fragment>
      )
    case mimeType.includes('video'):
      const videoProps: VideoMediaProps = {
        ...baseProps,
        resource,
        videoClassName,
        ref: baseProps.ref as React.Ref<HTMLVideoElement>,
        metadata: getVideoMediaMetaData(resource),
      }
      return (
        <React.Fragment>
          <VideoMedia {...videoProps} />
          {resource.caption && (
            <div className={cn('')}>
              <RichText data={resource.caption} enableGutter={false} />
            </div>
          )}
        </React.Fragment>
      )
    case mimeType.includes('audio'):
      const audioTrack: Track = {
        id: resource.id,
        url: resource.url ?? '',
        title: resource.title ?? '',
        artist: resource.artist ?? '',
        artwork: resource.artwork ?? '',
        images: resource.images?.map((i) => String(i.image)),
        duration: Math.max(resource.duration ?? 0, 0),
        album: resource.album ?? '',
        genre: resource.genre ?? '',
        live: resource.live ?? false,
      }
      return (
        <React.Fragment>
          <TrackLoader {...audioTrack} />
        </React.Fragment>
      )

    case mimeType.includes('application'):
      if (mimeType.includes('pdf')) {
        return (
          <React.Fragment>
            <PdfMediaWrapper
              resource={resource}
              title={title}
              description={description}
              {...{ ...baseProps, metadata: getPDFMediaMetaData(resource) }}
            />
          </React.Fragment>
        )
      }
    default:
      return getMediaPlaceholder(MESSAGE_MIME_UNSUPPORTED, `( ${mimeType} ) [${resource.id}]`)
  }
}
