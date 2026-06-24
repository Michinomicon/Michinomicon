'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment, useRef } from 'react'
import type { Media } from '@/payload-types'
import { ImageMedia } from '../Media/ImageMedia'
import { TypedCollection } from 'payload'

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
  showTags?: boolean
  collection: C
  item: CollectionCardItemProperties
  itemFunc?: never
}

export type CollectionCardPropsItemFunc<C extends keyof SupportedConfigs> = {
  title?: string
  alignItems?: 'center'
  className?: string
  showTags?: boolean
  collection: C
  item: SupportedConfigs[C]
  itemFunc: CollectionCardItemPropertiesFunc<C>
}

export type CollectionCardProps<C extends keyof SupportedConfigs> =
  | CollectionCardPropsItemProperties<C>
  | CollectionCardPropsItemFunc<C>

export type CollectionCardItemProperties = {
  tags: string[] | null
  image: Media | null
  description: string | null
  title: string
  href: string
}

export function CollectionCard<C extends keyof SupportedConfigs>({
  className,
  showTags = true,
  title: titleFromProps,
  itemFunc,
  item: itemFromProps,
}: CollectionCardProps<C>): React.ReactNode {
  const { card, link } = useClickableCard({})
  const cardCurrentRef = useRef(card.ref.current)
  const linkCurrentRef = useRef(link.ref.current)

  const { tags, image, description, title, href } = itemFunc
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
        {/* {!metaImage && <div className="">No image</div>} */}
        {/* {metaImage && <Media resource={metaImage} className="w-[33vw]" />} */}
        {image && typeof image === 'object' && <ImageMedia src={image} />}
      </div>
      <div className="p-4">
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={linkCurrentRef}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && <div className="mt-2">{description && <p>{description}</p>}</div>}
      </div>
      {showTags && tags && (
        <div className="mb-4 px-4 text-sm uppercase">
          <div>
            {tags.map((tag, index) => {
              const isLast = index === tags.length - 1
              return (
                <Fragment key={index}>
                  {tag}
                  {!isLast && <Fragment>, &nbsp;</Fragment>}
                </Fragment>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}
