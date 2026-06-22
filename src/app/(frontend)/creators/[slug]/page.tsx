import type { Metadata } from 'next'
import type { Creator, Media } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, PaginatedDocs } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
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
import { LightGalleryComponent } from '@/components/LightGallery'
import { Separator } from '@/components/ui/separator'
import {
  extractMediaCreditsByCreatorId,
  ProjectMediaCredit,
} from '@/utilities/extractMediaCreditsByCreatorId'
import { CreatorProjectsCreditsTable } from '@/components/CreatorProjectsCreditsTable'

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

  const { title, profileImage, socialLinks } = creator

  return (
    <article className="article pointer-events-auto border border-primary/30 bg-background p-16 text-card-foreground">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="mb-6 grid grid-cols-6 items-center gap-4">
        <div className="col-span-2 col-start-1">
          {profileImage && typeof profileImage === 'object' && (
            <LightGalleryComponent items={[profileImage]} />
          )}
        </div>
        <div className="col-span-4 col-start-3">
          <span className="prose">
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          </span>
        </div>
      </div>

      <div className="mb-6 flex w-full flex-col gap-4">
        <Separator></Separator>
        <div className="prose w-full">
          <h2>Links</h2>
        </div>
        {Array.isArray(socialLinks) && socialLinks.length > 0 && (
          <ItemGroup className="flex w-full flex-row flex-wrap gap-6">
            {socialLinks.map(({ url, platform, id }) => (
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
        )}
      </div>

      <div className="mb-6 flex w-full flex-col gap-4">
        <Separator></Separator>
        <div className="prose w-full">
          <h2>About</h2>
        </div>

        {creator.description && (
          <RichText className="mx-auto" data={creator.description} enableGutter={false} />
        )}
      </div>

      <div className="mb-6 flex w-full flex-col gap-4">
        <Separator></Separator>
        <div className="prose w-full">
          <h2>Projects</h2>
        </div>
        <CreatorProjectsCreditsTable data={projectCredits} />
      </div>
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

// const queryProjectsById = cache(async ({ id }: { id: string }) => {
//   const { isEnabled: draft } = await draftMode()

//   const payload = await getPayload({ config: configPromise })

//   const found = await payload.find({
//     collection: 'projects',
//     draft,
//     limit: 1000,
//     overrideAccess: draft,
//     pagination: false,
//     select: {
//       title: true,
//       id:true
//     },
//   })

//   if(found.docs.length > 0){
//     return found.docs[0]
//   }

//   return null
// })
