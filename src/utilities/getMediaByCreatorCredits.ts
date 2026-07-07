import type { Media } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

async function getMediaByCreatorCredit(
  creatorId: string,
  limit: number = 1000,
  depth: number = 1,
  isForProject: boolean = true,
): Promise<Media[]> {
  const payload = await getPayload({ config: configPromise })

  const creatorMedia = await payload.find({
    collection: 'media',
    limit: limit,
    depth: depth,
    pagination: false,
    where: {
      and: [
        {
          'credits.creator.id': {
            in: creatorId,
          },
        },
        {
          isForProject: {
            equals: isForProject,
          },
        },
      ],
    },
  })

  return creatorMedia.docs
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedMediaByCreatorCredit = (
  creatorId: string,
  limit?: number,
  depth?: number,
  isForProject?: boolean,
) =>
  unstable_cache(
    async () => getMediaByCreatorCredit(creatorId, limit, depth, isForProject),
    [creatorId, String(limit), String(depth), String(isForProject)],
    {
      tags: [`${creatorId}_media-by-credit`],
    },
  )
