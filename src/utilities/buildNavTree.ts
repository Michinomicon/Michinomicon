import { CMSLinkProps } from '@/components/Link'
import { Category, Creator, Header, Page, Post, PostContentBlock, Project } from '@/payload-types'
import config from '@payload-config'
import { BasePayload, getPayload } from 'payload'
import { getCachedGlobal } from './getGlobals'

/**
 * (output) Menu Tree Item Types
 */

export type BaseMenuTreeItem = {
  id: string
  title: string
  url: string
  type: string & ('category' | 'page' | 'post' | 'link')
  link: CMSLinkProps | { type: 'reference' }
  children?: MenuTree
}
export interface MenuTreeCategoryItem extends BaseMenuTreeItem {
  id: string
  title: string
  url: string
  type: 'category'
  children?: MenuTree
  link: { type: 'reference' }
}
export interface MenuTreePageItem extends BaseMenuTreeItem {
  id: string
  title: string
  siteMenuShowContentPanel: boolean
  url: string
  type: 'page'
  link: { type: 'reference' }
  children?: MenuTreePostItem[]
}
export interface MenuTreePostItem extends BaseMenuTreeItem {
  id: string
  title: string
  url: string
  type: 'post'
  link: { type: 'reference' }
  children?: never
}
export interface MenuTreeLinkItem extends BaseMenuTreeItem {
  id: string
  title: string
  type: 'link'
  url: string
  link: CMSLinkProps
  children?: never
}

export type MenuTreeItem =
  | MenuTreeCategoryItem
  | MenuTreePageItem
  | MenuTreePostItem
  | MenuTreeLinkItem
export type MenuTree = MenuTreeItem[]

type MenuConfigItem = {
  id?: string | null
  type?: 'pages' | 'categories' | 'link' | null | undefined
  pageReference?: string | Page | null | undefined
  categoryReference?: (string | null) | Category
  referenceLabel?: string | null
  link?: CMSLinkProps
  children?: MenuConfigItem[] | null
}

type DocumentCollections = {
  categories: Category[]
  pages: Page[]
  posts: Post[]
  creators: Creator[]
  projects: Project[]
}

function createMenuTreeLinkItemFromLink(
  { posts, pages, creators, projects }: DocumentCollections,
  linkConfig: MenuConfigItem,
): MenuTreeLinkItem | undefined {
  const { link } = linkConfig

  if (!link) {
    const errorMsg = `Error creating Menu Link Item. Missing CMSLinkProps`
    console.error(errorMsg, JSON.stringify(linkConfig))
    throw new Error(errorMsg, { cause: JSON.stringify(linkConfig) })
  }

  if (link.type === 'custom') {
    return {
      id: linkConfig.id || link.label || '',
      title: linkConfig.referenceLabel || link.label || '',
      type: 'link',
      url: link.url || '',
      link: link,
    }
  }

  if (link.type === 'reference' && link.reference?.relationTo === 'pages') {
    const { value } = link.reference
    const pageRef = typeof value === 'object' ? <Page>value : pages.find((doc) => doc.id === value)
    if (pageRef) {
      return {
        id: pageRef.id,
        title: pageRef.title,
        type: 'link',
        link: {
          ...linkConfig.link,
          reference: { relationTo: link.reference.relationTo, value: pageRef },
          url: `/${pageRef.slug}`,
        },
        url: `/${pageRef.slug}`,
      }
    }
  }

  if (link.type === 'reference' && link.reference?.relationTo === 'posts') {
    const { relationTo, value } = link.reference
    const postRef = typeof value === 'object' ? <Post>value : posts.find(({ id }) => id === value)
    if (postRef) {
      return {
        id: postRef.id,
        title: postRef.title,
        type: 'link',
        link: {
          ...linkConfig.link,
          reference: { relationTo: relationTo, value: postRef },
          url: `/${postRef.slug}`,
        },
        url: `/${postRef.slug}`,
      }
    }
  }

  if (link.type === 'reference' && link.reference?.relationTo === 'creators') {
    const { relationTo, value } = link.reference
    const creatorRef =
      typeof value === 'object' ? <Creator>value : creators.find(({ id }) => id === value)
    if (creatorRef) {
      return {
        id: creatorRef.id,
        title: creatorRef.title,
        type: 'link',
        link: {
          ...linkConfig.link,
          reference: { relationTo: relationTo, value: creatorRef },
          url: `/${creatorRef.slug}`,
        },
        url: `/${creatorRef.slug}`,
      }
    }
  }

  if (link.type === 'reference' && link.reference?.relationTo === 'projects') {
    const { relationTo, value } = link.reference
    const projectRef =
      typeof value === 'object' ? <Project>value : projects.find(({ id }) => id === value)
    if (projectRef) {
      return {
        id: projectRef.id,
        title: projectRef.title,
        type: 'link',
        link: {
          ...linkConfig.link,
          reference: { relationTo: relationTo, value: projectRef },
          url: `/${projectRef.slug}`,
        },
        url: `/${projectRef.slug}`,
      }
    }
  }
}

function getPostsForPostContentBlock(
  allPosts: Post[],
  contentBlock: PostContentBlock,
): Post[] | undefined {
  if (contentBlock.populateBy === 'collection' && contentBlock.categories) {
    const selectedContentCategories: string[] = contentBlock.categories.flatMap((category) =>
      typeof category === 'object' ? category.id : category,
    )
    return allPosts.filter(
      (post) =>
        post.categories &&
        post.categories.find((postCategory) => {
          const postCategoryId = typeof postCategory === 'object' ? postCategory.id : postCategory
          return selectedContentCategories.includes(postCategoryId)
        }),
    )
  }

  if (contentBlock.populateBy === 'selection' && contentBlock.selectedDocs) {
    const selectedDocIds = contentBlock.selectedDocs.map(({ value }) =>
      typeof value === 'object' ? value.id : value,
    )
    return allPosts.filter(
      (post) =>
        post.categories &&
        post.categories.find((postCategory) => {
          const postCategoryId = typeof postCategory === 'object' ? postCategory.id : postCategory
          return selectedDocIds.includes(postCategoryId)
        }),
    )
  }
}

function mapPostContentBlockContentToMenuTreePostItems(
  { posts }: DocumentCollections,
  page: Page,
): MenuTreePostItem[] {
  return page.layout
    ?.filter<PostContentBlock>((block) => block.blockType === 'postContent')
    .flatMap((contentBlock) => getPostsForPostContentBlock(posts, contentBlock))
    .filter((p) => !!p)
    .map((post: Post) => ({
      id: post.id,
      title: post.title,
      url: `${post.slug}`,
      type: 'post',
      link: { type: 'reference' },
    }))
}

function createMenuTreePageItemFromPage(
  collections: DocumentCollections,
  item: MenuConfigItem,
): MenuTreePageItem | undefined {
  if (!item.pageReference) {
    return
  }

  const { pages } = collections

  const pageRef: Page | undefined =
    typeof item.pageReference === 'object'
      ? item.pageReference
      : pages.find(({ id }) => id === item.pageReference)

  if (pageRef) {
    return {
      id: pageRef.id,
      title: pageRef.title,
      siteMenuShowContentPanel: pageRef.siteMenuShowContentPanel === true,
      url: `/${pageRef.slug}`,
      type: 'page',
      link: { type: 'reference' },
      children: mapPostContentBlockContentToMenuTreePostItems(collections, pageRef),
    }
  }
}

function createMenuTreeCategoryItemFromCategory(
  { categories }: DocumentCollections,
  item: MenuConfigItem,
): MenuTreeCategoryItem | undefined {
  if (!item.categoryReference) {
    return
  }

  const catRef: Category | undefined =
    typeof item.categoryReference === 'object'
      ? item.categoryReference
      : categories.find(({ id }) => id === item.categoryReference)

  if (catRef) {
    return {
      id: catRef.id,
      title: catRef.title,
      url: catRef.slug,
      type: 'category',
      children: [],
      link: { type: 'reference' },
    }
  }
}

export function buildMenuTree(
  documentCollections: DocumentCollections,
  items: MenuConfigItem[] | null | undefined,
): MenuTree {
  if (!items || !Array.isArray(items)) return []

  return items.reduce((acc: MenuTreeItem[], item: MenuConfigItem) => {
    if (item.type === 'link') {
      const linkItem = createMenuTreeLinkItemFromLink(documentCollections, item)
      if (linkItem) {
        acc.push(linkItem)
      }
    }

    if (item.type === 'categories') {
      const categoryItem: MenuTreeCategoryItem | undefined = createMenuTreeCategoryItemFromCategory(
        documentCollections,
        item,
      )
      if (categoryItem) {
        if (item.children) {
          // Recursively get Category sub-items
          categoryItem.children = buildMenuTree(documentCollections, item.children)
        }
        acc.push(categoryItem)
      }
    }

    if (item.type === 'pages') {
      const pageItem = createMenuTreePageItemFromPage(documentCollections, item)
      if (pageItem) {
        acc.push(pageItem)
      }
    }

    return acc
  }, [] as MenuTree)
}

async function getDocumentCollections(payload: BasePayload): Promise<DocumentCollections> {
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 2000,
    sort: 'title',
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

  const { docs: creators } = await payload.find({
    collection: 'creators',
    limit: 2000,
    sort: 'title',
  })

  const { docs: projects } = await payload.find({
    collection: 'projects',
    limit: 2000,
    sort: 'title',
  })

  return {
    categories,
    pages,
    posts,
    creators,
    projects,
  }
}

export async function getMainMenu(): Promise<MenuTree> {
  const payload = await getPayload({ config })

  try {
    const { menuItems }: Header = await getCachedGlobal('header')()

    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      console.warn(`Empty Main Menu config!`, { config: JSON.stringify(menuItems) })
    }

    // console.log(`Building Menu Tree from config:`, menuItems)

    const documentCollections: DocumentCollections = await getDocumentCollections(payload)
    const menuTree: MenuTree = buildMenuTree(documentCollections, menuItems)

    // console.log(`Built Menu Tree:`, menuTree)
    return menuTree
  } catch (error) {
    payload.logger.error(`Failed to build Menu Tree from config: ${error}`)
    return []
  }
}
