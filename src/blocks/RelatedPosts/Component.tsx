import clsx from 'clsx'
import React from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { CollectionCard, CollectionCardItemPropertiesFunc } from '../../components/Card'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { isMedia } from '@/utilities/isMedia'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: DefaultTypedEditorState
}

export const mapToCollectionCardItemProperties: CollectionCardItemPropertiesFunc<'posts'> = (
  item: Post,
) => {
  const { slug, categories, meta, title } = item
  const { description, image } = meta || {}
  const tags =
    Array.isArray(categories) && categories.length > 0
      ? categories.filter((c) => typeof c === 'object').map(({ title }) => title)
      : null
  const imageMedia = isMedia(image) ? image : null
  // replace non-breaking space with white space
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/posts/${slug}`
  return {
    tags: tags,
    image: imageMedia,
    description: sanitizedDescription || null,
    title: title,
    href: href,
  }
}

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { className, docs, introContent } = props

  return (
    <div className={clsx('lg:container', className, 'related-posts-block')}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-8">
        {docs?.map((doc, index) => {
          if (typeof doc === 'string') return null
          const cardItem = mapToCollectionCardItemProperties(doc)

          return <CollectionCard key={index} item={cardItem} collection="posts" showTags />
        })}
      </div>
    </div>
  )
}
