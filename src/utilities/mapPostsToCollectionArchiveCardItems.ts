import { CollectionCardItemProperties } from '@/components/Card'
import { Post } from '@/payload-types'
import { isMedia } from './isMedia'

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
