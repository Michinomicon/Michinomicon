import type { Metadata } from 'next/types'

import { CollectionItemGroup } from '@/components/CollectionItemGroup'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const creators = await payload.find({
    collection: 'creators',
    depth: 3,
    limit: 12,
    page: sanitizedPageNumber,
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

      <CollectionItemGroup items={creators.docs} collection={'creators'} />

      <div className="container">
        {creators?.page && creators?.totalPages > 1 && (
          <Pagination page={creators.page} totalPages={creators.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Creators Page ${pageNumber || ''} | Michinomicon `,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'creators',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
