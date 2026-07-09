import { cn } from '@/utilities/ui'
import React from 'react'
import { CollectionItem, CollectionItemProperties } from '@/components/CollectionItem'
import { ItemGroup } from '@/components/ui/item'
import { ArchiveBlock, Category, Creator, Post, Project } from '@/payload-types'
import { getCollectionItemProperties } from '@/utilities/getCollectionArchiveCardProperties'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselOptions,
} from '../ui/carousel'

export type CollectionTypes = {
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
  items: CollectionItemProperties<T>[]
}

export type CollectionItemGroupProperties<T extends keyof CollectionTypes> =
  | CollectionItemGroupPopulateBySelection
  | CollectionItemGroupCollectionItems<T>
  | CollectionItemGroupDocumentItems
  | CollectionItemGroupPopulateByCollection<T>

export type CollectionItemGroupProps = CollectionItemGroupProperties<keyof CollectionTypes> & {
  className?: string
  showTags?: boolean
  layout?: 'carousel' | 'grid'
}

export async function CollectionItemGroup({
  className,
  showTags = false,
  layout = 'carousel',
  ...props
}: CollectionItemGroupProps): Promise<React.ReactNode> {
  const itemLayout: 'vertical' | 'horizontal' = 'horizontal'

  const carouselOptions: CarouselOptions = {
    loop: true,
    align: 'start',
    // watchDrag: false,
    // watchResize: false,
    // watchSlides: false,
    // watchFocus: false,

    // container: null,
    // slides: null,
    // active: false,
    // containScroll: false,
    // direction: 'ltr',
    // slidesToScroll: 0,
    // dragFree: false,
    // dragThreshold: 0,
    // inViewThreshold: 0,
    // axis: 'x',
    // skipSnaps: false,
    // duration: 0,
    // startIndex: 0,
    // breakpoints: {},
  }

  const items = await getCollectionItemProperties(props)

  if (layout === 'grid') {
    const VerticalCardsClassName = {
      Group:
        'grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8',
      Card: '',
    }

    const HorizontalCardsClassName = {
      Group: 'grid grid-cols-12 gap-x-4 gap-y-4 xl:grid-cols-12 xl:gap-x-8 xl:gap-y-8',
      Card: 'col-span-12 xl:col-span-6',
    }
    return (
      <div className={cn('flex w-full flex-col', className)}>
        <ItemGroup
          className={cn(
            itemLayout === 'horizontal'
              ? HorizontalCardsClassName.Group
              : VerticalCardsClassName.Group,
          )}
        >
          {items?.map((item, index) => (
            <CollectionItem
              key={index}
              className={cn(
                itemLayout === 'horizontal'
                  ? HorizontalCardsClassName.Card
                  : VerticalCardsClassName.Card,
              )}
              layout={itemLayout}
              item={item}
              showTags={showTags}
            />
          ))}
        </ItemGroup>
      </div>
    )
  } else {
    return (
      <div className={cn('flex w-full flex-col items-center justify-center')}>
        <Carousel orientation={'horizontal'} opts={carouselOptions} className={cn('max-w-3/4')}>
          <CarouselContent className={cn()}>
            {items?.map((item, index) => (
              <CarouselItem key={index} className={cn('w-11/12')}>
                <CollectionItem
                  className={cn('')}
                  layout={itemLayout}
                  item={item}
                  showTags={showTags}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {items.length > 1 && <CarouselPrevious />}
          {items.length > 1 && <CarouselNext />}
        </Carousel>
      </div>
    )
  }
}
