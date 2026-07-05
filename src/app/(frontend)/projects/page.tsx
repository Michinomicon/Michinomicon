import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import PageClient from './page.client'
import { Media, Project } from '@/payload-types'
import { CollectionCardItemProperties } from '@/components/Card'
import { CollectionArchive } from '@/components/CollectionArchive'
import { formatDateTime } from '@/utilities/formatDateTime'
import { isMedia } from '@/utilities/isMedia'

export const dynamic = 'force-static'
export const revalidate = 600

const queryMediaByProjectId = async ({ id }: { id: string }) => {
  const payload = await getPayload({ config: configPromise })

  const projectMedia: PaginatedDocs<Media> = await payload.find({
    collection: 'media',
    limit: 1000,
    depth: 3,
    where: {
      and: [
        {
          'project.id': {
            equals: id,
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

export async function projectToCollectionArchiveCardItems(
  project: Project,
): Promise<CollectionCardItemProperties> {
  const { slug, title, startDate, endDate, profileImage, status, categories, id } = project

  const coverImage = isMedia(profileImage) ? profileImage : null

  const projectMedia: Media[] = await queryMediaByProjectId({ id })

  const images = projectMedia.length > 0 ? projectMedia : coverImage ? [coverImage] : null

  const tags = categories?.map((cat) => (typeof cat === 'object' ? cat.title : cat)) ?? []

  const item = {
    status: status,
    tags: tags,
    images: images,
    description: `${formatDateTime(startDate || '')}${' - ' + (endDate ? formatDateTime(endDate) : 'Ongoing')}`,
    title: title,
    href: `/projects/${slug}`,
  }

  console.debug(`project item "${title}" `, images)

  return item
}

export async function getProjectCardItems(
  projects: Project[],
): Promise<CollectionCardItemProperties[]> {
  return await Promise.all(
    projects.map(async (project) => {
      const projectItem = await projectToCollectionArchiveCardItems(project)
      return projectItem
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
