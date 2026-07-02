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

const LightGalleryItemStyles = cn(
  'rounded-none',
  'bg-card',
  'border border-primary/30',
  ' overflow-hidden hover:opacity-80 transition-opacity cursor-pointer',
  'block relative',
)

const ThumbnailStyles = cn('relative block rounded-none', 'size-full object-cover')

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
  thumbnailTooltip?: boolean
  itemStyles?: string
  thumbnailStyles?: string
  containerProps?: React.ComponentPropsWithRef<'div'>
}

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

export const ImageGallery = ({
  items,
  inline = true,
  thumbnailTooltip = true,
  lightGalleryProps = InlineEnabledDefaultPropValues,
  itemStyles,
  thumbnailStyles,
  containerProps,
}: ImageGalleryProps): React.ReactNode => {
  const isMobile = useIsMobile()
  const lightGallery: React.RefObject<LightGallery | null> = useRef<LightGallery | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [galleryContainer, setGalleryContainer] = useState<HTMLDivElement | null>(null)
  const showThumbnailTooltip = inline ? false : thumbnailTooltip

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

  return (
    <div>
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
          counter={galleryItems.length > 1}
          loop={true}
          escKey={true}
          zoom={true}
          mousewheel={true}
          download={false}
          animateThumb={false}
          backdropDuration={100}
          hideScrollbar={true}
          preload={3}
          startAnimationDuration={100}
          speed={300}
          zoomFromOrigin={false}
          loadYouTubeThumbnail={true}
          youTubePlayerParams={{
            modestbranding: 1,
            showinfo: 0,
            controls: 0,
          }}
          // ----------------------------
          // Don't Change
          appendSubHtmlTo={'.lg-sub-html'}
          subHtmlSelectorRelative={false}
          addClass={'mlg-gallery group'}
          container={inline ? galleryContainer : null}
          autoplayVideoOnSlide={false}
          autoplayFirstVideo={false}
          gotoNextSlideOnVideoEnd={false}
          currentPagerPosition={'middle'}
          alignThumbnails={'middle'}
          videojs={false}
          elementClassNames={cn('overflow-hidden rounded-none')}
          isMobile={getIsMobile}
          onContainerResize={handleContainerResize}
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
                  className={cn(LightGalleryItemStyles, itemStyles)}
                  data-video={item.src}
                  data-sub-html={`#caption-${item.id}`}
                >
                  {showThumbnailTooltip && <ImageThumbnailTooltip item={item} />}
                  <NextImage
                    alt={item.alt}
                    className={cn(ThumbnailStyles, thumbnailStyles)}
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
                  className={cn(LightGalleryItemStyles, itemStyles)}
                  data-src={item.src}
                  data-sub-html={`#caption-${item.id}`}
                >
                  {showThumbnailTooltip && <ImageThumbnailTooltip item={item} />}
                  <NextImage
                    alt={item.alt}
                    className={cn(ThumbnailStyles, thumbnailStyles)}
                    src={item.thumb}
                    loading={'eager'}
                    width={item.width ?? 1280}
                    height={item.height ?? 720}
                    sizes={ImageSizes}
                    placeholder={'empty'}
                    blurDataURL={PLACEHOLDER_BLUR}
                    style={{ objectFit: 'cover' }}
                  />
                </a>
              )
            }
          })}
        </LightGallery>
      </div>
      {galleryItems.map((item, index) => (
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
