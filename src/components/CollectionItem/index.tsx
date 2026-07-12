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
  layout?: 'vertical' | 'horizontal'
  item: CollectionItemProperties<T>
}

export function CollectionItem<T extends keyof SupportedConfigs>({
  className,
  showTags = true,
  layout: layoutFromProps,
  title: titleFromProps,
  item: itemFromProps,
  ...props
}: CollectionItemProps<T>): React.ReactNode {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const linkCurrentRef = useRef(link.ref.current)
  const cardCurrentRef = useRef<HTMLDivElement>(card.ref.current)

  const { tags, images, description, title: titleFromItemProps, href } = itemFromProps
  const title = titleFromProps || titleFromItemProps

  const layout = layoutFromProps || 'horizontal'

  const innerContent = () => {
    switch (layout) {
      case 'vertical':
        return (
          <div
            className={cn(
              'item-content flex grow flex-col flex-nowrap items-start justify-start overflow-hidden',
            )}
          >
            <div
              className={cn(
                'item-image-container bg-black',
                'flex h-full w-full shrink grow-0 flex-col items-center justify-center',
                'rounded-none border-b border-b-border',
              )}
            >
              <div className={cn('item-image-wrapper')}>
                <AspectRatio ratio={1 / 1} className={cn('w-full')}>
                  {images && (
                    <ImageGallery
                      layout={'card'}
                      containerClassNames={'h-full'}
                      galleryClassNames={'h-full'}
                      thumbnailTooltip={false}
                      items={images}
                    />
                  )}
                </AspectRatio>
              </div>
            </div>
            <div
              className={cn(
                'item-text-container flex grow flex-col flex-nowrap items-start justify-start overflow-hidden',
              )}
            >
              <div className={'w-full grow-0 p-2'}>
                <Link className="" href={href} ref={linkCurrentRef}>
                  <span className={'text-2xl'}>{title}</span>
                </Link>
              </div>
              <div className={cn('item-description rounded-non h-full w-full overflow-hidden p-1')}>
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
            </div>
          </div>
        )
      case 'horizontal':
        return (
          <div className={cn('item-content flex w-full flex-nowrap overflow-hidden')}>
            <div
              className={cn(
                'item-text-container flex grow flex-col flex-nowrap items-start justify-start overflow-hidden',
              )}
            >
              <div className={'w-full grow-0 p-2'}>
                <Link className="" href={href} ref={linkCurrentRef}>
                  <span className={'text-2xl'}>{title}</span>
                </Link>
              </div>
              <div
                className={cn(
                  'item-description h-full w-full overflow-hidden rounded-none border-t border-t-border/30 bg-foreground/5 p-2 pt-0',
                )}
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
            </div>

            <div
              className={cn(
                'item-image-container shrink-0 grow-0 bg-black',
                'flex flex-col flex-nowrap items-center justify-center overflow-hidden',
                'rounded-tl-none rounded-bl-none border-l border-l-border',
              )}
            >
              <div className={cn('item-image-wrapper')}>
                <AspectRatio ratio={1 / 1} className={cn('w-full')}>
                  {images && (
                    <ImageGallery
                      layout={'card'}
                      containerClassNames={'h-full'}
                      galleryClassNames={'h-full'}
                      thumbnailTooltip={false}
                      items={images}
                    />
                  )}
                </AspectRatio>
              </div>
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
      size="sm"
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
