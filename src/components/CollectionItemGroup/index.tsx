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
import { cva, VariantProps } from 'class-variance-authority'

export type BaseCollectionItemCardVariant = {
  layout: {
    vertical: string
    horizontal: string
  }
  height: {
    xs: string
    sm: string
    md: string
    lg: string
  }
  width: {
    sm: string
    md: string
    lg: string
  }
}

export const CollectionItemCardVariant = cva<BaseCollectionItemCardVariant>()

export type ItemCardHeight = NonNullable<VariantProps<typeof CollectionItemCardVariant>['height']>
export type ItemCardWidth = NonNullable<VariantProps<typeof CollectionItemCardVariant>['width']>
export type ItemCardLayout = NonNullable<VariantProps<typeof CollectionItemCardVariant>['layout']>

export interface CollectionItemCardOptions {
  showDescription: boolean
  showImages: boolean
  showTags?: boolean
}
export interface CollectionItemCardStyle {
  width: ItemCardWidth
  height: ItemCardHeight
  layout: ItemCardLayout
}

export interface CollectionItemCardConfig
  extends CollectionItemCardStyle, CollectionItemCardOptions {}

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
  id: string
  className?: string
  cardStyle?: CollectionItemCardConfig
  layout?: 'carousel' | 'grid'
}

export async function CollectionItemGroup({
  id,
  className,
  layout = 'grid',
  cardStyle,
  ...props
}: CollectionItemGroupProps): Promise<React.ReactNode> {
  const items: CollectionItemProperties<keyof CollectionTypes>[] =
    await getCollectionItemProperties(props)

  return (
    <CollectionItemClientGroup
      id={id}
      items={items}
      className={className}
      layout={layout}
      cardStyle={cardStyle}
    />
  )
}
