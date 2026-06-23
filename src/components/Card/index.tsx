'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment, useRef } from 'react'
import type { Creator, Post, Project } from '@/payload-types'
import { Media } from '@/components/Media'
import { isPayloadMedia } from '../Media/types'

export type PostItem = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>
export type ProjectItem = Pick<Project, 'title' | 'id'>
export type CreatorItem = Pick<Creator, 'slug' | 'title' | 'description'>

type BaseProps = {
  relationTo: 'posts' | 'projects' | 'creators'
  item: PostItem | ProjectItem | CreatorItem
}
interface PostItemProps extends BaseProps {
  relationTo: 'posts'
  item: PostItem
}
interface ProjectItemProps extends BaseProps {
  relationTo: 'projects'
  item: ProjectItem
}
interface CreatorItemProps extends BaseProps {
  relationTo: 'creators'
  item: CreatorItem
}

export type CollectionCardItemProps = PostItemProps | ProjectItemProps | CreatorItemProps
export type CollectionCardProps = {
  alignItems?: 'center'
  className?: string
  showRelated?: boolean
  title?: string
} & CollectionCardItemProps

function getPostItemProperties(item: PostItem) {
  const { slug, categories, meta, title } = item
  const { description, image } = meta || {}

  const relatedItems =
    categories && Array.isArray(categories) && categories.length > 0
      ? categories.filter((c) => typeof c === 'object')
      : null
  const hasRelatedItems = relatedItems && Array.isArray(relatedItems) && relatedItems.length > 0
  const metaImage = isPayloadMedia(image) ? image : null
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/posts/${slug}`

  return {
    relatedItems: relatedItems,
    hasRelatedItems: hasRelatedItems,
    metaImage: metaImage,
    description: sanitizedDescription,
    title: title,
    href: href,
  }
}

function getCreatorItemProperties(item: CreatorItem) {
  const { slug, title } = item
  const relatedItems = new Array(0)
  const hasRelatedItems = relatedItems && Array.isArray(relatedItems) && relatedItems.length > 0
  const href = `/creators/${slug}`
  return {
    relatedItems: relatedItems,
    hasRelatedItems: hasRelatedItems,
    metaImage: null,
    description: '',
    title: title,
    href: href,
  }
}

function getProjectItemProperties(item: ProjectItem) {
  const { title } = item
  const relatedItems = new Array(0)
  const hasRelatedItems = relatedItems && Array.isArray(relatedItems) && relatedItems.length > 0
  const href = `/projects/`
  return {
    relatedItems: relatedItems,
    hasRelatedItems: hasRelatedItems,
    metaImage: null,
    description: '',
    title: title,
    href: href,
  }
}

function getItemProperties({ item, relationTo }: CollectionCardProps) {
  switch (relationTo) {
    case 'posts':
      return getPostItemProperties(item)
    case 'creators':
      return getCreatorItemProperties(item)
    case 'projects':
      return getProjectItemProperties(item)
  }
}

export function CollectionCard(props: CollectionCardProps): React.JSX.Element {
  const { card, link } = useClickableCard({})
  const cardCurrentRef = useRef(card.ref.current)
  const linkCurrentRef = useRef(link.ref.current)
  const { className, showRelated, title: titleFromProps } = props

  const { relatedItems, hasRelatedItems, metaImage, description, title, href } =
    getItemProperties(props)

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
        {metaImage && <Media resource={metaImage} className="w-[33vw]" />}
      </div>
      <div className="p-4">
        {showRelated && hasRelatedItems && (
          <div className="mb-4 text-sm uppercase">
            {showRelated && hasRelatedItems && (
              <div>
                {relatedItems?.map((relatedItem, index) => {
                  const { title: titleFromItem } = relatedItem
                  const itemTitle = titleFromItem || 'Untitled'
                  const isLast = index === relatedItems.length - 1

                  return (
                    <Fragment key={index}>
                      {itemTitle}
                      {!isLast && <Fragment>, &nbsp;</Fragment>}
                    </Fragment>
                  )
                })}
              </div>
            )}
          </div>
        )}
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
    </article>
  )
}
