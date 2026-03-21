import React from 'react'
import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import { PdfMediaWrapper } from './PdfMediaWrapper'
import {
  isPayloadMedia,
  type MediaProps,
  type ImageMediaProps,
  type VideoMediaProps,
  isPdfMIMEType,
  isImageMIMEType,
  isVideoMIMEType,
} from './types'
import RichText from '@/components/RichText'
import { cn } from '@/lib/utils'

export const Media: React.FC<MediaProps> = (props) => {
  const {
    // Shared
    className,
    htmlElement = 'div',
    resource,
    description,
    // Image
    fill,
    imgClassName,
    loading,
    pictureClassName,
    priority,
    size,
    src,
    // Video
    videoClassName,
    // PDF
    title,
    ...baseProps
  } = props

  // const Tag = htmlElement || Fragment
  const wrapperProps = htmlElement !== null ? { className } : {}

  if (isPayloadMedia(resource)) {
    if (isVideoMIMEType(resource.mimeType)) {
      const videoProps: VideoMediaProps = {
        ...baseProps,
        resource,
        videoClassName,
        ref: baseProps.ref as React.Ref<HTMLVideoElement>,
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
    }

    if (isImageMIMEType(resource.mimeType)) {
      const imageProps: ImageMediaProps = {
        ...baseProps,
        resource,
        fill,
        imgClassName,
        loading,
        pictureClassName,
        priority,
        size,
        src,
        ref: baseProps.ref as React.Ref<HTMLImageElement>,
      }
      return (
        <React.Fragment {...wrapperProps}>
          <ImageMedia {...imageProps} />
        </React.Fragment>
      )
    }

    if (isPdfMIMEType(resource.mimeType)) {
      return (
        <React.Fragment {...wrapperProps}>
          <PdfMediaWrapper
            resource={resource}
            title={title}
            description={description}
            {...baseProps}
          />
        </React.Fragment>
      )
    }
  }
}
