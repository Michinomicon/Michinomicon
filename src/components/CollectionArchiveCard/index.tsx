'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { useRef } from 'react'
import type { Media } from '@/payload-types'
import { TypedCollection } from 'payload'
import { Badge, BadgeStatus } from '../ui/badge'
import { ImageGallery } from '../ImageGallery'
import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from '../ui/item'
import { isMedia } from '@/utilities/isMedia'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../ui/carousel'
import { AspectRatio } from '../ui/aspect-ratio'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '../RichText'

export type SupportedConfigs = Pick<TypedCollection, 'creators' | 'posts' | 'projects'>
export type SupportedSlug = keyof SupportedConfigs
export type SupportedCollection = SupportedConfigs[keyof SupportedConfigs]

export type CollectionCardPropsItemProperties = {
  title?: string
  alignItems?: 'center'
  className?: string
  showStatus?: boolean
  showTags?: boolean
  showImage?: boolean
  layout?: 'vertical' | 'horizontal'
  item: CollectionCardItemProperties<keyof SupportedConfigs>
}

export type CollectionCardProps = React.ComponentPropsWithRef<typeof Item> &
  CollectionCardPropsItemProperties

type BaseCollectionCardItemProperties<T extends keyof SupportedConfigs = keyof SupportedConfigs> = {
  collection: T
  status: BadgeStatus | null
  tags: string[] | null
  images: Media[] | null
  description: string | DefaultTypedEditorState | null | undefined
  title: string
  href: string
}
export type CollectionCardItemProperties<T extends keyof SupportedConfigs> =
  BaseCollectionCardItemProperties<T>

export function CollectionArchiveCard({
  className,
  showTags = true,
  layout = 'vertical',
  title: titleFromProps,
  item: itemFromProps,
  ...props
}: CollectionCardProps): React.ReactNode {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const cardCurrentRef = useRef<HTMLDivElement>(card.ref.current)
  const linkCurrentRef = useRef(link.ref.current)

  const { tags, images, description, title, href } = itemFromProps

  const titleToUse = titleFromProps || title

  const useHorizontal = layout === 'horizontal'

  const hasImages = Array.isArray(images) && images.length > 0

  if (!useHorizontal) {
    return (
      <Item ref={cardCurrentRef} className={cn('p-0', '')} variant="outline" {...props}>
        <ItemHeader className={''}>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className={'h-full w-full max-w-48 sm:max-w-xs md:max-w-sm'}
          >
            <CarouselContent className="">
              {images &&
                images.map((image, index) => (
                  <CarouselItem key={index} className="basis-1/2 lg:basis-1/3">
                    {isMedia(image) && (
                      <ImageGallery thumbnailTooltip={false} items={[image]} inline={false} />
                    )}
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </ItemHeader>
        <ItemContent className={cn('px-2')}>
          <ItemTitle>
            <Link className="not-prose" href={href} ref={linkCurrentRef}>
              {titleToUse}
            </Link>
          </ItemTitle>
          <ItemDescription>
            {description && <span className="prose">description</span>}
          </ItemDescription>
        </ItemContent>
        <ItemFooter className={cn('flex flex-col items-start justify-center rounded-none p-0')}>
          {showTags && tags && (
            <div className="flex flex-row gap-x-1 border-t px-2 py-1 text-sm uppercase">
              {tags.map((tag, index) => {
                return (
                  <Badge key={index} variant={'default'}>
                    <span className="font-bold">{tag}</span>
                  </Badge>
                )
              })}
            </div>
          )}
        </ItemFooter>
      </Item>
    )
  } else {
    return (
      <Item
        ref={cardCurrentRef}
        className={cn('gap-0 bg-card p-0', className)}
        variant="outline"
        {...props}
      >
        <div className={cn('flex h-50 grow flex-row flex-nowrap items-start overflow-hidden')}>
          {/* left side of card  */}
          <div
            className={cn(
              'flex h-full w-full grow flex-col items-start justify-start rounded-none select-none',
            )}
          >
            <div className={'w-full grow-0 p-2'}>
              <Link className="" href={href} ref={linkCurrentRef}>
                <span className={'text-2xl'}>{titleToUse}</span>
              </Link>
            </div>
            <div className={'h-full w-full grow overflow-hidden rounded-none p-2'}>
              {description && typeof description === 'object' ? (
                <RichText
                  className={'w-full overflow-scroll'}
                  data={description}
                  enableGutter={false}
                />
              ) : (
                <span className="prose">{description}</span>
              )}
            </div>
          </div>

          {/* right side of card */}

          {hasImages && (
            <div
              className={cn(
                'flex h-auto shrink grow-0 flex-col items-center justify-center rounded-tl-none rounded-bl-none border-l border-l-border',
              )}
            >
              <div className={cn('h-50 w-50')}>
                <AspectRatio ratio={1 / 1} className={cn('w-full')}>
                  <ImageGallery
                    layout={'card-gallery'}
                    containerProps={{ className: 'h-full' }}
                    galleryStyles={'h-full'}
                    thumbnailTooltip={false}
                    items={images}
                    inline={true}
                  />
                </AspectRatio>
              </div>
            </div>
          )}
        </div>

        {showTags && tags && (
          <ItemFooter className={cn('flex flex-col items-start justify-center rounded-none p-0')}>
            <div className="flex flex-row gap-x-1 border-t px-2 py-1 text-sm uppercase">
              {tags.map((tag, index) => {
                return (
                  <Badge key={index} variant={'default'}>
                    <span className="font-bold">{tag}</span>
                  </Badge>
                )
              })}
            </div>
          </ItemFooter>
        )}
      </Item>
    )
  }
}
