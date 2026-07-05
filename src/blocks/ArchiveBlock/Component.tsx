import type { Post, ArchiveBlock as ArchiveBlockProps, Project, Creator } from '@/payload-types'

import configPromise from '@payload-config'
import { DataFromCollectionSlug, getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'
import { CollectionArchive } from '@/components/CollectionArchive'
import {
  mapCreatorsToCollectionArchiveCardItems,
  mapPostsToCollectionArchiveCardItems,
} from '@/utilities/mapPostsToCollectionArchiveCardItems'
import { CollectionCardItemProperties } from '@/components/Card'
import { getProjectCardItems } from '@/app/(frontend)/projects/page'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories: categoriesFromProps,
    introContent,
    limit: limitFromProps,
    relationTo,
    populateBy,
    selectedDocs,
  } = props

  const limit = limitFromProps || 3
  const categories = categoriesFromProps || []
  let archiveItems: CollectionCardItemProperties[] = []

  if (relationTo) {
    if (populateBy === 'collection') {
      const payload = await getPayload({ config: configPromise })

      const flattenedCategories: string[] = categories.map((category) => {
        if (typeof category === 'object') return category.id
        else return category
      })

      const results = await payload.find({
        collection: relationTo,
        depth: 1,
        limit,
        ...(flattenedCategories && flattenedCategories.length > 0
          ? {
              where: {
                categories: {
                  in: flattenedCategories,
                },
              },
            }
          : {}),
      })

      switch (relationTo) {
        case 'creators':
          archiveItems = await mapCreatorsToCollectionArchiveCardItems(
            results.docs as DataFromCollectionSlug<typeof relationTo>[],
          )
          break
        case 'posts':
          archiveItems = mapPostsToCollectionArchiveCardItems(
            results.docs as DataFromCollectionSlug<typeof relationTo>[],
          )
          break
        case 'projects':
          archiveItems = await getProjectCardItems(
            results.docs as DataFromCollectionSlug<typeof relationTo>[],
          )
          // archiveItems = mapProjectsToCollectionArchiveCardItems(
          //   results.docs as DataFromCollectionSlug<typeof relationTo>[],
          // )
          break
      }
    } else {
      if (selectedDocs?.length) {
        const filteredSelectedItems = selectedDocs
          .map((doc) => doc.value)
          .filter((value) => typeof value === 'object')

        switch (relationTo) {
          case 'creators':
            archiveItems = await mapCreatorsToCollectionArchiveCardItems(
              filteredSelectedItems as Creator[],
            )
            break
          case 'posts':
            archiveItems = mapPostsToCollectionArchiveCardItems(filteredSelectedItems as Post[])
            break
          case 'projects':
            archiveItems = await getProjectCardItems(filteredSelectedItems as Project[])
            // archiveItems = mapProjectsToCollectionArchiveCardItems(
            //   filteredSelectedItems as Project[],
            // )
            break
        }
      }
    }
    return (
      <div className="archive-block my-16" id={`block-${id}`}>
        {introContent && (
          <div className="container mb-16">
            <RichText className="ms-0 max-w-3xl" data={introContent} enableGutter={false} />
          </div>
        )}
        <CollectionArchive items={archiveItems} collection={relationTo} />
      </div>
    )
  }
}
