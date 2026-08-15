'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { useRef } from 'react'
import type { Creator, Media, Project } from '@/payload-types'
import { TypedCollection } from 'payload'
import { Badge, BadgeStatus } from '../ui/badge'
import { Item, ItemFooter } from '../ui/item'
import { AspectRatio } from '../ui/aspect-ratio'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '../RichText'
import { ImageMedia } from '../Media/ImageMedia'
import { CreatorAvatarGroup } from '../CreatorAvatarGroup'
import { cva } from 'class-variance-authority'

type SupportedConfigs = Pick<TypedCollection, 'creators' | 'pages' | 'posts' | 'projects'>

type BaseItemProperties<T extends keyof SupportedConfigs = keyof SupportedConfigs> = {
  collection: T
  status: BadgeStatus | null
  tags: string[] | null
  image: Media | null
  description: string | DefaultTypedEditorState | null | undefined
  title: string
  href: string
  related: SupportedConfigs[keyof SupportedConfigs][] | null
}
interface ProjectItemProperties extends BaseItemProperties<'projects'> {
  related: Creator[] | null
}
interface CreatorItemProperties<
  T extends keyof SupportedConfigs & 'creators' = 'creators',
> extends BaseItemProperties<T> {
  related: Project[] | null
}
interface PostItemProperties<
  T extends keyof SupportedConfigs & 'posts' = 'posts',
> extends BaseItemProperties<T> {
  related: SupportedConfigs[keyof SupportedConfigs][] | null
}
interface PageItemProperties<
  T extends keyof SupportedConfigs & 'pages' = 'pages',
> extends BaseItemProperties<T> {
  related: SupportedConfigs[keyof SupportedConfigs][] | null
}

export type CollectionItemProperties<T extends keyof SupportedConfigs> = T extends 'projects'
  ? ProjectItemProperties
  : T extends 'creators'
    ? CreatorItemProperties
    : T extends 'posts'
      ? PostItemProperties
      : T extends 'pages'
        ? PageItemProperties
        : never

export type CollectionItemCardProps<T extends keyof SupportedConfigs> = Omit<
  React.ComponentPropsWithRef<typeof Item>,
  'size'
> & {
  title?: string
  alignItems?: 'center'
  className?: string
  showTags?: boolean
  showDescription?: boolean
  showImages?: boolean
  layout?: 'vertical' | 'horizontal'
  item: CollectionItemProperties<T>
}

const RelatedAvatarStyles = cva('flex flex-col w-full h-full', {
  variants: {
    layout: {
      vertical: 'items-center rounded-none border-t border-t-border/30',
      horizontal: 'items-center rounded-none border-t border-t-border/30',
    },
  },
})

function RelatedAvatars<T extends keyof SupportedConfigs>({
  layout,
  item,
}: {
  layout: CollectionItemCardProps<T>['layout']
  item: CollectionItemProperties<T>
}): React.ReactNode {
  if (item.related && item.related.length) {
    switch (item.collection) {
      case 'creators':
        return <React.Fragment></React.Fragment>
      case 'projects':
        return (
          <div className={cn(RelatedAvatarStyles({ layout: layout }), 'select-none')}>
            <div className="flex w-full items-start justify-start p-1 pb-0">
              <div className={'text-xs text-muted-foreground uppercase'}>Contributors</div>
            </div>
            <div className={'flex w-full items-start justify-start p-1'}>
              <CreatorAvatarGroup creators={item.related} className={''} />
            </div>
          </div>
        )
      case 'pages':
        return <React.Fragment></React.Fragment>
      case 'posts':
        return <React.Fragment></React.Fragment>
    }
  }
}

export function CollectionItemCard<T extends keyof SupportedConfigs>({
  className,
  showTags = false,
  showDescription = true,
  showImages = true,
  layout: layoutFromProps,
  title: titleFromProps,
  item,
  ...props
}: CollectionItemCardProps<T>): React.ReactNode {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const linkCurrentRef = useRef(link.ref.current)
  const cardCurrentRef = useRef<HTMLDivElement>(card.ref.current)

  const { tags, image, description, title: titleFromItemProps, href } = item
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
            {showImages && (
              <div
                className={cn(
                  'item-image-container bg-black',
                  'flex h-full w-full shrink grow-0 flex-col items-center justify-center',
                  'rounded-none border-b border-b-border',
                )}
              >
                <div className={cn('item-image-wrapper')}>
                  <AspectRatio ratio={1 / 1} className={cn('w-full')}>
                    {image && <ImageMedia src={image}></ImageMedia>}
                  </AspectRatio>
                </div>
              </div>
            )}

            <div
              className={cn(
                'item-text-container flex w-full grow flex-col flex-nowrap items-start justify-between',
              )}
            >
              <div
                className={
                  'flex w-full flex-row justify-between rounded-none border-b border-b-border/30 p-2'
                }
              >
                <Link className="" href={href} ref={linkCurrentRef}>
                  <span className={'text-2xl'}>{title}</span>
                </Link>
              </div>

              {showDescription && (
                <div
                  className={cn(
                    'item-description rounded-non h-full w-full overflow-hidden bg-foreground/5 p-1',
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
              )}
              <RelatedAvatars item={item} layout={layout} />
            </div>
          </div>
        )
      case 'horizontal':
        return (
          <div className={cn('item-content flex w-full flex-nowrap')}>
            {showImages && (
              <div
                className={cn(
                  'item-image-container shrink-0 grow-0 bg-black',
                  'flex flex-col flex-nowrap items-center justify-center overflow-hidden',
                  'rounded-tr-none rounded-br-none border-r border-r-border',
                )}
              >
                <div className={cn('item-image-wrapper')}>
                  <AspectRatio ratio={1 / 1} className={cn('w-full')}>
                    {image && <ImageMedia src={image}></ImageMedia>}
                  </AspectRatio>
                </div>
              </div>
            )}
            <div
              className={cn(
                'item-text-container flex grow flex-col flex-nowrap items-start justify-between overflow-hidden',
              )}
            >
              <div className={'flex w-full flex-row gap-4 p-2'}>
                <Link className="" href={href} ref={linkCurrentRef}>
                  <span className={'text-2xl hover:underline'}>{title}</span>
                </Link>
              </div>
              {showDescription && (
                <div
                  className={cn(
                    'item-description h-full w-full overflow-hidden rounded-none border-b border-b-border/30 bg-foreground/5 pt-0',
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
              )}
              <RelatedAvatars item={item} layout={layout} />
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
