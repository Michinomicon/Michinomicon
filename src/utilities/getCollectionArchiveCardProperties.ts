import { CollectionCardItemProperties } from '@/components/CollectionArchiveCard'
import { Category, Creator, Post, Project } from '@/payload-types'
import { isMedia } from './isMedia'
import { getCachedMediaByCreatorCredit } from './getMediaByCreatorCredits'
import { getCachedMediaByProjectId } from './getMediaByProjectId'
import { DataFromCollectionSlug, getPayload, PaginatedDocs } from 'payload'
import configPromise from '@payload-config'
import {
  CollectionArchiveItemsByCollectionProps,
  CollectionArchiveItemsBySelectionProps,
  CollectionArchiveItemsProps,
  CollectionTypes,
} from '@/components/CollectionArchive'

async function creatorToCollectionCardItemProperties(
  creator: Creator,
): Promise<CollectionCardItemProperties<'creators'>> {
  const { title, slug, status, profileImage, id, content } = creator
  const coverImage = isMedia(profileImage) ? profileImage : null
  const creatorMedia = await getCachedMediaByCreatorCredit(id)()
  const images = creatorMedia.length > 0 ? creatorMedia : coverImage ? [coverImage] : null
  const tags = creatorMedia
    ?.flatMap(({ credits }) => credits?.map(({ role }) => role))
    .filter((tag) => typeof tag === 'string')
  const { description } = content
  return {
    collection: 'creators',
    status: status || null,
    tags: tags.length > 0 ? tags : null,
    images: images,
    description: description,
    title: title,
    href: `/creators/${slug}`,
  }
}

async function projectToCollectionCardItemProperties(
  project: Project,
): Promise<CollectionCardItemProperties<'projects'>> {
  const { slug, title, profileImage, status, categories, id, content } = project
  const { description } = content
  const coverImage = isMedia(profileImage) ? profileImage : null
  const projectMedia = await getCachedMediaByProjectId(id)()
  const images = projectMedia.length > 0 ? projectMedia : coverImage ? [coverImage] : null
  const tags = categories?.map((cat) => (typeof cat === 'object' ? cat.title : cat)) ?? []
  return {
    collection: 'projects',
    status: status,
    tags: tags,
    images: images,
    description: description,
    title: title,
    href: `/projects/${slug}`,
  }
}

export async function postToCollectionCardItemProperties(
  post: Post,
): Promise<CollectionCardItemProperties<'posts'>> {
  const { categories, title, slug, meta } = post
  const { image, description } = meta ?? { image: null, description: null }
  const tags: string[] = Array.isArray(categories)
    ? categories.map((cat) => (typeof cat === 'object' ? cat.title : cat))
    : []
  return {
    collection: 'posts',
    status: null,
    tags: tags.length > 0 ? tags : null,
    images: isMedia(image) ? [image] : null,
    description: description,
    title: title,
    href: `/posts/${slug}`,
  }
}

async function getDocuments<T extends keyof CollectionTypes>(
  collection: T,
  limit?: number | null | undefined,
  categories?: (string | Category)[] | null | undefined,
) {
  const payload = await getPayload({ config: configPromise })

  const flattenedCategories = categories?.map((category) => {
    if (typeof category === 'object') return category.id
    else return category
  })

  const results: PaginatedDocs<DataFromCollectionSlug<T>> = await payload.find({
    collection: collection,
    depth: 3,
    limit: limit || 10,
    pagination: false,
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

  const docs: DataFromCollectionSlug<T>[] = results.docs
  return docs
}

export function getCollectionArchiveCardItemPropsMapFunc<T extends keyof CollectionTypes>(
  collection: T,
):
  | ((creator: Creator) => Promise<CollectionCardItemProperties<'creators'>>)
  | ((post: Post) => Promise<CollectionCardItemProperties<'posts'>>)
  | ((project: Project) => Promise<CollectionCardItemProperties<'projects'>>) {
  switch (collection) {
    case 'creators':
      return creatorToCollectionCardItemProperties
    case 'posts':
      return postToCollectionCardItemProperties
    case 'projects':
      return projectToCollectionCardItemProperties
  }
}

async function getCollectionArchiveItemsByCollection<T extends keyof CollectionTypes>(
  props: CollectionArchiveItemsByCollectionProps<T>,
): Promise<
  | CollectionCardItemProperties<'creators'>[]
  | CollectionCardItemProperties<'posts'>[]
  | CollectionCardItemProperties<'projects'>[]
> {
  const { collection, limit, categories } = props
  switch (collection) {
    case 'creators':
      const creatorDocs = await getDocuments<'creators'>(collection, limit, categories)
      return Promise.all(creatorDocs.map(creatorToCollectionCardItemProperties))
    case 'posts':
      const postDocs = await getDocuments<'posts'>(collection, limit, categories)
      return Promise.all(postDocs.map(postToCollectionCardItemProperties))
    case 'projects':
      const projectDocs = await getDocuments<'projects'>(collection, limit, categories)
      return Promise.all(projectDocs.map(projectToCollectionCardItemProperties))
  }
}

async function getCardPropertiesBySelection(
  props: CollectionArchiveItemsBySelectionProps,
): Promise<CollectionCardItemProperties<keyof CollectionTypes>[]> {
  const { items } = props

  const selectionsWithValues: Array<Promise<CollectionCardItemProperties<keyof CollectionTypes>>> =
    []

  if (items) {
    items.reduce((results, selection) => {
      const { relationTo, value } = selection
      if (typeof value === 'object') {
        switch (relationTo) {
          case 'creators':
            results.push(creatorToCollectionCardItemProperties(value))
            break
          case 'posts':
            results.push(postToCollectionCardItemProperties(value))
            break
          case 'projects':
            results.push(projectToCollectionCardItemProperties(value))
            break
        }
      }
      return results
    }, selectionsWithValues)
  }
  return Promise.all(selectionsWithValues)
}

export async function getCollectionArchiveCardProperties(
  props: CollectionArchiveItemsProps<keyof CollectionTypes>,
) {
  let cardProps: CollectionCardItemProperties<keyof CollectionTypes>[] = []
  const { populateBy } = props
  if (populateBy) {
    if (populateBy === 'collection') {
      cardProps = await getCollectionArchiveItemsByCollection(props)
    } else if (populateBy === 'selection') {
      cardProps = await getCardPropertiesBySelection(props)
    }
  } else if (props.collection) {
    const { collection, items } = props
    switch (collection) {
      case 'creators':
        cardProps = await Promise.all(items.map(creatorToCollectionCardItemProperties))
        break
      case 'posts':
        cardProps = await Promise.all(items.map(postToCollectionCardItemProperties))
        break
      case 'projects':
        cardProps = await Promise.all(items.map(projectToCollectionCardItemProperties))
        break
    }
  } else {
    cardProps = props.items
  }
  return cardProps
}
