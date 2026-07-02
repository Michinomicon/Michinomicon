import type { Metadata } from 'next'
import type { Creator, Media } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import PageClient from './page.client'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import RichText from '@/components/RichText'
import {
  extractMediaCreditsByCreatorId,
  ProjectMediaCredit,
} from '@/utilities/extractMediaCreditsByCreatorId'
import { CreatorCreditsTable } from '@/components/CreatorCreditsTable'
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
  if (!creator) return <PayloadRedirects url={url} />

  const creatorId = creator.id
  const creditedProjectMedia = await queryCreditedProjectMedia({ id: creator.id })

  const projectCredits: ProjectMediaCredit[] = extractMediaCreditsByCreatorId(
    creditedProjectMedia,
    creatorId,
  )

  return (
    <article className="article pointer-events-auto border border-primary/30 bg-background p-16 text-card-foreground">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <CollectionProfileHeader
        title={creator.title}
        image={creator.profileImage}
        statusBadgeProps={{ status: creator.status }}
      />

      <CollectionProfileSection title={'Links'}>
        {creator.content.socialLinks && creator.content.socialLinks.length > 0 && (
          <CollectionProfileLinkItemGroup links={creator.content.socialLinks} />
        )}
      </CollectionProfileSection>

      <CollectionProfileSection title={'About'}>
        {creator.content.description && (
          <RichText className="mx-auto" data={creator.content.description} enableGutter={false} />
        )}
      </CollectionProfileSection>

      <CollectionProfileSection title={'Projects'}>
        <CreatorCreditsTable data={projectCredits} />
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
    select: {
      title: true,
      status: true,
      profileImage: true,
      content: {
        socialLinks: true,
        description: true,
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
    select: {
      title: true,
      slug: true,
      status: true,
      profileImage: true,
      startDate: true,
      endDate: true,
      categories: true,
      updatedAt: true,
      createdAt: true,
      content: {
        description: true,
      },
    },
  })
  return found.docs
})
