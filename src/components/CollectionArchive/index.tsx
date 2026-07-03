import { cn } from '@/utilities/ui'
import React from 'react'
import { CollectionCard, CollectionCardItemProperties, SupportedConfigs } from '@/components/Card'

export type CollectionArchivePropsItemProperties<C extends keyof SupportedConfigs> = {
  className?: string
  showTags?: boolean
  collection: C
  items: CollectionCardItemProperties[]
}

const VerticalClassName =
  'grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8'

const HorizontalClassName =
  'grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8'

export type CollectionArchiveProps<C extends keyof SupportedConfigs> =
  CollectionArchivePropsItemProperties<C>

export function CollectionArchive<C extends keyof SupportedConfigs>({
  className,
  showTags = true,
  items,
  collection,
}: CollectionArchiveProps<C>): React.ReactNode {
  const layout: 'vertical' | 'horizontal' = 'horizontal'

  return (
    <div
      className={cn(
        // 'container'
        '',
        className,
      )}
    >
      <div>
        <div
          className={cn(
            'grid grid-cols-4 gap-x-4 gap-y-4',
            'xl:gap-x-8',
            'lg:grid-cols-8 lg:gap-x-8 lg:gap-y-8',
          )}
        >
          {items.map((item, index) => {
            return (
              <div className="col-span-4" key={index}>
                <CollectionCard
                  className="h-full"
                  layout={layout}
                  item={item}
                  showTags={showTags}
                  collection={collection}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
