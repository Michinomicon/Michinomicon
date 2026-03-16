import React, { Fragment } from 'react'
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

export const Media: React.FC<MediaProps> = (props) => {
  const {
    // Shared
    className,
    htmlElement = 'div',
    resource,
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

  const Tag = htmlElement || Fragment
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
        <Tag {...wrapperProps}>
          <VideoMedia {...videoProps} />
        </Tag>
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
        <Tag {...wrapperProps}>
          <ImageMedia {...imageProps} />
        </Tag>
      )
    }

    if (isPdfMIMEType(resource.mimeType)) {
      return (
        <Tag {...wrapperProps}>
          <PdfMediaWrapper resource={resource} title={title} {...baseProps} />
        </Tag>
      )
    }
  }
}
