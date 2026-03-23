import React from 'react'
import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import {
  isPayloadMedia,
  type MediaProps,
  type ImageMediaProps,
  type VideoMediaProps,
} from './types'
import RichText from '@/components/RichText'
import { cn } from '@/lib/utils'
import TrackLoader from './AudioTrackLoader'
import { Track } from '@/lib/html-audio'
import { PdfMediaWrapper } from './PdfMediaWrapper'
import { getMIMEType } from '@/utilities/getMIMEType'
import { MIMEType } from 'util'
import {
  getImageMediaMetaData,
  getPDFMediaMetaData,
  getVideoMediaMetaData,
} from '@/utilities/getMediaMetaData'

const MESSAGE_FAILED_TO_RENDER = 'Failed to render media.'
const MESSAGE_RESOURCE_MISSING = 'Resource was missing or invalid.'
const MESSAGE_MIME_MISSING = 'Missing MIME Type.'
const MESSAGE_MIME_UNSUPPORTED = 'Unsupported MIME Type.'

export const Media: React.FC<MediaProps> = (props) => {
  const {
    className,
    htmlElement = 'div',
    resource,
    description,
    fill,
    imgClassName,
    loading,
    pictureClassName,
    priority,
    size,
    src,
    videoClassName,
    title,
    ...baseProps
  } = props

  const wrapperProps = htmlElement !== null ? { className } : {}

  if (!isPayloadMedia(resource)) {
    return (
      <React.Fragment>
        <p>
          {MESSAGE_FAILED_TO_RENDER}
          <br />
          <pre>{MESSAGE_RESOURCE_MISSING}</pre>
        </p>
      </React.Fragment>
    )
  }

  const mimeType: string | null | undefined = resource.mimeType

  const mime: MIMEType | null = getMIMEType(mimeType)

  if (!mime) {
    return (
      <React.Fragment>
        <p>
          {MESSAGE_FAILED_TO_RENDER}
          <br />
          <pre>{MESSAGE_MIME_MISSING}</pre>
        </p>
      </React.Fragment>
    )
  }

  switch (mime.type) {
    case 'image':
      const imageProps: ImageMediaProps = {
        ...baseProps,
        fill,
        imgClassName,
        loading,
        pictureClassName,
        priority,
        size,
        src,
        ref: baseProps.ref as React.Ref<HTMLImageElement>,
        metadata: getImageMediaMetaData(resource),
      }

      return (
        <React.Fragment {...wrapperProps}>
          <ImageMedia {...imageProps} />
        </React.Fragment>
      )
    case 'video':
      const videoProps: VideoMediaProps = {
        ...baseProps,
        resource,
        videoClassName,
        ref: baseProps.ref as React.Ref<HTMLVideoElement>,
        metadata: getVideoMediaMetaData(resource),
      }
      return (
        <React.Fragment {...wrapperProps}>
          <VideoMedia {...videoProps} />
          {resource.caption && (
            <div className={cn('')}>
              <RichText data={resource.caption} enableGutter={false} />
            </div>
          )}
        </React.Fragment>
      )
    case 'audio':
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
        <React.Fragment {...wrapperProps}>
          <TrackLoader {...audioTrack} />
        </React.Fragment>
      )

    case 'application':
      if (mime.subtype === 'pdf') {
        return (
          <React.Fragment {...wrapperProps}>
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
      return (
        <React.Fragment>
          <p>
            {MESSAGE_FAILED_TO_RENDER}
            <br />
            <pre>
              {MESSAGE_MIME_UNSUPPORTED} `[${mime.essence}]`
            </pre>
          </p>
        </React.Fragment>
      )
  }
}
