import { ContentBlock, Post, PostContentBlock } from '@/payload-types'
import configPromise from '@payload-config'
import { TOCItem } from '@/providers/PageTOC'
import { draftMode } from 'next/headers'
import { getPayload, RequiredDataFromCollectionSlug } from 'payload'
import { cache } from 'react'
import { toKebabCase } from './toKebabCase'

enum HeadingTagDepth {
  'h1' = 1,
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
}

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

function collectPostTOCItems(pageTOC: TOCItem[], pageSlug: string, post: Post) {
  const { title, content } = post

  console.debug(`collectPostTOCItems:`, post)

  const postId = toKebabCase(title)
  const postUrl = `${pageSlug}#${postId}`
  const postDepth = 2
  pageTOC.push({
    title: title,
    id: postId,
    depth: postDepth,
    url: postUrl,
  })

  const { children: postContent } = content.root

  for (const item of postContent) {
    const { type, tag } = item
    if (type === 'heading' && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(String(tag))) {
      const { children } = item
      const { text: headingText } = ((children as (typeof content.root)['children']).find(
        (i) => i.type === 'text',
      ) ?? { text: ' ' }) as { text: string }
      const headingId = toKebabCase(headingText)
      const headingUrl = `${pageSlug}#${headingText}`
      const tagDepth = HeadingTagDepth[tag as keyof typeof HeadingTagDepth]
      pageTOC.push({
        title: headingText,
        id: headingId,
        depth: postDepth + tagDepth,
        url: headingUrl,
      })
    }
  }
}

function createPageTOCTitleItem(pageTitle: string, pageSlug: string): TOCItem {
  const pageHeadingId = toKebabCase(pageTitle)
  return {
    id: pageHeadingId,
    title: pageTitle,
    depth: 1,
    url: `${pageSlug}#${pageHeadingId}`,
  }
}

function addContentBlockTOCItems(pageTOC: TOCItem[], pageSlug: string, contentBlock: ContentBlock) {
  const { columns, blockName, id } = contentBlock
  const blockDepth: number = 2
  const blockId = toKebabCase(blockName || id || '')

  if (!columns) return

  for (const column of columns) {
    if (!column.richText?.root.children) return
    const { children: richTextChildren } = column.richText?.root
    for (const item of richTextChildren) {
      const { type, tag, children } = item as unknown as {
        type: string
        tag: string
        children: Array<{ text: string; type: string }>
      }

      if (type === 'heading' && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(String(tag))) {
        const { text: headingText } = children.find((i) => i.type === 'text') ?? { text: '' }
        if (headingText && headingText.trim().length > 0) {
          const headingId = `${blockId}-${toKebabCase(headingText)}`
          const headingUrl = `${pageSlug}#${headingId}`
          const tagDepth = HeadingTagDepth[tag as keyof typeof HeadingTagDepth]
          pageTOC.push({
            title: headingText,
            id: headingId,
            depth: blockDepth + tagDepth,
            url: headingUrl,
          })
        }
      }
    }
  }
}

async function addPostContentBlockTocItems(
  pageTOC: TOCItem[],
  pageSlug: string,
  postContentBlock: PostContentBlock,
) {
  if (postContentBlock?.populateBy === 'selection' && postContentBlock.selectedDocs) {
    postContentBlock.selectedDocs
      .map((doc) => (typeof doc.value === 'object' ? doc.value : null))
      .filter((value) => value !== null)
      .map((post) => collectPostTOCItems(pageTOC, pageSlug, post))
  } else if (postContentBlock?.populateBy === 'collection' && postContentBlock?.categories) {
    const posts = await queryPostByCategories({
      categories: postContentBlock?.categories,
    })
    posts.map((post) => collectPostTOCItems(pageTOC, pageSlug, post))
  }
}

export default async function buildPageTOC(
  page: RequiredDataFromCollectionSlug<'pages'>,
): Promise<TOCItem[]> {
  const pageTOC: TOCItem[] = []
  const { title, layout, slug: pageSlug } = page
  console.debug(`Building TOC for Page "${title}": `, page)

  pageTOC.push(createPageTOCTitleItem(title, pageSlug))

  for (const block of layout) {
    switch (block.blockType) {
      case 'cta':
        break
      case 'content':
        addContentBlockTOCItems(pageTOC, pageSlug, block)
        break
      case 'mediaBlock':
        break
      case 'mediaGalleryBlock':
        break
      case 'archive':
        break
      case 'formBlock':
        break
      case 'postContent':
        await addPostContentBlockTocItems(pageTOC, pageSlug, block)
        break
    }
  }
  console.debug(`Completed "${title}" TOC: `, pageTOC)
  return pageTOC
}

// function ensureUniqueness(pageTOC: TOCItem[]): TOCItem[] {
//   const encounteredIds: Map<string, number> = new Map()
//   const uniqueTOC: TOCItem[] = []

//   for (const item of pageTOC) {
//     const { id, title, depth } = item
//     const baseId = id
//     let uniqueId = baseId

//     // If ID already exists, append a number
//     if (encounteredIds.has(uniqueId)) {
//       let count = encounteredIds.get(uniqueId)!
//       console.debug(`encountered ID "${uniqueId}" for the ${count} time`, item)

//       do {
//         count++
//         uniqueId = `${baseId}-${count}`
//       } while (encounteredIds.has(uniqueId))
//       encounteredIds.set(baseId, count)
//     } else {
//       console.debug(`encountered ID "${id}" for the FIRST time`, item)
//       // first time encountering ID
//       encounteredIds.set(id, 1)
//     }
//     uniqueTOC.push({
//       depth: depth,
//       id: uniqueId,
//       title: title,
//       url: `#${uniqueId}`,
//     })
//   }

//   return uniqueTOC
// }

// function setPageContentHeaderIds(
//     node?: Element | null,
//     pageTOC: TOCItem[],
//     encounteredIds: Map<string, number> = new Map(),
// ): TOCItem[] {
//     // Skip non-element nodes
//     if (!node || node.nodeType !== Node.ELEMENT_NODE) return pageTOC

//     // if is heading tag, collect it
//     const lowerCaseTagName = node.tagName.toLowerCase()
//     if (
//         ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(lowerCaseTagName) &&
//         node.textContent &&
//         node.textContent.trim().length > 0
//     ) {
//         let { id } = node;

//         // if tag has no ID, create and assign unique ID
//         if (!id || id.trim().length <= 0) {
//             const baseId = generateHeadingTagSlug(textContent) || 'heading'
//             let uniqueId = baseId
//             // If ID already exists, append a number
//             if (encounteredIds.has(uniqueId)) {
//             let count = encounteredIds.get(uniqueId)!
//             do {
//                 count++
//                 uniqueId = `${baseId}-${count}`
//             } while (encounteredIds.has(uniqueId))
//             encounteredIds.set(baseId, count)
//             }
//             id = uniqueId
//             node.setAttribute('id', id)
//             node.classList.add('scroll-mt-[120px]')
//         }
//         console.debug(`collected heading ID`, id)
//         // update encountered IDs
//         encounteredIds.set(id, 1)

//         headings.push({
//             depth: HeadingTagDepth[lowerCaseTagName as keyof typeof HeadingTagDepth],
//             id: id,
//             title: textContent,
//             url: `#${id}`,
//         })
//     }

//   const uniqueTOC: TOCItem[] = []

//   for (const item of pageTOC) {
//     const { id, title, depth } = item
//     const baseId = id
//     let uniqueId = baseId

//     // If ID already exists, append a number
//     if (encounteredIds.has(uniqueId)) {
//       let count = encounteredIds.get(uniqueId)!
//       console.debug(`encountered ID "${uniqueId}" for the ${count} time`, item)

//       do {
//         count++
//         uniqueId = `${baseId}-${count}`
//       } while (encounteredIds.has(uniqueId))
//       encounteredIds.set(baseId, count)
//     } else {
//       console.debug(`encountered ID "${id}" for the FIRST time`, item)
//       // first time encountering ID
//       encounteredIds.set(id, 1)
//     }
//     uniqueTOC.push({
//       depth: depth,
//       id: uniqueId,
//       title: title,
//       url: `#${uniqueId}`,
//     })
//   }

//   return uniqueTOC
// }
