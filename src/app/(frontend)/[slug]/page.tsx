import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
// import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ButtonGroup } from '@/components/ui/button-group'
import { PageTableOfContentsTrigger } from '@/components/PageTableOfContents'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  // const page: RequiredDataFromCollectionSlug<'pages'> | null

  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  // Remove this code once your website is seeded
  // if (!page && slug === 'home') {
  //   page = homeStatic
  // }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout, id } = page

  return (
    <React.Fragment>
      <article
        id={id}
        className="article-page relative min-h-screen w-full border-primary/30 bg-card px-6 pt-16 pb-12 md:mx-auto md:min-h-max md:w-auto md:border md:bg-background md:pt-6"
      >
        <PageClient />
        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <div className="article-toolbar hidden w-full flex-nowrap justify-end md:flex">
          <ButtonGroup aria-label="Article Controls">
            <PageTableOfContentsTrigger size="icon" aria-label="Show Table of Contents" />
          </ButtonGroup>
        </div>

        <div className="mobile-article-title flex w-full flex-nowrap justify-center md:hidden">
          <span className="text-5xl text-card-foreground underline decoration-card-foreground/40 decoration-1">
            {page.title}
          </span>
        </div>

        <RenderHero {...hero} />

        <RenderBlocks blocks={layout} />
      </article>
    </React.Fragment>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
