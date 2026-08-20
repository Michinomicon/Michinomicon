import type { Metadata } from 'next/types'

import { CollectionItemGroup } from '@/components/CollectionItemGroup'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import PageClient from './page.client'
import { Creator } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const pageId: string = 'creatorsCollection'
  const payload = await getPayload({ config: configPromise })
  const creators: PaginatedDocs<Creator> = await payload.find({
    collection: 'creators',
    depth: 3,
    limit: 12,
    overrideAccess: false,
    select: {
      id: true,
      title: true,
      profileImage: true,
      slug: true,
      status: true,
      content: true,
    },
  })

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

      <CollectionItemGroup id={pageId} items={creators.docs} collection={'creators'} />

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
