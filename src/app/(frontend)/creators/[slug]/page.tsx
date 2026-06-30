import type { Metadata } from 'next'
import type { Creator, Media } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import RichText from '@/components/RichText'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import {
  extractMediaCreditsByCreatorId,
  ProjectMediaCredit,
} from '@/utilities/extractMediaCreditsByCreatorId'
import { CreatorProjectsCreditsTable } from '@/components/CreatorProjectsCreditsTable'
import {
  CollectionProfileHeader,
  CollectionProfileLinkItemGroup,
  CollectionProfileSection,
} from '@/components/CollectionProfile'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const creators = await payload.find({
    collection: 'creators',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = creators.docs
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

export default async function Creator({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/creators/' + decodedSlug
  const creator = await queryCreatorBySlug({ slug: decodedSlug })

  const creatorId = creator.id

  const creditedProjectMedia = await queryCreditedProjectMedia({ id: creator.id })

  const projectCredits: ProjectMediaCredit[] = extractMediaCreditsByCreatorId(
    creditedProjectMedia,
    creatorId,
  )

  if (!creator) return <PayloadRedirects url={url} />

  const { title: creatorName, profileImage, socialLinks, status } = creator

  return (
    <article className="article pointer-events-auto border border-primary/30 bg-background p-16 text-card-foreground">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <CollectionProfileHeader
        title={creatorName}
        image={profileImage}
        statusBadgeProps={{ status: status }}
      />

      <CollectionProfileSection title={'Links'}>
        <CollectionProfileLinkItemGroup links={socialLinks} />
      </CollectionProfileSection>

      <CollectionProfileSection title={'About'}>
        {creator.description && (
          <RichText className="mx-auto" data={creator.description} enableGutter={false} />
        )}
      </CollectionProfileSection>

      <CollectionProfileSection title={'Projects'}>
        <CreatorProjectsCreditsTable data={projectCredits} />
      </CollectionProfileSection>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const { title } = await queryCreatorBySlug({ slug: decodedSlug })

  return {
    title: `${title} | Michinomicon`,
  }
}

const queryCreatorBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'creators',
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

const queryCreditedProjectMedia = cache(async ({ id }: { id: string }): Promise<Media[]> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const creatorMedia: PaginatedDocs<Media> = await payload.find({
    collection: 'media',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          'credits.creator': {
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

  return creatorMedia.docs
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
