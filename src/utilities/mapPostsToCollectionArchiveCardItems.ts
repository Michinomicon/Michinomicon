import { CollectionCardItemProperties } from '@/components/Card'
import { Creator, Post, Project } from '@/payload-types'
import { isMedia } from './isMedia'
import { getCachedMediaByCreatorCredit } from './getMediaByCreatorCredits'

export async function mapCreatorsToCollectionArchiveCardItems<T extends Creator>(
  creators: Array<T>,
): Promise<CollectionCardItemProperties[]> {
  const items = await Promise.all(
    creators.map(async (creator) => {
      const { title, slug, status, profileImage, id } = creator
      const media = await getCachedMediaByCreatorCredit(id)()
      const tags = media
        ?.flatMap(({ credits }) => credits?.map(({ role }) => role))
        .filter((tag) => typeof tag === 'string')
      return {
        status: status || null,
        tags: tags.length > 0 ? tags : null,
        image: isMedia(profileImage) ? profileImage : null,
        description: '',
        title: title ?? '',
        href: `/creators/${slug}`,
      }
    }),
  )
  return items
}

export function mapProjectsToCollectionArchiveCardItems<T extends Project>(
  projects: Array<T>,
): CollectionCardItemProperties[] {
  return projects.map((project) => {
    const { categories, title, slug, status, profileImage } = project

    const tags: string[] = Array.isArray(categories)
      ? categories.map((cat) => (typeof cat === 'object' ? cat.title : cat))
      : []

    return {
      status: status || null,
      tags: tags.length > 0 ? tags : null,
      image: isMedia(profileImage) ? profileImage : null,
      description: '',
      title: title ?? '',
      href: `/projects/${slug}`,
    }
  })
}

export function mapPostsToCollectionArchiveCardItems<T extends Partial<Post>>(
  posts: Array<T>,
): CollectionCardItemProperties[] {
  return posts.map((post) => {
    const { categories, title, slug, meta } = post
    const { image, description } = meta ?? { image: null, description: null }

    const tags: string[] = Array.isArray(categories)
      ? categories.map((cat) => (typeof cat === 'object' ? cat.title : cat))
      : []

    return {
      status: null,
      tags: tags.length > 0 ? tags : null,
      image: isMedia(image) ? image : null,
      description: description || null,
      title: title ?? '',
      href: `/posts/${slug}`,
    }
  })
}
