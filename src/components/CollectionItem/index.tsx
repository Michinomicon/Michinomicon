'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { useRef } from 'react'
import type { Media } from '@/payload-types'
import { TypedCollection } from 'payload'
import { Badge, BadgeStatus } from '../ui/badge'
import { ImageGallery } from '../ImageGallery'
import { Item, ItemFooter } from '../ui/item'
import { AspectRatio } from '../ui/aspect-ratio'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '../RichText'
import { cva, VariantProps } from 'class-variance-authority'

type SupportedConfigs = Pick<TypedCollection, 'creators' | 'posts' | 'projects'>

type BaseItemProperties<T extends keyof SupportedConfigs = keyof SupportedConfigs> = {
  collection: T
  status: BadgeStatus | null
  tags: string[] | null
  images: Media[] | null
  description: string | DefaultTypedEditorState | null | undefined
  title: string
  href: string
}
export type CollectionItemProperties<T extends keyof SupportedConfigs> = BaseItemProperties<T>

export type CollectionItemProps<T extends keyof SupportedConfigs> = Omit<
  React.ComponentPropsWithRef<typeof Item>,
  'size'
> & {
  title?: string
  alignItems?: 'center'
  className?: string
  showStatus?: boolean
  showTags?: boolean
  showImage?: boolean
  item: CollectionItemProperties<T>
}

type ItemTitleProps = {
  title: string
  href: string
  link: ReturnType<typeof useClickableCard>['link']
}
function ItemTitle({ title, href, link }: ItemTitleProps): React.ReactNode {
  const linkCurrentRef = useRef(link.ref.current)
  return (
    <div className={'w-full grow-0 p-2'}>
      <Link className="" href={href} ref={linkCurrentRef}>
        <span className={'text-2xl'}>{title}</span>
      </Link>
    </div>
  )
}

// type ItemDescriptionProps = {
//   description: string | DefaultTypedEditorState | null | undefined
// }
// function ItemDescription({ description }: ItemDescriptionProps): React.ReactNode {
//   return (
//     <div className={'h-full w-full overflow-hidden rounded-none'}>
//       {description && typeof description === 'object' ? (
//         <RichText
//           className={'h-full w-full overflow-scroll'}
//           data={description}
//           enableGutter={false}
//         />
//       ) : (
//         <span className="prose">{description}</span>
//       )}
//     </div>
//   )
// }

const itemImageVariants = cva('image-container', {
  variants: {
    size: {
      sm: 'h-50 w-50',
      md: 'h-80 w-80',
      lg: 'h-100 w-100',
      xl: 'h-100 w-100',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})
type ItemImageProps = { items: Media[] | null } & VariantProps<typeof itemImageVariants>
function ItemImage({ size, items }: ItemImageProps): React.ReactNode {
  const className = itemImageVariants({ size })
  if (!items || items.length <= 0) {
    return
  }
  return (
    <div className={cn(className)}>
      <AspectRatio ratio={1 / 1} className={cn('w-full')}>
        <ImageGallery
          layout={'card'}
          containerClassNames={'h-full'}
          galleryClassNames={'h-full'}
          thumbnailTooltip={false}
          items={items}
        />
      </AspectRatio>
    </div>
  )
}

const ContentSizeHeight = cva('', {
  variants: {
    size: {
      sm: 'h-50',
      md: 'h-80',
      lg: 'h-100',
      xl: 'h-100',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

// const horizontalLeftPanel =
//   'flex h-full w-full grow flex-col items-start justify-start rounded-none select-none'
// const ContentSizeWidth = cva('', {
//   variants: {
//     size: {
//       sm: 'w-50',
//       md: 'w-80',
//       lg: 'w-100',
//       xl: 'w-100',
//     },
//   },
//   defaultVariants: {
//     size: 'sm',
//   },
// })

export const CollectionItemVariants = cva('', {
  variants: {
    layout: {
      vertical: '',
      verticalWide: '',
      horizontal: '',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
  },
  defaultVariants: {
    size: 'sm',
    layout: 'horizontal',
  },
})
export type SizeProps = VariantProps<typeof CollectionItemVariants>['size']
export type ItemLayoutProps = VariantProps<typeof CollectionItemVariants>['layout']

export function CollectionItem<T extends keyof SupportedConfigs>({
  className,
  showTags = true,
  layout: layoutFromProps,
  title: titleFromProps,
  item: itemFromProps,
  size,
  ...props
}: CollectionItemProps<T> & VariantProps<typeof CollectionItemVariants>): React.ReactNode {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const cardCurrentRef = useRef<HTMLDivElement>(card.ref.current)

  const { tags, images, description, title: titleFromItemProps, href } = itemFromProps
  const title = titleFromProps || titleFromItemProps

  const itemTitle = <ItemTitle {...{ title, href, link }} />
  const itemDescription = (
    <div
      className={cn('h-full w-full overflow-hidden rounded-none p-1', ContentSizeHeight({ size }))}
    >
      {description && typeof description === 'object' ? (
        <RichText
          className={'h-full w-full overflow-scroll rounded-none'}
          data={description}
          enableGutter={false}
        />
      ) : (
        <span className="prose">{description}</span>
      )}
    </div>
  )
  const itemImage = <ItemImage size={size} items={images} />

  const layout = layoutFromProps || 'horizontal'

  const ContentColContainerClassName = cn(
    'flex flex-col grow flex-nowrap items-start justify-start overflow-hidden',
  )
  const ContentRowContainerClassName = cn(
    'flex grow flex-nowrap items-start justify-center overflow-hidden',
  )

  const innerContent = () => {
    switch (layout) {
      case 'horizontal':
        return (
          <div className={cn(ContentRowContainerClassName)}>
            <div className={cn(ContentColContainerClassName, ContentSizeHeight({ size }))}>
              {itemTitle}
              {itemDescription}
            </div>
            <div
              className={cn(
                'flex h-full shrink grow-0 flex-col items-center justify-center',
                'rounded-tl-none rounded-bl-none border-l border-l-border',
              )}
            >
              {itemImage}
            </div>
          </div>
        )

      case 'vertical':
        return (
          <div className={cn(ContentColContainerClassName)}>
            <div
              className={cn(
                ContentSizeHeight({ size }),
                'flex h-full w-full shrink grow-0 flex-col items-center justify-center',
                'rounded-none border-b border-b-border',
              )}
            >
              {itemImage}
            </div>
            <div className={cn(ContentColContainerClassName)}>
              {itemTitle}
              {itemDescription}
            </div>
          </div>
        )

      case 'verticalWide':
        return (
          <div className={cn(ContentColContainerClassName)}>
            <div className={cn(ContentRowContainerClassName, ContentSizeHeight({ size }))}>
              <div className={cn(ContentColContainerClassName, ContentSizeHeight({ size }))}>
                {itemTitle}
              </div>
              <div
                className={cn(
                  ContentSizeHeight({ size }),
                  'flex h-full w-full shrink grow-0 flex-col items-center justify-center',
                  'rounded-none border-b border-b-border',
                )}
              >
                {itemImage}
              </div>
            </div>
            <div className={cn(ContentRowContainerClassName, ContentSizeHeight({ size }))}>
              {itemDescription}
            </div>
          </div>
        )
    }
  }

  return (
    <Item
      ref={cardCurrentRef}
      className={cn('gap-0 bg-card p-0', className)}
      variant="outline"
      {...props}
    >
      {innerContent()}

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

/**    
 * return (
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
                      <ImageGallery thumbnailTooltip={false} items={[image]} layout={'card'} />
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
 */
