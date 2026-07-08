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
import { cssVariables } from '@/cssVariables'
import { GalleryItem as LightGalleryItem } from 'lightgallery/lg-utils'
import { groupCreditsByCreator } from '@/utilities/groupCreditsByCreator'
import { getMediaDisplayImageSources } from '@/utilities/getMediaDisplayImageSource'
import { isMedia } from '@/utilities/isMedia'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MediaAvatar } from '../MediaAvatar'
import {
  applyLayoutSettings,
  GalleryLayout,
  ImageGallerySettings,
  nextIcon,
  prevIcon,
} from './settings'

type LightGallery = InitDetail['instance']

const { breakpoints } = cssVariables

const ImageSizes = Object.entries(breakpoints)
  .map(([, value]) => `(max-width: ${value}px) ${value * 2}w`)
  .join(', ')

const GalleryItemStyles = cn(
  'not-prose',
  'rounded-none',
  'bg-card',
  'border border-primary/30',
  ' overflow-hidden hover:opacity-80 transition-opacity cursor-pointer',
  'block relative',
)

const ItemThumbnailStyles = cn('relative block rounded-none size-full object-cover')

const PLACEHOLDER_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTZlN2ViIi8+Cjwvc3ZnPg=='

export type ItemProjectDetails = {
  href: string
  slug: string
  title: string
  status: 'planned' | 'active' | 'completed' | 'archived'
  profileImage: Media | null
  categories: { title: string; slug: string }[] | undefined
  startDate: string | null
  endDate: string | null
}

export type ItemCredit = {
  href: string
  title: string
  roles: string[]
  image: Media | null
}
export type ItemCaption = {
  title: string
  credits?: ItemCredit[]
  project?: ItemProjectDetails
}

export type ItemProperties = Omit<LightGalleryItem, 'width' | 'width'> & {
  width?: number | `${number}` | undefined
  height?: number | `${number}` | undefined
} & {
  id: string
  alt: string
  size: string
  src: string
  type: 'image' | 'video'
  thumb: string
  subHtml: string
  caption: ItemCaption
}

function getItemSubHtml(item: Media): string {
  const credits = groupCreditsByCreator(item.credits)
  const captionCredits = credits.map(({ creator, roles }) => {
    return `<h3><a href='/creators/${creator.slug}'><b>${creator.title}</b></a> - ${roles.join(', ')}</h3>`
  })
  return `<div class="lightGallery-captions prose w-full text-center mx-auto">
        <h3>Title - ${item.title}</h3>
    ${captionCredits}
    </div>`
}

function getItemProjectDetails(item: Media): ItemProjectDetails | undefined {
  const { project } = item
  if (project && typeof project === 'object') {
    const { slug, title, profileImage, categories, status, startDate, endDate } = project
    return {
      slug,
      title,
      status,
      profileImage: isMedia(profileImage) ? profileImage : null,
      categories: categories
        ?.filter((cat) => typeof cat === 'object')
        .map(({ title, slug }) => ({ title, slug })),
      startDate: startDate ? formatDateTime(startDate) : null,
      endDate: endDate ? formatDateTime(endDate) : null,
      href: `/projects/${slug}`,
    }
  }
}

function getItemCaptionCredits(item: Media): ItemCredit[] | undefined {
  if (item.credits) {
    return groupCreditsByCreator(item.credits).map(({ creator, roles }) => ({
      href: `/creators/${creator.slug}`,
      title: creator.title,
      roles: roles,
      image: isMedia(creator.profileImage) ? creator.profileImage : null,
    }))
  }
}

function getItemCaption(item: Media): ItemCaption {
  return {
    title: item.title,
    credits: getItemCaptionCredits(item),
    project: getItemProjectDetails(item),
  }
}

function getItemType(item: Media): 'image' | 'video' {
  return typeof item.mimeType === 'string' && item.mimeType.includes('video') ? 'video' : 'image'
}

function getItemSize(item: Media): string {
  return item.width && item.height ? `${item.width}-${item.height}` : '1280-720'
}

function getItemProperties(media: Media): ItemProperties | undefined {
  const { source, thumbnail } = getMediaDisplayImageSources(media)
  return {
    id: media.id,
    alt: media.alt,
    size: getItemSize(media),
    src: source,
    type: getItemType(media),
    thumb: thumbnail,
    subHtml: getItemSubHtml(media),
    caption: getItemCaption(media),
  }
}

export function mapImageGalleryItems(media: Media[]) {
  const items: ItemProperties[] = media
    .sort((i, j) => Number(j.sortPriority) - Number(i.sortPriority))
    .map(getItemProperties)
    .filter((i) => !!i)

  return items
}

export type ImageGalleryProps = {
  layout: GalleryLayout | undefined
  items: Media[]
  thumbnailTooltip?: boolean
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
        if (layout === 'inline' || layout === 'card') {
          lightGallery.current.openGallery()
        }
        console.debug(`lightGallery.current.settings:`, lightGallery.current.settings)
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

  const instanceSettings: ImageGallerySettings = applyLayoutSettings(layout, settingsFromProps)

  console.debug(`[${layout}] LightGallery:`, {
    settingsFromProps: settingsFromProps ?? 'NONE',
    containerClassNamesFromProps: containerClassNamesFromProps ?? 'NONE',
    settingsWithLayout: instanceSettings,
  })

  const lightGalleryClassNames = cn('overflow-hidden rounded-none', galleryClassNamesFromProps)
  const showThumbnailTooltip = layout === 'inline' ? false : thumbnailTooltip
  const showCaptions: boolean = false

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
                {showThumbnailTooltip && <ImageThumbnailTooltip item={item} />}
                <NextImage
                  alt={item.alt}
                  className={cn(ItemThumbnailStyles, thumbnailClassNamesFromProps)}
                  src={item.thumb}
                  width={item.width ?? 1280}
                  height={item.height ?? 720}
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
                className={cn(GalleryItemStyles, galleryItemClassNamesFromProps)}
                data-src={item.src}
                data-sub-html={`#caption-${item.id}`}
              >
                {showThumbnailTooltip && <ImageThumbnailTooltip item={item} />}
                <NextImage
                  alt={item.alt}
                  className={cn(ItemThumbnailStyles, thumbnailClassNamesFromProps)}
                  src={item.thumb}
                  loading={'eager'}
                  width={item.width ?? 1280}
                  height={item.height ?? 720}
                  sizes={ImageSizes}
                  placeholder={'empty'}
                  blurDataURL={PLACEHOLDER_BLUR}
                  style={{ objectFit: 'cover', objectPosition: '50% 50%' }}
                />
              </a>
            )
          }
        })}
      </LightGallery>

      {showCaptions &&
        galleryItems.map((item, index) => (
          <GalleryItemCaption
            key={index}
            id={`caption-${item.id}`}
            className="lg-caption hidden"
            item={item}
          />
        ))}
    </div>
  )
}

function CreditBadge({
  href,
  title,
  image,
}: React.ComponentPropsWithoutRef<typeof Badge> & {
  href: string
  title: string
  image: Media | null
}) {
  const [mouseOver, setMouseOver] = React.useState<boolean>(false)
  const onMouseEnter = (_event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    setMouseOver(true)
  }
  const onMouseLeave = (_event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    setMouseOver(false)
  }
  return (
    <Badge
      asChild
      variant={mouseOver ? 'outline' : 'link'}
      className={cn('pr-1 pl-0.5')}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <a href={href}>
        <MediaAvatar media={image} className="mr-1" size="sm" title={title} />
        <span className="">{title}</span>
      </a>
    </Badge>
  )
}

function GalleryItemCaption({
  item,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { item: ItemProperties }): React.ReactNode {
  const { title, credits, project } = item.caption
  return (
    <div className={cn(className)} {...props}>
      <div className="mx-auto flex w-auto flex-col items-center justify-center">
        <div className="text-center text-xl whitespace-nowrap lg-open:text-2xl">
          <span className="">
            {title}
            {project && (
              <span>
                {' - '}
                <a href={project.href} className="">
                  <b>{project.title}</b>
                </a>
              </span>
            )}
          </span>
        </div>

        {credits &&
          credits.map(({ href, title, image, roles }, index) => (
            <div key={index} className="flex flex-row flex-nowrap lg-open:text-xl">
              <div className={cn('flex flex-row flex-nowrap items-center gap-x-1')}>
                {roles.map((role, index) => {
                  const isLast = index === roles.length - 1
                  return (
                    <span key={index} className={cn('mr-1 text-right text-lg')}>
                      {role}
                      {roles.length > 1 && !isLast ? ',' : ''}
                    </span>
                  )
                })}
              </div>
              <CreditBadge {...{ href, title, image }} className={'lg-open:text-xl'} />
            </div>
          ))}
      </div>
    </div>
  )
}

function ImageThumbnailTooltip({
  item,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'> & { item: ItemProperties }): React.ReactNode {
  const [tooltipOpen, setTooltipOpen] = React.useState<boolean>(false)
  const onTooltipOpenChange = (isOpen: boolean) => {
    setTooltipOpen(isOpen)
  }
  return (
    <Tooltip onOpenChange={onTooltipOpenChange} delayDuration={600}>
      <TooltipTrigger asChild className={cn(className)} {...props}>
        <Badge
          variant={'caption'}
          className={cn(
            'absolute top-1 right-1 z-10 h-6 transition-transform delay-10 duration-590',
            tooltipOpen === true ? '' : 'opacity-50',
          )}
        >
          <Info className="inline-start" />
          <span className={cn(tooltipOpen === true ? '' : 'hidden')}>Details</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <GalleryItemCaption id={item.id} className="lg-caption-tooltip" item={item} />
      </TooltipContent>
    </Tooltip>
  )
}
