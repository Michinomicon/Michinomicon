'use client'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
// import { getMediaUrl } from '@/utilities/getMediaUrl'
import { Media } from '@/payload-types'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { getImageMediaMetaData, ImageMediaMetaData } from '@/utilities/getMediaMetaData'
import { ImageProps, StaticImport } from 'next/dist/shared/lib/get-img-props'
import RichText from '@/components/RichText'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import React from 'react'

import { DEFAULT_IMAGE_SIZES } from '@/defaultImageSizes'
import { MediaTooltip } from '@/components/MediaTooltip'
import { getMediaInfo } from '@/utilities/mediaInfo'
import { getMediaDisplayImageSources } from '@/utilities/getMediaDisplayImageSource'
import { getMediaSize } from '@/utilities/getMediaSize'
import { getMediaType } from '@/utilities/getMediaType'

export const blurPlaceholder =
  'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCiAgICAgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiCiAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJibGFjayIgb3BhY2l0eT0iMC41IiAvPgo8L3N2Zz4='

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
  const mediaType = getMediaType(media)
  const { thumbnail, source } = getMediaDisplayImageSources(media)
  const { width, height } = getMediaSize(media)
  const imageProps: ImageMediaProps = {
    id: media.id,
    alt: media.alt,
    width: width,
    height: height,
    src: mediaType === 'image' ? source : thumbnail,
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
    return <div className={cn('prose', className)}>{caption}</div>
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
  captionPosition?: 'tooltip' | 'below'
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
  const isPayloadMedia = isPayloadMediaProps(props)
  const mediaProps = getMediaProperties(props)

  const [tooltipOpen, setTooltipOpen] = React.useState<boolean>(false)

  const {
    className,
    imgClassName,
    captionClassName,
    caption: propsCaption,
    captionPosition = 'tooltip',
  } = props as ImageMediaComponentProps

  const caption = mediaProps.caption || propsCaption

  const nextImageProps = getNextImageProps(props)

  const { id, alt, src, width, height } = nextImageProps

  const onTooltipOpenChange = (isOpen: boolean) => {
    setTooltipOpen(isOpen)
  }

  // const imageSrc = isPayloadMedia ? getMediaResourceUrl(props.src) : src

  return (
    <div id={`${id}-wrapper`} className={cn('relative h-auto w-full', className)}>
      {captionPosition === 'tooltip' &&
        (isPayloadMedia ? (
          <MediaTooltip info={getMediaInfo(props.src)} />
        ) : (
          <Tooltip onOpenChange={onTooltipOpenChange} delayDuration={900}>
            <TooltipTrigger asChild className="group">
              <Badge
                variant={tooltipOpen === true ? 'default' : 'outline'}
                className="absolute top-1 right-1"
              >
                <Info data-icon="inline-start" />
                Info
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <ImageCaption className={captionClassName} caption={caption}></ImageCaption>
            </TooltipContent>
          </Tooltip>
        ))}
      <NextImage
        id={id}
        className={cn('rounded-none', imgClassName)}
        alt={alt}
        src={src}
        sizes={DEFAULT_IMAGE_SIZES}
        placeholder="blur"
        width={width}
        height={height}
        blurDataURL={blurPlaceholder}
        quality={100}
        loading={'lazy'}
        style={{ objectFit: 'contain' }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
      {captionPosition === 'below' && (
        <ImageCaption className={captionClassName} caption={caption}></ImageCaption>
      )}
    </div>
  )
}
