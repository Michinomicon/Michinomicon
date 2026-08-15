import { CollectionItemProperties } from '@/components/CollectionItemCard'
import { Category, Creator, Page, Post, Project } from '@/payload-types'
import { isMedia } from './isMedia'
import { getCachedMediaByCreatorCredit } from './getMediaByCreatorCredits'
import { getCachedMediaByProjectId } from './getMediaByProjectId'
import { DataFromCollectionSlug, getPayload, PaginatedDocs } from 'payload'
import configPromise from '@payload-config'
import {
  CollectionItemGroupPopulateByCollection,
  CollectionItemGroupPopulateBySelection,
  CollectionItemGroupProperties,
  CollectionTypes,
} from '@/components/CollectionItemGroup'
import {
  extractMediaCreditsByProjectId,
  ProjectMediaCreators,
} from './extractMediaCreditsByProjectId'

async function creatorToCollectionItemProperties(
  creator: Creator,
): Promise<CollectionItemProperties<'creators'>> {
  const { title, slug, status, profileImage, id, content } = creator
  const coverImage = isMedia(profileImage) ? profileImage : null
  const creatorMedia = await getCachedMediaByCreatorCredit(id)()
  const tags = creatorMedia
    ?.flatMap(({ credits }) => credits?.map(({ role }) => role))
    .filter((tag) => typeof tag === 'string')
  const { description } = content
  return {
    collection: 'creators',
    status: status || null,
    related: null,
    tags: tags.length > 0 ? tags : null,
    image: coverImage,
    description: description,
    title: title,
    href: `/creators/${slug}`,
  }
}

async function projectToCollectionItemProperties(
  project: Project,
): Promise<CollectionItemProperties<'projects'>> {
  const { slug, title, profileImage, status, categories, id, content } = project
  const { description } = content
  const coverImage = isMedia(profileImage) ? profileImage : null
  const projectMedia = await getCachedMediaByProjectId(id)()
  const projectCreators: Creator[] = extractMediaCreditsByProjectId(projectMedia, id).flatMap<
    Creator,
    ProjectMediaCreators
  >(({ credits }) => credits.map<Creator>(({ creator }) => creator))
  const creditTags = projectMedia
    ?.flatMap(({ credits }) =>
      credits?.map(({ creator }) => (typeof creator === 'object' ? creator.title : creator)),
    )
    .filter((creator) => typeof creator === 'string')
  const categoryTags = categories?.map((cat) => (typeof cat === 'object' ? cat.title : cat)) ?? []
  /**
   * TODO:
   * - Update project collection items to include creator credit avatar groups (see project page summary table for example implementation)
   *
   * */

  const useCategoryTags = true
  return {
    collection: 'projects',
    status: status,
    related: projectCreators,
    tags: useCategoryTags ? categoryTags : creditTags,
    image: coverImage,
    description: description,
    title: title,
    href: `/projects/${slug}`,
  }
}

export async function postToCollectionItemProperties(
  post: Post,
): Promise<CollectionItemProperties<'posts'>> {
  const { categories, title, slug, meta } = post
  const { image, description } = meta ?? { image: null, description: null }
  const tags: string[] = Array.isArray(categories)
    ? categories.map((cat) => (typeof cat === 'object' ? cat.title : cat))
    : []
  return {
    collection: 'posts',
    status: null,
    related: null,
    tags: tags.length > 0 ? tags : null,
    image: isMedia(image) ? image : null,
    description: description,
    title: title,
    href: `/posts/${slug}`,
  }
}

export async function pageToCollectionItemProperties(
  page: Page,
): Promise<CollectionItemProperties<'pages'>> {
  const { parentCategory, title, slug, meta } = page
  const { image, description } = meta ?? { image: null, description: null }
  const pageCategory: string | null = parentCategory
    ? typeof parentCategory === 'object'
      ? parentCategory.title
      : parentCategory
    : null
  return {
    collection: 'pages',
    status: null,
    related: null,
    tags: pageCategory ? [pageCategory] : null,
    image: isMedia(image) ? image : null,
    description: description,
    title: title,
    href: `/${slug}`,
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
  | ((creator: Creator) => Promise<CollectionItemProperties<'creators'>>)
  | ((post: Post) => Promise<CollectionItemProperties<'posts'>>)
  | ((page: Page) => Promise<CollectionItemProperties<'pages'>>)
  | ((project: Project) => Promise<CollectionItemProperties<'projects'>>) {
  switch (collection) {
    case 'pages':
      return pageToCollectionItemProperties
    case 'creators':
      return creatorToCollectionItemProperties
    case 'posts':
      return postToCollectionItemProperties
    case 'projects':
      return projectToCollectionItemProperties
  }
}

async function getCollectionArchiveItemsByCollection<T extends keyof CollectionTypes>(
  props: CollectionItemGroupPopulateByCollection<T>,
): Promise<
  | CollectionItemProperties<'pages'>[]
  | CollectionItemProperties<'creators'>[]
  | CollectionItemProperties<'posts'>[]
  | CollectionItemProperties<'projects'>[]
> {
  const { collection, limit, categories } = props
  switch (collection) {
    case 'pages':
      const pageDocs = await getDocuments<'pages'>(collection, limit, categories)
      return Promise.all(pageDocs.map(pageToCollectionItemProperties))
    case 'creators':
      const creatorDocs = await getDocuments<'creators'>(collection, limit, categories)
      return Promise.all(creatorDocs.map(creatorToCollectionItemProperties))
    case 'posts':
      const postDocs = await getDocuments<'posts'>(collection, limit, categories)
      return Promise.all(postDocs.map(postToCollectionItemProperties))
    case 'projects':
      const projectDocs = await getDocuments<'projects'>(collection, limit, categories)
      return Promise.all(projectDocs.map(projectToCollectionItemProperties))
  }
}

async function getCardPropertiesBySelection(
  props: CollectionItemGroupPopulateBySelection,
): Promise<CollectionItemProperties<keyof CollectionTypes>[]> {
  const { items } = props

  const selectionsWithValues: Array<Promise<CollectionItemProperties<keyof CollectionTypes>>> = []

  if (items) {
    items.reduce((results, selection) => {
      const { relationTo, value } = selection
      if (typeof value === 'object') {
        switch (relationTo) {
          case 'pages':
            results.push(pageToCollectionItemProperties(value))
            break
          case 'creators':
            results.push(creatorToCollectionItemProperties(value))
            break
          case 'posts':
            results.push(postToCollectionItemProperties(value))
            break
          case 'projects':
            results.push(projectToCollectionItemProperties(value))
            break
        }
      }
      return results
    }, selectionsWithValues)
  }
  return Promise.all(selectionsWithValues)
}

export async function getCollectionItemProperties(
  props: CollectionItemGroupProperties<keyof CollectionTypes>,
) {
  let cardProps: CollectionItemProperties<keyof CollectionTypes>[] = []
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
      case 'pages':
        cardProps = await Promise.all(items.map(pageToCollectionItemProperties))
        break
      case 'creators':
        cardProps = await Promise.all(items.map(creatorToCollectionItemProperties))
        break
      case 'posts':
        cardProps = await Promise.all(items.map(postToCollectionItemProperties))
        break
      case 'projects':
        cardProps = await Promise.all(items.map(projectToCollectionItemProperties))
        break
    }
  } else if (props.items && props.items.length > 0) {
    cardProps = props.items
  }
  return cardProps
}
