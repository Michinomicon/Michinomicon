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

export type SupportedConfigs = Pick<TypedCollection, 'creators' | 'posts' | 'projects'>
export type SupportedSlug = keyof SupportedConfigs
export type SupportedCollection = SupportedConfigs[keyof SupportedConfigs]

export type CollectionCardPropsItemProperties<C extends keyof SupportedConfigs> = {
  title?: string
  alignItems?: 'center'
  className?: string
  showStatus?: boolean
  showTags?: boolean
  showImage?: boolean
  layout?: 'vertical' | 'horizontal'
  collection: C
  item: CollectionCardItemProperties
}

export type CollectionCardProps<C extends keyof SupportedConfigs> = React.ComponentPropsWithRef<
  typeof Item
> &
  CollectionCardPropsItemProperties<C>

export type CollectionCardItemProperties = {
  status: BadgeStatus | null
  tags: string[] | null
  images: Media[] | null
  description: string | null
  title: string
  href: string
}

export function CollectionCard<C extends keyof SupportedConfigs>({
  className,
  showTags = true,
  layout = 'vertical',
  title: titleFromProps,
  item: itemFromProps,
  ...props
}: CollectionCardProps<C>): React.ReactNode {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const cardCurrentRef = useRef<HTMLDivElement>(card.ref.current)
  const linkCurrentRef = useRef(link.ref.current)

  const { tags, images, description, title, href } = itemFromProps

  const titleToUse = titleFromProps || title

  const useHorizontal = layout === 'horizontal'

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
    // return (
    //   <article
    //     className={cn(
    //       'article-card pointer-events-auto overflow-hidden rounded-lg border border-primary/30 bg-background hover:cursor-pointer',
    //       className,
    //     )}
    //     ref={cardCurrentRef}
    //   >
    //     <div className="relative w-full">
    //       {image && typeof image === 'object' && <ImageGallery items={[image]} inline={false} />}
    //     </div>

    //     <div className="mt-2 px-4">
    //       <div className="flex w-full flex-row flex-nowrap items-center justify-between">
    //         {titleToUse && (
    //           <div className="prose whitespace-nowrap">
    //             <h3>
    //               <Link className="not-prose" href={href} ref={linkCurrentRef}>
    //                 {titleToUse}
    //               </Link>
    //             </h3>
    //           </div>
    //         )}
    //         {showStatus && status && <StatusBadge status={status}></StatusBadge>}
    //       </div>

    //       {description && <div className="my-2">{description && <p>{description}</p>}</div>}
    //     </div>

    //     <Separator></Separator>

    //     {showTags && tags && (
    //       <div className="my-2 flex flex-row gap-x-1 px-4 text-sm uppercase">
    //         {tags.map((tag, index) => {
    //           return (
    //             <Badge key={index} variant={'default'}>
    //               <span className="font-bold">{tag}</span>
    //             </Badge>
    //           )
    //         })}
    //       </div>
    //     )}
    //   </article>
    // )
  } else {
    return (
      <Item
        ref={cardCurrentRef}
        className={cn('gap-0 bg-card p-0', className)}
        variant="outline"
        {...props}
      >
        <div className={cn('flex min-h-40 grow flex-row flex-nowrap items-start overflow-hidden')}>
          {/* left side of card  */}
          <div
            className={cn(
              'flex h-full w-full grow flex-col items-start justify-start rounded-none',
            )}
          >
            <ItemHeader className={'p-2'}>
              <ItemTitle className={'p-0'}>
                <Link className="" href={href} ref={linkCurrentRef}>
                  <span className={'text-2xl'}>{titleToUse}</span>
                </Link>
              </ItemTitle>
            </ItemHeader>

            <ItemContent className={cn('flex h-full w-full grow flex-col rounded-none px-2')}>
              <ItemDescription>
                {description && <span className="prose">{description}</span>}
              </ItemDescription>
            </ItemContent>
          </div>

          {/* right side of card */}
          <div
            className={cn(
              'flex h-auto grow-0 flex-col items-center justify-center rounded-tl-none rounded-bl-none border-l border-l-border',
            )}
          >
            <div className={cn('min-h-40 w-50')}>
              <AspectRatio ratio={1 / 1} className={cn('w-full')}>
                {images && (
                  <ImageGallery
                    layout={'card-gallery'}
                    containerProps={{ className: 'h-full' }}
                    galleryStyles={'h-full'}
                    thumbnailTooltip={false}
                    items={images}
                    inline={true}
                  />
                )}
              </AspectRatio>
            </div>
          </div>
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

    // return (
    //   <article
    //     className={cn(
    //       'article-card pointer-events-auto overflow-hidden rounded-lg border border-primary/30 bg-background hover:cursor-pointer',
    //       className,
    //     )}
    //     ref={cardCurrentRef}
    //   >
    //     <div>
    //     </div>
    //     <div className="grid w-full grid-cols-2">
    //       <div className="mt-2 px-4">
    //         <div className="flex w-full flex-row flex-wrap items-center gap-x-2">
    //           {titleToUse && (
    //             <div className="prose">
    //               <h3>
    //                 <Link className="not-prose" href={href} ref={linkCurrentRef}>
    //                   {titleToUse}
    //                 </Link>
    //               </h3>
    //             </div>
    //           )}
    //           {showStatus && status && <StatusBadge status={status}></StatusBadge>}
    //         </div>
    //         {description && <div className="my-2">{description && <p>{description}</p>}</div>}
    //       </div>
    //       <div className="relative w-full">
    //         {image && typeof image === 'object' && <ImageGallery items={[image]} inline={false} />}
    //       </div>
    //     </div>
    //     <Separator></Separator>
    //     {showTags && tags && (
    //       <div className="my-2 flex flex-row gap-x-1 px-4 text-sm uppercase">
    //         {tags.map((tag, index) => {
    //           return (
    //             <Badge key={index} variant={'default'}>
    //               <span className="font-bold">{tag}</span>
    //             </Badge>
    //           )
    //         })}
    //       </div>
    //     )}
    //   </article>
    // )
  }
}
