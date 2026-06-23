'use client'

import { cn } from '@/utilities/ui'
import Image from 'next/image'
import { cssVariables } from '@/cssVariables'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { Media } from '@/payload-types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { getImageMediaMetaData, ImageMediaMetaData } from '@/utilities/getMediaMetaData'
import { ImageProps, StaticImport } from 'next/dist/shared/lib/get-img-props'
import RichText from '@/components/RichText'

const { breakpoints } = cssVariables

// this is used by the browser to determine which image to download at different screen sizes
const DEFAULT_IMAGE_SIZES = Object.entries(breakpoints)
  .map(([, value]) => `(max-width: ${value}px) ${value * 2}w`)
  .join(', ')

// White 1x1 pixel image with 0.3 opacity
export const lightPlaceholder =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP87wMAAlABTQluYBcAAAAASUVORK5CYII='

// Black 1x1 pixel image with 0.3 opacity
export const darkPlaceholder =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

function getMediaResourceUrl(resource: Media): string {
  let src: string = ''
  const { url } = resource
  if (url) {
    src = getMediaUrl(url)
    if (typeof src === 'string' && src.startsWith('http')) {
      try {
        const urlObj = new URL(src)
        // If the URL matches localhost, strip it down to just the relative path
        if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
          src = urlObj.pathname + urlObj.search
        }
      } catch (_err) {
        // Silently ignore invalid URLs
      }
    }
  }
  return src
}

type SelectedMediaProperties = Required<
  Pick<
    Media,
    'project' | 'credits' | 'createdAt' | 'filesize' | 'filename' | 'mimeType' | 'updatedAt'
  > & { caption: DefaultTypedEditorState | null }
>
interface MediaProperties extends SelectedMediaProperties {
  metadata: ImageMediaMetaData
}

function getMediaProperties(props: ImageMediaProps): MediaProperties {
  const { src } = props
  if (isPayloadMediaSrc(src)) {
    return { ...(src as SelectedMediaProperties), metadata: getImageMediaMetaData(src) }
  }
  return {} as MediaProperties
}

function isPayloadMediaSrc(src: string | StaticImport | Media): src is Media {
  const propSrc = src
  if (typeof propSrc === 'object' && 'updatedAt' in propSrc) {
    return true
  }
  return false
}

function isPayloadMediaProps(
  props: NextImageSourceProps | PayloadMediaSourceProps,
): props is PayloadMediaSourceProps {
  return isPayloadMediaSrc(props.src)
}

function mediaToImageMediaProps(media: Media): ImageMediaProps {
  const mediaUrl = getMediaResourceUrl(media)
  const imageProps: ImageMediaProps = {
    alt: media.alt,
    height: media.height ? media.height : undefined,
    src: mediaUrl,
    width: media.width ? media.width : undefined,
    id: media.id,
    title: media.title,
  }
  return imageProps
}

function getNextImageProps(props: NextImageSourceProps | PayloadMediaSourceProps): ImageProps {
  if (isPayloadMediaProps(props)) {
    const mediaProps = mediaToImageMediaProps(props.src)
    const nextImageProps = getNextImageProps(mediaProps)
    return nextImageProps
  } else {
    return { ...props }
  }
}

type ImageCaptionProps = { className?: string; caption?: DefaultTypedEditorState | string }
const ImageCaption = ({ caption, className }: ImageCaptionProps): React.ReactNode => {
  if (!caption) {
    return
  }

  if (typeof caption === 'string') {
    ;<div className={cn('prose', className)}>{caption}</div>
  } else {
    return (
      <div className={cn(className)}>
        <RichText data={caption} enableGutter={false} />
      </div>
    )
  }
}

type ImageMediaComponentProps = {
  captionClassName?: string
  imgClassName?: string
  className?: string
  caption?: string
}

type NextImageSourceProps = ImageMediaComponentProps &
  Omit<ImageProps, 'resource' | 'sizes' | 'placeholder' | 'blurDataURL' | 'quality'> & {
    src: ImageProps['src']
  }

type PayloadMediaSourceProps = ImageMediaComponentProps &
  Omit<
    ImageProps,
    'resource' | 'src' | 'sizes' | 'placeholder' | 'blurDataURL' | 'quality' | 'alt'
  > & {
    src: Media
  }

export type ImageMediaProps = NextImageSourceProps | PayloadMediaSourceProps

export const ImageMedia = (props: ImageMediaProps) => {
  const mediaProps = getMediaProperties(props)

  const {
    className,
    imgClassName,
    captionClassName,
    caption: propsCaption,
  } = props as ImageMediaComponentProps

  const caption = mediaProps.caption || propsCaption

  const nextImageProps = getNextImageProps(props)

  const { id, alt, src, width, height } = nextImageProps

  return (
    <div id={`${id}-wrapper`} className={cn('relative h-auto w-full', className)}>
      <Image
        id={id}
        className={cn(imgClassName)}
        alt={alt}
        src={src}
        sizes={DEFAULT_IMAGE_SIZES}
        placeholder="blur"
        width={width}
        height={height}
        blurDataURL={lightPlaceholder}
        quality={100}
        loading={'eager'}
        style={{ objectFit: 'contain' }}
      />
      <ImageCaption className={captionClassName} caption={caption}></ImageCaption>
    </div>
  )
}
