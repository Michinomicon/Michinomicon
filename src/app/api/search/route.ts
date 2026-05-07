'use server'

import { type NextRequest } from 'next/server'
import { Category, Page, Post } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type GlobalSearchResults = {
  posts: Post[]
  categories: Category[]
  pages: Page[]
}

export async function globalSearch(query: string | null): Promise<GlobalSearchResults> {
  if (!query) return { posts: [], categories: [], pages: [] }

  const payload = await getPayload({ config: configPromise })

  // Run queries in parallel for performance
  const [postsRes, categoriesRes, pagesRes] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1, // Fetch related category names
      where: {
        or: [
          { title: { contains: query } },
          { 'content.text': { contains: query } }, // Adjust based on your rich text editor structure
        ],
      },
      limit: 10, // Limit results for the UI dropdown
    }),
    payload.find({
      collection: 'categories',
      where: {
        title: { contains: query },
      },
      limit: 3,
    }),
    payload.find({
      collection: 'pages',
      where: {
        title: { contains: query },
      },
      limit: 3,
    }),
  ])

  return {
    posts: postsRes.docs,
    categories: categoriesRes.docs,
    pages: pagesRes.docs,
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const results = await globalSearch(query)

  return Response.json({ results: results })
}
