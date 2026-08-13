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

export interface CollectionItemClientGroupProps {
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
  items,
  className,
  layout,
  cardStyle: cardStyleFromProps,
}: CollectionItemClientGroupProps) {
  const isMobile = useIsMobile()
  const carouselScrollDirection: 'vertical' | 'horizontal' = 'horizontal'
  const alignment: CarouselOptions['align'] = 'center'
  const carouselOptions: Partial<CarouselOptions> = {
    loop: true,
    align: alignment,
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
  let defaultGirdLayout: GridCardStyleName = 'list'

  if (isMobile) {
    layout = 'grid'
    defaultGirdLayout = 'compact-list'
    cardStyleFromProps = getGridCardStyle('compact-list')
  } else if (layout === 'grid' && !cardStyleFromProps) {
    cardStyleFromProps = getGridCardStyle(defaultGirdLayout)
  }

  const intialCardStyle: CollectionItemCardStyle =
    cardStyleFromProps || getGridCardStyle(defaultGirdLayout)

  const [cardStyle, setCardStyle] = useState<CollectionItemCardStyle>(intialCardStyle)

  if (layout === 'grid') {
    console.debug(`isMobile: `, isMobile)
    console.debug(`defaultGirdLayout: `, defaultGirdLayout)
    console.debug(`cardStyleFromProps: `, cardStyleFromProps)
    console.debug(`cardStyle: `, cardStyle)

    return (
      <React.Fragment>
        <div className="relative mx-auto mb-2 flex w-full flex-col items-center justify-center">
          {!isMobile && (
            <GridLayoutToolbar value={defaultGirdLayout} onValueChange={setCardStyle} />
          )}
          <ItemGroup
            direction={'row'}
            className={cn(
              className,
              'collection-grid w-full justify-center gap-4',
              GridVariant(cardStyle),
            )}
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
      </React.Fragment>
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
