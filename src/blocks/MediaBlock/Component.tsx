import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import { MediaProps as MediaComponentProps } from '@/components/Media/types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
  mediaProps?: MediaComponentProps
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = false,
    imgClassName,
    media,
    staticImage,
    mediaProps,
    disableInnerContainer,
  } = props

  let caption: DefaultTypedEditorState | undefined | null = null
  if (media && typeof media === 'object') caption = media.caption

  return (
    <span
      className={cn(
        'media-block',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {(media || staticImage) && (
        <Media
          className={cn('', imgClassName)}
          resource={media}
          src={staticImage}
          {...mediaProps}
          layout={'mediaBlock'}
          // {...{
          //   layout: 'mediaBlock',
          //   ...mediaProps,
          //   // galleryItemClassNames: 'not-prose',
          //   // settings: {
          //   //   closable: false,
          //   //   showCloseIcon: false,
          //   //   controls: false,
          //   //   showMaximizeIcon: false,
          //   //   mousewheel: false,
          //   //   download: false,
          //   //   enableDrag: false,
          //   // },
          // }}
        />
      )}
      {caption && (
        <div
          className={cn(
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </span>
  )
}
