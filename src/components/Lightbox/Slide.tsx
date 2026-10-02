'use client'

import { Media } from '@/payload-types'
import { getMediaDisplayImageSources } from '@/utilities/getMediaDisplayImageSource'
import { getMediaSize } from '@/utilities/getMediaSize'
import { getMediaType } from '@/utilities/getMediaType'
import { getMediaInfo, MediaInfo } from '@/utilities/mediaInfo'
import NextImage from 'next/image'
import {
  ImageFit,
  ImageSource,
  isImageFitCover,
  isImageSlide,
  RenderSlideProps,
  RenderThumbnailProps,
  Slide,
  SlideImage,
  SlideVideo,
  SlideYouTube,
  useLightboxProps,
  useLightboxState,
} from 'yet-another-react-lightbox'
import { MediaTooltip } from '../MediaTooltip'
import { DEFAULT_IMAGE_SIZES } from '@/defaultImageSizes'

export const slideBlurUrl =
  'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCiAgICAgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiCiAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJibGFjayIgb3BhY2l0eT0iMC41IiAvPgo8L3N2Zz4='

declare module 'yet-another-react-lightbox' {
  interface SlideVideo {
    alt: string
    caption: MediaInfo
  }
  interface SlideImage {
    caption: MediaInfo
    imageFit?: ImageFit | undefined
    srcSet?: readonly ImageSource[] | undefined
  }
  interface SlideYouTube {
    alt: string
    type: 'youtube'
    width: number
    height: number
    src: string
    url: string
    caption: MediaInfo
  }
  interface SlideTypes {
    youtube: SlideYouTube
  }
}

function getSlidePropertiesFromMedia(media: Media): Slide | undefined {
  const { source, thumbnail } = getMediaDisplayImageSources(media)
  const { width, height } = getMediaSize(media)
  const mediaType = getMediaType(media)
  if (mediaType === 'image') {
    return {
      alt: media.alt,
      width: Number(width),
      height: Number(height),
      src: source,
      type: mediaType,
      caption: getMediaInfo(media),
    }
  } else if (mediaType === 'youtube') {
    return {
      alt: media.alt,
      width: Number(width),
      height: Number(height),
      url: `https://www.youtube-nocookie.com/embed/${media.youtubeId}?enablejsapi=1&modestbranding=1&playsinline=1`,
      type: mediaType,
      src: thumbnail,
      caption: getMediaInfo(media),
    }
  } else if (mediaType === 'video') {
    return {
      alt: media.alt,
      width: Number(width),
      height: Number(height),
      type: mediaType,
      poster: thumbnail,
      autoPlay: false,
      controls: true,
      caption: getMediaInfo(media),
      sources: [
        {
          src: source,
          type: mediaType,
        },
      ],
    }
  }
  return
}

export function mapMediaToSlides(media: Media[]): Slide[] {
  const items = media
    .sort((i, j) => Number(j.sortPriority) - Number(i.sortPriority))
    .map(getSlidePropertiesFromMedia)
    .filter((i) => !!i)
  return items
}

export function getSlidePropertiesAsSlideImage(slideProperties: Slide[]): Slide[] {
  const slides: Slide[] = slideProperties.map((s) => s as Slide).filter((i) => !!i)
  return slides
}

type LightBoxSlideProps =
  | RenderThumbnailProps
  | RenderSlideProps<SlideImage | SlideVideo | SlideYouTube>

export default function LightBoxSlide({
  slide,
  caption,
  rect,
  ..._props
}: LightBoxSlideProps & {
  caption?: MediaInfo
  slide: Slide | SlideImage | SlideVideo | SlideYouTube
}): React.ReactNode {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps()

  const { currentIndex } = useLightboxState()

  const cover: boolean = isImageSlide(slide) && isImageFitCover(slide, imageFit)

  const width: number = !cover
    ? Math.round(
        Math.min(
          rect.width,
          (rect.height / Math.max(slide.height ?? 0, 0)) * Math.max(slide.width ?? 0, 0),
        ),
      )
    : rect.width

  const height: number = !cover
    ? Math.round(
        Math.min(
          rect.height,
          (rect.width / Math.max(slide.width ?? 0, 0)) * Math.max(slide.height ?? 0, 0),
        ),
      )
    : rect.height

  const getImageSource = () => {
    let src: string | undefined
    if (slide.type === 'video') {
      src = slide.poster || slide.thumbnail
    } else if (slide.type === 'youtube') {
      src = slide.src
      console.log(`youtube slide src:`, src)
    } else {
      src = slide.src
    }
    return src || ''
  }

  const imageSource: string = getImageSource()
  const altText: string = slide.alt ?? ''

  const onClickImage = () => {
    click?.({ index: currentIndex })
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      {caption && <MediaTooltip info={caption} />}
      <NextImage
        fill
        alt={altText}
        src={imageSource}
        loading="eager"
        draggable={false}
        placeholder={'blur'}
        blurDataURL={slideBlurUrl}
        style={{
          objectFit: cover ? 'cover' : 'contain',
          cursor: click ? 'pointer' : undefined,
        }}
        sizes={DEFAULT_IMAGE_SIZES}
        onClick={onClickImage}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  )
}
