'use client'

import React, { useState } from 'react'
import { cn } from '@/utilities/ui'
import { CollectionItemCard, CollectionItemProperties } from '@/components/CollectionItemCard'
import { ItemGroup } from '@/components/ui/item'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselOptions,
} from '../ui/carousel'
import { GridVariant } from './gridLayoutStyles'
import { CarouselVariant } from './carouselLayoutStyles'
import { getGridCardStyle, GridCardStyleName, GridLayoutToolbar } from './GridLayoutToolbar'
import { CollectionItemCardStyle, CollectionTypes } from '.'
import { Separator } from '../ui/separator'
import { VariantProps } from 'class-variance-authority'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLocalStorage } from '@/providers/LocalStorageProvider'
import { StorageData } from '@/lib/storage-utils'

function initialiseLayoutAndStyle(
  storageData: StorageData | null,
  isMobile: boolean,
  layout: CollectionItemClientGroupProps['layout'],
  initialCardStyle?: CollectionItemClientGroupProps['cardStyle'],
) {
  let gridStyle: GridCardStyleName =
    storageData &&
    typeof storageData === `object` &&
    !Array.isArray(storageData) &&
    Object.hasOwn(storageData, 'gridStyle')
      ? (storageData['gridStyle'] as GridCardStyleName)
      : 'list'

  let cardStyle: CollectionItemCardStyle = initialCardStyle || getGridCardStyle(gridStyle)

  if (isMobile) {
    layout = 'grid'
    gridStyle = 'compact-list'
    cardStyle = getGridCardStyle('compact-list')
  } else if (layout === 'grid' && !cardStyle) {
    cardStyle = getGridCardStyle(gridStyle)
  }

  return {
    grid: gridStyle,
    card: cardStyle,
  }
}

export interface CollectionItemClientGroupProps {
  id: string
  items: CollectionItemProperties<keyof CollectionTypes>[]
  className?: string
  layout: 'carousel' | 'grid'
  cardStyle?: CollectionItemCardStyle
}

const _defaultCardStyle: CollectionItemCardStyle = {
  showTags: false,
  showDescription: true,
  showImages: true,
  width: 'md',
  height: 'md',
  layout: 'horizontal',
}

export function CollectionItemClientGroup({
  id,
  items,
  className,
  layout,
  cardStyle: cardStyleFromProps,
}: CollectionItemClientGroupProps & React.ComponentPropsWithoutRef<'div'>): React.ReactNode {
  const isMobile = useIsMobile()
  const { setLocalStorage, getLocalStorage, isHydrated } = useLocalStorage()
  const carouselScrollDirection: 'vertical' | 'horizontal' = 'horizontal'
  const alignment: CarouselOptions['align'] = 'center'
  const carouselOptions: Partial<CarouselOptions> = {
    loop: true,
    align: alignment,
  }

  const storedPageFeatures = getLocalStorage(`${id}`)
  const { grid: initialGridStyle, card: initialCardStyle } = initialiseLayoutAndStyle(
    storedPageFeatures,
    isMobile,
    layout,
    cardStyleFromProps,
  )

  const [cardStyle, setCardStyle] = useState<CollectionItemCardStyle>(initialCardStyle)

  if (!isHydrated) {
    return <></>
  }

  const onCardStyleChange = ([gridStyle, cardStyle]: [
    GridCardStyleName,
    CollectionItemCardStyle,
  ]) => {
    setCardStyle(cardStyle)
    setLocalStorage(`${id}.gridStyle`, gridStyle)
  }

  if (layout === 'grid') {
    return (
      <div className="relative mx-auto mb-2 flex w-full flex-col items-center justify-center">
        {!isMobile && (
          <GridLayoutToolbar value={initialGridStyle} onValueChange={onCardStyleChange} />
        )}
        <ItemGroup
          direction={'row'}
          className={cn(className, 'collection-grid', GridVariant(cardStyle))}
        >
          {items?.map((item, index) => (
            <CollectionItemCard
              key={index}
              className={cn('collection-grid-item', '')}
              showTags={false}
              showDescription={cardStyle?.showDescription}
              showImages={cardStyle?.showImages}
              layout={cardStyle?.layout}
              item={item}
            />
          ))}
        </ItemGroup>
      </div>
    )
  } else {
    return (
      <div className="mx-auto mb-2">
        <div className={cn('flex w-full flex-col items-center justify-center gap-y-2')}>
          <Carousel
            orientation={carouselScrollDirection}
            opts={carouselOptions}
            className={cn('carousel', CarouselVariant(cardStyle))}
          >
            <CarouselContent className={cn('carousel-content', 'my-2')}>
              {items?.map((item, index) => (
                <CarouselItem key={index} className={cn('carousel-item', '')}>
                  <CollectionItemCard
                    className={cn('collection-item')}
                    showTags={cardStyle?.showTags}
                    showDescription={cardStyle?.showDescription}
                    showImages={cardStyle?.showImages}
                    layout={cardStyle?.layout}
                    item={item}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {items?.length > 1 && <CarouselPrevious />}
            {items?.length > 1 && <CarouselNext />}
          </Carousel>
        </div>
      </div>
    )
  }
}

export function gridDemo(
  className: string | undefined,
  cardStyle: CollectionItemCardStyle,
  items: CollectionItemProperties<keyof CollectionTypes>[],
) {
  const TestSizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg']
  const TextLayouts: VariantProps<typeof GridVariant>['layout'][] = ['vertical', 'horizontal']
  return (
    <React.Fragment>
      {TextLayouts.map((layout, index) => {
        if (layout) {
          return (
            <React.Fragment key={`${index}-${layout}`}>
              {TestSizes.map((width, _index) => {
                return TestSizes.map((height, index) => {
                  console.debug(`layout: ${layout} width: ${width} height: ${height}`)
                  return (
                    <React.Fragment key={`${index}-${layout}-${width}-${height}`}>
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
                      <div className="mx-auto mb-2 flex w-full flex-col items-center justify-center">
                        <ItemGroup
                          direction={'row'}
                          className={cn(
                            className,
                            'collection-grid w-full justify-center gap-4',
                            GridVariant({ layout: layout, height: height, width: width }),
                          )}
                        >
                          {items?.map((item, index) => (
                            <CollectionItemCard
                              key={index}
                              className={cn('collection-grid-item', '')}
                              showTags={cardStyle.showTags}
                              showDescription={cardStyle.showDescription}
                              showImages={cardStyle.showImages}
                              layout={layout}
                              item={item}
                            />
                          ))}
                        </ItemGroup>
                      </div>
                    </React.Fragment>
                  )
                })
              })}
            </React.Fragment>
          )
        }
      })}
    </React.Fragment>
  )
}

export function carouselDemo(
  className: string | undefined,
  carouselOptions: Partial<CarouselOptions>,
  cardStyle: CollectionItemCardStyle,
  items: CollectionItemProperties<keyof CollectionTypes>[],
) {
  const TestCarouselSizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg']
  const TextLayouts: VariantProps<typeof CarouselVariant>['layout'][] = ['vertical', 'horizontal']
  return (
    <React.Fragment>
      {TextLayouts.map((layout, index) => {
        if (layout) {
          return (
            <React.Fragment key={`${index}-${layout}`}>
              {TestCarouselSizes.map((width, _index) => {
                return TestCarouselSizes.map((height, index) => {
                  console.debug(`layout: ${layout} width: ${width} height: ${height}`, className)
                  return (
                    <React.Fragment key={`${index}-${layout}-${width}-${height}`}>
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
                          className={cn('flex w-full flex-col items-center justify-center gap-y-2')}
                        >
                          <Carousel
                            orientation={'horizontal'}
                            opts={carouselOptions}
                            className={cn(
                              'carousel',
                              CarouselVariant({
                                layout: layout,
                                width: width,
                                height: height,
                              }),
                            )}
                          >
                            <CarouselContent className={cn('carousel-content', 'my-2')}>
                              {items?.map((item, index) => (
                                <CarouselItem key={index} className={cn('carousel-item')}>
                                  <CollectionItemCard
                                    className={cn('collection-item')}
                                    showDescription={cardStyle.showDescription}
                                    showImages={cardStyle.showImages}
                                    showTags={cardStyle.showTags}
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
                })
              })}
            </React.Fragment>
          )
        }
      })}
    </React.Fragment>
  )
}
