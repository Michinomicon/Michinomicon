import type { Metadata } from 'next'
import type { Creator } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
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
// import { cn } from '@/lib/utils'
// import { Media } from '@/components/Media'

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

  console.debug('creators/[slug].page => ', {
    url: url,
    decodedSlug: decodedSlug,
    creator: creator,
  })

  if (!creator) return <PayloadRedirects url={url} />

  const {
    title,
    profileImage,
    socialLinks,
    //  status,publishedAt,
  } = creator

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

      <Separator></Separator>

      <div className="mb-6 flex w-full flex-col gap-4">
        <div className="w-full">
          <span className="prose">
            <h2>Links</h2>
          </span>
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

      <Separator></Separator>

      <div className="mb-6 flex w-full flex-col gap-4">
        <div className="w-full">
          <span className="prose">
            <h2>About</h2>
          </span>
        </div>

        {creator.description && (
          <RichText className="mx-auto max-w-3xl" data={creator.description} enableGutter={false} />
        )}
      </div>

      <Separator></Separator>

      <div className="flex w-full flex-col gap-4">
        {/* 
            - TODO:
            Create "Related Projects" component to display list of projects the creator has a credit for 
          */}
        <div className="w-full">
          <span className="prose">
            <h2>Projects</h2>
          </span>
        </div>
        {/* {creator.relatedPosts && creator.relatedPosts.length > 0 && (
            <RelatedPosts
              className="col-span-3 col-start-1 mt-12 max-w-208 grid-rows-[2fr] lg:grid lg:grid-cols-subgrid"
              docs={creator.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )} */}
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
