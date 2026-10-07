import { CMSLinkProps } from '@/components/Link'
import { Category, Creator, Header, Page, Post, Project } from '@/payload-types'
import config from '@payload-config'
import { BasePayload, getPayload } from 'payload'
import { getCachedGlobal } from './getGlobals'

/**
 * (output) Menu Tree Item Types
 */

export type MenuTreeItemType = string & ('item' | 'group')
export type BaseMenuTreeItem = {
  id: string
  title: string
  type: MenuTreeItemType
  url?: string
  link?: CMSLinkProps
  children?: MenuTree
}
export interface MenuTreeItem extends BaseMenuTreeItem {
  id: string
  title: string
  type: 'item'
  url: string
  link: CMSLinkProps
  children?: never
}
export interface MenuTreeItemGroup extends BaseMenuTreeItem {
  id: string
  title: string
  type: 'group'
  url?: never
  link?: never
  children?: MenuTree
}

export type MenuTreeEntry = MenuTreeItemGroup | MenuTreeItem
export type MenuTree = MenuTreeEntry[]

type MenuConfigItem = {
  id?: string | null
  type?: 'group' | 'item' | null | undefined
  label?: string | null | undefined
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

function createMenuTreeItem(
  { posts, pages, creators, projects }: DocumentCollections,
  itemConfig: MenuConfigItem,
): MenuTreeItem | undefined {
  const { link: linkProps } = itemConfig

  if (!linkProps) {
    const errorMsg = `Error creating Menu Link Item. Missing CMSLinkProps`
    console.error(errorMsg, JSON.stringify(itemConfig))
    throw new Error(errorMsg, { cause: JSON.stringify(itemConfig) })
  }

  if (linkProps.type === 'custom') {
    return {
      id: itemConfig.id || linkProps.label || '',
      title: itemConfig.referenceLabel || linkProps.label || '',
      type: 'item',
      url: linkProps.url || '',
      link: linkProps,
    }
  }

  if (linkProps.type === 'reference' && linkProps.reference?.relationTo === 'pages') {
    const { value } = linkProps.reference
    const pageRef = typeof value === 'object' ? <Page>value : pages.find((doc) => doc.id === value)
    if (pageRef) {
      return {
        id: pageRef.id,
        title: pageRef.title,
        type: 'item',
        link: {
          ...itemConfig.link,
          reference: { relationTo: linkProps.reference.relationTo, value: pageRef },
          url: `/${pageRef.slug}`,
        },
        url: `/${pageRef.slug}`,
      }
    }
  }

  if (linkProps.type === 'reference' && linkProps.reference?.relationTo === 'posts') {
    const { relationTo, value } = linkProps.reference
    const postRef = typeof value === 'object' ? <Post>value : posts.find(({ id }) => id === value)
    if (postRef) {
      return {
        id: postRef.id,
        title: postRef.title,
        type: 'item',
        link: {
          ...itemConfig.link,
          reference: { relationTo: relationTo, value: postRef },
          url: `posts/${postRef.slug}`,
        },
        url: `posts/${postRef.slug}`,
      }
    }
  }

  if (linkProps.type === 'reference' && linkProps.reference?.relationTo === 'creators') {
    const { relationTo, value } = linkProps.reference
    const creatorRef =
      typeof value === 'object' ? <Creator>value : creators.find(({ id }) => id === value)
    if (creatorRef) {
      return {
        id: creatorRef.id,
        title: creatorRef.title,
        type: 'item',
        link: {
          ...itemConfig.link,
          reference: { relationTo: relationTo, value: creatorRef },
          url: `creators/${creatorRef.slug}`,
        },
        url: `creators/${creatorRef.slug}`,
      }
    }
  }

  if (linkProps.type === 'reference' && linkProps.reference?.relationTo === 'projects') {
    const { relationTo, value } = linkProps.reference
    const projectRef =
      typeof value === 'object' ? <Project>value : projects.find(({ id }) => id === value)
    if (projectRef) {
      return {
        id: projectRef.id,
        title: projectRef.title,
        type: 'item',
        link: {
          ...itemConfig.link,
          reference: { relationTo: relationTo, value: projectRef },
          url: `projects/${projectRef.slug}`,
        },
        url: `projects/${projectRef.slug}`,
      }
    }
  }
}

function createMenuTreeItemGroup(item: MenuConfigItem): MenuTreeItemGroup {
  return {
    id: `itemGroup-${item.label}`,
    title: `${item.label}`,
    url: undefined,
    type: 'group',
    children: [],
    link: undefined,
  }
}

export function buildMenuTree(
  documentCollections: DocumentCollections,
  items: MenuConfigItem[] | null | undefined,
): MenuTree {
  if (!items || !Array.isArray(items)) return []

  return items.reduce((acc: MenuTreeEntry[], item: MenuConfigItem) => {
    if (item.type === 'item') {
      const menuItem = createMenuTreeItem(documentCollections, item)
      if (menuItem) {
        acc.push(menuItem)
      }
    }

    if (item.type === 'group') {
      const menuItemGroup: MenuTreeItemGroup = createMenuTreeItemGroup(item)
      if (item.children) {
        // Recursively get group sub-items
        menuItemGroup.children = buildMenuTree(documentCollections, item.children)
      }
      acc.push(menuItemGroup)
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
    const documentCollections: DocumentCollections = await getDocumentCollections(payload)
    const menuTree: MenuTree = buildMenuTree(documentCollections, menuItems)

    // console.log(`Built Menu Tree:`, menuTree)
    return menuTree
  } catch (error) {
    payload.logger.error(`Failed to build Menu Tree from config: ${error}`)
    return []
  }
}
