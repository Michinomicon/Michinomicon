import React from 'react'
import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import {
  isPayloadMedia,
  type MediaProps,
  type ImageMediaProps,
  type VideoMediaProps,
  AudioMediaProps,
  getMIMEType,
} from './types'
import RichText from '@/components/RichText'
import { cn } from '@/lib/utils'
import TrackLoader from './AudioTrackLoader'
import { Track } from '@/lib/html-audio'
import { PdfMediaWrapper } from './PdfMediaWrapper'

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
    // Audio
    // audioClassName,

    // PDF
    title,
    ...baseProps
  } = props

  console.debug(`Media -> props`, props)
  // const Tag = htmlElement || Fragment
  const wrapperProps = htmlElement !== null ? { className } : {}

  if (isPayloadMedia(resource)) {
    const mime = getMIMEType(resource.mimeType)
    if (mime) {
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
          const audioProps: AudioMediaProps = {
            ...baseProps,
            url: String(resource.url),
            // ref: baseProps.ref as React.Ref<HTMLAudioElement>,
          }
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

          console.debug(`passing audio props to TrackLoader:`, audioProps)
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
                  {...baseProps}
                />
              </React.Fragment>
            )
          }
        default:
          break
      }
    }
  }
}
// if (isPayloadMedia(resource)) {
//   if (isVideoMIMEType(resource.mimeType)) {
//     const videoProps: VideoMediaProps = {
//       ...baseProps,
//       resource,
//       videoClassName,
//       ref: baseProps.ref as React.Ref<HTMLVideoElement>,
//     }
//     return (
//       <React.Fragment {...wrapperProps}>
//         <VideoMedia {...videoProps} />
//         {resource.caption && (
//           <div className={cn('')}>
//             <RichText data={resource.caption} enableGutter={false} />
//           </div>
//         )}
//       </React.Fragment>
//     )
//   }

//   if (isAudioMIMEType(resource.mimeType)) {
//     const audioProps: AudioMediaProps = {
//       ...baseProps,
//       resource,
//       url: String(resource.url),
//       // ref: baseProps.ref as React.Ref<HTMLAudioElement>,
//     }
//     return (
//       <React.Fragment {...wrapperProps}>
//         <TrackLoader {...audioProps} />
//       </React.Fragment>
//     )
//   }

//   if (isImageMIMEType(resource.mimeType)) {
//     const imageProps: ImageMediaProps = {
//       ...baseProps,
//       fill,
//       imgClassName,
//       loading,
//       pictureClassName,
//       priority,
//       size,
//       src,
//       ref: baseProps.ref as React.Ref<HTMLImageElement>,
//     }
//     return (
//       <React.Fragment {...wrapperProps}>
//         <ImageMedia {...imageProps} />
//       </React.Fragment>
//     )
//   }

//   if (isPdfMIMEType(resource.mimeType)) {
//     return (
//       <React.Fragment {...wrapperProps}>
//         <PdfMediaWrapper
//           resource={resource}
//           title={title}
//           description={description}
//           {...baseProps}
//         />
//       </React.Fragment>
//     )
//   }
// }
// }
