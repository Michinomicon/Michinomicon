import { getPayload } from 'payload'
import config from '@payload-config'

// A clean interface for the frontend to consume
export interface WikiNavItem {
  title: string
  url?: string // Only pages have URLs
  items?: WikiNavItem[] // Categories have nested items (pages or sub-categories)
}

export async function getWikiNavigation(): Promise<WikiNavItem[]> {
  const payload = await getPayload({ config })

  // 1. Fetch categories and pages
  const { docs: categories } = await payload.find({
    collection: 'wiki-categories',
    limit: 1000,
    sort: 'order',
  })

  const { docs: pages } = await payload.find({
    collection: 'wiki-pages',
    limit: 2000,
    sort: 'title',
  })

  // 2. Recursive function to build the tree
  function buildTree(parentId: string | null = null): WikiNavItem[] {
    // Find categories that belong to this parent
    const childCategories = categories.filter((cat) => {
      const catParentId = cat.parent
        ? typeof cat.parent === 'object'
          ? cat.parent.id
          : cat.parent
        : null
      return catParentId === parentId
    })

    return childCategories.map((cat) => {
      // Find pages that belong directly to this category
      const categoryPages: WikiNavItem[] = pages
        .filter((page) => {
          const pageCatId = typeof page.category === 'object' ? page.category.id : page.category
          return pageCatId === cat.id
        })
        .map((page) => ({
          title: page.title,
          url: `/wiki/${page.slug}`, // Map to your Next.js route structure
        }))

      // Recursively get sub-categories
      const subCategories = buildTree(cat.id)

      return {
        title: cat.title,
        // Combine pages and sub-categories into the 'items' array
        items: [...subCategories, ...categoryPages],
      }
    })
  }

  // 3. Start building from the root (categories with no parent)
  return buildTree(null)
}
