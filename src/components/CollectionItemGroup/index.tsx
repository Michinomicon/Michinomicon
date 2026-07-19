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
import { Separator } from '../ui/separator'
import { cva, VariantProps } from 'class-variance-authority'

const CarouselItemVariant = cva('', {
  variants: {
    layout: {
      vertical: '',
      horizontal: '',
    },
    height: {
      sm: '',
      md: '',
      lg: '',
    },
    width: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    {
      layout: 'vertical',
      height: 'sm',
      className: cn(
        '[&_.item-image-wrapper]:h-50 [&_.item-image-wrapper]:w-50',
        '[&_.item-text-container]:h-50',
      ),
    },
    {
      layout: 'vertical',
      height: 'md',
      className: cn(
        '[&_.item-image-wrapper]:h-60 [&_.item-image-wrapper]:w-60',
        '[&_.item-text-container]:h-80',
      ),
    },
    {
      layout: 'vertical',
      height: 'lg',
      className: cn(
        '[&_.item-image-wrapper]:h-80 [&_.item-image-wrapper]:w-80',
        '[&_.item-text-container]:h-100',
      ),
    },
    {
      layout: 'vertical',
      width: 'sm',
      className: '[&_.carousel-item]:w-3/12',
    },
    {
      layout: 'vertical',
      width: 'md',
      className: '[&_.carousel-item]:w-5/12',
    },
    {
      layout: 'vertical',
      width: 'lg',
      className: '[&_.carousel-item]:w-7/12',
    },
    {
      layout: 'horizontal',
      width: 'sm',
      className: cn('[&_.carousel-item]:w-8/12 ', ' '),
    },
    {
      layout: 'horizontal',
      width: 'md',
      className: cn('[&_.carousel-item]:w-10/12', ''),
    },
    {
      layout: 'horizontal',
      width: 'lg',
      className: cn('[&_.carousel-item]:w-12/12', ''),
    },
    {
      layout: 'horizontal',
      height: 'sm',
      className: cn(
        '[&_.item-text-container]:h-50',
        '[&_.item-image-container]:w-50 [&_.item-image-wrapper]:w-50 [&_.item-image-wrapper]:h-50',
      ),
    },
    {
      layout: 'horizontal',
      height: 'md',
      className: cn(
        '[&_.item-text-container]:h-80',
        '[&_.item-image-container]:w-60 [&_.item-image-wrapper]:w-60 [&_.item-image-wrapper]:h-60',
      ),
    },
    {
      layout: 'horizontal',
      height: 'lg',
      className: cn(
        '[&_.item-text-container]:h-100',
        '[&_.item-image-container]:w-80 [&_.item-image-wrapper]:w-80 [&_.item-image-wrapper]:h-80',
      ),
    },
  ],
})

const CarouselVariant = cva(
  // 'max-w-3/4',

  'max-w-11/12',
  {
    variants: {
      layout: {
        vertical: '',
        horizontal: '',
      },
      size: {
        'sm-sm': '',
        'sm-md': '',
        'sm-lg': '',
        'md-sm': '',
        'md-md': '',
        'md-lg': '',
        'lg-sm': '',
        'lg-md': '',
        'lg-lg': '',
      },
    },
    compoundVariants: [
      {
        layout: 'horizontal',
        size: 'sm-sm',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'sm', width: 'sm' }),
      },
      {
        layout: 'horizontal',
        size: 'sm-md',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'sm', width: 'md' }),
      },
      {
        layout: 'horizontal',
        size: 'sm-lg',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'sm', width: 'lg' }),
      },
      {
        layout: 'horizontal',
        size: 'md-sm',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'md', width: 'sm' }),
      },
      {
        layout: 'horizontal',
        size: 'md-md',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'md', width: 'md' }),
      },
      {
        layout: 'horizontal',
        size: 'md-lg',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'md', width: 'lg' }),
      },
      {
        layout: 'horizontal',
        size: 'lg-sm',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'lg', width: 'sm' }),
      },
      {
        layout: 'horizontal',
        size: 'lg-md',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'lg', width: 'md' }),
      },
      {
        layout: 'horizontal',
        size: 'lg-lg',
        className: CarouselItemVariant({ layout: 'horizontal', height: 'lg', width: 'lg' }),
      },
      {
        layout: 'vertical',
        size: 'sm-sm',
        className: CarouselItemVariant({ layout: 'vertical', height: 'sm', width: 'sm' }),
      },
      {
        layout: 'vertical',
        size: 'sm-md',
        className: CarouselItemVariant({ layout: 'vertical', height: 'sm', width: 'md' }),
      },
      {
        layout: 'vertical',
        size: 'sm-lg',
        className: CarouselItemVariant({ layout: 'vertical', height: 'sm', width: 'lg' }),
      },
      {
        layout: 'vertical',
        size: 'md-sm',
        className: CarouselItemVariant({ layout: 'vertical', height: 'md', width: 'sm' }),
      },
      {
        layout: 'vertical',
        size: 'md-md',
        className: CarouselItemVariant({ layout: 'vertical', height: 'md', width: 'md' }),
      },
      {
        layout: 'vertical',
        size: 'md-lg',
        className: CarouselItemVariant({ layout: 'vertical', height: 'md', width: 'lg' }),
      },
      {
        layout: 'vertical',
        size: 'lg-sm',
        className: CarouselItemVariant({ layout: 'vertical', height: 'lg', width: 'sm' }),
      },
      {
        layout: 'vertical',
        size: 'lg-md',
        className: CarouselItemVariant({ layout: 'vertical', height: 'lg', width: 'md' }),
      },
      {
        layout: 'vertical',
        size: 'lg-lg',
        className: CarouselItemVariant({ layout: 'vertical', height: 'lg', width: 'lg' }),
      },
    ],
  },
)

const TestCarouselSizes: VariantProps<typeof CarouselVariant>['size'][] = [
  'sm-sm',
  'sm-md',
  'sm-lg',
  'md-sm',
  'md-md',
  'md-lg',
  'lg-sm',
  'lg-md',
  'lg-lg',
]
const layouts: VariantProps<typeof CarouselVariant>['layout'][] = ['vertical', 'horizontal']

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
      <React.Fragment>
        {layouts.map((layout, index) => {
          if (layout) {
            return (
              <React.Fragment key={`${index}-${layout}`}>
                {TestCarouselSizes.map((size, index) => {
                  const className = CarouselVariant({ layout: layout, size: size })
                  console.debug(
                    `CarouselVariant layout: ${layout} size: ${size} ClassName:`,
                    className,
                  )
                  if (size) {
                    const [height, width, ..._rest] = size.split('-')
                    return (
                      <React.Fragment key={`${index}-${layout}-${size}`}>
                        <Separator className="mt-6 mb-6"></Separator>
                        <div className="mb-1 flex w-full flex-nowrap justify-center gap-3 text-2xl">
                          <div className="grid grid-cols-2">
                            Card Layout:{' '}
                            <div className="ml-1 w-fit border bg-popover px-3 text-popover-foreground uppercase">
                              {layout}
                            </div>
                          </div>
                          <div className="grid grid-cols-2">
                            Height:{' '}
                            <div className="ml-1 w-fit border bg-popover px-3 text-popover-foreground uppercase">
                              {height}
                            </div>
                          </div>
                          <div className="grid grid-cols-2">
                            Width:{' '}
                            <div className="ml-1 w-fit border bg-popover px-3 text-popover-foreground uppercase">
                              {width}
                            </div>
                          </div>
                        </div>
                        <div className="mx-auto mb-2">
                          <div
                            className={cn(
                              'flex w-full flex-col items-center justify-center gap-y-2',
                            )}
                          >
                            <Carousel
                              orientation={'horizontal'}
                              opts={carouselOptions}
                              className={cn(
                                'carousel',
                                CarouselVariant({ layout: layout, size: size }),
                              )}
                            >
                              <CarouselContent className={cn('carousel-content', 'my-2')}>
                                {items?.map((item, index) => (
                                  <CarouselItem key={index} className={cn('carousel-item')}>
                                    <CollectionItem
                                      className={cn('collection-item')}
                                      showTags={showTags}
                                      layout={layout}
                                      item={item}
                                    />
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              {items.length > 1 && <CarouselPrevious />}
                              {items.length > 1 && <CarouselNext />}
                            </Carousel>
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  }
                })}
              </React.Fragment>
            )
          }
        })}
      </React.Fragment>
    )
  }
}
