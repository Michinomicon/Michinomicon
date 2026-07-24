'use client'

import NextImage from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import LightGallery from 'lightgallery/react'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgVideo from 'lightgallery/plugins/video'
import lgZoom from 'lightgallery/plugins/video'

import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-video.css'
import 'lightgallery/css/lg-transitions.css'

import { cn } from '@/utilities/ui'
import { Media } from '@/payload-types'
import { useIsMobile } from '@/hooks/use-mobile'
import { ContainerResizeDetail, InitDetail } from 'lightgallery/lg-events'
import { GalleryItem as LightGalleryItem } from 'lightgallery/lg-utils'
import { getMediaDisplayImageSources } from '@/utilities/getMediaDisplayImageSource'
import {
  applyLayoutSettings,
  GalleryLayout,
  ImageGallerySettings,
  nextIcon,
  prevIcon,
} from './settings'
import { MediaCaption } from '../MediaCaption'
import { MediaTooltip } from '../MediaTooltip'
import { getMediaInfo, MediaInfo } from '@/utilities/mediaInfo'
import { DEFAULT_IMAGE_SIZES } from '@/defaultImageSizes'
import { getImageMediaMetaData } from '@/utilities/getMediaMetaData'

type LightGallery = InitDetail['instance']

const GalleryItemStyles = cn(
  'not-prose',
  'rounded-none',
  'bg-card',
  'border border-primary/30',
  ' overflow-hidden hover:opacity-80 transition-opacity cursor-pointer',
  'block relative',
)

const ItemThumbnailStyles = cn('relative block rounded-none size-full object-cover')

export const blurPlaceholder =
  'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCiAgICAgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiCiAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJibGFjayIgb3BhY2l0eT0iMC41IiAvPgo8L3N2Zz4='

type ItemProperties = Omit<LightGalleryItem, 'width' | 'width'> & {
  width: number | `${number}`
  height: number | `${number}`
} & {
  id: string
  alt: string
  size: string
  src: string
  type: 'image' | 'video'
  thumb: string
  caption: MediaInfo
}

function getItemType(media: Media): 'image' | 'video' {
  return typeof media.mimeType === 'string' && media.mimeType.includes('video') ? 'video' : 'image'
}

function getMediaSize(media: Media): Pick<ItemProperties, 'width' | 'height' | 'size'> {
  const { width: metaDataWidth, height: metaDataHeight } = getImageMediaMetaData(media)
  const mediaWidth: number = Math.max(Number(media.width ?? metaDataWidth), 0)
  const mediaHeight: number = Math.max(Number(media.height ?? metaDataHeight), 0)
  const width: number = mediaWidth > 0 ? mediaWidth : 1200
  const height: number = mediaHeight > 0 ? mediaHeight : 630
  return {
    width: width,
    height: height,
    size: `${width}-${height}`,
  }
}

function getItemPropertiesFromMedia(media: Media): ItemProperties | undefined {
  const { source, thumbnail } = getMediaDisplayImageSources(media)
  const { width, height, size } = getMediaSize(media)

  return {
    id: media.id,
    alt: media.alt,
    width: width,
    height: height,
    size: size,
    src: source,
    type: getItemType(media),
    thumb: thumbnail,
    caption: getMediaInfo(media),
  }
}

function mapImageGalleryItems(media: Media[]) {
  const items: ItemProperties[] = media
    .sort((i, j) => Number(j.sortPriority) - Number(i.sortPriority))
    .map(getItemPropertiesFromMedia)
    .filter((i) => !!i)

  return items
}

export type ImageGalleryProps = {
  layout: GalleryLayout | undefined
  items: Media[]
  thumbnailTooltip?: boolean
  hideCaption?: boolean
  galleryItemClassNames?: string
  thumbnailClassNames?: string
  galleryClassNames?: string
  containerClassNames?: string
  settings?: ImageGallerySettings
}

export const ImageGallery = ({
  layout = 'inline',
  items,
  thumbnailTooltip = true,
  hideCaption = false,
  galleryClassNames: galleryClassNamesFromProps,
  settings: settingsFromProps,
  galleryItemClassNames: galleryItemClassNamesFromProps,
  thumbnailClassNames: thumbnailClassNamesFromProps,
  containerClassNames: containerClassNamesFromProps,
}: ImageGalleryProps): React.ReactNode => {
  const isMobile = useIsMobile()
  const lightGallery: React.RefObject<LightGallery | null> = useRef<LightGallery | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [galleryContainer, setGalleryContainer] = useState<HTMLDivElement | null>(null)

  const instanceSettings: ImageGallerySettings = applyLayoutSettings(layout, settingsFromProps)
  const galleryItems = mapImageGalleryItems(items)

  const lightGalleryClassNames = cn('overflow-hidden rounded-none', galleryClassNamesFromProps)
  const showThumbnailTooltip = layout === 'inline' ? false : thumbnailTooltip
  const showCaption = !hideCaption && layout !== 'card'

  useEffect(() => {
    if (containerRef.current) {
      setGalleryContainer(containerRef.current)
    }
  }, [])

  const onInit = useCallback(
    ({ instance }: InitDetail) => {
      if (instance) {
        lightGallery.current = instance
        if (layout === 'inline' || layout === 'card') {
          lightGallery.current.openGallery()
        }
      }
    },
    [layout],
  )

  const handleContainerResize = (_detail: ContainerResizeDetail) => {
    // console.debug(`LightGallery container resized: `, detail)
  }

  const getIsMobile = () => {
    return isMobile
  }

  return (
    <div
      className={cn(
        'mlg-gallery-container relative w-full overflow-hidden rounded-none',
        containerClassNamesFromProps,
        layout === 'inline' ? 'max-h-[80vh]' : '',
      )}
      ref={containerRef}
    >
      <LightGallery
        container={layout === 'inline' || layout === 'card' ? galleryContainer : null}
        elementClassNames={cn(lightGalleryClassNames)}
        width={'100%'}
        plugins={[lgThumbnail, lgZoom, lgVideo]}
        mode={'lg-lollipop'}
        addClass={cn('mlg-gallery', `mlg-${layout}`)}
        prevHtml={prevIcon}
        nextHtml={nextIcon}
        videojs={false}
        onContainerResize={handleContainerResize}
        onInit={onInit}
        isMobile={getIsMobile}
        {...instanceSettings}
      >
        {galleryItems.map((item, index) => {
          if (item.type === 'video') {
            return (
              <a
                key={index}
                data-lg-size={item.size}
                className={cn(GalleryItemStyles, galleryItemClassNamesFromProps)}
                data-video={item.src}
                data-sub-html={`#caption-${item.id}`}
              >
                {showThumbnailTooltip && <MediaTooltip info={item.caption} />}
                <NextImage
                  alt={item.alt}
                  className={cn(ItemThumbnailStyles, thumbnailClassNamesFromProps)}
                  src={item.thumb}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  sizes={DEFAULT_IMAGE_SIZES}
                  placeholder={'blur'}
                  blurDataURL={blurPlaceholder}
                  style={{
                    objectFit: 'cover',
                    objectPosition: '50% 50%',
                  }}
                />
              </a>
            )
          }
          if (item.type === 'image') {
            return (
              <a
                key={item.id}
                data-lg-size={item.size}
                className={cn(GalleryItemStyles, galleryItemClassNamesFromProps)}
                data-src={item.src}
                data-sub-html={`#caption-${item.id}`}
              >
                {showThumbnailTooltip && <MediaTooltip info={item.caption} />}
                <NextImage
                  alt={item.alt}
                  className={cn(ItemThumbnailStyles, thumbnailClassNamesFromProps)}
                  src={item.src}
                  loading={'eager'}
                  width={item.width}
                  height={item.height}
                  sizes={DEFAULT_IMAGE_SIZES}
                  placeholder={'blur'}
                  blurDataURL={blurPlaceholder}
                  style={{ objectFit: 'cover', objectPosition: '50% 50%' }}
                />
              </a>
            )
          }
        })}
      </LightGallery>

      {showCaption &&
        galleryItems.map((item, index) => (
          <MediaCaption
            key={index}
            id={`caption-${item.id}`}
            className="lg-caption hidden"
            info={item.caption}
          />
        ))}
    </div>
  )
}
