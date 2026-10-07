import { Creator, Media } from '@/payload-types'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

function getCreatorIdsFromMediaCredits(media: Media): string[] {
  const creatorIds: string[] = []

  media.credits?.reduce((creatorIds, credit) => {
    const { creator } = credit
    const creatorId = typeof creator === 'object' ? creator.id : creator
    if (!creatorIds.includes(creatorId)) {
      creatorIds.push(creatorId)
    }
    return creatorIds
  }, creatorIds)

  return creatorIds
}

async function getCreatorsByMediaCredits(
  mediaId: string,
  limit: number = 1000,
  depth: number = 6,
): Promise<Creator[]> {
  const payload = await getPayload({ config: configPromise })

  const media = await payload.findByID({
    collection: 'media',
    id: mediaId,
    depth: depth,
  })

  const creditedCreatorIds = getCreatorIdsFromMediaCredits(media)

  const creators = await payload.find({
    collection: 'creators',
    limit: limit,
    depth: depth,
    pagination: false,
    where: {
      id: {
        in: creditedCreatorIds,
      },
    },
    select: {
      title: true,
      slug: true,
      status: true,
      profileImage: true,
      content: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return creators.docs
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedCreatorsByMediaCredits = (mediaId: string, limit?: number, depth?: number) =>
  unstable_cache(
    async () => getCreatorsByMediaCredits(mediaId, limit, depth),
    [String(mediaId), String(limit), String(depth)],
    {
      tags: [`${mediaId}_media-credits-creators`],
    },
  )
