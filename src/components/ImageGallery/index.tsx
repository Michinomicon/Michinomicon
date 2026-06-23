'use client'

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
import NextImage from 'next/image'
import { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { useIsMobile } from '@/hooks/use-mobile'
import { BeforeSlideDetail, ContainerResizeDetail, InitDetail } from 'lightgallery/lg-events'
import { getImageMediaMetaData, getVideoMediaMetaData } from '@/utilities/getMediaMetaData'
import { cssVariables } from '@/cssVariables'
import { GalleryItem as LightGalleryItem } from 'lightgallery/lg-utils'

const { breakpoints } = cssVariables

const ImageSizes = Object.entries(breakpoints)
  .map(([, value]) => `(max-width: ${value}px) ${value * 2}w`)
  .join(', ')

export interface BaseGalleryItem extends LightGalleryItem {
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
  ' overflow-hidden hover:opacity-80 transition-opacity cursor-pointer',
  'block aspect-square relative',
)

const ImageStyles = cn('relative block ', 'size-full object-cover')

const DUMMY_POSTER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const PLACEHOLDER_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTZlN2ViIi8+Cjwvc3ZnPg=='

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
    alt: item.alt,
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

const mapMediaItemsToLightGalleryItems = (
  item: Media,
  index: number,
  _array: Media[],
): React.ReactNode => {
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
          placeholder={'blur'}
          blurDataURL={PLACEHOLDER_BLUR}
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
          loading={'eager'}
          width={item.width ?? 1280}
          height={item.height ?? 720}
          sizes={ImageSizes}
          placeholder={'blur'}
          blurDataURL={PLACEHOLDER_BLUR}
          style={{ objectFit: 'cover' }}
        />
      </a>
    )
  }
}

type LightGallery = InitDetail['instance']

interface Props {
  items: Media[]
  className?: string
  controls?: boolean | undefined
  showMaximizeIcon?: boolean | undefined
  thumbnail?: boolean | undefined
  inlineGallery?: boolean | undefined
  closable?: boolean | undefined
  showCloseIcon?: boolean | undefined
  allowMediaOverlap?: boolean | undefined
}

export const ImageGallery = ({
  items,
  className,
  inlineGallery = true,
  controls = true,
  showMaximizeIcon = true,
  thumbnail = true,
  closable = true,
  showCloseIcon = true,
  allowMediaOverlap = true,
}: Props): React.ReactNode => {
  const isMobile = useIsMobile()
  const lightGallery: React.RefObject<LightGallery | null> = useRef<LightGallery | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [galleryContainer, setGalleryContainer] = useState<HTMLDivElement | null>(null)

  const galleryItems: React.ReactNode[] = items
    .sort((i, j) => Number(j.sortPriority) - Number(i.sortPriority))
    .map(mapMediaItemsToLightGalleryItems)

  useEffect(() => {
    if (containerRef.current) {
      setGalleryContainer(containerRef.current)
    }
  }, [])

  const onInit = useCallback(
    ({ instance }: InitDetail) => {
      if (instance) {
        lightGallery.current = instance
        if (inlineGallery) {
          lightGallery.current.openGallery()
        }
      }
    },
    [inlineGallery],
  )

  const handleContainerResize = (_detail: ContainerResizeDetail) => {
    // console.debug(`LightGallery container resized: `, detail)
  }

  const handleBeforeSlide = (_detail: BeforeSlideDetail) => {
    // console.debug(`LightGallery beforeSlide ${_detail.prevIndex} --> ${_detail.index}`)
  }

  const getIsMobile = () => {
    return isMobile
  }

  // Settings required to make it work well inline
  const inlineGallerySettings = {
    container: galleryContainer,
    controls: true,
    showMaximizeIcon: true,
    thumbnail: true,
    closable: false,
    showCloseIcon: false,
    allowMediaOverlap: true,
  }

  const settingsFromProps = {
    controls: controls,
    showMaximizeIcon: showMaximizeIcon,
    thumbnail: thumbnail,
    closable: closable,
    showCloseIcon: showCloseIcon,
    allowMediaOverlap: allowMediaOverlap,
  }

  const lightGallerySettings = inlineGallery ? inlineGallerySettings : settingsFromProps

  return (
    <div
      className={cn('relative h-auto max-h-200 w-full overflow-hidden rounded-none', className)}
      ref={containerRef}
    >
      <LightGallery
        // ----------------------------
        // Safe to Change
        closable={lightGallerySettings.closable}
        showCloseIcon={lightGallerySettings.showCloseIcon}
        thumbnail={lightGallerySettings.thumbnail}
        controls={lightGallerySettings.controls}
        showMaximizeIcon={lightGallerySettings.showMaximizeIcon}
        allowMediaOverlap={lightGallerySettings.allowMediaOverlap}
        loop={true}
        escKey={true}
        zoom={true}
        mousewheel={true}
        download={false}
        animateThumb={true}
        // ----------------------------
        // Don't Change
        container={inlineGallery ? galleryContainer : null}
        autoplayVideoOnSlide={false}
        autoplayFirstVideo={false}
        gotoNextSlideOnVideoEnd={false}
        currentPagerPosition={'middle'}
        alignThumbnails={'middle'}
        videojs={false}
        elementClassNames={cn('overflow-hidden')}
        isMobile={getIsMobile}
        onContainerResize={handleContainerResize}
        onBeforeSlide={handleBeforeSlide}
        onInit={onInit}
        mode={'lg-lollipop'}
        width={'100%'}
        plugins={[lgThumbnail, lgZoom, lgVideo]}
      >
        {galleryItems}
      </LightGallery>
    </div>
  )
}
