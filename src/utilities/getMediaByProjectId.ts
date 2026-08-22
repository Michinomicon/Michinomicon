import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { Media } from '@/payload-types'

async function getMediaByProjectId(
  projectId: string,
  limit: number = 1000,
  depth: number = 4,
): Promise<Media[]> {
  const payload = await getPayload({ config: configPromise })

  const projectMedia = await payload.find({
    collection: 'media',
    limit: limit,
    depth: depth,
    pagination: false,
    where: {
      and: [
        {
          'project.id': {
            equals: projectId,
          },
        },
        {
          isForProject: {
            equals: true,
          },
        },
      ],
    },
  })
  return projectMedia.docs
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedMediaByProjectId = (projectId: string, limit?: number, depth?: number) =>
  unstable_cache(
    async () => getMediaByProjectId(projectId, limit, depth),
    [projectId, String(limit), String(depth)],
    {
      tags: [`${projectId}_media`],
    },
  )
