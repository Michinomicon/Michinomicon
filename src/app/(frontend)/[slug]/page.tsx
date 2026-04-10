import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PageAnchorEmitter } from '@/components/PageAnchorEmitter'
import { PageAnchor } from '@/providers/PageAnchors'
import { Post } from '@/payload-types'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
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
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug: decodedSlug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout, id, title } = page

  const pageHeading = {
    id: slug || `page-${id}`,
    title: title,
  }

  const postContentBlock = layout.find((block) => block.blockType === 'postContent')
  const pageAnchors: PageAnchor[] = []
  pageAnchors.push(pageHeading)

  if (postContentBlock?.populateBy === 'selection' && postContentBlock.selectedDocs) {
    const selectionPostHeadings = postContentBlock.selectedDocs
      .map((doc) => (typeof doc.value === 'object' ? doc.value : null))
      .filter((value) => value !== null)
      .map((post) => {
        return {
          title: post.title,
          id: post.slug || `post-${post.id}`,
        }
      })
    pageAnchors.push(...selectionPostHeadings)
  } else if (postContentBlock?.populateBy === 'collection' && postContentBlock?.categories) {
    const posts = await queryPostByCategories({
      categories: postContentBlock?.categories,
    })
    const collectionPostHeadings = posts.map((post) => {
      return {
        title: post.title,
        id: post.slug || `post-${post.id}`,
      }
    })
    pageAnchors.push(...collectionPostHeadings)
  }

  return (
    <React.Fragment>
      <PageAnchorEmitter anchors={pageAnchors} />

      <article className="article-page relative mx-auto px-6 pt-6 pb-12 border border-primary/30 bg-background">
        <PageClient />
        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <div className="article-toolbar w-full flex flex-nowrap justify-end">
          <ButtonGroup aria-label="Article Controls">
            <PageTableOfContentsTrigger size="icon" aria-label="Show Table of Contents" />
          </ButtonGroup>
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

const queryPostByCategories = cache(async ({ categories }: { categories: Post['categories'] }) => {
  const { isEnabled: draft } = await draftMode()

  const queryCategories = categories
    ? categories.filter((category) => typeof category === 'object').map((cat) => cat.id)
    : []

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    limit: 2000,
    draft,
    pagination: false,
    overrideAccess: draft,
    where: {
      'categories.isNav': {
        equals: true,
      },
      'categories.id': {
        in: queryCategories,
      },
    },
  })

  return result.docs || []
})
