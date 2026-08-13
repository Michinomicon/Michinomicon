import React from 'react'
import { CollectionItemProperties } from '@/components/CollectionItemCard'
import {
  ItemGroup as ItemGroupBlock,
  Category,
  Creator,
  Page,
  Post,
  Project,
} from '@/payload-types'
import { getCollectionItemProperties } from '@/utilities/getItemGroupCardProperties'
import { CollectionItemClientGroup } from './CollectionItemClientGroup'

export type CollectionItemCardDimension = 'sm' | 'md' | 'lg'
export type CollectionItemCardLayout = 'vertical' | 'horizontal'
export type CollectionItemCardStyle = {
  showDescription: boolean
  showImages: boolean
  showTags?: boolean
  width: CollectionItemCardDimension
  height: CollectionItemCardDimension
  layout: CollectionItemCardLayout
}

export type CollectionTypes = {
  pages: Page
  posts: Post
  projects: Project
  creators: Creator
}

export interface CollectionItemGroupPopulateByCollection<T extends keyof CollectionTypes> {
  populateBy: 'collection'
  collection: T
  categories: (string | Category)[] | null | undefined
  limit: number | null | undefined
}

export interface CollectionItemGroupPopulateBySelection {
  populateBy: 'selection'
  items?: ItemGroupBlock['selectedDocs'] | undefined
  collection?: null | undefined
  categories?: null | undefined
  limit?: null | undefined
}

type DocumentCollection = {
  [T in keyof CollectionTypes]: {
    items: CollectionTypes[T][]
    collection: T
  }
}
type DocumentCollectionType = DocumentCollection[keyof CollectionTypes]

type CollectionItemGroupDocumentItems = DocumentCollectionType & {
  populateBy?: null | undefined
  categories?: null | undefined
  limit?: null | undefined
}

interface CollectionItemGroupCollectionItems<T extends keyof CollectionTypes> {
  populateBy?: null | undefined
  collection?: null | undefined
  categories?: null | undefined
  limit?: null | undefined
  items?: CollectionItemProperties<T>[] | undefined
}

export type CollectionItemGroupProperties<T extends keyof CollectionTypes> =
  | CollectionItemGroupPopulateBySelection
  | CollectionItemGroupCollectionItems<T>
  | CollectionItemGroupDocumentItems
  | CollectionItemGroupPopulateByCollection<T>

export type CollectionItemGroupProps = CollectionItemGroupProperties<keyof CollectionTypes> & {
  className?: string
  cardStyle?: CollectionItemCardStyle
  layout?: 'carousel' | 'grid'
}

export async function CollectionItemGroup({
  className,
  layout = 'grid',
  cardStyle,
  ...props
}: CollectionItemGroupProps): Promise<React.ReactNode> {
  const items: CollectionItemProperties<keyof CollectionTypes>[] =
    await getCollectionItemProperties(props)

  return (
    <CollectionItemClientGroup
      items={items}
      className={className}
      layout={layout}
      cardStyle={cardStyle}
    />
  )
}
