import { cn } from '@/utilities/ui'
import React from 'react'
import {
  CollectionArchiveCard,
  CollectionCardItemProperties,
} from '@/components/CollectionArchiveCard'
import { ItemGroup } from '@/components/ui/item'
import { ArchiveBlock, Category, Creator, Post, Project } from '@/payload-types'
import { getCollectionArchiveCardProperties } from '@/utilities/getCollectionArchiveCardProperties'

export type CollectionTypes = {
  posts: Post
  projects: Project
  creators: Creator
}

export interface CollectionArchiveItemsByCollectionProps<T extends keyof CollectionTypes> {
  populateBy: 'collection'
  collection: T
  categories: (string | Category)[] | null | undefined
  limit: number | null | undefined
}

export interface CollectionArchiveItemsBySelectionProps {
  populateBy: 'selection'
  items: ArchiveBlock['selectedDocs']
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

type CollectionArchiveDocumentCollectionProps = DocumentCollectionType & {
  populateBy?: null | undefined
  categories?: null | undefined
  limit?: null | undefined
}

interface CollectionArchiveDefaultProps<T extends keyof CollectionTypes> {
  populateBy?: null | undefined
  collection?: null | undefined
  categories?: null | undefined
  limit?: null | undefined
  items: CollectionCardItemProperties<T>[]
}

export type CollectionArchiveItemsProps<T extends keyof CollectionTypes> =
  | CollectionArchiveItemsBySelectionProps
  | CollectionArchiveDefaultProps<T>
  | CollectionArchiveDocumentCollectionProps
  | CollectionArchiveItemsByCollectionProps<T>

const VerticalCardsClassName = {
  Group:
    'grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8',
  Card: '',
}

const HorizontalCardsClassName = {
  Group: 'grid grid-cols-12 gap-x-4 gap-y-4 xl:grid-cols-12 xl:gap-x-8 xl:gap-y-8',
  Card: 'col-span-12 xl:col-span-6',
}

export type CollectionArchiveProps = CollectionArchiveItemsProps<keyof CollectionTypes> & {
  className?: string
  showTags?: boolean
}

export async function CollectionArchive({
  className,
  showTags = false,
  ...props
}: CollectionArchiveProps): Promise<React.ReactNode> {
  const layout: 'vertical' | 'horizontal' = 'horizontal'

  const items = await getCollectionArchiveCardProperties(props)
  return (
    <div className={cn('flex w-full flex-col', className)}>
      <ItemGroup
        className={cn(
          layout === 'horizontal' ? HorizontalCardsClassName.Group : VerticalCardsClassName.Group,
        )}
      >
        {items?.map((item, index) => (
          <CollectionArchiveCard
            key={index}
            className={cn(
              layout === 'horizontal' ? HorizontalCardsClassName.Card : VerticalCardsClassName.Card,
            )}
            layout={layout}
            item={item}
            showTags={showTags}
          />
        ))}
      </ItemGroup>
    </div>
  )
}
