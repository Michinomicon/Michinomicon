import clsx from 'clsx'
import React from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { CollectionCard } from '../../components/Card'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: DefaultTypedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { className, docs, introContent } = props

  return (
    <div className={clsx('lg:container', className, 'related-posts-block')}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-8">
        {docs?.map((doc, index) => {
          if (typeof doc === 'string') return null

          return <CollectionCard key={index} item={doc} relationTo="posts" showRelated />
        })}
      </div>
    </div>
  )
}
