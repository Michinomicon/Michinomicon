import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import PageClient from './page.client'
import { Project } from '@/payload-types'
import { CollectionCardItemProperties } from '@/components/Card'
import { CollectionArchive } from '@/components/CollectionArchive'
import { formatDateTime } from '@/utilities/formatDateTime'
import { isMedia } from '@/utilities/isMedia'

export const dynamic = 'force-static'
export const revalidate = 600

export async function getProjectCardItems(
  projects: Project[],
): Promise<CollectionCardItemProperties[]> {
  return await Promise.all(
    projects.map(async (project) => {
      const { slug, title, startDate, endDate, profileImage, status, categories } = project

      const tags = categories?.map((cat) => (typeof cat === 'object' ? cat.title : cat)) ?? []

      return {
        status: status,
        tags: tags,
        image: isMedia(profileImage) ? profileImage : null,
        description: `${formatDateTime(startDate || '')}${' - ' + (endDate ? formatDateTime(endDate) : 'Ongoing')}`,
        title: title,
        href: `/projects/${slug}`,
      }
    }),
  )
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  const projects: PaginatedDocs<Project> = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 12,
    overrideAccess: false,
  })

  const items = await getProjectCardItems(projects.docs)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose max-w-none dark:prose-invert">
          <h1>Projects</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="projects"
          currentPage={projects.page}
          limit={12}
          totalDocs={projects.totalDocs}
        />
      </div>

      <CollectionArchive items={items} collection={'projects'} />

      <div className="container">
        {projects.totalPages > 1 && projects.page && (
          <Pagination page={projects.page} totalPages={projects.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Projects | Michinomicon`,
  }
}
