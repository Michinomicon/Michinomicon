import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Creator } from '../../../payload-types'

export const revalidateCreator: CollectionAfterChangeHook<Creator> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/creators/${doc.slug}`

      payload.logger.info(`Revalidating creator at path: ${path}`)

      revalidatePath(path)
      revalidateTag('creators-sitemap', 'max')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/posts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old creator at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('creators-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateCreatorDelete: CollectionAfterDeleteHook<Creator> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/creators/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('creators-sitemap', 'max')
  }

  return doc
}
