'use client'

import NextImage from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import LightGallery, { LightGalleryProps } from 'lightgallery/react'
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
import { BeforeSlideDetail, ContainerResizeDetail, InitDetail } from 'lightgallery/lg-events'
import { cssVariables } from '@/cssVariables'
import { mapImageGalleryItems } from './ImageGalleryItem'
import FileQuestionMarkPNG from '@/public/file-question-mark.png'
import { MediaFileTypeIcon } from '../MediaIcon'

const { breakpoints } = cssVariables

const ImageSizes = Object.entries(breakpoints)
  .map(([, value]) => `(max-width: ${value}px) ${value * 2}w`)
  .join(', ')

const InlineDisabledDefaultPropValues: Pick<DefaultLightGalleryProps, InlineViewGalleryPropNames> =
  {
    controls: true,
    showMaximizeIcon: false,
    thumbnail: true,
    closable: true,
    showCloseIcon: true,
    allowMediaOverlap: true,
  }
const InlineEnabledDefaultPropValues: Pick<DefaultLightGalleryProps, InlineViewGalleryPropNames> = {
  controls: true,
  showMaximizeIcon: true,
  thumbnail: true,
  closable: false,
  showCloseIcon: false,
  allowMediaOverlap: true,
}

const ThumbnailStyles = cn(
  'rounded-none',
  'bg-card',
  'border border-primary/30',
  ' overflow-hidden hover:opacity-80 transition-opacity cursor-pointer',
  'block aspect-square relative',
)

const ImageStyles = cn('relative block ', 'size-full object-cover')

const PLACEHOLDER_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTZlN2ViIi8+Cjwvc3ZnPg=='

type LightGallery = InitDetail['instance']

// Light Gallery Props that are safe to change per instance
// A.K.A Props that will not break things entirely if changed
type DefaultLightGalleryProps = Omit<
  LightGalleryProps,
  | 'licenseKey'
  | 'container'
  | 'autoplayVideoOnSlide'
  | 'autoplayFirstVideo'
  | 'gotoNextSlideOnVideoEnd'
  | 'currentPagerPosition'
  | 'alignThumbnails'
  | 'videojs'
  | 'elementClassNames'
  | 'isMobile'
  | 'onContainerResize'
  | 'onBeforeSlide'
  | 'onInit'
  | 'mode'
  | 'width'
  | 'plugins'
>

// LightGallery props that require specific settings to make the inline gallery view work
type InlineViewGalleryPropNames = keyof Pick<
  DefaultLightGalleryProps,
  'controls' | 'showMaximizeIcon' | 'thumbnail' | 'closable' | 'showCloseIcon' | 'allowMediaOverlap'
>
type InlineGalleryViewEnabledProps = Omit<DefaultLightGalleryProps, InlineViewGalleryPropNames>

// IF inline == true
// THEN
//    don't allow the LightGallery props that impact the inline view working to be changed
// IF inline == false
// THEN
//    those props can be overridden as required
type InlineableGalleryProps =
  | {
      inline: true
      lightGalleryProps?: InlineGalleryViewEnabledProps
    }
  | {
      inline?: false | undefined
      lightGalleryProps?: DefaultLightGalleryProps
    }

export type ImageGalleryProps = InlineableGalleryProps & {
  items: Media[]
  containerProps?: React.ComponentPropsWithRef<'div'>
}

export const ImageGallery = ({
  items,
  inline = true,
  lightGalleryProps = InlineEnabledDefaultPropValues,
  containerProps,
}: ImageGalleryProps): React.ReactNode => {
  const isMobile = useIsMobile()
  const lightGallery: React.RefObject<LightGallery | null> = useRef<LightGallery | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [galleryContainer, setGalleryContainer] = useState<HTMLDivElement | null>(null)

  const galleryItems = mapImageGalleryItems(items)

  useEffect(() => {
    if (containerRef.current) {
      setGalleryContainer(containerRef.current)
    }
  }, [])

  const onInit = useCallback(
    ({ instance }: InitDetail) => {
      if (instance) {
        lightGallery.current = instance
        if (inline) {
          lightGallery.current.openGallery()
        }
      }
    },
    [inline],
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
    ...InlineEnabledDefaultPropValues,
  }

  const settingsFromProps = {
    ...lightGalleryProps,
    ...InlineDisabledDefaultPropValues,
  }

  const lightGallerySettings = inline ? inlineGallerySettings : settingsFromProps

  console.log(`LightGallerySettings: INLINE=${inline} `, {
    galleryItems: galleryItems.length,
    items: galleryItems,
  })

  return (
    <div
      className={cn('relative h-auto max-h-200 w-full overflow-hidden rounded-none')}
      ref={containerRef}
      {...containerProps}
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
        container={inline ? galleryContainer : null}
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
        {galleryItems.map((item, index) => {
          if (item.type === 'video') {
            return (
              <a
                key={index}
                data-lg-size={item.size}
                className={ThumbnailStyles}
                data-video={item.src}
                data-sub-html={item.subHtml}
              >
                <NextImage
                  alt={item.alt}
                  className={ImageStyles}
                  src={item.thumb}
                  fill={true}
                  loading="lazy"
                  sizes={ImageSizes}
                  placeholder={'blur'}
                  blurDataURL={PLACEHOLDER_BLUR}
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
                className={ThumbnailStyles}
                data-src={item.src}
                data-sub-html={item.subHtml}
              >
                <NextImage
                  alt={item.alt}
                  className={ImageStyles}
                  src={item.thumb}
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
          if (item.type === 'unsupported') {
            return (
              <a
                key={item.id}
                data-lg-size={item.size}
                className={cn(ThumbnailStyles, 'text-foreground')}
                data-src={FileQuestionMarkPNG.src}
                data-sub-html={item.subHtml}
              >
                {/* <NextImage
                  alt={item.alt}
                  className={ImageStyles}
                  src={FileQuestionMarkPNG}
                  loading={'eager'}
                  width={'1280'}
                  height={720}
                  sizes={ImageSizes}
                  placeholder={'blur'}
                  blurDataURL={PLACEHOLDER_BLUR}
                  style={{ objectFit: 'cover' }}
                /> */}
                <div className="flex h-full w-full flex-col items-center justify-center opacity-40">
                  <MediaFileTypeIcon file={item}></MediaFileTypeIcon>
                </div>
              </a>
            )
          }
        })}
      </LightGallery>
    </div>
  )
}
