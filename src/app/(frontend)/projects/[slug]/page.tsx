import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import RichText from '@/components/RichText'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { CollectionProfileHeader, CollectionProfileSection } from '@/components/CollectionProfile'
import {
  extractMediaCreditsByProjectId,
  ProjectMediaCreators,
} from '@/utilities/extractMediaCreditsByProjectId'
import { ProjectMediaTable } from '@/components/ProjectMediaTable'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = projects.docs
    .filter((doc) => doc.slug)
    .map(({ slug }) => {
      return { slug: String(slug) }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Project({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/projects/' + decodedSlug
  const project = await queryProjectsBySlug({ slug: decodedSlug })

  if (!project) return <PayloadRedirects url={url} />

  const { title, id, profileImage } = project

  const projectMedia: Media[] = await queryMediaByProjectId({ id: id })

  const data: ProjectMediaCreators[] = extractMediaCreditsByProjectId(projectMedia, id)

  return (
    <article className="article pointer-events-auto border border-primary/30 bg-background p-16 text-card-foreground">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <CollectionProfileHeader title={title} image={profileImage} />

      {/* //TODO: 
        Add section to display basic project stats (start, end, status etc.)
      */}

      {/* <CollectionProfileSection title={'Details'}>
        <CollectionProfileLinkItemGroup links={socialLinks} />
      </CollectionProfileSection> */}

      <CollectionProfileSection title={'About'}>
        {project.description && (
          <RichText className="mx-auto" data={project.description} enableGutter={false} />
        )}
      </CollectionProfileSection>

      <CollectionProfileSection title={'Media'}>
        <ProjectMediaTable data={data} />
      </CollectionProfileSection>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const { title } = await queryProjectsBySlug({ slug: decodedSlug })

  return {
    title: `${title} | Michinomicon`,
  }
}

const queryProjectsBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

const queryMediaByProjectId = cache(async ({ id }: { id: string }): Promise<Media[]> => {
  const payload = await getPayload({ config: configPromise })

  const projectMedia: PaginatedDocs<Media> = await payload.find({
    collection: 'media',
    limit: 1000,
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
})

export const queryProjectsById = cache(async ({ projectIds }: { projectIds: string[] }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const found = await payload.find({
    collection: 'projects',
    draft,
    limit: 1000,
    overrideAccess: draft,
    pagination: false,
    where: {
      id: {
        in: projectIds,
      },
    },
  })
  return found.docs
})
