import clsx from 'clsx'
import React from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { CollectionArchiveCard } from '../../components/CollectionArchiveCard'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { postToCollectionCardItemProperties } from '@/utilities/getCollectionArchiveCardProperties'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: DefaultTypedEditorState
}
export const RelatedPosts: React.FC<RelatedPostsProps> = async (props) => {
  const { className, docs, introContent } = props
  const items = docs ? await Promise.all(docs.map(postToCollectionCardItemProperties)) : []

  return (
    <div className={clsx('lg:container', className, 'related-posts-block')}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-8">
        {items &&
          items.map((item, index) => {
            return <CollectionArchiveCard key={index} item={item} showTags showStatus={false} />
          })}
      </div>
    </div>
  )
}
