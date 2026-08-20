'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { useRef } from 'react'
import type { Creator, Media, Project } from '@/payload-types'
import { TypedCollection } from 'payload'
import { Badge, BadgeStatus } from '../ui/badge'
import { Item, ItemFooter } from '../ui/item'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '../RichText'
import { CreatorAvatarGroup } from '../CreatorAvatarGroup'
import { cva } from 'class-variance-authority'
import { CollectionItemCardImage } from './CollectionItemCardImage'

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
  alignItems?: 'center'
  className?: string
  showTags?: boolean
  showDescription?: boolean
  showImages?: boolean
  layout?: 'vertical' | 'horizontal'
  item: CollectionItemProperties<T>
}

const ItemContentClassName = cn(
  'item-content overflow-hidden flex grow flex-col flex-nowrap items-start justify-between',
)

const ItemContentUpperClassName = cva('item-content-upper', {
  variants: {
    layout: {
      vertical: cn('flex w-full flex-col items-center justify-center'),
      horizontal: cn('flex w-full flex-row items-center justify-between'),
    },
  },
})

const ItemContentContainerClassName = cva('item-content-container overflow-hidden', {
  variants: {
    layout: {
      vertical: cn('w-full'),
      horizontal: cn('w-full flex w-full flex-nowrap gap-2 pr-1 [&_.item-content]:pb-1'),
    },
  },
})

export function CollectionItemCard<T extends keyof SupportedConfigs>({
  className,
  showTags = false,
  showDescription = true,
  showImages = true,
  layout = 'horizontal',
  item,
  ...props
}: CollectionItemCardProps<T>): React.ReactNode {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const linkCurrentRef = useRef(link.ref.current)
  const cardCurrentRef = useRef<HTMLDivElement>(card.ref.current)

  const { tags, image, title, href, description } = item

  return (
    <Item
      ref={cardCurrentRef}
      className={cn('overflow-hidden rounded bg-background p-0', className)}
      variant="outline"
      size="sm"
      {...props}
    >
      {/* {innerContent()} */}
      <div className={ItemContentContainerClassName({ layout })}>
        {showImages && (
          <CollectionItemCardImage image={image} linkRef={linkCurrentRef} href={href} />
        )}
        <div className={cn(ItemContentClassName)}>
          <div className={ItemContentUpperClassName({ layout })}>
            <ItemCardTitle title={title} linkRef={linkCurrentRef} href={href} />
            <RelatedAvatars item={item} />
          </div>
          {showDescription && <ItemCardDescription description={description} />}
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
}

function ItemCardTitle({
  linkRef,
  href,
  title,
}: {
  linkRef: React.RefObject<HTMLAnchorElement | null>
  href: string
  title: string
}): React.ReactNode {
  return (
    <div className={cn('item-title flex w-full flex-row py-1 text-center')}>
      <Link className="" href={href} ref={linkRef}>
        <span className={'text-2xl text-primary hover:underline'}>{title}</span>
      </Link>
    </div>
  )
}

function ItemCardDescription({
  description,
}: {
  description: string | DefaultTypedEditorState | null | undefined
}): React.ReactNode {
  return (
    <div
      className={cn(
        'item-text-container w-full grow pr-1 pb-1',
        'overflow-y-hidden rounded-none inset-shadow-2xs shadow-primary/90',
      )}
    >
      {description && typeof description === 'object' ? (
        <RichText
          className={
            'h-full w-full overflow-y-auto rounded border border-primary/10 bg-card/10 p-1 [&_p]:text-sm/6 [&_p]:not-first:hidden'
          }
          data={description}
          enableGutter={false}
        />
      ) : (
        <div className="prose">{description}</div>
      )}
    </div>
  )
}

function RelatedAvatars<T extends keyof SupportedConfigs>({
  item,
}: {
  item: CollectionItemProperties<T>
}): React.ReactNode {
  if (item.related && item.related.length) {
    switch (item.collection) {
      case 'creators':
        return <React.Fragment></React.Fragment>
      case 'projects':
        return (
          <div
            className={cn(
              'item-avatars flex grow flex-col items-center justify-center gap-x-1 p-1 select-none',
            )}
          >
            <div className={'flex w-full items-center justify-center'}>
              <CreatorAvatarGroup creators={item.related} />
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
