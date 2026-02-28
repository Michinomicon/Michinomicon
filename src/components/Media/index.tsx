import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import { PdfMediaWrapper } from './PdfMediaWrapper'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isImage = typeof resource === 'object' && resource?.mimeType?.includes('image')
  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const isPdf = typeof resource === 'object' && resource?.mimeType?.includes('pdf')

  const Tag = htmlElement || Fragment

  console.log(`Media:`, props)

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {isVideo ? (
        <VideoMedia {...props} />
      ) : isImage ? (
        <ImageMedia {...props} />
      ) : isPdf ? (
        <PdfMediaWrapper url={`${resource?.url}`} />
      ) : null}
    </Tag>
  )
}
