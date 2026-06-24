import { cn } from '@/utilities/ui'
import React from 'react'
import { CollectionCard, CollectionCardItemProperties, SupportedConfigs } from '@/components/Card'

export type CollectionArchiveMapFunc<
  C extends keyof SupportedConfigs,
  T extends SupportedConfigs[C] = SupportedConfigs[C],
> = (value: T, index: number, array: T[]) => CollectionCardItemProperties

export type CollectionArchivePropsMapFunc<C extends keyof SupportedConfigs> = {
  className?: string
  showTags?: boolean
  collection: C
  items: SupportedConfigs[C][]
  mapFunc: CollectionArchiveMapFunc<C>
}
export type CollectionArchivePropsItemProperties<C extends keyof SupportedConfigs> = {
  className?: string
  showTags?: boolean
  collection: C
  items: CollectionCardItemProperties[]
  mapFunc?: never
}

export type CollectionArchiveProps<C extends keyof SupportedConfigs> =
  | CollectionArchivePropsMapFunc<C>
  | CollectionArchivePropsItemProperties<C>

export function CollectionArchive<C extends keyof SupportedConfigs>({
  className,
  showTags = true,
  items: itemsFromProps,
  collection,
  mapFunc,
}: CollectionArchiveProps<C>): React.ReactNode {
  const items = mapFunc ? itemsFromProps.map(mapFunc) : itemsFromProps

  return (
    <div className={cn('container', className)}>
      <div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
          {items.map((item, index) => {
            return (
              <div className="col-span-4" key={index}>
                <CollectionCard
                  className="h-full"
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
