'use client'

import React, { useCallback, useEffect, useRef } from 'react'
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
import NextImage from 'next/image'
import { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { useIsMobile } from '@/hooks/use-mobile'
import { InitDetail } from 'lightgallery/lg-events'
import { getImageMediaMetaData, getVideoMediaMetaData } from '@/utilities/getMediaMetaData'
import { cssVariables } from '@/cssVariables'

const { breakpoints } = cssVariables

const ImageSizes = Object.entries(breakpoints)
  .map(([, value]) => `(max-width: ${value}px) ${value * 2}w`)
  .join(', ')

interface Props {
  items: Media[]
  className?: string
}

export type BaseGalleryItem = {
  id: string
  alt: string
  size: string
  src: string
  type: 'image' | 'video'
  thumb: string
  subHtml: string
}
export interface ImageGalleryItem extends BaseGalleryItem {
  type: 'image'
}
export interface VideoGalleryItem extends BaseGalleryItem {
  type: 'video'
}
export type GalleryItem = ImageGalleryItem | VideoGalleryItem

const ThumbnailStyles = cn(
  'rounded-none',
  'bg-card',
  'border border-primary/30',
  'block aspect-square relative overflow-hidden hover:opacity-80 transition-opacity cursor-pointer',
)

const ImageStyles = cn('relative block h-full w-full')

const LightGalleryGridStyles = cn(
  'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 rounded-none',
)

const DUMMY_POSTER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const getSafeMediaUrl = (fileOrThumbnailUrl: string | null | undefined): string => {
  let src = getMediaUrl(fileOrThumbnailUrl)

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
  return src
}

const imageMediaItemToGalleryItem = (item: Media): ImageGalleryItem => {
  const metaData = getImageMediaMetaData(item)
  return {
    id: item.id,
    alt: item.alt ?? '',
    size: item.width && item.height ? `${item.width}-${item.height}` : '1280-720',
    src: getSafeMediaUrl(item.url),
    type: 'image',
    thumb: item.thumbnailURL || item.sizes?.thumbnail?.url || DUMMY_POSTER,
    subHtml: `<div class="lightGallery-captions">
                <h4>${metaData.title}</h4>
                <p>${metaData.createdAt}</p>
            </div>`,
  }
}

const videoMediaItemToGalleryItem = (item: Media): VideoGalleryItem => {
  const metaData = getVideoMediaMetaData(item)
  const posterSrc = item.thumbnailURL || item.sizes?.thumbnail?.url || DUMMY_POSTER
  const videoSrc = {
    html5: true,
    source: [{ src: item.url, type: item.mimeType }],
    attributes: {
      preload: 'none',
      controls: true,
      poster: posterSrc || undefined,
    },
  }
  return {
    id: item.id,
    alt: item.alt ?? '',
    size: item.width && item.height ? `${item.width}-${item.height}` : '1280-720',
    src: JSON.stringify(videoSrc),

    type: 'video',
    thumb: posterSrc,
    subHtml: `<div class="lightGallery-captions">
                <h4>${metaData.title}</h4>
                <p>${metaData.createdAt}</p>
            </div>`,
  }
}

const mapMediaItemsToLightGalleryItems = (item: Media, index: number, _array: Media[]) => {
  if (item.mimeType?.includes('video')) {
    const videoItem = videoMediaItemToGalleryItem(item)
    return (
      <a
        key={index}
        data-lg-size={videoItem.size}
        className={ThumbnailStyles}
        data-video={videoItem.src}
      >
        <NextImage
          alt={videoItem.alt}
          className={ImageStyles}
          src={videoItem.thumb}
          fill={true}
          style={{
            objectFit: 'cover',
            objectPosition: '50% 50%',
          }}
          loading="lazy"
          sizes={ImageSizes}
        />
      </a>
    )
  } else {
    const imageItem = imageMediaItemToGalleryItem(item)
    return (
      <a
        key={index}
        data-lg-size={imageItem.size}
        className={ThumbnailStyles}
        data-src={imageItem.src}
      >
        <NextImage
          alt={imageItem.alt}
          className={ImageStyles}
          src={imageItem.thumb}
          loading="lazy"
          width={item.width ?? 1280}
          height={item.height ?? 720}
          sizes={ImageSizes}
        />
      </a>
    )
  }
}

export const LightGalleryComponent: React.FC<Props> = ({ items, className }: Props) => {
  const isMobile = useIsMobile()
  const lightGallery = useRef<InitDetail['instance']>(null)

  useEffect(() => {
    if (lightGallery.current) {
      lightGallery.current.refresh()
    }
  }, [items])

  const onInit = useCallback(({ instance }: InitDetail) => {
    if (instance) {
      lightGallery.current = instance
    }
  }, [])

  return (
    <div className={cn('w-full rounded-none', className)}>
      <LightGallery
        onInit={onInit}
        mode={'lg-lollipop'}
        width={'100%'}
        plugins={[lgThumbnail, lgZoom, lgVideo]}
        animateThumb={true}
        allowMediaOverlap={true}
        currentPagerPosition={'middle'}
        alignThumbnails={'middle'}
        loop={true}
        escKey={true}
        controls={true}
        isMobile={() => isMobile}
        showMaximizeIcon={false}
        elementClassNames={LightGalleryGridStyles}
        autoplayVideoOnSlide={false}
        autoplayFirstVideo={false}
        gotoNextSlideOnVideoEnd={false}
        videojs={false}
        thumbnail={true}
        zoom={true}
      >
        {items
          .sort((i, j) => Number(j.sortPriority) - Number(i.sortPriority))
          .map(mapMediaItemsToLightGalleryItems)}
      </LightGallery>
    </div>
  )
}
