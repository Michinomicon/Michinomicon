import type { ItemGroup as ItemGroupProps } from '@/payload-types'

import React from 'react'
import RichText from '../../components/RichText'
import { CollectionItemGroup, CollectionItemGroupProps } from '../../components/CollectionItemGroup'

export const ItemGroupBlock: React.FC<
  ItemGroupProps & {
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
    layout,
    cardHeight,
    cardWidth,
    cardLayout,
    showDescription,
    showImages,
  } = props

  let collectionItemGroupProps: CollectionItemGroupProps | null = null
  if (populateBy) {
    if (populateBy === 'collection' && relationTo) {
      collectionItemGroupProps = {
        layout: layout,
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
      collectionItemGroupProps = {
        layout: layout,
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
    <div className="item-group-block my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-3xl" data={introContent} enableGutter={false} />
        </div>
      )}
      {collectionItemGroupProps && <CollectionItemGroup {...collectionItemGroupProps} />}
    </div>
  )
}
