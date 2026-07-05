import { cn } from '@/utilities/ui'
import React from 'react'
import { CollectionCard, CollectionCardItemProperties, SupportedConfigs } from '@/components/Card'
import { ItemGroup } from '../ui/item'

export type CollectionArchivePropsItemProperties<C extends keyof SupportedConfigs> = {
  className?: string
  showTags?: boolean
  collection: C
  items: CollectionCardItemProperties[]
}

const VerticalCardsClassName = {
  Group:
    'grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8',
  Card: '',
}

const HorizontalCardsClassName = {
  Group: 'grid grid-cols-12 gap-x-4 gap-y-4 xl:grid-cols-12 xl:gap-x-8 xl:gap-y-8',
  Card: 'col-span-12 xl:col-span-6',
}

export type CollectionArchiveProps<C extends keyof SupportedConfigs> =
  CollectionArchivePropsItemProperties<C>

export function CollectionArchive<C extends keyof SupportedConfigs>({
  className,
  showTags = false,
  items,
  collection,
}: CollectionArchiveProps<C>): React.ReactNode {
  const layout: 'vertical' | 'horizontal' = 'horizontal'

  return (
    <div className={cn('flex w-full flex-col', className)}>
      <ItemGroup
        className={cn(
          layout === 'horizontal' ? HorizontalCardsClassName.Group : VerticalCardsClassName.Group,
        )}
      >
        {items.map((item, index) => (
          <CollectionCard
            key={index}
            className={cn(
              layout === 'horizontal' ? HorizontalCardsClassName.Card : VerticalCardsClassName.Card,
            )}
            layout={layout}
            item={item}
            showTags={showTags}
            collection={collection}
          />
        ))}
      </ItemGroup>
    </div>
  )
}
