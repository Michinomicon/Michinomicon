import { Post } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

type BaseNavTreeItem = {
  id: string
  title: string
  url: string
  type: 'category' | 'page' | 'post'
  children: NavTreeItem[]
}
export interface NavTreeCategoryItem extends BaseNavTreeItem {
  type: 'category'
}
export interface NavTreePageItem extends BaseNavTreeItem {
  type: 'page'
}
export interface NavTreePostItem extends BaseNavTreeItem {
  type: 'post'
}
export type NavTreeItem = NavTreeCategoryItem | NavTreePageItem | NavTreePostItem | never

export async function getNavTree(): Promise<NavTreeItem[]> {
  const payload = await getPayload({ config })

  // Fetch all categories and pages
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 1000,
    sort: 'order', // Respect the custom ordering
  })

  const { docs: pages } = await payload.find({
    collection: 'pages',
    limit: 2000,
    sort: 'title',
  })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 2000,
    sort: 'title',
  })

  function buildTree(parentId: string | null = null): NavTreeItem[] {
    // Find categories that belong to this parent
    const childCategories = categories.filter((cat) => {
      const catParentId = cat.parent
        ? typeof cat.parent === 'object'
          ? cat.parent.id
          : cat.parent
        : null
      return cat.isNav && catParentId === parentId
    })

    return childCategories.map((cat) => {
      // Find pages that belong directly to this category
      const categoryPages: NavTreeItem[] = pages
        .filter((page) => {
          const pageCatId =
            page.parentCategory && typeof page.parentCategory === 'object'
              ? page.parentCategory.id
              : page.parentCategory
          return pageCatId === cat.id
        })
        .map((page) => {
          const pageSlug = page.slug
          const pagePosts: NavTreeItem[] = page.layout
            .filter((block) => block.blockType === 'postContent')
            .flatMap((contentBlock) => {
              if (contentBlock.populateBy === 'collection' && contentBlock.categories) {
                const selectedContentCategories: string[] = contentBlock.categories.flatMap(
                  (category) => (typeof category === 'object' ? category.id : category),
                )
                const postsInSelectedCategories: Post[] = posts.filter(
                  (post) =>
                    post.categories &&
                    post.categories.find((postCategory) => {
                      const postCategoryId =
                        typeof postCategory === 'object' ? postCategory.id : postCategory
                      return selectedContentCategories.includes(postCategoryId)
                    }),
                )

                return postsInSelectedCategories
              } else if (contentBlock.populateBy === 'selection' && contentBlock.selectedDocs) {
                const selectedDocIds = contentBlock.selectedDocs.map(({ value }) =>
                  typeof value === 'object' ? value.id : value,
                )
                const selectedPosts: Post[] = posts.filter(
                  (post) =>
                    post.categories &&
                    post.categories.find((postCategory) => {
                      const postCategoryId =
                        typeof postCategory === 'object' ? postCategory.id : postCategory
                      return selectedDocIds.includes(postCategoryId)
                    }),
                )

                return selectedPosts
              } else {
                return
              }
            })
            .filter((p) => !!p)
            .map((post) => ({
              id: post.id,
              title: post.title,
              url: `${post.slug}`,
              type: 'post',
              children: [],
            }))

          return {
            id: page.id,
            title: page.title,
            url: `${pageSlug}`,
            type: 'page',
            children: pagePosts,
          }
        })

      // Recursively sub-categories
      const subCategories: NavTreeItem[] = buildTree(cat.id)

      const categoryHasPageWithSameSlug = categoryPages.find((p) => p.url === cat.slug)

      if (categoryHasPageWithSameSlug && subCategories.length < 0) {
      }
      return {
        id: cat.id,
        title: cat.title,
        url: `${cat.slug}`,
        type: 'category',
        // Combine pages and sub-categories
        children: [...subCategories, ...categoryPages],
      }
    })
  }

  // Start building from the root (categories with no parent)
  const tree = buildTree(null)
  return tree
}
