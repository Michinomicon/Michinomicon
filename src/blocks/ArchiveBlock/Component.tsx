import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import React from 'react'
import RichText from '../../components/RichText'
import { CollectionItemGroup, CollectionItemGroupProps } from '../../components/CollectionItemGroup'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit,
    relationTo,
    populateBy,
    selectedDocs,
    cardHeight,
    cardWidth,
    cardLayout,
    showDescription,
    showImages,
  } = props

  let archiveProps: CollectionItemGroupProps | null = null
  if (populateBy) {
    if (populateBy === 'collection' && relationTo) {
      archiveProps = {
        populateBy: populateBy,
        collection: relationTo,
        categories: categories,
        limit: limit,
        cardStyle: {
          showDescription: showDescription === true,
          showImages: showImages === true,
          width: cardWidth,
          height: cardHeight,
          layout: cardLayout,
        },
      }
    } else if (populateBy === 'selection') {
      archiveProps = {
        populateBy: populateBy,
        items: selectedDocs,
        cardStyle: {
          showDescription: showDescription === true,
          showImages: showImages === true,
          width: cardWidth,
          height: cardHeight,
          layout: cardLayout,
        },
      }
    }
  }

  return (
    <div className="archive-block my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-3xl" data={introContent} enableGutter={false} />
        </div>
      )}
      {archiveProps && <CollectionItemGroup {...archiveProps} />}
    </div>
  )
}
