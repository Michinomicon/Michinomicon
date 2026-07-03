'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { useRef } from 'react'
import type { Media } from '@/payload-types'
import { TypedCollection } from 'payload'
import { Badge, BadgeStatus } from '../ui/badge'
import { Separator } from '../ui/separator'
import { ImageGallery } from '../ImageGallery'
import { StatusBadge } from '../StatusBadge'

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

export type CollectionCardProps<C extends keyof SupportedConfigs> =
  CollectionCardPropsItemProperties<C>

export type CollectionCardItemProperties = {
  status: BadgeStatus | null
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
  layout = 'vertical',
  title: titleFromProps,
  item: itemFromProps,
}: CollectionCardProps<C>): React.ReactNode {
  const { card, link } = useClickableCard({})
  const cardCurrentRef = useRef(card.ref.current)
  const linkCurrentRef = useRef(link.ref.current)

  const { tags, image, description, title, href, status } = itemFromProps

  const titleToUse = titleFromProps || title

  const useHorizontal = layout === 'horizontal'

  if (!useHorizontal) {
    return (
      <article
        className={cn(
          'article-card pointer-events-auto overflow-hidden rounded-lg border border-primary/30 bg-background hover:cursor-pointer',
          className,
        )}
        ref={cardCurrentRef}
      >
        <div className="relative w-full">
          {image && typeof image === 'object' && <ImageGallery items={[image]} inline={false} />}
        </div>

        <div className="mt-2 px-4">
          <div className="flex w-full flex-row flex-nowrap items-center justify-between">
            {titleToUse && (
              <div className="prose whitespace-nowrap">
                <h3>
                  <Link className="not-prose" href={href} ref={linkCurrentRef}>
                    {titleToUse}
                  </Link>
                </h3>
              </div>
            )}
            {showStatus && status && <StatusBadge status={status}></StatusBadge>}
          </div>

          {description && <div className="my-2">{description && <p>{description}</p>}</div>}
        </div>

        <Separator></Separator>

        {showTags && tags && (
          <div className="my-2 flex flex-row gap-x-1 px-4 text-sm uppercase">
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
  } else {
    return (
      <article
        className={cn(
          'article-card pointer-events-auto overflow-hidden rounded-lg border border-primary/30 bg-background hover:cursor-pointer',
          className,
        )}
        ref={cardCurrentRef}
      >
        <div className="grid w-full grid-cols-2">
          <div className="mt-2 px-4">
            <div className="flex w-full flex-row flex-wrap items-center gap-x-2">
              {titleToUse && (
                <div className="prose">
                  <h3>
                    <Link className="not-prose" href={href} ref={linkCurrentRef}>
                      {titleToUse}
                    </Link>
                  </h3>
                </div>
              )}
              {showStatus && status && <StatusBadge status={status}></StatusBadge>}
            </div>

            {description && <div className="my-2">{description && <p>{description}</p>}</div>}
          </div>

          <div className="relative w-full">
            {image && typeof image === 'object' && <ImageGallery items={[image]} inline={false} />}
          </div>
        </div>

        <Separator></Separator>

        {showTags && tags && (
          <div className="my-2 flex flex-row gap-x-1 px-4 text-sm uppercase">
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
}
