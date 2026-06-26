'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { useRef } from 'react'
import type { Media } from '@/payload-types'
import { ImageMedia } from '../Media/ImageMedia'
import { TypedCollection } from 'payload'
import { Badge, isBadgeStatus } from '../ui/badge'
import { Separator } from '../ui/separator'

export type SupportedConfigs = Pick<TypedCollection, 'creators' | 'posts' | 'projects'>
export type SupportedSlug = keyof SupportedConfigs
export type SupportedCollection = SupportedConfigs[keyof SupportedConfigs]

export type CollectionCardItemPropertiesFunc<
  C extends keyof SupportedConfigs,
  T extends SupportedConfigs[C] = SupportedConfigs[C],
> = (item: T) => CollectionCardItemProperties

export type CollectionCardPropsItemProperties<C extends keyof SupportedConfigs> = {
  title?: string
  alignItems?: 'center'
  className?: string
  showStatus?: boolean
  showTags?: boolean
  showImage?: boolean
  collection: C
  item: CollectionCardItemProperties
  itemFunc?: never
}

export type CollectionCardPropsItemFunc<C extends keyof SupportedConfigs> = {
  title?: string
  alignItems?: 'center'
  className?: string
  showStatus?: boolean
  showTags?: boolean
  showImage?: boolean
  collection: C
  item: SupportedConfigs[C]
  itemFunc: CollectionCardItemPropertiesFunc<C>
}

export type CollectionCardProps<C extends keyof SupportedConfigs> =
  | CollectionCardPropsItemProperties<C>
  | CollectionCardPropsItemFunc<C>

export type CollectionCardItemProperties = {
  status: string
  tags: string[] | null
  image: Media | null
  description: string | null
  title: string
  href: string
}

export function CollectionCard<C extends keyof SupportedConfigs>({
  className,
  showTags = true,
  showStatus = true,
  title: titleFromProps,
  itemFunc,
  item: itemFromProps,
}: CollectionCardProps<C>): React.ReactNode {
  const { card, link } = useClickableCard({})
  const cardCurrentRef = useRef(card.ref.current)
  const linkCurrentRef = useRef(link.ref.current)

  const { tags, image, description, title, href, status } = itemFunc
    ? itemFunc(itemFromProps)
    : itemFromProps

  const titleToUse = titleFromProps || title

  return (
    <article
      className={cn(
        'article-card pointer-events-auto overflow-hidden rounded-lg border border-primary/30 bg-background hover:cursor-pointer',
        className,
      )}
      ref={cardCurrentRef}
    >
      <div className="relative w-full">
        {image && typeof image === 'object' && <ImageMedia src={image} />}
      </div>
      <div className="mt-2 px-4">
        <div className="flex w-full flex-row flex-nowrap items-center justify-between">
          {titleToUse && (
            <div className="prose">
              <h3>
                <Link className="not-prose" href={href} ref={linkCurrentRef}>
                  {titleToUse}
                </Link>
              </h3>
            </div>
          )}
          {showStatus && (
            <Badge status={isBadgeStatus(status) ? status : null}>
              <span className="font-bold uppercase">{status}</span>
            </Badge>
          )}
        </div>

        {description && <div className="my-2">{description && <p>{description}</p>}</div>}
      </div>
      <Separator></Separator>
      {showTags && tags && (
        <div className="my-2 px-4 text-sm uppercase">
          {tags.map((tag, index) => {
            return (
              <Badge key={index} variant={'default'}>
                <span className="font-bold">{tag}</span>
              </Badge>
            )
          })}
        </div>
      )}
    </article>
  )
}
