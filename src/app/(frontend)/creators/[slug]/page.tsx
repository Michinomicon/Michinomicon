import type { Metadata } from 'next'
import type { Creator, Media } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { CMSLink } from '@/components/Link'
import { ExternalLinkIcon } from 'lucide-react'
// import { ImageGallery } from '@/components/ImageGallery'
import { Separator } from '@/components/ui/separator'
import {
  extractMediaCreditsByCreatorId,
  ProjectMediaCredit,
} from '@/utilities/extractMediaCreditsByCreatorId'
import { CreatorProjectsCreditsTable } from '@/components/CreatorProjectsCreditsTable'
import { ImageMedia } from '@/components/Media/ImageMedia'

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

type CreatorProfileSectionProps = { title: string; children?: React.ReactNode }
const CreatorProfileSection = ({
  title,
  children,
}: CreatorProfileSectionProps): React.ReactNode => {
  return (
    <div className="mb-6 flex w-full flex-col gap-4">
      <Separator></Separator>
      <div className="prose w-full">
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  )
}

type CreatorProfileLinkItemGroupProps = { links?: Creator['socialLinks'] }
const CreatorProfileLinkItemGroup = ({
  links,
}: CreatorProfileLinkItemGroupProps): React.ReactNode => {
  return (
    <ItemGroup className="flex w-full flex-row flex-wrap gap-6">
      {links &&
        links.map(({ url, platform, id }) => (
          <Item
            key={id}
            variant={'muted'}
            className={'max-w-1/4 grow max-xl:max-w-1/3 max-md:min-w-full'}
          >
            <ItemContent>
              <ItemTitle>{platform}</ItemTitle>
              <ItemDescription>{url}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <CMSLink url={url} size="icon" appearance="ghost" className="rounded-full">
                <ExternalLinkIcon className="size-4" />
              </CMSLink>
            </ItemActions>
          </Item>
        ))}
    </ItemGroup>
  )
}

type CreatorProfileHeaderProps = { creatorName: string; image: string | Media | null | undefined }
const CreatorProfileHeader = ({
  creatorName,
  image,
}: CreatorProfileHeaderProps): React.ReactNode => {
  return (
    <div className="mb-6 grid grid-cols-6 items-center gap-4">
      <div className="col-span-2 col-start-1">
        {image && typeof image === 'object' && <ImageMedia src={image} />}
      </div>
      <div className="col-span-4 col-start-3">
        <span className="prose">
          <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{creatorName}</h1>
        </span>
      </div>
    </div>
  )
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

  const { title: creatorName, profileImage, socialLinks } = creator

  return (
    <article className="article pointer-events-auto border border-primary/30 bg-background p-16 text-card-foreground">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <CreatorProfileHeader creatorName={creatorName} image={profileImage} />

      <CreatorProfileSection title={'Links'}>
        <CreatorProfileLinkItemGroup links={socialLinks} />
      </CreatorProfileSection>

      <CreatorProfileSection title={'About'}>
        {creator.description && (
          <RichText className="mx-auto" data={creator.description} enableGutter={false} />
        )}
      </CreatorProfileSection>

      <CreatorProfileSection title={'Projects'}>
        <CreatorProjectsCreditsTable data={projectCredits} />
      </CreatorProfileSection>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const creator = await queryCreatorBySlug({ slug: decodedSlug })

  return generateMeta({ doc: creator })
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
