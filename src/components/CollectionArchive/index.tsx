import { cn } from '@/utilities/ui'
import React from 'react'

import {
  CollectionCard,
  CollectionCardProps,
  CreatorItem,
  PostItem,
  ProjectItem,
} from '@/components/Card'

type BaseProps = {
  relationTo: 'posts' | 'projects' | 'creators'
  items: PostItem[] | ProjectItem[] | CreatorItem[]
}
interface PostItemProps extends BaseProps {
  relationTo: 'posts'
  items: PostItem[]
}
interface ProjectItemProps extends BaseProps {
  relationTo: 'projects'
  items: ProjectItem[]
}
interface CreatorItemProps extends BaseProps {
  relationTo: 'creators'
  items: CreatorItem[]
}
type CollectionArchiveItemProps = PostItemProps | ProjectItemProps | CreatorItemProps

type CollectionArchiveProps = { showRelated?: boolean } & CollectionArchiveItemProps

export function CollectionArchive({
  showRelated,
  items,
  relationTo,
}: CollectionArchiveProps): React.JSX.Element {
  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
          {items.map((item, index) => {
            return (
              <div className="col-span-4" key={index}>
                <CollectionCard
                  className="h-full"
                  {...({
                    item: item,
                    relationTo: relationTo,
                    showRelated: showRelated,
                  } as CollectionCardProps)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
