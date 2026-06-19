import { Category, Page, Post, PostContentBlock } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

type BaseContentTreeItem = {
  id: string
  title: string
  url: string
  type: 'category' | 'page' | 'post'
  sortPriority?: number
  children: ContentTreeItem[]
}
export interface ContentTreeCategoryItem extends BaseContentTreeItem {
  type: 'category'
  children: (ContentTreeCategoryItem | ContentTreePageItem)[]
}
export interface ContentTreePageItem extends BaseContentTreeItem {
  type: 'page'
  siteMenuShowContentPanel: boolean
  children: ContentTreePostItem[]
}
export interface ContentTreePostItem extends BaseContentTreeItem {
  type: 'post'
  children: []
}
export type ContentTreeItem =
  | ContentTreeCategoryItem
  | ContentTreePageItem
  | ContentTreePostItem
  | never

interface PayloadCollections {
  categories: Category[]
  pages: Page[]
  posts: Post[]
}

function getChildCategoriesByParentCategoryId(
  categories: Category[],
  parentId: string,
): Category[] {
  return categories.filter((cat: Category) => {
    const catParentId: string | null = cat.parent
      ? typeof cat.parent === 'object'
        ? cat.parent.id
        : cat.parent
      : null
    return catParentId === parentId
  })
}

function getPageDirectDescendantsByCategoryId(pages: Page[], categoryId: string | null): Page[] {
  return pages.filter((page: Page) => {
    const pageCatId =
      page.parentCategory && typeof page.parentCategory === 'object'
        ? page.parentCategory.id
        : page.parentCategory
    return pageCatId === categoryId
  })
}

function getPostsForPostContentBlock(
  allPosts: Post[],
  contentBlock: PostContentBlock,
): Post[] | undefined {
  if (contentBlock.populateBy === 'collection' && contentBlock.categories) {
    const selectedContentCategories: string[] = contentBlock.categories.flatMap((category) =>
      typeof category === 'object' ? category.id : category,
    )
    const postsInSelectedCategories: Post[] = allPosts.filter(
      (post) =>
        post.categories &&
        post.categories.find((postCategory) => {
          const postCategoryId = typeof postCategory === 'object' ? postCategory.id : postCategory
          return selectedContentCategories.includes(postCategoryId)
        }),
    )

    return postsInSelectedCategories
  } else if (contentBlock.populateBy === 'selection' && contentBlock.selectedDocs) {
    const selectedDocIds = contentBlock.selectedDocs.map(({ value }) =>
      typeof value === 'object' ? value.id : value,
    )
    const selectedPosts: Post[] = allPosts.filter(
      (post) =>
        post.categories &&
        post.categories.find((postCategory) => {
          const postCategoryId = typeof postCategory === 'object' ? postCategory.id : postCategory
          return selectedDocIds.includes(postCategoryId)
        }),
    )

    return selectedPosts
  }

  return
}

function createContentTreePostItemFromPost(post: Post): ContentTreePostItem {
  return {
    id: post.id,
    title: post.title,
    url: `posts/${post.slug}`,
    type: 'post',
    children: [],
  }
}

function createContentTreePageItemFromPage(page: Page): ContentTreePageItem {
  return {
    id: page.id,
    title: page.title,
    siteMenuShowContentPanel: page.siteMenuShowContentPanel === true,
    url: `${page.slug}`,
    type: 'page',
    children: [],
  }
}

function createContentTreeCategoryItemFromCategory(category: Category): ContentTreeCategoryItem {
  return {
    id: category.id,
    title: category.title,
    url: `${category.slug}`,
    type: 'category',
    children: [],
  }
}

function mapPostContentBlockContentToContentTreePostItems(
  allPosts: Post[],
  page: Page,
): ContentTreePostItem[] {
  return page.layout
    .filter((block) => block.blockType === 'postContent')
    .flatMap((contentBlock: PostContentBlock) =>
      getPostsForPostContentBlock(allPosts, contentBlock),
    )
    .filter((p: Post | undefined) => !!p)
    .map((post: Post) => createContentTreePostItemFromPost(post))
}

function populateCategoryItemChildren(
  categoryItem: ContentTreeCategoryItem,
  payloadCollections: PayloadCollections,
) {
  const { pages, posts } = payloadCollections

  // Find pages that belong directly to this category
  const childPages: Page[] = getPageDirectDescendantsByCategoryId(pages, categoryItem.id)

  const pageItems: ContentTreePageItem[] = childPages.map((page: Page) => {
    const postItemsOnPage: ContentTreePostItem[] = mapPostContentBlockContentToContentTreePostItems(
      posts,
      page,
    )
    const pageItem: ContentTreePageItem = createContentTreePageItemFromPage(page)
    pageItem.children = postItemsOnPage
    return pageItem
  })

  // Recursively collect sub-categories
  const subCategoryItems = buildTree(categoryItem.id, payloadCollections)

  // Combine sub-categories and pages
  const combinedChildren: (ContentTreeCategoryItem | ContentTreePageItem)[] = [
    ...subCategoryItems,
    ...pageItems,
  ]

  categoryItem.children = combinedChildren

  return categoryItem
}

function buildTree(
  parentCategoryId: string,
  payloadCollections: PayloadCollections,
): ContentTreeCategoryItem[] {
  const { categories } = payloadCollections

  // Find categories that belong to this parent
  const childCategories: Category[] = getChildCategoriesByParentCategoryId(
    categories,
    parentCategoryId,
  )

  const categoryTreeItems: ContentTreeCategoryItem[] = childCategories.map((cat: Category) => {
    const categoryItem: ContentTreeCategoryItem = createContentTreeCategoryItemFromCategory(cat)
    populateCategoryItemChildren(categoryItem, payloadCollections)
    return categoryItem
  })
  return categoryTreeItems
}

export async function getContentTree(): Promise<ContentTreeItem[]> {
  const payload = await getPayload({ config })

  // Fetch all categories and pages
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 1000,
    sort: 'sortPriority',
  })

  const { docs: pages } = await payload.find({
    collection: 'pages',
    limit: 2000,
    sort: 'sortPriority',
  })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 2000,
    sort: 'title',
  })

  const menuRootCategory: Category | undefined = categories.find((cat) => cat.slug === 'menuroot')
  if (!menuRootCategory) {
    console.error('Menu root category not found')
    return []
  }

  // Start building from the 'MenuRoot' category
  const tree = buildTree(menuRootCategory.id, { categories, pages, posts })
  return tree
}
