import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import PageClient from './page.client'
import { Creator, Media } from '@/payload-types'
import { cache } from 'react'
import { isMedia } from '@/utilities/isMedia'
import { CollectionCardItemProperties } from '@/components/Card'

export const dynamic = 'force-static'
export const revalidate = 600

export async function getCreatorCardItems(
  creators: Creator[],
): Promise<CollectionCardItemProperties[]> {
  return await Promise.all(
    creators.map(async (creator) => {
      const { slug, title, profileImage, status } = creator
      const credits: Pick<Media, 'id' | 'credits'>[] = await getMediaByCreatorCredits({
        creatorId: creator.id,
      })
      const roles: string[] = credits.flatMap(({ credits: c }) =>
        c ? c.map(({ role }) => role) : [],
      )
      return {
        status: status,
        tags: roles.length > 0 ? roles : null,
        image: isMedia(profileImage) ? profileImage : null,
        description: '',
        title: title,
        href: `/creators/${slug}`,
      }
    }),
  )
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  const creators: PaginatedDocs<Creator> = await payload.find({
    collection: 'creators',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      id: true,
      title: true,
      profileImage: true,
      slug: true,
      status: true,
    },
  })

  const items = await getCreatorCardItems(creators.docs)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose max-w-none dark:prose-invert">
          <h1>Creators</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="creators"
          currentPage={creators.page}
          limit={12}
          totalDocs={creators.totalDocs}
        />
      </div>

      <CollectionArchive items={items} collection={'creators'} />

      <div className="container">
        {creators.totalPages > 1 && creators.page && (
          <Pagination page={creators.page} totalPages={creators.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Creators | Michinomicon`,
  }
}

const getMediaByCreatorCredits = cache(
  async ({ creatorId }: { creatorId: string }): Promise<Pick<Media, 'id' | 'credits'>[]> => {
    const payload = await getPayload({ config: configPromise })

    const creatorMedia = await payload.find({
      collection: 'media',
      limit: 1000,
      depth: 2,
      pagination: false,
      where: {
        and: [
          {
            credits: {
              exists: true,
            },
          },
          {
            'credits.creator.id': {
              in: creatorId,
            },
          },
          {
            isForProject: {
              equals: true,
            },
          },
        ],
      },
      select: {
        credits: {
          role: true,
        },
      },
    })

    return creatorMedia.docs
  },
)
